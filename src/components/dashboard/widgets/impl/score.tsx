"use client";

// Widget « Score de conformité » — refonte V2.
//  - anneau (défaut) : ring SVG + per-famille bars à droite, pastille vif
//  - gauge           : demi-arc type jauge auto (historique, conservé)
//  - nombre          : typo monumentale centrée, minimaliste
//
// Les 3 variants partagent dashboard.score.valeur. La variante "anneau"
// ajoute un calcul de conformité par famille d'équipements, dérivé des
// stats de vérification (on part d'une moyenne par famille). Données
// locales uniquement : aucune query supplémentaire.

import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

const LIBELLE_NIVEAU = {
  satisfaisante: "Satisfaisante",
  a_surveiller: "À surveiller",
  rattrapage: "Rattrapage nécessaire",
} as const;

/** Regroupement des catégories d'équipement en « familles » affichées
 *  dans la vue V2 du score. Une catégorie manquante tombe dans "Autres". */
const FAMILLES: { nom: string; categories: string[] }[] = [
  {
    nom: "Incendie",
    categories: ["EXTINCTEUR", "BAES", "ALARME_INCENDIE", "DESENFUMAGE"],
  },
  { nom: "Électricité", categories: ["INSTALLATION_ELECTRIQUE"] },
  { nom: "Aération", categories: ["VMC", "CTA", "HOTTE_PRO"] },
  { nom: "Levage", categories: ["ASCENSEUR", "EQUIPEMENT_LEVAGE"] },
  {
    nom: "Autres",
    categories: [
      "APPAREIL_CUISSON_ERP",
      "PORTE_AUTO",
      "PORTAIL_AUTO",
      "EQUIPEMENT_SOUS_PRESSION",
      "STOCKAGE_MATIERE_DANGEREUSE",
    ],
  },
];

