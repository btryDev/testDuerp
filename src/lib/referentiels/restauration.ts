import type { Referentiel } from "./types";

/**
 * Référentiel restauration traditionnelle.
 *
 * Sources :
 *  - INRS ED 880 « La restauration traditionnelle — Prévention des risques
 *    professionnels » (novembre 2012) — fiches « Réception », « Stockage »,
 *    « Production froide et chaude », « Service en salle », « Plonge ».
 *  - OiRA Restauration (outil INRS / EU-OSHA, AC 64).
 *  - INRS ED 840 « Évaluation des risques professionnels — Aide au repérage
 *    des risques dans les PME-PMI » (octobre 2023) pour la taxonomie des
 *    familles de risques.
 *
 * Les libellés des risques et les mesures recommandées sont alignés sur le
 * vocabulaire INRS. Les valeurs de cotation par défaut reflètent les risques
 * mis en avant comme prédominants par l'ED 880 (« les chutes et glissades
 * de plain-pied représentent 1/3 des accidents à elles seules ; les accidents
 * aux mains représentent plus d'1/3 des accidents »).
 */
export const restauration: Referentiel = {
  id: "restauration",
  nom: "Restauration traditionnelle",
  codesNaf: ["56.10A", "56.10B", "56.10C", "56.21Z", "56.29A", "56.29B", "56.30Z"],
  unitesTravailSuggerees: [
    {
      id: "reception",
      nom: "Réception des matières premières",
      description:
        "Déchargement, contrôle, transfert vers les zones de stockage (source : INRS ED 880, fiche 1).",
    },
    {
      id: "stockage",
      nom: "Stockage (réserve, chambre froide)",
      description:
        "Rayonnages, chambres froides, locaux d'emballage (source : INRS ED 880, fiche 2).",
    },
    {
      id: "production",
      nom: "Production froide et chaude (cuisine)",
      description:
        "Préparation et cuisson, plans de travail, équipements (source : INRS ED 880, fiche 3).",
    },
    {
      id: "service-salle",
      nom: "Service en salle",
      description:
        "Accueil, prise de commande, service, encaissement (source : INRS ED 880, fiche 4).",
    },
    {
      id: "plonge",
      nom: "Plonge, nettoyage",
      description:
        "Lavage de la vaisselle, nettoyage des locaux et équipements (source : INRS ED 880, fiche 5).",
    },
  ],
  risques: [
    {
      id: "resto-chute-plain-pied",
      libelle: "Chute de plain-pied (sols glissants, encombrés)",
      description:
        "INRS ED 880 : les chutes et glissades de plain-pied représentent à elles seules environ 1/3 des accidents en restauration.",
      unitesAssociees: ["reception", "stockage", "production", "service-salle", "plonge"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 4,
      mesuresRecommandees: [
        {
          id: "resto-sol-antiderapant",
          libelle:
            "Sol antidérapant (coefficient de frottement > 0,3) posé par un professionnel",
          type: "reduction_source",
        },
        {
          id: "resto-evacuation-eaux",
          libelle:
            "Système d'évacuation des eaux : siphons, caniveaux, légère pente — entretien régulier",
          type: "reduction_source",
        },
        {
          id: "resto-nettoyage-rapide",
          libelle:
            "Nettoyage immédiat des salissures susceptibles de faire glisser",
          type: "organisationnelle",
        },
        {
          id: "resto-circulation",
          libelle:
            "Couloirs et zones de passage dégagés (largeur ≥ 120 cm, signalisation des dénivelés)",
          type: "organisationnelle",
        },
        {
          id: "resto-chaussures-anti",
          libelle:
            "Chaussures antidérapantes spécifiques restauration (coefficient de frottement > 0,15)",
          type: "protection_individuelle",
        },
      ],
    },
    {
      id: "resto-coupure",
      libelle: "Coupure aux mains (couteaux, trancheuse, mandoline)",
      description:
        "INRS ED 880 : les accidents aux mains représentent plus d'1/3 des accidents en restauration.",
      unitesAssociees: ["production", "plonge"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 3,
      mesuresRecommandees: [
        {
          id: "resto-machine-protec",
          libelle:
            "Trancheuses / machines à trancher avec protecteurs et arrêt d'urgence en place",
          type: "protection_collective",
        },
        {
          id: "resto-eplucheur",
          libelle:
            "Privilégier un éplucheur ou équipement adapté pour réduire les gestes manuels répétés",
          type: "reduction_source",
        },
        {
          id: "resto-rangement-couteaux",
          libelle:
            "Rangement spécifique des couteaux (armoire, bac), à part de la vaisselle sale",
          type: "organisationnelle",
        },
        {
          id: "resto-affutage",
          libelle:
            "Affûtage et affilage réguliers ; formation à l'affûtage et à la manipulation",
          type: "formation",
        },
        {
          id: "resto-gants-anti",
          libelle: "Gants anti-coupure pour les tâches à risque",
          type: "protection_individuelle",
        },
      ],
    },
    {
      id: "resto-brulure",
      libelle: "Brûlure (équipements de cuisson, friteuse, liquides chauds)",
      unitesAssociees: ["production"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 3,
      mesuresRecommandees: [
        {
          id: "resto-friteuse-implant",
          libelle:
            "Implantation : friteuse éloignée des points d'eau et des feux vifs",
          type: "reduction_source",
        },
        {
          id: "resto-queues-casserole",
          libelle:
            "Queues de casseroles tournées vers l'intérieur des plans de cuisson",
          type: "organisationnelle",
        },
        {
          id: "resto-protections-saisie",
          libelle:
            "Protections (poignées spéciales, tissus) pour la saisie des plats chauds",
          type: "protection_individuelle",
        },
        {
          id: "resto-formation-cuisson",
          libelle:
            "Formation manipulation des équipements chauds (friteuse, salamandre, four)",
          type: "formation",
        },
      ],
    },
    {
      id: "resto-charge-physique",
      libelle: "Charge physique : manutentions et postures (cuisine, service, plonge)",
      description:
        "ED 840 fiche 5 « charge physique de travail » : déplacements de charges, postures debout statiques, gestes répétitifs.",
      unitesAssociees: ["reception", "stockage", "production", "service-salle", "plonge"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 4,
      mesuresRecommandees: [
        {
          id: "resto-aides-manut",
          libelle:
            "Aides à la manutention : diables, chariots, dessertes à roulettes, monte-charge",
          type: "reduction_source",
        },
        {
          id: "resto-plans-reglables",
          libelle:
            "Plans de travail réglables en hauteur (ou à hauteur du tronc), bacs adaptés",
          type: "reduction_source",
        },
        {
          id: "resto-stockage-hauteur",
          libelle:
            "Charges lourdes à hauteur d'homme ; pas de stockage trop haut/trop bas",
          type: "organisationnelle",
        },
        {
          id: "resto-assis-debout",
          libelle:
            "Sièges assis-debout réglables aux postes le permettant",
          type: "protection_collective",
        },
        {
          id: "resto-prap",
          libelle:
            "Formation Prap (prévention des risques liés à l'activité physique)",
          type: "formation",
        },
      ],
    },
    {
      id: "resto-chute-hauteur",
      libelle: "Chute de hauteur (rangement en hauteur, escabeau, escaliers)",
      unitesAssociees: ["stockage", "production"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 2,
      mesuresRecommandees: [
        {
          id: "resto-escabeau",
          libelle:
            "Escabeau avec garde-corps et mains courantes — proscrire échelles et accessoires improvisés (cageots, cartons)",
          type: "protection_collective",
        },
        {
          id: "resto-range-hauteur",
          libelle:
            "Réorganisation du rangement pour éviter le travail en hauteur",
          type: "organisationnelle",
        },
        {
          id: "resto-escaliers",
          libelle:
            "Escaliers : rambarde et/ou rampe, antidérapant sur les arêtes",
          type: "protection_collective",
        },
      ],
    },
    {
      id: "resto-incendie",
      libelle: "Incendie (friteuse, hotte, flamme nue)",
      unitesAssociees: ["production"],
      graviteParDefaut: 4,
      probabiliteParDefaut: 2,
      mesuresRecommandees: [
        {
          id: "resto-hotte",
          libelle:
            "Nettoyage régulier de la hotte aspirante et des filtres ; vérification VMC",
          type: "reduction_source",
        },
        {
          id: "resto-vanne-gaz",
          libelle:
            "Vanne de coupure de gaz à un emplacement connu de tous, accessible",
          type: "reduction_source",
        },
        {
          id: "resto-extincteurs",
          libelle:
            "Extincteurs adaptés (classe F pour huiles), accessibles, signalés, vérifiés annuellement",
          type: "protection_collective",
        },
        {
          id: "resto-formation-extincteur",
          libelle:
            "Formation à la manipulation des extincteurs ; consigne d'évacuation affichée",
          type: "formation",
        },
      ],
    },
    {
      id: "resto-electrisation",
      libelle: "Risque électrique (installations cuisine, lavage)",
      description:
        "ED 880 fiche 3 + ED 840 fiche 14. Contrôles périodiques annuels obligatoires.",
      unitesAssociees: ["production", "plonge", "stockage"],
      graviteParDefaut: 4,
      probabiliteParDefaut: 1,
      mesuresRecommandees: [
        {
          id: "resto-controle-elec",
          libelle:
            "Contrôles périodiques réglementaires des installations électriques (annuel)",
          type: "organisationnelle",
        },
        {
          id: "resto-debranchement",
          libelle:
            "Débranchement / sectionnement avant nettoyage des appareils",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "resto-chimique",
      libelle: "Produits chimiques (nettoyage, désinfection, dégraissage)",
      unitesAssociees: ["plonge", "production", "service-salle", "stockage"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 2,
      mesuresRecommandees: [
        {
          id: "resto-substitution",
          libelle:
            "Substitution par produits moins dangereux quand possible (étiquettes CLP)",
          type: "reduction_source",
        },
        {
          id: "resto-ventilation",
          libelle:
            "Ventilation des zones d'utilisation, dosage automatique si possible",
          type: "protection_collective",
        },
        {
          id: "resto-fds",
          libelle:
            "Fiches de données de sécurité (FDS) accessibles, lues et expliquées au personnel",
          type: "formation",
        },
        {
          id: "resto-gants-chim",
          libelle: "Gants et lunettes de protection adaptés",
          type: "protection_individuelle",
        },
      ],
    },
    {
      id: "resto-ambiance-thermique",
      libelle: "Ambiances thermiques contrastées (cuisine chaude / chambre froide)",
      unitesAssociees: ["production", "stockage"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 3,
      mesuresRecommandees: [
        {
          id: "resto-vmc",
          libelle:
            "Renouvellement mécanique de l'air en cuisine ; entretien VMC",
          type: "protection_collective",
        },
        {
          id: "resto-vetement-froid",
          libelle:
            "Vêtements de protection thermique pour le travail en chambre froide",
          type: "protection_individuelle",
        },
        {
          id: "resto-ouverture-cf",
          libelle:
            "Dispositif d'ouverture de l'intérieur des chambres froides",
          type: "protection_collective",
        },
        {
          id: "resto-rotation-postes",
          libelle:
            "Limitation du temps d'exposition continue ; rotation des postes",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "resto-rps-coup-feu",
      libelle: "Risques psychosociaux : stress, coup de feu, amplitude horaire",
      description:
        "ED 840 fiche 17 « risques psychosociaux ». ED 880 fiche 3 (stress, fatigue physique).",
      unitesAssociees: ["production", "service-salle"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 3,
      mesuresRecommandees: [
        {
          id: "resto-organisation",
          libelle:
            "Organisation : tâches définies par poste, anticipation des fluctuations d'activité",
          type: "organisationnelle",
        },
        {
          id: "resto-zones-passage",
          libelle:
            "Zones de passage cuisine-salle dégagées, sens de circulation, hublot dans les portes",
          type: "organisationnelle",
        },
        {
          id: "resto-pauses",
          libelle:
            "Pauses aménagées dans l'organisation du travail",
          type: "organisationnelle",
        },
        {
          id: "resto-effectif-couverts",
          libelle:
            "Adaptation du nombre de serveurs au nombre de couverts",
          type: "organisationnelle",
        },
      ],
    },
  ],
  questionsDetection: [],
};
