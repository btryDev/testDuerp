"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { requireUser } from "@/lib/auth/require-user";
import { emettreAccessToken } from "@/lib/access-tokens/actions";
import {
  decrementOtpEssais,
  marquerUtilise,
  verifierAccessToken,
} from "@/lib/access-tokens/verify";
import { verifyOtp } from "./otp";
import { sha256Hex } from "./hash";
import type { ObjetSignable } from "@prisma/client";

/**
 * Calcule le hash d'un objet signable à la volée. Pour un rapport de
 * vérification : hash du fichier stocké. Pour d'autres objets (permis de
 * feu, plan de prévention…), on hashe une représentation canonique JSON.
 * Clé : le hash doit être stable et reproductible à la demande (vérif
 * d'intégrité ultérieure).
 *
 * Retourne un Result discriminé plutôt que de throw : les deux cas
 * « pas trouvé » (objet DB absent / fichier binaire absent) sont
 * remontés proprement jusqu'à l'UI.
 */
export type HashResult =
  | { ok: true; hash: string; nomDocument: string | null }
  | { ok: false; raison: "objet_introuvable" | "fichier_introuvable" | "non_implemente" };

export async function calculerHashObjet(
  objetType: ObjetSignable,
  objetId: string,
): Promise<HashResult> {
  if (objetType === "rapport_verification") {
    const rapport = await prisma.rapportVerification.findUnique({
      where: { id: objetId },
      select: { fichierCle: true, fichierNomOriginal: true },
    });
    if (!rapport) return { ok: false, raison: "objet_introuvable" };
    try {
      const buf = await getStorage().get(rapport.fichierCle);
      return {
        ok: true,
        hash: sha256Hex(buf),
        nomDocument: rapport.fichierNomOriginal,
      };
    } catch {
      return { ok: false, raison: "fichier_introuvable" };
    }
  }

  if (objetType === "plan_prevention") {
    const plan = await prisma.planPrevention.findUnique({
      where: { id: objetId },
      include: { lignes: { orderBy: { ordre: "asc" } } },
    });
    if (!plan) return { ok: false, raison: "objet_introuvable" };
    const canonique = JSON.stringify({
      numero: plan.numero,
      entrepriseExterieureRaison: plan.entrepriseExterieureRaison,
      entrepriseExterieureSiret: plan.entrepriseExterieureSiret,
      efChefNom: plan.efChefNom,
      efChefEmail: plan.efChefEmail,
      efEffectifIntervenant: plan.efEffectifIntervenant,
      euChefNom: plan.euChefNom,
      euChefFonction: plan.euChefFonction,
      dateDebut: plan.dateDebut,
      dateFin: plan.dateFin,
      lieux: plan.lieux,
      naturesTravaux: plan.naturesTravaux,
      travauxDangereux: plan.travauxDangereux,
      inspectionDate: plan.inspectionDate,
      inspectionParticipants: plan.inspectionParticipants,
      lignes: plan.lignes.map((l) => ({
        ordre: l.ordre,
        risque: l.risque,
        mesureEntrepriseUtilisatrice: l.mesureEntrepriseUtilisatrice,
        mesureEntrepriseExterieure: l.mesureEntrepriseExterieure,
      })),
    });
    return {
      ok: true,
      hash: sha256Hex(canonique),
      nomDocument: `Plan de prévention PP-${String(plan.numero).padStart(3, "0")}`,
    };
  }

  if (objetType === "permis_feu") {
    // Représentation canonique d'un permis de feu : on sérialise les champs
    // immuables juridiquement. Les champs de cycle de vie (statut, signatures
    // elles-mêmes) sont exclus — ils évoluent après signature sans invalider
    // l'accord initial.
    const permis = await prisma.permisFeu.findUnique({
      where: { id: objetId },
      select: {
        numero: true,
        prestataireRaison: true,
        prestataireContact: true,
        prestataireEmail: true,
        donneurOrdreNom: true,
        donneurOrdreFonction: true,
        dateDebut: true,
        dateFin: true,
        lieu: true,
        naturesTravaux: true,
        descriptionTravaux: true,
        mesuresValidees: true,
        mesuresNotes: true,
        dureeSurveillanceMinutes: true,
      },
    });
    if (!permis) return { ok: false, raison: "objet_introuvable" };
    // Clés triées pour stabilité du hash
    const canonique = JSON.stringify(permis, Object.keys(permis).sort());
    return {
      ok: true,
      hash: sha256Hex(canonique),
      nomDocument: `Permis de feu PF-${String(permis.numero).padStart(3, "0")}`,
    };
  }

  // Pour les autres objets (plan de prévention, registre accessibilité…),
  // chaque module livrera sa représentation canonique au fur et à mesure.
  return { ok: false, raison: "non_implemente" };
}

