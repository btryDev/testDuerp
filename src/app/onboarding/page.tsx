import { WizardShell } from "@/components/onboarding/WizardShell";

/**
 * Parcours de mise en place — wizard mono-page (client component) qui
 * pilote 4 étapes :
 *   1. Identité juridique (raison sociale + SIRET)
 *   2. Établissement (nom d'usage, adresse, NAF, effectif)
 *   3. Typologie (ERP / IGH / habitation, via assistant — commit suivant)
 *   4. Résumé + création transactionnelle (commit suivant)
 *
 * Entreprise + premier Etablissement sont créés atomiquement à la fin.
 * Pas de duplication : adresse / NAF / effectif saisis UNE seule fois
 * puis copiés dans les deux entités.
 */
export default function OnboardingPage() {
  return <WizardShell />;
}
