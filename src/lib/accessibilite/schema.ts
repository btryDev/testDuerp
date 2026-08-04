import { z } from "zod";
import {
  HandicapAccessible,
  RegimeConformiteErp,
} from "@prisma/client";

/**
 * Validation du registre d'accessibilité ERP.
 *
 * Les 4 sections correspondent au contenu imposé par l'arrêté du
 * 19 avril 2017 (NOR: LHAL1702706A, publié au JO) pris en application
 * de l'article D111-19-33 du Code de la construction et de l'habitation :
 *
 *   1. Informations sur les prestations fournies par l'ERP
 *   2. Liste des pièces administratives et techniques (attestation
 *      d'accessibilité, Ad'AP, arrêté préfectoral de dérogation…)
 *   3. Description des actions de formation du personnel d'accueil
 *   4. Modalités de maintenance des équipements d'accessibilité
 *
 * Chaque section peut être remplie en plusieurs passes : la validation
 * en base tolère les champs partiels tant que le registre n'est pas
 * « publié ». À la publication, un check plus strict applique les règles
 * de l'arrêté (cf. `schemaPublication`).
 */

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;

const optionalTrimmed = (max = 2000) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(max).optional(),
  );

const optionalDate = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z
    .string()
    .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
);

export const HANDICAPS = [
  "moteur",
  "visuel",
  "auditif",
  "mental",
  "cognitif",
  "psychique",
] as const satisfies readonly HandicapAccessible[];

export const REGIMES = [
  "conforme_origine",
  "conforme_apres_travaux",
  "derogation_accordee",
  "adap_en_cours",
  "non_conforme_sans_adap",
] as const satisfies readonly RegimeConformiteErp[];

export const LABEL_HANDICAP: Record<HandicapAccessible, string> = {
  moteur: "Handicap moteur",
  visuel: "Handicap visuel",
  auditif: "Handicap auditif",
  mental: "Handicap mental",
  cognitif: "Handicap cognitif",
  psychique: "Handicap psychique",
};

export const LABEL_REGIME: Record<RegimeConformiteErp, string> = {
  conforme_origine: "Conforme dès la construction",
  conforme_apres_travaux: "Mis en conformité après travaux",
  derogation_accordee: "Dérogation préfectorale accordée",
  adap_en_cours: "Agenda d'accessibilité programmée (Ad'AP) en cours",
  non_conforme_sans_adap: "Hors conformité — aucun Ad'AP actif",
};

/** Schéma pour chaque section (tolérant, utilisable en draft). */
export const section1Schema = z.object({
  prestationsFournies: optionalTrimmed(4000),
  handicapsAccueillis: z
    .array(z.enum(HANDICAPS))
    .default([])
    .transform((a) => Array.from(new Set(a))),
  servicesAdaptes: optionalTrimmed(4000),
});

export const section2Schema = z.object({
  conformiteRegime: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(REGIMES).optional(),
  ),
  dateConformite: optionalDate,
  numeroAttestationAccess: optionalTrimmed(120),
  dateDepotAdap: optionalDate,
});

export const section3Schema = z.object({
  personnelForme: z.coerce.boolean().optional().default(false),
  dateDerniereFormation: optionalDate,
  organismeFormation: optionalTrimmed(200),
  effectifForme: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(0).max(99999).optional(),
  ),
});

export const section4Schema = z.object({
  equipementsAccessibilite: optionalTrimmed(4000),
  modalitesMaintenance: optionalTrimmed(4000),
  dernierControleMaintenance: optionalDate,
});

export type Section1Input = z.infer<typeof section1Schema>;
export type Section2Input = z.infer<typeof section2Schema>;
export type Section3Input = z.infer<typeof section3Schema>;
export type Section4Input = z.infer<typeof section4Schema>;

/**
 * Génère un slug public stable depuis la raison sociale.
 * Utilisé pour l'URL publique + QR code.
 */
export function genererSlug(raison: string, siret: string | null): string {
  const base = raison
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const suffix = siret ? siret.slice(-6) : Math.random().toString(36).slice(2, 8);
  return `${base || "etablissement"}-${suffix}`;
}
