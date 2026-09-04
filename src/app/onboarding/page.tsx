import { WizardShell } from "@/components/onboarding/WizardShell";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Parcours de mise en place — wizard mono-page (client component) qui
 * pilote 3 étapes :
 *   1. Identité & lieu (raison sociale, SIRET, adresse structurée, NAF, effectif)
 *   2. Typologie (ERP / IGH / habitation, via assistant)
 *   3. Résumé + création transactionnelle
 *
 * Entreprise + premier Etablissement sont créés atomiquement à la fin.
 * Nom d'usage de l'établissement = raison sociale par défaut, modifiable
 * plus tard depuis la page établissement.
 *
 * L'écran a son propre chrome — `AppHeaderGate` masque le header global sur
 * `/onboarding` —, donc il porte lui-même la barre de compte : sans l'email
 * et la déconnexion rendus ici, un compte qui n'a pas encore d'établissement
 * n'avait aucune porte de sortie, ni sur cet écran ni sur l'accueil.
 */
export default async function OnboardingPage() {
  const user = await requireUser();
  return <WizardShell email={user.email} />;
}
