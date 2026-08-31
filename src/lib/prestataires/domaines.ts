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
 * ## `"aucun_tiers_attendu"` — ce que le tableau vide confondait
 *
 * L'interdiction du tableau vide était juste, et elle le reste, mais elle
 * traitait deux situations comme une seule :
 *
 *  1. **le modèle n'a pas de mot** pour le tiers que l'obligation appelle —
 *     c'est `froid: []`, et c'est un silence à corriger ;
 *  2. **le texte n'attend personne** — l'obligation est réalisée par
 *     l'exploitant seul, parce que le Code la lui confie. Un affichage
 *     obligatoire, l'accès des salariés au DUERP, un règlement intérieur : il
 *     n'existe aucun prestataire à déclarer, et il n'en manque aucun.
 *
 * Le second cas n'a pas de réponse honnête dans un tableau de domaines de
 * prestataire. `["autre"]` serait le mot vide déguisé, et `[]` ferait passer
 * une réponse tranchée pour un trou de vocabulaire — exactement l'inverse de
 * ce que ce `Record` existe pour rendre visible.
 *
 * D'où un **marqueur nommé** plutôt qu'un tableau vide : `"aucun_tiers_attendu"`
 * dit que quelqu'un a lu le texte et constaté qu'il ne renvoie à personne. Le
 * choix est **écrit**, pas déduit d'une absence.
 *
 * Ce marqueur ne relâche aucune garde : `supposeUnTiers()` ne déclenche que
 * lorsque TOUS les réalisateurs d'une obligation sont des tiers, donc un
 * domaine réalisé par l'exploitant ne fait de toute façon jamais parler la
 * règle. Le marqueur ne change pas le comportement — il rend la raison
 * lisible, ce qu'un `[]` ne faisait pas.
 *
 * ⚠ Il ne s'emploie **que** pour le cas 2. Un domaine dont le texte appelle un
 * tiers que l'enum `DomainePrestataire` ne sait pas nommer doit recevoir une
 * valeur d'enum — au besoin une nouvelle, avec sa migration, comme
 * `organisme_formation` et `service_sante_travail` en ont reçu une. Employer le
 * marqueur là serait rétablir le silence de `froid`, sous un nom plus poli.
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
export const AUCUN_TIERS_ATTENDU = "aucun_tiers_attendu" as const;

/**
 * Ce qu'un domaine d'obligation attend de l'annuaire : une liste non vide de
 * domaines de prestataire, ou le constat explicite qu'il n'attend personne.
 */
export type PrestatairesAttendus =
  | readonly [DomainePrestataire, ...DomainePrestataire[]]
  | typeof AUCUN_TIERS_ATTENDU;

export const DOMAINES_PRESTATAIRE_ATTENDUS: Record<
  DomaineObligation,
  PrestatairesAttendus
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
  // Les trois domaines du lot 7. Aucun d'eux n'appelle un vérificateur
  // d'équipement : ils appellent un formateur ou un service de santé au
  // travail. `autre` aurait compilé et aurait été le mot vide que le
  // commentaire ci-dessus interdit — le tiers a un nom réel dans les deux cas,
  // et il fallait le donner à l'enum plutôt que le taire.
  formation_securite: ["organisme_formation"],
  // L'adhésion à un service de prévention et de santé au travail est
  // elle-même une obligation de l'employeur (`L. 4622-1`). Un dirigeant qui
  // n'en a déclaré aucun à l'annuaire n'a pas seulement un trou de vigilance :
  // il a probablement un manquement, et c'est justement ce que le rapprochement
  // sert à faire voir.
  sante_travail: ["service_sante_travail"],
  // Le Code ne dit pas qui délivre la formation de secouriste de `R. 4224-15`.
  // Le domaine de prestataire attendu est donc l'organisme de formation, sans
  // qualification supplémentaire : l'habilitation INRS/CNAM du formateur SST
  // est un dispositif conventionnel, pas une exigence du Code, et l'écrire ici
  // ferait passer une pratique pour du droit.
  secours: ["organisme_formation"],
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
  // Les deux réalisateurs de santé au travail, ajoutés avec le lot 7. Ce sont
  // des tiers au sens plein : l'employeur ne peut PAS réaliser lui-même une
  // visite d'information et de prévention ni délivrer une attestation médicale,
  // et l'adhésion à un service de prévention et de santé au travail est
  // elle-même une obligation (`L. 4622-1`). Les omettre aurait fait de
  // `DOMAINES_PRESTATAIRE_ATTENDUS.sante_travail` une entrée morte — présente
  // pour satisfaire le `Record` exhaustif, consultée jamais.
  "medecin_travail",
  "professionnel_sante_travail",
]);

/**
 * Vrai si l'obligation **impose** qu'un tiers intervienne.
 *
 * `every` et non `some`, et c'est tout le sujet. `realisateurs` est une
 * **disjonction** — « Réalisateurs acceptés […] parfois 2 (ex. "personne
 * qualifiée OU organisme agréé") », dit le type. Un `some` retournait donc
 * vrai dès qu'un tiers figurait dans la liste, y compris quand `exploitant`
 * y figurait aussi, c'est-à-dire quand le texte autorise expressément le
 * dirigeant à faire l'acte lui-même.
 *
 * Trois obligations sont dans ce cas et produisaient le faux positif :
 * `cuisson-erp-circuits-extraction-nettoyage` (GC 21 § 2 admet
 * l'exploitant), `elec-erp-groupe-electrogene-annuel` et
 * `esp-declaration-mise-en-service`. Un restaurateur avec une hotte
 * s'entendait dire « aucun prestataire déclaré en cuisson et hotte » alors
 * qu'il a le droit de nettoyer lui-même — exactement le faux positif que le
 * commentaire ci-dessus s'interdisait, et que le test ne voyait pas parce
 * qu'il n'éprouvait que `["exploitant"]` seul.
 */
export function supposeUnTiers(o: Obligation): boolean {
  return o.realisateurs.every((r) => REALISATEURS_TIERS.has(r));
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
    // Un domaine que le texte confie à l'exploitant n'a aucun prestataire à
    // manquer. En théorie inatteignable — `supposeUnTiers()` a déjà écarté les
    // obligations réalisées par l'exploitant, et un domaine marqué
    // `aucun_tiers_attendu` ne devrait en contenir aucune autre. On ne s'y fie
    // pas : les deux faits vivent dans deux fichiers différents, et rien ne
    // garantit qu'ils resteront d'accord. Le jour où ils divergent, le silence
    // est la bonne issue — annoncer « aucun prestataire déclaré » pour un
    // affichage obligatoire serait un faux positif adressé au dirigeant.
    if (attendus === AUCUN_TIERS_ATTENDU) continue;
    if (attendus.some((d) => declares.has(d))) continue;
    manquants.add(o.domaine);
  }

  // Ordre stable : le rendu ne doit pas dépendre de l'ordre des obligations.
  return [...manquants].sort();
}
