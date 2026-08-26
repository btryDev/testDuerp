// Les corpus déclarés, et ce que leur dépouillement permet d'affirmer.

import { obligationsConformite } from "../conformite";
import { CORPUS_PE } from "./arrete-1980-livre-3";
import { couverture, type Corpus, type CouvertureCorpus } from "./types";

export * from "./types";
export * from "./perimetre";

/**
 * Les corpus dépouillés, ou en cours de dépouillement.
 *
 * Chaque corpus ajouté rétrécit la part du référentiel qui repose sur des
 * textes qu'on n'a jamais déclaré avoir lus. Ce qui n'y figure pas n'a pas été
 * parcouru de bout en bout — et le dire est le seul moyen de le savoir.
 */
export const CORPUS: readonly Corpus[] = [CORPUS_PE];

export function couvertureParCorpus(): CouvertureCorpus[] {
  return CORPUS.map(couverture);
}

/** Toutes les références d'articles déclarées dépouillées, tous corpus confondus. */
export function referencesDepouillees(): Set<string> {
  const out = new Set<string>();
  for (const c of CORPUS) {
    for (const a of c.articles) {
      if (a.statut !== "non_depouille") out.add(a.ref);
    }
  }
  return out;
}

/**
 * Les obligations qui s'appuient sur au moins un texte qu'aucun corpus ne
 * déclare avoir dépouillé.
 *
 * C'est la mesure qui manquait. Le référentiel savait dire ce qu'il connaît ;
 * il ne savait pas dire ce qu'il a lu, donc aucun test ne pouvait échouer
 * parce qu'une obligation MANQUE — seulement parce qu'une obligation est
 * fausse. Ce compte est l'angle mort, rendu visible et décroissant.
 *
 * La comparaison porte sur la `reference` littérale, qui n'est pas normalisée
 * dans le référentiel (« R. 4227-39 », « CCH, art. R. 143-44 (ex R. 123-51) »).
 * On teste donc l'inclusion de la référence d'article dans la chaîne citée,
 * ce qui est approximatif mais ne peut que SOUS-estimer la couverture — jamais
 * la surestimer. Une mesure de dette doit se tromper dans ce sens-là.
 */
export function obligationsSurTextesNonDepouilles(): string[] {
  const lues = [...referencesDepouillees()];
  return obligationsConformite
    .filter((o) =>
      o.referencesLegales.some(
        (r) => !lues.some((ref) => r.reference.includes(ref)),
      ),
    )
    .map((o) => o.id);
}

/**
 * Les articles lus qui imposent quelque chose que le référentiel ne porte pas.
 *
 * C'est le produit du dépouillement : la liste, nommée et sourcée, de ce qui
 * manque. Avant elle, une obligation absente était indistinguable d'une
 * obligation inexistante.
 */
export function obligationsManquantes(): {
  corpus: string;
  ref: string;
  motif: string;
  bloquePar?: string;
}[] {
  return CORPUS.flatMap((c) =>
    c.articles
      .filter((a) => a.statut === "obligation_manquante")
      .map((a) => ({
        corpus: c.id,
        ref: a.ref,
        motif: a.statut === "obligation_manquante" ? a.motif : "",
        bloquePar: a.statut === "obligation_manquante" ? a.bloquePar : undefined,
      })),
  );
}
