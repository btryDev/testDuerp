"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { construireSnapshot } from "./snapshot-builder";

export type VersionActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; numero: number };

/**
 * Motifs de mise à jour normalisés (art. R. 4121-2) + libellé pour le PDF.
 * L'ordre reflète ceux listés par le Code du travail.
 */
export const MOTIFS_VERSION = {
  annuelle: "Mise à jour annuelle (art. R. 4121-2)",
  amenagement:
    "Aménagement important (nouveau poste, nouvel équipement, nouveaux locaux)",
  accident: "Accident du travail ou maladie professionnelle",
  nouvelle_info:
    "Nouvelle information portée à la connaissance de l'employeur",
  autre: "Autre",
} as const;

export type MotifVersion = keyof typeof MOTIFS_VERSION;

const motifCleSchema = z.enum(
  Object.keys(MOTIFS_VERSION) as [MotifVersion, ...MotifVersion[]],
);
const precisionSchema = z
  .string()
  .trim()
  .max(300)
  .optional()
  .or(z.literal("").transform(() => undefined));

export async function creerVersion(
  duerpId: string,
  _prev: VersionActionState,
  formData: FormData,
): Promise<VersionActionState> {
  const cleParsed = motifCleSchema.safeParse(formData.get("motifCle"));
  if (!cleParsed.success) {
    return {
      status: "error",
      message:
        "Sélectionnez un motif de mise à jour — c'est une exigence de l'art. R. 4121-2.",
    };
  }
  const precisionParsed = precisionSchema.safeParse(
    formData.get("motifPrecision"),
  );
  const precision = precisionParsed.success ? precisionParsed.data : undefined;

  const cle = cleParsed.data;
  // « Autre » exige une précision libre, sinon le motif n'est pas traçable.
  if (cle === "autre" && !precision) {
    return {
      status: "error",
      message:
        "Précisez le motif quand vous choisissez « Autre ».",
    };
  }
  const motif = precision
    ? `${MOTIFS_VERSION[cle]} — ${precision}`
    : MOTIFS_VERSION[cle];

  const derniere = await prisma.duerpVersion.findFirst({
    where: { duerpId },
    orderBy: { numero: "desc" },
  });
  const prochainNumero = (derniere?.numero ?? 0) + 1;

  const snapshot = await construireSnapshot(duerpId, {
    numero: prochainNumero,
    motif,
  });
  if (!snapshot) return { status: "error", message: "DUERP introuvable" };

  const cree = await prisma.duerpVersion.create({
    data: {
      duerpId,
      numero: prochainNumero,
      motif,
      snapshot: snapshot as unknown as object,
    },
    include: {
      duerp: {
        select: {
          etablissement: { select: { entrepriseId: true } },
        },
      },
    },
  });

  revalidatePath(`/duerp/${duerpId}/synthese`);
  revalidatePath(
    `/entreprises/${cree.duerp.etablissement.entrepriseId}`,
  );
  return { status: "success", numero: prochainNumero };
}
