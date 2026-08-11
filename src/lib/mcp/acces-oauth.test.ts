import { describe, expect, it, vi } from "vitest";
import {
  extraireJetonPorteur,
  lireConfigOauthMcp,
  metadonneesRessourceProtegee,
  reponseAuthentificationRequise,
  resoudreScopeDepuisJeton,
  urlsRessource,
} from "./acces-oauth";

/**
 * Accès OAuth au serveur MCP distant (ADR-013).
 *
 * Ce qui est couvert ici, ce sont les façons de servir un client qu'on
 * aurait dû refuser, ou de refuser sans le dire comme il faut :
 *
 *   1. accepter un jeton qu'on n'a pas vérifié, ou dont le sujet est vide ;
 *   2. servir un utilisateur qui n'a pas d'établissement ;
 *   3. laisser une panne du vérificateur ouvrir la porte ;
 *   4. refuser sans l'en-tête qui déclenche le flux OAuth — auquel cas
 *      l'utilisateur voit une erreur au lieu d'un bouton « Connecter ».
 */

const SUB = "3f1c8a52-9d44-4b7e-8e21-0c6f5b2a7d19";
const ETAB = "etab_1";

const env = (over: Record<string, string | undefined> = {}) =>
  ({
    NEXT_PUBLIC_SUPABASE_URL: "https://abcdef.supabase.co",
    MCP_HOTES: "rojer.fr",
    ...over,
  }) as unknown as NodeJS.ProcessEnv;

const requete = (autorisation?: string) =>
  new Request("https://rojer.fr/api/mcp", {
    method: "POST",
    headers: autorisation ? { authorization: autorisation } : {},
  });

const deps = (over: Partial<Parameters<typeof resoudreScopeDepuisJeton>[1]> = {}) => ({
  verifier: vi.fn(async () => ({ sub: SUB })),
  chercherEtablissement: vi.fn(async () => ETAB),
  ...over,
});

describe("lireConfigOauthMcp", () => {
  it("refuse de se configurer sans projet Supabase", () => {
    expect(
      lireConfigOauthMcp(env({ NEXT_PUBLIC_SUPABASE_URL: undefined })),
    ).toBeNull();
  });

  it("désigne l'émetteur Supabase comme serveur d'autorisation", () => {
    expect(lireConfigOauthMcp(env())?.issuer).toBe(
      "https://abcdef.supabase.co/auth/v1",
    );
  });

  it("déclare l'origine publique en https", () => {
    expect(lireConfigOauthMcp(env())?.origineDeclaree).toBe("https://rojer.fr");
  });

  it("tolère une URL Supabase terminée par une barre oblique", () => {
    const config = lireConfigOauthMcp(
      env({ NEXT_PUBLIC_SUPABASE_URL: "https://abcdef.supabase.co/" }),
    );
    expect(config?.issuer).toBe("https://abcdef.supabase.co/auth/v1");
  });

  it("ne déclare aucune origine quand seule la boucle locale est connue", () => {
    // Le port de développement n'est pas déclaré et varie : l'origine sera
    // lue sur la requête, seul endroit où il est connu.
    expect(lireConfigOauthMcp(env({ MCP_HOTES: undefined }))?.origineDeclaree)
      .toBeNull();
  });
});

describe("urlsRessource", () => {
  it("construit des URLs absolues depuis l'origine déclarée", () => {
    // RFC 9728 : `resource` est une URL, pas un chemin, et doit correspondre
    // exactement à ce que le client a saisi.
    expect(urlsRessource(lireConfigOauthMcp(env()), requete())).toEqual({
      ressource: "https://rojer.fr/api/mcp",
      urlMetadonnees:
        "https://rojer.fr/.well-known/oauth-protected-resource/api/mcp",
    });
  });

  it("préfère l'origine déclarée à l'hôte de la requête", () => {
    // Derrière un proxy, l'hôte de la requête est celui du dernier saut —
    // pas celui que le client a saisi.
    const interne = new Request("http://10.0.0.4:8080/api/mcp", {
      method: "POST",
      headers: { host: "10.0.0.4:8080" },
    });
    expect(urlsRessource(lireConfigOauthMcp(env()), interne).ressource).toBe(
      "https://rojer.fr/api/mcp",
    );
  });

  it("conserve le port en développement, faute d'origine déclarée", () => {
    // Le cas qui casserait la correspondance exacte : sans le port, le
    // client refuserait le document.
    const config = lireConfigOauthMcp(env({ MCP_HOTES: undefined }));
    const locale = new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { host: "localhost:3000" },
    });
    expect(urlsRessource(config, locale).ressource).toBe(
      "http://localhost:3000/api/mcp",
    );
  });

  it("honore les en-têtes de transfert quand rien n'est déclaré", () => {
    const config = lireConfigOauthMcp(env({ MCP_HOTES: undefined }));
    const derriereProxy = new Request("http://10.0.0.4/api/mcp", {
      method: "POST",
      headers: {
        host: "10.0.0.4",
        "x-forwarded-host": "rojer.fr",
        "x-forwarded-proto": "https",
      },
    });
    expect(urlsRessource(config, derriereProxy).ressource).toBe(
      "https://rojer.fr/api/mcp",
    );
  });
});

