// Authentification du serveur MCP distant — le secret est dans l'URL.
//
// Pourquoi cette forme plutôt qu'un jeton en en-tête : le dialogue
// « connecteur personnalisé » de Claude ne sait transporter que deux choses,
// une URL et — optionnellement — un client OAuth. Il n'offre aucun champ
// pour un en-tête `Authorization`. Entre « aucune authentification » et
// « monter un serveur d'autorisation OAuth », l'URL à capacité est le seul
// intermédiaire que le client sait effectivement présenter.
//
// Ce que ça vaut, dit franchement : le secret voyage dans l'URL. Il est donc
// exposé partout où une URL se retrouve — journaux de serveurs
// intermédiaires, historiques, copier-coller. C'est un cran en dessous d'un
// jeton porteur, et deux crans en dessous d'OAuth. C'est acceptable ici
// parce que le serveur est en lecture seule, borné à un établissement, sur
// des données fictives, et que la clé se révoque en changeant une variable
// d'environnement. Ça ne le serait pas sur un dossier réel multi-clients.
//
// Le jour où le serveur d'autorisation existera, c'est `resoudreScope` dans
// la route qui change — les gardes de transport et les outils, non.

import { createHash, timingSafeEqual } from "node:crypto";
import type { ScopeMcp } from "./tools";

/** Longueur minimale de la clé, en caractères. 32 caractères tirés au
 *  hasard en base64url valent ~192 bits : hors de portée d'un balayage. */
const LONGUEUR_MIN_CLE = 32;

export type ConfigAccesHttp = {
  cleAttendue: string;
  etablissementId: string;
  hotesAutorises: string[];
  originesAutorisees: string[];
};

/**
 * Lit la configuration d'accès dans l'environnement.
 *
 * Rend `null` — plutôt que de lever — quand la configuration est absente ou
 * insuffisante : le serveur doit alors se comporter comme une route qui
 * n'existe pas, pas comme un service en panne. Un 500 bavard confirmerait à
 * un visiteur qu'il y a quelque chose ici.
 *
 * Aucune valeur par défaut pour la clé : un secret par défaut est un secret
 * public.
 */
export function lireConfigAccesHttp(
  env: NodeJS.ProcessEnv = process.env,
): ConfigAccesHttp | null {
  const cleAttendue = env.MCP_CLE?.trim();
  const etablissementId = env.MCP_ETABLISSEMENT_ID?.trim();

  if (!cleAttendue || !etablissementId) return null;
  if (cleAttendue.length < LONGUEUR_MIN_CLE) {
    console.error(
      `[rojer] MCP_CLE fait moins de ${LONGUEUR_MIN_CLE} caractères : ` +
        "trop court pour être le seul secret d'un accès distant. Le serveur MCP reste fermé.",
    );
    return null;
  }

  // Hôtes : le domaine de déploiement doit être déclaré. Vercel expose le
  // sien, et on accepte localhost pour le développement.
  const declares =
    env.MCP_HOTES?.split(",")
      .map((h) => h.trim())
      .filter(Boolean) ?? [];
  const vercel = [env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.replace(/^https?:\/\//, "").split("/")[0]);

  const hotesAutorises = [
    ...new Set([...declares, ...vercel, "localhost", "127.0.0.1"]),
  ];

  return {
    cleAttendue,
    etablissementId,
    hotesAutorises,
    // Mêmes hôtes : une origine de navigateur légitime ne peut être que le
    // déploiement lui-même. Les clients MCP, eux, n'envoient pas d'`Origin`
    // et ne sont pas concernés par ce contrôle.
    originesAutorisees: hotesAutorises,
  };
}

/**
 * Compare deux clés sans fuite de temps.
 *
 * Une comparaison naïve (`a === b`) s'arrête au premier caractère qui
 * diffère : le temps de réponse renseigne alors sur le nombre de caractères
 * corrects, et permet de reconstituer le secret caractère par caractère. On
 * compare donc des empreintes de longueur fixe — ce qui règle du même coup
 * le cas des longueurs différentes, que `timingSafeEqual` refuse.
 */
export function clesEgales(fournie: string, attendue: string): boolean {
  const a = createHash("sha256").update(fournie).digest();
  const b = createHash("sha256").update(attendue).digest();
  return timingSafeEqual(a, b);
}

/**
 * Établit la portée d'une requête à partir du segment secret de son chemin.
 * Rend `null` dès que quoi que ce soit ne colle pas — c'est le refus par
 * défaut.
 */
export function resoudreScopeDepuisCle(
  cleFournie: string | undefined,
  config: ConfigAccesHttp | null,
): ScopeMcp | null {
  if (!config || !cleFournie) return null;
  if (!clesEgales(cleFournie, config.cleAttendue)) return null;
  return { etablissementId: config.etablissementId };
}
