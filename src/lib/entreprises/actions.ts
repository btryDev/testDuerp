"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { assertEntrepriseOwnership } from "@/lib/auth/scope";
import { entrepriseSchema } from "./schema";

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

export async function creerEntreprise(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData);
  const parsed = entrepriseSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // V2 : l'entrée dans l'outil se fait en deux temps.
  //   1. créer l'entreprise (identité juridique)
  //   2. déclarer au moins un établissement (adresse, typologie, régimes)
  // Le DUERP est initié depuis la page détail d'un établissement.
  const entreprise = await prisma.entreprise.create({
    data: { ...parsed.data, userId: user.id },
  });

  redirect(`/etablissements/nouveau?entrepriseId=${entreprise.id}`);
}

export async function modifierEntreprise(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertEntrepriseOwnership(id);
  const raw = Object.fromEntries(formData);
  const parsed = entrepriseSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.entreprise.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/entreprises");
  revalidatePath(`/entreprises/${id}`);
  return { status: "success" };
}

export async function supprimerEntreprise(id: string): Promise<void> {
  await assertEntrepriseOwnership(id);
  await prisma.entreprise.delete({ where: { id } });
  revalidatePath("/entreprises");
  redirect("/entreprises");
}
