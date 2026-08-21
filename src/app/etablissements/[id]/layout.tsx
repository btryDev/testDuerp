import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BarreCompte } from "@/components/layout/BarreCompte";
import { chargerSidebarCounts } from "@/lib/navigation/sidebar-counts";
import { getEtatModules } from "@/lib/etablissements/modules";

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
      // Qualifie le registre d'accessibilité dans la sidebar (ERP seulement).
      estERP: true,
    },
  });
  if (!etab) notFound();

  // Pastilles de la sidebar : même chargement que le shell DUERP, pour
  // que les deux annoncent les mêmes nombres (ADR-015).
  const [counts, modules] = await Promise.all([
    chargerSidebarCounts(id),
    getEtatModules(id, etab.estERP),
  ]);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[auto_1fr] lg:overflow-hidden">
      <AppSidebar
        etablissement={etab}
        counts={counts}
        modules={modules}
      />
      <div className="flex min-w-0 flex-col lg:overflow-y-auto">
        {/* Barre de compte : la sidebar porte la hiérarchie du produit, la
            barre haute porte les utilitaires de session. Ce partage est ce
            qui justifie la barre — sans le compte, elle n'aurait rien à
            porter et serait une bande vide. Cf. `BarreCompte`. */}
        <BarreCompte
          etablissementId={etab.id}
          email={user.email ?? null}
        />
        {children}
      </div>
    </div>
  );
}
