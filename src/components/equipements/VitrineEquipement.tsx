// La carte d'un appareil dans le parc.
//
// Ce qu'elle remplace : une ligne de liste dont l'objet le plus visible
// était une tuile-date. Le parc répond à « qu'est-ce que j'ai, et où » —
// pas à « qu'est-ce qui tombe quand », qui est la question du calendrier.
// La date a donc quitté l'inventaire ; ce que la carte montre en grand,
// c'est le LIEU, et ce qu'elle chiffre en petit, ce sont des signaux.
//
// Le champ ne porte pas la marque de catégorie : dans une section
// « Extincteurs », la répéter quatre fois n'apprend rien. Il portera le
// bâtiment quand les bâtiments existeront (ADR-019) ; en attendant, il
// porte la localisation — le seul « où » dont on dispose.

import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  CHAMP_ETAT,
  ENCRE_ETAT,
  type RegistreLigne,
} from "@/lib/calendrier/etats";
import type { SignalEquipement } from "@/lib/equipements/etat-verifications";

/** Le champ d'un signal ne dit pas l'état d'une échéance mais le compte
 *  d'une famille d'échéances : on reprend les jetons d'état, en point. */
const ETAT_DU_SIGNAL: Record<SignalEquipement["cle"], RegistreLigne> = {
  enRetard: "enRetard",
  aPlanifier: "aPlanifier",
  faite: "faite",
};

function Signal({ signal }: { signal: SignalEquipement }) {
  const etat = ETAT_DU_SIGNAL[signal.cle];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--board-slate-pale)] px-2.5 py-[5px] text-[11.5px] font-semibold"
      style={{ color: ENCRE_ETAT[etat] }}
    >
      <span
        aria-hidden
        className="size-[7px] flex-none rounded-full"
        style={{ background: CHAMP_ETAT[etat] }}
      />
      {signal.libelle}
    </span>
  );
}

export function VitrineEquipement({
  libelle,
  lieu,
  signaux,
  href,
}: {
  libelle: string;
  /** Ce que le champ annonce en grand. `null` = non renseigné, et l'écran
   *  le dit plutôt que de laisser un blanc. */
  lieu: string | null;
  signaux: SignalEquipement[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className="carte-board group flex flex-col overflow-hidden rounded-[22px]"
    >
      <span
        className={
          "flex h-[104px] flex-none flex-col items-start justify-end gap-2 p-3.5 " +
          (lieu
            ? "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]"
            : "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-soft)]")
        }
      >
        <MapPin className="size-[22px]" aria-hidden />
        <span className="line-clamp-2 font-mono text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.1em]">
          {lieu ?? "Emplacement non précisé"}
        </span>
      </span>

      <span className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <span className="text-[15px] font-semibold leading-[1.25] text-[color:var(--board-ink)]">
          {libelle}
        </span>
        <span className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {signaux.length > 0 ? (
            signaux.map((s) => <Signal key={s.cle} signal={s} />)
          ) : (
            <span className="text-[12px] text-[color:var(--board-slate-soft)]">
              Aucune vérification rattachée
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
