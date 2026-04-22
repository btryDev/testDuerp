import { notFound } from "next/navigation";
import { EtablissementNav } from "@/components/layout/EtablissementNav";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Layout imbriqué pour toutes les pages d'un établissement.
 * Lit l'entité minimum pour le fil d'Ariane + la nav contextuelle.
 * L'appel DB est léger (select ciblé) et partagé par toutes les pages
 * descendantes grâce au cache de requête Next.js.
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
      entrepriseId: true,
      entreprise: { select: { raisonSociale: true } },
    },
  });
  if (!etab) notFound();

  return (
    <>
      <EtablissementNav
        etablissementId={etab.id}
        raisonDisplay={etab.raisonDisplay}
        entrepriseRaison={etab.entreprise.raisonSociale}
        entrepriseId={etab.entrepriseId}
      />
      {children}
    </>
  );
}
