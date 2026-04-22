import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const ITEMS = [
  {
    n: "01",
    titre: "DUERP en cours",
    description: "Version datée et signée",
  },
  {
    n: "02",
    titre: "Registre de sécurité",
    description: "Rapports classés, horodatés",
  },
  {
    n: "03",
    titre: "Plan d'actions",
    description: "Ouvertes avec échéance, levées avec justificatif",
  },
] as const;

export function EnCasControle({
  etablissementId,
}: {
  etablissementId: string;
}) {
  return (
    <section>
      <header className="mb-10 max-w-[56ch]">
        <p className="g-kicker">§ En cas de contrôle</p>
        <h2 className="g-h2 mt-3">
          Quatre documents.
          <br />
          <span className="g-h2-em">Tout ce qu&apos;on vous demandera.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14">
        <ControleStamp />

        <ol className="flex flex-col gap-3">
          {ITEMS.map((it) => (
            <Ligne key={it.n} n={it.n} titre={it.titre} description={it.description} />
          ))}

          {/* 4ᵉ item — mis en évidence */}
          <li className="relative mt-2 flex flex-col gap-3 overflow-hidden rounded-2xl border border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)] p-5">
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[color:var(--accent-vif)] px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[color:var(--paper-elevated)]">
              <ArrowDown aria-hidden className="size-3" />
              Généré ici
            </span>
            <div className="flex items-baseline gap-4">
              <span
                className="font-mono text-[1.15rem] font-medium tabular-nums"
                style={{ color: "var(--accent-vif)" }}
              >
                04
              </span>
              <div className="min-w-0">
                <h3 className="text-[1.05rem] font-semibold tracking-[-0.012em]">
                  Dossier consolidé
                </h3>
                <p className="mt-0.5 text-[0.86rem] text-ink/75">
                  PDF unique · consolide DUERP + registre + plan
                  d&apos;actions + mentions légales.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={`/api/etablissements/${etablissementId}/dossier-conformite/pdf`}
                className={buttonVariants({ size: "sm" })}
              >
                Générer mon dossier PDF ↓
              </Link>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                ~30 secondes
              </span>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}

function Ligne({
  n,
  titre,
  description,
}: {
  n: string;
  titre: string;
  description: string;
}) {
  return (
    <li className="flex items-baseline gap-4 rounded-xl bg-paper-sunk/60 px-5 py-4">
      <span className="font-mono text-[1.15rem] font-medium tabular-nums text-muted-foreground">
        {n}
      </span>
      <div className="min-w-0">
        <h3 className="text-[1rem] font-semibold tracking-[-0.012em]">
          {titre}
        </h3>
        <p className="mt-0.5 text-[0.84rem] text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}

function ControleStamp() {
  const taille = 280;
  const cx = taille / 2;
  const cy = taille / 2;
  const ringRadius = 128;

  // Génère le path d'un cercle pour le textPath
  const pathId = "g-stamp-text-path";

  return (
    <div
      className="relative mx-auto size-[280px]"
      role="img"
      aria-label="Prêt pour contrôle"
    >
      <svg
        viewBox={`0 0 ${taille} ${taille}`}
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <path
            id={pathId}
            d={`M ${cx},${cy} m -${ringRadius},0 a ${ringRadius},${ringRadius} 0 1,1 ${ringRadius * 2},0 a ${ringRadius},${ringRadius} 0 1,1 -${ringRadius * 2},0`}
          />
        </defs>

        {/* Disque sombre */}
        <circle cx={cx} cy={cy} r="120" fill="var(--ink)" />

        {/* Ring pointillé en rotation */}
        <g className="g-stamp-ring" style={{ transformOrigin: "50% 50%" }}>
          <circle
            cx={cx}
            cy={cy}
            r={ringRadius}
            fill="none"
            stroke="var(--accent-vif)"
            strokeWidth="1"
            strokeDasharray="3 6"
            opacity="0.7"
          />
          <text
            fontFamily="var(--font-mono)"
            fontSize="8.5"
            fill="var(--accent-vif)"
            letterSpacing="4"
          >
            <textPath xlinkHref={`#${pathId}`} startOffset="0%">
              INSPECTION · ASSUREUR · COMMISSION DE SÉCURITÉ · BAILLEUR ·
              INSPECTION · ASSUREUR ·
            </textPath>
          </text>
        </g>

        {/* Croix de visée discrète */}
        <g opacity="0.35">
          <line
            x1={cx - 80}
            y1={cy}
            x2={cx - 50}
            y2={cy}
            stroke="var(--paper-elevated)"
            strokeWidth="0.5"
          />
          <line
            x1={cx + 50}
            y1={cy}
            x2={cx + 80}
            y2={cy}
            stroke="var(--paper-elevated)"
            strokeWidth="0.5"
          />
        </g>
      </svg>

      {/* Texte central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[color:var(--paper-elevated)]">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.24em] opacity-80">
          Statut
        </span>
        <span className="accent-serif mt-2 text-[1.7rem] italic leading-[1.05] text-[color:var(--accent-vif)]">
          Prêt pour
          <br />
          contrôle
        </span>
      </div>
    </div>
  );
}
