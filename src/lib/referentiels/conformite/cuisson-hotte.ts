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
        urlLegifrance:
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
        reference: "Arrêté du 25 juin 1980, art. GC 22",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020317519/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 4,
    typologies: { erp: true },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : la vérification annuelle est à l'article GC 22 (« Vérifications techniques »), GC 21 ne traitant que de l'entretien.",
  },
  {
    id: "cuisson-gaz-installations-triennale",
    domaine: "cuisson_hotte",
    libelle: "Vérification triennale des installations de gaz combustible (ERP 5ᵉ catégorie)",
    description:
      "Dans les ERP de 5ᵉ catégorie, l'exploitant fait procéder tous les trois ans au plus, par des techniciens compétents, à l'entretien et à la vérification des installations de gaz (règle applicable à partir du 1er juillet 2026). Les installations neuves ou modifiées sont vérifiées après travaux (art. PE 10 B).",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 22 juin 1990 (ERP 5ᵉ catégorie), art. PE 4 § 2, rédaction de l'arrêté du 1er décembre 2025",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020374770/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 1er décembre 2025 modifiant le règlement de sécurité ERP (applicable au 1er juillet 2026)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053020948",
      },
    ],
    periodicite: "triennale",
    realisateurs: ["personne_qualifiee", "organisme_agree"],
    criticite: 5,
    typologies: { erp: { categories: ["N5"] } },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait « GZ 29 § 1 » pour une périodicité triennale. GZ 29 = entretien ; la vérification périodique des installations gaz en ERP du 1er groupe est ANNUELLE (GZ 30) — voir cuisson-gaz-installations-annuelle. La périodicité triennale n'existe que pour la 5ᵉ catégorie (PE 4 § 2 modifié par l'arrêté du 1er décembre 2025). L'id est conservé (référencé en base).",
  },
  {
    id: "cuisson-gaz-installations-annuelle",
    domaine: "cuisson_hotte",
    libelle: "Vérification annuelle des installations de gaz combustible (ERP 1ʳᵉ à 4ᵉ catégorie)",
    description:
      "Dans les ERP des quatre premières catégories, les installations fixes aux gaz combustibles et aux hydrocarbures liquéfiés (stockage, distribution, locaux d'utilisation, appareils) sont vérifiées tous les ans : état d'entretien, ventilation, évacuation des produits de combustion, organes de coupure, dispositifs de sécurité, réglage des détendeurs, étanchéité des canalisations.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 25 juin 1980, art. GZ 30 (vérifications techniques)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020304269/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree", "personne_competente"],
    criticite: 5,
    typologies: { erp: { categories: ["N1", "N2", "N3", "N4"] } },
    categoriesEquipement: ["APPAREIL_CUISSON_ERP"],
    notesInternes:
      "Ajouté à l'audit 2026-08 : jusque-là seule une vérification « triennale » (fausse pour le 1er groupe) existait. GZ 29 = entretien, GZ 30 = vérification annuelle.",
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
        reference: "Arrêté du 25 juin 1980, art. GC 21 (ramonage annuel des conduits) et GC 20",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020317519/",
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
        reference: "Arrêté du 25 juin 1980, art. GC 22 (vérifications techniques annuelles)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/JORFTEXT000000290033/LEGISCTA000020317519/",
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
