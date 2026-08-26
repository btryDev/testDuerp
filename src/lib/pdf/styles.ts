import { StyleSheet } from "@react-pdf/renderer";
import { formaterDateFr, formaterDateLongueFr } from "@/lib/dates";

/**
 * Styles PDF partagés entre tous les documents générés par la plateforme
 * (DUERP, plan d'actions, registre, dossier de conformité). L'objectif
 * est d'avoir une identité visuelle cohérente et de centraliser les
 * constantes (tailles, couleurs) pour éviter la dérive.
 */

/**
 * La palette du registre de sécurité imprimé de btry, relevée sur le document
 * de référence (`Registre_Securite_Incendie_btry.pdf`).
 *
 * Elle n'est pas une invention : c'est celle des documents que le dirigeant
 * a déjà entre les mains. Un export qui en sort ressemble à un rapport
 * d'outil, pas à la pièce qu'il range dans son classeur.
 *
 * Le registre s'y aligne aujourd'hui ; les autres documents (DUERP, plan
 * d'actions, dossier de conformité) restent sur la palette neutre en
 * attendant qu'on décide de les aligner aussi — c'est une question
 * d'identité, pas de code.
 */
export const MARQUE = {
  marine: "#002768",
  marineClair: "#183b76",
  vert: "#07df9e",
  vertPale: "#dcfaf0",
  ardoise: "#8c9dba",
  filet: "#e0e4ec",
} as const;

export const COULEURS = {
  ink: "#111",
  texteSecondaire: "#555",
  filet: "#ccc",
  filetFort: "#333",
  fondBadge: "#eee",
  rose: "#b91c1c",
  ambre: "#b45309",
  vert: "#047857",
} as const;

export const stylesCommuns = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COULEURS.ink,
    lineHeight: 1.4,
  },
  pageGarde: {
    padding: 60,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: COULEURS.ink,
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
  small: { fontSize: 8, color: COULEURS.texteSecondaire },
  metaLigne: {
    fontSize: 9,
    color: COULEURS.texteSecondaire,
    marginBottom: 2,
  },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.filetFort,
    paddingVertical: 4,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COULEURS.filet,
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
    color: COULEURS.ink,
    backgroundColor: COULEURS.fondBadge,
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
    borderTopColor: COULEURS.filet,
    paddingTop: 6,
  },
  mentionsLegalesBloc: {
    marginTop: 16,
    padding: 10,
    borderWidth: 0.5,
    borderColor: COULEURS.filet,
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
