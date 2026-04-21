import { redirect, notFound } from "next/navigation";
import { getEntreprise } from "@/lib/entreprises/queries";

export default async function EntreprisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entreprise = await getEntreprise(id);
  if (!entreprise) notFound();

  // Un DUERP est désormais rattaché à un établissement (ADR-001). On ouvre
  // le dernier DUERP connu tous établissements confondus ; s'il n'y en a
  // aucun, on retourne à l'accueil.
  const dernierDuerp = entreprise.etablissements
    .flatMap((e) => e.duerps)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
  if (!dernierDuerp) redirect("/");
  redirect(`/duerp/${dernierDuerp.id}`);
}
