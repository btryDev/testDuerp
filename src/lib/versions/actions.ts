"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  DuerpSnapshot,
  MesureSnapshot,
  UniteSnapshot,
} from "./snapshot";
import type { TypeMesure } from "@/lib/referentiels/types";

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

  const duerp = await prisma.duerp.findUnique({
    where: { id: duerpId },
    include: {
      entreprise: true,
      unites: {
        orderBy: { nom: "asc" },
        include: {
          risques: {
            orderBy: { libelle: "asc" },
            include: { mesures: true },
          },
        },
      },
    },
  });
  if (!duerp) return { status: "error", message: "DUERP introuvable" };

  const unitesSnap: UniteSnapshot[] = duerp.unites.map((u) => ({
    id: u.id,
    nom: u.nom,
    description: u.description,
    estTransverse: u.estTransverse,
    aucunRisqueJustif: u.aucunRisqueJustif,
    risques: u.risques.map((r) => ({
      id: r.id,
      referentielId: r.referentielId,
      libelle: r.libelle,
      description: r.description,
      gravite: r.gravite,
      probabilite: r.probabilite,
      maitrise: r.maitrise,
      criticite: r.criticite,
      cotationSaisie: r.cotationSaisie,
      nombreSalariesExposes: r.nombreSalariesExposes,
      dateMesuresPhysiques: r.dateMesuresPhysiques
        ? r.dateMesuresPhysiques.toISOString()
        : null,
      exposeCMR: r.exposeCMR,
      mesures: r.mesures.map<MesureSnapshot>((m) => ({
        id: m.id,
        libelle: m.libelle,
        type: m.type as TypeMesure,
        statut: m.statut as "existante" | "prevue",
        echeance: m.echeance ? m.echeance.toISOString() : null,
        responsable: m.responsable,
      })),
    })),
  }));

  const derniere = await prisma.duerpVersion.findFirst({
    where: { duerpId },
    orderBy: { numero: "desc" },
  });
  const prochainNumero = (derniere?.numero ?? 0) + 1;

  const snapshot: DuerpSnapshot = {
    version: prochainNumero,
    genereLe: new Date().toISOString(),
    motif: motif,
    referentielSecteurId: duerp.referentielSecteurId,
    entreprise: {
      raisonSociale: duerp.entreprise.raisonSociale,
      siret: duerp.entreprise.siret,
      codeNaf: duerp.entreprise.codeNaf,
      effectif: duerp.entreprise.effectif,
      adresse: duerp.entreprise.adresse,
    },
    unites: unitesSnap,
  };

  await prisma.duerpVersion.create({
    data: {
      duerpId,
      numero: prochainNumero,
      motif,
      snapshot: snapshot as unknown as object,
    },
  });

  revalidatePath(`/duerp/${duerpId}/synthese`);
  revalidatePath(`/entreprises/${duerp.entrepriseId}`);
  return { status: "success", numero: prochainNumero };
}
