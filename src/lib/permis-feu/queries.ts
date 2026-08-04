import { prisma } from "@/lib/prisma";
import { requireEtablissement } from "@/lib/auth/scope";
import { listSignatures } from "@/lib/signatures/queries";

export async function listPermisFeu(etablissementId: string) {
  const { etablissement } = await requireEtablissement(etablissementId);
  return prisma.permisFeu.findMany({
    where: { etablissementId: etablissement.id },
    orderBy: [{ numero: "desc" }],
  });
}

export async function getPermisFeu(
  etablissementId: string,
  permisFeuId: string,
) {
  const { etablissement } = await requireEtablissement(etablissementId);
  const permis = await prisma.permisFeu.findFirst({
    where: { id: permisFeuId, etablissementId: etablissement.id },
  });
  if (!permis) return null;
  const signatures = await listSignatures("permis_feu", permis.id);
  return { ...permis, signatures };
}

export async function nextNumeroPermisFeu(
  etablissementId: string,
): Promise<number> {
  const last = await prisma.permisFeu.findFirst({
    where: { etablissementId },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  return (last?.numero ?? 0) + 1;
}
