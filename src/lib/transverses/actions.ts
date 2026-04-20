"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calculerCriticite } from "@/lib/cotation";
import { risquesTransverses } from "@/lib/referentiels";

async function obtenirUniteTransverse(duerpId: string) {
  const existante = await prisma.uniteTravail.findFirst({
    where: { duerpId, estTransverse: true },
  });
  if (existante) return existante;
  return prisma.uniteTravail.create({
    data: {
      duerpId,
      nom: "Risques transverses",
      estTransverse: true,
    },
  });
}

/**
 * Active ou désactive un risque transverse pour un DUERP.
 * Activation = crée un risque dans l'unité virtuelle avec cotation par défaut.
 * Désactivation = supprime le risque si présent.
 */
export async function toggleRisqueTransverse(
  duerpId: string,
  referentielId: string,
): Promise<void> {
  const ref = risquesTransverses.find((r) => r.id === referentielId);
  if (!ref) throw new Error(`Risque transverse inconnu : ${referentielId}`);

  const unite = await obtenirUniteTransverse(duerpId);

  const existant = await prisma.risque.findUnique({
    where: {
      uniteId_referentielId: { uniteId: unite.id, referentielId },
    },
  });

  if (existant) {
    await prisma.risque.delete({ where: { id: existant.id } });
  } else {
    const gravite = ref.graviteParDefaut;
    const probabilite = ref.probabiliteParDefaut;
    const maitrise = ref.maitriseParDefaut ?? 2;
    await prisma.risque.create({
      data: {
        uniteId: unite.id,
        referentielId,
        libelle: ref.libelle,
        description: ref.description,
        gravite,
        probabilite,
        maitrise,
        criticite: calculerCriticite({ gravite, probabilite, maitrise }),
      },
    });
  }

  revalidatePath(`/duerp/${duerpId}/transverses`);
  revalidatePath(`/duerp/${duerpId}/synthese`);
}

export async function validerTransverses(duerpId: string): Promise<void> {
  await prisma.duerp.update({
    where: { id: duerpId },
    data: { transversesRepondues: true },
  });
  revalidatePath(`/duerp/${duerpId}/transverses`);
  revalidatePath(`/duerp/${duerpId}/synthese`);
}
