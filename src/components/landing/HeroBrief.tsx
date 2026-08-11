"use client";

// LA SCÈNE DU HERO — une photo de terrain en tuile, et le produit posé
// par-dessus en widgets détachés.
//
// La règle de composition vient des références validées : la photo tient
// le centre dans un rectangle très arrondi, et les fiches débordent de
// ses bords (gauche / droite) au lieu d'être alignées à côté. C'est ce
// débord qui donne la profondeur — pas une perspective, pas une
// inclinaison : les fiches restent droites, seules les ombres portent.
//
// Chaque fiche dit une échéance réelle, avec le terme du métier :
// vérification des extincteurs, dégraissage des conduits, vérification
// électrique. Un widget qui n'affiche qu'une abstraction ne prouve rien.
//
// L'entrée est en CSS (.lp-surgit, .lp-pop, .lp-halo) pour que
// `prefers-reduced-motion` serve la composition déjà en place. Ne reste
// en JS que le geste : la fiche qui s'enfonce sous le doigt.
//
// En dessous de `sm`, les fiches repassent en colonne sous la photo :
// une composition en absolu ne tient pas sur 390 px de large.

import { FileText, Flame } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * La photo du hero. Un seul endroit à changer pour la remplacer.
 *
 * Le sujet est au travail, dans son atelier, en train de lire son
 * téléphone — pas derrière un bureau. Cadrage attendu : portrait 2/3 ou
 * 4/5, sujet dans le tiers central, lumière naturelle. Cf.
 * `public/photos/README.md`.
 */
const PHOTO_HERO = {
  src: "/photos/hero-terrain.jpg",
  alt: "Un garagiste en bleu de travail consulte son téléphone dans son atelier",
  // Recadrage : garde le visage et le téléphone quand le 2/3 est coupé en 4/5.
  position: "58% 42%",
};

/** La semaine affichée. `marque` pose une pastille sous le jour : ce qui
 *  traîne, ce qui a été fait, ce qui approche. */
const JOURS = [
  { lettre: "L", chiffre: 9, marque: "retard" as const },
  { lettre: "M", chiffre: 10, marque: null },
  { lettre: "M", chiffre: 11, marque: null, aujourdhui: true },
  { lettre: "J", chiffre: 12, marque: "proche" as const },
  { lettre: "V", chiffre: 13, marque: "fait" as const },
  { lettre: "S", chiffre: 14, marque: null },
  { lettre: "D", chiffre: 15, marque: null },
];

const CHAMP = {
  retard: "bg-[color:var(--board-signal)]",
  proche: "bg-[color:var(--board-amber)]",
  fait: "bg-[color:var(--board-green)]",
};

