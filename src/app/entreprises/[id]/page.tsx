import { redirect } from "next/navigation";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { requireUser } from "@/lib/auth/require-user";

/**
 * 1 user = 1 entreprise = 1 établissement.
 * Ancienne page de détail entreprise : redirigée vers le dashboard
 * de l'établissement unique. Les modifs entreprise restent accessibles
 * via /entreprises/[id]/modifier (URL directe).
 */
export default async function EntrepriseDetailPage() {
  await requireUser();
  const etab = await getOptionalUserEtablissement();
  if (etab) redirect(`/etablissements/${etab.id}`);
  redirect("/onboarding");
}
