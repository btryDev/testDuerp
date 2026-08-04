import { prisma } from "@/lib/prisma";
import type { AccessToken } from "@prisma/client";
import { hashToken } from "./token";

/**
 * Vérifie un token clair venu d'une URL publique `/acces/[token]`.
 * Retourne l'entité `AccessToken` si le token est valide (non expiré, non
 * révoqué, non consommé pour les scopes à usage unique), ou une raison
 * d'échec exploitable côté UI.
 */

export type TokenValide = { ok: true; token: AccessToken };
export type TokenInvalide =
  | { ok: false; raison: "inexistant" }
  | { ok: false; raison: "expire"; expireLe: Date }
  | { ok: false; raison: "revoque"; motif: string | null }
  | { ok: false; raison: "deja_utilise"; utiliseLe: Date };

export async function verifierAccessToken(
  tokenClair: string,
): Promise<TokenValide | TokenInvalide> {
  if (!tokenClair || tokenClair.length < 30) return { ok: false, raison: "inexistant" };
  const tokenHash = hashToken(tokenClair);
  const token = await prisma.accessToken.findUnique({ where: { tokenHash } });
  if (!token) return { ok: false, raison: "inexistant" };
  if (token.revoqueLe)
    return { ok: false, raison: "revoque", motif: token.revoqueMotif };
  if (token.expireLe.getTime() < Date.now())
    return { ok: false, raison: "expire", expireLe: token.expireLe };
  // `consultation` est multi-usage ; `signature` et `depot_rapport` mono-usage.
  if (
    token.utiliseLe &&
    (token.scope === "signature" || token.scope === "depot_rapport")
  ) {
    return { ok: false, raison: "deja_utilise", utiliseLe: token.utiliseLe };
  }
  return { ok: true, token };
}

/**
 * Décrémente le compteur d'essais OTP (anti bruteforce). Révoque le token
 * si le compteur atteint 0.
 */
export async function decrementOtpEssais(accessTokenId: string): Promise<{
  restants: number;
  revoque: boolean;
}> {
  const t = await prisma.accessToken.update({
    where: { id: accessTokenId },
    data: { otpEssaisRestants: { decrement: 1 } },
    select: { otpEssaisRestants: true },
  });
  const restants = Math.max(0, t.otpEssaisRestants);
  let revoque = false;
  if (restants === 0) {
    await prisma.accessToken.update({
      where: { id: accessTokenId },
      data: { revoqueLe: new Date(), revoqueMotif: "OTP épuisé (3 essais)" },
    });
    revoque = true;
  }
  return { restants, revoque };
}

/**
 * Marque un token comme consommé après usage validant (signature posée ou
 * rapport déposé).
 */
export async function marquerUtilise(
  accessTokenId: string,
  meta: { ip?: string; userAgent?: string },
): Promise<void> {
  await prisma.accessToken.update({
    where: { id: accessTokenId },
    data: {
      utiliseLe: new Date(),
      derniereUtilisationIp: meta.ip,
      derniereUtilisationUserAgent: meta.userAgent?.slice(0, 500),
    },
  });
}
