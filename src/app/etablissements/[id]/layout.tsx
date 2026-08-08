import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getDashboardData } from "@/lib/dashboard/queries";
import { countAlertesVigilance } from "@/lib/prestataires/queries";
import { countRisquesAReevaluer } from "@/lib/interventions/boucle-duerp";

/**
 * Layout imbriqué pour toutes les pages d'un établissement.
 *
 * Rôles :
 *   1. Garde d'ownership (findFirst scopé par userId).
 *   2. Monte la sidebar persistante sur toutes les sous-pages — la
 *      sidebar déduit l'item actif depuis le pathname (cf. AppSidebar).
 *   3. Fait le scroll container à droite pour que la sidebar reste sticky.
 *
 * Chaque page garde la liberté de rendre sa propre AppTopbar si elle
 * veut un en-tête avec actions contextuelles.
 */
export default async function EtablissementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const etab = await prisma.etablissement.findFirst({
    where: { id, entreprise: { userId: user.id } },
    select: {
      id: true,
      raisonDisplay: true,
      adresse: true,
      effectifSurSite: true,
      entrepriseId: true,
      estERP: true,
    },
  });
  if (!etab) notFound();

  // Counts pour les badges de la sidebar — lecture séparée pour pouvoir
  // paralléliser si besoin (aujourd'hui dashboard fait déjà ces queries
  // pour ses widgets, idempotent tant qu'on n'abuse pas).
  // `profil` : faits déclarés qui décident quels registres de domaine sont
  // mis en avant dans le rail et lesquels sont repliés (cf. sidebar-nav.ts).
  const [
    dashboard,
    prestatairesAlertes,
    nbEquipements,
    risquesAReevaluer,
    aRegistreAccessibilite,
    nbPermisFeu,
    nbPlansPrevention,
    aCarnetSanitaire,
  ] = await Promise.all([
    getDashboardData(id),
    countAlertesVigilance(id),
    prisma.equipement.count({ where: { etablissementId: id } }),
    countRisquesAReevaluer(id),
    prisma.registreAccessibilite.count({ where: { etablissementId: id } }),
    prisma.permisFeu.count({ where: { etablissementId: id } }),
    prisma.planPrevention.count({ where: { etablissementId: id } }),
    prisma.carnetSanitaire.count({ where: { etablissementId: id } }),
  ]);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[auto_1fr] lg:overflow-hidden">
      <AppSidebar
        etablissement={etab}
        counts={{
          equipements: nbEquipements,
          verificationsEnRetard: dashboard.compteurs.verifsEnRetard,
          actions:
            dashboard.compteurs.actionsOuvertes +
            dashboard.compteurs.actionsEnCours,
          prestatairesAlertes,
          risquesAReevaluer,
        }}
        profil={{
          estERP: etab.estERP,
          aRegistreAccessibilite: aRegistreAccessibilite > 0,
          nbPermisFeu,
          nbPlansPrevention,
          aCarnetSanitaire: aCarnetSanitaire > 0,
        }}
        user={user}
      />
      <div className="flex min-w-0 flex-col lg:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
