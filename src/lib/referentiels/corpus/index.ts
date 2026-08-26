// Les corpus déclarés, et ce que leur dépouillement permet d'affirmer.

import { obligationsConformite } from "../conformite";
import { ARRETE_1980_LIVRE_2 } from "./arrete-1980-livre-2";
import { CORPUS_PE } from "./arrete-1980-livre-3";
import { ARRETE_2011_12_14_ECLAIRAGE } from "./arrete-2011-12-14-eclairage";
import { ARRETE_2011_12_30_IGH } from "./arrete-2011-12-30-igh";
import { CCH_REGISTRE_SECURITE } from "./cch-registre-securite";
import { CODE_TRAVAIL_INCENDIE } from "./code-travail-incendie";
import { ARRETE_2004_03_01_LEVAGE } from "./arrete-2004-03-01-levage";
import { ARRETE_2011_12_26_ELECTRICITE } from "./arrete-2011-12-26-electricite";
import { ARRETE_1987_10_08_AERATION } from "./arrete-1987-10-08-aeration";
import { CODE_TRAVAIL_ELECTRICITE } from "./code-travail-electricite";
import { CODE_TRAVAIL_RISQUE_CHIMIQUE } from "./code-travail-risque-chimique";
import { ESP_SUIVI_EN_SERVICE } from "./esp-suivi-en-service";
import { ICPE_STOCKAGE } from "./icpe-stockage";
import { CODE_TRAVAIL_LEVAGE } from "./code-travail-levage";
import { FROID_FLUIDES } from "./froid-fluides";
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
export const CORPUS: readonly Corpus[] = [
  CORPUS_PE,
  ARRETE_1980_LIVRE_2,
  CODE_TRAVAIL_INCENDIE,
  CCH_REGISTRE_SECURITE,
  ARRETE_2011_12_14_ECLAIRAGE,
  ARRETE_2011_12_30_IGH,
  FROID_FLUIDES,
  CODE_TRAVAIL_LEVAGE,
  ARRETE_2004_03_01_LEVAGE,
  CODE_TRAVAIL_ELECTRICITE,
  ARRETE_2011_12_26_ELECTRICITE,
  CODE_TRAVAIL_RISQUE_CHIMIQUE,
  ESP_SUIVI_EN_SERVICE,
  ICPE_STOCKAGE,
  ARRETE_1987_10_08_AERATION,
];

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
 * fausse.
 *
 * Le rapprochement se fait sur `ReferenceLegale.article`, la clé canonique, et
 * non plus sur la citation lisible. La version précédente comparait des
 * sous-chaînes — « MS 38 » apparaît-il dans « Arrêté du 25 juin 1980, art.
 * MS 38 § 4 » ? — ce qui marchait par chance et se serait trompé dès qu'un
 * article en aurait préfixé un autre : « MS 7 » est inclus dans « MS 73 ».
 *
 * Une référence sans clé compte comme non dépouillée. Le silence ne vaut pas
 * couverture.
 */
export function obligationsSurTextesNonDepouilles(): string[] {
  const lues = referencesDepouillees();
  return obligationsConformite
    .filter((o) =>
      o.referencesLegales.some((r) => !r.article || !lues.has(r.article)),
    )
    .map((o) => o.id);
}

/**
 * Les articles qu'une obligation cite sans qu'aucun corpus ne les connaisse.
 *
 * Le pendant du compte ci-dessus, à la maille de l'article : c'est la liste de
 * travail du dépouillement, ordonnée par ce que le référentiel utilise
 * réellement plutôt que par l'ordre d'un code.
 */
export function articlesCitesNonDepouilles(): { article: string; obligations: string[] }[] {
  const lues = referencesDepouillees();
  const par = new Map<string, string[]>();
  for (const o of obligationsConformite) {
    for (const r of o.referencesLegales) {
      if (!r.article || lues.has(r.article)) continue;
      par.set(r.article, [...(par.get(r.article) ?? []), o.id]);
    }
  }
  return [...par].map(([article, obligations]) => ({ article, obligations }));
}

/**
 * Les articles déclarés « retenus » par un corpus alors que l'obligation
 * nommée ne les cite pas.
 *
 * C'est le sens inverse du lien, et il doit être vérifié aussi : sans cela un
 * corpus pourrait s'attribuer une couverture qu'aucune obligation ne confirme,
 * et le compte de dette descendrait sans que rien ne s'améliore.
 */
export function liensRetenusRompus(): { corpus: string; ref: string; obligation: string }[] {
  const parId = new Map(obligationsConformite.map((o) => [o.id, o]));
  const rompus: { corpus: string; ref: string; obligation: string }[] = [];
  for (const c of CORPUS) {
    for (const a of c.articles) {
      if (a.statut !== "retenu") continue;
      for (const id of a.obligations) {
        const o = parId.get(id);
        if (!o || !o.referencesLegales.some((r) => r.article === a.ref)) {
          rompus.push({ corpus: c.id, ref: a.ref, obligation: id });
        }
      }
    }
  }
  return rompus;
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

/**
 * Les références qui ne portent pas encore de clé d'article.
 *
 * Sans clé, une référence ne peut être rattachée à aucun corpus : elle compte
 * comme non dépouillée, mais n'apparaît dans aucune liste de travail par
 * article. Ce compte est le complément indispensable des deux autres — sinon
 * « 0 article cité non dépouillé » se lirait comme « tout est lu » alors que
 * la plupart des références ne sont même pas rattachables.
 */
export function referencesSansCle(): { obligation: string; reference: string }[] {
  return obligationsConformite.flatMap((o) =>
    o.referencesLegales
      .filter((r) => !r.article)
      .map((r) => ({ obligation: o.id, reference: r.reference })),
  );
}
