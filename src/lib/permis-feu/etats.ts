import type { StatutPermisFeu } from "@prisma/client";

/**
 * Le vocabulaire d'état d'un permis de feu, en un seul endroit.
 *
 * Il en existait deux : la liste disait « Validé » et « Terminé », la fiche
 * « Prêt à démarrer » et « Travaux terminés ». On repérait un permis dans la
 * grille, on cliquait, et la fiche annonçait autre chose — sans qu'on sache
 * si c'était le même état ou une étape franchie entre-temps.
 *
 * Un `Record` sur l'enum Prisma, et non une cascade : ajouter un statut sans
 * le nommer ici ne compile pas. Les deux tables précédentes avaient chacune
 * un `else` fourre-tout qui affichait « Brouillon » pour un permis annulé.
 */
export const ETAT_PERMIS: Record<
  StatutPermisFeu,
  { ton: "fait" | "retard" | "bleu" | "proche" | "neutre"; mot: string }
> = {
  brouillon: { ton: "neutre", mot: "Brouillon" },
  attente_signatures: { ton: "proche", mot: "En attente de signatures" },
  valide: { ton: "bleu", mot: "Prêt à démarrer" },
  en_cours: { ton: "retard", mot: "Travaux en cours" },
  termine: { ton: "fait", mot: "Travaux terminés" },
  // Ni vert, ni rose : une opération annulée n'a plus de rendez-vous. Elle
  // n'est pas « faite », et rien n'y est en retard.
  annule: { ton: "neutre", mot: "Annulé" },
};
