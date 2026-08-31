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
  autre: "permanente",
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
