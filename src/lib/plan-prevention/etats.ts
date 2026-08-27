import type { StatutPlanPrevention } from "@prisma/client";

/**
 * Le vocabulaire d'état d'un plan de prévention, en un seul endroit.
 *
 * Même raison que pour le permis de feu : la liste disait « Attente
 * signatures », « Clos », « Inspection faite » ; la fiche « En attente de
 * signatures », « Plan clos », « Inspection commune faite ». Trois écarts sur
 * six statuts, entre deux écrans qu'on enchaîne d'un clic.
 *
 * `inspection_faite` mérite son libellé long : l'inspection commune préalable
 * est l'étape que R. 4512-2 rend obligatoire avant toute intervention, et
 * « Inspection faite » ne dit pas laquelle.
 */
export const ETAT_PLAN: Record<
  StatutPlanPrevention,
  { ton: "fait" | "bleu" | "proche" | "neutre"; mot: string }
> = {
  brouillon: { ton: "neutre", mot: "Brouillon" },
  inspection_faite: { ton: "bleu", mot: "Inspection commune faite" },
  attente_signatures: { ton: "proche", mot: "En attente de signatures" },
  valide: { ton: "bleu", mot: "Validé" },
  clos: { ton: "fait", mot: "Plan clos" },
  annule: { ton: "neutre", mot: "Annulé" },
};
