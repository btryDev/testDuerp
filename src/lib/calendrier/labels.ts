import type {
  Periodicite,
  Realisateur,
} from "@/lib/referentiels/types-communs";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

export const LABEL_PERIODICITE: Record<Periodicite, string> = {
  hebdomadaire: "hebdomadaire",
  mensuelle: "mensuelle",
  trimestrielle: "trimestrielle",
  semestrielle: "semestrielle",
  annuelle: "annuelle",
  biennale: "tous les 2 ans",
  triennale: "tous les 3 ans",
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
