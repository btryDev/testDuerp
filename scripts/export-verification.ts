// L'état de vérification du référentiel : de quoi peut-on dire qu'on l'a lu ?
//
//   pnpm verification            → le résumé à l'écran
//   pnpm verification --md       → le document complet sur la sortie standard
//   pnpm verification --ecrire   → le document écrit dans docs/, tel qu'il est
//                                  commité et tel qu'un test le compare
//   pnpm verification --csv      → une ligne par référence, pour un tableur
//
// Le pendant de `pnpm relecture`, et pas son doublon : celui-là déplie chaque
// référence pour qu'un relecteur la contrôle article par article ; celui-ci
// agrège pour répondre à « où en est-on », question à laquelle personne ne
// savait répondre sans rouvrir trois documents.
//
// Aucune écriture hors du document lui-même. Le script rend compte.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { REFERENTIEL_VERSION } from "../src/lib/referentiels/conformite";
import {
  agreger,
  ANCRAGES,
  DEGRES,
  degre,
  lecturesNonCitees,
  mesurerReferentiel,
  resumer,
} from "../src/lib/referentiels/corpus/verification";
import {
  CHEMIN_DOCUMENT,
  rendreEtatVerification,
} from "../src/lib/referentiels/corpus/verification-document";

const argv = process.argv.slice(2);

/** La date du jour, en clé de jour civil — la seule entrée non déterministe. */
function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

function resumeConsole(): string {
  const mesures = mesurerReferentiel();
  const tout = resumer("tout", mesures);
  const l: string[] = [];

  l.push(`Référentiel ${REFERENTIEL_VERSION}`);
  l.push("");
  l.push(`${tout.obligations} obligations · ${tout.references} références`);
  l.push("");
  l.push("Degré de vérification, du plus solide au plus faible :");
  for (const d of DEGRES) {
    l.push(
      `  ${String(tout.obligationsParDegre[d.code]).padStart(4)} obligations · ` +
        `${String(tout.referencesParDegre[d.code]).padStart(4)} références · ` +
        `${d.rang} ${d.titre}`,
    );
  }
  l.push("");
  l.push("Ancre de veille :");
  for (const a of ANCRAGES) {
    l.push(
      `  ${String(tout.referencesParAncrage[a.code]).padStart(4)} références · ${a.titre}`,
    );
  }
  l.push("");
  l.push("Par domaine — obligations mesurées au plancher :");
  for (const a of agreger(mesures, (m) => m.domaine)) {
    const solides =
      a.obligationsParDegre.premiere_main + a.obligationsParDegre.agent_verbatim;
    l.push(
      `  ${a.cle.padEnd(26)} ${String(a.obligations).padStart(3)} obl · ` +
        `${String(solides).padStart(3)} lues à la source avec verbatim · ` +
        `${String(a.referencesParAncrage.jamais_constate).padStart(3)}/${a.references} réf. sans ancre`,
    );
  }
  l.push("");
  const orphelins = lecturesNonCitees();
  l.push(
    `${orphelins.reduce((n, c) => n + c.articles, 0)} articles dépouillés qu'aucune ` +
      `obligation ne cite, sur ${orphelins.length} corpus — lus, pas branchés.`,
  );
  l.push("");
  l.push(`Le document complet : ${CHEMIN_DOCUMENT}`);
  l.push("Le régénérer : pnpm verification --ecrire");
  return l.join("\n");
}

function csv(): string {
  const echap = (v: string | number | boolean | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const lignes = mesurerReferentiel().flatMap((m) =>
    m.references.map((r) => ({
      obligation: m.id,
      domaine: m.domaine,
      porteur: m.porteur,
      degreObligation: degre(m.degrePlancher).rang,
      rang: r.position === 0 ? "fondement" : `contexte ${r.position}`,
      source: r.source,
      reference: r.reference,
      article: r.article,
      corpus: r.corpus,
      statutCorpus: r.statutCorpus,
      luLe: r.luLe,
      lecture: r.lecture,
      prescrit: r.aPrescrit,
      verbatim: r.aCitationCle,
      versionEnVigueur: r.versionEnVigueur,
      versionConstatee: r.versionConstatee,
      degre: degre(r.degre).rang,
      degreLibelle: degre(r.degre).court,
      ancrage: r.ancrage,
    })),
  );
  const colonnes = Object.keys(lignes[0]) as (keyof (typeof lignes)[number])[];
  return [
    colonnes.join(","),
    ...lignes.map((l) => colonnes.map((c) => echap(l[c])).join(",")),
  ].join("\n");
}

if (argv.includes("--ecrire")) {
  const cible = path.join(process.cwd(), CHEMIN_DOCUMENT);
  writeFileSync(cible, rendreEtatVerification(aujourdhui()), "utf8");
  console.log(`Écrit : ${CHEMIN_DOCUMENT}  (référentiel ${REFERENTIEL_VERSION})`);
} else if (argv.includes("--md")) {
  console.log(rendreEtatVerification(aujourdhui()));
} else if (argv.includes("--csv")) {
  console.log(csv());
} else {
  console.log(resumeConsole());
}
