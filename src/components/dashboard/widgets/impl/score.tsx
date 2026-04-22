"use client";

// Widget « Conformité générale » — 3 variants :
//  - anneau   : ring SVG + breakdown à droite (défaut)
//  - gauge    : demi-arc type jauge auto
//  - nombre   : typo monumentale centrée, minimaliste
//
// Les 3 variants partagent exactement la même donnée (dashboard.score)
// et la même hiérarchie visuelle (kicker + chiffre + libellé de niveau).

import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

const LIBELLE_NIVEAU = {
  satisfaisante: "Satisfaisante",
  a_surveiller: "À surveiller",
  rattrapage: "Rattrapage nécessaire",
} as const;

export function WidgetScore({
  bundle,
  variant,
}: {
  bundle: DashboardBundle;
  variant: string;
}) {
  const { dashboard, equipements, nbVerifs, nbRapports } = bundle;
  const verifsEnRetard = dashboard.compteurs.verifsEnRetard;
  const verifsAPlanifier = dashboard.compteurs.verifsAPlanifier;
  const verifsSous30j = dashboard.compteurs.verifsSous30j;
  const actionsACouvrir =
    dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours;

  const Breakdown = (
    <dl className="flex flex-1 flex-col gap-1.5 text-[0.86rem]">
      <Row label="Équipements déclarés" value={`${equipements.length}`} />
      <Row
        label="Vérifications à jour"
        value={`${Math.max(0, nbVerifs - verifsEnRetard)} / ${nbVerifs}`}
      />
      <Row label="Rapports déposés" value={`${nbRapports}`} />
      <Row label="Actions ouvertes" value={`${actionsACouvrir}`} />
    </dl>
  );

  const Pills = (
    <div className="flex flex-wrap gap-2">
      {verifsEnRetard > 0 ? (
        <span className="pill-alerte">{verifsEnRetard} en retard</span>
      ) : null}
      {verifsAPlanifier > 0 ? (
        <span className="pill-warn">{verifsAPlanifier} à planifier</span>
      ) : null}
      {verifsSous30j > 0 ? (
        <span className="pill-warn">{verifsSous30j} sous 30 j</span>
      ) : null}
      {nbVerifs - verifsEnRetard - verifsAPlanifier - verifsSous30j > 0 ? (
        <span className="pill-ok">
          {nbVerifs - verifsEnRetard - verifsAPlanifier - verifsSous30j} à
          jour
        </span>
      ) : null}
    </div>
  );

  const sub = dashboard.duerp.derniereVersionAu
    ? `DUERP ${dashboard.duerp.derniereVersionAu.toLocaleDateString("fr-FR")}`
    : dashboard.duerp.existe
      ? "DUERP en cours"
      : "Pas encore de DUERP";

  if (variant === "gauge") {
    return (
      <BentoCell kicker="Conformité générale" sub={sub}>
        <div className="flex flex-wrap items-center gap-7">
          <GaugeScore valeur={dashboard.score.valeur} />
          {Breakdown}
        </div>
        {Pills}
      </BentoCell>
    );
  }

  if (variant === "nombre") {
    return (
      <BentoCell kicker="Conformité générale" sub={sub}>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            Score actuel
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-[5.5rem] font-semibold leading-none tracking-[-0.055em] tabular-nums">
              {dashboard.score.valeur}
            </span>
            <span className="text-[1.8rem] font-medium text-[color:var(--accent-vif)]">
              %
            </span>
            <span className="ml-auto [font-family:var(--font-serif)] text-[1rem] italic text-[color:var(--warm)]">
              {LIBELLE_NIVEAU[dashboard.score.niveau]}
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">{Breakdown}</div>
        {Pills}
      </BentoCell>
    );
  }

  // Variant "anneau" (défaut)
  return (
    <BentoCell kicker="Conformité générale" sub={sub}>
      <div className="flex flex-wrap items-center gap-7">
        <ScoreRing
          value={dashboard.score.valeur}
          label={LIBELLE_NIVEAU[dashboard.score.niveau]}
        />
        {Breakdown}
      </div>
      {Pills}
    </BentoCell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-rule-soft py-1.5 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <strong className="font-semibold tabular-nums">{value}</strong>
    </div>
  );
}

/**
 * Jauge en demi-arc type « tachymètre ». 0-100%, l'aiguille se place
 * sur l'angle correspondant. Design sobre, cohérent avec le cadran de
 * la landing (ticks radiaux, ink + accent-vif).
 */
function GaugeScore({ valeur }: { valeur: number }) {
  const taille = 200;
  const cx = 100;
  const cy = 110;
  const rayon = 80;
  const startAngle = Math.PI; // gauche
  const endAngle = 0; // droite
  const valAngle = startAngle - (valeur / 100) * (startAngle - endAngle);

  const arcStart = {
    x: cx + Math.cos(startAngle) * rayon,
    y: cy + Math.sin(startAngle) * rayon,
  };
  const arcEnd = {
    x: cx + Math.cos(endAngle) * rayon,
    y: cy + Math.sin(endAngle) * rayon,
  };
  const arcProgEnd = {
    x: cx + Math.cos(valAngle) * rayon,
    y: cy + Math.sin(valAngle) * rayon,
  };

  // Ticks mineurs/majeurs
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const a = startAngle - (i / 20) * (startAngle - endAngle);
    const r1 = rayon + 2;
    const r2 = rayon + (i % 5 === 0 ? 9 : 5);
    return {
      x1: cx + Math.cos(a) * r1,
      y1: cy + Math.sin(a) * r1,
      x2: cx + Math.cos(a) * r2,
      y2: cy + Math.sin(a) * r2,
      major: i % 5 === 0,
    };
  });

  return (
    <div
      className="shrink-0"
      style={{ width: taille, height: taille * 0.75 }}
      role="img"
      aria-label={`Score de conformité ${valeur}%`}
    >
      <svg viewBox={`0 0 ${taille} ${taille * 0.75}`} className="h-full w-full">
        {/* Fond */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${rayon} ${rayon} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="var(--rule-soft)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progression */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${rayon} ${rayon} 0 0 1 ${arcProgEnd.x} ${arcProgEnd.y}`}
          fill="none"
          stroke="var(--accent-vif)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="var(--ink)"
            strokeWidth={t.major ? 1.1 : 0.6}
            opacity={t.major ? 0.7 : 0.3}
            strokeLinecap="round"
          />
        ))}
        {/* Aiguille */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(valAngle) * (rayon - 14)}
          y2={cy + Math.sin(valAngle) * (rayon - 14)}
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill="var(--ink)" />
        {/* Valeur */}
        <text
          x={cx}
          y={cy + 25}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize="22"
          fontWeight="600"
          fill="var(--ink)"
          style={{ letterSpacing: "-0.03em" }}
        >
          {valeur}
          <tspan
            fontSize="14"
            fontWeight="500"
            fill="var(--accent-vif)"
            dx="2"
          >
            %
          </tspan>
        </text>
      </svg>
    </div>
  );
}
