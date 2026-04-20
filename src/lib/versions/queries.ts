import { prisma } from "@/lib/prisma";
import type { DuerpSnapshot } from "./snapshot";

export async function listerVersions(duerpId: string) {
  return prisma.duerpVersion.findMany({
    where: { duerpId },
    orderBy: { numero: "desc" },
  });
}

export async function getVersion(duerpId: string, numero: number) {
  const version = await prisma.duerpVersion.findUnique({
    where: { duerpId_numero: { duerpId, numero } },
  });
  if (!version) return null;
  return {
    ...version,
    snapshot: version.snapshot as unknown as DuerpSnapshot,
  };
}
