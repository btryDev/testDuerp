import { prisma } from "@/lib/prisma";
import {
  assertEtablissementOwnership,
  requireEtablissement,
} from "@/lib/auth/scope";

export async function listInterventions(etablissementId: string) {
  const { etablissement } = await requireEtablissement(etablissementId);
  return prisma.intervention.findMany({
    where: { etablissementId: etablissement.id },
    orderBy: [{ statut: "asc" }, { priorite: "desc" }, { echeance: "asc" }],
  });
}

export async function getIntervention(
  etablissementId: string,
  interventionId: string,
) {
  const { etablissement } = await requireEtablissement(etablissementId);
  const intervention = await prisma.intervention.findFirst({
    where: { id: interventionId, etablissementId: etablissement.id },
    include: {
      commentaires: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!intervention) return null;
  // Récupérer le libellé du risque lié si présent
  let risqueLibelle: string | null = null;
  if (intervention.risqueId) {
    const r = await prisma.risque.findUnique({
      where: { id: intervention.risqueId },
      select: { libelle: true },
    });
    risqueLibelle = r?.libelle ?? null;
  }
  return { ...intervention, risqueLibelle };
}

export async function nextNumeroIntervention(
  etablissementId: string,
): Promise<number> {
  const last = await prisma.intervention.findFirst({
    where: { etablissementId },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  return (last?.numero ?? 0) + 1;
}

/**
 * Liste les risques du DUERP courant pour permettre de lier un ticket
 * à un risque existant. Renvoie triée par unité.
 *
 * Le garde est indispensable ici : la fonction est appelée depuis une page
 * avec un `etablissementId` d'URL, et elle rend le libellé de tous les
 * risques du DUERP — c'est-à-dire l'évaluation complète d'un client. Sans
 * scope, changer l'id dans l'URL suffisait à la lire.
 */
export async function listRisquesEtablissement(etablissementId: string) {
  await assertEtablissementOwnership(etablissementId);

  const risques = await prisma.risque.findMany({
    where: {
      unite: { duerp: { etablissementId } },
    },
    include: {
      unite: { select: { nom: true } },
    },
    orderBy: [{ unite: { nom: "asc" } }, { libelle: "asc" }],
  });
  return risques.map((r) => ({
    id: r.id,
    libelle: r.libelle,
    uniteNom: r.unite.nom,
  }));
}
