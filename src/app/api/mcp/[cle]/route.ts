// Point d'entrée HTTP du serveur MCP.
//
// Le segment `[cle]` du chemin est le secret d'accès : c'est lui qui décide
// si la requête est servie, et pour quel établissement (cf.
// `@/lib/mcp/acces-http` pour ce que vaut cette forme d'authentification et
// pourquoi elle a été retenue).
//
// Le protocole utilise POST pour les échanges, GET pour les flux d'événements
// et DELETE pour la fin de session : les trois pointent sur le même
// gestionnaire, qui route lui-même selon la méthode.

import {
  lireConfigAccesHttp,
  resoudreScopeDepuisCle,
} from "@/lib/mcp/acces-http";
import { creerHandlerMcpHttp } from "@/lib/mcp/http";

// Le serveur lit la base à chaque appel d'outil : rien à mettre en cache, et
// une réponse mise en cache serait ici une fuite entre requêtes.
export const dynamic = "force-dynamic";

const config = lireConfigAccesHttp();

const handler = creerHandlerMcpHttp({
  hotesAutorises: config?.hotesAutorises ?? [],
  originesAutorisees: config?.originesAutorisees ?? [],
  resoudreScope: async (request) => {
    // La clé est relue depuis l'URL plutôt que prise dans les paramètres de
    // route : le gestionnaire du SDK ne reçoit que la `Request`, et faire
    // transiter le secret par une variable partagée entre requêtes serait
    // une source d'erreur autrement plus grave qu'un `split`.
    const segments = new URL(request.url).pathname.split("/").filter(Boolean);
    const i = segments.indexOf("mcp");
    const cle = i >= 0 ? segments[i + 1] : undefined;
    return resoudreScopeDepuisCle(cle ? decodeURIComponent(cle) : undefined, config);
  },
});

export const POST = (request: Request) => handler.servir(request);
export const GET = (request: Request) => handler.servir(request);
export const DELETE = (request: Request) => handler.servir(request);
