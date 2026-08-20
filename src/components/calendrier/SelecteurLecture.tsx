"use client";

// Le sélecteur de lecture (par mois / par équipement), posé dans la bande
// de titre en encre. Il ne possède pas son état : la lecture vit dans
// l'URL (`?vue=equipement`), écrite d'un `history.replaceState` sans
// repasser serveur — `AnneeCalendrier` la lit par `useSearchParams` et
// bascule ses blocs, les filtres la reconduisent dans leurs liens, un
// partage ou un favori la capture.

import { useSearchParams } from "next/navigation";
import type { Lecture } from "./AnneeCalendrier";

/** Écrit la lecture dans l'URL, sans navigation serveur. */
export function ecrireLecture(l: Lecture) {
  const url = new URL(window.location.href);
  if (l === "equipement") url.searchParams.set("vue", "equipement");
  else url.searchParams.delete("vue");
  window.history.replaceState(null, "", url);
}

/** La lecture portée par des params d'URL. */
export function lectureDesParams(params: URLSearchParams): Lecture {
  return params.get("vue") === "equipement" ? "equipement" : "mois";
}

export function SelecteurLecture() {
  const lecture = lectureDesParams(useSearchParams());

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
      <Onglet actif={lecture === "mois"} onClick={() => ecrireLecture("mois")}>
        Par mois
      </Onglet>
      <Onglet
        actif={lecture === "equipement"}
        onClick={() => ecrireLecture("equipement")}
      >
        Par équipement
      </Onglet>
    </div>
  );
}

function Onglet({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={
        "rounded-full px-[18px] py-[9px] text-[13px] font-semibold leading-none transition-colors " +
        (actif
          ? "bg-white text-[color:var(--board-ink)]"
          : "text-white/75 hover:text-white")
      }
    >
      {children}
    </button>
  );
}
