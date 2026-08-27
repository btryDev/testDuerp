import { cn } from "@/lib/utils";
import { CHAMP_ETAT, ENCRE_ETAT } from "@/lib/calendrier/etats";
import type { Charte } from "./charte";

/**
 * Grammaire unifiée de statut conformité.
 * Jamais la couleur seule : toujours picto + label pour WCAG 2.1 AA.
 */
export type StatusKind =
  | "a_jour"
  | "a_planifier"
  | "en_retard"
  // Le nom de ce cas est un verdict de conformité, et c'est un reste du
  // papier (interdits 16-17 : un fait de saisie, jamais un jugement). Le
  // libellé board le reformule déjà ; le renommer ici demanderait de
  // toucher les appelants papier, ce que la cohabitation s'interdit. À
  // faire passer en `ecart_releve` quand le dernier d'entre eux sera parti.
  | "non_conforme"
  | "non_applicable";

const ICONE: Record<StatusKind, string> = {
  a_jour: "●",
  a_planifier: "◐",
  en_retard: "◎",
  non_conforme: "■",
  non_applicable: "—",
};

const LABEL: Record<StatusKind, string> = {
  a_jour: "À jour",
  a_planifier: "À planifier",
  en_retard: "En retard",
  non_conforme: "Non conforme",
  non_applicable: "Non applicable",
};

/**
 * Ce que la pastille dit en board. Deux mots changent :
 *
 * — « Non conforme » devient « Écart relevé ». L'outil constate qu'une
 *   mesure sort de la plage attendue ; il ne prononce pas la conformité
 *   d'un établissement, et le produit ne dit jamais « conforme » ni son
 *   contraire (CLAUDE.md, règle 8 ; charte, interdits 16-17).
 * — « À jour » reste : c'est un fait de calendrier — l'échéance est
 *   honorée —, pas un jugement, et c'est exactement ce que le vert
 *   « fait » du board signifie.
 */
const LABEL_BOARD: Record<StatusKind, string> = {
  ...LABEL,
  non_conforme: "Écart relevé",
};

const STYLE: Record<StatusKind, string> = {
  a_jour: "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]",
  a_planifier: "bg-[color:var(--warm-soft)] text-[color:var(--warm)]",
  en_retard: "bg-amber-100 text-amber-900",
  non_conforme:
    "bg-[color:color-mix(in_oklch,var(--minium)_14%,transparent)] text-[color:var(--minium)]",
  non_applicable: "bg-[color:var(--paper-sunk)] text-[color:var(--seal)]",
};

/**
 * Les couples champ/encre du board, pris à la source unique plutôt que
 * réécrits : trois tables locales de couleurs d'état ont déjà existé dans
 * ce dépôt, et un « à venir » rendu rose dans une seule des trois suffit à
 * faire lire un futur comme un retard.
 *
 * Deux écarts assumés avec la table papier :
 * — `en_retard` quitte l'ambre (que le papier prenait d'ailleurs à
 *   Tailwind, hors palette) pour le signal. Dans le board l'ambre est
 *   « proche », pas « dépassé » : un retard peint en ambre se lit comme
 *   une échéance qui approche.
 * — `non_applicable` ne vient pas de `CHAMP_ETAT` : ce n'est pas un état
 *   d'échéance mais l'absence d'obligation. Même creux ardoise que
 *   « à planifier », d'un cran plus discret à l'encre, pour qu'un
 *   non-sujet ne pèse pas autant qu'un rendez-vous à prendre.
 */
const COULEURS_BOARD: Record<StatusKind, { champ: string; encre: string }> = {
  a_jour: { champ: CHAMP_ETAT.faite, encre: ENCRE_ETAT.faite },
  a_planifier: { champ: CHAMP_ETAT.aPlanifier, encre: ENCRE_ETAT.aPlanifier },
  en_retard: { champ: CHAMP_ETAT.enRetard, encre: ENCRE_ETAT.enRetard },
  non_conforme: { champ: CHAMP_ETAT.enRetard, encre: ENCRE_ETAT.enRetard },
  non_applicable: {
    champ: "var(--board-slate-pale)",
    encre: "var(--board-slate-soft)",
  },
};

/** La forme, pas la couleur — `.pastille-board`, jamais recopiée. */
const TAILLE_BOARD: Record<"sm" | "md", string> = {
  sm: "pastille-board px-2.5 py-[5px] text-[11px]",
  md: "pastille-board",
};

export function StatusPill({
  status,
  label,
  size = "md",
  className,
  charte = "papier",
}: {
  status: StatusKind;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  /** La grammaire visuelle de l'écran qui porte la pastille. */
  charte?: Charte;
}) {
  const texte = label ?? (charte === "board" ? LABEL_BOARD : LABEL)[status];

  if (charte === "board") {
    const { champ, encre } = COULEURS_BOARD[status];
    return (
      // Pas de glyphe : le board pose ses pastilles en mots seuls (cf.
      // `PastilleFiche`), et le mot suffit à ce que la couleur ne porte
      // jamais l'information à elle seule (WCAG 2.1 AA, interdit 10).
      <span
        className={cn(TAILLE_BOARD[size], className)}
        style={{ background: champ, color: encre }}
        role="status"
        aria-label={texte}
      >
        {texte}
      </span>
    );
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-full font-mono font-semibold tracking-[0.04em]";
  const sz =
    size === "sm"
      ? "px-2 py-0.5 text-[0.62rem]"
      : "px-2.5 py-1 text-[0.7rem]";
  return (
    <span
      className={cn(base, sz, STYLE[status], className)}
      role="status"
      aria-label={texte}
    >
      <span aria-hidden>{ICONE[status]}</span>
      <span>{texte}</span>
    </span>
  );
}

export const STATUS_LABEL = LABEL;
export const STATUS_LABEL_BOARD = LABEL_BOARD;
