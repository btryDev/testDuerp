/**
 * Agrégation du référentiel d'obligations réglementaires (ADR-003).
 *
 * Chaque domaine est exporté séparément pour permettre un filtrage simple
 * côté moteur de matching (étape 5) et côté UI (vue par domaine). La liste
 * `obligationsConformite` fusionne le tout.
 *
 * Domaines couverts à l'issue de l'étape 11 :
 *   - P1 : électricité, incendie, aération (≥ 25 obligations, étape 3)
 *   - P2 : cuisson/hotte, ascenseurs, portes et portails automatiques
 *   - P3 : équipements sous pression, stockage de matières dangereuses,
 *     équipements de levage
 */

import type { DomaineObligation, Obligation } from "./types";
import { obligationsElectricite } from "./electricite";
import { obligationsIncendie } from "./incendie";
import { obligationsAeration } from "./aeration";
import { obligationsCuissonHotte } from "./cuisson-hotte";
import { obligationsAscenseurs } from "./ascenseurs";
import { obligationsPortesPortails } from "./portes-portails";
import { obligationsEquipementSousPression } from "./equipement-sous-pression";
import { obligationsStockageDangereux } from "./stockage-dangereux";
import { obligationsLevage } from "./levage";

export {
  obligationsElectricite,
  obligationsIncendie,
  obligationsAeration,
  obligationsCuissonHotte,
  obligationsAscenseurs,
  obligationsPortesPortails,
  obligationsEquipementSousPression,
  obligationsStockageDangereux,
  obligationsLevage,
};
export * from "./types";

export const obligationsConformite: Obligation[] = [
  ...obligationsElectricite,
  ...obligationsIncendie,
  ...obligationsAeration,
  ...obligationsCuissonHotte,
  ...obligationsAscenseurs,
  ...obligationsPortesPortails,
  ...obligationsEquipementSousPression,
  ...obligationsStockageDangereux,
  ...obligationsLevage,
];

/**
 * Version du référentiel de conformité (ADR-003).
 *
 * Le référentiel vit en TypeScript versionné, pas en base : quand il évolue —
 * périodicité corrigée, obligation retirée, libellé reformulé — les
 * `Verification` déjà écrites gardent l'ancienne valeur. Elles ne se
 * réalignaient qu'au hasard d'une mutation d'équipement ou d'un dépôt de
 * rapport, et une obligation supprimée laissait des lignes orphelines :
 * `obligationParId` renvoyait `undefined`, le domaine devenait `null`, et
 * l'occurrence disparaissait silencieusement des filtres du registre et du
 * dossier remis à l'inspecteur.
 *
 * Cette constante est le repère qui permet de détecter qu'un calendrier a été
 * généré avec un référentiel antérieur, et donc de le réconcilier.
 *
 * **À incrémenter à CHAQUE modification du référentiel.** Le test
 * `conformite.test.ts` compare une empreinte du contenu à celle enregistrée :
 * l'oubli fait échouer la suite.
 */
export const REFERENTIEL_VERSION = "2026-08-20.2";

/**
 * Sérialisation canonique d'une valeur du référentiel : clés d'objet triées,
 * ordre des tableaux préservé. Deux exécutions donnent le même texte, et une
 * simple réécriture de l'ordre des clés dans le fichier source ne fait pas
 * bouger l'empreinte — seul un changement de fond la change.
 */
function canonique(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonique).join(",")}]`;
  if (v !== null && typeof v === "object") {
    const entrees = Object.entries(v as Record<string, unknown>)
      .filter(([, val]) => val !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, val]) => `${k}:${canonique(val)}`);
    return `{${entrees.join(",")}}`;
  }
  return String(v);
}

/**
 * Empreinte déterministe de tout ce qui influe sur les échéances : pour chaque
 * obligation, son identifiant, sa périodicité, son libellé, ses réalisateurs,
 * les catégories d'équipement qui la déclenchent, sa typologie d'application
 * et ses conditions. Deux exécutions sur le même référentiel donnent la même
 * valeur ; toute modification de fond la change.
 *
 * Les trois derniers champs ont été ajoutés en 2026-08 : l'empreinte ne
 * couvrait que l'identité et la périodicité, si bien qu'une condition, une
 * typologie ou une catégorie modifiée changeait les échéances de tout un parc
 * sans faire bouger le hash. Le garde-fou de version laissait alors passer
 * exactement le genre de correction qu'il existe pour détecter — poser une
 * condition décide de l'existence même d'une échéance, là où un libellé n'est
 * que cosmétique.
 *
 * Volontairement simple (somme de contrôle textuelle, pas de hachage
 * cryptographique) : elle sert à détecter un oubli de version, pas à résister
 * à une falsification.
 */
export function empreinteReferentiel(): string {
  const corps = obligationsConformite
    .map((o) =>
      [
        o.id,
        o.periodicite,
        o.libelle,
        [...o.realisateurs].sort().join("+"),
        [...o.categoriesEquipement].sort().join("+"),
        canonique(o.typologies),
        // L'ordre des conditions est sans portée (elles se combinent en ET) :
        // on trie leur forme sérialisée pour que seule leur substance compte.
        canonique([...(o.conditions ?? [])].map(canonique).sort()),
      ].join("|"),
    )
    .sort()
    .join("\n");

  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < corps.length; i += 1) {
    const c = corps.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  const taille = obligationsConformite.length;
  return `${taille}-${h1.toString(16)}${h2.toString(16)}`;
}

/**
 * Indexation par id pour lookup O(1) côté moteur de matching et snapshot
 * de calendrier. Construite à la première demande, mémoïsée.
 */
let _index: Map<string, Obligation> | null = null;

export function obligationParId(id: string): Obligation | undefined {
  if (!_index) {
    _index = new Map();
    for (const o of obligationsConformite) _index.set(o.id, o);
  }
  return _index.get(id);
}

export function obligationsParDomaine(
  domaine: DomaineObligation,
): Obligation[] {
  return obligationsConformite.filter((o) => o.domaine === domaine);
}
