import { ArrowUpRight } from "lucide-react";

type Source = {
  titre: string;
  sousTitre: string;
  url: string;
  hote: string;
};

const SOURCES: Source[] = [
  {
    titre: "Légifrance · Code du travail",
    sousTitre: "Partie santé-sécurité, articles L. 4121 à L. 4641",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000006160964/",
    hote: "legifrance.gouv.fr",
  },
  {
    titre: "INRS · Publications ED",
    sousTitre: "Évaluation des risques (ED 840), prévention, secteurs",
    url: "https://www.inrs.fr/",
    hote: "inrs.fr",
  },
  {
    titre: "Ministère du travail",
    sousTitre: "Fiches « Prévention des risques pour la santé au travail »",
    url: "https://travail-emploi.gouv.fr/sante-au-travail/prevention-des-risques-pour-la-sante-au-travail",
    hote: "travail-emploi.gouv.fr",
  },
];

export function SourcesBloc() {
  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl bg-[color:var(--ink)] px-8 py-10 text-[color:var(--paper-elevated)] sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-72 rounded-full bg-[color:color-mix(in_oklch,var(--accent-vif)_22%,transparent)] blur-3xl"
        />

        <div className="relative">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-[color:color-mix(in_oklch,var(--paper-elevated)_55%,transparent)]">
            § Sources primaires
          </p>
          <h2 className="mt-3 text-[1.8rem] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[2.1rem]">
            Tout est{" "}
            <span className="accent-serif italic text-[color:var(--accent-vif)]">
              vérifiable
            </span>
            .
          </h2>
          <p className="mt-3 max-w-[56ch] text-[0.95rem] leading-[1.55] text-[color:color-mix(in_oklch,var(--paper-elevated)_72%,transparent)]">
            Les obligations citées sont construites à partir de sources
            libres d&apos;accès.
          </p>

          <ul className="mt-8 flex flex-col">
            {SOURCES.map((s, i) => (
              <li
                key={s.url}
                className={
                  "group grid grid-cols-[1fr_auto] items-baseline gap-6 py-5 " +
                  (i > 0
                    ? "border-t border-dashed border-[color:color-mix(in_oklch,var(--paper-elevated)_18%,transparent)]"
                    : "")
                }
              >
                <div>
                  <h3 className="text-[1.05rem] font-medium tracking-[-0.012em]">
                    {s.titre}
                  </h3>
                  <p className="mt-1 text-[0.85rem] text-[color:color-mix(in_oklch,var(--paper-elevated)_70%,transparent)]">
                    {s.sousTitre}
                  </p>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--accent-vif)] transition-colors hover:text-[color:var(--paper-elevated)]"
                >
                  {s.hote}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>

          <aside className="mt-8 rounded-lg border-l-4 border-[color:var(--accent-vif)] bg-[color:color-mix(in_oklch,var(--paper-elevated)_8%,transparent)] px-5 py-4">
            <p className="text-[0.88rem] leading-[1.55] text-[color:color-mix(in_oklch,var(--paper-elevated)_90%,transparent)]">
              La plateforme vous aide à structurer et rappelle les
              échéances. Elle ne remplace pas l&apos;avis d&apos;un
              professionnel de la prévention lorsque votre activité
              présente des risques particuliers.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
