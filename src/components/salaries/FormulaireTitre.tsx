"use client";

import { useActionState, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChampBoard } from "@/components/ui-kit";
import type { TitreActionState } from "@/lib/salaries/actions";

type TitreDuCatalogue = {
  id: string;
  libelle: string;
  /** Optionnelle au référentiel : toutes les obligations n'en portent pas. */
  description?: string;
  pieceMedicale: boolean;
};

/**
 * La déclaration d'un titre détenu.
 *
 * C'est l'écran où la frontière sur la santé se tient, ou ne se tient pas.
 *
 * Le dossier médical en santé au travail appartient au service de prévention,
 * pas à l'employeur : celui-ci ne reçoit que l'avis d'aptitude, les
 * propositions d'aménagement et les restrictions — aucun élément de
 * diagnostic, jamais (L. 4624-8, R. 4624-55).
 *
 * Sur un titre marqué `pieceMedicale`, ce formulaire **n'offre aucun dépôt de
 * fichier**, et il dit pourquoi. Ce n'est pas une précaution d'affichage : le
 * drapeau est requis sur le type de l'obligation, et
 * `src/lib/rgpd/frontiere-medicale.test.ts` lit tout `src/` pour vérifier
 * qu'aucune surface de dépôt n'est montée dans un contexte d'échéance sans
 * lui. Ajouter un `EvidenceDropzone` ici ferait échouer ce test.
 *
 * La règle du produit est plus stricte que le droit : `R. 4544-11-1` autorise
 * expressément l'employeur à conserver copie de l'attestation. Le choix est
 * assumé — un outil qui héberge des pièces médicales de salariés change de
 * nature réglementaire, pour une valeur ajoutée nulle (`docs/rgpd.md` § 2.3).
 */
export function FormulaireTitre({
  catalogue,
  action,
  dejaDeclares,
}: {
  catalogue: TitreDuCatalogue[];
  action: (
    prev: TitreActionState,
    formData: FormData,
  ) => Promise<TitreActionState>;
  /** Les obligations déjà portées — redéclarer vaut renouvellement. */
  dejaDeclares: string[];
}) {
  const [state, formAction, pending] = useActionState<
    TitreActionState,
    FormData
  >(action, { status: "idle" });

  const [choisi, setChoisi] = useState<string>(catalogue[0]?.id ?? "");
  const titre = catalogue.find((o) => o.id === choisi);
  const renouvellement = dejaDeclares.includes(choisi);

  const [cle, setCle] = useState(0);
  useEffect(() => {
    // Vider le formulaire après un enregistrement réussi : sans cela, les
    // dates de la déclaration précédente restent dans les champs et la
    // suivante part d'une valeur qui n'a rien à voir.
    if (state.status === "success") setCle((k) => k + 1);
  }, [state]);

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form key={cle} action={formAction} className="flex flex-col gap-5">
      <fieldset className="m-0 border-0 p-0">
        <legend className="label-board">Quel titre ?</legend>
        <div className="mt-1 flex flex-col gap-2">
          {catalogue.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-start gap-3 rounded-[18px] bg-[color:var(--board-slate-pale)] px-4 py-3 transition-colors has-[:checked]:bg-[color:var(--board-blue-pale)]"
            >
              <input
                type="radio"
                name="obligationId"
                value={o.id}
                checked={choisi === o.id}
                onChange={() => setChoisi(o.id)}
                className="mt-1 size-4 flex-none accent-[color:var(--board-ink)]"
              />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-[color:var(--board-slate-ink)]">
                  {o.libelle}
                </span>
                {o.description && (
                  <span className="mt-1 block text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                    {o.description}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        {err("obligationId") && (
          <p className="m-0 mt-1.5 text-[12.5px] text-[color:var(--board-signal-ink)]">
            {err("obligationId")}
          </p>
        )}
      </fieldset>

      {titre?.pieceMedicale && (
        <div className="flex gap-3 rounded-[18px] bg-[color:var(--board-blue-pale)] px-4 py-3.5">
          <ShieldAlert
            className="mt-0.5 size-4 flex-none text-[color:var(--board-blue-ink)]"
            aria-hidden
          />
          <p className="m-0 text-[12.5px] leading-[1.55] text-[color:var(--board-blue-ink)]">
            <strong>Ne déposez pas le document.</strong> Rojer enregistre
            qu&apos;une attestation existe, sa date et son échéance —
            rien d&apos;autre. Le motif médical, l&apos;avis du médecin et la
            pièce elle-même ne vous sont pas destinés et n&apos;ont pas à
            transiter ici. Vous conservez l&apos;original de votre côté,
            comme aujourd&apos;hui.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ChampBoard
          id="delivreLe"
          name="delivreLe"
          label="Délivré le"
          type="date"
          requis
          erreur={err("delivreLe")}
        />
        <ChampBoard
          id="echeanceLe"
          name="echeanceLe"
          label="Valable jusqu'au"
          type="date"
          erreur={err("echeanceLe")}
          aide="Laissez vide si aucune date n'est portée sur le titre. Rojer n'inventera pas d'échéance."
        />
      </div>

      <ChampBoard
        id="note"
        name="note"
        label="Repère"
        maxLength={500}
        placeholder="Ex : organisme, niveau d'habilitation, n° de certificat"
        erreur={err("note")}
        aide="Pour vous y retrouver. Jamais un élément de santé."
      />

      {state.status === "error" && !state.fieldErrors && (
        <p className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
          {state.message}
        </p>
      )}

      <div>
        <Button
          variant="board"
          size="board"
          type="submit"
          disabled={pending || catalogue.length === 0}
        >
          {pending
            ? "Enregistrement…"
            : renouvellement
              ? "Enregistrer le renouvellement"
              : "Déclarer ce titre"}
        </Button>
        {renouvellement && !pending && (
          <p className="m-0 mt-2 text-[12px] text-[color:var(--board-slate-mid)]">
            Ce titre est déjà déclaré : l&apos;enregistrement remplacera ses
            dates par celles-ci.
          </p>
        )}
      </div>
    </form>
  );
}
