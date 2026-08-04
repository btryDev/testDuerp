import Link from "next/link";

/**
 * Guide de mise en place progressif, affiché sur la page "Vue d'ensemble"
 * d'un établissement tant que les étapes de base ne sont pas complètes.
 *
 * Objectif pédagogique : accompagner un dirigeant de TPE non-expert en
 * santé-sécurité en montrant clairement "où j'en suis" et "quoi faire
 * ensuite", sans jargon, avec un pourquoi à chaque étape.
 *
 * Aucune étape n'est bloquante. La checklist s'efface d'elle-même dès
 * que tout est fait — on ne harcèle pas l'utilisateur qui a fini.
 */

export type EtapeOnboarding = {
  id: string;
  titre: string;
  pourquoi: string;
  faite: boolean;
  href?: string;
  /** Texte du bouton d'action. Non affiché si l'étape est faite. */
  cta?: string;
};

export function OnboardingChecklist({
  etapes,
  etablissementRaison,
}: {
  etapes: EtapeOnboarding[];
  etablissementRaison: string;
}) {
  const faites = etapes.filter((e) => e.faite).length;
  const total = etapes.length;
  if (faites === total) return null;

  // Première étape pas faite → c'est celle qu'on met en avant
  const indexProchaine = etapes.findIndex((e) => !e.faite);

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="cartouche relative overflow-hidden"
    >
      {/* Bandeau haut */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-dashed border-rule/60 px-6 pt-6 pb-5 sm:px-8">
        <div className="min-w-0">
          <p
            id="onboarding-heading"
            className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            Guide de mise en place
          </p>
          <h2 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.012em]">
            Quelques étapes pour couvrir l&apos;essentiel de {etablissementRaison}
          </h2>
          <p className="mt-2 max-w-xl text-[0.85rem] leading-relaxed text-muted-foreground">
            Pas d&apos;urgence : chaque étape se traite à votre rythme.
            L&apos;outil met simplement en lumière les éléments qu&apos;un
            contrôle (inspection du travail, commission de sécurité,
            assureur, bailleur) pourrait vous demander.
          </p>
        </div>

        {/* Progression numérique + segments */}
        <div className="flex min-w-[160px] flex-col items-start gap-2 sm:items-end">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Étape {faites + (indexProchaine === -1 ? 0 : 0)}{" "}
            <span className="text-ink">sur {total}</span>
          </p>
          <div className="flex gap-1" aria-hidden>
            {etapes.map((e, i) => (
              <span
                key={e.id}
                className={
                  "h-[5px] w-8 rounded-full " +
                  (e.faite
                    ? "bg-emerald-500"
                    : i === indexProchaine
                      ? "bg-ink"
                      : "bg-rule")
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Liste des étapes */}
      <ol className="divide-y divide-dashed divide-rule/50">
        {etapes.map((e, i) => {
          const prochaine = i === indexProchaine;
          return (
            <li
              key={e.id}
              className={
                "flex items-start gap-4 px-6 py-5 sm:px-8 " +
                (prochaine ? "bg-paper-sunk/30" : "")
              }
            >
              {/* Puce de statut */}
              <div
                aria-hidden
                className={
                  "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border " +
                  (e.faite
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : prochaine
                      ? "border-ink bg-ink text-paper"
                      : "border-rule bg-paper text-muted-foreground")
                }
              >
                {e.faite ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 8.5 6.5 12 13 5" />
                  </svg>
                ) : (
                  <span className="font-mono text-[0.62rem] font-bold tabular-nums">
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="min-w-0 flex-1">
                <p
                  className={
                    "text-[0.95rem] font-semibold tracking-[-0.01em] " +
                    (e.faite ? "text-muted-foreground line-through" : "")
                  }
                >
                  {e.titre}
                </p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {e.pourquoi}
                </p>

                {!e.faite && e.href && e.cta && (
                  <div className="mt-3">
                    <Link
                      href={e.href}
                      className={
                        "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[0.82rem] font-medium transition-colors " +
                        (prochaine
                          ? "bg-ink text-paper hover:bg-ink/90"
                          : "border border-rule bg-paper hover:border-ink")
                      }
                    >
                      {e.cta} →
                    </Link>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Bandeau bas rassurance */}
      <div className="border-t border-dashed border-rule/60 bg-paper-sunk/40 px-6 py-3 sm:px-8">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
          Ce guide disparaîtra automatiquement une fois les étapes complétées.
        </p>
      </div>
    </section>
  );
}
