import { redirect } from "next/navigation";

/**
 * Route legacy. La création d'entreprise passe désormais par le wizard
 * d'onboarding unifié (/onboarding) qui crée Entreprise + premier
 * Etablissement en une seule transaction. On redirige pour conserver
 * les anciens liens.
 */
export default function NouvelleEntreprisePage() {
  redirect("/onboarding");
}
