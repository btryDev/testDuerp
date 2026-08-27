// Ce que la page « Comprendre » montre « par métier ».
//
// Ce module servait la page publique ; il a suivi la section quand elle
// est passée dans l'application, là où elle sert vraiment : le dirigeant
// y voit pourquoi son voisin n'a pas la même liste que lui.
//
// Les libellés, les périodicités et les références légales ne sont pas
// retapés ici : ils sont lus dans le référentiel de conformité (ADR-003).
// Une périodicité corrigée dans le référentiel se corrige donc aussi
// dans le guide, sans que personne n'ait à y penser. Seuls le nom court
// (celui que le dirigeant emploie) et l'ordre d'affichage sont
// éditoriaux.
//
// Les trois métiers listés sont ceux du périmètre DUERP validé —
// restauration, commerce de détail, bureau/tertiaire. Rien d'autre.

import { obligationParId } from "@/lib/referentiels/conformite";
import { LABEL_PERIODICITE } from "@/lib/calendrier/labels";

export type LigneMetier = {
  /** Nom court, celui qu'emploie le dirigeant. */
  nom: string;
  /** Libellé exact du référentiel — l'intitulé réglementaire. */
  libelle: string;
  /** Première référence primaire citée (Légifrance). */
  reference: string;
  /** Périodicité indicative, telle que portée par le référentiel. */
  rythme: string;
};

export type Metier = {
  id: string;
  label: string;
  /** Ce que le métier a de particulier, en une phrase. */
  note: string;
  lignes: LigneMetier[];
};

/** Le DUERP ne vient pas du référentiel de conformité : c'est un
 *  document, pas une vérification d'équipement. On le pose en tête,
 *  partout, avec sa référence. */
const DUERP: LigneMetier = {
  nom: "DUERP",
  libelle: "Évaluation des risques professionnels, transcrite et mise à jour",
  reference: "C. trav. R. 4121-1 et R. 4121-2",
  rythme: "annuelle",
};

function ligne(nom: string, id: string): LigneMetier | null {
  const o = obligationParId(id);
  // Une obligation retirée du référentiel disparaît de la liste plutôt
  // que d'y afficher un trou.
  if (!o) return null;
  return {
    nom,
    libelle: o.libelle,
    reference: o.referencesLegales[0]?.reference ?? "",
    rythme: LABEL_PERIODICITE[o.periodicite],
  };
}

function metier(
  id: string,
  label: string,
  note: string,
  paires: [string, string][],
): Metier {
  return {
    id,
    label,
    note,
    lignes: [DUERP, ...paires.map(([nom, obl]) => ligne(nom, obl))].filter(
      (l): l is LigneMetier => l !== null,
    ),
  };
}

export const METIERS: Metier[] = [
  metier(
    "restauration",
    "Restauration",
    "La cuisine ajoute le gaz, la hotte et les conduits d'extraction à la liste commune.",
    [
      ["Extincteurs", "incendie-erp-extincteurs-annuelle"],
      ["Hotte et conduits d'extraction", "cuisson-erp-circuits-extraction-nettoyage"],
      ["Appareils de cuisson", "cuisson-erp-appareils-annuelle"],
      ["Éclairage de sécurité (BAES)", "incendie-erp-baes-annuelle"],
      // PE 4 § 2 est désormais encodé entier et porté par l'établissement
      // (ADR-022) : le fragment « installations électriques » a été absorbé.
      ["Installation électrique", "incendie-erp-pe4-entretien-installations-techniques"],
      // R. 4222-20 encodé entier, porté par l'établissement (ADR-022) : le
      // fragment « VMC/CTA » a été absorbé.
      ["Ventilation", "aeration-controle-installations-r4222-20"],
    ],
  ),
  metier(
    "commerce",
    "Commerce de détail",
    "Recevoir du public déplace le curseur : c'est le règlement ERP qui commande, pas seulement le Code du travail.",
    [
      ["Extincteurs", "incendie-erp-extincteurs-annuelle"],
      ["Éclairage de sécurité (BAES)", "incendie-erp-baes-annuelle"],
      ["Porte automatique", "porte-auto-verification-semestrielle"],
      // PE 4 § 2 est désormais encodé entier et porté par l'établissement
      // (ADR-022) : le fragment « installations électriques » a été absorbé.
      ["Installation électrique", "incendie-erp-pe4-entretien-installations-techniques"],
      ["Consigne incendie", "incendie-travail-consigne-affichee"],
      ["Registre de sécurité", "incendie-registre-securite"],
    ],
  ),
  metier(
    "bureaux",
    "Bureau et services",
    "Peu d'équipements, mais les mêmes obligations de fond — et un exercice d'évacuation qu'on oublie souvent.",
    [
      ["Installation électrique", "elec-travail-periodique-annuelle"],
      ["Moyens de lutte contre l'incendie", "incendie-travail-moyens-lutte"],
      ["Exercice d'évacuation", "incendie-travail-exercice-semestriel"],
      // R. 4222-20 encodé entier, porté par l'établissement (ADR-022) : le
      // fragment « VMC/CTA » a été absorbé.
      ["Ventilation", "aeration-controle-installations-r4222-20"],
      ["Ascenseur", "ascenseur-examen-annuel-securite"],
      ["Registre de sécurité", "incendie-registre-securite"],
    ],
  ),
];
