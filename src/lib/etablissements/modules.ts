import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import type { SidebarModules } from "@/components/layout/sidebar-nav";

/**
 * État des registres d'un établissement, pour que la navigation sache ce qui
 * le concerne (cf. l'en-tête de `sidebar-nav.ts`).
 *
 * Volontairement minimal : trois comptages, pas de jointure, pas de calcul de
 * fraîcheur. Cette lecture est faite dans le layout, donc sur **chaque page**
 * de l'établissement — elle ne doit jamais devenir un coût de navigation.
 * `getModulesMatrice` reste la source riche du tableau de bord (états des
 * permis, retards de relevés, vigilance) ; les deux partagent les règles
 * d'applicabilité, pas les requêtes.
 *
 * `estERP` est passé par l'appelant, qui a déjà l'établissement en main.
 *
 * ADR-005 : scope par userId via la relation entreprise.
 */
export async function getEtatModules(
  etablissementId: string,
  estERP: boolean,
): Promise<SidebarModules> {
  const user = await requireUser();
  const scope = {
    etablissementId,
    etablissement: { entreprise: { userId: user.id } },
  } as const;

  const [nbPermisFeu, nbPlansPrevention, carnet] = await Promise.all([
    prisma.permisFeu.count({ where: scope }),
    prisma.planPrevention.count({ where: scope }),
    prisma.carnetSanitaire.findFirst({ where: scope, select: { id: true } }),
  ]);

  return {
    estERP,
    nbPermisFeu,
    nbPlansPrevention,
    carnetSanitaireExiste: Boolean(carnet),
  };
}
