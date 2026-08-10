"use client";

// Carte « calendrier » de la page vérifications — réutilise telles
// quelles les vues mois/année du widget frise du board (VueMois,
// VueAnnee) : même donnée, mêmes tons, même bascule Mois / Année.
// Seul le cadre change : une carte bento en tête de page plutôt qu'un
// widget du tableau de bord.

import { useState } from "react";
import { VueMois } from "./VueMois";
import { VueAnnee } from "./VueAnnee";
import { LABEL_FAMILLE, MarqueurFamille } from "./MarqueurFamille";
import { JOURS_APRES, JOURS_AVANT } from "@/lib/dashboard/frise";
import type { EvenementGrille } from "@/lib/calendrier/grille";
import type { FamilleEcheance } from "@/lib/calendrier/echeances";

/** Ordre stable de la légende — les contrôles d'abord, le socle. */
const ORDRE_LEGENDE: FamilleEcheance[] = [
  "controle",
  "travaux",
  "papiers",
  "personnel",
];

const JOUR_MS = 86400000;

export function CalendrierGrille({
  etablissementId,
  evenements,
  aujourdhui,
  nbSansDate = 0,
}: {
  etablissementId: string;
  evenements: EvenementGrille[];
  aujourdhui: Date;
  /** Vérifications « à planifier » : sans date choisie, elles ne sont
   *  pas posées sur la grille — la note de pied les signale. */
  nbSansDate?: number;
}) {
  // La grille d'un mois d'abord — on est sur la page du détail ; l'année
  // d'un bloc reste à une bascule.
  const [maille, setMaille] = useState<"mois" | "annee">("mois");
  const [mois, setMois] = useState(
    () => new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1),
  );

  // Même fenêtre que la frise du board : 90 j en arrière, 24 mois en
  // avant, bornée au mois entier — au-delà, la donnée n'est pas chargée
  // et une grille vide mentirait.
  const brutDebut = new Date(aujourdhui.getTime() - JOURS_AVANT * JOUR_MS);
  const debut = new Date(brutDebut.getFullYear(), brutDebut.getMonth(), 1);
  const brutFin = new Date(aujourdhui.getTime() + JOURS_APRES * JOUR_MS);
  const fin = new Date(brutFin.getFullYear(), brutFin.getMonth() + 1, 0);

  // La légende n'enseigne que ce qui est là : les familles effectivement
  // présentes dans la donnée (les contrôles, toujours — le socle).
  const famillesPresentes = new Set<FamilleEcheance>(
    evenements.map((e) => e.famille ?? "controle"),
  );
  famillesPresentes.add("controle");
  const legende = ORDRE_LEGENDE.filter((f) => famillesPresentes.has(f));

  return (
    <section className="rounded-[30px] bg-[color:var(--board-card)] px-7 py-[26px] shadow-[0_1px_2px_rgba(13,18,36,.04),0_12px_32px_-14px_rgba(13,18,36,.10)] ring-1 ring-[color:rgba(13,18,36,.06)]">
      <div className="flex items-start gap-4">
        <div>
          <h2 className="m-0 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] text-[color:var(--board-ink)]">
            Votre calendrier
          </h2>
          <p className="mt-2 text-[13.5px] text-[color:var(--board-slate-mid)]">
            {maille === "annee"
              ? "L’année d’un bloc — cliquez un mois pour le détailler."
              : "Mois par mois, ce qui tombe et quel jour."}
          </p>
          {/* Le contrat de lecture, écrit noir sur blanc : la couleur dit
              l'urgence, l'icône dit la famille. */}
          {legende.length > 1 ? (
            <p className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-slate-soft)]">
              {legende.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <MarqueurFamille famille={f} className="size-3" />
                  {LABEL_FAMILLE[f]}
                </span>
              ))}
            </p>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(["mois", "annee"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMaille(m)}
              aria-pressed={maille === m}
              className={
                "rounded-full px-[13px] py-[6px] text-[11.5px] font-semibold transition-colors " +
                (maille === m
                  ? "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]"
                  : "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]")
              }
            >
              {m === "mois" ? "Mois" : "Année"}
            </button>
          ))}
        </div>
      </div>

      {maille === "annee" ? (
        <VueAnnee
          annee={mois.getFullYear()}
          evenements={evenements}
          aujourdhui={aujourdhui}
          fenetre={{ debut, fin }}
          onPrecedent={() =>
            setMois((m) => new Date(m.getFullYear() - 1, m.getMonth(), 1))
          }
          onSuivant={() =>
            setMois((m) => new Date(m.getFullYear() + 1, m.getMonth(), 1))
          }
          onChoisirMois={(m) => {
            setMois(m);
            setMaille("mois");
          }}
          peutReculer={new Date(mois.getFullYear() - 1, 11, 31) >= debut}
          peutAvancer={new Date(mois.getFullYear() + 1, 0, 1) <= fin}
        />
      ) : (
        <VueMois
          mois={mois}
          evenements={evenements}
          aujourdhui={aujourdhui}
          hrefEvenement={(e) =>
            `/etablissements/${etablissementId}/verifications/${e.id}`
          }
          onPrecedent={() =>
            setMois((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
          }
          onSuivant={() =>
            setMois((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
          }
          peutReculer={mois > debut}
          peutAvancer={mois < fin}
        />
      )}

      {/* Une vérification « à planifier » n'a pas de date choisie : la
          poser sur un jour mentirait. On dit combien attendent, et où
          les dater. */}
      {nbSansDate > 0 ? (
        <p className="m-0 mt-3 text-[11.5px] text-[color:var(--board-slate-soft)]">
          {nbSansDate > 1
            ? `${nbSansDate} vérifications à planifier n'ont pas encore de date — elles apparaîtront ici une fois programmées.`
            : "1 vérification à planifier n'a pas encore de date — elle apparaîtra ici une fois programmée."}{" "}
          Retrouvez-{nbSansDate > 1 ? "les" : "la"} dans la liste ci-dessous.
        </p>
      ) : null}
    </section>
  );
}
