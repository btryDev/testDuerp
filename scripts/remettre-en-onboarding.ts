/**
 * Remet un compte à l'état « jamais renseigné », pour rejouer l'onboarding.
 *
 * **Pourquoi un script de remise à zéro plutôt qu'un compte figé.** Un compte
 * qu'on maintiendrait vide en permanence ne serait jamais celui qu'on veut :
 * dès qu'on renseigne le formulaire pour voir ce qu'il produit, il cesse d'être
 * en onboarding. Ce qu'il faut n'est pas un compte spécial, c'est un geste
 * répétable — remplir, regarder, remettre à zéro, recommencer.
 *
 * Ce qu'il fait : supprime l'`Entreprise` du compte. Tout le dossier part avec
 * elle par cascade — établissement, équipements, vérifications, salariés,
 * DUERP, prestataires, registres. Le compte Supabase, lui, n'est pas touché :
 * l'utilisateur reste connecté, et l'application le renvoie à `/onboarding`
 * parce qu'il n'a plus d'entreprise (`app/entreprises/page.tsx:15`).
 *
 * **Ce script détruit des données et n'a aucun moyen de les rendre.** Trois
 * garde-fous, dans cet ordre :
 *
 *   1. il refuse de s'exécuter si `DATABASE_URL` ne pointe pas sur localhost ;
 *   2. il exige l'adresse e-mail en argument, jamais de valeur par défaut ;
 *   3. sans `--vraiment`, il montre ce qu'il supprimerait et s'arrête.
 *
 * Le premier garde-fou n'est pas décoratif : une base de production a été
 * effacée sur ce projet le 2026-08-27 par une commande qui semblait sûre.
 *
 * **Le TROISIÈME ne l'était pas non plus, et il a menti d'un facteur deux du
 * 2026-09-01 au 2026-09-04.** Il lisait `entreprise.etablissements[0]` et n'en
 * affichait que quatre compteurs, alors que la suppression part de
 * l'`Entreprise` et cascade sur tous ses établissements : un compte à deux
 * établissements s'y voyait annoncer « 10 équipements, 36 vérifications,
 * 5 salariés, 3 bâtiments » et en perdait le double. Le `[0]` était juste tant
 * qu'un compte n'avait qu'un établissement ; l'ADR-028 a retiré l'unicité de
 * `Etablissement.entrepriseId` et l'aperçu a rétréci sans rien casser.
 * `cascadeDepuisEntreprise` le remplace en **dérivant la cascade du schéma**,
 * pour qu'une relation ajoutée demain y entre d'elle-même. Un garde-fou dont
 * l'aperçu se répare en le recopiant ne garde rien.
 *
 *   pnpm tsx scripts/remettre-en-onboarding.ts                      # liste les dossiers
 *   pnpm tsx scripts/remettre-en-onboarding.ts <userId>
 *   pnpm tsx scripts/remettre-en-onboarding.ts <userId> --vraiment
 *
 * **On désigne un dossier par son `userId`, pas par une adresse e-mail**, et la
 * première rédaction de ce script se trompait sur ce point : elle interrogeait
 * `auth.users`, qui n'existe pas dans la base locale. L'identité vit chez
 * Supabase, seul le dossier est ici — la seule clé commune aux deux mondes est
 * l'UUID que `Entreprise.userId` porte. Sans argument, le script liste les
 * dossiers présents avec leur `userId` : c'est là qu'on lit celui qu'on veut.
 */

import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Une relation, du parent vers l'enfant qui porte la clé étrangère.
 *
 * `action` est la référentielle déclarée au schéma : `Cascade` emporte l'enfant,
 * `Restrict` fait ÉCHOUER la suppression du parent, `SetNull` laisse l'enfant en
 * place en vidant sa clé, `NoAction` diffère le contrôle en fin d'instruction.
 */
type Relation = {
  parent: string;
  enfant: string;
  cle: string;
  action: string;
};

