// Marqueur de famille d'une échéance — le second axe du langage du
// calendrier : la couleur dit l'urgence, l'icône dit la famille. Les
// formes géométriques (rond / carré / losange) ne se distinguaient pas
// à 8 px ; les icônes, si — et elles s'expliquent d'elles-mêmes :
//   presse-papiers  contrôles (vérifications périodiques d'équipements)
//   clé à molette   corrections (actions correctives, signalements)
//   document        documents (DUERP, attestations prestataires)
//   personnes       personnel (réservé aux modules à venir)
// La couleur vient de `currentColor` : l'appelant pose la taille et la
// couleur de texte, le marqueur ne décide que du pictogramme.

import { ClipboardCheck, FileText, Users, Wrench } from "lucide-react";
import type { FamilleEcheance } from "@/lib/calendrier/echeances";

export const LABEL_FAMILLE: Record<FamilleEcheance, string> = {
  controle: "Vérifications",
  travaux: "Corrections",
  papiers: "Documents",
  personnel: "Personnel",
};

/** Libellés longs, pour le panneau de filtres — explicites sans contexte. */
export const LABEL_FAMILLE_LONG: Record<FamilleEcheance, string> = {
  // Le même mot que l'entrée du panneau « À faire » : filtrer par cette
  // famille et cliquer cette entrée mènent au même écran (ADR-015).
  controle: "Vérifications périodiques",
  travaux: "Corrections & réparations",
  papiers: "Documents à renouveler",
  personnel: "Personnel",
};

/** Le mot posé en tête de méta d'une ligne (« Contrôle · … »). */
export const LABEL_FAMILLE_SINGULIER: Record<FamilleEcheance, string> = {
  controle: "Vérification",
  travaux: "Correction",
  papiers: "Document",
  personnel: "Personnel",
};

const ICONE: Record<FamilleEcheance, typeof ClipboardCheck> = {
  controle: ClipboardCheck,
  travaux: Wrench,
  papiers: FileText,
  personnel: Users,
};

export function MarqueurFamille({
  famille = "controle",
  className = "",
}: {
  famille?: FamilleEcheance;
  className?: string;
}) {
  const Icone = ICONE[famille];
  return <Icone aria-hidden className={"flex-none " + className} />;
}
