import Link from "next/link";
import { IdCard } from "lucide-react";
import { CHAMP_ETAT, ENCRE_ETAT } from "@/lib/calendrier/etats";
import type { SalarieDeLaListe } from "@/lib/salaries/queries";

/**
 * Une personne dans l'annuaire de l'équipe, en charte board.
 *
 * La carte suit l'idiome de `VitrineEquipement` et de `PrestataireCard` — champ
 * coloré en tête, corps sur fond carte — avec une différence assumée : ce qui
 * colore la tête n'est pas le nombre de titres, c'est leur état. Une personne
 * sans titre déclaré n'est pas « en défaut » : l'outil ne sait pas ce qu'elle
 * fait, il ne peut donc rien réclamer (le cinquième déclencheur — l'activité
 * réellement exercée — n'est pas implémenté). La tête reste ardoise, et le
 * corps le dit en toutes lettres.
 */
export function SalarieCard({
  etablissementId,
  salarie,
}: {
  etablissementId: string;
  salarie: SalarieDeLaListe;
}) {
  const enRetard = salarie.titres.filter((t) => t.etat === "enRetard").length;
  const proches = salarie.titres.filter((t) => t.etat === "proche").length;

  const etatDeLaTete =
    enRetard > 0 ? "enRetard" : proches > 0 ? "proche" : null;

  return (
    <Link
      href={`/etablissements/${etablissementId}/equipe/${salarie.id}`}
      className="carte-board group flex flex-col overflow-hidden rounded-[22px]"
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={
          etatDeLaTete
            ? {
                background: CHAMP_ETAT[etatDeLaTete],
                color: ENCRE_ETAT[etatDeLaTete],
              }
            : { background: "var(--board-slate-pale)" }
        }
      >
        <span className="min-w-0 flex-1">
          <span className="board-titre block truncate text-[16px] leading-tight">
            {salarie.prenom} {salarie.nom}
          </span>
          <span
            className="mt-1 block truncate text-[11.5px] leading-[1.4]"
            style={{
              color: etatDeLaTete
                ? "inherit"
                : "var(--board-slate-mid)",
            }}
          >
            {salarie.poste ?? "Poste non renseigné"}
          </span>
        </span>
        {!salarie.actif && (
          <span className="pastille-board flex-none bg-[color:var(--board-card)] text-[color:var(--board-slate-mid)]">
            Sortie
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
        {salarie.titres.length === 0 ? (
          <p className="m-0 text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
            Aucun titre déclaré. Rojer ne devine pas ce que fait une personne :
            c&apos;est vous qui déclarez ce qu&apos;elle détient.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {salarie.titres.slice(0, 3).map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-[7px] flex-none rounded-full"
                  style={{ background: CHAMP_ETAT[t.etat] }}
                />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[color:var(--board-slate-ink)]">
                  {t.libelle}
                </span>
              </li>
            ))}
            {salarie.titres.length > 3 && (
              <li className="text-[11.5px] text-[color:var(--board-slate-soft)]">
                et {salarie.titres.length - 3} autre
                {salarie.titres.length - 3 > 1 ? "s" : ""}
              </li>
            )}
          </ul>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11.5px] text-[color:var(--board-slate-soft)]">
          <IdCard className="size-3.5" aria-hidden />
          {salarie.titres.length === 0
            ? "Déclarer un titre"
            : `${salarie.titres.length} titre${salarie.titres.length > 1 ? "s" : ""}`}
        </span>
      </div>
    </Link>
  );
}
