"use client";

// Une question de fiche, rendue depuis son `ChampFiche`.
//
// Les six types du catalogue (`src/lib/registre/champs.ts`) se rendent tous
// ici : le formulaire d'une fiche et le formulaire d'ajout d'une ligne de
// journal posent les mêmes questions, ils ne doivent pas les poser sous deux
// apparences.
//
// Jetons de la charte (`.champ-board` / `.label-board`), comme le dépôt de
// rapport. Les primitives `Input` / `Label` restent en place sur les écrans
// qui n'ont pas encore été repris, mais elles ne sont pas une alternative :
// leur rayon de 6 px sonne comme un encart d'un autre logiciel au milieu
// d'une carte à rayon 30.
//
// Le `name` vaut la clé du catalogue, à plat : l'action parse le formulaire
// par `Object.fromEntries(formData)` contre un schéma Zod dérivé de
// `champs.ts`. Un préfixe casserait ce parsing.

import type { ChampFiche, TypeChamp } from "@/lib/registre/champs";

/** Ce qui fait qu'un champ se saisit bien — clavier mobile compris. */
function attributs(
  type: TypeChamp,
): React.InputHTMLAttributes<HTMLInputElement> {
  switch (type) {
    case "date":
      // Le registre consigne un jour, jamais un instant : clé de jour civil
      // « AAAA-MM-JJ » (ADR-011), qui est ce que rend `type=date`.
      return { type: "date" };
    case "nombre":
      // `inputMode` plutôt que `type=number` : la molette et les flèches
      // d'un champ nombre modifient une valeur déjà saisie par accident, et
      // un effectif n'est pas une quantité qu'on incrémente. Le schéma
      // attend de toute façon une chaîne.
      return { type: "text", inputMode: "numeric", pattern: "[0-9]*" };
    case "telephone":
      return { type: "tel", inputMode: "tel", autoComplete: "tel" };
    case "email":
      return { type: "email", inputMode: "email", autoComplete: "email" };
    default:
      return { type: "text" };
  }
}

export function ChampSaisie({
  champ,
  valeurInitiale,
  erreur,
  requis,
  placeholder,
}: {
  champ: ChampFiche;
  valeurInitiale?: string | null;
  erreur?: string;
  requis?: boolean;
  placeholder?: string;
}) {
  const id = `fiche-${champ.cle}`;
  const idAide = champ.aide ? `${id}-aide` : undefined;
  const idErreur = erreur ? `${id}-erreur` : undefined;
  const decrit = [idAide, idErreur].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label className="label-board" htmlFor={id}>
        {champ.libelle}
        {requis && " *"}
      </label>

      {champ.type === "texte_long" ? (
        <textarea
          id={id}
          name={champ.cle}
          rows={3}
          required={requis}
          defaultValue={valeurInitiale ?? ""}
          placeholder={placeholder}
          className="champ-board"
          aria-invalid={Boolean(erreur)}
          aria-describedby={decrit}
        />
      ) : (
        <input
          id={id}
          name={champ.cle}
          required={requis}
          defaultValue={valeurInitiale ?? ""}
          placeholder={placeholder}
          className="champ-board"
          aria-invalid={Boolean(erreur)}
          aria-describedby={decrit}
          {...attributs(champ.type)}
        />
      )}

      {champ.aide && (
        <p
          id={idAide}
          className="m-0 mt-1.5 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]"
        >
          {champ.aide}
        </p>
      )}
      {erreur && (
        <p
          id={idErreur}
          className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]"
        >
          {erreur}
        </p>
      )}
    </div>
  );
}
