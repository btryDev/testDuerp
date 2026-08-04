import { redirect } from "next/navigation";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { requireUser } from "@/lib/auth/require-user";

/**
 * 1 user = 1 entreprise = 1 établissement.
 * Cette route est un simple aiguilleur : vers le dashboard si l'user a
 * déjà un établissement, sinon vers l'onboarding. Elle reste réachée
 * depuis d'anciens liens / signets — on ne la casse pas, on la redirige.
 */
export default async function EntreprisesPage() {
  await requireUser();
  const etab = await getOptionalUserEtablissement();
  if (etab) redirect(`/etablissements/${etab.id}`);
  redirect("/onboarding");
}
