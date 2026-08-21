"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { batimentSchema } from "./schema";

/**
 * Mutations des bâtiments (ADR-019). Un bâtiment est un lieu : on le nomme,
 * on le renomme, on le supprime après avoir déplacé ce qu'il contient. Rien
 * ici ne touche au matching ni au calendrier — le bâtiment ne porte aucun
 * régime, le déplacer ne change aucune obligation.
 */

export type BatimentActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success"; id: string };

function revalider(etablissementId: string) {
  revalidatePath(`/etablissements/${etablissementId}`);
  revalidatePath(`/etablissements/${etablissementId}/batiments`);
  revalidatePath(`/etablissements/${etablissementId}/equipements`);
}

/** Scope d'un bâtiment : il appartient au user via son établissement. */
async function trouverBatimentDuUser(id: string) {
  const user = await requireUser();
  return prisma.batiment.findFirst({
    where: { id, etablissement: { entreprise: { userId: user.id } } },
    select: { id: true, etablissementId: true, ordre: true },
  });
}

function estDoublonDeNom(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

export async function creerBatiment(
  etablissementId: string,
  _prev: BatimentActionState,
  formData: FormData,
): Promise<BatimentActionState> {
  await assertEtablissementOwnership(etablissementId);
  const parsed = batimentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const dernier = await prisma.batiment.aggregate({
    where: { etablissementId },
    _max: { ordre: true },
  });

  try {
    const b = await prisma.batiment.create({
      data: {
        etablissementId,
        nom: parsed.data.nom,
        complementAdresse: parsed.data.complementAdresse ?? null,
        ordre: (dernier._max.ordre ?? -1) + 1,
      },
      select: { id: true },
    });
    revalider(etablissementId);
    return { status: "success", id: b.id };
  } catch (e) {
    if (estDoublonDeNom(e)) {
      return {
        status: "error",
        message: "Un bâtiment porte déjà ce nom",
        fieldErrors: { nom: ["Un bâtiment porte déjà ce nom"] },
      };
    }
    throw e;
  }
}

export async function modifierBatiment(
  id: string,
  _prev: BatimentActionState,
  formData: FormData,
): Promise<BatimentActionState> {
  const b = await trouverBatimentDuUser(id);
  if (!b) return { status: "error", message: "Bâtiment introuvable" };

  const parsed = batimentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.batiment.update({
      where: { id },
      data: {
        nom: parsed.data.nom,
        complementAdresse: parsed.data.complementAdresse ?? null,
      },
    });
  } catch (e) {
    if (estDoublonDeNom(e)) {
      return {
        status: "error",
        message: "Un bâtiment porte déjà ce nom",
        fieldErrors: { nom: ["Un bâtiment porte déjà ce nom"] },
      };
    }
    throw e;
  }
  revalider(b.etablissementId);
  return { status: "success", id };
}

/**
 * Supprime un bâtiment après avoir déplacé **tout** son contenu vers
 * `versBatimentId` — équipements (actifs ou retirés du parc : les seconds
 * gardent leur historique, ADR-012), points de relevé, permis, plans.
 *
 * La destination est toujours exigée, même pour un bâtiment qui paraît vide :
 * l'interface compte les équipements actifs, la base en connaît peut-être de
 * désactivés, et les rattachements optionnels retomberaient à `null` par
 * `SetNull` — une information donnée par l'utilisateur, perdue en silence.
 *
 * Le dernier bâtiment d'un établissement ne se supprime pas (ADR-019).
 */
export async function supprimerBatiment(
  id: string,
  versBatimentId: string,
): Promise<BatimentActionState> {
  const b = await trouverBatimentDuUser(id);
  if (!b) return { status: "error", message: "Bâtiment introuvable" };

  const destination = await prisma.batiment.findFirst({
    where: {
      id: versBatimentId,
      etablissementId: b.etablissementId,
      NOT: { id },
    },
    select: { id: true },
  });
  if (!destination) {
    // Couvre aussi le dernier bâtiment : il n'a aucune destination possible.
    return {
      status: "error",
      message:
        "Choisissez un autre bâtiment de l'établissement où déplacer le contenu",
    };
  }

  await prisma.$transaction(async (tx) => {
    const deplacement = {
      where: { batimentId: id },
      data: { batimentId: destination.id },
    };
    await tx.equipement.updateMany(deplacement);
    await tx.pointReleve.updateMany(deplacement);
    await tx.permisFeu.updateMany(deplacement);
    await tx.planPrevention.updateMany(deplacement);
    await tx.batiment.delete({ where: { id } });
  });

  revalider(b.etablissementId);
  return { status: "success", id };
}
