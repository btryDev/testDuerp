"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { mailFrom, publicAppUrl, sendMail } from "@/lib/email";
import { ScopeAccessToken } from "@prisma/client";
import {
  expirationFromNow,
  generateToken,
  hashToken,
  ttlHoursFor,
} from "./token";
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
  const expireLe = expirationFromNow(ttl);

  // OTP uniquement pour scopes à preuve (signature, dépôt de rapport).
  const besoinOtp =
    params.scope === "signature" || params.scope === "depot_rapport";
  const otp = besoinOtp ? generateOtp() : null;
  const otpHash = otp ? hashOtp(otp) : null;

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
      expireLe,
      createdByUserId: user.id,
    },
  });

  const urlAcces = `${publicAppUrl()}/acces/${token}`;
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

async function envoyerMailAcces(args: {
  to: string;
  nom?: string;
  sujet: string;
  message: string;
  urlAcces: string;
  otp: string | null;
  expireLe: Date;
}): Promise<void> {
  const bonjour = args.nom ? `Bonjour ${args.nom},` : "Bonjour,";
  const expiration = args.expireLe.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });

  const lignes = [
    bonjour,
    "",
    args.message,
    "",
    `Accédez à la page dédiée : ${args.urlAcces}`,
    "",
  ];
  if (args.otp) {
    lignes.push(
      `Code de confirmation : ${args.otp}`,
      "(Ce code vous sera demandé sur la page. Valable 10 minutes, 3 essais maximum.)",
      "",
    );
  }
  lignes.push(
    `Lien valable jusqu'au ${expiration} (heure de Paris).`,
    "",
    "— Pilote conformité (de la part de votre interlocuteur)",
    "",
    "Finalité : permettre une action ponctuelle demandée par votre interlocuteur.",
    "Droit d'accès / effacement : contactez l'émetteur du lien.",
  );

  await sendMail({
    to: args.to,
    subject: args.sujet,
    text: lignes.join("\n"),
  });

  // Aussi utile en dev : log le from configuré pour que l'utilisateur voie
  // l'identité d'expéditeur qui sortirait en prod.
  if (process.env.EMAIL_DRIVER !== "resend") {
    // eslint-disable-next-line no-console
    console.log(`   (From : ${mailFrom()})`);
  }
}

/**
 * Révoque un token (bouton « Annuler l'accès »).
 */
export async function revoquerAccessToken(
  etablissementId: string,
  accessTokenId: string,
  motif: string,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  await prisma.accessToken.update({
    where: { id: accessTokenId },
    data: { revoqueLe: new Date(), revoqueMotif: motif },
  });
}
