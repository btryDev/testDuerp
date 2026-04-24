import { prisma } from "@/lib/prisma";
import type { ObjetSignable } from "@prisma/client";

/**
 * Liste les signatures posées sur un objet (rapport, permis de feu, …).
 * Utilisé par les pages détail pour afficher les SignatureBlock.
 */
export async function listSignatures(objetType: ObjetSignable, objetId: string) {
  return prisma.signature.findMany({
    where: { objetType, objetId },
    orderBy: { horodatageIso: "asc" },
  });
}

export async function getSignature(id: string) {
  return prisma.signature.findUnique({ where: { id } });
}
