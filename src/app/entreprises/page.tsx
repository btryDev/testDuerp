import { redirect } from "next/navigation";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { getEntrepriseDuUser } from "@/lib/entreprises/queries";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Aiguilleur : vers l'établissement ACTIF si le compte en a un, sinon vers
 * l'onboarding. La route reste atteinte depuis d'anciens liens et signets — on
 * ne la casse pas, on la redirige.
 *
 * Elle ne devient pas une liste d'entreprises avec l'ADR-028 : un compte reste
 * une entreprise (`Entreprise.userId @unique`), et ce sont les ÉTABLISSEMENTS
 * qui se sont multipliés. Un écran « mes entreprises » afficherait une liste
 * d'un élément et laisserait croire qu'on peut en ouvrir une seconde. Le
 * sélecteur de la barre haute est l'endroit où l'on commute (ADR-028).
 */
export default async function EntreprisesPage() {
  await requireUser();
  const etab = await getOptionalUserEtablissement();
  if (etab) redirect(`/etablissements/${etab.id}`);
  // Un compte peut avoir une entreprise et plus aucun établissement : la
  // suppression du dernier est permise tant qu'aucune version de DUERP n'est
  // figée (ADR-012). Le renvoyer à l'onboarding le ferait buter sur le
  // `tx.entreprise.create` de `finaliserOnboarding`, qui ne demande pas si
  // l'entreprise existe : violation de `Entreprise.userId @unique`, P2002 non
  // traitée, 500. L'onboarding crée l'entreprise ET son premier établissement —
  // il ne sait pas n'en créer qu'un des deux. On l'envoie donc là où l'on
  // ouvre un établissement de plus.
  const entreprise = await getEntrepriseDuUser();
  redirect(entreprise ? "/etablissements/nouveau" : "/onboarding");
}
