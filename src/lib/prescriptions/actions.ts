"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { genererCalendrier } from "@/lib/calendrier/actions";
import { depuisCleJourCivil } from "@/lib/dates";
import { validerPrescription } from "./schema";

/**
 * Prescriptions particulières (ADR-014) — création, levée, suppression.
 *
 * Toute mutation relance `genererCalendrier` : c'est le générateur qui
 * applique (ou ignore, avec raison) la prescription, jamais cette action.
 */

export type PrescriptionActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success"; prescriptionId: string };

function normaliser(fd: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(fd);
  return {
    ...raw,
    realisateurRequis: fd.getAll("realisateurRequis").map(String),
  };
}

export async function creerPrescription(
  etablissementId: string,
  _prev: PrescriptionActionState,
  formData: FormData,
): Promise<PrescriptionActionState> {
  await assertEtablissementOwnership(etablissementId);

  const parsed = validerPrescription(normaliser(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;

  // Un équipement visé doit appartenir à l'établissement.
  if (d.equipementId) {
    const eq = await prisma.equipement.findFirst({
      where: { id: d.equipementId, etablissementId },
      select: { id: true },
    });
    if (!eq) {
      return {
        status: "error",
        message: "Formulaire invalide",
        fieldErrors: { equipementId: ["Équipement inconnu"] },
      };
    }
  }

  const commun = {
    etablissementId,
    source: d.source,
    reference: d.reference,
    autorite: d.autorite ?? null,
    dateDocument: depuisCleJourCivil(d.dateDocument),
    dateFin: d.dateFin ? depuisCleJourCivil(d.dateFin) : null,
    periodicite: d.periodicite,
    equipementId: d.equipementId ?? null,
  } satisfies Partial<Prisma.PrescriptionParticuliereUncheckedCreateInput>;

  const data: Prisma.PrescriptionParticuliereUncheckedCreateInput =
    d.effet === "renforce_periodicite"
      ? {
          ...commun,
          effet: "renforce_periodicite",
          obligationId: d.obligationId,
          realisateurRequis: [],
        }
      : {
          ...commun,
          effet: "obligation_sur_mesure",
          libelle: d.libelle,
          description: d.description ?? null,
          realisateurRequis: d.realisateurRequis,
          categorieEquipement: d.categorieEquipement ?? null,
        };

  const p = await prisma.prescriptionParticuliere.create({
    data,
    select: { id: true },
  });

  await genererCalendrier(etablissementId);
  revalidatePath(`/etablissements/${etablissementId}/prescriptions`);
  revalidatePath(`/etablissements/${etablissementId}`);
  return { status: "success", prescriptionId: p.id };
}

/** Lève une prescription à une date : elle cesse de produire effet mais
 *  reste dans l'historique (jamais supprimée quand elle a produit des lignes). */
export async function leverPrescription(
  etablissementId: string,
  prescriptionId: string,
  dateFin: string,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  await prisma.prescriptionParticuliere.update({
    where: { id: prescriptionId, etablissementId },
    data: { dateFin: depuisCleJourCivil(dateFin) },
  });
  await genererCalendrier(etablissementId);
  revalidatePath(`/etablissements/${etablissementId}/prescriptions`);
}

/** Suppression physique : réservée aux prescriptions qui n'ont produit
 *  aucune ligne de calendrier porteuse de preuve — la réconciliation (ADR-012)
 *  arbitre le reste via `ON DELETE SET NULL`. */
export async function supprimerPrescription(
  etablissementId: string,
  prescriptionId: string,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  await prisma.prescriptionParticuliere.delete({
    where: { id: prescriptionId, etablissementId },
  });
  await genererCalendrier(etablissementId);
  revalidatePath(`/etablissements/${etablissementId}/prescriptions`);
}
