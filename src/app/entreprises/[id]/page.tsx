import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getEntreprise } from "@/lib/entreprises/queries";

function resumeRegimes(etab: {
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: string | null;
  categorieErp: string | null;
  classeIgh: string | null;
}): string {
  const parts: string[] = [];
  if (etab.estEtablissementTravail) parts.push("Travail");
  if (etab.estERP) {
    const precisions = [etab.typeErp, etab.categorieErp?.replace("N", "cat. ")]
      .filter(Boolean)
      .join(" · ");
    parts.push(precisions ? `ERP ${precisions}` : "ERP");
  }
  if (etab.estIGH) parts.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) parts.push("Habitation");
  return parts.join(" · ");
}

export default async function EntreprisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entreprise = await getEntreprise(id);
  if (!entreprise) notFound();

  const etablissements = entreprise.etablissements;
  const duerpsTotalCount = etablissements.reduce(
    (acc, e) => acc + e.duerps.length,
    0,
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href="/"
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Accueil
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Entreprise</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            {entreprise.raisonSociale}
          </h1>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            NAF {entreprise.codeNaf}
            <span className="mx-2 text-rule">·</span>
            {entreprise.effectif} salarié{entreprise.effectif > 1 ? "s" : ""}
            {entreprise.siret && (
              <>
                <span className="mx-2 text-rule">·</span>
                SIRET {entreprise.siret}
              </>
            )}
          </p>
        </div>
        <Link
          href={`/entreprises/${id}/modifier`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Modifier l&apos;entreprise
        </Link>
      </header>

      <div className="filet-pointille my-10" />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="label-admin">Établissements</p>
            <h2 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.012em]">
              {etablissements.length === 0
                ? "Aucun établissement"
                : `${etablissements.length} site${
                    etablissements.length > 1 ? "s" : ""
                  } · ${duerpsTotalCount} DUERP`}
            </h2>
          </div>
          <Link
            href={`/etablissements/nouveau?entrepriseId=${id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            + Nouvel établissement
          </Link>
        </div>

        {etablissements.length === 0 ? (
          <div className="cartouche flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
            <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
              Aucun établissement déclaré. Créez votre premier site pour
              commencer l&apos;évaluation des risques.
            </p>
            <Link
              href={`/etablissements/nouveau?entrepriseId=${id}`}
              className={buttonVariants()}
            >
              Déclarer un premier établissement →
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {etablissements.map((etab) => {
              const dernierDuerp = etab.duerps[0];
              return (
                <li key={etab.id} className="cartouche">
                  <div className="flex flex-col gap-4 border-b border-dashed border-rule/50 px-6 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-8">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Link
                        href={`/etablissements/${etab.id}`}
                        className="group inline-flex items-baseline gap-2"
                      >
                        <span className="text-[1.05rem] font-semibold tracking-[-0.01em] group-hover:underline">
                          {etab.raisonDisplay}
                        </span>
                      </Link>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                        {etab.adresse}
                        <span className="mx-2 text-rule">·</span>
                        {etab.effectifSurSite} salarié
                        {etab.effectifSurSite > 1 ? "s" : ""}
                      </p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                        {resumeRegimes(etab) || "Régime non précisé"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {dernierDuerp ? (
                        <Link
                          href={`/duerp/${dernierDuerp.id}`}
                          className={buttonVariants({ size: "sm" })}
                        >
                          Ouvrir le DUERP →
                        </Link>
                      ) : (
                        <Link
                          href={`/etablissements/${etab.id}`}
                          className={buttonVariants({ size: "sm" })}
                        >
                          Initier un DUERP
                        </Link>
                      )}
                      <Link
                        href={`/etablissements/${etab.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Détail
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
