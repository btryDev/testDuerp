import { prisma } from "@/lib/prisma";
import { requireEtablissement } from "@/lib/auth/scope";
import { computeVigilance, type VigilanceSnapshot } from "./vigilance";

export async function listPrestataires(etablissementId: string) {
  const { etablissement } = await requireEtablissement(etablissementId);
  const prestataires = await prisma.prestataire.findMany({
    where: { etablissementId: etablissement.id },
    orderBy: [{ raisonSociale: "asc" }],
  });
  return prestataires.map((p) => ({
    ...p,
    vigilance: computeVigilance(p),
  }));
}

export async function getPrestataire(
  etablissementId: string,
  prestataireId: string,
) {
  const { etablissement } = await requireEtablissement(etablissementId);
  const prestataire = await prisma.prestataire.findFirst({
    where: { id: prestataireId, etablissementId: etablissement.id },
  });
  if (!prestataire) return null;
  return { ...prestataire, vigilance: computeVigilance(prestataire) };
}

export async function countAlertesVigilance(
  etablissementId: string,
): Promise<number> {
  const prestataires = await listPrestataires(etablissementId);
  return prestataires.reduce(
    (acc, p) => acc + (p.vigilance.alertesOuvertes > 0 ? 1 : 0),
    0,
  );
}

export type PrestataireAvecVigilance = Awaited<
  ReturnType<typeof listPrestataires>
>[number];

export type { VigilanceSnapshot };
