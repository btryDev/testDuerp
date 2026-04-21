"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { etablissementSchema } from "./schema";

export type EtablissementActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; id: string };

/**
 * Normalise les données du formulaire avant validation Zod :
 *  - les checkboxes HTML envoient "on" ou rien ; Zod les attend en booléen
 *  - les selects vides arrivent en string "" ; on les transforme en undefined
 */
function normaliserFormData(fd: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(fd);
  const bool = (k: string) => raw[k] !== undefined;
  return {
    raisonDisplay: raw.raisonDisplay,
    adresse: raw.adresse,
    codeNaf: raw.codeNaf,
    effectifSurSite: raw.effectifSurSite,
    estEtablissementTravail: bool("estEtablissementTravail"),
    estERP: bool("estERP"),
    estIGH: bool("estIGH"),
    estHabitation: bool("estHabitation"),
    typeErp: raw.typeErp || undefined,
    categorieErp: raw.categorieErp || undefined,
    classeIgh: raw.classeIgh || undefined,
  };
}

export async function creerEtablissement(
  entrepriseId: string,
  _prev: EtablissementActionState,
  formData: FormData,
): Promise<EtablissementActionState> {
  const parsed = etablissementSchema.safeParse(normaliserFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const etab = await prisma.etablissement.create({
    data: {
      entrepriseId,
      ...parsed.data,
    },
  });

  revalidatePath(`/entreprises/${entrepriseId}`);
  redirect(`/etablissements/${etab.id}`);
}

export async function modifierEtablissement(
  id: string,
  _prev: EtablissementActionState,
  formData: FormData,
): Promise<EtablissementActionState> {
  const parsed = etablissementSchema.safeParse(normaliserFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const etab = await prisma.etablissement.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/entreprises/${etab.entrepriseId}`);
  revalidatePath(`/etablissements/${id}`);
  return { status: "success", id };
}

export async function supprimerEtablissement(id: string): Promise<void> {
  const etab = await prisma.etablissement.delete({ where: { id } });
  revalidatePath(`/entreprises/${etab.entrepriseId}`);
  redirect(`/entreprises/${etab.entrepriseId}`);
}
