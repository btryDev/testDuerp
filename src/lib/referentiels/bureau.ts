import type { Referentiel } from "./types";

/**
 * Référentiel activités de bureau / tertiaire.
 *
 * Sources :
 *  - INRS — dossier « Travail de bureau » (inrs.fr/risques/travail-bureau).
 *    « Les chutes et les manutentions manuelles sont les principales causes
 *    d'accident. Les TMS et lombalgies constituent l'essentiel des maladies
 *    professionnelles. La sédentarité associée à la posture assise prolongée
 *    favorise pathologies cardiovasculaires et diabète. Les salariés sont
 *    également exposés aux risques psychosociaux. »
 *  - INRS ED 950 « Conception des lieux et des situations de travail »
 *    (août 2025).
 *  - INRS ED 6497 « Qualité de l'air intérieur — Locaux de travail
 *    tertiaires ».
 *  - INRS ED 840 « Évaluation des risques professionnels — Aide au repérage
 *    des risques dans les PME-PMI » (octobre 2023) — taxonomie.
 */
export const bureau: Referentiel = {
  id: "bureau",
  nom: "Activités de bureau / tertiaire",
  codesNaf: [
    "62",
    "63",
    "64",
    "65",
    "66",
    "68",
    "69",
    "70",
    "71",
    "72",
    "73",
    "74",
    "78",
    "82",
  ],
  unitesTravailSuggerees: [
    {
      id: "bur-poste-ecran",
      nom: "Postes de travail sur écran (open-space, bureaux)",
      description:
        "Postes individuels ou partagés, travail prolongé sur écran (source : INRS Travail de bureau).",
    },
    {
      id: "bur-accueil",
      nom: "Accueil / réception",
      description:
        "Contact avec le public, téléphone, courrier, visiteurs.",
    },
    {
      id: "bur-reunion",
      nom: "Salles de réunion / espaces collaboratifs",
      description:
        "Présentations, visioconférence, échanges, déplacements ponctuels.",
    },
    {
      id: "bur-archives",
      nom: "Archives, locaux techniques, copieurs",
      description:
        "Stockage de documents, équipements informatiques, manutention occasionnelle.",
    },
    {
      id: "bur-communs",
      nom: "Espaces communs, circulation, sanitaires",
      description:
        "Couloirs, espaces de pause, circulation interne.",
    },
  ],
  risques: [
    {
      id: "bur-charge-physique-ecran",
      libelle:
        "Charge physique : travail prolongé sur écran (TMS, posture assise, sédentarité)",
      description:
        "INRS : « les TMS et lombalgies constituent l'essentiel des maladies professionnelles » du tertiaire ; « la sédentarité associée à la posture assise prolongée favorise pathologies cardiovasculaires et diabète ». ED 840 fiche 5.",
      unitesAssociees: ["bur-poste-ecran", "bur-accueil"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 4,
      criticiteReferenceSecteur: 6,
      mesuresRecommandees: [
        {
          id: "bur-poste-ergo",
          libelle:
            "Aménagement ergonomique : siège réglable normé, écran à hauteur des yeux, clavier et souris adaptés",
          type: "protection_collective",
        },
        {
          id: "bur-second-ecran",
          libelle:
            "Second écran ou support documents pour limiter les rotations du cou",
          type: "protection_collective",
        },
        {
          id: "bur-pauses-ecran",
          libelle:
            "Pauses régulières (règle 20-20-20) ; alternance assis / debout si possible",
          type: "organisationnelle",
        },
        {
          id: "bur-vue-medic",
          libelle:
            "Visites de médecine du travail dédiées au travail sur écran",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "bur-chute-plain-pied",
      libelle: "Chute de plain-pied (câbles, mobilier, sols)",
      description:
        "ED 840 fiche 1. INRS : « les chutes constituent une des principales causes d'accident dans le tertiaire ».",
      unitesAssociees: [
        "bur-poste-ecran",
        "bur-accueil",
        "bur-reunion",
        "bur-archives",
        "bur-communs",
      ],
      graviteParDefaut: 2,
      probabiliteParDefaut: 2,
      criticiteReferenceSecteur: 4,
      mesuresRecommandees: [
        {
          id: "bur-cables-goulottes",
          libelle:
            "Câbles goulottés, passés sous le sol ou regroupés ; pas de fils volants",
          type: "reduction_source",
        },
        {
          id: "bur-circulation-bur",
          libelle:
            "Allées dégagées (largeur réglementaire), pas de stockage temporaire dans les passages",
          type: "organisationnelle",
        },
        {
          id: "bur-eclairage-circul",
          libelle:
            "Éclairage adapté des circulations, escaliers, issues",
          type: "protection_collective",
        },
      ],
    },
    {
      id: "bur-rps-charge",
      libelle:
        "Risques psychosociaux : charge mentale, stress, surcharge de travail",
      description:
        "INRS : « les salariés sont exposés aux risques psychosociaux (stress, harcèlement…) ». ED 840 fiche 17.",
      unitesAssociees: ["bur-poste-ecran", "bur-accueil"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 6,
      mesuresRecommandees: [
        {
          id: "bur-charge-revue",
          libelle:
            "Plan de charge formalisé, revue régulière, marges intégrées aux délais",
          type: "organisationnelle",
        },
        {
          id: "bur-entretiens-rps",
          libelle:
            "Entretiens individuels réguliers sur la charge et la qualité de vie au travail",
          type: "organisationnelle",
        },
        {
          id: "bur-droit-deconnexion",
          libelle:
            "Droit à la déconnexion : règles d'envoi de courriels en dehors des horaires",
          type: "organisationnelle",
        },
        {
          id: "bur-formation-mgmt",
          libelle:
            "Formation des managers à la prévention des RPS et à l'écoute active",
          type: "formation",
        },
      ],
    },
    {
      id: "bur-rps-public",
      libelle:
        "Risques psychosociaux : tensions avec le public, incivilités, harcèlement",
      description:
        "ED 840 fiche 17. Ameli.fr : risque sectoriel reconnu en tertiaire d'accueil.",
      unitesAssociees: ["bur-accueil"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 4,
      mesuresRecommandees: [
        {
          id: "bur-form-conflit-bur",
          libelle:
            "Formation à la gestion des conflits et incivilités",
          type: "formation",
        },
        {
          id: "bur-debrief-bur",
          libelle:
            "Débriefing collectif après incident ; cellule d'écoute",
          type: "organisationnelle",
        },
        {
          id: "bur-alerte-discret",
          libelle:
            "Bouton d'alerte discret à l'accueil, procédure d'évacuation",
          type: "protection_collective",
        },
      ],
    },
    {
      id: "bur-air-interieur",
      libelle: "Qualité de l'air intérieur",
      description: "INRS ED 6497.",
      unitesAssociees: ["bur-poste-ecran", "bur-accueil", "bur-reunion"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 2,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "bur-vmc-bur",
          libelle:
            "Ventilation mécanique contrôlée, entretien et changement de filtres",
          type: "reduction_source",
        },
        {
          id: "bur-ouverture-fen",
          libelle:
            "Aération régulière des locaux par ouverture des fenêtres",
          type: "organisationnelle",
        },
        {
          id: "bur-substitution-mat",
          libelle:
            "Substitution des matériaux et produits émetteurs (peintures, mobilier neuf)",
          type: "reduction_source",
        },
      ],
    },
    {
      id: "bur-bruit-openspace",
      libelle: "Bruit en bureaux ouverts",
      description: "INRS Travail de bureau : « bruit en bureaux ouverts ». ED 840 fiche 11.",
      unitesAssociees: ["bur-poste-ecran"],
      graviteParDefaut: 1,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "bur-acoustique",
          libelle:
            "Traitement acoustique : panneaux absorbants, séparateurs, tapis",
          type: "protection_collective",
        },
        {
          id: "bur-zones-calmes",
          libelle:
            "Création de zones de concentration et de salles d'appel téléphonique",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "bur-electrique",
      libelle: "Risque électrique (multiprises, câbles, équipements)",
      description: "ED 840 fiche 14. Contrôles annuels obligatoires.",
      unitesAssociees: ["bur-poste-ecran", "bur-archives"],
      graviteParDefaut: 4,
      probabiliteParDefaut: 1,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "bur-controle-elec-bur",
          libelle:
            "Contrôles périodiques des installations électriques (annuel)",
          type: "organisationnelle",
        },
        {
          id: "bur-signalement-elec",
          libelle:
            "Procédure de signalement d'anomalie électrique ; remplacement immédiat",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "bur-thermique",
      libelle: "Ambiances thermiques (climatisation, vagues de chaleur)",
      description: "ED 840 fiche 12.",
      unitesAssociees: ["bur-poste-ecran", "bur-accueil"],
      graviteParDefaut: 2,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "bur-clim-bur",
          libelle:
            "Climatisation maintenue et entretenue ; pas de courant d'air direct",
          type: "reduction_source",
        },
        {
          id: "bur-canicule-bur",
          libelle:
            "Plan canicule : eau, adaptation des horaires, télétravail si possible",
          type: "organisationnelle",
        },
      ],
    },
    {
      id: "bur-lumineuse",
      libelle: "Ambiance lumineuse (reflets sur écran, éclairage inadapté)",
      description: "ED 840 fiche 15.",
      unitesAssociees: ["bur-poste-ecran"],
      graviteParDefaut: 1,
      probabiliteParDefaut: 3,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "bur-stores-bur",
          libelle:
            "Stores orientables ou films anti-reflets ; orientation des écrans perpendiculaire aux fenêtres",
          type: "protection_collective",
        },
        {
          id: "bur-eclairage-appoint",
          libelle:
            "Éclairage d'appoint individuel réglable à chaque poste",
          type: "protection_collective",
        },
      ],
    },
    {
      id: "bur-chute-hauteur",
      libelle: "Chute de hauteur (archives, étagères hautes)",
      description: "ED 840 fiche 2.",
      unitesAssociees: ["bur-archives"],
      graviteParDefaut: 3,
      probabiliteParDefaut: 1,
      criticiteReferenceSecteur: 3,
      mesuresRecommandees: [
        {
          id: "bur-escabeau-norme",
          libelle:
            "Escabeau stable normé disponible ; interdiction de monter sur les chaises ou meubles",
          type: "protection_collective",
        },
      ],
    },
  ],
  questionsDetection: [],
};
