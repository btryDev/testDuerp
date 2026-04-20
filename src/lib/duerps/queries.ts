import { prisma } from "@/lib/prisma";

export async function getDuerp(id: string) {
  return prisma.duerp.findUnique({
    where: { id },
    include: {
      entreprise: true,
      unites: {
        orderBy: { nom: "asc" },
        include: {
          risques: {
            include: { mesures: true },
          },
        },
      },
      versions: {
        orderBy: { numero: "desc" },
      },
    },
  });
}

export async function getUnite(id: string) {
  return prisma.uniteTravail.findUnique({
    where: { id },
    include: {
      duerp: { include: { entreprise: true } },
      risques: { include: { mesures: true } },
    },
  });
}
