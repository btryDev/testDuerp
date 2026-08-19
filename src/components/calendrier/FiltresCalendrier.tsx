"use client";

// Filtres du calendrier — un seul point d'entrée : le bouton « Filtres »
// ouvre un panneau à trois groupes explicites (type d'échéance, domaine
// des contrôles, urgence), et les filtres actifs restent visibles en
// chips retirables à côté du bouton. Remplace la rangée de pilules qui
// doublonnait avec la légende de la carte calendrier.
//
// Les choix s'appliquent par navigation (params d'URL) : le filtrage
// reste côté serveur, l'état du panneau est le seul état client.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, SlidersHorizontal, X } from "lucide-react";
import {
  LABEL_FAMILLE,
  LABEL_FAMILLE_LONG,
  MarqueurFamille,
} from "./MarqueurFamille";
import type { FamilleEcheance } from "@/lib/calendrier/echeances";

export type FiltresActifs = {
  famille?: FamilleEcheance;
  domaine?: string;
  urgent: boolean;
};

function construireHref(
  baseHref: string,
  filtres: {
    famille?: string;
    domaine?: string;
    urgent?: boolean;
    /**
     * La lecture en cours (mois ou équipement). Elle n'est pas un filtre,
     * mais elle vit dans la même URL : sans la reconduire ici, régler un
     * filtre depuis la vue par équipement renvoyait à la vue par mois.
     */
    vue?: string;
  },
): string {
  const p = new URLSearchParams();
  if (filtres.famille) p.set("famille", filtres.famille);
  if (filtres.domaine) p.set("domaine", filtres.domaine);
  if (filtres.urgent) p.set("urgent", "1");
  if (filtres.vue) p.set("vue", filtres.vue);
  const q = p.toString();
  return q ? `${baseHref}?${q}` : baseHref;
}

/** Rangée d'option du panneau : icône éventuelle + libellé, coche à
 *  droite quand elle est active — le motif du menu de variants du board. */
function Option({
  href,
  actif,
  onNaviguer,
  icone,
  children,
}: {
  href: string;
  actif: boolean;
  onNaviguer: () => void;
  icone?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNaviguer}
      aria-current={actif ? "true" : undefined}
      className={
        "flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors " +
        (actif
          ? "bg-[color:var(--board-blue-pale)] font-semibold text-[color:var(--board-blue-ink)]"
          : "text-[color:var(--board-slate-ink)] hover:bg-[color:var(--board-slate-pale)]")
      }
    >
      {icone}
      <span className="flex-1">{children}</span>
      {actif ? <Check className="size-3.5 flex-none" /> : null}
    </Link>
  );
}

function TitreGroupe({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 px-2.5 pb-1 pt-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--board-slate-soft)] first:pt-0">
      {children}
    </p>
  );
}

/** Chip d'un filtre actif — toujours visible, retirable d'un clic. */
function Chip({
  href,
  ton = "neutre",
  icone,
  children,
}: {
  href: string;
  ton?: "neutre" | "alerte";
  icone?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-[6px] text-[11.5px] font-semibold transition-opacity hover:opacity-80 " +
        (ton === "alerte"
          ? "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]"
          : "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]")
      }
    >
      {icone}
      {children}
      <X className="size-3" />
    </Link>
  );
}

