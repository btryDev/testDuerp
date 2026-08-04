import { WizardShell } from "@/components/onboarding/WizardShell";

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
 */
export default function OnboardingPage() {
  return <WizardShell />;
}
