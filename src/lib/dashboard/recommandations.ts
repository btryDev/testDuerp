/**
 * Moteur de recommandations pour le tableau de bord (étape 9).
 *
 * Renvoie jusqu'à 5 actions à faire, triées par urgence réelle. Fonction
 * pure, pas d'accès DB, pas d'horloge implicite (horloge injectable).
 *
 * Règles de priorité :
 *   1. Vérifications en retard — la plus ancienne échéance d'abord
 *   2. Actions correctives en retard
 *   3. Vérifications planifiées dans les 7 jours
 *   4. Actions à venir sous 15 jours
 *   5. DUERP : première version à valider, ou mise à jour annuelle
 *   6. Amorçage : aucun équipement déclaré → « Déclarez vos équipements »
 *   7. Amorçage : équipements présents mais DUERP sans secteur choisi
 *      → « Ouvrez votre DUERP »
 *   8. Amorçage : vérifications planifiées mais aucun rapport déposé
 *      → « Déposez votre premier rapport »
 *
 * Les amorçages (6-8) sont des invitations neutres, jamais des alertes :
 * ils ne passent jamais devant une urgence réelle (priorités 1-5) et ne
 * s'affichent que sur un dossier en cours de mise en place.
 *
 * **Ce module ne définit plus ce qu'est un retard** : il applique les
 * prédicats canoniques de `@/lib/dates/retard` (ADR-011). Il en avait
 * inventé deux, tous les deux faux :
 *
 *  - une vérification `planifiee` dont la date était passée n'entrait dans
 *    aucune règle (la règle 1 ne regardait que `depassee` et `a_planifier`,
 *    la règle 3 excluait tout ce qui datait d'avant aujourd'hui). Or le
 *    statut `depassee` n'est écrit qu'à la génération du calendrier et
 *    n'est jamais réévalué : « planifiée puis oubliée » est l'état *normal*
 *    d'une vérification en retard. Le bandeau annonçait « deux échéances à
 *    traiter » et la file de travail ne proposait rien ;
 *  - une occurrence `a_planifier` datée du jour même était étiquetée
 *    « échéance dépassée » (comparaison `<= now`), alors que le reste du
 *    produit dit l'inverse : l'utilisateur a toute sa journée.
 *
 * Toutes les catégories contribuent à la liste ; le tri par priorité +
 * date (tie-breaker) fait remonter les items les plus urgents. Le total
 * est tronqué à 5 (paramétrable).
 */

import {
  estActionEnRetard,
  estActionOuverte,
  estDansLesProchainsJours,
  estVerificationAVenir,
  estVerificationEnRetard,
} from "@/lib/dates/retard";
import { ageEnMois, type EtatDuerp } from "./duerp";

/** Fenêtre « ça arrive » pour une vérification déjà planifiée. Plus courte
 *  que l'horizon proche du produit (30 j) : la file de travail du board dit
 *  ce qu'il faut faire *cette semaine*. */
export const JOURS_VERIF_PROCHE = 7;
/** Même idée pour une action corrective, qui demande souvent un devis. */
export const JOURS_ACTION_PROCHE = 15;

export type Recommandation = {
  kind:
    | "verif_depassee"
    | "action_en_retard"
    | "verif_proche"
    | "action_proche"
    | "duerp_a_jour"
    | "amorce_equipements"
    | "amorce_duerp"
    | "amorce_rapport";
  titre: string;
  sousTitre?: string;
  href: string;
  /** Priorité numérique pour le tri (plus bas = plus urgent). */
  priorite: number;
  /** Date pertinente (datePrevue, echeance, ou lastMaj) pour l'affichage. */
  date?: Date;
};

export type EntreeRecos = {
  verifications: Array<{
    id: string;
    statut: "a_planifier" | "planifiee" | "depassee" | string;
    datePrevue: Date;
    /** Présente dès qu'un rapport a été déposé. Absente = non réalisée :
     *  les prédicats partagés en ont besoin pour ne jamais compter en
     *  retard une occurrence déjà couverte par une preuve. */
    dateRealisee?: Date | null;
    libelleObligation: string;
    equipementLibelle: string;
  }>;
  actions: Array<{
    id: string;
    statut: "ouverte" | "en_cours" | "levee" | "abandonnee" | string;
    echeance: Date | null;
    libelle: string;
  }>;
  /** État d'ancienneté du DUERP (cf. `./duerp`). Absent = pas de DUERP. */
  duerp?: EtatDuerp;
  etablissementId: string;
  /** DUERPs actifs : pour le lien "mettre à jour". */
  duerpId?: string;
  /** Nombre d'équipements déclarés (amorçage règle 6). */
  nbEquipements: number;
  /**
   * Le DUERP a un secteur choisi (`referentielSecteurId` non nul). Fait
   * observable fiable : l'existence d'un Duerp ne suffit pas, les pages
   * relais historiques en créaient silencieusement (amorçage règle 7).
   */
  duerpSecteurChoisi: boolean;
  /** Nombre de rapports de vérification déposés (amorçage règle 8). */
  nbRapports: number;
};

export type OptionsRecommandations = {
  /** Horloge injectable pour tests. */
  now?: Date;
  /** Limite totale d'items retournés (défaut 5). */
  limite?: number;
};

