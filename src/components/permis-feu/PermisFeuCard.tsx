import type { PermisFeu, StatutPermisFeu } from "@prisma/client";
import {
  LigneFiche,
  PastilleFiche,
  TuileDate,
  TuileMuette,
} from "@/components/ui-kit";
import { LABEL_NATURE } from "@/lib/permis-feu/schema";
import { classerDate, type RegistreLigne } from "@/lib/calendrier/etats";
import { formaterDateCourteFr } from "@/lib/dates";

/**
 * La ligne d'un permis de feu dans le registre du module, en charte board
 * (`docs/charte-board.md`).
 *
 * Elle était un `cartouche` coiffé d'un filet de couleur qui portait seul le
 * statut : `--seal` pour un brouillon comme pour un permis terminé, deux
 * états que plus rien ne distinguait ensuite. Le board dit l'état par un
 * champ ET un mot — la pastille nomme le statut, la tuile-date porte
 * l'ouverture des travaux. C'est la couture avec la fiche : on clique une
 * ligne, on ouvre une tête qui reprend la même date au même endroit.
 */

/**
 * Table statique : Tailwind ne voit pas un nom de classe construit à la
 * volée (interdit 23), et le couple champ/encre vient de `PastilleFiche`,
 * jamais d'une table de couleurs recopiée ici.
 */
const TON_STATUT: Record<
  StatutPermisFeu,
  "retard" | "proche" | "fait" | "bleu" | "neutre"
> = {
  brouillon: "neutre",
  attente_signatures: "proche",
  valide: "bleu",
  en_cours: "retard",
  termine: "fait",
  annule: "neutre",
};

const LABEL_STATUT: Record<StatutPermisFeu, string> = {
  brouillon: "Brouillon",
  attente_signatures: "En attente de signatures",
  valide: "Validé",
  en_cours: "Travaux en cours",
  termine: "Terminé",
  annule: "Annulé",
};

export function PermisFeuCard({
  etablissementId,
  permis,
}: {
  etablissementId: string;
  permis: PermisFeu;
}) {
  const maintenant = new Date();
  // Un permis terminé est un acquis quelle que soit sa date — c'est déjà la
  // lecture qu'en fait la fiche. Un permis annulé, lui, n'a plus de
  // rendez-vous : lui peindre une tuile-date annoncerait des travaux qui
  // n'auront pas lieu.
  const etat: RegistreLigne =
    permis.statut === "termine"
      ? "faite"
      : classerDate(permis.dateDebut, maintenant);

  const natures = permis.naturesTravaux
    .map((n) => LABEL_NATURE[n])
    .join(" · ");

  return (
    <LigneFiche
      href={`/etablissements/${etablissementId}/permis-feu/${permis.id}`}
      tuile={
        permis.statut === "annule" ? (
          <TuileMuette>Annulé</TuileMuette>
        ) : (
          <TuileDate date={permis.dateDebut} etat={etat} />
        )
      }
      surtitre={
        <>
          <span className="tabular-nums">
            PF-{String(permis.numero).padStart(3, "0")}
          </span>
          {natures ? ` · ${natures}` : ""}
        </>
      }
      titre={permis.prestataireRaison}
      detail={
        <>
          {permis.lieu}
          <span className="mt-0.5 block font-mono text-[11.5px] tabular-nums text-[color:var(--board-slate-soft)]">
            Du {formaterDateCourteFr(permis.dateDebut)} au{" "}
            {formaterDateCourteFr(permis.dateFin)}
          </span>
        </>
      }
      droite={
        <PastilleFiche ton={TON_STATUT[permis.statut]}>
          {LABEL_STATUT[permis.statut]}
        </PastilleFiche>
      }
    />
  );
}
