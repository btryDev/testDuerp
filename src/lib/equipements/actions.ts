"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { equipementSchema, serialiserCaracteristiques } from "./schema";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

export type EquipementActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; id: string };

/**
 * Normalise les données du formulaire avant validation Zod :
 *  - les checkboxes HTML envoient la valeur du `value` attribut ou rien ;
 *    on convertit en booléen
 *  - les selects vides arrivent en string "" ; on les transforme en undefined
 *  - les champs numériques vides arrivent en "" ; Zod les rendra undefined
 */
function normaliserFormData(fd: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(fd);
  const bool = (k: string) => raw[k] !== undefined;
  return {
    libelle: raw.libelle,
    categorie: raw.categorie || undefined,
    localisation: raw.localisation,
    dateMiseEnService: raw.dateMiseEnService,
    nombre: raw.nombre,
    aGroupeElectrogene: bool("aGroupeElectrogene"),
    estLocalPollutionSpecifique: bool("estLocalPollutionSpecifique"),
    nbVehiculesParkingCouvert: raw.nbVehiculesParkingCouvert,
    notes: raw.notes,
  };
}

export async function creerEquipement(
  etablissementId: string,
  _prev: EquipementActionState,
  formData: FormData,
): Promise<EquipementActionState> {
  const parsed = equipementSchema.safeParse(normaliserFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const caracs = serialiserCaracteristiques(parsed.data);

  await prisma.equipement.create({
    data: {
      etablissementId,
      libelle: parsed.data.libelle,
      categorie: parsed.data.categorie,
      localisation: parsed.data.localisation,
      dateMiseEnService: parsed.data.dateMiseEnService,
      caracteristiques: (caracs ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  revalidatePath(`/etablissements/${etablissementId}`);
  revalidatePath(`/etablissements/${etablissementId}/equipements`);
  redirect(`/etablissements/${etablissementId}/equipements`);
}

export async function modifierEquipement(
  id: string,
  _prev: EquipementActionState,
  formData: FormData,
): Promise<EquipementActionState> {
  const parsed = equipementSchema.safeParse(normaliserFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const caracs = serialiserCaracteristiques(parsed.data);

  const eq = await prisma.equipement.update({
    where: { id },
    data: {
      libelle: parsed.data.libelle,
      categorie: parsed.data.categorie,
      localisation: parsed.data.localisation,
      dateMiseEnService: parsed.data.dateMiseEnService,
      caracteristiques: (caracs ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  revalidatePath(`/etablissements/${eq.etablissementId}`);
  revalidatePath(`/etablissements/${eq.etablissementId}/equipements`);
  return { status: "success", id };
}

export async function supprimerEquipement(id: string): Promise<void> {
  const eq = await prisma.equipement.delete({ where: { id } });
  revalidatePath(`/etablissements/${eq.etablissementId}`);
  redirect(`/etablissements/${eq.etablissementId}/equipements`);
}

/**
 * Action de création groupée depuis le pré-remplissage (étape 4).
 * Attend un tableau `categories` de catégories validées par l'utilisateur.
 * Chaque catégorie donne lieu à un `Equipement` minimal (libellé générique,
 * pas de caractéristiques) que l'utilisateur pourra enrichir ensuite.
 */
export async function creerEquipementsDepuisPreRemplissage(
  etablissementId: string,
  entrees: { categorie: CategorieEquipement; libelle: string }[],
): Promise<{ created: number }> {
  if (entrees.length === 0) return { created: 0 };

  const result = await prisma.equipement.createMany({
    data: entrees.map((e) => ({
      etablissementId,
      categorie: e.categorie,
      libelle: e.libelle,
    })),
  });

  revalidatePath(`/etablissements/${etablissementId}`);
  revalidatePath(`/etablissements/${etablissementId}/equipements`);
  return { created: result.count };
}
