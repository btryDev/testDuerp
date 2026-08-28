// Ce qu'une obligation exige de l'annuaire de prestataires (ADR-024).
//
// Le référentiel dit depuis toujours QUI peut réaliser une vérification —
// `realisateurs: ["organisme_agree"]` — et l'annuaire dit depuis toujours ce
// que chaque prestataire couvre — `domaines: ["electricite"]`. Les deux
// modules ne se sont jamais parlé : `lib/prestataires` n'importait ni
// `referentiels`, ni `matching`, ni `calendrier`, et réciproquement. Le
// produit savait donc qu'une obligation exige un organisme agréé, savait
// séparément que l'annuaire n'en contenait aucun pour ce domaine, et ne
// rapprochait jamais les deux.
//
// Ce module est ce rapprochement, et rien de plus. Il ne crée aucune échéance,
// ne suggère aucun prestataire nommé, ne préremplit rien : il constate un
// écart entre deux déclarations de l'utilisateur.
//
// POURQUOI ICI ET PAS DANS LE RÉFÉRENTIEL. `src/lib/referentiels/` n'importe
// rien de `@prisma/client` — vérifié, aucune occurrence — et c'est une
// propriété de l'ADR-003 : le référentiel vit en TypeScript versionné,
// indépendant de la base. Y faire entrer `DomainePrestataire`, qui est un enum
// Prisma, l'aurait rompue pour une table de correspondance. La dépendance va
// donc dans le sens sûr : `prestataires → referentiels`, le référentiel
// restant la feuille.

import type { DomainePrestataire } from "@prisma/client";
import type {
  DomaineObligation,
  Obligation,
} from "@/lib/referentiels/conformite/types";
import type { Realisateur } from "@/lib/referentiels/types-communs";

/**
 * Le domaine d'obligation, traduit en domaines de prestataire.
 *
 * `Record` exhaustif **et** valeurs non vides — les deux comptent :
 *
 *  - exhaustif : ajouter un domaine d'obligation sans lui donner de
 *    contrepartie ne compile pas. C'est la garantie qui manquait quand `froid`
 *    est arrivé au référentiel et n'a jamais eu de domaine de prestataire ;
 *  - non vide (`[T, ...T[]]`) : `froid: []` aurait compilé et rétabli
 *    exactement le silence qu'on corrige. Un tableau vide serait ici la
 *    réponse d'un modèle qui n'a pas de mot, pas la réponse d'un texte.
 *
 * Trois domaines portent deux noms selon le module — `aeration` /
 * `ventilation_vmc`, `porte_portail` / `porte_automatique`,
 * `equipement_sous_pression` / `equipement_pression`. Cette table est le seul
 * endroit du dépôt où les deux vocabulaires se regardent ; c'est aussi
 * pourquoi elle est la seule à importer les deux `LABEL_DOMAINE`, qui portent
 * le même nom dans `calendrier/labels.ts` et `prestataires/schema.ts` sans
 * jamais avoir été importés ensemble.
 *
 * `bureau_controle` accompagne plusieurs domaines : un bureau de contrôle
 * intervient transversalement, et l'exclure ferait dire « aucun prestataire ne
 * couvre ce domaine » à un dirigeant qui a justement déclaré celui qui le fait.
 */
export const DOMAINES_PRESTATAIRE_ATTENDUS: Record<
  DomaineObligation,
  readonly [DomainePrestataire, ...DomainePrestataire[]]
> = {
  electricite: ["electricite", "bureau_controle"],
  incendie: ["incendie", "bureau_controle"],
  aeration: ["ventilation_vmc"],
  cuisson_hotte: ["cuisson_hotte", "ventilation_vmc"],
  ascenseur: ["ascenseur", "bureau_controle"],
  porte_portail: ["porte_automatique"],
  equipement_sous_pression: ["equipement_pression", "bureau_controle"],
  stockage_dangereux: ["stockage_dangereux"],
  levage: ["levage", "bureau_controle"],
  froid: ["froid"],
};

/**
 * Les réalisateurs qui supposent un tiers déclaré à l'annuaire.
 *
 * `exploitant` en est exclu, et c'est le point : une obligation que
 * l'exploitant réalise lui-même n'appelle aucun prestataire, et signaler un
 * manque là serait un faux positif — le dirigeant n'a rien à chercher.
 *
 * `fabricant` en est exclu aussi : le fabricant d'un appareil n'est pas un
 * prestataire qu'on choisit et qu'on inscrit à un annuaire de vigilance, c'est
 * celui qui l'a construit.
 */
const REALISATEURS_TIERS: ReadonlySet<Realisateur> = new Set<Realisateur>([
  "organisme_agree",
  "organisme_accredite",
  "personne_qualifiee",
  "personne_competente",
  "bureau_controle",
]);

/** Vrai si l'obligation suppose qu'un tiers intervienne. */
export function supposeUnTiers(o: Obligation): boolean {
  return o.realisateurs.some((r) => REALISATEURS_TIERS.has(r));
}

/**
 * Le constat, sans la base : les domaines d'obligation qui supposent un tiers
 * et qu'aucun prestataire déclaré ne couvre.
 *
 * Fonction pure, et c'est délibéré — la partie qui décide est testable sans
 * base, comme `reperterSansEcheance` l'est dans `equipements/hors-referentiel`.
 *
 * Ce qu'elle NE dit pas, et ne doit jamais dire : que le dirigeant est en
 * faute, ni qu'il doit signer avec quelqu'un. Elle dit qu'une obligation
 * suppose un tiers et que l'annuaire n'en déclare aucun pour ce domaine. Il
 * peut très bien en avoir un et ne pas l'avoir saisi — c'est même le cas le
 * plus probable, et la phrase affichée doit le permettre.
 */
export function domainesSansPrestataire(
  obligationsApplicables: readonly Obligation[],
  domainesDeclares: readonly DomainePrestataire[],
): DomaineObligation[] {
  const declares = new Set(domainesDeclares);
  const manquants = new Set<DomaineObligation>();

  for (const o of obligationsApplicables) {
    if (!supposeUnTiers(o)) continue;
    const attendus = DOMAINES_PRESTATAIRE_ATTENDUS[o.domaine];
    if (attendus.some((d) => declares.has(d))) continue;
    manquants.add(o.domaine);
  }

  // Ordre stable : le rendu ne doit pas dépendre de l'ordre des obligations.
  return [...manquants].sort();
}
