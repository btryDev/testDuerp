import { z } from "zod";

/**
 * Plan de prévention — art. R4512-6 à R4512-12 CT (décret 92-158).
 *
 * Le diagnostic initial aide le dirigeant à savoir s'il doit établir un
 * plan ÉCRIT (obligatoire) ou juste oral. Les critères du décret :
 *
 *   - Durée totale > 400 h sur 12 mois : écrit obligatoire
 *   - Travaux sur liste dangereuse (arrêté 19-03-1993) : écrit obligatoire
 *     indépendamment de la durée
 *
 * En dessous, l'analyse et les mesures restent obligatoires mais peuvent
 * être simplement consignées oralement à l'inspection commune.
 */

const DATETIME_FMT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const DATE_FMT = /^\d{4}-\d{2}-\d{2}$/;
const SIRET_FMT = /^\d{14}$/;

const optionalTrimmed = (max = 2000) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() || undefined : v),
    z.string().max(max).optional(),
  );

const dateFromDatetime = z
  .string()
  .regex(DATETIME_FMT, "Format attendu : AAAA-MM-JJTHH:MM")
  .transform((v) => new Date(v));

const dateFromDate = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z
    .string()
    .regex(DATE_FMT, "Format attendu : AAAA-MM-JJ")
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
);

export const ligneSchema = z.object({
  risque: z.string().trim().min(3, "Décrire le risque").max(500),
  mesureEntrepriseUtilisatrice: optionalTrimmed(500),
  mesureEntrepriseExterieure: optionalTrimmed(500),
});

export type LigneInput = z.infer<typeof ligneSchema>;

export const planPreventionSchema = z
  .object({
    prestataireId: z.preprocess(
      (v) => (typeof v === "string" && v.trim() ? v : undefined),
      z.string().optional(),
    ),
    entrepriseExterieureRaison: z
      .string()
      .trim()
      .min(1, "Raison sociale requise")
      .max(200),
    entrepriseExterieureSiret: z.preprocess(
      (v) => (typeof v === "string" ? v.replace(/\s/g, "") || undefined : v),
      z.string().regex(SIRET_FMT, "SIRET : 14 chiffres attendus").optional(),
    ),
    efChefNom: z.string().trim().min(1).max(200),
    efChefEmail: z.string().trim().toLowerCase().email().max(200),
    efEffectifIntervenant: z.coerce.number().int().min(1).max(9999),

    euChefNom: z.string().trim().min(1).max(200),
    euChefFonction: optionalTrimmed(120),

    dateDebut: dateFromDatetime,
    dateFin: dateFromDatetime,
    dureeHeuresEstimee: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce.number().int().min(1).max(99999).optional(),
    ),
    lieux: z.string().trim().min(1).max(1000),
    naturesTravaux: z.string().trim().min(10).max(4000),
    travauxDangereux: z.coerce.boolean().optional().default(false),

    inspectionDate: dateFromDate,
    inspectionParticipants: optionalTrimmed(2000),

    lignes: z
      .array(ligneSchema)
      .min(1, "Ajoutez au moins un risque identifié"),
  })
  .refine((v) => v.dateFin > v.dateDebut, {
    message: "La date de fin doit être après la date de début",
    path: ["dateFin"],
  });

export type PlanPreventionInput = z.infer<typeof planPreventionSchema>;

/**
 * Diagnostic pédagogique — détermine si le plan écrit est exigé et produit
 * un message humain à afficher dans l'UI.
 */
export type ResultatDiagnostic = {
  ecritObligatoire: boolean;
  raisons: string[];
  recommandation: string;
};

export function diagnostiquerPlan(params: {
  dureeHeuresEstimee: number | null;
  travauxDangereux: boolean;
}): ResultatDiagnostic {
  const raisons: string[] = [];
  const seuil400 = params.dureeHeuresEstimee !== null && params.dureeHeuresEstimee > 400;
  if (seuil400) {
    raisons.push(
      `Les travaux dépassent 400 h sur 12 mois (seuil art. R4512-7)`,
    );
  }
  if (params.travauxDangereux) {
    raisons.push(
      `Les travaux figurent sur la liste dangereuse (arrêté 19-03-1993)`,
    );
  }
  const ecritObligatoire = seuil400 || params.travauxDangereux;
  return {
    ecritObligatoire,
    raisons,
    recommandation: ecritObligatoire
      ? "Un plan de prévention ÉCRIT est obligatoire avant démarrage des travaux."
      : "Un plan écrit n'est pas strictement exigé, mais fortement recommandé — il protège les deux parties en cas de litige et sert de preuve de l'analyse de risques conjointe.",
  };
}
