import Link from "next/link";
import { notFound } from "next/navigation";
import { CotationForm } from "@/components/duerps/CotationForm";
import { EvaluationProgression } from "@/components/duerps/EvaluationProgression";
import { getRisque } from "@/lib/risques/queries";

export default async function CotationPage({
  params,
}: {
  params: Promise<{ id: string; uniteId: string; risqueId: string }>;
}) {
  const { id, uniteId, risqueId } = await params;
  const risque = await getRisque(risqueId);
  if (
    !risque ||
    risque.uniteId !== uniteId ||
    risque.unite.duerpId !== id
  ) {
    notFound();
  }

  const risquesUnite = risque.unite.risques;
  const idxCourant = risquesUnite.findIndex((r) => r.id === risqueId);
  const suivant = risquesUnite
    .slice(idxCourant + 1)
    .find((r) => !r.cotationSaisie);

  const hrefRetourUnite = `/duerp/${id}/risques/${uniteId}`;
  const hrefCotation = `/duerp/${id}/risques/${uniteId}/${risqueId}`;
  const hrefMesures = `/duerp/${id}/risques/${uniteId}/${risqueId}/mesures`;
  const hrefSuivant = suivant
    ? `/duerp/${id}/risques/${uniteId}/${suivant.id}`
    : undefined;

  return (
    <div className="space-y-10">
      <nav>
        <Link
          href={hrefRetourUnite}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {risque.unite.nom}
        </Link>
      </nav>

      <header className="max-w-2xl space-y-4">
        <div className="flex flex-wrap items-baseline gap-2 font-mono text-[0.66rem] uppercase tracking-[0.18em]">
          <span className="label-admin !text-ink !tracking-[0.18em]">
            Évaluation du risque
          </span>
          <span aria-hidden className="text-rule">
            ·
          </span>
          <span className="tabular-nums text-muted-foreground">
            {String(idxCourant + 1).padStart(2, "0")}
            <span className="mx-1 text-rule">/</span>
            {String(risquesUnite.length).padStart(2, "0")}
          </span>
          <span aria-hidden className="text-rule">
            ·
          </span>
          <span className="text-muted-foreground">
            {risque.cotationSaisie ? "déjà coté" : "à coter"}
          </span>
        </div>
        <h2 className="text-[1.8rem] font-semibold tracking-[-0.022em] leading-[1.12]">
          {risque.libelle}
        </h2>
        {risque.description && (
          <p className="text-[0.95rem] leading-[1.7] text-muted-foreground">
            {risque.description}
          </p>
        )}
      </header>

      <EvaluationProgression
        etape="cotation"
        cotationSaisie={risque.cotationSaisie}
        nombreMesures={risque.mesures.length}
        hrefCotation={hrefCotation}
        hrefMesures={hrefMesures}
      />

      <section
        aria-labelledby="partie-cotation"
        className="space-y-8 pt-2"
      >
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[1.1rem] font-semibold tabular-nums text-[color:var(--warm)]">
            01
          </span>
          <h3
            id="partie-cotation"
            className="text-[1.1rem] font-semibold tracking-[-0.012em]"
          >
            Cotation
          </h3>
          <span aria-hidden className="text-rule">
            /
          </span>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            3 questions — criticité calculée
          </p>
        </div>

        <CotationForm
          risqueId={risqueId}
          initial={{
            gravite: risque.gravite,
            probabilite: risque.probabilite,
            maitrise: risque.maitrise,
            nombreSalariesExposes: risque.nombreSalariesExposes,
            dateMesuresPhysiques: risque.dateMesuresPhysiques
              ? risque.dateMesuresPhysiques.toISOString().slice(0, 10)
              : null,
            exposeCMR: risque.exposeCMR,
          }}
          cotationSaisie={risque.cotationSaisie}
          hrefRetourUnite={hrefRetourUnite}
          hrefMesures={hrefMesures}
          hrefSuivant={hrefSuivant}
        />
      </section>
    </div>
  );
}
