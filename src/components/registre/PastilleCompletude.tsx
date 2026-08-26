// Ce qu'une fiche annonce d'elle-même, en un coup d'œil.
//
// Le dirigeant ouvre cet écran pour savoir ce qui manquerait si la
// commission passait demain. Une fiche listée sans dire si elle est remplie
// répond à « comment je remplis » et tait « qu'est-ce qui manque ».
//
// La pastille dit un **fait de saisie** — combien de réponses, combien de
// lignes — jamais un jugement. « Renseignée » n'est pas « conforme », et
// aucun libellé ici ne doit le laisser entendre.
//
// Le champ et l'encre viennent du même vocabulaire d'état que le calendrier
// (`CHAMP_ETAT` / `ENCRE_ETAT`) : vert pour ce qui est fait, ardoise pour ce
// qui attend, bleu pour un renvoi. Une fiche qui reste à remplir n'est pas
// en retard — pas de rose ici, rien n'a d'échéance sur cet écran.

import {
  libelleCompletude,
  tonCompletude,
  type Completude,
  type TonCompletude,
} from "@/lib/registre/completude";

const CHAMP: Record<TonCompletude, string> = {
  faite: "var(--board-green)",
  renvoi: "var(--board-blue-pale)",
  attente: "var(--board-slate-pale)",
  muet: "transparent",
};

const ENCRE: Record<TonCompletude, string> = {
  faite: "var(--board-green-ink)",
  renvoi: "var(--board-blue-ink)",
  attente: "var(--board-slate-mid)",
  muet: "var(--board-slate-soft)",
};

export function PastilleCompletude({
  completude,
  className = "",
}: {
  completude: Completude;
  className?: string;
}) {
  const ton = tonCompletude(completude);
  return (
    <span
      className={
        "pastille-board text-[11.5px] " +
        // Une fiche que l'outil ne recueille pas encore n'a pas d'état à
        // proclamer : le trait discontinu dit « rien ici », sans aplat.
        (ton === "muet"
          ? "border border-dashed border-[color:var(--board-slate-line)] "
          : "") +
        className
      }
      style={{ background: CHAMP[ton], color: ENCRE[ton] }}
    >
      {libelleCompletude(completude)}
    </span>
  );
}
