"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { entrepriseSchema } from "./schema";

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

export async function creerEntreprise(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = entrepriseSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Création atomique Entreprise → Etablissement par défaut → DUERP initial
  // (cf. ADR-001). L'établissement hérite des infos de l'entreprise ;
  // l'utilisateur pourra le préciser plus tard (catégorie ERP, IGH, etc.).
  const duerp = await prisma.$transaction(async (tx) => {
    const entreprise = await tx.entreprise.create({
      data: parsed.data,
    });

    const etablissement = await tx.etablissement.create({
      data: {
        entrepriseId: entreprise.id,
        raisonDisplay: entreprise.raisonSociale,
        adresse: entreprise.adresse,
        effectifSurSite: entreprise.effectif,
      },
    });

    return tx.duerp.create({
      data: {
        etablissementId: etablissement.id,
        unites: {
          create: {
            nom: "Risques transverses",
            description:
              "Risques transverses à l'entreprise (routier, RPS, TMS, écrans). Gérés via les questions détecteurs.",
            estTransverse: true,
          },
        },
      },
    });
  });

  redirect(`/duerp/${duerp.id}/secteur`);
}

export async function modifierEntreprise(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
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
  await prisma.entreprise.delete({ where: { id } });
  revalidatePath("/entreprises");
  redirect("/entreprises");
}