export function genererRecommandations(
  e: EntreeRecos,
  options: OptionsRecommandations = {},
): Recommandation[] {
  const now = options.now ?? new Date();
  const limite = options.limite ?? 5;

  const etab = e.etablissementId;
  const acc: Recommandation[] = [];

  // Les prédicats partagés raisonnent sur une occurrence complète : les
  // entrées qui ne portent pas `dateRealisee` sont, par construction de
  // l'appelant, des occurrences ouvertes.
  const verifs = e.verifications.map((v) => ({
    ...v,
    dateRealisee: v.dateRealisee ?? null,
  }));

  // 1. Vérifications en retard — quel que soit le statut porté en base
  //    (`depassee` n'est écrit qu'à la génération, il ne peut pas servir de
  //    seule preuve du retard).
  for (const v of verifs) {
    if (!estVerificationEnRetard(v, now)) continue;
    // Une occurrence restée `a_planifier` n'a jamais eu de rendez-vous : sa
    // `datePrevue` est la date de génération du calendrier. La transmettre
    // faisait afficher « dépassée depuis 107 j », où 107 mesurait l'âge du
    // dossier et non un retard réglementaire. Le fait est qu'aucune
    // vérification n'est enregistrée — on le dit, sans compter des jours
    // qui ne veulent rien dire.
    const jamaisPlanifiee = v.statut === "a_planifier";
    acc.push({
      kind: "verif_depassee",
      titre: v.libelleObligation,
      sousTitre: jamaisPlanifiee
        ? `${v.equipementLibelle} — aucune vérification enregistrée`
        : `${v.equipementLibelle} — échéance dépassée`,
      href: `/etablissements/${etab}/verifications/${v.id}`,
      priorite: 1,
      date: jamaisPlanifiee ? undefined : v.datePrevue,
    });
  }

  // 2. Actions en retard
  for (const a of e.actions) {
    if (!estActionEnRetard(a, now)) continue;
    acc.push({
      kind: "action_en_retard",
      titre: a.libelle,
      sousTitre: "Action corrective en retard",
      href: `/etablissements/${etab}/actions/${a.id}`,
      priorite: 2,
      date: a.echeance ?? undefined,
    });
  }

  // 3. Vérifications planifiées dans les 7 jours (aujourd'hui compris).
  for (const v of verifs) {
    if (!estVerificationAVenir(v, now, JOURS_VERIF_PROCHE)) continue;
    acc.push({
      kind: "verif_proche",
      titre: v.libelleObligation,
      sousTitre: `${v.equipementLibelle} — dans les ${JOURS_VERIF_PROCHE} jours`,
      href: `/etablissements/${etab}/verifications/${v.id}`,
      priorite: 3,
      date: v.datePrevue,
    });
  }

  // 4. Actions à venir sous 15 jours. Disjoint de la règle 2 : une échéance
  //    passée est un retard, jamais un « à venir ».
  for (const a of e.actions) {
    if (!estActionOuverte(a)) continue;
    if (a.echeance === null) continue;
    if (!estDansLesProchainsJours(a.echeance, now, JOURS_ACTION_PROCHE)) continue;
    acc.push({
      kind: "action_proche",
      titre: a.libelle,
      sousTitre: `Action à réaliser sous ${JOURS_ACTION_PROCHE} jours`,
      href: `/etablissements/${etab}/actions/${a.id}`,
      priorite: 4,
      date: a.echeance,
    });
  }

  // 5. DUERP — deux situations distinctes, deux libellés distincts. Dire
  //    « à mettre à jour » d'un document dont aucune version n'a jamais été
  //    validée décrit une réalité qui n'existe pas.
  const duerp = e.duerp;
  if (duerp?.ouvert && e.duerpId) {
    const href = `/duerp/${e.duerpId}`;
    if (duerp.jamaisValide) {
      acc.push({
        kind: "duerp_a_jour",
        titre: "Validez la première version de votre DUERP",
        sousTitre: "Aucune version n'a encore été figée",
        href,
        priorite: 5,
      });
    } else if (duerp.majEchue) {
      acc.push({
        kind: "duerp_a_jour",
        titre: "DUERP à mettre à jour",
        sousTitre: `Dernière version il y a ${ageEnMois(duerp.ageJours ?? 0)} mois`,
        href,
        priorite: 5,
        date: duerp.dateLimiteMaj ?? undefined,
      });
    } else if (duerp.rappelMajProche) {
      acc.push({
        kind: "duerp_a_jour",
        titre: "DUERP à mettre à jour",
        sousTitre: "Mise à jour annuelle à prévoir",
        href,
        priorite: 5,
        date: duerp.dateLimiteMaj ?? undefined,
      });
    }
  }

  // 6-8. Amorçage — invitations neutres pour un dossier en mise en place.
  if (e.nbEquipements === 0) {
    acc.push({
      kind: "amorce_equipements",
      titre: "Déclarez vos équipements",
      sousTitre:
        "Le point de départ : ils déterminent vos vérifications obligatoires",
      href: `/etablissements/${etab}/equipements`,
      priorite: 6,
    });
  }
  if (e.nbEquipements > 0 && !e.duerpSecteurChoisi) {
    acc.push({
      kind: "amorce_duerp",
      titre: "Ouvrez votre DUERP",
      sousTitre: "L'évaluation des risques, guidée unité par unité",
      href: `/etablissements/${etab}/duerp`,
      priorite: 7,
    });
  }
  if (e.verifications.length > 0 && e.nbRapports === 0) {
    acc.push({
      kind: "amorce_rapport",
      titre: "Déposez votre premier rapport",
      sousTitre: "Chaque rapport reçu rejoint votre registre de sécurité",
      href: `/etablissements/${etab}/calendrier`,
      priorite: 8,
    });
  }

  // Tri stable par priorité, puis par date
  acc.sort((a, b) => {
    if (a.priorite !== b.priorite) return a.priorite - b.priorite;
    const da = a.date?.getTime() ?? Infinity;
    const db = b.date?.getTime() ?? Infinity;
    return da - db;
  });

  return acc.slice(0, limite);
}
