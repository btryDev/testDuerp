/**
 * Filtrage du périmètre V2 (cf. .claude/CLAUDE.md — section Périmètre du MVP V2).
 *
 * La plateforme ne couvre que 3 secteurs : restauration (56.xx), commerce
 * de détail (47.xx), bureau/tertiaire (62-74, 78, 82). Hors de ces
 * familles, le référentiel sectoriel est vide, la cotation DUERP n'est
 * pas pré-remplie, les obligations de vérification ne sont pas
 * exhaustives — le document généré serait trompeur sur un document à
 * valeur légale. On refuse donc l'onboarding dans les autres secteurs.
 *
 * Cette fonction reste volontairement simple : la source de vérité est
 * `trouverReferentielParNaf` (lib/referentiels). On se contente
 * d'enrichir pour l'UX avec la raison du refus quand on peut la nommer.
 */

import { trouverReferentielParNaf } from "@/lib/referentiels";

const NAF_REGEX = /^(\d{2})\.?\d{2}[A-Z]?$/;

// Familles explicitement hors périmètre V2 d'après CLAUDE.md — permet
// de fournir une explication ciblée à l'utilisateur plutôt qu'un simple
// « non couvert ». Clé = division NAF à 2 chiffres.
const HORS_PERIMETRE_NOMME: Record<string, string> = {
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
  | { status: "ok"; secteurId: string; secteurNom: string }
  | { status: "format_invalide" }
  | {
      status: "hors_perimetre";
      raison: string;
      exemple: string;
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
  const familleNommee = HORS_PERIMETRE_NOMME[division];
  return {
    status: "hors_perimetre",
    raison: familleNommee
      ? `Votre activité relève de ${familleNommee}, un secteur non couvert par la plateforme actuellement.`
      : "Votre activité ne correspond pas aux secteurs couverts par la plateforme actuellement.",
    exemple:
      "La V2 couvre uniquement la restauration, le commerce de détail et les activités de bureau/tertiaire. Pour d'autres secteurs (BTP, industrie, santé, chimie, transport, etc.), la plateforme ne propose pas les obligations réglementaires spécifiques à votre activité et ne peut pas produire un DUERP fiable.",
  };
}
