#!/usr/bin/env tsx
//
// Test de bout en bout du serveur MCP distant, **en local** — cf. ADR-013.
//
// Ce script existe parce que la moitié « serveur de ressource » du dispositif
// est vérifiable sans rien changer chez Supabase, et qu'il serait dommage de
// la découvrir en production.
//
// Le point qui rend ça possible : `getClaims` vérifie *un jeton Supabase*, sans
// se soucier du flux qui l'a produit. Un jeton de session ordinaire — celui
// qu'obtient l'application quand un dirigeant se connecte — porte le même
// `sub` que porterait un jeton délivré par le flux OAuth. La chaîne
// `sub → Entreprise.userId → Etablissement` est donc exercée à l'identique.
//
// Ce que ce script valide :
//   - le refus sans jeton, avec l'en-tête qui déclenche le flux OAuth ;
//   - le refus avec un jeton invalide ;
//   - l'acceptation avec un jeton légitime, et la portée effectivement servie.
//
// Ce qu'il ne valide **pas** : le flux d'autorisation lui-même (consentement,
// échange de code, rafraîchissement). Il faut pour cela activer le serveur
// OAuth du projet Supabase et un client MCP réel — cf. ADR-013, plan
// d'implémentation, étapes 4 à 6.
//
// Usage :
//   MCP_TEST_EMAIL=… MCP_TEST_PASSWORD=… pnpm mcp:test
//   MCP_TEST_JETON=<access_token> pnpm mcp:test      # si vous avez déjà un jeton
//
// L'URL testée est celle du serveur de développement, surchargeable par
// MCP_TEST_URL.

import { createClient } from "@supabase/supabase-js";

const URL_BASE = process.env.MCP_TEST_URL ?? "http://localhost:3000";
const URL_MCP = `${URL_BASE}/api/mcp`;

const vert = (s: string) => `\x1b[32m${s}\x1b[0m`;
const rouge = (s: string) => `\x1b[31m${s}\x1b[0m`;
const gris = (s: string) => `\x1b[90m${s}\x1b[0m`;

let echecs = 0;

function verifier(intitule: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ${vert("✓")} ${intitule}`);
  } else {
    echecs += 1;
    console.log(`  ${rouge("✗")} ${intitule}`);
    if (detail) console.log(`    ${gris(detail)}`);
  }
}

/** Appelle le serveur MCP. Le protocole exige les deux types acceptés. */
async function appeler(
  corps: unknown,
  jeton?: string,
): Promise<{ statut: number; entetes: Headers; texte: string }> {
  const reponse = await fetch(URL_MCP, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(jeton ? { authorization: `Bearer ${jeton}` } : {}),
    },
    body: JSON.stringify(corps),
  });

  return {
    statut: reponse.status,
    entetes: reponse.headers,
    texte: await reponse.text(),
  };
}

const INITIALIZE = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2026-07-28",
    capabilities: {},
    clientInfo: { name: "rojer-test-local", version: "0.1.0" },
  },
};

/**
 * Obtient un jeton légitime : soit fourni tel quel, soit par connexion
 * email/mot de passe au projet Supabase.
 */
async function obtenirJeton(): Promise<string | null> {
  const fourni = process.env.MCP_TEST_JETON?.trim();
  if (fourni) return fourni;

  const email = process.env.MCP_TEST_EMAIL?.trim();
  const motDePasse = process.env.MCP_TEST_PASSWORD;
  if (!email || !motDePasse) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !cle) {
    console.error(rouge("NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY absents."));
    return null;
  }

  const supabase = createClient(url, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error || !data.session) {
    console.error(rouge(`Connexion refusée : ${error?.message ?? "sans session"}`));
    return null;
  }

  return data.session.access_token;
}

async function main(): Promise<void> {
  console.log(`\nServeur testé : ${URL_MCP}\n`);

  // --- Refus sans jeton ------------------------------------------------
  console.log("Sans jeton");
  const anonyme = await appeler(INITIALIZE);
  verifier(
    "répond 401",
    anonyme.statut === 401,
    `statut reçu : ${anonyme.statut}`,
  );

  const defi = anonyme.entetes.get("www-authenticate") ?? "";
  verifier("porte un défi Bearer", defi.toLowerCase().startsWith("bearer"), defi);
  verifier(
    "désigne les métadonnées de ressource",
    defi.includes("resource_metadata="),
    defi,
  );

  // --- Métadonnées de ressource ---------------------------------------
  console.log("\nMétadonnées de ressource (RFC 9728)");
  const urlMeta = defi.match(/resource_metadata="([^"]+)"/)?.[1];
  if (!urlMeta) {
    verifier("URL extractible du défi", false, defi);
  } else {
    const meta = await fetch(urlMeta);
    const doc = (await meta.json().catch(() => null)) as {
      resource?: string;
      authorization_servers?: string[];
    } | null;

    verifier("document servi", meta.ok, `statut : ${meta.status}`);
    verifier(
      "`resource` correspond exactement à l'URL du serveur",
      doc?.resource === URL_MCP,
      `attendu ${URL_MCP}, reçu ${doc?.resource}`,
    );
    verifier(
      "un serveur d'autorisation est désigné",
      Boolean(doc?.authorization_servers?.[0]),
      JSON.stringify(doc?.authorization_servers),
    );
  }

  // --- Refus avec un jeton invalide ------------------------------------
  console.log("\nAvec un jeton invalide");
  const bidon = await appeler(INITIALIZE, "pas.un.jeton");
  verifier(
    "répond 401",
    bidon.statut === 401,
    `statut reçu : ${bidon.statut}`,
  );

  // --- Acceptation avec un jeton légitime ------------------------------
  console.log("\nAvec un jeton légitime");
  const jeton = await obtenirJeton();

  if (!jeton) {
    console.log(
      `  ${gris("ignoré — renseignez MCP_TEST_EMAIL/MCP_TEST_PASSWORD ou MCP_TEST_JETON")}`,
    );
  } else {
    const ouvert = await appeler(INITIALIZE, jeton);
    verifier(
      "la session s'ouvre",
      ouvert.statut === 200,
      `statut ${ouvert.statut} — ${ouvert.texte.slice(0, 200)}`,
    );

    const outils = await appeler(
      { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
      jeton,
    );
    const noms = [...outils.texte.matchAll(/"name":"([a-z0-9_]+)"/gi)].map(
      (m) => m[1],
    );
    verifier(
      "les outils sont annoncés",
      noms.length > 0,
      outils.texte.slice(0, 200),
    );
    if (noms.length > 0) console.log(`    ${gris(noms.join(", "))}`);
  }

  // --- Verdict ---------------------------------------------------------
  console.log(
    echecs === 0
      ? `\n${vert("Tout est passé.")}\n`
      : `\n${rouge(`${echecs} vérification(s) en échec.`)}\n`,
  );
  process.exit(echecs === 0 ? 0 : 1);
}

main().catch((erreur) => {
  console.error(
    rouge(
      `\nLe test n'a pas pu se dérouler : ${
        erreur instanceof Error ? erreur.message : String(erreur)
      }`,
    ),
  );
  console.error(gris("Le serveur de développement tourne-t-il ?\n"));
  process.exit(1);
});
