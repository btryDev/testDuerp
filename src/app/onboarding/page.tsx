import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Point d'entrée du wizard d'onboarding. Sera rempli dans les commits
 * suivants avec un WizardShell client + 4 étapes. Ce placeholder permet
 * de livrer la landing page sans lien cassé.
 */
export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 sm:px-10">
      <p className="label-admin mb-3">Mise en place</p>
      <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em]">
        Bientôt : le parcours guidé de mise en place.
      </h1>
      <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-muted-foreground">
        Cette page accueillera prochainement un parcours en 4 étapes qui
        remplacera les formulaires successifs actuels. En attendant, vous
        pouvez utiliser la procédure existante.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
