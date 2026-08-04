import { prisma } from "@/lib/prisma";
import { requireEtablissement } from "@/lib/auth/scope";
import { listSignatures } from "@/lib/signatures/queries";

export async function listPlansPrevention(etablissementId: string) {
  const { etablissement } = await requireEtablissement(etablissementId);
  return prisma.planPrevention.findMany({
    where: { etablissementId: etablissement.id },
    orderBy: [{ numero: "desc" }],
    include: { _count: { select: { lignes: true } } },
  });
}

export async function getPlanPrevention(
  etablissementId: string,
  planId: string,
) {
  const { etablissement } = await requireEtablissement(etablissementId);
  const plan = await prisma.planPrevention.findFirst({
    where: { id: planId, etablissementId: etablissement.id },
    include: { lignes: { orderBy: { ordre: "asc" } } },
  });
  if (!plan) return null;
  const signatures = await listSignatures("plan_prevention", plan.id);
  return { ...plan, signatures };
}

export async function nextNumeroPlan(
  etablissementId: string,
): Promise<number> {
  const last = await prisma.planPrevention.findFirst({
    where: { etablissementId },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  return (last?.numero ?? 0) + 1;
}
