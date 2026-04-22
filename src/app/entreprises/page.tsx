import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { listerEntreprises } from "@/lib/entreprises/queries";

export default async function EntreprisesPage() {
  const entreprises = await listerEntreprises();

  // Aucune entreprise → on envoie direct sur l'onboarding : c'est le flux
  // naturel quand on vient de se connecter après signup.
  if (entreprises.length === 0) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
      <header className="flex items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
            §&nbsp;Mes entreprises
          </p>
          <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.05] tracking-[-0.025em]">
            Vos{" "}
            <span className="accent-serif text-[color:var(--warm)]">
              dossiers
            </span>
            .
          </h1>
        </div>
        <Link href="/onboarding" className={buttonVariants({ variant: "outline" })}>
          + Nouvelle entreprise
        </Link>
      </header>

      <ul className="mt-12 divide-y divide-dashed divide-rule/60 border-t border-dashed border-rule/60">
        {entreprises.map((e) => {
          const nbEtabs = e.etablissements.length;
          const nbDuerps = e.etablissements.reduce(
            (acc, etab) => acc + etab._count.duerps,
            0,
          );
          return (
            <li key={e.id}>
              <Link
                href={`/entreprises/${e.id}`}
                className="flex items-center justify-between gap-6 py-5 transition-colors hover:bg-paper-elevated/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-[1.05rem] font-medium tracking-[-0.01em]">
                    {e.raisonSociale}
                  </p>
                  <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
                    NAF {e.codeNaf} · {nbEtabs} établissement
                    {nbEtabs > 1 ? "s" : ""} · {nbDuerps} DUERP
                  </p>
                </div>
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Ouvrir →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
