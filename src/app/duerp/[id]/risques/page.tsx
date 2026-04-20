import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { WizardSteps } from "@/components/duerps/WizardSteps";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { construireEtapes } from "@/lib/duerps/etapes";
import { getDuerp } from "@/lib/duerps/queries";

export default async function RisquesOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();

  const unitesVisibles = duerp.unites.filter((u) => !u.estTransverse);
  const unitesOk = unitesVisibles.length > 0;
  const etapes = construireEtapes(id, "risques", {
    secteurOk: Boolean(duerp.referentielSecteurId),
    unitesOk,
    risquesOk: true,
    transversesOk: duerp.transversesRepondues,
  });

  const totalRisques = unitesVisibles.reduce(
    (acc, u) => acc + u.risques.length,
    0,
  );
  const unitesSansRisqueSansJustif = unitesVisibles.filter(
    (u) => u.risques.length === 0 && !u.aucunRisqueJustif,
  );

  return (
    <div className="space-y-12">
      <WizardSteps etapes={etapes} />

      <header className="max-w-2xl">
        <p className="label-admin inline-flex items-center">
          Risques par unité
          <InfoTooltip align="left">
            Un « risque professionnel » est tout ce qui peut causer un
            accident ou une atteinte à la santé au travail (coupure, chute,
            charge mentale…). Le DUERP doit inventorier ceux présents dans
            chaque unité.
          </InfoTooltip>
        </p>
        <h2 className="mt-4 text-[1.6rem] font-semibold tracking-[-0.018em] leading-tight">
          Pour chaque unité, cochez les risques qui s&apos;appliquent.
        </h2>
      </header>

      <section
        aria-label="Marche à suivre pour chaque unité"
        className="relative overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-[color:var(--warm-soft)] ring-1 ring-[color:var(--warm)]/10"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-dashed border-[color:var(--warm)]/15 px-6 py-3.5 sm:px-8">
          <p className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.18em] text-[color:var(--warm)]">
            Marche à suivre
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--warm)]/60">
            Sur chaque unité de travail
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              titre: "Ouvrir une unité",
              corps:
                "Cliquez sur une unité de la liste ci-dessous pour accéder à ses risques.",
            },
            {
              n: "02",
              titre: "Décocher ce qui ne s'applique pas",
              corps:
                "Les risques du référentiel sectoriel arrivent pré-cochés. Retirez ceux qui ne vous concernent pas.",
            },
            {
              n: "03",
              titre: "Coter chaque risque retenu",
              corps:
                "3 questions comportementales par risque — gravité, probabilité, maîtrise. La criticité se calcule automatiquement.",
            },
            {
              n: "04",
              titre: "Ajouter vos risques spécifiques",
              corps:
                "Un risque particulier à votre activité ? Ajoutez-le manuellement et cotez-le comme les autres.",
            },
          ].map((e, i, arr) => {
            const estDernier = i === arr.length - 1;
            const estAvantDernier = i === arr.length - 2;
            return (
              <li
                key={e.n}
                className={[
                  "flex items-start gap-3 px-5 py-4 sm:px-6",
                  !estDernier
                    ? "border-b border-dashed border-[color:var(--warm)]/15"
                    : "",
                  estAvantDernier ? "sm:border-b-0" : "",
                  i % 2 === 0 ? "sm:border-r sm:border-dashed sm:border-[color:var(--warm)]/15" : "",
                  "lg:border-b-0",
                  !estDernier ? "lg:border-r lg:border-dashed lg:border-[color:var(--warm)]/15" : "lg:border-r-0",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--warm)]/45 font-mono text-[0.68rem] font-semibold tabular-nums text-[color:var(--warm)]"
                >
                  {e.n}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.93rem] font-semibold tracking-[-0.008em] leading-snug text-[color:var(--warm)]">
                    {e.titre}
                  </p>
                  <p className="mt-1 text-[0.8rem] leading-snug text-[color:var(--warm)]/70">
                    {e.corps}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex items-center gap-3 border-t border-dashed border-[color:var(--warm)]/15 px-6 py-2.5 sm:px-8">
          <span
            aria-hidden
            className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--warm)]/55"
          >
            Cas particulier
          </span>
          <p className="flex-1 text-[0.8rem] leading-snug text-[color:var(--warm)]/75">
            Si une unité n&apos;a aucun risque significatif, vous pourrez le
            déclarer explicitement sur sa page.
          </p>
        </div>
      </section>

      <section className="cartouche overflow-hidden">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            {String(unitesVisibles.length).padStart(2, "0")} unité
            {unitesVisibles.length > 1 ? "s" : ""} · {String(totalRisques).padStart(2, "0")} risque
            {totalRisques > 1 ? "s" : ""}
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Cliquez pour ouvrir
          </p>
        </div>

        <ul className="divide-y divide-dashed divide-rule/50">
          {unitesVisibles.map((u) => {
            const nbRisques = u.risques.length;
            const declaree = Boolean(u.aucunRisqueJustif);
            let etatLibelle = "à cocher";
            if (nbRisques > 0)
              etatLibelle = nbRisques > 1 ? "risques" : "risque";
            else if (declaree) etatLibelle = "déclaré";
            return (
              <li key={u.id}>
                <Link
                  href={`/duerp/${id}/risques/${u.id}`}
                  className="group flex items-start justify-between gap-6 px-6 py-5 transition-colors hover:bg-paper-sunk/40 sm:px-8"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[1rem] font-semibold tracking-[-0.01em] leading-snug">
                      {u.nom}
                    </p>
                    {u.description && (
                      <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">
                        {u.description}
                      </p>
                    )}
                    {nbRisques === 0 && declaree && (
                      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[color:var(--warm)]">
                        ✓ Aucun risque significatif — justifié
                      </p>
                    )}
                    {nbRisques === 0 && !declaree && (
                      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                        ⚠ à cocher ou à déclarer sans risque
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p className="[font-family:var(--font-mono)] text-[1.1rem] tabular-nums leading-none">
                        {nbRisques === 0 && declaree
                          ? "—"
                          : String(nbRisques).padStart(2, "0")}
                      </p>
                      <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                        {etatLibelle}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-ink"
                    >
                      Ouvrir →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {unitesSansRisqueSansJustif.length > 0 && (
        <div className="rounded-2xl border border-dashed border-[color:var(--warm)]/40 bg-[color:var(--warm-soft)] px-6 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--warm)]">
            Avertissement
          </p>
          <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink">
            {unitesSansRisqueSansJustif.length} unité
            {unitesSansRisqueSansJustif.length > 1 ? "s n'ont" : " n'a"} aucun
            risque coché. Vous pouvez continuer, mais il est recommandé de
            déclarer explicitement « aucun risque significatif » sur la page
            de chaque unité concernée pour traçabilité.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/duerp/${id}/unites`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Unités
        </Link>
        <Link
          href={`/duerp/${id}/transverses`}
          className={buttonVariants({ size: "lg" })}
        >
          Étape suivante : questions transverses →
        </Link>
      </div>
    </div>
  );
}