describe("extraireJetonPorteur", () => {
  it("lit un jeton porteur", () => {
    expect(extraireJetonPorteur(requete("Bearer abc.def.ghi"))).toBe(
      "abc.def.ghi",
    );
  });

  it("accepte le schéma quelle que soit la casse", () => {
    // RFC 6750 : le schéma est insensible à la casse.
    expect(extraireJetonPorteur(requete("bearer abc"))).toBe("abc");
    expect(extraireJetonPorteur(requete("BEARER abc"))).toBe("abc");
  });

  it("ignore un autre schéma d'autorisation", () => {
    expect(extraireJetonPorteur(requete("Basic abc"))).toBeUndefined();
  });

  it("ignore un en-tête sans jeton", () => {
    expect(extraireJetonPorteur(requete("Bearer"))).toBeUndefined();
    expect(extraireJetonPorteur(requete("Bearer   "))).toBeUndefined();
  });

  it("ignore l'absence d'en-tête", () => {
    expect(extraireJetonPorteur(requete())).toBeUndefined();
  });

  it("ne lit jamais le jeton dans l'URL", () => {
    // La spécification MCP interdit le jeton en paramètre de requête.
    // L'accepter « pour dépanner » recréerait le défaut que la bascule OAuth
    // corrige justement.
    const avecParametre = new Request(
      "https://rojer.fr/api/mcp?access_token=abc",
      { method: "POST" },
    );
    expect(extraireJetonPorteur(avecParametre)).toBeUndefined();
  });
});

describe("resoudreScopeDepuisJeton", () => {
  it("donne la portée de l'établissement du porteur", async () => {
    const d = deps();
    await expect(
      resoudreScopeDepuisJeton(requete("Bearer jeton"), d),
    ).resolves.toEqual({ etablissementId: ETAB });
    expect(d.chercherEtablissement).toHaveBeenCalledWith(SUB);
  });

  it("refuse une requête sans jeton, sans rien vérifier", async () => {
    const d = deps();
    await expect(resoudreScopeDepuisJeton(requete(), d)).resolves.toBeNull();
    expect(d.verifier).not.toHaveBeenCalled();
  });

  it("refuse un jeton que le vérificateur rejette", async () => {
    const d = deps({ verifier: vi.fn(async () => null) });
    await expect(
      resoudreScopeDepuisJeton(requete("Bearer faux"), d),
    ).resolves.toBeNull();
  });

  it("refuse un jeton sans sujet", async () => {
    // Un jeton valide mais sans `sub` n'identifie personne : il ne doit
    // surtout pas retomber sur un établissement par défaut.
    const d = deps({ verifier: vi.fn(async () => ({})) });
    await expect(
      resoudreScopeDepuisJeton(requete("Bearer jeton"), d),
    ).resolves.toBeNull();
  });

  it("refuse un sujet qui n'est pas une chaîne", async () => {
    const d = deps({ verifier: vi.fn(async () => ({ sub: 42 })) });
    await expect(
      resoudreScopeDepuisJeton(requete("Bearer jeton"), d),
    ).resolves.toBeNull();
  });

  it("refuse un utilisateur sans établissement", async () => {
    // Compte créé mais onboarding non terminé : il n'y a rien à lire, et
    // certainement pas l'établissement de quelqu'un d'autre.
    const d = deps({ chercherEtablissement: vi.fn(async () => null) });
    await expect(
      resoudreScopeDepuisJeton(requete("Bearer jeton"), d),
    ).resolves.toBeNull();
  });

  it("refuse quand le vérificateur tombe en panne", async () => {
    // JWKS injoignable : de l'extérieur c'est un refus, pas un 500. Une
    // panne ne doit jamais ouvrir la porte.
    const d = deps({
      verifier: vi.fn(async () => {
        throw new Error("JWKS injoignable");
      }),
    });
    await expect(
      resoudreScopeDepuisJeton(requete("Bearer jeton"), d),
    ).resolves.toBeNull();
  });
});

describe("reponseAuthentificationRequise", () => {
  const config = lireConfigOauthMcp(env())!;

  it("répond 401 — le seul statut qui déclenche le flux OAuth", () => {
    // Un 200 portant une erreur d'outil laisserait l'utilisateur devant un
    // message d'échec, sans jamais lui proposer de se connecter.
    expect(reponseAuthentificationRequise(config, requete()).status).toBe(401);
  });

  it("désigne les métadonnées de ressource dans WWW-Authenticate", () => {
    const entete = reponseAuthentificationRequise(
      config,
      requete(),
    ).headers.get("www-authenticate");
    expect(entete).toContain("Bearer");
    expect(entete).toContain(
      'resource_metadata="https://rojer.fr/.well-known/oauth-protected-resource/api/mcp"',
    );
  });

  it("répond 401 même sans configuration, sans en-tête inventé", () => {
    // Déploiement mal configuré : on refuse, mais on ne désigne pas un
    // document de métadonnées dont on ne connaît pas l'URL.
    const reponse = reponseAuthentificationRequise(null, requete());
    expect(reponse.status).toBe(401);
    expect(reponse.headers.get("www-authenticate")).toBeNull();
  });
});

describe("metadonneesRessourceProtegee", () => {
  const config = lireConfigOauthMcp(env())!;

  it("annonce la ressource et son unique serveur d'autorisation", () => {
    // Une seule entrée : les clients ne garantissent pas d'essayer les
    // suivantes, la première doit être la bonne.
    expect(metadonneesRessourceProtegee(config, requete())).toEqual({
      resource: "https://rojer.fr/api/mcp",
      authorization_servers: ["https://abcdef.supabase.co/auth/v1"],
      bearer_methods_supported: ["header"],
      scopes_supported: ["openid", "email"],
    });
  });
});
