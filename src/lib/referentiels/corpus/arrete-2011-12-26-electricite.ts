// Corpus : arrêté du 26 décembre 2011 — vérifications des installations électriques.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETE_2011_12_26_ELECTRICITE: Corpus = {
  id: "arrete-2011-12-26-electricite",
  intitule:
    "Arrêté du 26 décembre 2011 — vérifications des installations électriques",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025046978/",
  etendue: "articles_cites",
  portee:
    "Pris pour R. 4226-14 et R. 4226-16. L'article 2 régit la vérification initiale, l'article 3 la vérification périodique et la faculté de porter le délai à deux ans. Version initiale, jamais modifiée.",
  articles: [
  {
    ref: "Arrêté 2011-12-26 art. 2",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-mise-en-service"],
  },
  {
    ref: "Arrêté 2011-12-26 art. 3",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["elec-travail-periodique-annuelle"],
  },
  {
    ref: "Arrêté 2011-12-26 annexe II",
    intitule:
      "Contenu des rapports de vérification et éléments de traçabilité",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: ["elec-travail-rapport-quadriennal"],
    citationCle:
      "« 3.5. Mise à jour des renseignements descriptifs. Une mise à jour complète de l'ensemble des renseignements descriptifs doit être effectuée tous les quatre ans ; elle donnera lieu à un rapport, dit \"quadriennal\", rédigé comme un rapport de visite initiale. »",
    prescrit:
      "Fixe le contenu des rapports, et au point 3.5 une PÉRIODICITÉ que le référentiel ignorait : le rapport quadriennal. C'est ce qui empêche la vérification périodique de dériver — les rapports périodiques ne consignent que les non-conformités, sur la foi d'un descriptif établi une fois. Le point 4 impose en outre à l'organisme de conserver, à chaque vérification périodique, la liste des appareils, circuits et dispositifs différentiels vérifiés : obligation pesant sur le vérificateur, pas sur l'exploitant, donc hors du calendrier.",
  },
  {
    ref: "Arrêté 2011-12-26 annexe I",
    intitule: "Méthodes et étendue des vérifications",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "sans_objet",
    motif:
      "Décrit COMMENT vérifier, jamais QUAND : méthodes d'examen, échantillonnage des prises de courant et des appareils d'éclairage, essais des dispositifs différentiels, tableau de choix des méthodes. Aucune périodicité propre. Le seul rythme qu'elle porte est un rythme d'échantillonnage — « la totalité des prises de courant des locaux de bureaux soit vérifiée au bout de deux vérifications périodiques et la totalité des appareils d'éclairage fixes au bout de trois » —, qui décrit l'étendue d'un contrôle déjà daté par ailleurs et ne crée pas d'échéance.",
  },
  {
    ref: "Arrêté 2011-12-26 annexe IV",
    intitule: "Processus de vérification des installations électriques temporaires",
    versionEnVigueur: "2011-12-30",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "hors_perimetre",
    exclusion: "risque_specialise",
    motif:
      "Porte de vraies périodicités — vérification annuelle sur les chantiers de longue durée (2.3), vérification biennale d'au moins 25 % des tableaux sur les chantiers navals (3.4), examen visuel QUOTIDIEN des matériels sur les bancs de marchés forains (5) —, mais toutes sur des installations TEMPORAIRES : chantiers du BTP, chantiers navals, stands d'exposition, fêtes foraines, événementiel. Le produit s'adresse à des établissements fixes et ne modélise aucune installation temporaire. L'annexe III, qui liste les éléments d'information dus au vérificateur, ne porte aucune périodicité.",
  },
  ],
};