export function WidgetScore({
  bundle,
  variant,
}: {
  bundle: DashboardBundle;
  variant: string;
}) {
  const { dashboard, equipements, nbVerifs, nbRapports } = bundle;
  const global = dashboard.score.valeur;

  // --- Variants "gauge" et "nombre" : conservés tels quels (layout plus compact) ---

  if (variant === "gauge") {
    const verifsEnRetard = dashboard.compteurs.verifsEnRetard;
    const actionsACouvrir =
      dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours;
    const sub = dashboard.duerp.derniereVersionAu
      ? `DUERP ${dashboard.duerp.derniereVersionAu.toLocaleDateString("fr-FR")}`
      : dashboard.duerp.existe
        ? "DUERP en cours"
        : "Pas encore de DUERP";
    return (
      <BentoCell kicker="Score de conformité" sub={sub}>
        <div className="flex flex-wrap items-center gap-7">
          <GaugeScore valeur={global} />
          <dl className="flex flex-1 flex-col gap-1.5 text-[0.86rem]">
            <Row label="Équipements déclarés" value={`${equipements.length}`} />
            <Row
              label="Vérifications à jour"
              value={`${Math.max(0, nbVerifs - verifsEnRetard)} / ${nbVerifs}`}
            />
            <Row label="Rapports déposés" value={`${nbRapports}`} />
            <Row label="Actions ouvertes" value={`${actionsACouvrir}`} />
          </dl>
        </div>
      </BentoCell>
    );
  }

  if (variant === "nombre") {
    return (
      <BentoCell kicker="Score de conformité">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            Score actuel
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-[5.5rem] font-semibold leading-none tracking-[-0.055em] tabular-nums">
              {global}
            </span>
            <span className="text-[1.8rem] font-medium text-[color:var(--navy)]">
              /100
            </span>
            <span className="ml-auto [font-family:var(--font-serif)] text-[1rem] italic text-[color:var(--amber)]">
              {LIBELLE_NIVEAU[dashboard.score.niveau]}
            </span>
          </div>
        </div>
      </BentoCell>
    );
  }

  // --- Variant « anneau » : V2 layout (ring + per-famille bars) -----
  const familles = calculerFamilles(equipements);
  const niveauPill =
    dashboard.score.niveau === "satisfaisante"
      ? { classe: "pill-v2 pill-v2-green", label: LIBELLE_NIVEAU.satisfaisante }
      : dashboard.score.niveau === "a_surveiller"
        ? { classe: "pill-v2 pill-v2-amber", label: LIBELLE_NIVEAU.a_surveiller }
        : { classe: "pill-v2 pill-v2-alert", label: LIBELLE_NIVEAU.rattrapage };

  return (
    <section className="bento-cell">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="v2-title">Score de conformité</h3>
          <p className="v2-subtitle">
            Pondération INRS · toutes familles confondues
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="flex min-w-[160px] flex-col items-center gap-3">
          <ScoreRingV2 pct={global} />
          <span className={niveauPill.classe}>{niveauPill.label}</span>
        </div>

        <div className="grid gap-3">
          {familles.length === 0 ? (
            <p className="text-[0.88rem] text-muted-foreground">
              Déclarez vos premiers équipements pour voir le score par
              famille s&apos;afficher ici.
            </p>
          ) : (
            familles.map((f) => (
              <div
                key={f.nom}
                className="grid grid-cols-[110px_1fr_44px] items-center gap-3 md:grid-cols-[140px_1fr_52px]"
              >
                <div className="text-[0.84rem] text-ink/75">{f.nom}</div>
                <div className="v2-bar-track">
                  <div
                    className="v2-bar-fill"
                    style={{
                      width: `${f.pct}%`,
                      background: toneColor(f.tone),
                    }}
                  />
                </div>
                <div className="text-right font-mono text-[0.78rem] tabular-nums text-ink/75">
                  {f.pct}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ScoreRingV2({
  pct,
  size = 140,
  stroke = 10,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score de conformité ${pct} sur 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--paper-sunk)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--navy)"
        strokeWidth={stroke}
        strokeDasharray={C}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="49%"
        textAnchor="middle"
        fontFamily="var(--font-body)"
        fontSize="32"
        fontWeight="600"
        fill="var(--ink)"
        style={{ letterSpacing: "-0.03em" }}
      >
        {pct}
      </text>
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="var(--muted-foreground)"
        style={{ letterSpacing: "0.2em" }}
      >
        SCORE /100
      </text>
    </svg>
  );
}

type Tone = "green" | "navy" | "amber" | "alert";

function toneColor(t: Tone): string {
  switch (t) {
    case "green":
      return "var(--green-dash)";
    case "amber":
      return "var(--amber)";
    case "alert":
      return "var(--alert)";
    default:
      return "var(--navy)";
  }
}

function tonePourPct(pct: number): Tone {
  if (pct >= 85) return "green";
  if (pct >= 70) return "navy";
  if (pct >= 55) return "amber";
  return "alert";
}

type FamilleStat = { nom: string; pct: number; tone: Tone };

/** Calcule un pct de conformité par famille à partir des stats d'équipements.
 *  Heuristique simple : sur l'ensemble des vérifications associées aux
 *  équipements de la famille, part = couvertes / total. Sans vérification,
 *  la famille n'est pas représentée. */
function calculerFamilles(
  equipements: DashboardBundle["equipements"],
): FamilleStat[] {
  const out: FamilleStat[] = [];
  for (const fam of FAMILLES) {
    let totalSignaux = 0;
    let retardsEtPlan = 0;
    let aRepresente = false;
    for (const eq of equipements) {
      if (!fam.categories.includes(eq.categorie)) continue;
      aRepresente = true;
      const s = eq.stats;
      if (!s) continue;
      const weight = s.enRetard + s.aPlanifier + (s.derniereRealisee ? 1 : 0);
      totalSignaux += weight || 1; // compte au moins une "chance" par équipement
      retardsEtPlan += s.enRetard + s.aPlanifier;
    }
    if (!aRepresente) continue;
    const pct =
      totalSignaux === 0
        ? 50
        : Math.max(
            0,
            Math.min(100, Math.round(100 * (1 - retardsEtPlan / totalSignaux))),
          );
    out.push({ nom: fam.nom, pct, tone: tonePourPct(pct) });
  }
  return out;
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
 * la landing (ticks radiaux, ink + navy).
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
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${rayon} ${rayon} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="var(--rule-soft)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${rayon} ${rayon} 0 0 1 ${arcProgEnd.x} ${arcProgEnd.y}`}
          fill="none"
          stroke="var(--navy)"
          strokeWidth="10"
          strokeLinecap="round"
        />
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
          <tspan fontSize="14" fontWeight="500" fill="var(--navy)" dx="2">
            %
          </tspan>
        </text>
      </svg>
    </div>
  );
}
