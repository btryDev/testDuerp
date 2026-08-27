import type { Prestataire } from "@prisma/client";
import {
  JOURS_ALERTE_EXPIRATION,
  ajouterMois,
  joursCivilsEntre,
} from "@/lib/dates";
import { estEnRetard } from "@/lib/dates/retard";

/**
 * Calcul de l'état de vigilance d'un prestataire au regard des obligations
 * du donneur d'ordre (art. L. 8222-1 et D. 8222-5 CT).
 *
 * Jalons réglementaires :
 * - Attestation URSSAF : le donneur d'ordre doit s'en faire remettre une
 *   **tous les six mois** jusqu'à la fin de l'exécution du contrat, pour
 *   tout contrat ≥ 5 000 € HT (art. D. 8222-5 1°). C'est la seule
 *   périodicité que le texte fixe, et la seule que ce module applique.
 * - RC Pro : pas de périodicité légale — la police est contractuelle et
 *   porte sa propre date de fin. Seule cette date est utilisée.
 * - Extrait Kbis : le texte n'assortit pas la pièce d'une périodicité
 *   citable. On expose donc son **âge**, sans en tirer de statut : le
 *   produit informe, il ne décrète pas une non-conformité qu'aucune source
 *   ne fonde (règle n°6 et n°8 du projet).
 *
 * Deux règles de dates, conformes à l'ADR-011 :
 *  1. Les dates de validité sont des **dates civiles** (saisies en
 *     « AAAA-MM-JJ », stockées à minuit UTC). Elles se comparent au jour
 *     civil de Paris, jamais à `Date.now()` brut — sans quoi une
 *     attestation valable « jusqu'au 10/08 » passait « Expirée il y a 1 j »
 *     dès 02:00 le 10 août, et « Expire aujourd'hui » ne s'affichait
 *     jamais le bon jour mais le lendemain.
 *  2. L'horloge est injectée. Le paramètre `now` garde une valeur par
 *     défaut parce que les appelants actuels (annuaire, matrice du
 *     tableau de bord) n'en passent pas encore ; c'est un point de bord à
 *     reprendre, pas une autorisation de lire l'horloge plus bas.
 */

/** Fenêtre d'alerte avant expiration — l'horizon partagé du produit. */
export const SEUIL_ALERTE_JOURS = JOURS_ALERTE_EXPIRATION;

/** Périodicité de remise de l'attestation de vigilance (art. D. 8222-5 1°). */
export const MOIS_RENOUVELLEMENT_URSSAF = 6;

export type StatutPiece =
  | "a_jour"
  | "expire_bientot"
  | "expiree"
  | "manquante";

export type VigilanceSnapshot = {
  /** Pièces expirées — le seul cas qui justifie le rose. */
  piecesExpirees: number;
  /** Pièces qui expirent dans moins de 30 jours. */
  piecesProches: number;
  /**
   * Pièces jamais fournies. **Ce n'est pas un retard** : rien n'a d'échéance
   * tant qu'il n'y a pas de document. Elles portent l'ardoise, comme
   * « à planifier » au calendrier.
   */
  piecesManquantes: number;
  /**
   * L'état à peindre : le plus grave réellement présent, `null` si tout est à
   * jour. **Les écrans lisent celui-ci**, jamais `alertesOuvertes` — qui
   * compte un volume et ne dit rien de la gravité.
   */
  etatLePlusGrave: "enRetard" | "proche" | "aPlanifier" | null;
  urssaf: StatutPiece;
  /** Jours civils restants — négatif si la pièce n'est plus opposable. */
  urssafExpireDans: number | null;
  /**
   * Date à laquelle l'attestation cesse d'être opposable : la plus proche
   * entre la validité saisie et la limite du rythme semestriel.
   */
  urssafOpposableJusquA: Date | null;
  /**
   * `true` quand c'est le rythme semestriel — et non la date saisie — qui
   * détermine le statut. L'interface peut alors expliquer pourquoi une
   * attestation « valable jusqu'en 2030 » demande quand même une nouvelle
   * demande.
   */
  urssafPlafonneeParLeSemestre: boolean;
  rcPro: StatutPiece;
  rcProExpireDans: number | null;
  kbis: "present" | "absent";
  /** Date d'émission déclarée de l'extrait, si elle est renseignée. */
  kbisEmisLe: Date | null;
  /** Âge de l'extrait en jours civils — informatif, sans seuil. */
  kbisAgeJours: number | null;
  /** Pièces à durée de validité qui ne sont pas à jour (Kbis exclu). */
  alertesOuvertes: number;
};

/**
 * Statut d'une pièce à partir de sa date de fin de validité.
 *
 * Le décompte est en **jours civils** : « 0 » veut dire « expire
 * aujourd'hui » toute la journée, et le passage à « expirée » se fait au
 * minuit suivant, comme partout ailleurs dans le produit. La division en
 * millisecondes qui servait ici décalait toute l'échelle d'un jour dès que
 * l'heure de Paris était en avance sur UTC, c'est-à-dire toute l'année.
 */
