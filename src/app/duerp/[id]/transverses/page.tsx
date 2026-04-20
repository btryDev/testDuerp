import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { QuestionTransverseRow } from "@/components/duerps/QuestionTransverseRow";
import { ValiderTransversesButton } from "@/components/duerps/ValiderTransversesButton";
import { WizardSteps } from "@/components/duerps/WizardSteps";
import { construireEtapes } from "@/lib/duerps/etapes";
import { getDuerp } from "@/lib/duerps/queries";
import {
  questionsDetectionTransverses,
  risquesTransverses,
} from "@/lib/referentiels";

export default async function TransversesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();

  const unitesSaisies = duerp.unites.filter((u) => !u.estTransverse);
  const uniteTransverse = duerp.unites.find((u) => u.estTransverse);
  const risquesTransversesActifs = new Set(
    (uniteTransverse?.risques ?? [])
      .map((r) => r.referentielId)
      .filter((x): x is string => Boolean(x)),
  );

  const unitesOk = unitesSaisies.length > 0;
  const risquesOk =
    unitesOk && unitesSaisies.every((u) => u.risques.length > 0);
  const etapes = construireEtapes(id, "transverses", {
    secteurOk: Boolean(duerp.referentielSecteurId),
    unitesOk,
    risquesOk,
    transversesOk: duerp.transversesRepondues,
  });

  const risquesParId = new Map(risquesTransverses.map((r) => [r.id, r]));

  return (
    <div className="space-y-8">
      <WizardSteps etapes={etapes} />

      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Questions transverses
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ces questions couvrent des risques présents dans la plupart des
          entreprises, quel que soit le métier. Chaque « oui » ajoute
          automatiquement le risque correspondant à votre DUERP — vous pourrez
          ensuite le coter comme les autres.
        </p>
      </div>

      <ul className="space-y-3">
        {questionsDetectionTransverses.map((q) => {
          const risque = risquesParId.get(q.risqueIdAssocie);
          if (!risque) return null;
          return (
            <QuestionTransverseRow
              key={q.id}
              duerpId={id}
              referentielId={q.risqueIdAssocie}
              intitule={q.intitule}
              libelleRisque={risque.libelle}
              active={risquesTransversesActifs.has(q.risqueIdAssocie)}
            />
          );
        })}
      </ul>

      {uniteTransverse && uniteTransverse.risques.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                {uniteTransverse.risques.length} risque
                {uniteTransverse.risques.length > 1 ? "s" : ""} transverse
                {uniteTransverse.risques.length > 1 ? "s" : ""} ajouté
                {uniteTransverse.risques.length > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {
                  uniteTransverse.risques.filter((r) => !r.cotationSaisie)
                    .length
                }{" "}
                à coter. Ils apparaissent dans l&apos;unité « Risques
                transverses ».
              </p>
            </div>
            <Link
              href={`/duerp/${id}/risques/${uniteTransverse.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Coter les risques transverses →
            </Link>
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <Link
          href={`/duerp/${id}/risques`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Risques
        </Link>
        <ValiderTransversesButton
          duerpId={id}
          hrefSuivant={`/duerp/${id}/synthese`}
        />
      </div>
    </div>
  );
}
