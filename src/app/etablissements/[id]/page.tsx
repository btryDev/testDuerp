import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CreerDuerpButton } from "@/components/duerps/CreerDuerpButton";
import { SupprimerEtablissementButton } from "@/components/etablissements/SupprimerEtablissementButton";
import { getEtablissement } from "@/lib/etablissements/queries";

function regimes(etab: {
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: string | null;
  categorieErp: string | null;
  classeIgh: string | null;
}): string[] {
  const out: string[] = [];
  if (etab.estEtablissementTravail) out.push("Établissement de travail");
  if (etab.estERP)
    out.push(
      `ERP ${etab.typeErp ?? ""}${
        etab.categorieErp ? ` · cat. ${etab.categorieErp.slice(1)}` : ""
      }`.trim(),
    );
  if (etab.estIGH)
    out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) out.push("Habitation");
  return out;
}

export default async function EtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const regs = regimes(etab);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/entreprises/${etab.entrepriseId}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etab.entreprise.raisonSociale}
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Établissement</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            {etab.raisonDisplay}
          </h1>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            {etab.adresse}
            <span className="mx-2 text-rule">·</span>
            {etab.effectifSurSite} salarié
            {etab.effectifSurSite > 1 ? "s" : ""} sur site
            {etab.codeNaf && (
              <>
                <span className="mx-2 text-rule">·</span>
                NAF {etab.codeNaf}
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {regs.map((r) => (
              <span
                key={r}
                className="rounded-full border border-rule bg-paper-sunk/60 px-3 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/etablissements/${id}/modifier`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Modifier
          </Link>
          <SupprimerEtablissementButton id={id} />
        </div>
      </header>

      <div className="filet-pointille my-10" />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.012em]">
            DUERP de cet établissement
          </h2>
          {etab.duerps.length === 0 ? null : (
            <CreerDuerpButton etablissementId={id} variant="outline" />
          )}
        </div>

        {etab.duerps.length === 0 ? (
          <div className="cartouche flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucun DUERP n&apos;a encore été initié pour cet établissement.
            </p>
            <CreerDuerpButton etablissementId={id} />
          </div>
        ) : (
          <ul className="cartouche divide-y divide-dashed divide-rule/50">
            {etab.duerps.map((d) => {
              const derniere = d.versions[0];
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8"
                >
                  <div>
                    <p className="text-[0.95rem] font-semibold">
                      DUERP démarré le{" "}
                      {d.createdAt.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {derniere
                        ? `Version ${derniere.numero} · ${derniere.createdAt.toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}`
                        : "Pas encore validé"}
                    </p>
                  </div>
                  <Link
                    href={`/duerp/${d.id}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Ouvrir →
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
