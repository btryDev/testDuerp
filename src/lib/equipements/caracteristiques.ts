// Ce qu'un équipement déclare de lui-même, rendu lisible.
//
// `Equipement.caracteristiques` est un JSON : le nombre d'appareils, deux
// cases à cocher, un seuil de parking, six questions à trois états et une
// note libre. Ces valeurs ne sont pas décoratives — six d'entre elles
// **bornent des obligations** du référentiel : répondre « non » retire une
// échéance du calendrier, et « pas encore répondu » la laisse.
//
// La fiche doit donc les montrer, et montrer aussi les questions restées
// sans réponse : c'est le seul endroit où le dirigeant peut comprendre
// pourquoi telle vérification figure encore à son calendrier.
//
// Module **pur** : ni Prisma, ni React. Il ne lit que la table des
// questions du schéma, pour ne pas maintenir une seconde liste.

import { CATEGORIES_TRI_ETAT, type ChampTriEtat } from "./schema";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

/**
 * Libellés courts, pour une ligne de fiche. Le formulaire pose la
 * question en entier (« Cette VMC est-elle raccordée à des appareils à
 * gaz ? ») ; la fiche relit une réponse, elle nomme la propriété.
 */
export const LIBELLE_CARACTERISTIQUE: Record<ChampTriEtat, string> = {
  estVmcGaz: "VMC raccordée au gaz",
  aRobinetsIncendieArmes: "Robinets d'incendie armés (RIA)",
  aExtinctionAutomatique: "Extinction automatique en cuisine",
  sertAuLevageDePersonnes: "Sert au levage de personnes",
  estChariotOuGerbeur: "Chariot élévateur, gerbeur ou hayon",
  aAccessoiresDeLevage: "Accessoires de levage utilisés",
  estSoumisSuiviEnService: "Suivi en service (arrêté du 20 nov. 2017)",
  estHermetiquementScelleSousSeuil: "Hermétiquement scellé et sous seuil",
  estChargeSuperieure50TCo2: "Charge de fluide au-delà de 50 t éq. CO₂",
  estChargeSuperieure500TCo2: "Charge de fluide au-delà de 500 t éq. CO₂",
  aDetectionDeFuites: "Détection fixe des fuites",
};

export type CaracteristiqueLisible = {
  cle: string;
  libelle: string;
  valeur: string;
  /**
   * Vrai quand la question borne une obligation et n'a pas encore de
   * réponse : l'échéance reste au calendrier, et l'écran doit le dire
   * plutôt que d'afficher un blanc.
   */
  enAttente?: boolean;
};

/** Lecture défensive : le JSON vient de la base, pas d'un type. */
function bool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

/**
 * Les caractéristiques déclarées d'un appareil, dans l'ordre d'affichage :
 * les propriétés propres à sa catégorie d'abord, puis les questions qui
 * bornent ses obligations — répondues ou non.
 */
export function caracteristiquesLisibles(
  categorie: CategorieEquipement,
  brut: unknown,
): CaracteristiqueLisible[] {
  const c =
    brut !== null && typeof brut === "object" && !Array.isArray(brut)
      ? (brut as Record<string, unknown>)
      : {};
  const out: CaracteristiqueLisible[] = [];

  if (typeof c.nombre === "number" && c.nombre > 0) {
    out.push({
      cle: "nombre",
      libelle: "Nombre d'appareils",
      valeur: String(c.nombre),
    });
  }

  const groupe = bool(c.aGroupeElectrogene);
  if (categorie === "INSTALLATION_ELECTRIQUE" && groupe !== undefined) {
    out.push({
      cle: "aGroupeElectrogene",
      libelle: "Groupe électrogène de sécurité",
      valeur: groupe ? "Oui" : "Non",
    });
  }

  const pollution = bool(c.estLocalPollutionSpecifique);
  if (pollution !== undefined) {
    out.push({
      cle: "estLocalPollutionSpecifique",
      libelle: "Local à pollution spécifique",
      valeur: pollution ? "Oui" : "Non",
    });
  }

  if (typeof c.nbVehiculesParkingCouvert === "number") {
    out.push({
      cle: "nbVehiculesParkingCouvert",
      libelle: "Parking couvert",
      valeur: `${c.nbVehiculesParkingCouvert} véhicules`,
    });
  }

  // Les questions à trois états, mais seulement celles qui concernent la
  // catégorie : afficher « Levage de personnes » sur un extincteur ferait
  // douter de tout le reste de la fiche.
  for (const { champ, categories } of CATEGORIES_TRI_ETAT) {
    if (!categories.includes(categorie)) continue;
    const v = bool(c[champ]);
    out.push({
      cle: champ,
      libelle: LIBELLE_CARACTERISTIQUE[champ],
      valeur:
        v === undefined ? "Pas encore répondu" : v ? "Oui" : "Non",
      enAttente: v === undefined,
    });
  }

  if (typeof c.notes === "string" && c.notes.trim().length > 0) {
    out.push({ cle: "notes", libelle: "Notes", valeur: c.notes.trim() });
  }

  return out;
}
