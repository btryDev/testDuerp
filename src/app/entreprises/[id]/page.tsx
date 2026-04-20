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

  const dernierDuerp = entreprise.duerps[0];
  if (!dernierDuerp) redirect("/");
  redirect(`/duerp/${dernierDuerp.id}`);
}
