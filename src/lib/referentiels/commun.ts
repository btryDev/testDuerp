import type { RisqueReferentiel, QuestionDetection } from "./types";

/**
 * Risques transverses présents quel que soit le secteur. Référencés sur les
 * 20 familles de risques de l'INRS ED 840 (octobre 2023).
 *
 * Sources :
 *  - INRS ED 840 « Évaluation des risques professionnels — Aide au repérage
 *    des risques dans les PME-PMI ».
 *  - INRS ED 6329 « Le risque routier en mission — Guide d'évaluation des
 *    risques » (fiche 4 ED 840).
 *  - INRS ED 6433 « Les chutes de plain-pied » (fiche 1 ED 840).
 *  - INRS dossier « Risques psychosociaux » (fiche 17 ED 840).
 */
export const risquesTransverses: RisqueReferentiel[] = [
  {
    id: "trv-routier",
    libelle: "Risque routier en mission",
    description:
      "INRS ED 840 fiche 4. Concerne tout déplacement professionnel (voiture, deux-roues, utilitaire) — y compris occasionnel. Risque majeur en termes de gravité.",
    unitesAssociees: [],
    graviteParDefaut: 4,
    probabiliteParDefaut: 2,
    mesuresRecommandees: [
      {
        id: "trv-routier-alternatif",
        libelle:
          "Limiter les déplacements (visioconférence, audioconférence) ; privilégier le train sur l'autoroute",
        type: "reduction_source",
      },
      {
        id: "trv-routier-planif",
        libelle:
          "Planification des déplacements : temps de conduite et de pause respectés ; pas de « fini-quitte »",
        type: "organisationnelle",
      },
      {
        id: "trv-routier-vehicule",
        libelle:
          "Maintien en bon état des véhicules ; équipement adapté (boîte automatique, ABS, climatisation)",
        type: "reduction_source",
      },
      {
        id: "trv-routier-tel",
        libelle:
          "Interdiction du téléphone au volant (quel que soit le dispositif) ; plages d'appel sur temps de pause",
        type: "organisationnelle",
      },
      {
        id: "trv-routier-formation",
        libelle:
          "Formation à la conduite préventive ; recyclage régulier",
        type: "formation",
      },
    ],
  },
  {
    id: "trv-tms-ecran",
    libelle: "Travail sur écran (TMS, fatigue visuelle)",
    description:
      "INRS dossier « Travail sur écran ». Concerne tout poste exposé plus de 4 heures par jour à un écran.",
    unitesAssociees: [],
    graviteParDefaut: 2,
    probabiliteParDefaut: 3,
    mesuresRecommandees: [
      {
        id: "trv-ecran-poste",
        libelle:
          "Aménagement ergonomique du poste : écran à hauteur des yeux, distance ~50–70 cm, siège réglable",
        type: "protection_collective",
      },
      {
        id: "trv-ecran-pauses",
        libelle:
          "Pauses régulières (règle 20-20-20 : toutes les 20 min, regarder à 20 pieds pendant 20 s)",
        type: "organisationnelle",
      },
      {
        id: "trv-ecran-medic",
        libelle:
          "Visites médecine du travail dédiées (vue, posture)",
        type: "organisationnelle",
      },
    ],
  },
  {
    id: "trv-rps-public",
    libelle:
      "Risques psychosociaux — relation avec le public (incivilités, agressions verbales)",
    description: "ED 840 fiche 17.",
    unitesAssociees: [],
    graviteParDefaut: 3,
    probabiliteParDefaut: 3,
    mesuresRecommandees: [
      {
        id: "trv-rps-procedure",
        libelle:
          "Procédure écrite de gestion des incivilités ; débriefing après incident",
        type: "organisationnelle",
      },
      {
        id: "trv-rps-formation",
        libelle:
          "Formation à la gestion des conflits et à la posture professionnelle face à l'agression",
        type: "formation",
      },
      {
        id: "trv-rps-alerte",
        libelle:
          "Dispositif d'alerte (bouton discret, téléphone d'urgence)",
        type: "protection_collective",
      },
    ],
  },
  {
    id: "trv-rps-isolement",
    libelle:
      "Risques psychosociaux — travail isolé ou horaires atypiques",
    description: "ED 840 fiche 17.",
    unitesAssociees: [],
    graviteParDefaut: 3,
    probabiliteParDefaut: 2,
    mesuresRecommandees: [
      {
        id: "trv-iso-comm",
        libelle:
          "Moyen de communication permanent avec un tiers (téléphone, DATI — dispositif d'alarme du travailleur isolé)",
        type: "protection_collective",
      },
      {
        id: "trv-iso-protocole",
        libelle:
          "Protocole d'appel régulier (check-in horaire) ; consigne d'évacuation accessible",
        type: "organisationnelle",
      },
    ],
  },
  {
    id: "trv-charges",
    libelle:
      "Charge physique : port de charges, manutention manuelle (TMS, lombalgies)",
    description:
      "INRS ED 840 fiche 5 « charge physique de travail ». Le port de charges supérieures à 10 kg est un repère réglementaire.",
    unitesAssociees: [],
    graviteParDefaut: 3,
    probabiliteParDefaut: 3,
    mesuresRecommandees: [
      {
        id: "trv-charges-meca",
        libelle:
          "Aide mécanique (diable, chariot, transpalette, monte-charge)",
        type: "reduction_source",
      },
      {
        id: "trv-charges-organis",
        libelle:
          "Réduction des charges unitaires ; rotation des opérateurs",
        type: "organisationnelle",
      },
      {
        id: "trv-charges-prap",
        libelle:
          "Formation Prap (prévention des risques liés à l'activité physique) — INRS ED 6161",
        type: "formation",
      },
    ],
  },
  {
    id: "trv-rps-orga",
    libelle:
      "Risques psychosociaux — tensions internes, charge mentale, turnover",
    description: "ED 840 fiche 17.",
    unitesAssociees: [],
    graviteParDefaut: 3,
    probabiliteParDefaut: 3,
    mesuresRecommandees: [
      {
        id: "trv-rps-entretiens",
        libelle:
          "Entretiens individuels réguliers ; baromètre social ; revue de charge",
        type: "organisationnelle",
      },
      {
        id: "trv-rps-tiers",
        libelle:
          "Intervention d'un tiers (psychologue du travail, médiateur, service de santé au travail)",
        type: "organisationnelle",
      },
      {
        id: "trv-rps-mgmt",
        libelle:
          "Formation des managers à la prévention des RPS",
        type: "formation",
      },
    ],
  },
  {
    id: "trv-addictions",
    libelle:
      "Pratiques addictives en milieu professionnel (alcool, médicaments, substances psychoactives)",
    description:
      "INRS ED 840 fiche 20. Concerne tous les secteurs ; risque accru en cas d'usage de machines ou de conduite.",
    unitesAssociees: [],
    graviteParDefaut: 3,
    probabiliteParDefaut: 1,
    mesuresRecommandees: [
      {
        id: "trv-addict-reglement",
        libelle:
          "Règlement intérieur précisant les règles concernant l'alcool et les substances psychoactives",
        type: "organisationnelle",
      },
      {
        id: "trv-addict-info",
        libelle:
          "Information / sensibilisation des salariés et de l'encadrement",
        type: "formation",
      },
      {
        id: "trv-addict-medic",
        libelle:
          "Orientation vers les services de santé au travail / cellule d'écoute",
        type: "organisationnelle",
      },
    ],
  },
];

