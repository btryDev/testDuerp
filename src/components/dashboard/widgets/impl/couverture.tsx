"use client";

// Ce que l'outil ne dit pas, au tableau de bord.
//
// Le bandeau du calendrier et celui du registre arrivent au moment où le
// dirigeant lit déjà un contenu. Il manquait l'endroit où la question se pose
// d'elle-même : « qu'est-ce que cet outil ne me dit pas ? » — sans ouvrir un
// PDF, sans descendre dans une page.
//
// Widget **obligatoire** : il ne se retire pas. Un manque qu'on peut décocher
// n'est plus une déclaration, c'est une option ; et le premier geste d'un
// dirigeant pressé serait de décocher celui-là. Il se masque en revanche
// quand il n'y a rien à signaler (`visibleQuand`) — une carte qui répète
// « rien à signaler » finit par ne plus se lire, et le jour où elle dit
// quelque chose personne ne le voit.

import { AlertTriangle, HelpCircle } from "lucide-react";
import type { DashboardBundle } from "../types";

export function WidgetCouverture({ bundle }: { bundle: DashboardBundle }) {
  const c = bundle.couverture;
  if (!c) return null;

  const entrees = [
    ...c.manques.map((m) => ({
      ton: "signal" as const,
      motif: m.motif,
      suite: m.consequence,
      details: m.details,
    })),
    ...c.indeterminations.map((i) => ({
      ton: "ambre" as const,
      motif: i.motif,
      suite: i.quoiFaire,
      details: undefined,
    })),
  ];
  if (entrees.length === 0) return null;

  return (
    <div className="flex h-full flex-col gap-4">
      <p className="m-0 max-w-[62ch] text-[13px] leading-[1.55] text-[color:var(--board-slate-mid)]">
        Ce que Rojer ne sait pas dire de ce dossier. Aucune de ces lignes n&apos;est
        un reproche ni un constat de non-conformité : ce sont les bords du
        référentiel, nommés pour que vous sachiez où ils passent.
      </p>

      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {entrees.map((e, i) => {
          const signal = e.ton === "signal";
          return (
            <li key={i} className="flex min-w-0 gap-3">
              <span
                className="mt-0.5 flex-none"
                style={{
                  color: signal
                    ? "var(--board-signal-ink)"
                    : "var(--board-amber-ink)",
                }}
              >
                {signal ? (
                  <AlertTriangle aria-hidden className="size-4" />
                ) : (
                  <HelpCircle aria-hidden className="size-4" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className="m-0 text-[13.5px] font-semibold leading-[1.4] tracking-[-0.015em]"
                  style={{
                    color: signal
                      ? "var(--board-signal-ink)"
                      : "var(--board-amber-ink)",
                  }}
                >
                  {e.motif}
                </p>
                <p className="m-0 mt-1.5 max-w-[68ch] text-[12.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
                  {e.suite}
                </p>
                {e.details && e.details.length > 0 ? (
                  // Repliés par défaut : la liste est longue parce que la
                  // dette l'est, et déployée elle noierait les quatre autres
                  // axes. Un `<details>` natif — pas d'état à porter, et le
                  // contenu reste dans le DOM pour la recherche du navigateur
                  // et pour l'impression.
                  <details className="group mt-3">
                    <summary className="cursor-pointer list-none text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]">
                      Voir les {e.details.length} articles
                      <span className="group-open:hidden"> ›</span>
                      <span className="hidden group-open:inline"> ⌄</span>
                    </summary>
                    <ul className="m-0 mt-3 flex list-none flex-col gap-3 border-l border-[color:var(--board-slate-line)] p-0 pl-4">
                      {e.details.map((d) => (
                        <li key={`${d.titre}-${d.texte.slice(0, 24)}`}>
                          <p className="m-0 text-[12.5px] font-semibold leading-[1.4] text-[color:var(--board-ink)]">
                            {d.titre}
                          </p>
                          <p className="m-0 mt-1 max-w-[76ch] text-[12px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                            {d.texte}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
