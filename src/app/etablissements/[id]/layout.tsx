import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Layout imbriqué pour toutes les pages d'un établissement.
 * Rôle : garde d'ownership (findFirst scopé par userId). La navigation
 * a été retirée : le dashboard l'assure via AppSidebar + AppTopbar, et
 * chaque sous-page (calendrier, équipements…) porte son propre
 * « ← retour ». À ré-introduire ici si on veut une nav partagée entre
 * toutes les sous-pages non-dashboard.
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
    select: { id: true },
  });
  if (!etab) notFound();

  return <>{children}</>;
}
