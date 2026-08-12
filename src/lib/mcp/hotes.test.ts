import { describe, expect, it } from "vitest";
import { lireHotePublic, lireHotesAutorises } from "./hotes";

/**
 * Liste des hôtes acceptés — une garde de sécurité, pas une commodité.
 *
 * Elle sert deux choses qu'il ne faut pas confondre :
 *
 *   - `lireHotesAutorises` alimente la validation `Host`/`Origin`, qui
 *     protège de la reliaison DNS. Trop permissive, elle laisse une page web
 *     visitée par l'utilisateur faire parler son navigateur au serveur ;
 *   - `lireHotePublic` construit l'identifiant de ressource (RFC 9728), qui
 *     doit désigner l'URL que le client a réellement saisie. S'y glisser un
 *     `localhost` en production enverrait les clients découvrir un serveur
 *     d'autorisation à une adresse qui n'existe pas pour eux.
 */

const env = (over: Record<string, string | undefined> = {}) =>
  over as unknown as NodeJS.ProcessEnv;

describe("lireHotesAutorises", () => {
  it("accepte toujours la boucle locale, pour le développement", () => {
    expect(lireHotesAutorises(env())).toEqual(
      expect.arrayContaining(["localhost", "127.0.0.1"]),
    );
  });

  it("retient les hôtes déclarés à la main", () => {
    expect(lireHotesAutorises(env({ MCP_HOTES: "rojer.fr, mcp.rojer.fr" }))).toEqual(
      expect.arrayContaining(["rojer.fr", "mcp.rojer.fr"]),
    );
  });

  it("réduit une URL déclarée à son seul hôte", () => {
    // La validation compare des noms d'hôte : un schéma ou un chemin laissé
    // dans la liste ne correspondrait jamais, et fermerait le serveur au
    // domaine qu'on croyait avoir ouvert.
    const hotes = lireHotesAutorises(env({ MCP_HOTES: "https://rojer.fr/api" }));
    expect(hotes).toContain("rojer.fr");
    expect(hotes).not.toContain("https://rojer.fr/api");
  });

  it("ajoute le domaine du déploiement Vercel", () => {
    const hotes = lireHotesAutorises(
      env({
        VERCEL_URL: "test-duerp-abc.vercel.app",
        VERCEL_PROJECT_PRODUCTION_URL: "test-duerp.vercel.app",
      }),
    );
    expect(hotes).toEqual(
      expect.arrayContaining([
        "test-duerp-abc.vercel.app",
        "test-duerp.vercel.app",
      ]),
    );
  });

  it("ne répète pas un hôte déclaré deux fois", () => {
    const hotes = lireHotesAutorises(
      env({ MCP_HOTES: "rojer.fr,rojer.fr", VERCEL_URL: "rojer.fr" }),
    );
    expect(hotes.filter((h) => h === "rojer.fr")).toHaveLength(1);
  });

  it("ignore les entrées vides d'une liste mal ponctuée", () => {
    const hotes = lireHotesAutorises(env({ MCP_HOTES: "rojer.fr,,  ,mcp.rojer.fr" }));
    expect(hotes).not.toContain("");
    expect(hotes).toEqual(expect.arrayContaining(["rojer.fr", "mcp.rojer.fr"]));
  });
});

describe("lireHotePublic", () => {
  it("écarte la boucle locale au profit d'un hôte joignable", () => {
    expect(lireHotePublic(env({ MCP_HOTES: "rojer.fr" }))).toBe("rojer.fr");
  });

  it("préfère l'hôte déclaré à celui de Vercel", () => {
    // Un domaine propre l'emporte sur l'URL de déploiement : c'est celui que
    // l'utilisateur saisit, donc celui que l'identifiant de ressource doit
    // annoncer.
    expect(
      lireHotePublic(
        env({ MCP_HOTES: "rojer.fr", VERCEL_URL: "test-duerp-abc.vercel.app" }),
      ),
    ).toBe("rojer.fr");
  });

  it("retombe sur la boucle locale seulement à défaut de tout le reste", () => {
    expect(lireHotePublic(env())).toBe("localhost");
  });
});
