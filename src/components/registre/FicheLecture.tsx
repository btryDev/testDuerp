// Une fiche dont les réponses vivent déjà ailleurs — forme `etablissement`.
//
// Raison sociale, adresse, type et catégorie ERP : ces questions ont déjà une
// réponse, portée par une colonne d'`Etablissement` ou d'`Entreprise`. La
// fiche les **montre**, elle ne les stocke pas et ne les édite pas sur place.
//
// Ce n'est pas une économie de code, c'est la condition pour que le registre
// soit juste : recopiées ici, ces réponses divergeraient au premier
// changement d'adresse — et c'est le registre, pas la fiche établissement,
// qu'on présente à la commission. C'est donc lui qui afficherait la valeur
// périmée. On édite là où la donnée vit, un lien y mène.
//
// Composant serveur : rien à saisir ici, donc rien à hydrater.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChampFiche, ChampsFiche } from "@/components/ui-kit/fiche";
import type { ChampEtablissement } from "@/lib/registre/champs";
import { afficherValeur, NON_RENSEIGNE } from "./valeur";

export function FicheLecture({
  champs,
  valeurs,
  hrefEdition,
  libelleEdition = "Modifier la fiche établissement",
}: {
  champs: readonly ChampEtablissement[];
  /** Les réponses lues sur l'établissement, par clé de champ. */
  valeurs?: Readonly<Record<string, string | null>>;
  /** L'écran où ces réponses se modifient — leur source. */
  hrefEdition: string;
  libelleEdition?: string;
}) {
  const manquantes = champs.filter(
    (c) => c.enBase && afficherValeur(valeurs?.[c.cle], c) === NON_RENSEIGNE,
  );
  const sansEmplacement = champs.filter((c) => !c.enBase);

  return (
    <div className="flex flex-col gap-5">
      <ChampsFiche>
        {champs.map((champ) => {
          const valeur = afficherValeur(valeurs?.[champ.cle], champ);
          const vide = valeur === NON_RENSEIGNE;
          return (
            <ChampFiche key={champ.cle} cle={champ.libelle}>
              <span
                className={
                  vide ? "text-[color:var(--board-slate-soft)]" : undefined
                }
              >
                {valeur}
              </span>
              {/* Une question dont la colonne n'existe pas encore ne doit pas
                  se lire comme un oubli du dirigeant : c'est un trou de
                  l'application, et il se dit comme tel. */}
              {!champ.enBase && (
                <span className="ml-2 text-[11.5px] text-[color:var(--board-slate-soft)]">
                  pas encore recueillie
                </span>
              )}
              {champ.aide && (
                <span className="mt-1 block text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                  {champ.aide}
                </span>
              )}
            </ChampFiche>
          );
        })}
      </ChampsFiche>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Link
          href={hrefEdition}
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
        >
          {libelleEdition}
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
        <p className="m-0 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]">
          Ces réponses viennent de votre fiche établissement — elles ne se
          saisissent qu&apos;une fois, et le registre les reprend telles
          quelles.
        </p>
      </div>

      {(manquantes.length > 0 || sansEmplacement.length > 0) && (
        <p className="m-0 text-[12.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
          {manquantes.length > 0 && (
            <>
              <strong className="font-semibold text-[color:var(--board-ink)]">
                {manquantes.length === 1
                  ? "1 réponse manque"
                  : `${manquantes.length} réponses manquent`}
              </strong>{" "}
              sur cette fiche : {manquantes.map((c) => c.libelle).join(", ")}.
            </>
          )}
          {sansEmplacement.length > 0 && (
            <>
              {manquantes.length > 0 && " "}
              {sansEmplacement.length === 1
                ? "1 question due n'a pas encore d'emplacement dans l'application"
                : `${sansEmplacement.length} questions dues n'ont pas encore d'emplacement dans l'application`}
              &nbsp;: tenez-les hors de l&apos;outil en attendant.
            </>
          )}
        </p>
      )}
    </div>
  );
}
