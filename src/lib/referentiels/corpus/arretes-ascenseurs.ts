// Corpus : arrêtés du 18 novembre 2004 et du 7 août 2012 — entretien et contrôles techniques des ascenseurs.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const ARRETES_ASCENSEURS: Corpus = {
  id: "arretes-ascenseurs",
  intitule:
    "Arrêtés du 18 novembre 2004 et du 7 août 2012 — entretien et contrôles techniques des ascenseurs",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
  etendue: "articles_cites",
  portee:
    "ATTENTION : les deux arrêtés ont été modifiés par l'arrêté du 4 mars 2026, en vigueur les 1er avril et 15 mai 2026. L'annexe de l'arrêté de 2004, sur laquelle reposent deux obligations, a changé et n'a pas pu être relue de façon fiable.",
  articles: [
  {
    ref: "Arrêté 2004-11-18",
    intitule:
      "Entretien des installations d'ascenseurs — annexe : opérations minimales et fréquences",
    versionEnVigueur: "2026-04-01",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "retenu",
    obligations: [
      "ascenseur-entretien-contrat",
      "ascenseur-examen-annuel-securite",
      "ascenseur-examen-semestriel-secours",
    ],
    citationCle:
      "Annexe, trois colonnes : « INTERVALLE maximum de six semaines » / « FRÉQUENCE minimale semestrielle » / « FRÉQUENCE minimale annuelle ». « Nota. - Pour les lignes non cochées, la fréquence est laissée à l'appréciation des contractants. »",
    prescrit:
      "Dix-huit lignes cochées sur les trente-six du tableau. SEMESTRIEL (3) : frein ; câbles ou chaînes de suspension et leurs extrémités ; dispositif antidérive. ANNUEL (6) : cuvette, toit de cabine et local des machines (propreté, éclairage) ; poulie de traction ; limiteurs de vitesse et poulie de tension ; parachute et dispositifs antichute ; dispositifs hors course de sécurité ; pompe à main ou soupape de descente à commande manuelle. SIX SEMAINES (9) : cabine ; verrouillages et contacts de fermeture des baies palières ; dispositif anti-vandalisme des baies palières ; verrouillages et contacts de fermeture de la porte de cabine ; efficacité du dispositif de réouverture ; précision d'arrêt et de nivelage au palier ; moyens d'alerte et de communication avec le service d'intervention ; commandes et indicateurs aux paliers ; cuve hydraulique (niveau, fuites). Le tableau a été relevé sur capture d'écran le 2026-08-26 : sa conversion en texte perd la position des croix et l'avait rendu illisible à quatre reprises.",
  },
  {
    ref: "Arrêté 2004-11-18 annexe — colonne « six semaines »",
    intitule: "Les neuf lignes à intervalle maximum de six semaines",
    versionEnVigueur: "2026-04-01",
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "non_couvert",
    motif:
      "Neuf lignes du tableau relèvent d'un « INTERVALLE maximum de six semaines » — c'est la visite de base de l'ascenseur, celle qui vérifie les verrouillages de portes, la précision de nivelage et les moyens d'alerte permettant de parler à quelqu'un depuis une cabine bloquée. Aucune obligation ne la porte : `ascenseur-entretien-contrat` la mentionne en prose et vaut `periodicite: \"autre\"`, si bien qu'elle ne produit AUCUNE échéance. L'énumération `Periodicite` ne descend pas à six semaines (42 jours) — la valeur manque, comme `bimensuelle` manquait avant le 2026-08-26. L'ajouter suppose une migration de l'enum Postgres, décision non prise à ce jour.",
    declareA: "docs/veille-arbitrage-2026-08-26.md",
  },
  {
    ref: "Arrêté 2012-08-07",
    versionEnVigueur: "2026-05-15",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["ascenseur-controle-technique-quinquennal"],
  },
  ],
};
