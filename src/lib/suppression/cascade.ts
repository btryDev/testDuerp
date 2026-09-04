import { Prisma, type PrismaClient } from "@prisma/client";

/**
 * Ce qu'une suppression emporte, et ce qui la refusera — **dérivé du schéma**,
 * jamais énuméré à la main.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * D'OÙ VIENT CE MODULE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Il a été écrit le 2026-09-04 dans `scripts/remettre-en-onboarding.ts`, pour
 * réparer un aperçu qui lisait `entreprise.etablissements[0]` et annonçait la
 * moitié de ce qu'il détruisait sur un compte à deux établissements. Il vit
 * ici parce que le script n'était pas le seul menteur : la carte de
 * confirmation de `/entreprises/<id>/modifier` annonçait « L'établissement
 * s'en va avec elle », au singulier et sans rien compter. Deux endroits
 * décrivaient la même cascade de mémoire ; il n'y en a plus qu'un, et il la
 * lit.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI PAS UNE LISTE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Une liste de relations écrite à la main **se répare en la recopiant** : elle
 * ne cesse jamais d'être verte, elle cesse d'être complète. Le jour où une
 * relation entre au schéma, une liste ne le sait pas et l'aperçu — ou la carte
 * — se remet à mentir en silence.
 *
 * `Prisma.dmmf` porte le schéma tel qu'il a été généré, `relationOnDelete`
 * compris. Une relation ajoutée demain apparaît au prochain `prisma generate`,
 * sans que personne ait à toucher ce fichier.
 */

/**
 * Une relation, du parent vers l'enfant qui porte la clé étrangère.
 *
 * `action` est la référentielle déclarée au schéma : `Cascade` emporte l'enfant,
 * `Restrict` fait ÉCHOUER la suppression du parent, `SetNull` laisse l'enfant en
 * place en vidant sa clé, `NoAction` diffère le contrôle en fin d'instruction.
 */
export type Relation = {
  parent: string;
  enfant: string;
  cle: string;
  action: string;
};

/**
 * Les relations du schéma, lues au schéma.
 *
 * On ne retient que le côté PROPRIÉTAIRE de chaque relation — celui dont
 * `relationFromFields` est non vide, donc celui qui porte la clé étrangère —
 * pour ne compter chaque arête qu'une fois.
 */
export function relationsDuSchema(): Relation[] {
  const relations: Relation[] = [];
  for (const modele of Prisma.dmmf.datamodel.models) {
    for (const champ of modele.fields) {
      const depuis = champ.relationFromFields ?? [];
      if (champ.kind !== "object" || depuis.length === 0) continue;
      relations.push({
        parent: champ.type,
        enfant: modele.name,
        cle: depuis[0],
        // Le défaut de Prisma quand rien n'est écrit : `Restrict` si la
        // relation est requise, `SetNull` si elle est facultative.
        action:
          (champ as { relationOnDelete?: string }).relationOnDelete ??
          (champ.isRequired ? "Restrict" : "SetNull"),
      });
    }
  }
  return relations;
}

/**
 * Les modèles qu'une suppression de `racine` emporte — **sans toucher la
 * base**, par simple accessibilité dans le graphe des arêtes `Cascade`.
 *
 * C'est la forme testable de la cascade : elle répond « `DuerpVersion` est-il
 * emporté par la suppression d'une `Entreprise` ? » sans base ni jeu d'essai,
 * et c'est précisément la question sur laquelle l'écran de suppression s'est
 * trompé pendant des mois.
 */
export function modelesEmportesDepuis(racine: string): Set<string> {
  const cascades = relationsDuSchema().filter((r) => r.action === "Cascade");
  const vus = new Set([racine]);
  let frontiere = [racine];
  while (frontiere.length > 0) {
    const suivante: string[] = [];
    for (const parent of frontiere) {
      for (const r of cascades.filter((c) => c.parent === parent)) {
        if (vus.has(r.enfant)) continue;
        vus.add(r.enfant);
        suivante.push(r.enfant);
      }
    }
    frontiere = suivante;
  }
  return vus;
}

/** Le délégué Prisma d'un modèle : `Etablissement` → `prisma.etablissement`. */
function delegue(client: PrismaClient, modele: string) {
  const nom = modele[0].toLowerCase() + modele.slice(1);
  return (
    client as unknown as Record<
      string,
      { findMany: (a: unknown) => Promise<{ id: string }[]> }
    >
  )[nom];
}

/**
 * Tout ce que la suppression de `racine`/`racineIds` emporte, table par table.
 *
 * Un parcours en largeur du graphe des relations `Cascade`. On collecte les
 * identifiants plutôt que des compteurs, parce qu'un même modèle est atteint
 * par plusieurs chemins — une `Action` cascade depuis l'`Etablissement`, depuis
 * le `Risque` ET depuis la `Verification`, et additionner les trois comptes
 * compterait la même ligne trois fois. Le `Set` dédoublonne, et il fait aussi
 * office de garde contre les cycles.
 *
 * Les arêtes d'un même niveau partent ensemble (`Promise.all`) : le graphe
 * compte 31 arêtes `Cascade` pour 5 niveaux de profondeur, et une carte de
 * confirmation qui coûterait 31 allers-retours séquentiels serait payée par
 * quelqu'un. La fusion des résultats reste séquentielle, pour que le `Set`
 * dédoublonne sans course.
 */