function statutParDate(
  date: Date | null,
  now: Date,
  seuilJours: number,
): { statut: StatutPiece; joursRestants: number | null } {
  if (!date) return { statut: "manquante", joursRestants: null };
  const jours = joursCivilsEntre(now, date);
  if (estEnRetard(date, now)) return { statut: "expiree", joursRestants: jours };
  if (jours <= seuilJours) {
    return { statut: "expire_bientot", joursRestants: jours };
  }
  return { statut: "a_jour", joursRestants: jours };
}

/**
 * Date de fin d'opposabilité de l'attestation URSSAF.
 *
 * L'article D. 8222-5 1° impose de se faire remettre une attestation
 * **tous les six mois**. Le produit ne stocke pas la date de remise, mais
 * il connaît `updatedAt` : la pièce en dossier n'a **pas pu** être déposée
 * après la dernière modification de la fiche. Passé six mois après cette
 * date, l'attestation détenue a donc nécessairement plus de six mois — la
 * déduction ne vaut que dans ce sens, et c'est le seul qu'on utilise : une
 * fiche modifiée récemment ne permet de conclure à rien, on s'en remet
 * alors à la date de validité saisie.
 *
 * On retient la plus proche des deux bornes. Sans ce plafond, une saisie
 * « valable jusqu'au 31/12/2030 » restait verte indéfiniment alors que
 * l'obligation de renouvellement, elle, courait toujours.
 */
function opposabiliteUrssaf(
  p: Prestataire,
): { date: Date | null; plafonnee: boolean } {
  const saisie = p.attestationUrssafValableJusquA;
  if (!saisie) return { date: null, plafonnee: false };
  const limiteSemestrielle = ajouterMois(
    p.updatedAt,
    MOIS_RENOUVELLEMENT_URSSAF,
  );
  const plafonnee = limiteSemestrielle.getTime() < saisie.getTime();
  return { date: plafonnee ? limiteSemestrielle : saisie, plafonnee };
}

export function computeVigilance(
  prestataire: Prestataire,
  now: Date = new Date(),
): VigilanceSnapshot {
  const opposabilite = opposabiliteUrssaf(prestataire);
  const u = statutParDate(opposabilite.date, now, SEUIL_ALERTE_JOURS);
  const r = statutParDate(
    prestataire.assuranceRcProValableJusquA,
    now,
    SEUIL_ALERTE_JOURS,
  );
  const kbis: "present" | "absent" = prestataire.kbisCle ? "present" : "absent";

  // Trois comptes, pas un. `alertesOuvertes` fondait « expirée », « expire
  // bientôt » et « jamais fournie » dans le même chiffre, que les écrans
  // peignaient ensuite en rose — si bien qu'une carte pouvait afficher une
  // tête « en retard » au-dessus d'une pastille « Non fournie » en ardoise,
  // se contredisant elle-même. Rien n'a d'échéance tant qu'il n'y a pas de
  // document : une pièce absente n'est pas en retard (charte, interdits 3 et 4).
  const pieces = [u.statut, r.statut];
  const piecesExpirees = pieces.filter((s) => s === "expiree").length;
  const piecesProches = pieces.filter((s) => s === "expire_bientot").length;
  const piecesManquantes = pieces.filter((s) => s === "manquante").length;

  /** Tout ce qui n'est pas à jour, pour un compteur de volume. Ne sert JAMAIS
   *  à choisir une couleur : c'est `etatLePlusGrave` qui le fait. */
  const alertesOuvertes = piecesExpirees + piecesProches + piecesManquantes;

  /**
   * L'état à peindre : le plus grave réellement présent, ou `null` si tout
   * est à jour. C'est lui que les cartes et les compteurs doivent lire.
   */
  const etatLePlusGrave: "enRetard" | "proche" | "aPlanifier" | null =
    piecesExpirees > 0
      ? "enRetard"
      : piecesProches > 0
        ? "proche"
        : piecesManquantes > 0
          ? "aPlanifier"
          : null;

  return {
    piecesExpirees,
    piecesProches,
    piecesManquantes,
    etatLePlusGrave,
    urssaf: u.statut,
    urssafExpireDans: u.joursRestants,
    urssafOpposableJusquA: opposabilite.date,
    urssafPlafonneeParLeSemestre: opposabilite.plafonnee,
    rcPro: r.statut,
    rcProExpireDans: r.joursRestants,
    kbis,
    kbisEmisLe: prestataire.kbisDateEmission,
    kbisAgeJours: prestataire.kbisDateEmission
      ? Math.max(0, joursCivilsEntre(prestataire.kbisDateEmission, now))
      : null,
    alertesOuvertes,
  };
}

export function messageExpiration(jours: number | null): string {
  if (jours === null) return "Non renseignée";
  if (jours < 0) return `Expirée il y a ${Math.abs(jours)} j`;
  if (jours === 0) return "Expire aujourd'hui";
  if (jours === 1) return "Expire demain";
  if (jours <= SEUIL_ALERTE_JOURS) return `Expire dans ${jours} j`;
  return `Valide ${jours} j de plus`;
}
