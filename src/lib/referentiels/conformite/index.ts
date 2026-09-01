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
 *   - hors PLAN : froid — contrôle d'étanchéité des installations
 *     frigorifiques (R. 543-79 code de l'environnement, règlement UE 2024/573)
 */

import { porteurDe, type DomaineObligation, type Obligation } from "./types";
import { obligationsElectricite } from "./electricite";
import { obligationsIncendie } from "./incendie";
import { obligationsAeration } from "./aeration";
import { obligationsCuissonHotte } from "./cuisson-hotte";
import { obligationsAscenseurs } from "./ascenseurs";
import { obligationsPortesPortails } from "./portes-portails";
import { obligationsEquipementSousPression } from "./equipement-sous-pression";
import { obligationsStockageDangereux } from "./stockage-dangereux";
import { obligationsLevage } from "./levage";
import { obligationsFroid } from "./froid";
import { obligationsFormationSecurite } from "./formation-securite";
import { obligationsSanteTravail } from "./sante-travail";
import { obligationsSecours } from "./secours";
import { obligationsOrganisationPrevention } from "./organisation-prevention";
import { obligationsInformationTravailleurs } from "./information-travailleurs";
import { obligationsLocauxSociaux } from "./locaux-sociaux";
import { obligationsCoActivite } from "./co-activite";

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
  obligationsFroid,
  obligationsFormationSecurite,
  obligationsSanteTravail,
  obligationsSecours,
  obligationsOrganisationPrevention,
  obligationsInformationTravailleurs,
  obligationsLocauxSociaux,
  obligationsCoActivite,
};
export * from "./types";
export * from "./veille-textes";

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
  ...obligationsFroid,
  // Lot 7 — les trois domaines qui ne naissent d'aucun équipement.
  ...obligationsFormationSecurite,
  ...obligationsSanteTravail,
  ...obligationsSecours,
  // Lot 8 — le socle de l'employeur : ce qui est dû dès le premier salarié,
  // sans équipement, et ce que l'effectif ajoute aux seuils 11 et 50.
  ...obligationsOrganisationPrevention,
  ...obligationsInformationTravailleurs,
  ...obligationsLocauxSociaux,
  ...obligationsCoActivite,
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
export const REFERENTIEL_VERSION = "2026-09-01.1";

/**
 * Les identifiants d'obligations retirées du référentiel.
 *
 * `Obligation.id` porte la règle : « Identifiant stable, versionné avec le
 * code. **Jamais réutilisé.** » Elle n'était jusqu'ici qu'un commentaire.
 *
 * Elle compte, parce qu'un id survit à l'obligation : `Verification.
 * obligationId` le porte en base, et la réconciliation s'en sert pour
 * retrouver ses lignes. Réemployer un id retiré rattacherait les lignes de
 * l'ancienne obligation à la nouvelle — leurs dates, leurs statuts, et les
 * rapports qui y pendent. Silencieusement, et sans qu'aucune contrainte de
 * base ne s'y oppose.
 *
 * `absorbePar` est une DONNÉE, pas de la prose : c'est ce qui rendra possible,
 * le jour où on l'écrira, le report de l'état de conformité d'une ligne
 * retirée vers celle qui la remplace. Aujourd'hui la réconciliation ne le fait
 * pas — un dirigeant à jour d'un contrôle voit sa ligne archivée et une ligne
 * neuve « à planifier » apparaître. Sans effet à ce jour (aucune ligne réalisée
 * ne portait un id retiré au moment du retrait), mais c'est un manque, pas une
 * décision : voir l'ADR-022.
 *
 * `null` = retiré sans remplaçant.
 */
export type ObligationRetiree = {
  /** L'obligation qui reprend le contenu, ou `null` si personne ne le reprend. */
  absorbePar: string | null;
  /** Ce qui s'est passé, pour qui trouve l'id en base sans autre contexte. */
  motif: string;
};

