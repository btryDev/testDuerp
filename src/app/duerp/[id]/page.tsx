import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getDuerp } from "@/lib/duerps/queries";

export default async function DuerpIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();
  redirect(`/duerp/${id}/${duerp.referentielSecteurId ? "unites" : "secteur"}`);
}
