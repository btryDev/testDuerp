"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { ScopeAccessToken } from "@prisma/client";
import {
  expirationFromNow,
  generateToken,
  hashToken,
  ttlHoursFor,
} from "./token";
import { envoyerMailAcces, urlAccesPourToken } from "./mail";
import { generateOtp, hashOtp, otpExpirationDate } from "@/lib/signatures/otp";

/**
 * Émet un token d'accès externe et envoie par email le lien magique au
 * destinataire (+ OTP si scope = signature ou depot_rapport).
 *
 * Le token clair n'existe qu'en mémoire ici — retour à l'appelant du lien
 * complet pour affichage éventuel dans l'UI admin (debug dev, copie manuelle).
 */

export type EmissionTokenParams = {
  etablissementId: string;
  scope: ScopeAccessToken;
  objetType: string;
  objetId: string;
  emailDestinataire: string;
  nomDestinataire?: string;
  prestataireId?: string;
  sujetMail: string;
  messageMail: string;
};

export type EmissionResultat = {
  accessTokenId: string;
  tokenClair: string;
  otpClair: string | null;
  urlAcces: string;
  expireLe: Date;
};

export async function emettreAccessToken(
  params: EmissionTokenParams,
): Promise<EmissionResultat> {
  const user = await requireUser();
  await assertEtablissementOwnership(params.etablissementId);

  const token = generateToken();
  const tokenHash = hashToken(token);
  const ttl = ttlHoursFor(params.scope);
  // Horloge lue une seule fois : l'expiration du lien et celle du code
  // partent du même instant.
  const maintenant = new Date();
  const expireLe = expirationFromNow(ttl, maintenant);

  // OTP uniquement pour scopes à preuve (signature, dépôt de rapport).
  const besoinOtp =
    params.scope === "signature" || params.scope === "depot_rapport";
  const otp = besoinOtp ? generateOtp() : null;
  const otpHash = otp ? hashOtp(otp) : null;
  // Le code a sa propre expiration (10 minutes), bien plus courte que celle
  // du lien (72 h pour une signature, 7 jours pour un dépôt). Sans cette
  // date, le code à 6 chiffres restait valable aussi longtemps que le lien
  // — l'email annonçait 10 minutes, le code en durait des jours.
  const otpExpireLe = otp ? otpExpirationDate(maintenant) : null;

  const access = await prisma.accessToken.create({
    data: {
      id: `atk_${randomUUID()}`,
      tokenHash,
      etablissementId: params.etablissementId,
      scope: params.scope,
      objetType: params.objetType,
      objetId: params.objetId,
      prestataireId: params.prestataireId,
      emailDestinataire: params.emailDestinataire.toLowerCase().trim(),
      nomDestinataire: params.nomDestinataire,
      otpHash,
      otpExpireLe,
      expireLe,
      createdByUserId: user.id,
    },
  });

  const urlAcces = urlAccesPourToken(token);
  await envoyerMailAcces({
    to: params.emailDestinataire,
    nom: params.nomDestinataire,
    sujet: params.sujetMail,
    message: params.messageMail,
    urlAcces,
    otp,
    expireLe,
  });

  return {
    accessTokenId: access.id,
    tokenClair: token,
    otpClair: otp,
    urlAcces,
    expireLe,
  };
}

/**
 * Révoque un token (bouton « Annuler l'accès »).
 *
 * `updateMany` plutôt qu'`update` : la clause porte à la fois sur
 * l'identifiant du token et sur l'établissement dont on vient de vérifier
 * l'appartenance. Avec `update`, l'identifiant seul faisait foi — un user
 * pouvait présenter son propre établissement et révoquer le lien d'accès
 * d'un tiers.
 */
export async function revoquerAccessToken(
  etablissementId: string,
  accessTokenId: string,
  motif: string,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  await prisma.accessToken.updateMany({
    where: { id: accessTokenId, etablissementId },
    data: { revoqueLe: new Date(), revoqueMotif: motif },
  });
}
