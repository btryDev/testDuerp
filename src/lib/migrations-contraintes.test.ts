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
