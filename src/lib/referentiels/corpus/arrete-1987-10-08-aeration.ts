// Corpus : arrêté du 8 octobre 1987 — contrôle périodique des installations d'aération.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_1987_10_08_AERATION: Corpus = {
  id: "arrete-1987-10-08-aeration",
  intitule:
    "Arrêté du 8 octobre 1987 — contrôle périodique des installations d'aération",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000863044/",
  etendue: "articles_cites",
  portee:
    "Pris pour R. 4222-20. L'article 4 fixe le contrôle annuel des locaux à pollution spécifique, et un contrôle semestriel supplémentaire lorsqu'il existe un système de recyclage.",
  articles: [
    {
      ref: "Arrêté 1987-10-08 art. 3",
      intitule: "Locaux à pollution non spécifique",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000863044/",
      versionEnVigueur: "1988-04-01",
      luLe: "2026-08-27",
      lecture: "premiere_main",
      prescrit:
        "Deux temps. Le 1 fixe ce que le dossier de valeurs de référence doit contenir pour les locaux à pollution NON spécifique. Le 2 porte l'ANNUELLE — quatre opérations, dont le contrôle du débit global minimal d'air neuf —, dont les résultats vont au dossier de maintenance de l'article 2 (b). Aucun réalisateur n'est désigné.",
      citationCle:
        "Au minimum une fois par an, les opérations suivantes doivent être effectuées et leurs résultats portés sur le dossier de maintenance mentionné à l'article 2 (b) : contrôle du débit global minimal d'air neuf de l'installation ; examen de l'état des éléments de l'installation (système d'introduction et d'extraction, gaines, ventilateurs) […] ; examen de l'état des systèmes de traitement de l'air (humidificateur, batterie d'échangeurs) ; lorsque le dossier de valeurs de référence est constitué, contrôle des pressions statiques ou des vitesses d'air aux points caractéristiques de l'installation.",
      statut: "retenu",
      obligations: [
        "aeration-travail-mise-en-service",
        // Le rythme annuel de l'obligation portée par l'établissement vient
        // de cet article : R. 4222-20 dit « régulièrement » sans chiffre.
        "aeration-controle-installations-r4222-20",
      ],
      reserve:
        "LE MOIS N'EST PAS DANS CET ARTICLE, relevé le 2026-09-01. `aeration-travail-mise-en-service` décrit un contrôle « au plus tard un mois après la mise en service » et s'ancre sur l'article 3 ; or ce délai est à l'ARTICLE 2 a), et il ne porte pas sur un contrôle mais sur l'établissement du DOSSIER DE VALEURS DE RÉFÉRENCE : « Ce dossier doit être établi, au plus tard, un mois après la première mise en service des installations. » L'article 2 n'est ni cité au corpus ni ancré comme `article` sur l'obligation — la référence le nomme (« art. 2, 3 et 4 ») mais l'ancre de veille pointe l'article 3.\n\nDeux autres choses tenues par l'article 2 et encodées nulle part : il rend le chef d'établissement responsable de TENIR À JOUR ce dossier et de le tenir à disposition de l'inspection du travail, des services de prévention et du CHSCT ; et son b) désigne « la consigne d'utilisation prescrite par l'article R. 232-5-9 du code du travail » — numérotation d'avant la recodification de 2008, aujourd'hui R. 4222-21. C'est le même écrit que celui relevé sous R. 4222-21, vu par l'autre bout.",
    },
    {
      ref: "Arrêté 1987-10-08 art. 4",
      intitule: "Locaux à pollution spécifique",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000863044/",
      versionEnVigueur: "1988-04-01",
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      citationCle:
        "2. Les opérations périodiques suivantes doivent être effectuées et leurs résultats portés sur le dossier de maintenance mentionné à l'article 2 (b) : a) Au minimum tous les ans : - contrôle du débit global d'air extrait par l'installation ; - contrôle des pressions statiques ou des vitesses aux points caractéristiques de l'installation, notamment au niveau des systèmes de captage ; - examen de l'état de tous les éléments de l'installation (système de captage, gaines, dépoussiéreurs, épurateurs, systèmes d'apport d'air de compensation...). b) Au minimum tous les six mois lorsqu'il existe un système de recyclage : - contrôle de la concentration en poussières sans effet spécifique ou en autres polluants dans les gaines de recyclage ou à leur sortie dans un écoulement canalisé ; - contrôle de tous les systèmes de surveillance mis en oeuvre.",
      statut: "retenu",
      obligations: [
        "aeration-travail-locaux-pollution-specifique",
        "stockage-dangereux-ventilation-locaux",
      ],
      prescrit:
        "RYTHME NON PORTÉ, relevé le 2026-08-27. Le b) impose « au minimum tous les six mois lorsqu'il existe un système de recyclage » le contrôle de la concentration en poussières ou autres polluants dans les gaines de recyclage, et de tous les systèmes de surveillance. Il S'AJOUTE à l'annuel du a) et porte sur des objets DIFFÉRENTS — l'un les débits et l'état, l'autre les concentrations. Non encodé : la présence d'un système de recyclage est un attribut d'équipement que le modèle n'a pas.",
    },
  ],
};
