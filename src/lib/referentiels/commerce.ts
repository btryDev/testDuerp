import type { Referentiel } from "./types";

/**
 * Référentiel commerce de détail (alimentaire et non alimentaire).
 *
 * Sources :
 *  - INRS AC 93 « OiRA commerce non alimentaire — Un nouvel outil d'aide à
 *    l'évaluation des risques » (Réf. en santé au travail n° 146, juin 2016).
 *    Structure des unités OiRA : Réception et stockage / Mise en rayon /
 *    Activité de vente / Ambiance et aménagement des locaux / Interventions
 *    chez les clients / Atelier (laboratoire).
 *  - INRS ED 925 « Les commerces alimentaires de proximité ».
 *  - INRS ED 840 « Évaluation des risques professionnels — Aide au repérage
 *    des risques dans les PME-PMI » (octobre 2023) — taxonomie des risques.
 *  - ameli.fr / Assurance Maladie Risques professionnels — secteur commerce.
 */
export const commerce: Referentiel = {
  id: "commerce",
  nom: "Commerce de détail",
  codesNaf: [
    "47.11",
    "47.19",
    "47.21",
    "47.22",
    "47.23",
    "47.24",
    "47.25",
    "47.29",
    "47.41",
    "47.42",
    "47.43",
    "47.51",
    "47.52",
    "47.53",
    "47.54",
    "47.59",
    "47.6",
    "47.7",
    "47.8",
    "47.9",
  ],
  unitesTravailSuggerees: [
    {
      id: "com-reception-stockage",
      nom: "Réception et stockage",
      description:
        "Déchargement, contrôle, rangement en réserve (source : OiRA commerce non alimentaire).",
    },
    {
      id: "com-mise-rayon",
      nom: "Mise en rayon et vitrine",
      description:
        "Approvisionnement des rayons, opérations en hauteur, merchandising (source : OiRA).",
    },
    {
      id: "com-vente-caisse",
      nom: "Activité de vente et caisse",
      description:
        "Accueil, conseil client, encaissement, manipulation d'espèces.",
    },
    {
      id: "com-locaux",
      nom: "Locaux et ambiance générale",
      description:
        "Surface de vente, sanitaires, espaces communs (source : OiRA).",
    },
  ],
  risques: [
    {
      id: "com-charge-physique",
      libelle: "Charge physique : manutentions et postures (mise en rayon, port de charges)",
      description:
        "ED 840 fiche 5 « charge physique de travail ». OiRA commerce identifie les manutentions comme un risque central de l'activité de mise en rayon et de réserve.",
      unitesAssociees: ["com-reception-stockage", "com-mise-rayon"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 6,
      mesuresRecommandees: [
        {
          id: "com-aides-manut",
          libelle:
            "Aides à la manutention : transpalettes, chariots, diables, dessertes",
          type: "reduction_source",
        },
        {
          id: "com-rangement-hauteur",
          libelle:
            "Rangement des charges lourdes à hauteur d'homme, allègement des contenants",
          type: "organisationnelle",
        },
        {
          id: "com-prap",
          libelle:
            "Formation Prap (prévention des risques liés à l'activité physique)",
          type: "formation",
        },
        {
          id: "com-chaussures-secu",
          libelle: "Chaussures de sécurité en réserve",
          type: "protection_individuelle",
        },
      ],
    },
    {
      id: "com-chute-plain-pied",
      libelle: "Chute de plain-pied (sols, allées encombrées)",
      description: "ED 840 fiche 1.",
      unitesAssociees: [
        "com-reception-stockage",
        "com-mise-rayon",
        "com-vente-caisse",
        "com-locaux",
      ],
      graviteParDefaut: 2,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 4,
      mesuresRecommandees: [
        {
          id: "com-allees",
          libelle:
            "Allées de circulation dégagées et signalisées en permanence",
          type: "organisationnelle",
        },
        {
          id: "com-sol-anti",
          libelle:
            "Revêtement antidérapant aux zones sensibles (entrée, sanitaires, réserve humide)",
          type: "reduction_source",
        },
        {
          id: "com-nettoyage-signal",
          libelle:
            "Protocole de nettoyage avec signalisation des zones humides",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "com-chute-hauteur",
      libelle: "Chute de hauteur (mise en rayon, vitrine, archives)",
      description: "ED 840 fiche 2. OiRA commerce : opérations de mise en rayon en hauteur.",
      unitesAssociees: ["com-reception-stockage", "com-mise-rayon"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 2,
      criticiteReferenceSecteur: 4,
      mesuresRecommandees: [
        {
          id: "com-marchepied-norme",
          libelle:
            "Escabeau ou marchepied stable conforme aux normes (NF), proscrire les escaliers improvisés",
          type: "protection_collective",
        },
        {
          id: "com-interdiction-rayon",
          libelle:
            "Interdiction formelle de monter sur les rayonnages",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "com-rps-public",
      libelle:
        "Risques psychosociaux : agression, incivilités, braquage",
      description:
        "ED 840 fiche 17 « risques psychosociaux ». Risque majeur en commerce de détail (caisse, ouverture/fermeture).",
      unitesAssociees: ["com-vente-caisse", "com-locaux"],
      graviteParDefaut: 4,
      probabiliteParDefaut: 2,
      criticiteReferenceSecteur: 6,
      mesuresRecommandees: [
        {
          id: "com-coffre-differe",
          libelle:
            "Coffre à dépôt différé, limitation des fonds en caisse, collecte programmée",
          type: "reduction_source",
        },
        {
          id: "com-video-eclairage",
          libelle:
            "Vidéosurveillance et éclairage extérieur (entrée, parking)",
          type: "protection_collective",
        },
        {
          id: "com-procedure-fermeture",
          libelle:
            "Procédure d'ouverture / fermeture à deux personnes",
          type: "organisationnelle",
        },
        {
          id: "com-formation-conflit",
          libelle:
            "Formation à la gestion des incivilités et conduite à tenir en cas d'agression",
          type: "formation",
        },
      ],
    },
    {
      id: "com-postural-caisse",
      libelle:
        "Charge physique en caisse : posture statique et gestes répétitifs",
      description: "ED 840 fiche 5. Risque majeur des hôtes/hôtesses de caisse.",
      unitesAssociees: ["com-vente-caisse"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 4,
      criticiteReferenceSecteur: 6,
      mesuresRecommandees: [
        {
          id: "com-siege-caisse",
          libelle:
            "Siège ergonomique réglable et repose-pieds aux postes de caisse",
          type: "protection_collective",
        },
        {
          id: "com-rotation-caisse",
          libelle:
            "Rotation des postes, alternance assis / debout, micropauses régulières",
          type: "organisationnelle",
        },
        {
          id: "com-info-tms",
          libelle:
            "Information / formation à la prévention des TMS et aux postures",
          type: "formation",
        },
      ],
    },
    {
      id: "com-coupure-cutter",
      libelle: "Coupure (cutter, ouverture de cartons, étiquetage)",
      description: "ED 840 fiches 9 (équipements) et 19 (heurt/cognement).",
      unitesAssociees: ["com-reception-stockage", "com-mise-rayon"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 4,
      mesuresRecommandees: [
        {
          id: "com-cutter-securite",
          libelle:
            "Cutters à lame rétractable automatique ou cutters de sécurité",
          type: "reduction_source",
        },
        {
          id: "com-gants-anti-coup",
          libelle:
            "Gants anti-coupure pour les opérations à risque",
          type: "protection_individuelle",
        },
      ],
    },
    {
      id: "com-chimique",
      libelle: "Produits chimiques (entretien, désinfection)",
      description: "ED 840 fiche 7.",
      unitesAssociees: ["com-locaux", "com-reception-stockage"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 2,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "com-substitution-chim",
          libelle:
            "Substitution par produits moins dangereux ; étiquetage CLP respecté",
          type: "reduction_source",
        },
        {
          id: "com-fds-com",
          libelle:
            "Fiches de données de sécurité (FDS) accessibles au personnel",
          type: "formation",
        },
        {
          id: "com-gants-chim-com",
          libelle: "Gants de protection adaptés au produit",
          type: "protection_individuelle",
        },
      ],
    },
    {
      id: "com-bruit",
      libelle: "Ambiance sonore (musique, ventilation, affluence)",
      description: "ED 840 fiche 11. À évaluer notamment dans les commerces avec musique de fond.",
      unitesAssociees: ["com-vente-caisse", "com-locaux"],
      graviteParDefaut: 1,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "com-niveau-sonore",
          libelle:
            "Limiter le niveau sonore de la musique d'ambiance ; mesurer si doute",
          type: "reduction_source",
        },
      ],
    },
  ],
  questionsDetection: [],
};