/**
 * Les relations du schéma, LUES AU SCHÉMA et jamais énumérées à la main.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI PAS UNE LISTE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * L'aperçu de ce script est le seul endroit où un opérateur voit ce qu'il va
 * détruire, et une liste écrite à la main **se répare en la recopiant** : elle
 * ne cesse jamais d'être verte, elle cesse d'être complète. Le jour où une
 * relation entre au schéma, une liste ne le sait pas et l'aperçu se remet à
 * mentir en silence — exactement le mode de panne que ce lot corrige.
 *
 * `Prisma.dmmf` porte le schéma tel qu'il a été généré, `relationOnDelete`
 * compris. Une relation ajoutée demain apparaît donc au prochain
 * `prisma generate`, sans que personne ait à toucher ce fichier.
 *
 * On ne retient que le côté PROPRIÉTAIRE de chaque relation — celui dont
 * `relationFromFields` est non vide, donc celui qui porte la clé étrangère —
 * pour ne compter chaque arête qu'une fois.
 */
function relationsDuSchema(): Relation[] {
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

/** Le délégué Prisma d'un modèle : `Etablissement` → `prisma.etablissement`. */
function delegue(modele: string) {
  const nom = modele[0].toLowerCase() + modele.slice(1);
  return (
    prisma as unknown as Record<
      string,
      { findMany: (a: unknown) => Promise<{ id: string }[]> }
    >
  )[nom];
}

/**
 * Tout ce que la suppression d'une `Entreprise` emporte, table par table.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LE DÉFAUT QUE CETTE FONCTION REMPLACE, ET CE QU'IL COÛTAIT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * L'aperçu lisait `entreprise.etablissements[0]` et n'en montrait que les
 * quatre compteurs — équipements, vérifications, salariés, bâtiments — pendant
 * que la suppression part de l'`Entreprise` et cascade sur TOUS ses
 * établissements. Sur un compte à deux établissements, il annonçait la moitié
 * et en emportait le double ; sur un compte à trois, le tiers.
 *
 * **Le trou est né avec l'ADR-028.** Le script était juste quand un compte
 * n'avait qu'un établissement : `[0]` était alors le seul, et `Etablissement.
 * entrepriseId` portait encore une contrainte d'unicité qui le garantissait.
 * L'ADR-028 l'a retirée. Aucun test n'a rougi, aucun type n'a bougé — le `[0]`
 * a simplement cessé de vouloir dire « l'établissement » pour vouloir dire
 * « le premier des N ». C'est le mode de panne d'un aperçu : il ne casse pas,
 * il rétrécit.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * COMMENT ELLE COMPTE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Un parcours en largeur du graphe des relations `Cascade`, depuis
 * l'`Entreprise`. On collecte les identifiants plutôt que des compteurs, parce
 * qu'un même modèle est atteint par plusieurs chemins — une `Action` cascade
 * depuis l'`Etablissement`, depuis le `Risque` ET depuis la `Verification`, et
 * additionner les trois comptes compterait la même ligne trois fois. Le `Set`
 * dédoublonne, et il fait aussi office de garde contre les cycles.
 */
async function cascadeDepuisEntreprise(
  entrepriseId: string,
): Promise<Map<string, Set<string>>> {
  const cascades = relationsDuSchema().filter((r) => r.action === "Cascade");
  const emporte = new Map<string, Set<string>>([
    ["Entreprise", new Set([entrepriseId])],
  ]);

  let frontiere: [string, string[]][] = [["Entreprise", [entrepriseId]]];
  while (frontiere.length > 0) {
    const suivante: [string, string[]][] = [];
    for (const [modele, ids] of frontiere) {
      for (const relation of cascades.filter((r) => r.parent === modele)) {
        const lignes = await delegue(relation.enfant).findMany({
          where: { [relation.cle]: { in: ids } },
          select: { id: true },
        });
        const deja = emporte.get(relation.enfant) ?? new Set<string>();
        const neufs = lignes.map((l) => l.id).filter((id) => !deja.has(id));
        for (const id of neufs) deja.add(id);
        emporte.set(relation.enfant, deja);
        if (neufs.length > 0) suivante.push([relation.enfant, neufs]);
      }
    }
    frontiere = suivante;
  }
  return emporte;
}

/**
 * Ce qui ferait ÉCHOUER la suppression, plutôt que de partir avec elle.
 *
 * Une relation `Restrict` visant une ligne que la cascade veut effacer n'est pas
 * un détail d'aperçu : PostgreSQL refuse la suppression du parent et le script
 * s'arrête sur une contrainte, sans rien avoir effacé. Un aperçu qui promet une
 * suppression impossible ment tout autant que celui qui en sous-compte l'effet.
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
async function bloqueraient(
  emporte: Map<string, Set<string>>,
): Promise<{ relation: Relation; nombre: number }[]> {
  const risques = relationsDuSchema().filter(
    (r) => r.action === "Restrict" || r.action === "NoAction",
  );
  const trouves: { relation: Relation; nombre: number }[] = [];
  for (const relation of risques) {
    const parents = emporte.get(relation.parent);
    if (!parents || parents.size === 0) continue;
    const lignes = await delegue(relation.enfant).findMany({
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

function exigerBaseLocale(): void {
  const url = process.env.DATABASE_URL ?? "";
  const locale = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  if (!locale) {
    console.error(
      "REFUS : DATABASE_URL ne pointe pas sur localhost.\n" +
        "Ce script supprime un dossier complet ; il ne s'exécute que sur la base locale.",
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  exigerBaseLocale();

  const userId = process.argv[2];
  const vraiment = process.argv.includes("--vraiment");

  const dossiers = await prisma.entreprise.findMany({
    include: { etablissements: { select: { id: true, raisonDisplay: true } } },
  });

  // Sans argument : on montre ce qu'il y a, avec la clé qui sert à le désigner.
  // Un script destructif ne doit jamais avoir à deviner sa cible.
  if (!userId || userId.startsWith("--")) {
    console.log(`${dossiers.length} dossier(s) dans la base locale :\n`);
    for (const d of dossiers) {
      console.log(`  ${d.userId ?? "(sans compte)"}  ${d.raisonSociale}`);
    }
    console.log(
      "\nUsage : pnpm tsx scripts/remettre-en-onboarding.ts <userId> [--vraiment]",
    );
    return;
  }

  const entreprise = dossiers.find((d) => d.userId === userId);
  if (!entreprise) {
    console.error(
      `Aucun dossier pour ${userId}. Relance sans argument pour voir la liste.`,
    );
    process.exit(1);
  }

  console.log(`Compte    : ${userId}`);
  console.log(
    `Entreprise: ${entreprise.raisonSociale} (SIRET ${entreprise.siret ?? "—"})`,
  );
  console.log(
    `Établ.    : ${entreprise.etablissements.length} — ` +
      entreprise.etablissements.map((e) => e.raisonDisplay).join(", "),
  );

  // L'aperçu compte SUR TOUS LES ÉTABLISSEMENTS, parce que la suppression part
  // de l'Entreprise. Le compte de tête est celui qui se compare à un total,
  // et le détail par table dit d'où il vient.
  const emporte = await cascadeDepuisEntreprise(entreprise.id);
  const lignes = [...emporte]
    .filter(([modele]) => modele !== "Entreprise")
    .map(([modele, ids]) => [modele, ids.size] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const total = lignes.reduce((s, [, n]) => s + n, 0);

  console.log(`\nCe que la suppression emporte — ${total} ligne(s) :`);
  if (lignes.length === 0) {
    console.log("  (rien : l'entreprise n'a aucune ligne rattachée)");
  }
  for (const [modele, n] of lignes) {
    console.log(`  ${String(n).padStart(5)}  ${modele}`);
  }
  console.log(
    "\n  Compté en parcourant les relations onDelete: Cascade du schéma ; une\n" +
      "  relation ajoutée au schéma apparaîtra ici sans toucher ce script.",
  );

  const blocages = await bloqueraient(emporte);
  if (blocages.length > 0) {
    console.log("\nCE QUI EMPÊCHERAIT LA SUPPRESSION (contrainte non-cascade) :");
    for (const { relation, nombre } of blocages) {
      console.log(
        `  ${String(nombre).padStart(5)}  ${relation.enfant}.${relation.cle}` +
          ` → ${relation.parent}  [${relation.action}]`,
      );
    }
    console.log(
      "\n  PostgreSQL refusera de supprimer le parent tant que ces lignes existent.\n" +
        "  La suppression échouera sur une erreur de contrainte, sans rien effacer.",
    );
  }

  if (!vraiment) {
    console.log("\nRien n'a été supprimé. Relance avec --vraiment pour effacer.");
    return;
  }

  await prisma.entreprise.delete({ where: { id: entreprise.id } });
  console.log(`\nSupprimé. Ce compte est de nouveau en onboarding.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
