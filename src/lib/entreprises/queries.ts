import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

// ADR-005 : toutes les lectures d'Entreprise passent par requireUser() et
// filtrent sur userId. Les entreprises orphelines (userId = NULL, héritage
// avant auth) sont donc invisibles.

export async function listerEntreprises() {
  const user = await requireUser();
  return prisma.entreprise.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      etablissements: {
        include: {
          _count: { select: { duerps: true } },
        },
      },
    },
  });
}

export async function getEntreprise(id: string) {
  const user = await requireUser();
  return prisma.entreprise.findFirst({
    where: { id, userId: user.id },
    include: {
      etablissements: {
        orderBy: { createdAt: "asc" },
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
      },
    },
  });
}
