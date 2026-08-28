import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { StatutPiece } from "@/lib/prestataires/vigilance";
import { messageExpiration } from "@/lib/prestataires/vigilance";
import { CHAMP_ETAT, ENCRE_ETAT, type RegistreLigne } from "@/lib/calendrier/etats";

/**
 * L'état d'une pièce de vigilance, en charte board (`docs/charte-board.md`).
 *
 * Les couleurs ne sont plus déclarées ici. Elles viennent de `CHAMP_ETAT` /
 * `ENCRE_ETAT`, source unique du produit — ce composant portait une quatrième
 * table locale, avec deux couleurs Tailwind brutes hors palette
 * (`bg-amber-100 text-amber-900`) et deux tokens de la charte papier. Une
 * table de couleurs locale finit toujours par diverger : un « expire bientôt »
 * ambre ici et paille ailleurs, et l'utilisateur lit deux états là où il n'y
 * en a qu'un.
 */
const ETAT_DE_LA_PIECE: Record<StatutPiece, RegistreLigne> = {
  a_jour: "faite",
  expire_bientot: "proche",
  expiree: "enRetard",
  // Une pièce qui n'a jamais été fournie n'est pas en retard : rien n'a
  // d'échéance tant qu'il n'y a pas de document. C'est l'ardoise, comme
  // « à planifier » au calendrier — l'absence de rendez-vous, pas l'urgence.
  manquante: "aPlanifier",
};

const LABEL: Record<StatutPiece, string> = {
  a_jour: "À jour",
  expire_bientot: "Expire bientôt",
  expiree: "Expirée",
  manquante: "Non fournie",
};

export function VigilancePiecePill({
  libelle,
  statut,
  jours,
  className,
}: {
  libelle: string;
  statut: StatutPiece;
  jours: number | null;
  className?: string;
}) {
  const etat = ETAT_DE_LA_PIECE[statut];

  return (
    <span
      className={cn(
        "flex items-center justify-between gap-3 rounded-[14px] bg-[color:var(--board-slate-pale)] px-3 py-2",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="board-eyebrow block text-[9.5px] tracking-[0.14em] text-[color:var(--board-slate-soft)]">
          {libelle}
        </span>
        {/* L'échéance en toutes lettres vient de `messageExpiration` : la
            règle (« expire aujourd'hui » le jour dit, expirée seulement à
            partir du lendemain) est tenue par `lib/prestataires/vigilance`,
            source unique — le composant ne la recalcule pas.
            Sur une pièce absente, la ligne répéterait le statut : on la tait. */}
        {statut !== "manquante" && (
          <span className="mt-0.5 block text-[11.5px] leading-[1.4] text-[color:var(--board-slate-mid)]">
            {messageExpiration(jours)}
          </span>
        )}
      </span>

      {/* Jamais la couleur seule : le point porte l'état, le mot le nomme.
          Une signalétique qui tient à une couleur disparaît en niveaux de
          gris et pour qui n'y voit pas (charte § 7). */}
      <span
        className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[11.5px] font-semibold"
        style={{ color: ENCRE_ETAT[etat] }}
      >
        {/* Un cerne, sinon la puce disparaît dans le seul cas qui compte :
            `CHAMP_ETAT.aPlanifier` vaut exactement le fond de cette tuile, si
            bien qu'une pièce jamais fournie — un document légal absent —
            perdait son point pendant que toutes les autres gardaient le leur.
 
            Le cerne porte l'ENCRE de l'état, pas `--board-slate`. Le premier
            correctif employait celui-ci : 1,41:1 sur la tuile, là où WCAG 1.4.11
            demande 3:1 pour un élément graphique porteur d'information — la
            justification du correctif était l'accessibilité, et il ne
            l'atteignait pas. L'encre d'un état est lisible sur son propre champ
            par construction (c'est la définition du couple), et
            `ENCRE_ETAT.aPlanifier` donne 6,02:1 sur le fond de la tuile. Une
            règle uniforme, conforme dans les cinq cas, sans exception à
            entretenir. */}
        <span
          aria-hidden
          className="size-[7px] flex-none rounded-full ring-1 ring-inset"
          style={{ background: CHAMP_ETAT[etat], "--tw-ring-color": ENCRE_ETAT[etat] } as CSSProperties}
        />
        {LABEL[statut]}
      </span>
    </span>
  );
}
