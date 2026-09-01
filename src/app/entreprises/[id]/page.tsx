import { redirect } from "next/navigation";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { getEntrepriseDuUser } from "@/lib/entreprises/queries";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Ancienne page de détail entreprise : redirigée vers l'établissement ACTIF
 * (ADR-028) — il n'y a plus « l'établissement du compte » à désigner, mais il y
 * a toujours celui sur lequel on travaillait. Les modifications d'entreprise
 * restent accessibles via /entreprises/[id]/modifier (URL directe).
 */
export default async function EntrepriseDetailPage() {
  await requireUser();
  const etab = await getOptionalUserEtablissement();
  if (etab) redirect(`/etablissements/${etab.id}`);
  // Même garde que `/entreprises` : un compte sans établissement peut avoir
  // gardé son entreprise, et l'onboarding la recréerait (P2002, 500).
  const entreprise = await getEntrepriseDuUser();
  redirect(entreprise ? "/etablissements/nouveau" : "/onboarding");
}