export async function cascadeDepuis(
  client: PrismaClient,
  racine: string,
  racineIds: string[],
): Promise<Map<string, Set<string>>> {
  const cascades = relationsDuSchema().filter((r) => r.action === "Cascade");
  const emporte = new Map<string, Set<string>>([[racine, new Set(racineIds)]]);

  let frontiere: [string, string[]][] = [[racine, racineIds]];
  while (frontiere.length > 0) {
    const aInterroger = frontiere.flatMap(([modele, ids]) =>
      cascades
        .filter((r) => r.parent === modele)
        .map((relation) => ({ relation, ids })),
    );
    const reponses = await Promise.all(
      aInterroger.map(async ({ relation, ids }) => ({
        relation,
        lignes: await delegue(client, relation.enfant).findMany({
          where: { [relation.cle]: { in: ids } },
          select: { id: true },
        }),
      })),
    );

    const suivante: [string, string[]][] = [];
    for (const { relation, lignes } of reponses) {
      const deja = emporte.get(relation.enfant) ?? new Set<string>();
      const neufs = lignes.map((l) => l.id).filter((id) => !deja.has(id));
      for (const id of neufs) deja.add(id);
      emporte.set(relation.enfant, deja);
      if (neufs.length > 0) suivante.push([relation.enfant, neufs]);
    }
    frontiere = suivante;
  }
  return emporte;
}

/**
 * Ce qui ferait ÉCHOUER la suppression, plutôt que de partir avec elle.
 *
 * Une relation `Restrict` visant une ligne que la cascade veut effacer n'est pas
 * un détail d'aperçu : PostgreSQL refuse la suppression du parent et rien n'est
 * effacé. Un aperçu qui promet une suppression impossible ment tout autant que
 * celui qui en sous-compte l'effet.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LA CONDITION QUI MANQUAIT, ET COMMENT ELLE A ÉTÉ ÉTABLIE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Une première rédaction signalait TOUTE arête `Restrict` ou `NoAction` visant
 * un parent emporté. Elle criait au loup sur deux des trois : mesuré sur une
 * base jetable le 2026-09-04, la suppression **réussit** malgré
 * `Equipement.batimentId → Batiment [NoAction]` (20 lignes) et
 * `Verification.salarieId → Salarie [Restrict]` (8 lignes), et n'échoue que
 * sur `DuerpVersion.duerpId → Duerp [Restrict]`.
 *
 * Ce qui les sépare : **l'enfant est-il lui-même emporté par la cascade ?**
 * Une `Verification` cascade depuis l'`Etablissement`, donc elle disparaît dans
 * la même instruction que le `Salarie` qu'elle vise et la contrainte n'a plus
 * personne à protéger. Une `DuerpVersion` ne cascade de nulle part — la
 * conservation quarante ans du DUERP l'exige — donc elle survit, et sa
 * contrainte mord.
 *
 * On ne signale donc que les lignes **non emportées**. Le test qui fait foi
 * n'est ni le nom de l'action ni la table : c'est l'appartenance de l'enfant à
 * l'ensemble déjà calculé, et elle se dérive du même graphe.
 */
export async function bloqueraient(
  client: PrismaClient,
  emporte: Map<string, Set<string>>,
): Promise<{ relation: Relation; nombre: number }[]> {
  const risques = relationsDuSchema().filter(
    (r) => r.action === "Restrict" || r.action === "NoAction",
  );
  const trouves: { relation: Relation; nombre: number }[] = [];
  for (const relation of risques) {
    const parents = emporte.get(relation.parent);
    if (!parents || parents.size === 0) continue;
    const lignes = await delegue(client, relation.enfant).findMany({
      where: { [relation.cle]: { in: [...parents] } },
      select: { id: true },
    });
    const aussiEmportes = emporte.get(relation.enfant) ?? new Set<string>();
    const survivants = lignes.filter((l) => !aussiEmportes.has(l.id));
    if (survivants.length > 0) {
      trouves.push({ relation, nombre: survivants.length });
    }
  }
  return trouves;
}

/**
 * Le total des lignes emportées, hors les modèles nommés à part par la phrase
 * qui les annonce (`exclus`). Une somme sur des ensembles déjà dédoublonnés :
 * chaque ligne y compte une fois, quel que soit le nombre de chemins qui la
 * touchent.
 */
export function compterLignes(
  emporte: Map<string, Set<string>>,
  exclus: readonly string[],
): number {
  let total = 0;
  for (const [modele, ids] of emporte) {
    if (exclus.includes(modele)) continue;
    total += ids.size;
  }
  return total;
}
