import type {
  Periodicite,
  Realisateur,
} from "@/lib/referentiels/types-communs";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

export const LABEL_PERIODICITE: Record<Periodicite, string> = {
  hebdomadaire: "hebdomadaire",
  bimensuelle: "tous les 15 jours",
  mensuelle: "mensuelle",
  six_semaines: "toutes les 6 semaines",
  trimestrielle: "trimestrielle",
  semestrielle: "semestrielle",
  annuelle: "annuelle",
  biennale: "tous les 2 ans",
  triennale: "tous les 3 ans",
  quadriennale: "tous les 4 ans",
  quinquennale: "tous les 5 ans",
  decennale: "tous les 10 ans",
  mise_en_service_uniquement: "à la mise en service",
  // `autre` ne dit qu'une chose, et l'ADR-026 l'écrit : **le texte n'écrit pas
  // de rythme**. Il ne dit pas que l'obligation est permanente. Écrire
  // « permanente » ici, c'était répondre à la place du droit — et la table s'en
  // chargeait pour les 42 obligations qui portent cette valeur, dont 13 ne sont
  // pas des états permanents : 7 événementielles, 3 ponctuelles et 3 échéances
  // récurrentes dont le rythme n'est renvoyé à aucun texte. Une obligation
  // événementielle redevient due au fait suivant ; rien de permanent là-dedans.
  //
  // Le mélange venait d'avant l'ADR-026, quand `periodicite: "autre"` tenait
  // lieu de nature faute de champ. `nature` existe depuis ; cette table était
  // restée en arrière, et elle est le seul endroit du produit qui parlait encore
  // l'ancienne langue. Le libellé dit désormais ce que le champ sait, et rien de
  // plus — ce que l'obligation EST se lit dans `LIBELLE_NATURE`.
  autre: "sans rythme écrit",
};

export const LABEL_REALISATEUR: Record<Realisateur, string> = {
  organisme_agree: "Organisme agréé",
  organisme_accredite: "Organisme accrédité",
  personne_qualifiee: "Personne qualifiée",
  personne_competente: "Personne compétente",
  exploitant: "Exploitant (interne)",
  fabricant: "Fabricant",
  bureau_controle: "Bureau de contrôle",
  medecin_travail: "Médecin du travail",
  professionnel_sante_travail: "Professionnel de santé au travail",
  equipe_pluridisciplinaire: "Équipe pluridisciplinaire (service de santé au travail)",
};

export const LABEL_DOMAINE: Record<DomaineObligation, string> = {
  electricite: "Électricité",
  incendie: "Incendie / sécurité",
  aeration: "Aération / ventilation",
  cuisson_hotte: "Cuisson et hotte",
  ascenseur: "Ascenseur",
  porte_portail: "Portes et portails",
  equipement_sous_pression: "Équipement sous pression",
  stockage_dangereux: "Stockage dangereux",
  levage: "Levage",
  froid: "Froid / fluides frigorigènes",
  formation_securite: "Formation à la sécurité",
  sante_travail: "Santé au travail",
  secours: "Premiers secours",
  organisation_prevention: "Organisation de la prévention",
  information_travailleurs: "Information des travailleurs",
  locaux_sociaux: "Locaux sociaux",
  co_activite: "Co-activité",
};

export const MOIS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

/**
 * Libellés de trois à quatre lettres pour les graduations de la règle
 * annuelle. Tronquer `MOIS_FR` à trois lettres ne suffit pas : juin et
 * juillet donnent tous deux « jui », et l'année devient illisible là où
 * elle doit se lire d'un coup d'œil.
 */
export const MOIS_FR_COURT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
] as const;

export function libelleMois(cle: string): string {
  // cle = "YYYY-MM"
  const [annee, mois] = cle.split("-");
  const idx = Number(mois) - 1;
  return `${MOIS_FR[idx] ?? mois} ${annee}`;
}

/** Libellé de la case « sans bâtiment » dans les filtres et les listes
 *  (ADR-019). Ici et non dans `echeances.ts`, qui importe Prisma : les
 *  composants client doivent pouvoir le lire. */
export const LABEL_TOUT_ETABLISSEMENT = "Tout l'établissement";

/**
 * Le nom du porteur d'une échéance, quel qu'il soit (ADR-022, ADR-023).
 *
 * Trois cas, un seul endroit. Écrit partout à la main, le repli
 * `?? LABEL_TOUT_ETABLISSEMENT` était juste tant qu'il n'y avait que deux
 * porteurs ; à l'arrivée du troisième, il fait dire « Tout l'établissement » à
 * la ligne d'une personne — c'est-à-dire qu'il attribue à tout le monde ce qui
 * n'incombe qu'à quelqu'un.
 *
 * L'ordre suit celui de `cleDeLigne` : équipement, puis salarié, puis
 * l'établissement à défaut.
 */
