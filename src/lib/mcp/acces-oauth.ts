// Authentification OAuth 2.1 du serveur MCP distant — cf. ADR-013.
//
// Le pendant de `./acces-http`, dont il a vocation à prendre la place. Là où
// l'URL capacitaire portait un secret partagé figé dans l'environnement, ici
// c'est le porteur du jeton qui décide de la portée : chaque dirigeant lit
// son établissement, sans configuration par utilisateur.
//
// Supabase Auth tient le rôle de serveur d'autorisation (capacité OAuth 2.1,
// beta publique). Ce module n'émet rien et ne gère aucun compte : il vérifie
// un jeton et en déduit une portée. Conformément à ADR-005, il n'existe pas
// de second référentiel d'identité — le `sub` du jeton *est* l'UUID Supabase
// stocké dans `Entreprise.userId`.
//
// La chaîne de résolution ne comporte aucun choix laissé au client :
//
//     jeton.sub → Entreprise.userId → Etablissement.id
//
// `Entreprise.userId` est unique et l'invariant « 1 entreprise = 1
// établissement » est porté par la base : il n'y a qu'un chemin, donc rien à
// négocier et aucun identifiant d'établissement à accepter en entrée.
//
// Ce qui n'est **pas** vérifié ici, et pourquoi : l'audience. Les jetons
// Supabase portent `aud: "authenticated"`, pas l'URL du serveur MCP. Un
// contrôle d'audience strict rejetterait donc tous les jetons légitimes. Cf.
// ADR-013 point 8 — un Custom Access Token Hook permettrait de le rétablir.

import { lireHotePublic, lireHotesAutorises } from "./hotes";
import type { ScopeMcp } from "./tools";

/** Chemin du point d'entrée MCP, sous lequel les clients postent. */
export const CHEMIN_MCP = "/api/mcp";

/**
 * Chemin des métadonnées de ressource protégée (RFC 9728).
 *
 * La forme est imposée : le suffixe est le chemin de la ressource, ajouté
 * *après* le segment `.well-known`. Un client qui ne trouve pas l'en-tête
 * `WWW-Authenticate` sonde cette URL avant la racine.
 */
export const CHEMIN_METADONNEES_RESSOURCE =
  `/.well-known/oauth-protected-resource${CHEMIN_MCP}` as const;

export type ConfigOauthMcp = {
  /** Émetteur Supabase — `https://<ref>.supabase.co/auth/v1`. */
  issuer: string;
  /**
   * Origine publique déclarée (`https://rojer.fr`), ou `null` si aucune ne
   * l'est. Quand elle est déclarée, elle prime : derrière un proxy, c'est la
   * seule source fiable de l'URL vue par le client.
   */
  origineDeclaree: string | null;
  hotesAutorises: string[];
  originesAutorisees: string[];
};

/**
 * Lit la configuration OAuth dans l'environnement.
 *
 * Rend `null` — plutôt que de lever — quand elle est incomplète : comme pour
 * l'accès par clé, un déploiement mal configuré doit se comporter comme une
 * route fermée, pas comme un service en panne.
 */
export function lireConfigOauthMcp(
  env: NodeJS.ProcessEnv = process.env,
): ConfigOauthMcp | null {
  const urlSupabase = env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!urlSupabase) return null;

  const hote = lireHotePublic(env);
  const estLocal =
    !hote || hote.startsWith("localhost") || hote.startsWith("127.0.0.1");

  const hotesAutorises = lireHotesAutorises(env);

  return {
    issuer: `${urlSupabase}/auth/v1`,
    // La boucle locale n'est pas une origine publique : son port varie et
    // n'est pas déclaré ici. On la laisse à `origineEffective`, qui la lira
    // sur la requête — seul endroit où le port est connu.
    origineDeclaree: hote && !estLocal ? `https://${hote}` : null,
    hotesAutorises,
    originesAutorisees: hotesAutorises,
  };
}

/**
 * Origine sous laquelle le client a effectivement joint le serveur.
 *
 * L'origine déclarée prime : derrière un proxy, l'hôte de la requête est
 * celui du dernier saut, pas celui que le client a saisi. À défaut, on lit
 * les en-têtes de transfert puis, en dernier recours, l'URL de la requête —
 * c'est ce qui rend le développement local possible sans rien déclarer.
 */
export function origineEffective(
  config: ConfigOauthMcp | null,
  request: Request,
): string {
  if (config?.origineDeclaree) return config.origineDeclaree;

  const hote =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const schema =
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "");

  return hote ? `${schema}://${hote}` : new URL(request.url).origin;
}

