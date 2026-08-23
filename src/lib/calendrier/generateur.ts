/**
 * Générateur du calendrier de vérifications (étape 6).
 *
 * Fonction pure qui, à partir de la liste d'obligations applicables
 * (sortie du moteur de matching) et des vérifications déjà réalisées
 * pour cet établissement, produit la **prochaine occurrence** de
 * vérification pour chaque couple (obligation, équipement déclencheur).
 *
 * Règles (cf. spec/PLAN.md étape 6) :
 *   1. Une occurrence par couple (obligationId, equipementId).
 *   2. Si la périodicité est `mise_en_service_uniquement` :
 *        - dernière vérif connue → pas de nouvelle occurrence (one-shot)
 *        - mise en service à venir → `planifiee` à cette date
 *        - sinon → `a_planifier`, datée de la mise en service si on la
 *          connaît, de `now` à défaut. Jamais urgente : il n'y a pas
 *          d'échéance à dépasser, il manque une pièce au dossier.
 *   3. Si la périodicité est `autre` → aucune occurrence (obligation permanente
 *      sans échéance périodique, ex. tenue du registre de sécurité).
 *   4. Si pas de dernière vérif connue mais une **mise en service** qui place
 *      la première échéance dans le futur → datePrevue = `miseEnService +
 *      periodicite`, statut = `planifiee`. C'est le cas de l'équipement neuf :
 *      un extincteur installé le 15 mars se vérifie le 15 mars suivant, et
 *      l'outil n'a pas à demander une date qu'il sait déduire.
 *   4 bis. Si la mise en service place cette échéance dans le passé, on ne
 *      conclut rien : l'équipement n'est plus dans son premier cycle et des
 *      vérifications ont pu avoir lieu sans être saisies. Annoncer un retard
 *      de sept ans serait inventer. → statut = `a_planifier`.
 *   4 ter. Si rien n'est connu → datePrevue = `now`, statut = `a_planifier`.
 *   5. Si dernière vérif connue → datePrevue = `dateRealisee + periodicite`,
 *      statut = `planifiee` si datePrevue ≥ now, `depassee` sinon.
 *
 * Le statut Prisma `a_planifier` couvre deux réalités UI :
 *   - "à planifier d'urgence" (aucune vérif connue)   → priorité haute
 *   - "à planifier normalement"
 * La distinction est faite par le champ `estUrgent` du résultat, pas par
 * un enum en base — pour ne pas polluer l'enum Prisma avec de l'UI.
 */

import {
  PERIODICITE_EN_JOURS,
  type Periodicite,
  type Realisateur,
} from "@/lib/referentiels/types-communs";
import { estEnRetard } from "@/lib/dates/retard";
import type { ObligationApplicable } from "@/lib/matching";

export type StatutVerificationGen =
  | "a_planifier"
  | "planifiee"
  | "depassee";

export type VerificationGenere = {
  /** Clé stable (obligationId::equipementId) pour l'upsert en base. */
  cleUnique: string;
  obligationId: string;
  libelleObligation: string;
  equipementId: string;
  periodicite: Periodicite;
  realisateurRequis: Realisateur[];
  datePrevue: Date;
  statut: StatutVerificationGen;
  /**
   * true si aucune vérification passée n'est connue — déclenche un signal
   * UI "à planifier d'urgence" sans créer d'enum supplémentaire en base.
   */
  estUrgent: boolean;
  /** Criticité issue de l'obligation (1-5). Sert au tri par priorité. */
  criticiteObligation: 1 | 2 | 3 | 4 | 5;
  /** Raisons textuelles du matching — copiées du résultat du moteur. */
  raisons: string[];
};

export type VerificationsPrecedentes = Map<string, Date>;

export type OptionsGenerateur = {
  /** Horloge injectable pour les tests. Défaut = `new Date()`. */
  now?: Date;
  /**
   * Date de mise en service, par identifiant d'équipement. Sert de point de
   * départ **à défaut** de vérification connue — un équipement neuf n'a pas
   * d'historique, mais sa première échéance est calculable.
   */
  misesEnService?: Map<string, Date>;
};

function ajouterJours(d: Date, jours: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + jours);
  return out;
}

function prochaineDate(
  derniere: Date,
  periodicite: Periodicite,
): Date | null {
  const jours = PERIODICITE_EN_JOURS[periodicite];
  if (jours === null) return null;
  return ajouterJours(derniere, jours);
}

/**
 * Génère la prochaine occurrence de vérification pour chaque couple
 * (obligation applicable × équipement déclencheur).
 */