/**
 * Émet une demande de signature : crée un AccessToken scope "signature",
 * envoie le lien par email. Le destinataire viendra signer via OTP sur
 * `/acces/[token]`.
 */
export async function demanderSignature(params: {
  etablissementId: string;
  objetType: ObjetSignable;
  objetId: string;
  signataireEmail: string;
  signataireNom: string;
  signataireRole?: string;
  prestataireId?: string;
  libelleDocument: string;
}): Promise<{ accessTokenId: string; urlAcces: string; otpClair: string | null }> {
  const r = await emettreAccessToken({
    etablissementId: params.etablissementId,
    scope: "signature",
    objetType: params.objetType,
    objetId: params.objetId,
    prestataireId: params.prestataireId,
    emailDestinataire: params.signataireEmail,
    nomDestinataire: params.signataireNom,
    sujetMail: `Signature à apporter : ${params.libelleDocument}`,
    messageMail:
      `Vous êtes invité(e) à signer électroniquement le document suivant : ` +
      `« ${params.libelleDocument} ». ` +
      `Cette signature a la même valeur probatoire qu'une signature manuscrite ` +
      `(art. 1366-1367 du Code civil, règlement eIDAS niveau simple).`,
  });
  return {
    accessTokenId: r.accessTokenId,
    urlAcces: r.urlAcces,
    otpClair: r.otpClair,
  };
}

/**
 * Consomme un token de signature + OTP, crée la Signature finale.
 * Server action appelée depuis la page publique /acces/[token].
 */
export type PoserSignatureState =
  | { status: "idle" }
  | { status: "error"; message: string; restants?: number }
  | { status: "success"; signatureId: string };

