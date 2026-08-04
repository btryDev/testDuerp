import { randomInt, timingSafeEqual } from "node:crypto";
import { sha256Hex } from "./hash";

/**
 * OTP à 6 chiffres, usage unique, expiration côté caller.
 *
 * - Génération : RNG cryptographique (Node crypto.randomInt).
 * - Stockage : uniquement le SHA-256. Le clair n'est jamais persisté.
 * - Vérification : comparaison en temps constant (timingSafeEqual) pour
 *   éviter les attaques par timing.
 * - 3 essais par token (logique portée par la table AccessToken).
 */

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;

export function generateOtp(): string {
  // 0…999999 padded en 6 chiffres. randomInt est uniforme (pas de biais modulo).
  const n = randomInt(0, 10 ** OTP_LENGTH);
  return n.toString().padStart(OTP_LENGTH, "0");
}

export function hashOtp(otp: string): string {
  return sha256Hex(otp);
}

export function verifyOtp(saisie: string, hashAttendu: string): boolean {
  if (saisie.length !== OTP_LENGTH) return false;
  const h = hashOtp(saisie);
  if (h.length !== hashAttendu.length) return false;
  const a = Buffer.from(h, "hex");
  const b = Buffer.from(hashAttendu, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function otpExpirationDate(now: Date = new Date()): Date {
  return new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);
}
