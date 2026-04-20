import Link from "next/link";

type Etape = "cotation" | "mesures";

type Props = {
  etape: Etape;
  cotationSaisie: boolean;
  nombreMesures: number;
  hrefCotation: string;
  hrefMesures: string;
};

/**
 * Diptyque éditorial montrant que la cotation et les mesures sont deux
 * moitiés d'une même évaluation, pas deux étapes séparées du wizard.
 * Visible en tête des pages cotation et mesures d'un risque.
 */
export function EvaluationProgression({
  etape,
  cotationSaisie,
  nombreMesures,
  hrefCotation,
  hrefMesures,
}: Props) {
  const mesuresDisponibles = cotationSaisie;

  return (
    <nav
      aria-label="Parties de l'évaluation du risque"
      className="rounded-[calc(var(--radius)*1.4)] bg-paper-elevated p-0 ring-1 ring-rule-soft"
    >
      {/* Bandeau */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-dashed border-rule/60 px-6 py-4 sm:px-7">
        <p className="font-mono text-[0.64rem] font-medium uppercase tracking-[0.2em] text-ink">
          Évaluation en deux temps
        </p>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {etape === "cotation"
            ? "Partie 01 en cours"
            : "Partie 02 en cours"}
        </p>
      </div>

      {/* Barre de progression — 2 segments */}
      <div className="px-6 pt-5 sm:px-7">
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={etape === "cotation" ? 1 : 2}
          className="flex gap-1.5"
        >
          <span
            aria-hidden
            className={`h-[5px] flex-1 rounded-[1px] transition-colors ${
              etape === "cotation"
                ? "bg-[color:var(--warm)]"
                : cotationSaisie
                  ? "bg-ink"
                  : "bg-rule-soft"
            }`}
          />
          <span
            aria-hidden
            className={`h-[5px] flex-1 rounded-[1px] transition-colors ${
              etape === "mesures"
                ? "bg-[color:var(--warm)]"
                : "bg-rule-soft"
            }`}
          />
        </div>
      </div>

      {/* Les 2 sous-parties, côte à côte, séparées par un filet pointillé vertical */}
      <ol className="grid grid-cols-1 sm:grid-cols-2">
        <li
          className={`border-b border-dashed border-rule/60 px-6 py-6 sm:border-b-0 sm:border-r sm:px-7 ${
            etape === "cotation" ? "" : ""
          }`}
        >
          <SousPartie
            numero="01"
            titre="Cotation"
            description="Gravité, probabilité, maîtrise actuelle. La criticité se calcule automatiquement."
            statut={
              etape === "cotation"
                ? "en-cours"
                : cotationSaisie
                  ? "fait"
                  : "a-faire"
            }
            href={hrefCotation}
            compteur={cotationSaisie ? "cotation enregistrée" : "3 questions"}
          />
        </li>
        <li className="px-6 py-6 sm:px-7">
          <SousPartie
            numero="02"
            titre="Mesures"
            description="Prévention déjà en place et prévue, triée selon l'article L. 4121-2."
            statut={
              etape === "mesures"
                ? "en-cours"
                : !mesuresDisponibles
                  ? "verrouille"
                  : nombreMesures > 0
                    ? "fait"
                    : "a-faire"
            }
            href={mesuresDisponibles ? hrefMesures : undefined}
            compteur={
              !mesuresDisponibles
                ? "après la cotation"
                : nombreMesures > 0
                  ? `${String(nombreMesures).padStart(2, "0")} retenue${
                      nombreMesures > 1 ? "s" : ""
                    }`
                  : "à renseigner"
            }
          />
        </li>
      </ol>

      {/* Pied : rappel du couplage */}
      <p className="border-t border-dashed border-rule/60 px-6 py-3.5 text-[0.78rem] leading-relaxed text-muted-foreground sm:px-7">
        La maîtrise notée en{" "}
        <span className="font-medium text-ink">01</span> décrit l'état actuel ;
        les mesures de <span className="font-medium text-ink">02</span> la
        documentent et peuvent vous amener à la réajuster.
      </p>
    </nav>
  );
}

type Statut = "en-cours" | "fait" | "a-faire" | "verrouille";

function SousPartie({
  numero,
  titre,
  description,
  statut,
  href,
  compteur,
}: {
  numero: string;
  titre: string;
  description: string;
  statut: Statut;
  href?: string;
  compteur: string;
}) {
  const clickable = href !== undefined && statut !== "en-cours";
  const titleColor =
    statut === "en-cours"
      ? "text-[color:var(--warm)]"
      : statut === "verrouille"
        ? "text-muted-foreground/60"
        : "text-ink";

  const labelStatut =
    statut === "en-cours"
      ? "En cours"
      : statut === "fait"
        ? "Ouvert"
        : statut === "verrouille"
          ? "Verrouillé"
          : "À faire";

  const Body = (
    <div className="flex items-start gap-4">
      <span
        aria-hidden
        className={`flex size-10 shrink-0 items-center justify-center rounded-full font-mono text-[0.72rem] font-semibold tabular-nums transition-colors ${
          statut === "en-cours"
            ? "bg-[color:var(--warm)] text-[color:var(--paper-elevated)]"
            : statut === "fait"
              ? "bg-ink text-paper-elevated"
              : statut === "verrouille"
                ? "border border-dashed border-rule text-muted-foreground/50"
                : "border border-rule text-ink"
        }`}
      >
        {numero}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span>{labelStatut}</span>
          <span aria-hidden className="text-rule">
            ·
          </span>
          <span className="truncate">{compteur}</span>
        </div>
        <p
          className={`mt-1.5 text-[1.02rem] font-semibold tracking-[-0.014em] leading-snug ${titleColor}`}
        >
          {titre}
        </p>
        <p
          className={`mt-1 text-[0.86rem] leading-[1.55] ${
            statut === "verrouille"
              ? "text-muted-foreground/55"
              : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );

  if (!clickable) {
    return (
      <div aria-current={statut === "en-cours" ? "step" : undefined}>
        {Body}
      </div>
    );
  }

  return (
    <Link
      href={href!}
      className="group block transition-opacity hover:opacity-70"
    >
      {Body}
    </Link>
  );
}
