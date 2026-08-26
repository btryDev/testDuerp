// Le corps d'une fiche du registre, quelle que soit sa forme.
//
// Le catalogue en connaît trois — `etablissement`, `formulaire`, `journal` —
// et une quatrième situation : la fiche due qu'aucun moyen de saisie ne
// couvre encore, ici ou ailleurs. Les quatre passent par ici, et le `switch`
// est exhaustif (cf. le garde `never` en fin de fonction) : une forme ajoutée
// au catalogue et oubliée ici ne compile pas.
//
// C'est la garantie qui compte pour l'écran : **aucune fiche due ne peut
// être rendue muette**. Une fiche qu'on ne saurait pas afficher disparaîtrait
// du registre, et le dirigeant croirait son document complet alors qu'il lui
// manque une pièce.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CarteFiche } from "@/components/ui-kit/fiche";
import type { FormeSaisie } from "@/lib/registre/champs";
import type { Completude, ContenuLu } from "./completude";
import type { ActionFiche } from "./types";
import { FicheFormulaire } from "./FicheFormulaire";
import { FicheJournal } from "./FicheJournal";
import { FicheLecture } from "./FicheLecture";
import { PastilleCompletude } from "./PastilleCompletude";

export function CorpsFicheRegistre({
  titre,
  attendu,
  raisons,
  saisie,
  contenu,
  completude,
  action,
  hrefEdition,
}: {
  titre: string;
  /** Ce que la fiche doit contenir, en une phrase. */
  attendu?: string;
  /** Pourquoi elle est due pour cet établissement. */
  raisons?: readonly string[];
  /** La forme de saisie, ou `undefined` si rien ne la recueille ici. */
  saisie: FormeSaisie | undefined;
  contenu?: ContenuLu | null;
  completude: Completude;
  /** L'action déjà liée à l'établissement et à cette fiche. */
  action?: ActionFiche;
  /** Où se modifient les réponses portées par l'établissement. */
  hrefEdition?: string;
}) {
  return (
    <CarteFiche
      titreFort={titre}
      droite={<PastilleCompletude completude={completude} />}
    >
      {attendu && (
        <p className="m-0 max-w-[68ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
          {attendu}
        </p>
      )}
      {raisons && raisons.length > 0 && (
        <p className="m-0 mt-2 max-w-[68ch] text-[12px] leading-[1.55] text-[color:var(--board-slate-soft)]">
          Due parce que&nbsp;: {raisons.join(" · ")}
        </p>
      )}
      <div className="mt-6">{corps()}</div>
    </CarteFiche>
  );

  function corps() {
    if (!saisie) {
      // Deux absences très différentes, qu'on aurait tort de rendre pareil.
      const tenue = completude.alimentee;
      if (tenue) {
        // La fiche est couverte, ailleurs. Lui donner un formulaire ici
        // ferait saisir deux fois le même fait, et les deux divergeraient.
        return (
          <div className="rounded-[20px] bg-[color:var(--board-slate-pale)] px-5 py-4">
            <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
              Cette fiche se tient depuis {tenue.libelle} : elle se remplit à
              partir de ce que vous y déclarez, et se réimprime avec le
              registre. Rien à ressaisir ici.
            </p>
            <Link
              href={tenue.href}
              className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
            >
              Ouvrir {tenue.libelle}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        );
      }
      // Là, le trou est celui de l'application, pas celui du dirigeant. Le
      // taire ferait croire le registre complet.
      return (
        <div className="rounded-[20px] border border-dashed border-[color:var(--board-slate-line)] px-5 py-4">
          <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
            Cette fiche vous est due, mais l&apos;application ne sait pas
            encore la recueillir. Tenez-la hors de l&apos;outil en attendant —
            elle figure ici pour que vous sachiez ce qui manquerait lors
            d&apos;une visite.
          </p>
        </div>
      );
    }

    switch (saisie.forme) {
      case "etablissement":
        return (
          <FicheLecture
            champs={saisie.champs}
            valeurs={contenu?.champs}
            hrefEdition={hrefEdition ?? "#"}
          />
        );

      case "formulaire":
        // Sans action, la fiche se lirait comme un formulaire mort : mieux
        // vaut ne rien proposer que proposer un bouton qui n'écrit rien.
        if (!action) return indisponible();
        return (
          <FicheFormulaire
            champs={saisie.champs}
            valeurs={contenu?.champs}
            action={action}
          />
        );

      case "journal":
        if (!action) return indisponible();
        return (
          <FicheJournal
            colonnes={saisie.colonnes}
            lignes={contenu?.lignes ?? []}
            action={action}
          />
        );

      default: {
        // Une forme ajoutée au catalogue sans passage ici casse la
        // compilation, plutôt que de disparaître silencieusement de l'écran.
        const jamais: never = saisie;
        return jamais;
      }
    }
  }

  function indisponible() {
    return (
      <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
        La saisie de cette fiche n&apos;est pas disponible ici.
      </p>
    );
  }
}