export function genererProchainesVerifications(
  obligations: ObligationApplicable[],
  verificationsPrecedentes: VerificationsPrecedentes = new Map(),
  options: OptionsGenerateur = {},
): VerificationGenere[] {
  const now = options.now ?? new Date();
  const out: VerificationGenere[] = [];

  for (const oa of obligations) {
    const o = oa.obligation;

    // Périodicité `autre` → pas d'échéance (obligations permanentes).
    if (o.periodicite === "autre") continue;

    for (const eq of oa.equipementsConcernes) {
      const cleUnique = `${o.id}::${eq.id}`;
      const derniere = verificationsPrecedentes.get(cleUnique);

      // One-shot : mise en service uniquement.
      //
      // L'occurrence est datée de la mise en service quand on la connaît, et
      // non de « maintenant ». Datée de maintenant, elle se redatait à chaque
      // régénération : une chambre froide installée en 2015 héritait, dix ans
      // plus tard, d'une échéance urgente réputée due aujourd'hui, et elle le
      // resterait à perpétuité — la date suivait l'horloge au lieu de suivre
      // l'événement.
      //
      // Et elle n'est jamais urgente. L'urgence, dans ce module, se déduit
      // d'une date dépassée (`estDepassee`) ; ici il n'y a pas d'échéance à
      // dépasser — l'événement qui la déclenche a eu lieu, ou n'a pas eu
      // lieu. Ce qui manque au dossier est une pièce, pas un rendez-vous, et
      // c'est ce que dit « à planifier ». La marquer urgente faisait remonter
      // en tête du calendrier, sur un parc repris, autant de lignes que
      // d'appareils anciens — sans qu'aucune ne soit due à cette date.
      if (o.periodicite === "mise_en_service_uniquement") {
        if (derniere) continue; // déjà réalisé, pas de nouvelle occurrence
        const miseEnService = options.misesEnService?.get(eq.id) ?? null;
        const aVenir =
          miseEnService !== null && miseEnService.getTime() >= now.getTime();
        out.push({
          cleUnique,
          obligationId: o.id,
          libelleObligation: o.libelle,
          equipementId: eq.id,
          periodicite: o.periodicite,
          realisateurRequis: o.realisateurs,
          datePrevue: miseEnService ?? now,
          statut: aVenir ? "planifiee" : "a_planifier",
          estUrgent: false,
          criticiteObligation: o.criticite,
          raisons: oa.raisons,
        });
        continue;
      }

      if (derniere) {
        const prochaine = prochaineDate(derniere, o.periodicite);
        if (!prochaine) continue;
        const estDepassee = prochaine.getTime() < now.getTime();
        out.push({
          cleUnique,
          obligationId: o.id,
          libelleObligation: o.libelle,
          equipementId: eq.id,
          periodicite: o.periodicite,
          realisateurRequis: o.realisateurs,
          datePrevue: prochaine,
          statut: estDepassee ? "depassee" : "planifiee",
          estUrgent: estDepassee,
          criticiteObligation: o.criticite,
          raisons: oa.raisons,
        });
      } else {
        // Pas d'historique. La mise en service peut tenir lieu de départ,
        // mais seulement tant qu'elle place la première échéance devant
        // nous : au-delà, l'équipement a vécu sans que le dossier le sache,
        // et un retard calculé sur ce silence serait une invention.
        const miseEnService = options.misesEnService?.get(eq.id);
        const premiere = miseEnService
          ? prochaineDate(miseEnService, o.periodicite)
          : null;
        const premiereEncoreAVenir =
          premiere !== null && premiere.getTime() >= now.getTime();

        out.push({
          cleUnique,
          obligationId: o.id,
          libelleObligation: o.libelle,
          equipementId: eq.id,
          periodicite: o.periodicite,
          realisateurRequis: o.realisateurs,
          datePrevue: premiereEncoreAVenir ? premiere : now,
          statut: premiereEncoreAVenir ? "planifiee" : "a_planifier",
          estUrgent: !premiereEncoreAVenir,
          criticiteObligation: o.criticite,
          raisons: oa.raisons,
        });
      }
    }
  }

  return out;
}

/**
 * Comparateur pour le tri du calendrier : les vérifications urgentes
 * (dépassées ou à planifier) d'abord, puis par date prévue croissante,
 * puis par criticité décroissante en cas d'égalité.
 */
