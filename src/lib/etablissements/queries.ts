import { prisma } from "@/lib/prisma";

export async function getEtablissement(id: string) {
  return prisma.etablissement.findUnique({
    where: { id },
    include: {
      entreprise: true,
      duerps: {
        orderBy: { updatedAt: "desc" },
        include: {
          versions: {
            orderBy: { numero: "desc" },
            take: 1,
          },
        },
      },
    },
  });
}

export async function listerEtablissementsDeLEntreprise(entrepriseId: string) {
  return prisma.etablissement.findMany({
    where: { entrepriseId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { duerps: true } },
    },
  });
}
