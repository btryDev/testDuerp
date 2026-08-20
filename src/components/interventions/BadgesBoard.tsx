// Pastilles de ticket en jetons du board, pour la fiche de détail.
//
// `BadgePriorite` (dans `NouveauTicketForm`) reste en place : il habille
// encore le tableau des tickets et le formulaire de création, qui n'ont
// pas encore basculé. Les deux jeux cohabitent le temps de ce passage —
// changer `COULEUR_PRIORITE` maintenant aurait repeint le tableau au
// passage, alors que son dessin se décide séparément.

import type {
  PrioriteIntervention,
  StatutIntervention,
} from "@prisma/client";
import { LABEL_PRIORITE, LABEL_STATUT } from "@/lib/interventions/schema";

// La priorité n'est pas un retard : elle monte de l'ardoise (basse) au
// rose (bloquante) en passant par le glacier et la paille, sans jamais
// emprunter le vert — un ticket prioritaire n'est pas un acquis.
const CHAMP_PRIORITE: Record<PrioriteIntervention, string> = {
  basse:
    "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)]",
  moyenne:
    "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]",
  urgente: "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink)]",
  bloquante:
    "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]",
};

const CHAMP_STATUT: Record<StatutIntervention, string> = {
  ouvert: "bg-[color:var(--board-amber)] text-[color:var(--board-amber-ink)]",
  assigne:
    "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]",
  en_cours:
    "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]",
  fait: "bg-[color:var(--board-green)] text-[color:var(--board-green-ink)]",
  annule:
    "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)]",
};

export function PastillePriorite({
  priorite,
}: {
  priorite: PrioriteIntervention;
}) {
  return (
    <span className={`pastille-board ${CHAMP_PRIORITE[priorite]}`}>
      {LABEL_PRIORITE[priorite]}
    </span>
  );
}

export function PastilleStatutTicket({
  statut,
}: {
  statut: StatutIntervention;
}) {
  return (
    <span className={`pastille-board ${CHAMP_STATUT[statut]}`}>
      {LABEL_STATUT[statut]}
    </span>
  );
}
