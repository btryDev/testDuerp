import { redirect } from "next/navigation";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { getEntrepriseDuUser } from "@/lib/entreprises/queries";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Route héritée. Créer une entreprise n'est pas un geste du produit : un compte
 * EST une entreprise (`Entreprise.userId @unique`, ADR-005, que l'ADR-028 ne
 * touche pas). Ce qui se crée, c'est un établissement de plus —
 * `/etablissements/nouveau`.
 *
 * Elle redirigeait en dur vers `/onboarding`, ce qui était juste tant qu'un
 * compte n'avait qu'un dossier : arriver ici sans entreprise et arriver ici
 * avec revenaient au même écran. Ça ne l'est plus — l'onboarding refuse un
 * compte déjà pourvu et renvoie en arrière —, alors on aiguille comme les deux
 * autres routes d'entreprise : l'établissement actif quand il y en a un,
 * l'onboarding sinon.
 */
export default async function NouvelleEntreprisePage() {
  await requireUser();
  const etab = await getOptionalUserEtablissement();
  if (etab) redirect(`/etablissements/${etab.id}`);
  // Même garde que `/entreprises` : un compte sans établissement peut avoir
  // gardé son entreprise, et l'onboarding la recréerait (P2002, 500).
  const entreprise = await getEntrepriseDuUser();
  redirect(entreprise ? "/etablissements/nouveau" : "/onboarding");
}
