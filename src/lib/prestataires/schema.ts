import { z } from "zod";
import { DomainePrestataire } from "@prisma/client";

/**
 * Schéma de validation d'un prestataire.
 *
 * Les champs de vigilance (URSSAF / RC Pro / Kbis) sont optionnels — un
 * prestataire peut être ajouté à l'annuaire en deux temps (création rapide
 * puis complétion des pièces quand on les reçoit).
 *
 * La matérialisation de l'obligation L8222-1 passe par `vigilance.ts`.
 */

const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;
const SIRET_FMT = /^\d{14}$/;
const TEL_FMT = /^[\d\s+.()-]{6,25}$/;

export const DOMAINES_PRESTATAIRE = [
  "electricite",
  "incendie",
  "ascenseur",
  "porte_automatique",
  "ventilation_vmc",
  "cuisson_hotte",
  "equipement_pression",
  "levage",
  "stockage_dangereux",
  "carnet_sanitaire",
  "bureau_controle",
  "entretien_general",
  "travaux_btp",
  "nettoyage",
  "autre",
] as const satisfies readonly DomainePrestataire[];

export const LABEL_DOMAINE: Record<DomainePrestataire, string> = {
  electricite: "Électricité",
  incendie: "Sécurité incendie",
  ascenseur: "Ascenseurs",
  porte_automatique: "Portes & portails automatiques",
  ventilation_vmc: "Ventilation / VMC",
  cuisson_hotte: "Cuisson & hottes",
  equipement_pression: "Équipements sous pression",
  levage: "Levage",
  stockage_dangereux: "Stockage matières dangereuses",
  carnet_sanitaire: "Carnet sanitaire (eau)",
  bureau_controle: "Bureau de contrôle",
  entretien_general: "Entretien général",
  travaux_btp: "Travaux BTP",
  nettoyage: "Nettoyage",
  autre: "Autre",
};

const optionalTrimmed = (max = 200) =>
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

export const prestataireSchema = z.object({
  raisonSociale: z
    .string()
    .trim()
    .min(1, "Raison sociale requise")
    .max(200, "Raison sociale trop longue"),
  siret: z.preprocess(
    (v) => (typeof v === "string" ? v.replace(/\s/g, "") || undefined : v),
    z
      .string()
      .regex(SIRET_FMT, "SIRET : 14 chiffres attendus")
      .optional(),
  ),
  estOrganismeAgree: z.coerce.boolean().optional().default(false),
  domaines: z
    .array(z.enum(DOMAINES_PRESTATAIRE))
    .default([])
    .transform((d) => Array.from(new Set(d))),

  contactNom: z
    .string()
    .trim()
    .min(1, "Nom du contact requis")
    .max(200),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email invalide")
    .max(200),
  contactTelephone: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z
      .string()
      .regex(TEL_FMT, "Téléphone invalide")
      .optional(),
  ),

  attestationUrssafValableJusquA: optionalDate,
  assuranceRcProValableJusquA: optionalDate,
  kbisDateEmission: optionalDate,

  notesInternes: optionalTrimmed(1000),
});

export type PrestataireInput = z.infer<typeof prestataireSchema>;