export function comparerParUrgence(
  a: VerificationGenere,
  b: VerificationGenere,
): number {
  // 1. Urgence (urgent avant non-urgent)
  if (a.estUrgent !== b.estUrgent) return a.estUrgent ? -1 : 1;
  // 2. Date prévue croissante
  const da = a.datePrevue.getTime();
  const db = b.datePrevue.getTime();
  if (da !== db) return da - db;
  // 3. Criticité décroissante
  return b.criticiteObligation - a.criticiteObligation;
}

// ===========================================================================
// Réconciliation idempotente du calendrier — ADR-012
//
// POURQUOI CE MODULE EXISTE
// -------------------------
// La régénération procédait par `deleteMany` (toutes les occurrences non
// réalisées) puis `createMany`. Trois conséquences, toutes silencieuses :
//
//  1. `Action.verificationId` est en `onDelete: Cascade`. Une action
//     corrective créée sur une vérification dépassée (« faire intervenir un
//     organisme agréé », avec responsable et échéance) disparaissait dès que
//     l'utilisateur déclarait un nouvel équipement — la déclaration régénère.
//  2. Un rapport déposé avec le résultat « non vérifiable » plaçait la
//     vérification en `a_planifier` : la régénération qui suivait dans la
//     même requête supprimait la vérification, donc le rapport en cascade,
//     et laissait le fichier orphelin dans le stockage.
//  3. Les identifiants changeaient à chaque passage : tout lien externe
//     (URL de la fiche vérification, `leveeRapportId`) pointait dans le vide.
//
// Depuis la migration `20260810120000_integrite_et_conservation`, la base
// porte `@@unique([etablissementId, obligationId, equipementId])`. Une
// `Verification` n'est donc plus « une occurrence » mais **la ligne de suivi**
// d'une obligation sur un équipement — un objet durable, dont l'identifiant
// est stable pour toute la vie de l'équipement.
//
// SÉMANTIQUE DE LA LIGNE DE SUIVI
// -------------------------------
//   `datePrevue`   : prochaine échéance réglementaire ;
//   `dateRealisee` : réalisation **du cycle en cours**, `null` tant que le
//                    cycle n'est pas soldé ;
//   `statut`       : état du cycle en cours ;
//   `rapports`     : l'historique complet, cycle après cycle — c'est lui qui
//                    porte la preuve, jamais le statut.
//
// Quand la période s'écoule (`dateRealisee + périodicité` est atteinte), le
// cycle est **relancé** : `dateRealisee` repasse à `null` et le statut à
// `depassee`. Rien n'est perdu — les rapports du cycle précédent restent
// attachés à la même ligne. C'est ce qui permet à l'outil de ne pas continuer
// d'afficher « Conforme » sur un contrôle annuel réalisé il y a deux ans.
// ===========================================================================

/** Statuts que peut porter une ligne en base (miroir de l'enum Prisma
 *  `StatutVerification`). Typé en union locale et non importé de
 *  `@prisma/client` pour que ce module reste pur et testable sans base. */
export type StatutVerificationPersiste =
  | StatutVerificationGen
  | "realisee_conforme"
  | "realisee_observations"
  | "realisee_ecart_majeur";

const STATUTS_REALISES: readonly StatutVerificationPersiste[] = [
  "realisee_conforme",
  "realisee_observations",
  "realisee_ecart_majeur",
];

export function estStatutRealise(s: string): boolean {
  return (STATUTS_REALISES as readonly string[]).includes(s);
}

/**
 * Marqueur d'archivage. Une obligation peut cesser de s'appliquer (équipement
 * désactivé, régime de l'établissement modifié, obligation retirée du
 * référentiel). Si la ligne ne porte aucune preuve, on la supprime ; si elle
 * en porte une, la détruire reviendrait à effacer un rapport de vérification
 * ou une action corrective — on la **marque** au lieu de la supprimer.
 *
 * Le marqueur vit dans `libelleObligation`, qui est déjà un instantané texte
 * recopié du référentiel : il apparaît donc partout où la ligne apparaît
 * (calendrier, registre, exports PDF), sans colonne supplémentaire.
 *
 * Limite assumée et documentée en ADR-012 : l'enum Prisma `StatutVerification`
 * n'a pas de valeur `archivee`. Le statut d'une ligne archivée est donc **gelé**
 * dans son dernier état connu. L'ajout d'une valeur d'enum dédiée relève du
 * propriétaire de `prisma/schema.prisma`.
 */
export const MARQUEUR_NON_APPLICABLE = "Ne s'applique plus — ";

export function estMarqueeNonApplicable(libelle: string): boolean {
  return libelle.startsWith(MARQUEUR_NON_APPLICABLE);
}