export const questionsDetectionTransverses: QuestionDetection[] = [
  {
    id: "q-routier",
    intitule:
      "Des salariés conduisent-ils un véhicule (voiture, deux-roues, utilitaire) dans le cadre du travail, même occasionnellement ?",
    risqueIdAssocie: "trv-routier",
  },
  {
    id: "q-ecran",
    intitule:
      "Des salariés travaillent-ils plus de 4 heures par jour sur un écran ?",
    risqueIdAssocie: "trv-tms-ecran",
  },
  {
    id: "q-public",
    intitule:
      "Des salariés sont-ils en contact direct avec du public (clients, patients, usagers) ?",
    risqueIdAssocie: "trv-rps-public",
  },
  {
    id: "q-isolement",
    intitule:
      "Des salariés travaillent-ils seuls ou sur des horaires atypiques (nuit, week-end, isolés géographiquement) ?",
    risqueIdAssocie: "trv-rps-isolement",
  },
  {
    id: "q-charges",
    intitule:
      "Des salariés portent-ils régulièrement des charges supérieures à 10 kg, ou effectuent-ils des manutentions manuelles fréquentes ?",
    risqueIdAssocie: "trv-charges",
  },
  {
    id: "q-rps-orga",
    intitule:
      "Observez-vous des tensions internes, un turnover élevé, des arrêts maladie répétés ou un climat dégradé ?",
    risqueIdAssocie: "trv-rps-orga",
  },
  {
    id: "q-addictions",
    intitule:
      "Existe-t-il des situations connues ou suspectées de consommation d'alcool ou de substances psychoactives en lien avec le travail ?",
    risqueIdAssocie: "trv-addictions",
  },
];
