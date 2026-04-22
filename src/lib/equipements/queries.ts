import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

export async function getEquipement(id: string) {
  const user = await requireUser();
  return prisma.equipement.findFirst({
    where: { id, etablissement: { entreprise: { userId: user.id } } },
    include: { etablissement: { select: { id: true, raisonDisplay: true } } },
  });
}

export async function listerEquipementsDeLEtablissement(
  etablissementId: string,
) {
  const user = await requireUser();
  return prisma.equipement.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
    orderBy: [{ categorie: "asc" }, { createdAt: "asc" }],
  });
}

export type EquipementListe = Awaited<
  ReturnType<typeof listerEquipementsDeLEtablissement>
>[number];

/**
 * Regroupe les équipements par catégorie pour la vue synthétique.
 * L'ordre des catégories retournées suit l'ordre de la Map renvoyée par
 * `listerEquipementsDeLEtablissement` (categorie asc).
 */
export function grouperParCategorie(
  equipements: EquipementListe[],
): Map<CategorieEquipement, EquipementListe[]> {
  const out = new Map<CategorieEquipement, EquipementListe[]>();
  for (const eq of equipements) {
    const bucket = out.get(eq.categorie) ?? [];
    bucket.push(eq);
    out.set(eq.categorie, bucket);
  }
  return out;
}