export function marquerNonApplicable(libelle: string): string {
  return estMarqueeNonApplicable(libelle)
    ? libelle
    : `${MARQUEUR_NON_APPLICABLE}${libelle}`;
}

/** Retire le marqueur — utilisé quand une obligation redevient applicable
 *  (l'équipement est réactivé, l'établissement redevient ERP…). */
export function libelleSansMarqueur(libelle: string): string {
  return estMarqueeNonApplicable(libelle)
    ? libelle.slice(MARQUEUR_NON_APPLICABLE.length)
    : libelle;
}

/** Ligne de suivi telle qu'elle existe en base, réduite à ce dont la
 *  réconciliation a besoin. */
export type OccurrenceExistante = {
  id: string;
  obligationId: string;
  equipementId: string;
  libelleObligation: string;
  periodicite: Periodicite;
  realisateurRequis: Realisateur[];
  datePrevue: Date;
  dateRealisee: Date | null;
  statut: StatutVerificationPersiste;
  /** La ligne porte-t-elle au moins un rapport de vérification ou une action
   *  corrective ? C'est le seul critère qui autorise — ou interdit — la
   *  suppression physique. */
  porteUnePreuve: boolean;
};

/** Ce qu'il faut écrire sur une ligne existante. `id` n'y figure jamais en
 *  cible d'écriture : il est stable par construction. */
export type MiseAJourOccurrence = {
  id: string;
  libelleObligation: string;
  periodicite: Periodicite;
  realisateurRequis: Realisateur[];
  datePrevue: Date;
  dateRealisee: Date | null;
  statut: StatutVerificationPersiste;
};

export type PlanReconciliation = {
  /** Couples (obligation, équipement) sans ligne de suivi : à insérer. */
  aCreer: VerificationGenere[];
  /** Lignes existantes dont au moins un champ change. */
  aMettreAJour: MiseAJourOccurrence[];
  /** Lignes devenues non applicables mais porteuses de preuve : marquées,
   *  jamais supprimées. */
  aArchiver: { id: string; libelleObligation: string }[];
  /** Lignes devenues non applicables et vides de toute preuve : supprimables
   *  sans perte. */
  aSupprimer: string[];
  /** Lignes strictement inchangées — le compteur qui prouve l'idempotence. */
  inchangees: number;
};

/**
 * Statut à porter sur une ligne dont le cycle courant n'est **pas** soldé.
 *
 * Le retard se juge au jour civil (ADR-011) et non à l'horodatage : une
 * échéance datée d'aujourd'hui n'est pas dépassée. `planifiee` n'est conservé
 * que s'il était déjà là — il signifie « une date a été arrêtée avec le
 * prestataire », information que la régénération n'a aucune raison d'effacer.
 */
function statutCycleOuvert(
  datePrevue: Date,
  statutExistant: StatutVerificationPersiste,
  now: Date,
): StatutVerificationGen {
  if (estEnRetard(datePrevue, now)) return "depassee";
  return statutExistant === "planifiee" ? "planifiee" : "a_planifier";
}

