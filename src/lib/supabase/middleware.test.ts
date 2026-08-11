import { describe, expect, it } from "vitest";
import { cheminPublic } from "./middleware";

/**
 * Chemins que le middleware laisse passer sans session Supabase.
 *
 * Cette liste est à double tranchant et mérite d'être tenue par des tests
 * plutôt que par la relecture :
 *
 *   - trop courte, elle casse ce qui doit répondre à des programmes. C'est
 *     ce qui est arrivé au serveur MCP : les routes existaient, les tests de
 *     route passaient, et en production le middleware renvoyait une
 *     redirection vers `/login` avant que la route ne soit atteinte. Le
 *     symptôme — un 307 là où le client attend du JSON-RPC — ne ressemblait
 *     pas à un problème d'authentification ;
 *   - trop longue, elle ouvre des pages qui devaient rester derrière la
 *     session.
 *
 * Les deux sens sont donc vérifiés ici.
 */

describe("chemins publics", () => {
  it("laisse passer les parcours d'entrée", () => {
    for (const p of ["/", "/login", "/signup", "/auth/callback"]) {
      expect(cheminPublic(p)).toBe(true);
    }
  });

  it("laisse passer les accès externes sans compte", () => {
    // ADR-006/007 : prestataire par lien magique, vérification de signature,
    // registre d'accessibilité consultable publiquement.
    for (const p of [
      "/acces/abc",
      "/verifier/sig_1",
      "/signe/sig_1",
      "/accessibilite/mon-erp",
      "/api/accessibilite/mon-erp/affiche",
    ]) {
      expect(cheminPublic(p)).toBe(true);
    }
  });

  it("laisse passer le serveur MCP, qui porte sa propre garde", () => {
    // Un client MCP est un programme : il n'a pas de session Supabase et
    // n'en aura jamais. S'il est redirigé, il ne voit pas une page de
    // connexion, il voit un protocole qui ne répond pas.
    expect(cheminPublic("/api/mcp")).toBe(true);
    expect(cheminPublic("/api/mcp/une-cle-quelconque")).toBe(true);
  });

  it("laisse passer la découverte OAuth, lue avant tout jeton", () => {
    expect(
      cheminPublic("/.well-known/oauth-protected-resource/api/mcp"),
    ).toBe(true);
  });

  it("garde le dossier derrière la session", () => {
    // Le sens inverse : ouvrir le MCP ne doit rien avoir ouvert d'autre.
    for (const p of [
      "/etablissements/etab_1",
      "/etablissements/etab_1/duerp",
      "/onboarding",
      "/api/etablissements/etab_1/controle-zip",
      "/api/duerp/import",
    ]) {
      expect(cheminPublic(p)).toBe(false);
    }
  });
});
