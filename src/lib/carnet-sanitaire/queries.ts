import { prisma } from "@/lib/prisma";
import { requireEtablissement } from "@/lib/auth/scope";

export async function getCarnetSanitaire(etablissementId: string) {
  const { etablissement } = await requireEtablissement(etablissementId);
  return prisma.carnetSanitaire.findUnique({
    where: { etablissementId: etablissement.id },
    include: {
      pointsReleve: {
        where: { actif: true },
        include: {
          releves: {
            orderBy: { dateReleve: "desc" },
            take: 20,
          },
        },
        orderBy: { nom: "asc" },
      },
      analyses: {
        orderBy: { dateAnalyse: "desc" },
        take: 10,
      },
    },
  });
}

/**
 * Dernier relevé par point — utilisé pour afficher un statut rapide en
 * dashboard / page index.
 */
export async function dernierRelevesParPoint(carnetId: string) {
  const points = await prisma.pointReleve.findMany({
    where: { carnetId, actif: true },
    include: {
      releves: {
        orderBy: { dateReleve: "desc" },
        take: 1,
      },
    },
    orderBy: { nom: "asc" },
  });
  return points.map((p) => ({
    ...p,
    dernier: p.releves[0] ?? null,
  }));
}
