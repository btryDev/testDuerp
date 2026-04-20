import type { QuestionCotation } from "@/lib/referentiels/types";

/**
 * Questions comportementales génériques pour transformer une situation
 * concrète en note 1-4, sans jamais demander à l'utilisateur "notez de 1 à 4".
 * Les libellés évitent le jargon — on pose la question comme à un patron de
 * TPE qui découvre l'évaluation des risques.
 */

export const questionGravite: QuestionCotation = {
  axe: "gravite",
  intitule:
    "Si cet accident ou ce problème de santé survenait, quelle serait la conséquence la plus probable ?",
  options: [
    {
      libelle:
        "Gêne, petite douleur, premiers soins sur place. La personne continue sa journée.",
      valeur: 1,
    },
    {
      libelle:
        "Passage aux urgences ou chez le médecin, mais retour au travail dans les 1 à 2 jours.",
      valeur: 2,
    },
    {
      libelle:
        "Arrêt de travail de plusieurs jours à plusieurs semaines.",
      valeur: 3,
    },
    {
      libelle:
        "Séquelles durables, invalidité permanente, décès.",
      valeur: 4,
    },
  ],
};

export const questionProbabilite: QuestionCotation = {
  axe: "probabilite",
  intitule:
    "À quelle fréquence vos salariés sont-ils exposés à cette situation à risque ?",
  options: [
    {
      libelle:
        "Très rarement : situation exceptionnelle, ou protection très efficace.",
      valeur: 1,
    },
    {
      libelle:
        "Occasionnellement : quelques fois par an, ou exposition brève.",
      valeur: 2,
    },
    {
      libelle:
        "Régulièrement : une ou plusieurs fois par semaine.",
      valeur: 3,
    },
    {
      libelle:
        "Permanente ou quotidienne, pour la majorité des salariés concernés.",
      valeur: 4,
    },
  ],
};

export const questionMaitrise: QuestionCotation = {
  axe: "maitrise",
  intitule:
    "Où en êtes-vous dans la prévention de ce risque aujourd'hui ?",
  options: [
    {
      libelle:
        "Aucune mesure spécifique en place, ou mesures insuffisantes.",
      valeur: 1,
    },
    {
      libelle:
        "Quelques mesures existent (EPI, consignes) mais mal appliquées ou incomplètes.",
      valeur: 2,
    },
    {
      libelle:
        "Mesures en place, appliquées, mais perfectibles.",
      valeur: 3,
    },
    {
      libelle:
        "Prévention bien structurée : suppression/réduction à la source, protection collective, formation.",
      valeur: 4,
    },
  ],
};

export const questionsCotation = [
  questionGravite,
  questionProbabilite,
  questionMaitrise,
] as const;
