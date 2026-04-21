import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

/**
 * Libellés FR des catégories d'équipement, affichables tel quel en UI.
 * L'ordre de la table conditionne aussi l'ordre d'affichage dans la vue
 * synthétique (regroupée par catégorie).
 */
export const LABEL_CATEGORIE_EQUIPEMENT: Record<CategorieEquipement, string> = {
  INSTALLATION_ELECTRIQUE: "Installation électrique",
  EXTINCTEUR: "Extincteurs",
  BAES: "Éclairage de sécurité (BAES)",
  ALARME_INCENDIE: "Alarme incendie / SSI",
  DESENFUMAGE: "Désenfumage",
  VMC: "Ventilation (VMC)",
  CTA: "Centrale de traitement d'air (CTA)",
  HOTTE_PRO: "Hotte professionnelle",
  APPAREIL_CUISSON_ERP: "Appareil de cuisson ERP",
  ASCENSEUR: "Ascenseur",
  PORTE_AUTO: "Porte automatique",
  PORTAIL_AUTO: "Portail automatique",
  EQUIPEMENT_SOUS_PRESSION: "Équipement sous pression",
  STOCKAGE_MATIERE_DANGEREUSE: "Stockage de matières dangereuses",
  EQUIPEMENT_LEVAGE: "Équipement de levage",
  AUTRE: "Autre équipement",
};

export const DESCRIPTION_CATEGORIE: Partial<Record<CategorieEquipement, string>> = {
  INSTALLATION_ELECTRIQUE:
    "Tableau général, circuits terminaux, éventuel groupe électrogène de sécurité.",
  EXTINCTEUR:
    "Extincteurs portatifs (eau, CO₂, poudre) et mobiles. Vérification annuelle obligatoire.",
  BAES:
    "Blocs autonomes d'éclairage de sécurité qui s'allument en cas de coupure.",
  ALARME_INCENDIE:
    "Détection, alarme, centrale SSI. Obligatoire selon effectif et typologie.",
  DESENFUMAGE:
    "Dispositifs d'évacuation naturelle ou mécanique des fumées (DENFC, volets).",
  VMC:
    "Ventilation mécanique contrôlée. Locaux à pollution spécifique à déclarer.",
  CTA: "Centrale de traitement d'air avec filtration et conditionnement.",
  HOTTE_PRO:
    "Hotte au-dessus d'appareils de cuisson en cuisine professionnelle.",
  APPAREIL_CUISSON_ERP:
    "Fourneau, friteuse, grill, four… situés en cuisine d'un ERP (art. GC).",
  ASCENSEUR: "Ascenseur électrique ou hydraulique. Contrôle technique quinquennal.",
  PORTE_AUTO: "Porte motorisée piétonne (entrée automatique).",
  PORTAIL_AUTO: "Portail motorisé de véhicule.",
  EQUIPEMENT_SOUS_PRESSION:
    "Compresseurs, chaudières, réservoirs d'air comprimé.",
  STOCKAGE_MATIERE_DANGEREUSE:
    "Liquides inflammables, gaz, produits chimiques en quantité significative.",
  EQUIPEMENT_LEVAGE:
    "Palan, transpalette électrique, monte-charge, hayon élévateur.",
  AUTRE: "Autre équipement soumis à vérification périodique.",
};
