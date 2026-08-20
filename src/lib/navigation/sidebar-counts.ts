// Les pastilles de la sidebar, chargées une fois pour tous les shells.
//
// Le shell établissement les calculait dans son layout ; le shell DUERP
// montait la même sidebar **sans compteurs**, si bien que les pastilles
// disparaissaient dès qu'on entrait dans le wizard — l'utilisateur y
// lisait « plus rien en retard » alors qu'il n'avait fait que changer
// d'écran. Une seule fonction, deux appelants (ADR-015).
//
// Elle remplace aussi l'appel à `getDashboardData` du layout, qui
// chargeait tout le board pour n'en lire que deux compteurs.

import { prisma } from "@/lib/prisma";
import type { SidebarCounts } from "@/components/layout/sidebar-nav";
import { compterEnRetardParFamille } from "@/lib/calendrier/retards";
import { compterActions } from "@/lib/actions/queries";
import { countAlertesVigilance } from "@/lib/prestataires/queries";
import { countRisquesAReevaluer } from "@/lib/interventions/boucle-duerp";

export async function chargerSidebarCounts(
  etablissementId: string,
): Promise<SidebarCounts> {
  const [retards, actions, prestatairesAlertes, equipements, risques] =
    await Promise.all([
      compterEnRetardParFamille(etablissementId),
      compterActions(etablissementId),
      countAlertesVigilance(etablissementId),
      prisma.equipement.count({ where: { etablissementId } }),
      countRisquesAReevaluer(etablissementId),
    ]);

  return {
    equipements,
    enRetardTotal: retards.total,
    actions: actions.totalACouvrir,
    prestatairesAlertes,
    risquesAReevaluer: risques,
  };
}
