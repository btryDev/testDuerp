/**
 * Obligations réglementaires — Cuisson et hottes professionnelles (P2).
 *
 * Sources primaires :
 *   - Arrêté du 25 juin 1980 modifié — règlement de sécurité ERP, section GC
 *     « Grandes cuisines » (art. GC 12 à GC 21) et section GZ
 *     « Installations aux gaz combustibles et aux hydrocarbures liquéfiés »
 *     (art. GZ 29 pour vérifications périodiques).
 *
 * Amendement 2026-08 — fusion du doublon de ramonage. Le nettoyage/ramonage
 * annuel des circuits d'extraction de buées (art. GC 20) était déclaré deux
 * fois : ici sous `cuisson-erp-circuits-extraction-nettoyage` et dans
 * `aeration.ts` sous `aeration-hotte-pro-annuelle`. Même article, même
 * périodicité annuelle, même catégorie d'équipement `HOTTE_PRO` : un
 * restaurant avec une hotte recevait deux échéances pour une seule
 * obligation, ce qui faussait aussi les agrégats de conformité. La règle
 * survit ici (le domaine `cuisson_hotte` correspond au chapitre « Grandes
 * cuisines » du règlement ERP dont l'article GC 20 est issu) ; l'id
 * `aeration-hotte-pro-annuelle` a été retiré du référentiel.
 */

import type { Obligation } from "./types";

export const obligationsCuissonHotte: Obligation[] = [
  {
    id: "cuisson-erp-verification-initiale",
    domaine: "cuisson_hotte",
    libelle: "Vérification à la mise en service des installations de cuisson (grandes cuisines ERP)",
    description:
      "À la mise en service d'une grande cuisine (installations > 20 kW ou production > 500 couverts simultanés, cf. art. GC 1), un examen de conformité est réalisé. Il porte sur les appareils de cuisson, les circuits d'amenée d'énergie, l'extraction et l'extinction automatique éventuelle.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GC 12 et GC 19",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "mise_en_service_uniquement",
    realisateurs: ["organisme_agree"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
  },
  {
    id: "cuisson-erp-appareils-annuelle",
    domaine: "cuisson_hotte",
    libelle: "Vérification annuelle des appareils de cuisson et des dispositifs de sécurité (grandes cuisines ERP)",
    description:
      "Les appareils de cuisson et leurs dispositifs de sécurité (thermocouples, arrêts d'urgence, commandes à distance) sont vérifiés annuellement par une personne compétente dans les grandes cuisines ERP.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GC 21 § 2",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
  },
  {
    id: "cuisson-gaz-installations-triennale",
    domaine: "cuisson_hotte",
    libelle: "Vérification triennale des installations de gaz combustible (ERP)",
    description:
      "Les installations fixes aux gaz combustibles et aux hydrocarbures liquéfiés des ERP sont vérifiées périodiquement (tuyauteries fixes, robinets, organes de sécurité). La périodicité maximale est de trois ans conformément à l'arrêté du 25 juin 1980, section GZ.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GZ 29 § 1",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
    notesInternes:
      "S'applique aux ERP dotés d'une installation gaz. Lorsque l'établissement est aussi grande cuisine, cumul avec cuisson-erp-appareils-annuelle.",
  },
  {
    id: "cuisson-erp-circuits-extraction-nettoyage",
    domaine: "cuisson_hotte",
    libelle: "Ramonage et nettoyage annuels des circuits d'extraction de buées (grandes cuisines ERP)",
    description:
      "Les circuits d'extraction d'air vicié et de buées des grandes cuisines — hottes, filtres, conduits — sont maintenus en état de propreté et font l'objet d'un ramonage et d'un nettoyage aussi souvent que nécessaire, et au moins une fois par an.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GC 20",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee", "exploitant"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["HOTTE_PRO"],
    notesInternes:
      "Obligation unique issue de la fusion de l'ancien doublon `aeration-hotte-pro-annuelle` (retiré). Typologie `erp: true` — l'article GC 20 ne restreint pas par catégorie ; écrire `categories: [N1…N5]` reviendrait à exiger en plus une catégorie renseignée et créerait un faux négatif sur les établissements dont la catégorie est inconnue.",
  },
  {
    id: "cuisson-erp-extinction-automatique-annuelle",
    domaine: "cuisson_hotte",
    libelle: "Vérification annuelle du système d'extinction automatique sur appareils de cuisson (ERP)",
    description:
      "Lorsque l'établissement est équipé d'un système d'extinction automatique des feux sur appareils de cuisson (friteuses, plaques grasses), celui-ci est vérifié annuellement par un technicien compétent — état des cartouches, des capteurs, des circuits de déclenchement.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GC 21 (§ relatif aux dispositifs d'extinction)",
        url:
          "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { erp: true },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
    conditions: [
      {
        type: "equipement_propriete_non_infirmee",
        categorie: "APPAREIL_CUISSON_ERP",
        propriete: "aExtinctionAutomatique",
      },
    ],
    notesInternes:
      "La portée est dans le texte de l'obligation elle-même (« lorsque l'établissement est équipé d'un système d'extinction automatique ») : elle est désormais portée par une condition déclarative, plus par un commentaire. Forme `non_infirmee` obligatoire (criticité 5) — les appareils de cuisson déjà déclarés conservent l'obligation tant que le dirigeant n'a pas répondu « non ».",
  },
];
