import Link from "next/link";

export type Etape = {
  id: string;
  libelle: string;
  href: string;
  atteinte: boolean;
  actuelle?: boolean;
};

export function WizardSteps({ etapes }: { etapes: Etape[] }) {
  const total = etapes.length;
  const indexActuelle = etapes.findIndex((e) => e.actuelle);
  const numeroActuelle =
    indexActuelle >= 0 ? indexActuelle + 1 : etapes.filter((e) => e.atteinte).length;

  return (
    <nav aria-label="Sommaire du DUERP" className="not-prose">
      {/* Compteur haut */}
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
          Progression
        </p>
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="[font-family:var(--font-mono)] text-[0.95rem] tabular-nums text-ink">
            {String(numeroActuelle).padStart(2, "0")}
          </span>
          <span className="mx-1 text-rule">/</span>
          <span className="tabular-nums">{String(total).padStart(2, "0")}</span>
        </p>
      </div>

      {/* Barre segmentée — continue, avec gaps */}
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={numeroActuelle}
        className="flex gap-1.5"
      >
        {etapes.map((e) => {
          let fill = "bg-rule-soft";
          if (e.atteinte && !e.actuelle) fill = "bg-ink";
          if (e.actuelle) fill = "bg-[color:var(--warm)]";
          return (
            <span
              key={e.id}
              aria-hidden
              className={`h-[5px] flex-1 rounded-[1px] ${fill}`}
            />
          );
        })}
      </div>

      {/* Libellés alignés sous chaque segment */}
      <ol className="mt-4 grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0">
        {etapes.map((e, i) => {
          const numero = String(i + 1).padStart(2, "0");
          const muet = !e.atteinte && !e.actuelle;
          const clickable = e.atteinte || e.actuelle;

          return (
            <li key={e.id} className="min-w-0">
              <Link
                href={clickable ? e.href : "#"}
                aria-current={e.actuelle ? "step" : undefined}
                aria-disabled={muet}
                className={`group block ${muet ? "pointer-events-none" : ""}`}
              >
                <div className="flex items-baseline gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em]">
                  <span
                    className={`tabular-nums ${
                      e.actuelle
                        ? "text-[color:var(--warm)] font-semibold"
                        : e.atteinte
                          ? "text-ink"
                          : "text-muted-foreground"
                    }`}
                  >
                    {numero}
                  </span>
                  <span
                    className={
                      e.actuelle
                        ? "text-[color:var(--warm)] font-semibold"
                        : "text-muted-foreground"
                    }
                  >
                    {e.actuelle
                      ? "En cours"
                      : e.atteinte
                        ? "Ouvert"
                        : "À venir"}
                  </span>
                </div>

                <p
                  className={`mt-2 text-[0.95rem] leading-tight tracking-[-0.005em] ${
                    muet
                      ? "text-muted-foreground/55"
                      : e.actuelle
                        ? "text-ink font-semibold"
                        : "text-ink font-medium"
                  } ${clickable ? "transition-opacity group-hover:opacity-60" : ""}`}
                >
                  {e.libelle}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