export function HeroBrief() {
  // Le seul état : la fiche est sous le doigt. Rien d'autre ne bouge —
  // le dossier reste tel qu'il est.
  const [presse, setPresse] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const minuteurs = [
      setTimeout(() => setPresse(true), 2400),
      setTimeout(() => setPresse(false), 2820),
    ];
    return () => minuteurs.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative">
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col gap-3 sm:block sm:max-w-none">
        {/* ── La photo, au centre ──────────────────────────────── */}
        <div
          className="lp-surgit relative aspect-[4/5] w-full overflow-hidden rounded-[30px] bg-[color:var(--board-ink)] sm:mx-auto sm:w-[64%] lg:rounded-[38px]"
          style={{ animationDelay: "60ms" }}
        >
          <Image
            src={PHOTO_HERO.src}
            alt={PHOTO_HERO.alt}
            fill
            priority
            sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 26vw"
            className="object-cover"
            style={{ objectPosition: PHOTO_HERO.position }}
          />
          {/* Un voile discret en bas : les fiches qui mordent sur la
              photo doivent garder leur ombre lisible. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
          />
        </div>

        {/* ── La semaine, en haut à gauche ─────────────────────── */}
        <div
          className="lp-fiche-carte lp-surgit px-4 py-3.5 sm:absolute sm:left-[-8%] sm:top-[6%] sm:z-10 sm:w-[50%] lg:px-5 lg:py-4"
          style={{ animationDelay: "520ms" }}
        >
          <div className="flex items-baseline justify-between gap-3 pb-3">
            <p
              className="text-[0.9rem] font-semibold tracking-[-0.02em] text-[color:var(--board-ink)]"
              style={{ fontFamily: "var(--font-titre), sans-serif" }}
            >
              Votre semaine
            </p>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--board-slate-soft)]">
              Août
            </span>
          </div>

          <ol className="m-0 grid list-none grid-cols-7 gap-1 p-0">
            {JOURS.map((j, i) => (
              <li
                key={j.lettre + j.chiffre}
                className="lp-pop flex flex-col items-center gap-1.5"
                style={{ animationDelay: `${760 + i * 55}ms` }}
              >
                <span className="font-mono text-[0.58rem] uppercase text-[color:var(--board-slate-soft)]">
                  {j.lettre}
                </span>
                <span
                  className={
                    "flex size-7 items-center justify-center rounded-[10px] text-[0.74rem] font-semibold tabular-nums " +
                    (j.aujourdhui
                      ? "bg-[color:var(--board-ink)] text-white"
                      : "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-ink)]")
                  }
                >
                  {j.chiffre}
                </span>
                <span
                  className={
                    "size-1.5 rounded-full " +
                    (j.marque ? CHAMP[j.marque] : "bg-transparent")
                  }
                />
              </li>
            ))}
          </ol>

          {/* L'échéance nommée : sans elle, le calendrier ne dit rien. */}
          <p className="mt-3 flex items-center gap-2 border-t border-[rgba(10,10,10,.08)] pt-3 text-[0.75rem] leading-[1.35] text-[color:var(--board-slate-mid)]">
            <span className="size-1.5 flex-none rounded-full bg-[color:var(--board-amber)]" />
            <span className="truncate">
              <span className="font-semibold text-[color:var(--board-ink)]">
                Jeu. 12
              </span>{" "}
              · Vérification électrique annuelle
            </span>
          </p>
        </div>

        {/* ── La prochaine échéance, tuile d'encre à droite ────── */}
        <div
          className="lp-fiche-carte lp-fiche-encre lp-surgit flex items-center gap-4 px-4 py-3.5 sm:absolute sm:right-[-6%] sm:top-[42%] sm:z-10 sm:w-[48%] lg:px-5"
          style={{ animationDelay: "1180ms" }}
        >
          <p className="flex flex-none items-baseline gap-1 text-white">
            <span
              className="text-[2.1rem] font-semibold leading-none tracking-[-0.05em] tabular-nums"
              style={{ fontFamily: "var(--font-titre), sans-serif" }}
            >
              24
            </span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-white/60">
              j
            </span>
          </p>
          <span aria-hidden className="h-9 w-px flex-none bg-white/15" />
          <div className="min-w-0">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/55">
              Prochaine échéance
            </p>
            <p className="mt-1 text-[0.8rem] font-semibold leading-[1.3] tracking-[-0.015em] text-white">
              Dégraissage des conduits de hotte
            </p>
          </div>
        </div>

        {/* ── L'alerte, et le geste. En bas à droite. ──────────── */}
        <div
          data-presse={presse ? "true" : "false"}
          className="lp-fiche-carte lp-surgit px-4 py-3.5 sm:absolute sm:bottom-[3%] sm:right-[-6%] sm:z-10 sm:w-[54%] lg:px-5"
          style={{ animationDelay: "1560ms" }}
        >
          <div className="flex items-center gap-3">
            <span
              className={
                "lp-halo flex size-9 flex-none items-center justify-center rounded-full " +
                CHAMP.retard
              }
            >
              <Flame className="size-4 text-[color:var(--board-ink)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.83rem] font-semibold leading-[1.25] tracking-[-0.015em] text-[color:var(--board-ink)]">
                Extincteurs — vérification annuelle
              </p>
              <p className="mt-0.5 text-[0.73rem] leading-[1.35] text-[color:var(--board-slate-mid)]">
                Dépassée depuis lundi · 6 appareils
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[rgba(10,10,10,.08)] pt-3">
            <span className="lp-pill lp-pill-retard">En retard</span>
            <span
              aria-hidden
              className="lp-btn lp-btn-ink relative overflow-hidden px-3.5 py-1.5 text-[0.73rem]"
            >
              {presse ? (
                <span className="lp-onde absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />
              ) : null}
              Déposer le rapport
            </span>
          </div>
        </div>

        {/* ── Le registre, petite pastille en bas à gauche ─────── */}
        <div
          className="lp-fiche-carte lp-fiche-pastille lp-surgit flex items-center gap-3 px-3.5 py-2.5 sm:absolute sm:bottom-[22%] sm:left-[-8%] sm:z-10 sm:w-[45%]"
          style={{ animationDelay: "1900ms" }}
        >
          <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[color:var(--board-green)]">
            <FileText className="size-3.5 text-[color:var(--board-ink)]" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[color:var(--board-slate-soft)]">
              Registre de sécurité
            </p>
            <p className="truncate text-[0.8rem] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
              Rapport horodaté
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
