import type { ReleveTemperature } from "@prisma/client";

/**
 * Graph SVG simple de l'évolution des températures pour un point de
 * relevé. Affiche une ligne brisée + zone de seuil. Pas de lib, pas
 * d'interaction complexe — juste une visualisation lisible.
 */
export function GraphTemperatures({
  releves,
  seuilMinCelsius,
  typeReseau,
  width = 600,
  height = 140,
}: {
  releves: ReleveTemperature[];
  seuilMinCelsius: number;
  typeReseau: string;
  width?: number;
  height?: number;
}) {
  if (releves.length === 0) {
    return (
      <div
        className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[color:var(--rule)] bg-[color:var(--paper-sunk)] text-[0.82rem] text-muted-foreground"
      >
        Aucun relevé enregistré pour l&apos;instant.
      </div>
    );
  }

  // Tri chronologique
  const ordered = [...releves].sort(
    (a, b) => a.dateReleve.getTime() - b.dateReleve.getTime(),
  );

  const temps = ordered.map((r) => r.temperatureCelsius);
  const tMin = Math.min(...temps, seuilMinCelsius - 5);
  const tMax = Math.max(...temps, seuilMinCelsius + 10);
  const span = Math.max(5, tMax - tMin);

  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const w = width - padL - padR;
  const h = height - padT - padB;

  function xCoord(i: number): number {
    if (ordered.length === 1) return padL + w / 2;
    return padL + (i / (ordered.length - 1)) * w;
  }
  function yCoord(temp: number): number {
    const ratio = (temp - tMin) / span;
    return padT + (1 - ratio) * h;
  }

  const ySeuil = yCoord(seuilMinCelsius);

  const path = ordered
    .map((r, i) => `${i === 0 ? "M" : "L"} ${xCoord(i)} ${yCoord(r.temperatureCelsius)}`)
    .join(" ");

  // Indication de conformité globale (% de relevés conformes)
  const nbConformes = ordered.filter((r) => r.conforme).length;
  const pourcent = Math.round((nbConformes / ordered.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
          Évolution sur {ordered.length} relevé{ordered.length > 1 ? "s" : ""}
        </p>
        <p
          className={
            "font-mono text-[0.72rem] font-semibold " +
            (pourcent === 100
              ? "text-[color:var(--accent-vif)]"
              : pourcent >= 80
                ? "text-[color:var(--warm)]"
                : "text-[color:var(--minium)]")
          }
        >
          {pourcent}% conformes
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        {/* Zone « sous le seuil » (non conforme pour ECS) teintée */}
        {typeReseau !== "EFS" && (
          <rect
            x={padL}
            y={ySeuil}
            width={w}
            height={height - padB - ySeuil}
            fill="color-mix(in oklch, var(--minium) 8%, transparent)"
          />
        )}
        {typeReseau === "EFS" && (
          <rect
            x={padL}
            y={padT}
            width={w}
            height={ySeuil - padT}
            fill="color-mix(in oklch, var(--minium) 8%, transparent)"
          />
        )}

        {/* Ligne de seuil */}
        <line
          x1={padL}
          x2={width - padR}
          y1={ySeuil}
          y2={ySeuil}
          stroke="var(--minium)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <text
          x={padL - 4}
          y={ySeuil + 3}
          textAnchor="end"
          fontSize="9"
          fill="var(--minium)"
          fontFamily="var(--font-mono), monospace"
        >
          {seuilMinCelsius}°
        </text>

        {/* Axe vertical temperatures indicatives */}
        {[Math.round(tMax), Math.round(tMin)].map((t) => (
          <text
            key={t}
            x={padL - 4}
            y={yCoord(t) + 3}
            textAnchor="end"
            fontSize="9"
            fill="var(--seal)"
            fontFamily="var(--font-mono), monospace"
          >
            {t}°
          </text>
        ))}

        {/* Courbe */}
        <path
          d={path}
          fill="none"
          stroke="var(--warm)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Points */}
        {ordered.map((r, i) => (
          <circle
            key={r.id}
            cx={xCoord(i)}
            cy={yCoord(r.temperatureCelsius)}
            r={3}
            fill={r.conforme ? "var(--accent-vif)" : "var(--minium)"}
          />
        ))}

        {/* Date extrêmes */}
        <text
          x={padL}
          y={height - 6}
          fontSize="9"
          fill="var(--seal)"
          fontFamily="var(--font-mono), monospace"
        >
          {ordered[0].dateReleve.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}
        </text>
        <text
          x={width - padR}
          y={height - 6}
          fontSize="9"
          fill="var(--seal)"
          textAnchor="end"
          fontFamily="var(--font-mono), monospace"
        >
          {ordered[ordered.length - 1].dateReleve.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}
        </text>
      </svg>
    </div>
  );
}
