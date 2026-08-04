import { redirect } from "next/navigation";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { requireUser } from "@/lib/auth/require-user";

/**
 * 1 user = 1 établissement. Plus de parcours de création additionnel :
 * si l'user a déjà un établissement, retour dashboard ; sinon l'onboarding
 * est le chemin canonique.
 */
export default async function EtablissementNouveauPage() {
  await requireUser();
  const etab = await getOptionalUserEtablissement();
  if (etab) redirect(`/etablissements/${etab.id}`);
  redirect("/onboarding");
}
