import { prisma } from "@/lib/prisma";

export async function getRisque(id: string) {
  return prisma.risque.findUnique({
    where: { id },
    include: {
      unite: {
        include: {
          duerp: { include: { entreprise: true } },
          risques: {
            orderBy: { libelle: "asc" },
            select: { id: true, libelle: true, cotationSaisie: true },
          },
        },
      },
      mesures: true,
    },
  });
}
