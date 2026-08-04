import { prisma } from "@/lib/prisma";
import { requireEtablissement } from "@/lib/auth/scope";

export async function getRegistreAccessibilite(etablissementId: string) {
  const { etablissement } = await requireEtablissement(etablissementId);
  return prisma.registreAccessibilite.findUnique({
    where: { etablissementId: etablissement.id },
  });
}

/**
 * Lecture publique via slug, sans auth. Ne retourne que les champs
 * publiables. Si le registre n'est pas publié, renvoie `null` pour que
 * la page publique affiche une 404.
 */
export async function getRegistrePublicParSlug(slug: string) {
  const r = await prisma.registreAccessibilite.findUnique({
    where: { slugPublic: slug },
    include: {
      etablissement: {
        select: {
          raisonDisplay: true,
          adresse: true,
          typeErp: true,
          categorieErp: true,
          entreprise: {
            select: { raisonSociale: true, siret: true },
          },
        },
      },
    },
  });
  if (!r || !r.publie) return null;
  return r;
}

/**
 * Progression de remplissage (0-100%) — utilisée dans le dashboard pour
 * décider si on relance l'utilisateur.
 */
export function calculerProgression(
  r: Awaited<ReturnType<typeof getRegistreAccessibilite>>,
): number {
  if (!r) return 0;
  let points = 0;
  if (r.prestationsFournies && r.handicapsAccueillis.length > 0) points += 25;
  if (r.conformiteRegime) points += 25;
  if (r.personnelForme || r.dateDerniereFormation) points += 25;
  if (r.equipementsAccessibilite && r.modalitesMaintenance) points += 25;
  return points;
}
