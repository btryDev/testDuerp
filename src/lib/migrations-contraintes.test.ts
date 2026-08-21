import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Non-régression sur les invariants de base qui ne vivent PAS dans le client
 * Prisma généré.
 *
 * Le langage Prisma ne sait pas exprimer une CHECK constraint. La contrainte
 * `Action_origine_xor` — « une action a exactement une origine, un risque du
 * DUERP ou une vérification, jamais les deux, jamais aucune » (ADR-002) —
 * n'existe donc que dans le SQL d'une migration. Elle est invisible dans
 * schema.prisma, invisible dans les types générés, et un `prisma db push`
 * (dev, CI) recrée la table `Action` SANS elle : plus rien ne détecterait sa
 * disparition.
 *
 * Ce test est le filet : il relit les fichiers de migration et échoue si la
 * contrainte n'y est plus déclarée, ou si une migration ultérieure la retire.
 * Il ne touche pas à la base — il lit des fichiers, il tourne partout et coûte
 * quelques millisecondes.
 */

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIER_MIGRATIONS = join(RACINE, "prisma", "migrations");

/** Contenu de chaque migration.sql, indexé par nom de dossier (donc trié chronologiquement). */
function lireMigrations(): { nom: string; sql: string }[] {
  return readdirSync(DOSSIER_MIGRATIONS, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((nom) => ({
      nom,
      sql: readFileSync(join(DOSSIER_MIGRATIONS, nom, "migration.sql"), "utf8"),
    }));
}

/** Écrase les retours à la ligne et les espaces multiples : le SQL est formaté librement. */
function normaliser(sql: string): string {
  return sql.replace(/\s+/g, " ");
}

describe("contraintes SQL non représentables dans schema.prisma", () => {
  const migrations = lireMigrations();

  it("trouve au moins une migration à analyser", () => {
    // Garde-fou du test lui-même : si le chemin est faux, les assertions
    // suivantes passeraient à vide et le filet serait silencieusement percé.
    expect(migrations.length).toBeGreaterThan(0);
  });

  it("déclare la contrainte XOR d'origine des actions (ADR-002)", () => {
    const declarations = migrations.filter((m) =>
      normaliser(m.sql).includes('CONSTRAINT "Action_origine_xor"'),
    );

    expect(
      declarations.length,
      "Aucune migration ne déclare `Action_origine_xor`. Cette CHECK constraint est le seul garde-fou du XOR risque/vérification (ADR-002) : elle n'est pas exprimable en Prisma et n'existe que dans le SQL.",
    ).toBeGreaterThan(0);
  });

  it("conserve l'expression exacte du XOR (risqueId <> verificationId)", () => {
    // On vérifie l'expression et pas seulement le nom : une contrainte
    // renommée mais vidée de son sens passerait le test précédent.
    const sqlComplet = migrations.map((m) => normaliser(m.sql)).join(" ");

    expect(sqlComplet).toContain(
      'CHECK (("risqueId" IS NULL) <> ("verificationId" IS NULL))',
    );
  });

  it("ne retire jamais la contrainte XOR dans une migration ultérieure", () => {
    const suppressions = migrations.filter((m) =>
      /DROP\s+CONSTRAINT\s+(IF\s+EXISTS\s+)?"Action_origine_xor"/i.test(
        normaliser(m.sql),
      ),
    );

    expect(
      suppressions.map((m) => m.nom),
      "Une migration retire `Action_origine_xor` sans la rétablir. Si la table Action est recréée, le CHECK doit être réappliqué dans la même migration.",
    ).toEqual([]);
  });
});

describe("conservation 40 ans du DUERP (art. R. 4121-4 CT)", () => {
  /**
   * Une DuerpVersion figée ne peut pas être détruite avant 40 ans. Le garde-fou
   * est le `onDelete: Restrict` sur les deux maillons Etablissement → Duerp →
   * DuerpVersion : la base refuse la suppression tant qu'un DUERP versionné
   * existe. Repasser l'un des deux en Cascade rendrait à nouveau possible
   * l'effacement silencieux de toutes les versions archivées depuis une simple
   * suppression d'établissement.
   *
   * Contrairement au XOR, cet invariant est bien exprimé dans schema.prisma —
   * c'est donc ce fichier qu'on relit.
   */
  const schema = readFileSync(join(RACINE, "prisma", "schema.prisma"), "utf8");

  /** Extrait le corps d'un modèle Prisma par son nom. */
  function corpsDuModele(nom: string): string {
    const m = schema.match(new RegExp(`\\bmodel\\s+${nom}\\s*\\{([\\s\\S]*?)\\n\\}`));
    expect(m, `modèle ${nom} introuvable dans schema.prisma`).not.toBeNull();
    return m![1];
  }

  // Le garde-fou de conservation porte sur le maillon qui porte la preuve, pas
  // sur la coquille : un DUERP ouvert mais jamais validé n'a rien à conserver.
  // `Duerp.etablissement` reste donc en Cascade — le Restrict de DuerpVersion
  // suffit à faire échouer toute la transaction dès qu'une version figée existe.
  // Le mettre en Restrict rendrait l'établissement indélébile sans motif légal.
  it("Duerp.etablissement reste en Cascade — le refus vient de DuerpVersion", () => {
    const corps = corpsDuModele("Duerp");
    const relation = corps.match(/etablissement\s+Etablissement\s+@relation\([^)]*\)/);

    expect(relation).not.toBeNull();
    expect(relation![0]).toContain("onDelete: Cascade");
  });

  it("DuerpVersion.duerp est en Restrict, pas en Cascade", () => {
    const corps = corpsDuModele("DuerpVersion");
    const relation = corps.match(/duerp\s+Duerp\s+@relation\([^)]*\)/);

    expect(relation).not.toBeNull();
    expect(relation![0]).toContain("onDelete: Restrict");
  });
});

