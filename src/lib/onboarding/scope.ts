/**
 * Le code NAF a-t-il un référentiel sectoriel de DUERP ?
 *
 * Trois secteurs sont instruits : restauration (56.xx), commerce de détail
 * (47.xx), bureau/tertiaire (62-74, 78, 82). Ailleurs, il n'y a pas d'unités
 * de travail ni de risques types à pré-charger.
 *
 * ## Ce n'était pas la bonne question, et ça fermait la porte
 *
 * Cette fonction a longtemps décidé si l'onboarding pouvait aboutir. Elle
 * refusait la création d'un dossier hors des trois secteurs, au motif que
 * « le DUERP produit ne serait pas fiable ».
 *
 * Le raisonnement mélangeait deux choses que le produit sépare partout
 * ailleurs. Le référentiel de **conformité** — 84 obligations opposables,
 * échéances, registre de sécurité — ne lit **jamais** le code NAF : il se
 * déclenche sur les équipements déclarés et sur la typologie
 * (`lib/matching/engine.ts`). Un hôtelier qui voulait seulement tenir son
 * registre et ses échéances d'ascenseur — ce que le produit sait faire — se
 * faisait refuser pour une cotation de risques qu'il n'avait pas demandée.
 * La partie molle verrouillait l'accès à la partie dure.
 *
 * Et il n'existe **aucune** référence réglementaire du document unique par
 * secteur : `L. 4121-3` et `R. 4121-1` disent « évaluez les risques » sans
 * nommer ni secteur, ni unité de travail, ni liste. Un secteur manque au
 * produit quand l'INRS n'a pas publié son guide — c'est une limite
 * éditoriale, pas juridique. Refuser au nom du droit était donc faux au fond,
 * et pas seulement trop strict.
 *
 * ## Ce qu'elle décide maintenant : rien
 *
 * Elle **constate**, elle ne barre plus. Aucun de ses états n'empêche la
 * création d'un dossier ; ils choisissent la phrase que l'écran affiche, et
 * l'absence de référentiel se dit alors au lieu de fermer la porte.
 *
 * Ouvrir sans déclarer serait pire que refuser : `sans_referentiel` doit donc
 * toujours se lire **avec** le socle de couverture
 * (`lib/perimetre/couverture.ts`, axe `secteur_duerp`), qui reprend le constat
 * en permanence sur le dossier — pas seulement au moment de la saisie.
 *
 * La source de vérité reste `trouverReferentielParNaf` (lib/referentiels) ; on
 * se contente de nommer la famille d'activité quand on sait la nommer.
 */

import { trouverReferentielParNaf } from "@/lib/referentiels";

const NAF_REGEX = /^(\d{2})\.?\d{2}[A-Z]?$/;

// Familles pour lesquelles aucun référentiel sectoriel n'est instruit —
// permet de nommer l'activité à l'utilisateur plutôt que de lui servir un
// « non couvert » anonyme. Clé = division NAF à 2 chiffres.
//
// Cette table ne décide de rien : elle ne sert qu'à écrire une phrase. Une
// division absente donne la même issue, avec une phrase plus générale.
const SANS_REFERENTIEL_NOMME: Record<string, string> = {
  "01": "agriculture",
  "02": "sylviculture",
  "03": "pêche",
  "05": "industries extractives",
  "06": "industries extractives",
  "07": "industries extractives",
  "08": "industries extractives",
  "09": "industries extractives",
  "10": "industrie agro-alimentaire",
  "11": "industrie des boissons",
  "12": "industrie du tabac",
  "13": "industrie textile",
  "14": "industrie de l'habillement",
  "15": "industrie du cuir",
  "16": "industrie du bois",
  "17": "industrie du papier",
  "18": "imprimerie",
  "19": "cokéfaction, raffinage",
  "20": "industrie chimique",
  "21": "industrie pharmaceutique",
  "22": "plasturgie, caoutchouc",
  "23": "métallurgie, verre, céramique",
  "24": "métallurgie",
  "25": "travail des métaux",
  "26": "électronique, informatique (fabrication)",
  "27": "fabrication électrique",
  "28": "fabrication de machines",
  "29": "industrie automobile",
  "30": "fabrication de transports",
  "31": "fabrication de meubles",
  "32": "autres industries",
  "33": "réparation industrielle",
  "35": "énergie",
  "36": "eau",
  "37": "assainissement",
  "38": "déchets",
  "39": "dépollution",
  "41": "construction",
  "42": "génie civil",
  "43": "travaux de construction spécialisés (BTP)",
  "49": "transport terrestre",
  "50": "transport maritime",
  "51": "transport aérien",
  "52": "logistique",
  "53": "poste, courrier",
  "55": "hébergement (hôtellerie)",
  "84": "administration publique",
  "85": "enseignement",
  "86": "santé",
  "87": "hébergement médico-social",
  "88": "action sociale",
  "90": "arts et spectacle",
  "91": "bibliothèques, musées",
  "92": "jeux de hasard",
  "93": "sports, loisirs",
};

export type ScopeResult =
  /** Un référentiel sectoriel couvre ce code : le DUERP sera pré-rempli. */
  | { status: "ok"; secteurId: string; secteurNom: string }
  /** Le code saisi n'a pas la forme d'un code NAF. Le seul état qui empêche
   *  encore d'avancer — mais c'est une erreur de saisie, pas un refus de
   *  périmètre. */
  | { status: "format_invalide" }
  | {
      /**
       * Aucun référentiel sectoriel n'est instruit pour ce code.
       *
       * **Ne bloque rien.** Le dossier se crée, le référentiel de conformité
       * fonctionne normalement — il ne lit pas le NAF —, et c'est le document
       * unique, et lui seul, qui partira sans base pré-chargée. Les deux
       * champs ci-dessous sont des phrases à afficher, jamais un motif de
       * refus.
       */
      status: "sans_referentiel";
      /** Le fait, en une phrase : ce que le produit n'a pas pour ce code. */
      constat: string;
      /** Ce que ça change concrètement pour le dossier — et ce que ça ne
       *  change pas. */
      consequence: string;
    };

export function evaluerScopeSecteur(codeNaf: string): ScopeResult {
  const naf = codeNaf.trim().toUpperCase();
  const m = NAF_REGEX.exec(naf);
  if (!m) return { status: "format_invalide" };

  const ref = trouverReferentielParNaf(naf);
  if (ref) {
    return {
      status: "ok",
      secteurId: ref.id,
      secteurNom: ref.nom,
    };
  }

  const division = m[1];
  const familleNommee = SANS_REFERENTIEL_NOMME[division];
  return {
    status: "sans_referentiel",
    constat: familleNommee
      ? `Votre activité relève de ${familleNommee}. Aucun référentiel de risques types n'est encore instruit pour ce secteur.`
      : "Aucun référentiel de risques types n'est encore instruit pour ce code d'activité.",
    consequence:
      "Vous pouvez créer votre dossier : le suivi des obligations, le calendrier des vérifications et le registre de sécurité ne dépendent pas de votre code d'activité — ils se déclenchent sur vos équipements et sur votre typologie d'établissement. Seul le document unique démarrera sans unités de travail ni risques pré-remplis : vous choisirez le secteur le plus proche, ou vous les saisirez vous-même. Votre dossier indiquera en permanence que ce point n'est pas couvert.",
  };
}