export async function poserSignatureAvecToken(
  tokenClair: string,
  _prev: PoserSignatureState,
  formData: FormData,
): Promise<PoserSignatureState> {
  const otp = (formData.get("otp") ?? "").toString().trim();
  const signataireRole = (formData.get("signataireRole") ?? "").toString().trim();

  const res = await verifierAccessToken(tokenClair);
  if (!res.ok) {
    switch (res.raison) {
      case "inexistant":
        return { status: "error", message: "Ce lien est invalide." };
      case "expire":
        return {
          status: "error",
          message: `Ce lien a expiré le ${res.expireLe.toLocaleDateString("fr-FR")}.`,
        };
      case "revoque":
        return {
          status: "error",
          message: `Ce lien a été révoqué${res.motif ? ` : ${res.motif}` : ""}.`,
        };
      case "deja_utilise":
        return {
          status: "error",
          message: "Ce lien a déjà servi à signer ce document.",
        };
    }
  }
  const token = res.token;
  if (token.scope !== "signature") {
    return { status: "error", message: "Ce lien ne sert pas à signer." };
  }
  if (!token.otpHash) {
    return { status: "error", message: "Configuration OTP manquante." };
  }
  if (!verifyOtp(otp, token.otpHash)) {
    const dec = await decrementOtpEssais(token.id);
    if (dec.revoque) {
      return {
        status: "error",
        message: "Trop d'essais OTP. Ce lien est révoqué.",
      };
    }
    return {
      status: "error",
      message: `Code incorrect. Il vous reste ${dec.restants} essai${dec.restants > 1 ? "s" : ""}.`,
      restants: dec.restants,
    };
  }

  // OTP ok → calcul du hash + création de la signature.
  const h = await calculerHashObjet(
    token.objetType as ObjetSignable,
    token.objetId,
  );
  if (!h.ok) {
    return {
      status: "error",
      message:
        h.raison === "fichier_introuvable"
          ? "Le document à signer n'est plus accessible sur le serveur. Demandez à votre interlocuteur de le re-téléverser."
          : h.raison === "objet_introuvable"
            ? "Le document à signer n'existe plus."
            : "La signature de ce type de document n'est pas encore disponible.",
    };
  }
  const { hash, nomDocument } = h;

  const hh = await headers();
  const ip = hh.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = hh.get("user-agent");

  const signature = await prisma.signature.create({
    data: {
      id: `sig_${randomUUID()}`,
      etablissementId: token.etablissementId,
      objetType: token.objetType as ObjetSignable,
      objetId: token.objetId,
      signataireNom: token.nomDestinataire ?? token.emailDestinataire,
      signataireEmail: token.emailDestinataire,
      signataireRole: signataireRole || null,
      userId: null,
      hashDocument: hash,
      nomDocument,
      methode: "otp_email",
      ipAddress: ip,
      userAgent: ua?.slice(0, 500) ?? null,
    },
  });

  await marquerUtilise(token.id, { ip: ip ?? undefined, userAgent: ua ?? undefined });

  return { status: "success", signatureId: signature.id };
}

/**
 * Signature directe par un utilisateur connecté (pas de token externe).
 * Utilisé pour la co-signature du donneur d'ordre sur ses propres documents.
 */
export async function signerEnCompteConnecte(params: {
  etablissementId: string;
  objetType: ObjetSignable;
  objetId: string;
  role?: string;
}): Promise<
  | { ok: true; signatureId: string }
  | { ok: false; raison: "objet_introuvable" | "fichier_introuvable" | "non_implemente" }
> {
  const user = await requireUser();
  const h = await calculerHashObjet(params.objetType, params.objetId);
  if (!h.ok) return { ok: false, raison: h.raison };
  const { hash, nomDocument } = h;
  const hh = await headers();
  const ip = hh.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = hh.get("user-agent");

  const signature = await prisma.signature.create({
    data: {
      id: `sig_${randomUUID()}`,
      etablissementId: params.etablissementId,
      objetType: params.objetType,
      objetId: params.objetId,
      signataireNom: user.email ?? "Utilisateur",
      signataireEmail: user.email ?? "",
      signataireRole: params.role ?? null,
      userId: user.id,
      hashDocument: hash,
      nomDocument,
      methode: "compte_connecte",
      ipAddress: ip,
      userAgent: ua?.slice(0, 500) ?? null,
    },
  });
  return { ok: true, signatureId: signature.id };
}

/**
 * Vérifie l'intégrité d'une signature : recalcule le hash du document et
 * le compare à la valeur stockée.
 */
export async function verifierIntegriteSignature(
  signatureId: string,
): Promise<
  | { ok: true; signature: Awaited<ReturnType<typeof prisma.signature.findUnique>> }
  | { ok: false; raison: "inexistante" }
  | { ok: false; raison: "document_modifie"; hashAttendu: string; hashActuel: string }
  | { ok: false; raison: "document_introuvable" }
> {
  const signature = await prisma.signature.findUnique({ where: { id: signatureId } });
  if (!signature) return { ok: false, raison: "inexistante" };
  const h = await calculerHashObjet(signature.objetType, signature.objetId);
  if (!h.ok) return { ok: false, raison: "document_introuvable" };
  if (h.hash !== signature.hashDocument) {
    return {
      ok: false,
      raison: "document_modifie",
      hashAttendu: signature.hashDocument,
      hashActuel: h.hash,
    };
  }
  return { ok: true, signature };
}