export function FiltresCalendrier({
  baseHref,
  famillesDisponibles,
  domaines,
  filtres,
  vue,
}: {
  baseHref: string;
  /** Familles ayant au moins une échéance — les seules proposées. */
  famillesDisponibles: FamilleEcheance[];
  domaines: { id: string; label: string }[];
  filtres: FiltresActifs;
  /** Lecture en cours, reconduite dans chaque lien de filtre. */
  vue?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement | null>(null);

  // Fermeture au clic extérieur et à Échap — le panneau est le seul
  // état client, tout le reste vit dans l'URL.
  useEffect(() => {
    if (!ouvert) return;
    const surClic = (e: MouseEvent) => {
      if (racine.current && !racine.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", surClic);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("mousedown", surClic);
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert]);

  const fermer = () => setOuvert(false);
  const nbActifs =
    (filtres.famille ? 1 : 0) + (filtres.domaine ? 1 : 0) + (filtres.urgent ? 1 : 0);

  const href = (over: {
    famille?: string;
    domaine?: string;
    urgent?: boolean;
  }) =>
    construireHref(baseHref, {
      famille: over.famille ?? filtres.famille,
      domaine: over.domaine ?? filtres.domaine,
      urgent: over.urgent ?? filtres.urgent,
      vue,
    });

  const labelDomaine = (id: string | undefined) =>
    domaines.find((d) => d.id === id)?.label ?? id;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={racine} className="relative">
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          aria-expanded={ouvert}
          aria-haspopup="menu"
          className={
            "inline-flex items-center gap-2 rounded-full border px-4 py-[9px] text-[12.5px] font-semibold transition-colors " +
            (ouvert
              ? "border-transparent bg-[color:var(--board-ink)] text-white"
              : "border-[color:rgba(10,10,10,.16)] bg-[color:var(--board-card)] text-[color:var(--board-ink)] hover:bg-[color:var(--board-blue-pale)]")
          }
        >
          <SlidersHorizontal className="size-3.5" />
          Filtres
          {nbActifs > 0 ? (
            <span
              className={
                "flex size-[18px] items-center justify-center rounded-full text-[10.5px] font-semibold tabular-nums " +
                (ouvert
                  ? "bg-white text-[color:var(--board-ink)]"
                  : "bg-[color:var(--board-ink)] text-white")
              }
            >
              {nbActifs}
            </span>
          ) : null}
        </button>

        {ouvert ? (
          <div className="absolute left-0 top-full z-30 mt-2 w-[300px] rounded-[18px] bg-[color:var(--board-card)] p-2.5 shadow-[0_1px_2px_rgba(13,18,36,.06),0_18px_44px_-16px_rgba(13,18,36,.28)] ring-1 ring-[color:rgba(13,18,36,.08)]">
            <TitreGroupe>Type d&apos;échéance</TitreGroupe>
            <Option
              href={href({ famille: "" })}
              actif={!filtres.famille}
              onNaviguer={fermer}
            >
              Tout le calendrier
            </Option>
            {famillesDisponibles.map((f) => (
              <Option
                key={f}
                href={href({
                  famille: f,
                  // Quitter les contrôles lâche leur domaine.
                  domaine: f === "controle" ? undefined : "",
                })}
                actif={filtres.famille === f}
                onNaviguer={fermer}
                icone={<MarqueurFamille famille={f} className="size-4" />}
              >
                {LABEL_FAMILLE_LONG[f]}
              </Option>
            ))}

            <div className="mx-2.5 mt-2 border-t border-[color:rgba(10,10,10,.08)]" />
            <TitreGroupe>Domaine des contrôles</TitreGroupe>
            <Option
              href={href({ domaine: "" })}
              actif={!filtres.domaine}
              onNaviguer={fermer}
            >
              Tous les domaines
            </Option>
            {domaines.map((d) => (
              <Option
                key={d.id}
                // Choisir un domaine recentre sur les contrôles : c'est
                // leur attribut, le panneau le montre en cochant les deux.
                href={href({ domaine: d.id, famille: "controle" })}
                actif={filtres.domaine === d.id}
                onNaviguer={fermer}
              >
                {d.label}
              </Option>
            ))}

            <div className="mx-2.5 mt-2 border-t border-[color:rgba(10,10,10,.08)]" />
            <TitreGroupe>Urgence</TitreGroupe>
            <Option
              href={href({ urgent: !filtres.urgent })}
              actif={filtres.urgent}
              onNaviguer={fermer}
            >
              En retard seulement
            </Option>
          </div>
        ) : null}
      </div>

      {/* Les filtres actifs restent lisibles sans ouvrir le panneau. */}
      {filtres.famille ? (
        <Chip
          href={href({ famille: "" })}
          icone={
            <MarqueurFamille famille={filtres.famille} className="size-3" />
          }
        >
          {LABEL_FAMILLE[filtres.famille]}
        </Chip>
      ) : null}
      {filtres.domaine ? (
        <Chip href={href({ domaine: "" })}>{labelDomaine(filtres.domaine)}</Chip>
      ) : null}
      {filtres.urgent ? (
        <Chip href={href({ urgent: false })} ton="alerte">
          En retard seulement
        </Chip>
      ) : null}
    </div>
  );
}
