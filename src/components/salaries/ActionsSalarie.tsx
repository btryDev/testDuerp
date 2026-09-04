"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmation } from "@/components/ui-kit/Confirmation";
import { basculerActif, retirerTitre } from "@/lib/salaries/actions";

/**
 * Sortie et retour dans l'effectif.
 *
 * L'action n'est pas « supprimer », et le libellé le dit. La preuve qu'une
 * personne était habilitée au moment où elle a opéré couvre l'employeur sur
 * une période passée : elle doit survivre au départ (`docs/rgpd.md` § 4.3).
 * Supprimer la fiche emporterait ses titres en cascade.
 *
 * Le geste est donc réversible, et la confirmation dit ce qui se passe
 * vraiment plutôt que d'agiter un avertissement.
 */
export function BasculerEffectif({
  etablissementId,
  salarieId,
  actif,
}: {
  etablissementId: string;
  salarieId: string;
  actif: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="boardClair"
      size="boardSm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await basculerActif(etablissementId, salarieId, !actif);
        })
      }
    >
      {pending
        ? "…"
        : actif
          ? "Sortie de l'effectif"
          : "Réintégrer à l'effectif"}
    </Button>
  );
}

/**
 * Retirer un titre — une correction de saisie, pas un renouvellement.
 *
 * Redéclarer le même titre avec de nouvelles dates suffit à le renouveler
 * (l'action fait un `upsert`). Ce bouton sert à défaire une erreur : un titre
 * saisi sur la mauvaise personne, ou qui n'a jamais existé.
 */
export function RetirerTitreButton({
  etablissementId,
  salarieId,
  titreId,
  libelle,
}: {
  etablissementId: string;
  salarieId: string;
  titreId: string;
  libelle: string;
}) {
  const [pending, startTransition] = useTransition();
  const { demander, confirmation } = useConfirmation();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        className="text-[11.5px] text-[color:var(--board-slate-soft)] underline-offset-2 transition-colors hover:text-[color:var(--board-signal-ink)] hover:underline disabled:opacity-50"
        onClick={() =>
          demander({
            titre: `Retirer « ${libelle} » de cette fiche ?`,
            detail:
              "Ses dates et sa référence légale s'effacent, et avec elles la " +
              "trace que cette personne était habilitée. Pour un " +
              "renouvellement, ne retirez rien : redéclarez le même titre " +
              "avec ses nouvelles dates.",
            agir: "Retirer le titre",
            alors: () =>
              startTransition(async () => {
                await retirerTitre(etablissementId, salarieId, titreId);
              }),
          })
        }
      >
        {pending ? "Retrait…" : "Retirer"}
      </button>
      {confirmation}
    </>
  );
}
