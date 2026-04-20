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
        <p className="mt-4 text-[0.95rem] leading-[1.7] text-muted-foreground">
          Les risques du référentiel sectoriel sont proposés pré-cochés.
          Décochez ce qui ne s&apos;applique pas, cotez la gravité via les
          questions comportementales, et ajoutez des risques spécifiques si
          besoin. Si une unité n&apos;a aucun risque significatif, vous
          pourrez le déclarer explicitement sur sa page.
        </p>
      </header>

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
