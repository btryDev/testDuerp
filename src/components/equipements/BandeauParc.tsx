// Le bandeau du parc — clair, pleine largeur, bord à bord.
//
// Il portait un aplat d'encre : le noir posait une troisième bande sombre
// dans un parcours qui en compte déjà deux (la barre latérale, la bande du
// calendrier), et le titre éditorial qu'il portait n'apprenait rien.
// Celui-ci a la même charge que la bande du calendrier — d'où l'on vient,
// où l'on est, une phrase, ce que l'écran propose — mais sur papier.
//
// Les trois chiffres ne comptent que le parc AFFICHÉ — c'est l'appelant
// qui les additionne, appareil par appareil, sur les cartes qu'il rend.
// Ils ne certifient rien, ce sont des faits datés.
//
// **Le filtre par bâtiment vit donc ici, dans la même bande qu'eux.** Il
// règle ce que le bandeau compte autant que ce que l'écran montre : « 12
// au parc » au-dessus de trois cartes serait un mensonge à la ligne près,
// et un en-tête ne doit jamais contredire ce qu'il coiffe. La légende sous
// le sélecteur dit à chaque fois sur quoi la rangée porte — un compteur
// dont le périmètre se règle d'un clic doit annoncer son périmètre.

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SelecteurBatiment } from "@/components/batiments/SelecteurBatiment";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHAMP_ETAT, ENCRE_ETAT } from "@/lib/calendrier/etats";

function Compteur({
  nombre,
  legende,
  champ,
  encre,
}: {
  nombre: number;
  legende: string;
  champ: string;
  encre: string;
}) {
  return (
    <span
      className="inline-flex items-baseline gap-2 rounded-full px-4 py-[9px]"
      style={{ background: champ }}
    >
      <span className="board-titre text-[20px] leading-none tabular-nums">
        {nombre}
      </span>
      <span
        className="board-eyebrow text-[9.5px] tracking-[0.12em]"
        style={{ color: encre }}
      >
        {legende}
      </span>
    </span>
  );
}

export function BandeauParc({
  hrefRetour,
  enRetard,
  proches,
  aPlanifier,
  total,
  hrefAjouter,
  suggestions,
  filtreBatiment,
}: {
  hrefRetour: string;
  enRetard: number;
  proches: number;
  /**
   * Vérifications sans date de rendez-vous. Ni un retard ni un engagement
   * daté — et c'est pour ça qu'il a son propre chiffre : fondu dans les
   * deux autres il aurait menti, absent il faisait pire. Un parc fraîchement
   * déclaré n'a par construction que des lignes à planifier : le bandeau
   * annonçait « 0 en retard · 0 sous 30 j » — un écran calme — au-dessus de
   * cartes qui disaient toutes « 3 à planifier ».
   */
  aPlanifier: number;
  total: number;
  hrefAjouter: string;
  /** Ce que le référentiel propose encore de déclarer, et où le lire. */
  suggestions?: { nombre: number; href: string } | null;
  /**
   * Le filtre par bâtiment (ADR-019). Absent tant que l'établissement n'a
   * qu'un bâtiment : le mono-bâtiment ne paie pas la complexité du multi.
   * Il vit dans le bandeau, et pas au-dessus des cartes, parce qu'il règle
   * aussi les trois chiffres ci-contre.
   */
  filtreBatiment?: {
    baseHref: string;
    batiments: { id: string; nom: string; nbEquipements: number }[];
    /** `undefined` = tout l'établissement. */
    actif: string | undefined;
  } | null;
}) {
  return (
    <>
      <header className="border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-card)] px-[var(--board-gutter)] py-[22px]">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 items-start gap-4">
            <Link
              href={hrefRetour}
              aria-label="Retour à Mon établissement"
              className="grid size-8 flex-none place-items-center rounded-full bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)] transition-colors hover:bg-[color:var(--board-blue-pale)] hover:text-[color:var(--board-blue-ink)]"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="board-titre m-0 text-[clamp(22px,2.2vw,27px)]">
                Équipements
              </h1>
              <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                Ce que vous avez, et où. Chaque appareil porte ses
                vérifications, ses rapports et ses papiers&nbsp;: ouvrez sa
                fiche pour les voir.
              </p>
            </div>
          </div>

          <div className="flex flex-none flex-wrap items-center gap-2.5">
            <Compteur
              nombre={enRetard}
              legende="en retard"
              champ="var(--board-signal)"
              encre="var(--board-signal-ink)"
            />
            <Compteur
              nombre={proches}
              legende="sous 30 j"
              champ="var(--board-amber)"
              encre="var(--board-amber-ink)"
            />
            {aPlanifier > 0 ? (
              <Compteur
                nombre={aPlanifier}
                legende="à planifier"
                champ={CHAMP_ETAT.aPlanifier}
                encre={ENCRE_ETAT.aPlanifier}
              />
            ) : null}
            <Compteur
              nombre={total}
              legende="au parc"
              champ="var(--board-slate-pale)"
              encre="var(--board-slate-mid)"
            />
            <Link
              href={hrefAjouter}
              className={cn(
                buttonVariants({
                  variant: "board",
                  size: "board",
                  className: "ml-1.5 flex-none",
                }),
              )}
            >
              + Ajouter un équipement
            </Link>
          </div>
        </div>

        {filtreBatiment ? (
          <div className="mt-[18px] border-t border-[color:var(--board-slate-line)] pt-[15px]">
            <SelecteurBatiment
              ton="board"
              baseHref={filtreBatiment.baseHref}
              batiments={filtreBatiment.batiments}
              actif={filtreBatiment.actif}
              compteurs={
                new Map(
                  filtreBatiment.batiments.map((b) => [b.id, b.nbEquipements]),
                )
              }
              legende={
                // Un compteur doit dire sur quoi il compte, surtout quand
                // le périmètre est réglable d'un clic juste à côté.
                filtreBatiment.actif
                  ? "Les chiffres ci-dessus et les familles ci-dessous ne portent que sur ce bâtiment."
                  : "Les chiffres ci-dessus et les familles ci-dessous portent sur tout l'établissement."
              }
            />
          </div>
        ) : null}
      </header>

      {suggestions && suggestions.nombre > 0 ? (
        <div className="flex items-center gap-2.5 border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-slate-pale)] px-[var(--board-gutter)] py-[11px]">
          <span
            aria-hidden
            className="size-1.5 flex-none rounded-full bg-[color:var(--board-blue-mid)]"
          />
          <p className="m-0 text-[12.5px] text-[color:var(--board-slate-mid)]">
            {suggestions.nombre > 1
              ? `D'après votre secteur et vos régimes, ${suggestions.nombre} catégories d'équipement restent à examiner.`
              : "D'après votre secteur et vos régimes, une catégorie d'équipement reste à examiner."}{" "}
            <Link
              href={suggestions.href}
              className="font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
            >
              Voir les suggestions →
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}
