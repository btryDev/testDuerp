import { StyleSheet } from "@react-pdf/renderer";

/**
 * Styles PDF partagés entre tous les documents générés par la plateforme
 * (DUERP, plan d'actions, registre, dossier de conformité). L'objectif
 * est d'avoir une identité visuelle cohérente et de centraliser les
 * constantes (tailles, couleurs) pour éviter la dérive.
 */

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

export function formatDateCourte(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateLongue(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function slugifyFilename(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_");
}
