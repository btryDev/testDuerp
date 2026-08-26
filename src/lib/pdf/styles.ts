import { StyleSheet } from "@react-pdf/renderer";
import { formaterDateFr, formaterDateLongueFr } from "@/lib/dates";

/**
 * Styles PDF partagés entre tous les documents générés par la plateforme
 * (DUERP, plan d'actions, registre, dossier de conformité). L'objectif
 * est d'avoir une identité visuelle cohérente et de centraliser les
 * constantes (tailles, couleurs) pour éviter la dérive.
 */

/**
 * La charte de l'application, portée dans les documents imprimés.
 *
 * Ce sont les jetons `--board-*` de `globals.css`, recopiés en littéral parce
 * qu'un PDF ne lit pas de CSS. Toute valeur ajoutée ici doit exister là-bas :
 * c'est la même identité des deux côtés, et un document qui s'en écarte se
 * lit comme s'il venait d'un autre logiciel.
 *
 * Le registre s'y aligne aujourd'hui ; les trois autres PDF (DUERP, plan
 * d'actions, dossier de conformité) restent sur la palette neutre en
 * attendant qu'on décide de les aligner aussi.
 */
export const BOARD = {
  encre: "#0a0a0a",
  carte: "#ffffff",
  canevas: "#f6f9fb",
  /** Bleus — la famille d'accent du board. */
  cielPale: "#d8eef9",
  cielDoux: "#a9d3ec",
  bleuEncre: "#376881",
  /** Ardoises — structure, filets, texte secondaire. */
  ardoisePale: "#edf2f5",
  ardoiseFilet: "#dfe8ee",
  ardoise: "#b5d1e3",
  ardoiseDouce: "#5c7182",
  ardoiseMoyenne: "#4d5d6b",
  ardoiseEncre: "#304148",
  /** États — mêmes champs et mêmes encres que `CHAMP_ETAT` / `ENCRE_ETAT`. */
  vert: "#bdfdb5",
  vertEncre: "#216037",
  ambreEncre: "#754d0a",
  signalEncre: "#8a2a23",
} as const;


export const stylesCommuns = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: BOARD.encre,
    lineHeight: 1.4,
  },
  pageGarde: {
    padding: 60,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: BOARD.encre,
  },
  h1: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  h3: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 4,
  },
  small: { fontSize: 8, color: BOARD.ardoiseMoyenne },
  metaLigne: {
    fontSize: 9,
    color: BOARD.ardoiseMoyenne,
    marginBottom: 2,
  },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BOARD.ardoiseDouce,
    paddingVertical: 4,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BOARD.ardoiseFilet,
    paddingVertical: 4,
  },
  th: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  td: { fontSize: 9 },
  badge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    color: BOARD.encre,
    backgroundColor: BOARD.ardoisePale,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#777",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: BOARD.ardoiseFilet,
    paddingTop: 6,
  },
  mentionsLegalesBloc: {
    marginTop: 16,
    padding: 10,
    borderWidth: 0.5,
    borderColor: BOARD.ardoiseFilet,
    backgroundColor: "#fafafa",
    fontSize: 8.5,
    lineHeight: 1.5,
  },
});

/**
 * Dates imprimées dans les PDF. Elles délèguent aux formateurs de
 * `@/lib/dates`, qui épinglent `Europe/Paris`.
 *
 * `toLocaleDateString("fr-FR")` sans `timeZone` prend le fuseau du process :
 * un serveur en UTC imprimait « 31/12/2025 » sur une échéance stockée au
 * 1er janvier 2026 à minuit… c'est-à-dire une date fausse dans un document
 * remis à un tiers.
 */
export function formatDateCourte(d: Date | null | undefined): string {
  if (!d) return "—";
  return formaterDateFr(d);
}

export function formatDateLongue(d: Date | null | undefined): string {
  if (!d) return "—";
  return formaterDateLongueFr(d);
}

export function slugifyFilename(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
}
