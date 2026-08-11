// Hôtes et origines acceptés par le serveur MCP distant.
//
// Extrait de `./acces-http` pour être partagé avec `./acces-oauth` : la
// validation `Host`/`Origin` est une garde de transport, elle ne dépend pas
// de la façon dont on authentifie derrière.
//
// Pourquoi cette garde existe : sans validation de `Host`, une page web
// visitée par l'utilisateur peut faire parler son navigateur au serveur
// (attaque par reliaison DNS). Le SDK MCP se déclare explicitement
// « validation-free » sur ce point — c'est à nous de la poser devant.

/** Retire le schéma et le chemin d'une URL pour n'en garder que l'hôte. */
function versHote(valeur: string): string {
  return valeur.replace(/^https?:\/\//, "").split("/")[0];
}

/**
 * Rend la liste des hôtes autorisés : ceux déclarés à la main, plus le
 * domaine du déploiement Vercel, plus la boucle locale pour le
 * développement.
 */
export function lireHotesAutorises(env: NodeJS.ProcessEnv): string[] {
  const declares =
    env.MCP_HOTES?.split(",")
      .map((h) => h.trim())
      .filter(Boolean)
      .map(versHote) ?? [];

  const vercel = [env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL]
    .filter((v): v is string => Boolean(v))
    .map(versHote);

  return [...new Set([...declares, ...vercel, "localhost", "127.0.0.1"])];
}

/**
 * Hôte public du déploiement — celui sous lequel les clients distants
 * atteignent le serveur. Sert à construire l'identifiant de ressource
 * (RFC 9728), qui doit être une URL absolue et non un chemin.
 *
 * On prend le premier hôte déclaré, en écartant la boucle locale : un
 * identifiant de ressource en `localhost` n'a de sens qu'en développement,
 * et seulement à défaut d'autre chose.
 */
export function lireHotePublic(env: NodeJS.ProcessEnv): string | null {
  const hotes = lireHotesAutorises(env);
  const distant = hotes.find((h) => h !== "localhost" && h !== "127.0.0.1");
  return distant ?? hotes[0] ?? null;
}
