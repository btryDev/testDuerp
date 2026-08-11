// Serveur MCP en transport HTTP — les gardes, avant les outils.
//
// Le pendant distant de `scripts/mcp-server.ts`. Les outils ne changent pas
// (c'est ce pour quoi `./tools` a été écrit sans rien savoir du transport) ;
// ce qui change, c'est d'où vient la portée. En stdio elle était fixée au
// démarrage par une variable d'environnement, sur une machine où seul le
// propriétaire pouvait lancer le processus. Ici n'importe qui peut poster
// sur l'URL : la portée doit donc être **établie par la requête elle-même**,
// et refusée par défaut.
//
// Ce module ne décide pas *comment* on authentifie. Il pose les gardes de
// transport et délègue l'identification à `resoudreScope`, fourni par la
// route. Aujourd'hui c'est un secret dans l'URL ; demain ce sera un jeton
// OAuth vérifié — le SDK expose `requireBearerAuth` pour ça, et seul
// `resoudreScope` changera. Le reste de ce fichier, non.
//
// Deux gardes de transport, avant qu'une ligne du protocole ne soit lue :
//
//   1. **Host et Origin.** Sans cette validation, une page web visitée par
//      l'utilisateur peut faire parler son navigateur au serveur (attaque
//      par reliaison DNS). Le SDK fournit les deux contrôles et se déclare
//      explicitement « validation-free » : c'est à nous de les poser devant.
//   2. **Portée.** Pas de portée, pas de serveur : on ne construit jamais
//      d'instance sans savoir quel établissement elle a le droit de lire.

import {
  createMcpHandler,
  hostHeaderValidationResponse,
  originValidationResponse,
  McpServer,
} from "@modelcontextprotocol/server";
import { OUTILS_MCP, type ScopeMcp } from "./tools";

export const NOM_SERVEUR = "rojer";
export const VERSION_SERVEUR = "0.1.0";

export type OptionsServeurHttp = {
  /**
   * Établit la portée d'une requête, ou rend `null` pour la refuser. C'est
   * le seul point d'authentification du serveur.
   */
  resoudreScope: (request: Request) => Promise<ScopeMcp | null>;
  /** Hôtes acceptés dans l'en-tête `Host` (le domaine de déploiement). */
  hotesAutorises: string[];
  /** Origines acceptées dans l'en-tête `Origin`. */
  originesAutorisees: string[];
  /**
   * Réponse rendue quand `resoudreScope` refuse. La forme du refus dépend du
   * mécanisme d'authentification, pas du transport : un secret dans l'URL se
   * refuse en `404` muet (cf. `./acces-http`), un jeton OAuth en `401`
   * désignant les métadonnées de ressource (cf. `./acces-oauth`).
   *
   * Par défaut, le `404` muet.
   */
  reponseRefus?: (request: Request) => Response;
};

/**
 * Construit le serveur servi pour **une** requête, avec sa portée déjà
 * résolue. Les outils reçoivent cette portée en argument : ils n'ont aucun
 * moyen d'en désigner une autre, et le client non plus — aucun schéma
 * d'entrée ne comporte d'identifiant d'établissement.
 */
function construireServeur(scope: ScopeMcp): McpServer {
  const server = new McpServer({ name: NOM_SERVEUR, version: VERSION_SERVEUR });

  for (const outil of OUTILS_MCP) {
    server.registerTool(
      outil.nom,
      {
        title: outil.titre,
        description: outil.description,
        inputSchema: outil.schema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (args: unknown) => {
        try {
          const texte = await outil.executer({ scope, now: new Date() }, args);
          return { content: [{ type: "text" as const, text: texte }] };
        } catch (erreur) {
          // Le client reçoit un message court ; le détail reste dans les
          // journaux. Une trace d'exécution renvoyée à un client distant
          // renseigne sur la structure interne et peut porter des fragments
          // de requête.
          console.error(
            `[${NOM_SERVEUR}] échec de l'outil ${outil.nom} :`,
            erreur instanceof Error ? erreur.stack ?? erreur.message : erreur,
          );
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `L'outil ${outil.nom} n'a pas pu répondre.`,
              },
            ],
          };
        }
      },
    );
  }

  return server;
}

/** Refus par défaut, volontairement muet — cf. `servir`. */
const refusMuet = () =>
  new Response(JSON.stringify({ error: "not_found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });

/**
 * Rend le gestionnaire `fetch` à monter dans une route Next.
 *
 * L'ordre des gardes est significatif : aucune des étapes suivantes ne doit
 * s'exécuter pour une requête qu'on aurait dû rejeter d'emblée.
 */
export function creerHandlerMcpHttp(options: OptionsServeurHttp) {
  // Une seule instance de handler, un serveur neuf par requête : deux
  // sessions concurrentes ne peuvent pas se voir.
  const handler = createMcpHandler(async (ctx) => {
    const scope = ctx.authInfo?.extra?.scope as ScopeMcp | undefined;
    if (!scope) {
      // Ne devrait pas arriver — `servir` refuse avant d'appeler le
      // handler. Filet de sécurité : jamais de serveur sans portée.
      throw new Error("portée absente pour une requête acceptée");
    }
    return construireServeur(scope);
  });

  async function servir(request: Request): Promise<Response> {
    const rejete =
      hostHeaderValidationResponse(request, options.hotesAutorises) ??
      originValidationResponse(request, options.originesAutorisees);
    if (rejete) return rejete;

    const scope = await options.resoudreScope(request);
    if (!scope) return (options.reponseRefus ?? refusMuet)(request);

    return handler.fetch(request, {
      authInfo: {
        // Le SDK exige la forme d'un jeton vérifié ; on la remplit avec ce
        // que l'on sait réellement. `extra.scope` est ce que lit le factory.
        token: "",
        clientId: NOM_SERVEUR,
        scopes: [],
        expiresAt: Math.floor(Date.now() / 1000) + 300,
        extra: { scope },
      },
    });
  }

  return { servir, fermer: () => handler.close() };
}