describe("le bâtiment est un lieu, jamais un régime (ADR-019)", () => {
  /**
   * Deux invariants, deux filets.
   *
   * En base : tout équipement est dans un bâtiment (`batimentId` NOT NULL), et
   * supprimer un bâtiment ne peut pas emporter un équipement — donc ses
   * vérifications et ses rapports (ADR-012). La migration doit backfiller
   * AVANT de poser le NOT NULL, sans quoi elle échoue sur toute base qui a
   * déjà des équipements.
   *
   * Dans le schéma : `Batiment` ne porte aucun champ de régime. Un `estERP`
   * posé « par réflexe » sur le bâtiment classerait chaque corps séparément,
   * ce qui sous-catégorise un ERP contigu — pire que l'approximation actuelle.
   */
  const schema = readFileSync(join(RACINE, "prisma", "schema.prisma"), "utf8");
  const migrations = lireMigrations();
  const migration = migrations.find((m) => m.nom.endsWith("_batiment_lieu"));

  function corpsDuModele(nom: string): string {
    const m = schema.match(new RegExp(`\\bmodel\\s+${nom}\\s*\\{([\\s\\S]*?)\\n\\}`));
    expect(m, `modèle ${nom} introuvable dans schema.prisma`).not.toBeNull();
    return m![1];
  }

  it("la migration existe", () => {
    expect(migration).toBeDefined();
  });

  it("backfille un bâtiment principal et rattache les équipements AVANT le NOT NULL", () => {
    const sql = normaliser(migration!.sql);
    const insertion = sql.indexOf('INSERT INTO "Batiment"');
    const rattachement = sql.indexOf('UPDATE "Equipement"');
    const nonNul = sql.indexOf('ALTER COLUMN "batimentId" SET NOT NULL');

    expect(insertion, "pas de création de bâtiment principal").toBeGreaterThan(-1);
    expect(rattachement, "les équipements ne sont pas rattachés").toBeGreaterThan(insertion);
    expect(nonNul, "le NOT NULL manque").toBeGreaterThan(rattachement);
  });

  it("Equipement.batiment est requis et ne se supprime jamais en cascade", () => {
    const corps = corpsDuModele("Equipement");
    expect(corps).toMatch(/\bbatimentId\s+String\b(?!\?)/);
    const relation = corps.match(/batiment\s+Batiment\s+@relation\([^)]*\)/);
    expect(relation).not.toBeNull();
    // NoAction, pas Restrict : même garantie, contrôlée en fin d'instruction.
    // Restrict, vérifié ligne à ligne, faisait échouer la suppression d'un
    // établissement selon l'ordre des cascades — cf. _batiment_fk_no_action.
    expect(relation![0]).toContain("onDelete: NoAction");

    const fk = migrations.flatMap(
      (m) =>
        normaliser(m.sql).match(
          /"Equipement_batimentId_fkey"[^;]*REFERENCES "Batiment"[^;]*/gi,
        ) ?? [],
    );
    expect(fk.length, "aucune migration ne pose la FK").toBeGreaterThan(0);
    // La dernière migration qui touche la FK fait foi.
    expect(fk.at(-1)).toContain("ON DELETE NO ACTION");
  });

  it("supprimer un bâtiment reste impossible tant qu'il contient un équipement", () => {
    // L'invariant ADR-019 ne tient plus par la base seule une fois la FK en
    // NoAction sur une suppression d'établissement : c'est `supprimerBatiment`
    // qui déplace le contenu avant, et la FK qui refuse en fin d'instruction
    // si quelque chose a été oublié. Les deux doivent rester en place.
    const actions = readFileSync(
      join(RACINE, "src", "lib", "batiments", "actions.ts"),
      "utf8",
    );
    for (const table of ["equipement", "pointReleve", "permisFeu", "planPrevention"]) {
      expect(actions, `${table} n'est pas déplacé avant la suppression`).toContain(
        `tx.${table}.updateMany(deplacement)`,
      );
    }
    expect(actions.indexOf("tx.batiment.delete")).toBeGreaterThan(
      actions.indexOf("tx.planPrevention.updateMany"),
    );
  });

  it("aucune migration ultérieure ne repasse Equipement.batimentId en CASCADE", () => {
    const fautives = migrations.filter(
      (m) =>
        m.nom > migration!.nom &&
        /"Equipement_batimentId_fkey"[^;]*ON DELETE CASCADE/i.test(normaliser(m.sql)),
    );
    expect(fautives.map((m) => m.nom)).toEqual([]);
  });

  it("Batiment ne porte aucun régime ni catégorie", () => {
    const corps = corpsDuModele("Batiment");
    for (const champ of [
      "estERP",
      "estIGH",
      "estHabitation",
      "estEtablissementTravail",
      "typeErp",
      "categorieErp",
      "classeIgh",
      "effectif",
    ]) {
      expect(corps, `\`${champ}\` n'a rien à faire sur Batiment (ADR-019)`).not.toContain(champ);
    }
  });

  it("les rattachements optionnels sont en SetNull, pas en Cascade", () => {
    for (const modele of ["PointReleve", "PermisFeu", "PlanPrevention"]) {
      const corps = corpsDuModele(modele);
      const relation = corps.match(/batiment\s+Batiment\?\s+@relation\([^)]*\)/);
      expect(relation, `${modele}.batiment manquant`).not.toBeNull();
      expect(relation![0]).toContain("onDelete: SetNull");
    }
  });
});