/** URLs RFC 9728 de la ressource, pour l'origine effective de la requête. */
export function urlsRessource(
  config: ConfigOauthMcp | null,
  request: Request,
): { ressource: string; urlMetadonnees: string } {
  const origine = origineEffective(config, request);
  return {
    ressource: `${origine}${CHEMIN_MCP}`,
    urlMetadonnees: `${origine}${CHEMIN_METADONNEES_RESSOURCE}`,
  };
}

/**
 * Extrait le jeton porteur d'une requête.
 *
 * Seul le schéma `Bearer` est accepté, insensible à la casse comme l'exige
 * la RFC 6750. Un jeton passé en paramètre d'URL est **ignoré
 * volontairement** : la spécification MCP l'interdit explicitement, et
 * l'accepter « pour dépanner » recréerait le défaut que cette bascule
 * corrige.
 */
export function extraireJetonPorteur(request: Request): string | undefined {
  const brut = request.headers.get("authorization");
  if (!brut) return undefined;

  const [schema, ...reste] = brut.trim().split(/\s+/);
  if (schema?.toLowerCase() !== "bearer") return undefined;

  const jeton = reste.join(" ").trim();
  return jeton.length > 0 ? jeton : undefined;
}

/** Ce que le vérificateur doit rendre : les revendications, ou `null`. */
export type RevendicationsJeton = { sub?: unknown };

/**
 * Vérifie la signature et l'expiration d'un jeton, et rend ses
 * revendications. Injecté pour que la résolution de portée soit testable
 * sans réseau ni projet Supabase.
 */
export type VerificateurJeton = (
  jeton: string,
) => Promise<RevendicationsJeton | null>;

/** Recherche de l'établissement d'un utilisateur, injectée de même. */
export type ChercheurEtablissement = (
  userId: string,
) => Promise<string | null>;

/**
 * Établit la portée d'une requête à partir de son jeton porteur.
 *
 * Rend `null` dès que quoi que ce soit ne colle pas — refus par défaut. Les
 * quatre causes de refus (pas de jeton, jeton invalide, `sub` absent,
 * utilisateur sans établissement) sont volontairement indistinguables de
 * l'extérieur : elles produisent toutes le même `401`.
 */
export async function resoudreScopeDepuisJeton(
  request: Request,
  deps: {
    verifier: VerificateurJeton;
    chercherEtablissement: ChercheurEtablissement;
  },
): Promise<ScopeMcp | null> {
  const jeton = extraireJetonPorteur(request);
  if (!jeton) return null;

  let revendications: RevendicationsJeton | null;
  try {
    revendications = await deps.verifier(jeton);
  } catch {
    // Un vérificateur qui lève (réseau indisponible, JWKS injoignable) ne
    // doit pas produire un 500 : de l'extérieur, c'est un refus.
    return null;
  }

  const sub = revendications?.sub;
  if (typeof sub !== "string" || sub.length === 0) return null;

  const etablissementId = await deps.chercherEtablissement(sub);
  if (!etablissementId) return null;

  return { etablissementId };
}

/**
 * Construit la réponse de refus.
 *
 * C'est cette réponse qui déclenche le flux OAuth côté client : un `401`
 * porteur d'un en-tête `WWW-Authenticate` désignant les métadonnées de la
 * ressource. Une erreur d'outil renvoyée dans un `200` ne le déclencherait
 * pas — le client l'afficherait comme un échec et ne proposerait jamais de
 * se connecter.
 *
 * Le paramètre `scope` est omis : le serveur est en lecture seule et ne
 * distingue pas de portées applicatives. À défaut, le client demandera les
 * scopes annoncés par les métadonnées.
 */
export function reponseAuthentificationRequise(
  config: ConfigOauthMcp | null,
  request: Request,
): Response {
  const entetes: Record<string, string> = {
    "content-type": "application/json",
  };

  if (config) {
    const { urlMetadonnees } = urlsRessource(config, request);
    entetes["www-authenticate"] =
      `Bearer error="invalid_token", ` +
      `error_description="Jeton absent ou invalide", ` +
      `resource_metadata="${urlMetadonnees}"`;
  }

  return new Response(
    JSON.stringify({
      error: "invalid_token",
      error_description: "Authentification requise pour ce serveur MCP.",
    }),
    { status: 401, headers: entetes },
  );
}

/**
 * Document de métadonnées de ressource protégée (RFC 9728).
 *
 * `resource` doit correspondre **exactement** à l'URL que l'utilisateur
 * saisit côté client, chemin compris : un client qui constate un écart
 * refuse le document. `authorization_servers` ne comporte qu'une entrée —
 * les clients ne garantissent pas d'essayer les suivantes.
 */
export function metadonneesRessourceProtegee(
  config: ConfigOauthMcp,
  request: Request,
) {
  return {
    resource: urlsRessource(config, request).ressource,
    authorization_servers: [config.issuer],
    bearer_methods_supported: ["header"],
    scopes_supported: ["openid", "email"],
  };
}
