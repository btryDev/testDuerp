import { prisma } from "@/lib/prisma";

export async function listerEntreprises() {
  return prisma.entreprise.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { duerps: true } },
    },
  });
}

export async function getEntreprise(id: string) {
  return prisma.entreprise.findUnique({
    where: { id },
    include: {
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
