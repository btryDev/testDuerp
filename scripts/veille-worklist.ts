// La liste de travail de la veille réglementaire.
//
// Ce script ne va sur aucun réseau, et c'est délibéré : Légifrance répond 403
// à un client HTTP ordinaire, même avec un User-Agent de navigateur. La
// consultation des textes revient donc à un agent outillé, pas à un script.
//
// Ce que le script fait, lui, est ce qu'une machine fait mieux qu'un agent :
// dépouiller les 78 obligations, en extraire chaque référence vérifiable avec
// son identifiant Légifrance, dire laquelle n'a jamais été constatée et
// laquelle l'a été il y a longtemps, puis ordonner tout cela par criticité.
//
// L'agent reçoit ainsi une liste finie et ordonnée au lieu d'un corpus. C'est
// la différence entre « relis le référentiel » — que personne ne fait jamais
// jusqu'au bout — et « voici quarante URL, dans cet ordre ».
//
//   pnpm veille              → résumé lisible
//   pnpm veille --json       → la liste, pour l'agent
//   pnpm veille --limite 20  → les N premières
//
// Aucune écriture : le script rend compte, il ne corrige rien. Corriger une
// référence suppose d'avoir lu le texte, ce qu'un script ne sait pas faire.

import {
  obligationsConformite,
  REFERENTIEL_VERSION,
} from "../src/lib/referentiels/conformite";
import type { ReferenceLegale } from "../src/lib/referentiels/conformite/types";

/** Les identifiants stables que Légifrance expose dans ses URL. */
const MOTIFS_ID = /(LEGIARTI|LEGISCTA|LEGITEXT|JORFTEXT|KALIARTI)\d+/g;

export type EntreeVeille = {
  obligationId: string;
  domaine: string;
  criticite: number;
  reference: string;
  url: string;
  /** Identifiants Légifrance présents dans l'URL, s'il y en a. */
  identifiants: string[];
  /** Date de version relevée à la dernière relecture, ou null. */
  versionConstatee: string | null;
  /** Jours écoulés depuis ce relevé, ou null s'il n'y en a jamais eu. */
  anciennete: number | null;
  /** Pourquoi cette entrée figure à la liste. */
  motif: "jamais_constatee" | "constat_ancien" | "a_jour";
};

export type RendezVous = {
  obligationId: string;
  le: string;
  motif: string;
  joursRestants: number;
};

/** Au-delà, un constat mérite d'être refait même si rien ne l'a alerté. */
const PEREMPTION_JOURS = 365;

function jours(depuis: string, jusquA: Date): number {
  const d = new Date(`${depuis}T00:00:00Z`).getTime();
  return Math.floor((jusquA.getTime() - d) / 86_400_000);
}

export function construireListe(maintenant: Date): {
  entrees: EntreeVeille[];
  rendezVous: RendezVous[];
  stats: Record<string, number>;
} {
  const entrees: EntreeVeille[] = [];
  const rendezVous: RendezVous[] = [];

  for (const o of obligationsConformite) {
    if (o.relectureDue) {
      rendezVous.push({
        obligationId: o.id,
        le: o.relectureDue.le,
        motif: o.relectureDue.motif,
        joursRestants: -jours(o.relectureDue.le, maintenant),
      });
    }

    for (const r of o.referencesLegales as ReferenceLegale[]) {
      if (!r.url) continue;
      const identifiants = [...r.url.matchAll(MOTIFS_ID)].map((m) => m[0]);
      const anciennete = r.versionConstatee
        ? jours(r.versionConstatee, maintenant)
        : null;
      entrees.push({
        obligationId: o.id,
        domaine: o.domaine,
        criticite: o.criticite,
        reference: r.reference,
        url: r.url,
        identifiants,
        versionConstatee: r.versionConstatee ?? null,
        anciennete,
        motif:
          anciennete === null
            ? "jamais_constatee"
            : anciennete > PEREMPTION_JOURS
              ? "constat_ancien"
              : "a_jour",
      });
    }
  }

  // Le plus critique d'abord, et à criticité égale, ce qui n'a jamais été
  // constaté avant ce qui l'a été il y a longtemps. Un agent qui s'arrête en
  // cours de route doit s'être arrêté au bon endroit.
  const rang = { jamais_constatee: 0, constat_ancien: 1, a_jour: 2 } as const;
  entrees.sort(
    (a, b) =>
      b.criticite - a.criticite ||
      rang[a.motif] - rang[b.motif] ||
      a.obligationId.localeCompare(b.obligationId),
  );
  rendezVous.sort((a, b) => a.le.localeCompare(b.le));

  const stats = {
    obligations: obligationsConformite.length,
    references: entrees.length,
    jamais_constatee: entrees.filter((e) => e.motif === "jamais_constatee").length,
    constat_ancien: entrees.filter((e) => e.motif === "constat_ancien").length,
    a_jour: entrees.filter((e) => e.motif === "a_jour").length,
    sans_identifiant: entrees.filter((e) => e.identifiants.length === 0).length,
  };

  return { entrees, rendezVous, stats };
}

function principal() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const iLimite = args.indexOf("--limite");
  const limite = iLimite === -1 ? Infinity : Number(args[iLimite + 1]);

  const { entrees, rendezVous, stats } = construireListe(new Date());
  const aVerifier = entrees
    .filter((e) => e.motif !== "a_jour")
    .slice(0, limite);

  if (json) {
    console.log(
      JSON.stringify(
        { referentielVersion: REFERENTIEL_VERSION, stats, rendezVous, aVerifier },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Référentiel ${REFERENTIEL_VERSION}`);
  console.log(
    `${stats.obligations} obligations · ${stats.references} références vérifiables`,
  );
  console.log(
    `  jamais constatée : ${stats.jamais_constatee}` +
      `  ·  constat > ${PEREMPTION_JOURS} j : ${stats.constat_ancien}` +
      `  ·  à jour : ${stats.a_jour}`,
  );
  if (stats.sans_identifiant > 0) {
    console.log(
      `  ${stats.sans_identifiant} référence(s) sans identifiant Légifrance ` +
        `(source hors Légifrance, ou URL à corriger)`,
    );
  }

  if (rendezVous.length > 0) {
    console.log(`\nRendez-vous de relecture :`);
    for (const r of rendezVous) {
      const etat =
        r.joursRestants < 0
          ? `ÉCHU depuis ${-r.joursRestants} j`
          : `dans ${r.joursRestants} j`;
      console.log(`  ${r.le}  ${etat}  — ${r.obligationId}`);
    }
  }

  console.log(`\nÀ vérifier, par ordre de priorité :`);
  for (const e of aVerifier) {
    const age =
      e.anciennete === null ? "jamais constatée" : `constatée il y a ${e.anciennete} j`;
    console.log(`  [c${e.criticite}] ${e.obligationId}`);
    console.log(`        ${e.reference}  (${age})`);
    console.log(`        ${e.url}`);
  }
  if (aVerifier.length === 0) {
    console.log("  (rien — toutes les références ont un constat récent)");
  }
}

// `veille.test.ts` importe `construireListe` depuis ce fichier. Sans ce garde,
// l'import exécutait le CLI à chaque passage des tests : il lisait le
// `process.argv` de vitest — pas le sien — et déversait la liste sur la sortie
// standard. C'était sans conséquence tant que vitest la masquait, mais un
// `--json` ou un `--limite` n'importe où dans la ligne de commande de vitest
// aurait changé ce qui s'exécutait.
if (process.argv[1]?.endsWith("veille-worklist.ts")) {
  principal();
}
