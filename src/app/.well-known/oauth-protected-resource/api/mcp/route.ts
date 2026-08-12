// Métadonnées de ressource protégée (RFC 9728) — cf. ADR-013.
//
// C'est le document qui dit à un client MCP *où* aller s'authentifier. Il
// est atteint de deux façons : par l'en-tête `WWW-Authenticate` du 401 (le
// chemin nominal), ou par sondage de cette URL quand le client n'a pas
// trouvé l'en-tête. Le chemin est imposé par la RFC : le segment
// `.well-known` d'abord, le chemin de la ressource ensuite — d'où
// l'arborescence `oauth-protected-resource/api/mcp` qui reflète `/api/mcp`.
//
// Le document est public et doit le rester : un client le lit *avant*
// d'avoir le moindre jeton. Il ne contient donc rien de secret — l'URL de la
// ressource et celle du serveur d'autorisation, toutes deux déjà connues de
// quiconque tente de se connecter.

import {
  lireConfigOauthMcp,
  metadonneesRessourceProtegee,
} from "@/lib/mcp/acces-oauth";

// Les métadonnées dépendent de l'hôte de déploiement, lu dans
// l'environnement : rien à figer au build.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const config = lireConfigOauthMcp();

  // Sans configuration, le serveur MCP ne sert personne : annoncer des
  // métadonnées le désignerait comme joignable et enverrait les clients
  // vers un serveur d'autorisation qu'on ne saurait pas honorer.
  if (!config) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const document = metadonneesRessourceProtegee(config, request);

  return new Response(JSON.stringify(document), {
    headers: {
      "content-type": "application/json",
      // Le document est stable et public. Le cache court évite de le
      // recalculer à chaque tentative de connexion sans figer une URL de
      // déploiement qui changerait.
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      // Certains clients lisent ce document depuis un contexte navigateur
      // (inspecteurs, interfaces web). Il est public : l'ouvrir ne révèle
      // rien de plus que ce qu'un client obtient en se connectant.
      "access-control-allow-origin": "*",
    },
  });
}

/** Préflight CORS, pour les clients qui lisent le document depuis un navigateur. */
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "authorization, content-type",
      "access-control-max-age": "86400",
    },
  });
}
