import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AjouterMesureCustomForm } from "@/components/duerps/AjouterMesureCustomForm";
import { EvaluationProgression } from "@/components/duerps/EvaluationProgression";
import { MesureReferentielToggle } from "@/components/duerps/MesureReferentielToggle";
import { MesureRow } from "@/components/duerps/MesureRow";
import { mesuresUniquementBasNiveau, trierParHierarchie } from "@/lib/prevention";
import { tousRisquesConnus } from "@/lib/referentiels";
import { getRisque } from "@/lib/risques/queries";
import type { TypeMesure } from "@/lib/referentiels/types";

export default async function MesuresPage({
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

  const mesuresRef = risque.referentielId
    ? tousRisquesConnus().get(risque.referentielId)?.mesuresRecommandees ?? []
    : [];
  const idsSelectionnes = new Set(
    risque.mesures
      .map((m) => m.referentielMesureId)
      .filter((x): x is string => Boolean(x)),
  );
  const mesuresRefNonSelectionnees = mesuresRef.filter(
    (m) => !idsSelectionnes.has(m.id),
  );

  const typesRetenus = risque.mesures.map((m) => m.type as TypeMesure);
  const alerteBasNiveau = mesuresUniquementBasNiveau(typesRetenus);

  const mesuresAffichees = trierParHierarchie(
    risque.mesures.map((m) => ({ ...m, type: m.type as TypeMesure })),
  );

  const hrefUnite = `/duerp/${id}/risques/${uniteId}`;
  const hrefCotation = `/duerp/${id}/risques/${uniteId}/${risqueId}`;
  const hrefMesures = `/duerp/${id}/risques/${uniteId}/${risqueId}/mesures`;
  const risquesUnite = risque.unite.risques;
  const idxCourant = risquesUnite.findIndex((r) => r.id === risqueId);
  const suivant = risquesUnite.slice(idxCourant + 1)[0];
  const hrefSuivant = suivant
    ? `/duerp/${id}/risques/${uniteId}/${suivant.id}`
    : undefined;

  return (
    <div className="space-y-10">
      <nav>
        <Link
          href={hrefUnite}
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
        </div>
        <h2 className="text-[1.8rem] font-semibold tracking-[-0.022em] leading-[1.12]">
          {risque.libelle}
        </h2>
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
          Criticité cotée{" "}
          <span className="text-ink tabular-nums">
            {String(risque.criticite).padStart(2, "0")} / 16
          </span>
          <span className="mx-2 text-rule">·</span>
          <Link
            href={hrefCotation}
            className="underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink [font-family:var(--font-body)] normal-case tracking-normal text-[0.78rem]"
          >
            revoir la cotation
          </Link>
        </p>
      </header>

      <EvaluationProgression
        etape="mesures"
        cotationSaisie={risque.cotationSaisie}
        nombreMesures={risque.mesures.length}
        hrefCotation={hrefCotation}
        hrefMesures={hrefMesures}
      />

      <section aria-labelledby="partie-mesures" className="space-y-8 pt-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-[1.1rem] font-semibold tabular-nums text-[color:var(--warm)]">
            02
          </span>
          <h3
            id="partie-mesures"
            className="text-[1.1rem] font-semibold tracking-[-0.012em]"
          >
            Mesures de prévention
          </h3>
          <span aria-hidden className="text-rule">
            /
          </span>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            Hiérarchie L. 4121-2 — existantes et prévues
          </p>
        </div>

        <p className="max-w-2xl text-[0.9rem] leading-[1.65] text-muted-foreground">
          Sélectionnez les mesures déjà en place et celles que vous comptez
          mettre en œuvre. La loi impose de privilégier la suppression du
          risque, puis sa réduction à la source, puis la protection collective
          — les EPI et la formation viennent ensuite. Si votre inventaire
          diffère de ce que vous avez coté pour la maîtrise, vous pourrez
          revenir ajuster la cotation.
        </p>

        {alerteBasNiveau && (
          <div className="rounded-[calc(var(--radius)*1.4)] border border-dashed border-[color:var(--minium)]/40 bg-[color:var(--minium)]/8 px-5 py-4">
            <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[color:var(--minium)]">
              Hiérarchie de prévention · art. L. 4121-2
            </p>
            <p className="mt-2 text-[0.88rem] leading-[1.6] text-ink">
              Les mesures retenues ne comportent que des EPI, de la formation
              ou de l&apos;organisation. Avez-vous étudié une solution
              collective ou une réduction à la source ? Le Code du travail
              impose de prioriser ces approches avant les EPI.
            </p>
          </div>
        )}

        <section className="cartouche overflow-hidden">
          <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Mesures retenues
            </p>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {String(mesuresAffichees.length).padStart(2, "0")} au total
            </p>
          </div>
          {mesuresAffichees.length === 0 ? (
            <p className="px-6 py-8 text-[0.9rem] text-muted-foreground sm:px-8">
              Aucune mesure retenue pour ce risque. Cochez ci-dessous dans le
              référentiel, ou ajoutez une mesure personnalisée.
            </p>
          ) : (
            <ul className="divide-y divide-dashed divide-rule/50">
              {mesuresAffichees.map((m) => (
                <li key={m.id} className="px-6 py-4 sm:px-8">
                  <MesureRow
                    id={m.id}
                    libelle={m.libelle}
                    type={m.type}
                    statut={m.statut as "existante" | "prevue"}
                    echeance={m.echeance}
                    responsable={m.responsable}
                    origine={m.referentielMesureId ? "referentiel" : "custom"}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {mesuresRefNonSelectionnees.length > 0 && (
          <section className="cartouche overflow-hidden">
            <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                Mesures recommandées par le référentiel
              </p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                {String(mesuresRefNonSelectionnees.length).padStart(2, "0")} à
                envisager
              </p>
            </div>
            <p className="border-b border-dashed border-rule/50 px-6 py-4 text-[0.86rem] leading-relaxed text-muted-foreground sm:px-8">
              Cochez celles qui sont déjà en place ou prévues. Vous pourrez
              ensuite préciser le statut (existante / prévue), l&apos;échéance
              et le responsable.
            </p>
            <ul className="divide-y divide-dashed divide-rule/50">
              {mesuresRefNonSelectionnees.map((m) => (
                <li key={m.id} className="px-6 py-4 sm:px-8">
                  <MesureReferentielToggle
                    risqueId={risqueId}
                    mesureRefId={m.id}
                    libelle={m.libelle}
                    type={m.type}
                    selectionne={false}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Ajouter une mesure personnalisée
            </p>
          </div>
          <div className="px-6 py-5 sm:px-8">
            <AjouterMesureCustomForm risqueId={risqueId} />
          </div>
        </section>
      </section>

      {/* Actions */}
      <div className="space-y-4 border-t border-dashed border-rule pt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link
            href={hrefUnite}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Retour à l&apos;unité
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={hrefCotation}
              className={buttonVariants({ variant: "outline" })}
            >
              ← Revoir la cotation
            </Link>
            {hrefSuivant ? (
              <Link
                href={hrefSuivant}
                className={buttonVariants({ size: "lg" })}
              >
                Risque suivant →
              </Link>
            ) : (
              <Link
                href={hrefUnite}
                className={buttonVariants({ size: "lg" })}
              >
                Valider et revenir à l&apos;unité →
              </Link>
            )}
          </div>
        </div>

        <p className="text-center text-[0.72rem] leading-relaxed text-muted-foreground">
          Les mesures sont enregistrées au fur et à mesure. « Risque suivant »
          vous fait reprendre l&apos;évaluation sur le risque suivant de
          l&apos;unité.
        </p>
      </div>
    </div>
  );
}