export function libellePorteur(v: {
  // REQUIS, et nullables. Pas `?`, délibérément : un appelant qui oublie
  // `salarie: true` dans son `select` doit avoir une erreur de compilation, pas
  // un repli silencieux sur « Tout l'établissement » — c'est-à-dire exactement
  // le défaut que cette fonction existe pour corriger. Le `?` initial l'avait
  // laissé passer sur sept écrans.
  equipement: { libelle: string } | null;
  salarie: { nom: string; prenom: string } | null;
}): string {
  if (v.equipement) return v.equipement.libelle;
  if (v.salarie) return `${v.salarie.prenom} ${v.salarie.nom}`.trim();
  return LABEL_TOUT_ETABLISSEMENT;
}

/**
 * Le porteur d'une ligne, **sans nommer la personne**.
 *
 * Pour les surfaces qui sortent du produit : le serveur MCP, qui alimente
 * l'assistant que l'utilisateur branche — un service d'inférence hors de notre
 * contrôle —, et les documents remis à un tiers.
 *
 * `libellePorteur` a été écrit pour corriger un vrai défaut : sept écrans
 * disaient « Tout l'établissement » sur la ligne d'une personne, attribuant à
 * tout le monde ce qui n'incombe qu'à quelqu'un. La correction était juste
 * **dans le produit**. Appliquée telle quelle aux surfaces sortantes, elle a
 * fait fuir le nom : `docs/rgpd.md` § 6 promettait qu'« aucune donnée de
 * salarié n'est envoyée à un service d'inférence, jamais », et c'était faux le
 * jour même où la phrase a été écrite.
 *
 * L'utilité est préservée : savoir qu'une attestation expire ne demande pas de
 * savoir de qui. Le dirigeant ouvre l'écran Équipe pour le nom.
 */
export const LABEL_PORTEUR_SALARIE_ANONYME = "Un salarié";

export function libellePorteurSansNom(v: {
  equipement: { libelle: string } | null;
  salarieId: string | null;
}): string {
  if (v.equipement) return v.equipement.libelle;
  if (v.salarieId !== null) return LABEL_PORTEUR_SALARIE_ANONYME;
  return LABEL_TOUT_ETABLISSEMENT;
}

/**
 * Ce que la pastille d'année annonce, en un mot : combien d'échéances, et de
 * quelle nature.
 *
 * Extrait de `AnneeCalendrier` pour être éprouvable. La règle vivait en JSX,
 * inline, et **elle mentait** : elle ne lisait que `total`, le compte des
 * échéances DATÉES, et ignorait les occurrences « à planifier ».
 *
 * Ces dernières sont hors des barres par construction — leur `datePrevue` est
 * une date de génération, pas un rendez-vous, et les poser sur un mois
 * donnerait à lire un engagement qui n'existe pas. Cette exclusion-là est
 * juste, et elle n'est pas remise en cause ici. Ce qui ne l'était pas, c'est
 * d'écrire « aucune échéance » quand le seul état peuplé est celui qu'on
 * exclut.
 *
 * Sur un dossier neuf, l'écran affichait « 2026 · AUCUNE ÉCHÉANCE » au-dessus
 * d'un chip « 2 à planifier » et d'une carte de mois qui les listait. Avec un
 * titre daté en plus : « 1 ÉCHÉANCE » au-dessus de trois lignes.
 *
 * ⚠ **L'écart s'aggrave tout seul.** Tant que « à planifier » reste hors du
 * total, chaque obligation d'état permanent ajoutée au référentiel creuse la
 * distance entre ce que l'en-tête annonce et ce que la liste montre. Ce n'est
 * pas un défaut qui se stabilise — raison pour laquelle il est corrigé dans le
 * libellé plutôt que laissé à un arbitrage ultérieur.
 */
export function libelleTotalAnnee(total: number, sansDate: number): string {
  const s = (n: number) => (n > 1 ? "s" : "");
  if (total === 0) {
    return sansDate > 0
      ? `aucune datée · ${sansDate} à planifier`
      : "aucune échéance";
  }
  return sansDate > 0
    ? `${total} datée${s(total)} · ${sansDate} à planifier`
    : `${total} échéance${s(total)}`;
}

/**
 * Le libellé de la couture des mois passés.
 *
 * Extrait de `AnneeCalendrier` pour la même raison que `libelleTotalAnnee` :
 * une phrase qui vit dans du JSX n'est appelable par aucun test, donc
 * n'est balayable par aucune propriété. Ce n'est pas qu'on oublie de
 * l'éprouver, c'est qu'on ne le peut pas.
 *
 * Le défaut qui l'a fait sortir : « Voir les 1 mois précédents », affiché sur
 * tous les dossiers le 1er septembre. Il n'a été introduit par aucun commit —
 * au 31 août, aucun mois n'était passé dans l'année et la branche ne se rendait
 * jamais. **Il est apparu par le seul passage du temps**, et aucune revue de
 * diff ne pouvait le voir : il n'y avait pas de diff.
 */
export function libelleMoisPrecedents(nbCartesPassees: number): string {
  return nbCartesPassees === 1
    ? "Voir le mois précédent"
    : `Voir les ${nbCartesPassees} mois précédents`;
}
