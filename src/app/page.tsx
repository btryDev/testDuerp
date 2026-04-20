import { EntrepriseForm } from "@/components/entreprises/EntrepriseForm";
import { creerEntreprise } from "@/lib/entreprises/actions";

type Etape = {
  numero: string;
  titre: string;
  corps: string;
  illustration: React.ReactNode;
};

const ETAPES: Etape[] = [
  {
    numero: "01",
    titre: "Entreprise",
    corps: "SIRET, NAF, effectif, adresse.",
    illustration: <IlloFormulaire />,
  },
  {
    numero: "02",
    titre: "Unités & risques",
    corps: "Pré-cochés selon le secteur.",
    illustration: <IlloChecklist />,
  },
  {
    numero: "03",
    titre: "Cotation",
    corps: "Questions comportementales, sans note.",
    illustration: <IlloCotation />,
  },
  {
    numero: "04",
    titre: "Document généré",
    corps: "PDF horodaté, plan d'actions priorisé.",
    illustration: <IlloDocument />,
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-10 sm:px-12 sm:py-14">
      <header className="flex items-center justify-between">
        <p className="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-ink">
          DUERP
        </p>
        <p className="font-mono text-[0.66rem] tracking-[0.18em] uppercase text-muted-foreground">
          Générateur
        </p>
      </header>

      <div className="filet-pointille mt-6" />

      <section className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        {/* ─── Left column: title + compact step list ───────────── */}
        <div>
          <p className="label-admin mb-5">Générateur DUERP</p>
          <h1 className="display-xl text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Votre DUERP,
            <br />
            <span className="text-[color:var(--warm)]">étape par étape</span>.
          </h1>
          <p className="mt-6 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            Questionnaire guidé structuré sur les publications INRS. Vous
            renseignez, vous cochez, vous téléchargez le PDF.
          </p>

          <ol className="mt-12 divide-y divide-dashed divide-rule/60 border-y border-dashed border-rule/60">
            {ETAPES.map((e) => (
              <li
                key={e.numero}
                className="grid grid-cols-[auto_1fr] items-center gap-5 py-4"
              >
                <span className="flex h-12 w-16 items-center justify-center rounded-md bg-paper-sunk/70 ring-1 ring-rule-soft">
                  {e.illustration}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="tabular-nums">étape {e.numero}</span>
                    <span
                      aria-hidden
                      className="flex-1 border-t border-dashed border-rule/60 translate-y-[-0.2em]"
                    />
                  </div>
                  <p className="mt-1.5 text-[0.98rem] font-semibold leading-tight tracking-[-0.01em]">
                    {e.titre}
                  </p>
                  <p className="mt-0.5 text-[0.82rem] text-muted-foreground">
                    {e.corps}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ─── Right column: direct creation form ───────────────── */}
        <div className="cartouche px-6 py-10 sm:px-10 sm:py-12">
          <p className="label-admin mb-3">Nouveau dossier</p>
          <h2 className="text-[1.3rem] font-semibold tracking-[-0.015em] leading-tight">
            Renseigner l&apos;entreprise
          </h2>
          <p className="mt-2 text-[0.85rem] text-muted-foreground">
            Ces informations figurent en en-tête du DUERP.
          </p>

          <div className="filet-pointille my-8" />

          <EntrepriseForm
            action={creerEntreprise}
            libelleSubmit="Continuer →"
          />
        </div>
      </section>

      <div className="filet-pointille mt-20" />

      <p className="mt-6 max-w-2xl text-[0.72rem] leading-relaxed text-muted-foreground">
        Outil d&apos;aide à la rédaction structuré sur les publications INRS
        / OiRA. Ne constitue pas un conseil juridique. La responsabilité de
        l&apos;évaluation des risques et des mesures prises reste celle de
        l&apos;employeur ; la conformité du document final s&apos;apprécie au
        cas par cas.
      </p>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Illustrations compactes (48×36 environ)
   ───────────────────────────────────────────────────────────────── */

function IlloFormulaire() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <rect
        x="2"
        y="2"
        width="36"
        height="24"
        rx="2"
        fill="var(--paper-elevated)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.45">
        <line x1="6" y1="8" x2="22" y2="8" />
        <line x1="6" y1="14" x2="34" y2="14" />
        <line x1="6" y1="20" x2="18" y2="20" />
      </g>
      <rect
        x="24"
        y="5"
        width="10"
        height="4"
        rx="1"
        fill="var(--warm-soft)"
        stroke="var(--warm)"
        strokeWidth="0.4"
      />
    </svg>
  );
}

function IlloChecklist() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      {[0, 1, 2].map((i) => {
        const y = 6 + i * 7;
        const checked = i !== 1;
        return (
          <g key={i}>
            <rect
              x="5"
              y={y - 2}
              width="4"
              height="4"
              rx="0.6"
              fill={checked ? "var(--ink)" : "transparent"}
              stroke="currentColor"
              strokeWidth="0.5"
            />
            {checked && (
              <path
                d={`M5.8 ${y} l1.2 1 l2 -2`}
                stroke="var(--paper-elevated)"
                strokeWidth="0.7"
                fill="none"
                strokeLinecap="round"
              />
            )}
            <line
              x1="12"
              y1={y}
              x2={26 + i * 3}
              y2={y}
              stroke="currentColor"
              strokeWidth={i === 0 ? "0.9" : "0.5"}
              opacity={i === 0 ? "0.9" : "0.45"}
            />
          </g>
        );
      })}
    </svg>
  );
}

function IlloCotation() {
  const bars = [3, 5, 7, 4];
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <line x1="4" y1="24" x2="36" y2="24" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
      {bars.map((rows, i) => {
        const x = 7 + i * 8;
        const accent = i === 2;
        return (
          <g key={i}>
            {Array.from({ length: rows }).map((_, r) => {
              const y = 22 - r * 2.6;
              return [0, 1].map((c) => (
                <circle
                  key={`${r}-${c}`}
                  cx={x + (c === 0 ? -1.2 : 1.2)}
                  cy={y}
                  r="0.8"
                  fill={accent ? "var(--warm)" : "currentColor"}
                  opacity={accent ? 1 : 0.7}
                />
              ));
            })}
          </g>
        );
      })}
    </svg>
  );
}

function IlloDocument() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <path
        d="M 8 3 L 26 3 L 30 7 L 30 25 L 8 25 Z"
        fill="var(--paper-elevated)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <path d="M 26 3 L 26 7 L 30 7" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.45">
        <line x1="11" y1="10" x2="26" y2="10" />
        <line x1="11" y1="13" x2="24" y2="13" />
        <line x1="11" y1="16" x2="26" y2="16" />
        <line x1="11" y1="19" x2="22" y2="19" />
      </g>
      <circle cx="32" cy="21" r="3.5" fill="var(--warm-soft)" stroke="var(--warm)" strokeWidth="0.5" />
      <circle cx="32" cy="21" r="2.2" fill="none" stroke="var(--warm)" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
    </svg>
  );
}