function memeListe(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function memeInstant(a: Date | null, b: Date | null): boolean {
  if (a === null || b === null) return a === b;
  return a.getTime() === b.getTime();
}

/**
 * Rapproche l'état souhaité (sortie du matching + du générateur) de l'état
 * en base, et produit le **plan minimal** d'écritures.
 *
 * Fonction pure : aucune I/O, horloge injectable. C'est elle qui porte toutes
 * les décisions de conservation ; `lib/calendrier/actions.ts` ne fait
 * qu'exécuter le plan dans une transaction.
 *
 * `aGenerer` doit être produit **sans** historique (`verificationsPrecedentes`
 * vide) : le générateur y décrit simplement l'ensemble des couples applicables
 * et leurs attributs de référentiel. Le calcul des dates à partir de
 * l'historique est fait ici, ligne par ligne, à partir de ce qu'il y a
 * réellement en base. Passer l'historique au générateur ferait disparaître de
 * `aGenerer` les obligations « mise en service » déjà réalisées, qui seraient
 * alors prises pour des obligations retirées du référentiel — et archivées à
 * tort.
 */
export function reconcilierCalendrier(
  existantes: OccurrenceExistante[],
  aGenerer: VerificationGenere[],
  options: OptionsGenerateur = {},
): PlanReconciliation {
  const now = options.now ?? new Date();

  const parCle = new Map<string, OccurrenceExistante>();
  for (const ex of existantes) {
    parCle.set(`${ex.obligationId}::${ex.equipementId}`, ex);
  }

  const plan: PlanReconciliation = {
    aCreer: [],
    aMettreAJour: [],
    aArchiver: [],
    aSupprimer: [],
    inchangees: 0,
  };
  const vues = new Set<string>();

  for (const g of aGenerer) {
    const ex = parCle.get(g.cleUnique);
    if (!ex) {
      plan.aCreer.push(g);
      continue;
    }
    vues.add(g.cleUnique);

    // Attributs de référentiel : toujours réalignés. C'est ce qui fait
    // qu'une correction de libellé ou de périodicité dans
    // `lib/referentiels/conformite/` se propage sans détruire la ligne.
    // Le marqueur d'archivage tombe de lui-même puisqu'on réécrit le libellé
    // depuis le référentiel : une obligation qui redevient applicable
    // redevient normale.
    let datePrevue: Date;
    let dateRealisee: Date | null;
    let statut: StatutVerificationPersiste;

    if (ex.dateRealisee !== null) {
      const prochaine = prochaineDate(ex.dateRealisee, g.periodicite);
      if (prochaine === null) {
        // Périodicité sans échéance suivante (`mise_en_service_uniquement`,
        // `autre`) : le one-shot est consommé, plus rien à replanifier.
        datePrevue = ex.datePrevue;
        dateRealisee = ex.dateRealisee;
        statut = ex.statut;
      } else if (!estEnRetard(prochaine, now)) {
        // Cycle encore valide : on affiche la prochaine échéance sans toucher
        // au résultat du contrôle déjà réalisé.
        datePrevue = prochaine;
        dateRealisee = ex.dateRealisee;
        statut = estStatutRealise(ex.statut) ? ex.statut : "planifiee";
      } else {
        // Période écoulée : nouveau cycle. Les rapports du cycle précédent
        // restent attachés à cette même ligne — c'est eux, la preuve.
        datePrevue = prochaine;
        dateRealisee = null;
        statut = "depassee";
      }
    } else if (ex.statut === "a_planifier" && g.statut === "planifiee") {
      // La ligne n'avait qu'un **placeholder** — « à planifier » n'est pas
      // un rendez-vous, c'est son absence — et le générateur sait désormais
      // en calculer un depuis la mise en service. Poser cette date n'efface
      // aucun retard : il n'y en avait pas à effacer.
      datePrevue = g.datePrevue;
      dateRealisee = null;
      statut = "planifiee";
    } else {
      // Cycle ouvert : l'échéance réglementaire ne bouge pas parce que
      // l'utilisateur a déclaré un extincteur de plus. Repousser `datePrevue`
      // à `now` à chaque régénération — ce que faisait le delete/create —
      // effaçait le retard accumulé.
      datePrevue = ex.datePrevue;
      dateRealisee = null;
      statut = statutCycleOuvert(ex.datePrevue, ex.statut, now);
    }

    const cible: MiseAJourOccurrence = {
      id: ex.id,
      libelleObligation: g.libelleObligation,
      periodicite: g.periodicite,
      realisateurRequis: g.realisateurRequis,
      datePrevue,
      dateRealisee,
      statut,
    };

    const identique =
      cible.libelleObligation === ex.libelleObligation &&
      cible.periodicite === ex.periodicite &&
      memeListe(cible.realisateurRequis, ex.realisateurRequis) &&
      memeInstant(cible.datePrevue, ex.datePrevue) &&
      memeInstant(cible.dateRealisee, ex.dateRealisee) &&
      cible.statut === ex.statut;

    if (identique) plan.inchangees += 1;
    else plan.aMettreAJour.push(cible);
  }

  // Ce qui reste : des lignes de suivi dont l'obligation ne s'applique plus.
  for (const [cle, ex] of parCle) {
    if (vues.has(cle)) continue;
    // `dateRealisee` compte comme une trace au même titre qu'un rapport : elle
    // atteste qu'un contrôle a eu lieu, même si la pièce jointe a depuis été
    // retirée du registre.
    const porteUneTrace = ex.porteUnePreuve || ex.dateRealisee !== null;
    if (!porteUneTrace) {
      plan.aSupprimer.push(ex.id);
    } else if (!estMarqueeNonApplicable(ex.libelleObligation)) {
      plan.aArchiver.push({
        id: ex.id,
        libelleObligation: marquerNonApplicable(ex.libelleObligation),
      });
    } else {
      plan.inchangees += 1;
    }
  }

  return plan;
}
