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
    titre: "Mon établissement",
    corps: "Adresse, effectif, régime (ERP, IGH, travail).",
    illustration: <IlloBatiment />,
  },
  {
    numero: "02",
    titre: "Mes équipements",
    corps: "Électricité, extincteurs, hotte, ascenseur…",
    illustration: <IlloChecklist />,
  },
  {
    numero: "03",
    titre: "Mon calendrier",
    corps: "Les dates de vérification calculées pour vous.",
    illustration: <IlloCalendrier />,
  },
  {
    numero: "04",
    titre: "Mon dossier",
    corps: "Registre + plan d'actions + DUERP, prêts à montrer.",
    illustration: <IlloDocument />,
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-10 sm:px-12 sm:py-14">
      <section className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        {/* ─── Left column: positionnement + parcours ───────────── */}
        <div>
          <p className="label-admin mb-5">Conformité santé-sécurité</p>
          <h1 className="display-xl text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Votre conformité,
            <br />
            <span className="text-[color:var(--warm)]">
              sans expert à plein temps
            </span>
            .
          </h1>
          <p className="mt-6 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
            Pensée pour les dirigeants de TPE/PME qui ne sont pas
            spécialistes en sécurité. Vous répondez à des questions
            simples — l&apos;outil s&apos;occupe des articles de loi, des
            périodicités et des rappels. Vos documents officiels
            (DUERP, registre de sécurité, plan d&apos;actions) se
            génèrent à la demande.
          </p>

          <div className="mt-10 rounded-md border border-dashed border-rule/70 bg-paper-sunk/30 px-5 py-4 font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
            Basé sur les sources officielles
            <br />
            <span className="text-ink">
              Légifrance · INRS · règlement ERP / IGH
            </span>
            <br />
            Zéro IA pour les décisions — chaque règle est citée avec son
            article.
          </div>

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

        {/* ─── Right column: formulaire direct ───────────────────── */}
        <div className="cartouche px-6 py-10 sm:px-10 sm:py-12">
          <p className="label-admin mb-3">Commencer</p>
          <h2 className="text-[1.3rem] font-semibold tracking-[-0.015em] leading-tight">
            Créer votre espace d&apos;entreprise
          </h2>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
            Juste les informations administratives d&apos;abord. Vous
            ajouterez un établissement (restaurant, boutique, bureau…)
            juste après.
          </p>

          <div className="filet-pointille my-8" />

          <EntrepriseForm action={creerEntreprise} libelleSubmit="Continuer →" />
        </div>
      </section>

      <div className="filet-pointille mt-20" />

      <div className="mt-6 grid grid-cols-1 gap-4 text-[0.76rem] leading-relaxed text-muted-foreground sm:grid-cols-3">
        <p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            Pour qui
          </span>
          <br />
          Restaurants, commerces, bureaux. De 1 à 50 salariés. Pas
          d&apos;activité industrielle complexe.
        </p>
        <p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            Ce que vous obtenez
          </span>
          <br />
          Un DUERP à jour, un calendrier de vérifications, un registre
          numérique horodaté, un plan d&apos;actions.
        </p>
        <p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            Ce que l&apos;outil ne fait pas
          </span>
          <br />
          Il ne se substitue pas à un contrôle réglementaire : il vous
          aide à les préparer et les retrouver.
        </p>
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Illustrations compactes (48×36 environ) — cohérence papier/sepia
   ───────────────────────────────────────────────────────────────── */

function IlloBatiment() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <rect
        x="4"
        y="8"
        width="14"
        height="18"
        fill="var(--paper-elevated)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <rect
        x="18"
        y="4"
        width="18"
        height="22"
        fill="var(--paper-elevated)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <g fill="var(--warm-soft)" stroke="var(--warm)" strokeWidth="0.3">
        <rect x="6" y="11" width="3" height="3" />
        <rect x="11" y="11" width="3" height="3" />
        <rect x="6" y="17" width="3" height="3" />
        <rect x="11" y="17" width="3" height="3" />
        <rect x="21" y="7" width="3" height="3" />
        <rect x="26" y="7" width="3" height="3" />
        <rect x="31" y="7" width="3" height="3" />
        <rect x="21" y="13" width="3" height="3" />
        <rect x="26" y="13" width="3" height="3" />
        <rect x="31" y="13" width="3" height="3" />
        <rect x="21" y="19" width="3" height="3" />
        <rect x="31" y="19" width="3" height="3" />
      </g>
      <rect x="26" y="19" width="3" height="7" fill="var(--ink)" opacity="0.8" />
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

function IlloCalendrier() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <rect
        x="5"
        y="5"
        width="30"
        height="20"
        rx="1.5"
        fill="var(--paper-elevated)"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <rect x="5" y="5" width="30" height="5" fill="var(--paper-sunk)" />
      <line x1="10" y1="3" x2="10" y2="8" stroke="currentColor" strokeWidth="0.8" />
      <line x1="30" y1="3" x2="30" y2="8" stroke="currentColor" strokeWidth="0.8" />
      {/* Jours */}
      <g fill="currentColor" opacity="0.45">
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2].map((row) => (
            <circle
              key={`${col}-${row}`}
              cx={9 + col * 5.5}
              cy={14 + row * 4}
              r="0.6"
            />
          )),
        )}
      </g>
      {/* Échéance mise en avant */}
      <rect
        x="18"
        y="12"
        width="4"
        height="4"
        rx="0.5"
        fill="var(--warm-soft)"
        stroke="var(--warm)"
        strokeWidth="0.4"
      />
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
