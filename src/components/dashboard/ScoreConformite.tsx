import type { Score } from "@/lib/dashboard/score";

const COULEUR: Record<Score["niveau"], string> = {
  satisfaisante: "border-emerald-300 bg-emerald-50 text-emerald-900",
  a_surveiller: "border-amber-300 bg-amber-50 text-amber-900",
  rattrapage: "border-rose-300 bg-rose-50 text-rose-900",
};

const ANNEAU: Record<Score["niveau"], string> = {
  satisfaisante: "text-emerald-600",
  a_surveiller: "text-amber-600",
  rattrapage: "text-rose-600",
};

export function ScoreConformite({ score }: { score: Score }) {
  // SVG ring simple, sans animation — le rendu est déterministe.
  const taille = 112;
  const rayon = 48;
  const perimetre = 2 * Math.PI * rayon;
  const offset = perimetre * (1 - score.valeur / 100);

  return (
    <div
      className={`cartouche flex items-center gap-5 overflow-hidden border ${COULEUR[score.niveau]} px-6 py-5 sm:px-8`}
    >
      <div className="relative flex shrink-0 items-center justify-center">
        <svg width={taille} height={taille} className="-rotate-90">
          <circle
            cx={taille / 2}
            cy={taille / 2}
            r={rayon}
            stroke="currentColor"
            className="text-rule/50"
            strokeWidth={8}
            fill="none"
          />
          <circle
            cx={taille / 2}
            cy={taille / 2}
            r={rayon}
            stroke="currentColor"
            className={ANNEAU[score.niveau]}
            strokeWidth={8}
            strokeDasharray={perimetre}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="absolute text-[1.4rem] font-semibold">
          {score.valeur}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Score de conformité (interne)
        </p>
        <p className="mt-1 text-[1.05rem] font-semibold">{score.libelle}</p>
        <p className="mt-2 max-w-md text-[0.82rem] leading-relaxed text-muted-foreground">
          Indicateur synthétique maison — ce n&apos;est pas une certification
          officielle. Voir le détail dans chaque module pour agir.
        </p>
      </div>
    </div>
  );
}