export const OBLIGATIONS_RETIREES: Record<string, ObligationRetiree> = {
  // Antérieur à l'ADR-022, inscrit rétroactivement le 2026-08-27 : le retrait
  // était documenté dans `prisma/schema.prisma` comme le cas vécu qui a motivé
  // la colonne `referentielVersion`, mais nulle part sous une forme qui
  // empêche le réemploi de l'id. Le registre naissait donc avec un trou connu.
  "aeration-hotte-pro-annuelle": {
    absorbePar: null,
    motif:
      "Retiré avant le 2026-08-27, date inconnue. Doublon du ramonage annuel des circuits d'extraction (GC 20), fusionné avec l'obligation qui le portait déjà. Les `Verification` qui le portaient ont SURVÉCU à son retrait, orphelines — c'est ce cas vécu qui a motivé la colonne `Verification.referentielVersion` (voir `prisma/schema.prisma`). Absorbant non identifié avec certitude à la relecture : laissé à `null` plutôt que deviné.",
  },
  // ADR-022 — fragments absorbés par l'obligation portée par l'établissement.
  "elec-erp-cat5-quinquennale": {
    absorbePar: "incendie-erp-pe4-entretien-installations-techniques",
    motif:
      "Retiré le 2026-08-27. Fragment « installations électriques » de PE 4 § 2, sans fondement propre. L'obligation absorbante porte l'article entier et vit en domaine `incendie` : un utilisateur qui filtre sur « électricité » ne l'y trouvera plus.",
  },
  "cuisson-gaz-installations-triennale": {
    absorbePar: "incendie-erp-pe4-entretien-installations-techniques",
    motif:
      "Retiré le 2026-08-27. Fragment « installations de gaz » de PE 4 § 2, sans fondement propre. À ne pas confondre avec `cuisson-gaz-installations-annuelle`, qui vit toujours et régit les ERP de 1ʳᵉ à 4ᵉ catégorie sur GZ 15.",
  },
  "aeration-travail-entretien-annuel": {
    absorbePar: "aeration-controle-installations-r4222-20",
    motif:
      "Retiré le 2026-08-27. Fragment « VMC/CTA » de R. 4222-20, sans fondement propre. L'absorbante garde le même domaine, le même rythme annuel et la même criticité : pour l'utilisateur, une ligne par appareil devient une ligne pour l'ensemble.",
  },
};

/**
 * Sérialisation canonique d'une valeur : clés d'objet triées, donc
 * indépendante de l'ordre d'écriture dans le référentiel. Sans cela,
 * réordonner `{ erp, travail }` en `{ travail, erp }` — un changement
 * purement cosmétique — ferait bouger l'empreinte et réclamerait à tort une
 * réconciliation de tous les calendriers.
 *
 * **L'ordre des tableaux est en revanche conservé.** Réordonner
 * `categories: ["N2", "N1"]` déplace donc l'empreinte, alors que c'est sans
 * effet sur le matching. C'est assumé : trier aussi les tableaux rendrait la
 * fonction aveugle à un réordonnancement le jour où un champ dont l'ordre
 * compte entrerait dans l'empreinte (`referencesLegales`, dont le premier
 * élément est l'article fondateur). Une réconciliation de trop est inoffensive
 * — elle est idempotente ; une réconciliation manquée ne l'est pas.
 */
function canonique(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(canonique).join(",")}]`;
  const entrees = Object.entries(v as Record<string, unknown>)
    .filter(([, val]) => val !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entrees.map(([k, val]) => `${k}:${canonique(val)}`).join(",")}}`;
}

/**
 * Empreinte déterministe de tout le contenu qui influe sur ce qui est écrit en
 * base : identifiant, périodicité, réalisateurs, libellé, **typologies** et
 * **conditions** de chaque obligation. Deux exécutions sur le même référentiel
 * donnent la même valeur ; toute modification de fond la change.
 *
 * Amendement 2026-08 : typologies, conditions et catégories d'équipement ont
 * été ajoutées. L'empreinte ne couvrait que les quatre premiers champs, si
 * bien qu'une modification du **champ d'application** — restreindre une
 * obligation à certains types d'ERP, la borner par une propriété
 * d'équipement, élargir les catégories qui la déclenchent — ne la déplaçait
 * pas. Or c'est exactement ce genre de changement qui doit déclencher une
 * réconciliation : il fait apparaître ou disparaître des lignes de
 * calendrier, là où une correction de périodicité ne fait que déplacer une
 * date. Le garde-fou laissait donc passer les modifications les plus lourdes
 * de conséquences.
 *
 * Ce qui reste volontairement hors de l'empreinte : `criticite`, `domaine`,
 * `description`, `referencesLegales`, `notesInternes`. Aucun n'est recopié
 * sur la `Verification` et aucun ne décide de son existence — les modifier
 * n'a rien à réconcilier.
 *
 * `equipementsEnContexte` y entre bien qu'il ne déclenche rien : il change ce
 * que la fiche affiche, et une empreinte qui ignore un champ finit par servir
 * d'excuse pour ne pas incrémenter la version. Le coût d'une réconciliation
 * de trop est nul — elle est idempotente (ADR-012).
 *
 * Volontairement simple (somme de contrôle textuelle, pas de hachage
 * cryptographique) : elle sert à détecter un oubli de version, pas à résister
 * à une falsification.
 */
export function empreinteReferentiel(
  obligations: Obligation[] = obligationsConformite,
): string {
  const corps = obligations
    .map((o) =>
      [
        o.id,
        o.periodicite,
        o.libelle,
        [...o.realisateurs].sort().join("+"),
        canonique(o.typologies),
        canonique(o.conditions ?? []),
        canonique(o.categoriesEquipement ?? []),
        // Le porteur décide du **nombre** de lignes qu'une obligation engendre
        // — une par équipement, ou une seule pour l'établissement (ADR-022).
        // Le faire changer sans faire bouger l'empreinte laisserait un parc
        // entier avec des lignes que le référentiel n'engendre plus.
        porteurDe(o),
        canonique(o.equipementsEnContexte ?? []),
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
  const taille = obligations.length;
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
