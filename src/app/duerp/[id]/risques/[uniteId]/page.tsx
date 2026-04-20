import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AjouterRisqueCustomForm } from "@/components/duerps/AjouterRisqueCustomForm";
import { DeclarerAucunRisqueForm } from "@/components/duerps/DeclarerAucunRisqueForm";
import { ModifierRisqueCustomButton } from "@/components/duerps/ModifierRisqueCustomButton";
import { RisqueToggleRow } from "@/components/duerps/RisqueToggleRow";
import { SupprimerRisqueButton } from "@/components/duerps/SupprimerRisqueButton";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getUnite } from "@/lib/duerps/queries";
import { risquesProposesPourUnite } from "@/lib/risques/helpers";
import { tousRisquesConnus } from "@/lib/referentiels";

export default async function RisquesUnitePage({
  params,
}: {
  params: Promise<{ id: string; uniteId: string }>;
}) {
  const { id, uniteId } = await params;
  const unite = await getUnite(uniteId);
  if (!unite || unite.duerpId !== id) notFound();

  const refMap = tousRisquesConnus();
  const proposes = risquesProposesPourUnite(unite.referentielUniteId);
  const idsSelectionnes = new Map(
    unite.risques
      .filter((r) => r.referentielId)
      .map((r) => [r.referentielId!, r]),
  );
  const risquesCustom = unite.risques.filter((r) => !r.referentielId);
  const nonSelectionnes = proposes.filter((refId) => !idsSelectionnes.has(refId));

  const risquesRetenus = unite.risques;
  const aCoterCount = risquesRetenus.filter((r) => !r.cotationSaisie).length;

  return (
    <div className="space-y-12">
      <nav>
        <Link
          href={`/duerp/${id}/risques`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Toutes les unités
        </Link>
      </nav>

      <header className="max-w-2xl">
        <p className="label-admin">Unité de travail</p>
        <h2 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.018em] leading-tight">
          {unite.nom}
        </h2>
        {unite.description && (
          <p className="mt-3 text-[0.95rem] leading-[1.7] text-muted-foreground">
            {unite.description}
          </p>
        )}
        <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
          {String(risquesRetenus.length).padStart(2, "0")} risque
          {risquesRetenus.length > 1 ? "s" : ""} retenu
          {risquesRetenus.length > 1 ? "s" : ""}
          {aCoterCount > 0 && (
            <>
              <span className="mx-2 text-rule">·</span>
              <span className="text-[color:var(--warm)]">
                {String(aCoterCount).padStart(2, "0")} à coter
              </span>
            </>
          )}
        </p>
      </header>

      <section className="cartouche">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            Risques retenus
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Enregistrés automatiquement
          </p>
        </div>

        {risquesRetenus.length === 0 ? (
          <p className="px-6 py-8 text-[0.9rem] text-muted-foreground sm:px-8">
            Aucun risque retenu pour cette unité. Cochez dans la liste du
            référentiel ci-dessous, ajoutez un risque personnalisé, ou
            déclarez « aucun risque significatif ».
          </p>
        ) : (
          <ul className="divide-y divide-dashed divide-rule/50">
            {risquesRetenus.map((r) => (
              <li
                key={r.id}
                className="flex flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center sm:px-8"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[1rem] font-semibold tracking-[-0.01em] leading-snug">
                    {r.libelle}
                  </p>
                  {r.description && (
                    <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                  <p className="mt-2 flex flex-wrap items-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.cotationSaisie ? (
                      <span className="inline-flex items-center">
                        Criticité {String(r.criticite).padStart(2, "0")} / 16
                        <InfoTooltip align="left">
                          Indice calculé : (gravité × probabilité) ÷ maîtrise,
                          borné à 16. Plus c&apos;est élevé, plus le risque
                          est à traiter en priorité.
                        </InfoTooltip>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[color:var(--warm)]">
                        Non coté
                        <InfoTooltip align="left">
                          Le risque a été retenu mais pas encore évalué.
                          Cliquez sur « Coter » pour répondre aux 3 questions.
                        </InfoTooltip>
                      </span>
                    )}
                    <span className="mx-2 text-rule">·</span>
                    {String(r.mesures.length).padStart(2, "0")} mesure
                    {r.mesures.length > 1 ? "s" : ""}
                    {!r.referentielId && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        <span className="inline-flex items-center text-[color:var(--warm)]">
                          personnalisé
                          <InfoTooltip align="left">
                            Risque ajouté manuellement (hors référentiel INRS).
                            Vous pouvez le modifier ou le supprimer à tout
                            moment.
                          </InfoTooltip>
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:flex-nowrap">
                  <span className="group/tip relative inline-flex">
                    <Link
                      href={`/duerp/${id}/risques/${uniteId}/${r.id}`}
                      className={buttonVariants({
                        size: "sm",
                        variant: r.cotationSaisie ? "outline" : "default",
                      })}
                    >
                      {r.cotationSaisie ? "Modifier cotation" : "Coter"}
                    </Link>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-max max-w-[17rem] translate-y-1 rounded-md bg-ink px-3 py-2 text-left text-[0.72rem] leading-relaxed text-paper-elevated opacity-0 shadow-lg transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 [font-family:var(--font-body)]"
                    >
                      Répondez à 3 questions simples (gravité, probabilité,
                      maîtrise). La criticité se calcule automatiquement.
                      <span
                        aria-hidden
                        className="absolute right-4 top-full border-4 border-transparent border-t-ink"
                      />
                    </span>
                  </span>
                  {r.cotationSaisie && (
                    <span className="group/tip relative inline-flex">
                      <Link
                        href={`/duerp/${id}/risques/${uniteId}/${r.id}/mesures`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        Mesures
                      </Link>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-max max-w-[17rem] translate-y-1 rounded-md bg-ink px-3 py-2 text-left text-[0.72rem] leading-relaxed text-paper-elevated opacity-0 shadow-lg transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 [font-family:var(--font-body)]"
                      >
                        Mesures de prévention existantes et prévues
                        (EPI, formation, organisation…).
                        <span
                          aria-hidden
                          className="absolute right-4 top-full border-4 border-transparent border-t-ink"
                        />
                      </span>
                    </span>
                  )}
                  {!r.referentielId && (
                    <>
                      <ModifierRisqueCustomButton
                        id={r.id}
                        libelle={r.libelle}
                        description={r.description}
                      />
                      <SupprimerRisqueButton id={r.id} />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {nonSelectionnes.length > 0 && (
        <section className="cartouche overflow-hidden">
          <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
              Autres risques du référentiel
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              {String(nonSelectionnes.length).padStart(2, "0")} à envisager
            </p>
          </div>
          <p className="border-b border-dashed border-rule/50 px-6 py-4 text-[0.88rem] leading-relaxed text-muted-foreground sm:px-8">
            Cochez ceux qui s&apos;appliquent. Les risques non cochés sont
            considérés comme écartés pour cette unité.
          </p>
          <ul className="divide-y divide-dashed divide-rule/50">
            {nonSelectionnes.map((refId) => {
              const ref = refMap.get(refId);
              if (!ref) return null;
              return (
                <li key={refId} className="px-6 py-4 sm:px-8">
                  <RisqueToggleRow
                    uniteId={uniteId}
                    referentielId={refId}
                    libelle={ref.libelle}
                    description={ref.description}
                    selectionne={false}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            Ajouter un risque spécifique
          </p>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <AjouterRisqueCustomForm uniteId={uniteId} />
        </div>
      </section>

      {risquesRetenus.length === 0 && (
        <section>
          <DeclarerAucunRisqueForm
            uniteId={uniteId}
            justifInitiale={unite.aucunRisqueJustif}
          />
        </section>
      )}

      <div className="flex items-center justify-between border-t border-dashed border-rule/60 pt-8">
        <Link
          href={`/duerp/${id}/risques`}
          className={buttonVariants({ variant: "ghost" })}
        >
          Annuler
        </Link>
        <Link
          href={`/duerp/${id}/risques`}
          className={buttonVariants({ size: "lg" })}
        >
          Valider et revenir →
        </Link>
      </div>

      <p className="text-center text-[0.72rem] text-muted-foreground">
        Toutes vos modifications sont enregistrées au fur et à mesure.
        &laquo;&nbsp;Valider et revenir&nbsp;&raquo; vous ramène à la liste
        des unités.
      </p>
    </div>
  );
}
