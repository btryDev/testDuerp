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

import {
  ClipboardCheck,
  Droplets,
  FileCheck2,
  FileText,
  Flame,
  Hammer,
  HandshakeIcon,
  ListChecks,
  Ticket,
  Users,
} from "lucide-react";
import type { FamilleEcheance, TypeEcheance } from "@/lib/calendrier/echeances";

export const LABEL_FAMILLE: Record<FamilleEcheance, string> = {
  controle: "Vérifications",
  travaux: "Corrections",
  papiers: "Documents",
  personnel: "Personnel",
};

/** Libellés longs, pour le panneau de filtres — explicites sans contexte. */
export const LABEL_FAMILLE_LONG: Record<FamilleEcheance, string> = {
  controle: "Vérifications périodiques",
  travaux: "Corrections & réparations",
  papiers: "Documents à renouveler",
  personnel: "Personnel",
};

const ICONE: Record<FamilleEcheance, typeof ClipboardCheck> = {
  controle: ClipboardCheck,
  // Marteau et non clé à molette : `Wrench` désigne « Équipements » dans le
  // rail, et la même icône ne peut pas nommer un objet ici et une action là.
  travaux: Hammer,
  papiers: FileText,
  personnel: Users,
};

// ---------------------------------------------------------------------------
// Le niveau fin : le type (ADR-016).
//
// La famille regroupe pour filtrer, le type nomme. « Corrections » ne dit
// pas si le dirigeant a devant lui une mesure qu'il a inscrite à son DUERP
// ou un signalement de son cuisinier ; le type le dit.

/** Le mot posé devant une ligne. Lexique de l'ADR-015 : « Vérification »
 *  et non « Contrôle », « Intervention » et non « Ticket ». */
export const LABEL_TYPE: Record<TypeEcheance, string> = {
  verification: "Vérification",
  "action-duerp": "Action DUERP",
  "action-verification": "Action",
  "action-libre": "Action",
  intervention: "Intervention",
  "permis-feu": "Permis de feu",
  "plan-prevention": "Plan de prévention",
  "duerp-maj": "DUERP",
  attestation: "Attestation",
  legionelles: "Analyse légionelles",
};

/**
 * Chaque type porte l'icône de **son module dans le rail** : une ligne
 * d'échéance montre le pictogramme de l'écran d'où elle sort, et le
 * dirigeant relie les deux sans apprendre un second alphabet.
 */
const ICONE_TYPE: Record<TypeEcheance, typeof ClipboardCheck> = {
  verification: ClipboardCheck,
  "action-duerp": FileCheck2,
  "action-verification": ListChecks,
  "action-libre": ListChecks,
  intervention: Ticket,
  "permis-feu": Flame,
  "plan-prevention": HandshakeIcon,
  "duerp-maj": FileCheck2,
  attestation: Users,
  legionelles: Droplets,
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

/**
 * Marqueur de nature au niveau fin, **avec son mot**.
 *
 * Le mot n'est pas décoratif : une signalétique qui tient à une icône
 * disparaît en niveaux de gris, à l'impression et pour qui n'y voit pas.
 * `motVisible={false}` le réserve aux lecteurs d'écran quand la surface
 * l'affiche déjà à côté (une méta qui commence par « Vérification · … »).
 */
export function MarqueurEcheance({
  type = "verification",
  motVisible = true,
  className = "",
}: {
  type?: TypeEcheance;
  motVisible?: boolean;
  className?: string;
}) {
  const Icone = ICONE_TYPE[type];
  const mot = LABEL_TYPE[type];
  return (
    <span className={"inline-flex items-center gap-1.5 " + className}>
      <Icone aria-hidden className="size-[13px] flex-none" />
      <span className={motVisible ? "" : "sr-only"}>{mot}</span>
    </span>
  );
}
