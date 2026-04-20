"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { trouverReferentielParId } from "@/lib/referentiels";

/**
 * Crée un DUERP vide (sans secteur choisi ni unités). L'utilisateur est
 * redirigé vers l'étape de choix de secteur qui alimente ensuite les unités.
 */
export async function creerDuerp(entrepriseId: string): Promise<void> {
  const entreprise = await prisma.entreprise.findUnique({
    where: { id: entrepriseId },
  });
  if (!entreprise) throw new Error("Entreprise introuvable");

  const duerp = await prisma.duerp.create({
    data: {
      entrepriseId,
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

  revalidatePath(`/entreprises/${entrepriseId}`);
  redirect(`/duerp/${duerp.id}/secteur`);
}

/**
 * Applique un secteur au DUERP : crée les unités suggérées par le référentiel
 * choisi (si pas déjà présentes par nom). Idempotent — peut être rejoué.
 */
export async function choisirSecteur(
  duerpId: string,
  secteurId: string,
): Promise<void> {
  const ref = trouverReferentielParId(secteurId);
  if (!ref) throw new Error(`Secteur inconnu : ${secteurId}`);

  const duerp = await prisma.duerp.findUnique({
    where: { id: duerpId },
    include: { unites: true },
  });
  if (!duerp) throw new Error("DUERP introuvable");

  const nomsExistants = new Set(duerp.unites.map((u) => u.nom.toLowerCase()));

  await prisma.$transaction([
    prisma.duerp.update({
      where: { id: duerpId },
      data: { referentielSecteurId: secteurId },
    }),
    ...ref.unitesTravailSuggerees
      .filter((u) => !nomsExistants.has(u.nom.toLowerCase()))
      .map((u) =>
        prisma.uniteTravail.create({
          data: {
            duerpId,
            nom: u.nom,
            description: u.description,
            referentielUniteId: u.id,
          },
        }),
      ),
  ]);

  revalidatePath(`/duerp/${duerpId}/secteur`);
  revalidatePath(`/duerp/${duerpId}/unites`);
  redirect(`/duerp/${duerpId}/unites`);
}

const uniteSchema = z.object({
  nom: z.string().trim().min(1, "Nom requis").max(100),
  description: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type UniteActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

export async function ajouterUnite(
  duerpId: string,
  _prev: UniteActionState,
  formData: FormData,
): Promise<UniteActionState> {
  const parsed = uniteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.uniteTravail.create({
    data: {
      duerpId,
      nom: parsed.data.nom,
      description: parsed.data.description,
    },
  });

  revalidatePath(`/duerp/${duerpId}/unites`);
  return { status: "success" };
}

export async function renommerUnite(
  uniteId: string,
  nouveauNom: string,
): Promise<void> {
  const nom = nouveauNom.trim();
  if (!nom) return;
  const unite = await prisma.uniteTravail.update({
    where: { id: uniteId },
    data: { nom },
  });
  revalidatePath(`/duerp/${unite.duerpId}/unites`);
}

export async function supprimerUnite(uniteId: string): Promise<void> {
  const unite = await prisma.uniteTravail.delete({ where: { id: uniteId } });
  revalidatePath(`/duerp/${unite.duerpId}/unites`);
}

/**
 * Déclare « aucun risque significatif identifié » pour une unité. Requiert une
 * justification libre qui sera reprise dans le DUERP final — cf. INRS ED 840,
 * l'évaluation peut légitimement conclure à l'absence de risque significatif.
 * Passer `null` comme justification retire la déclaration.
 */
export async function declarerAucunRisque(
  uniteId: string,
  justification: string | null,
): Promise<void> {
  const justif = justification?.trim() || null;
  const unite = await prisma.uniteTravail.update({
    where: { id: uniteId },
    data: { aucunRisqueJustif: justif },
  });
  revalidatePath(`/duerp/${unite.duerpId}/risques`);
  revalidatePath(`/duerp/${unite.duerpId}/risques/${uniteId}`);
}
