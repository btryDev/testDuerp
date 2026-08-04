"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleRapport, getStorage } from "@/lib/storage";
import { genererCalendrier } from "@/lib/calendrier/actions";
import {
  rapportMetadataSchema,
  STATUT_DEPUIS_RESULTAT,
} from "./schema";
import { validerFichier } from "./validator";

export type UploadRapportState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; rapportId: string };

/**
 * Server action d'upload d'un rapport sur une vérification.
 *
 * Flux :
 *  1. Valide métadonnées (Zod) et fichier (MIME/taille).
 *  2. Crée la ligne `RapportVerification` (id = cuid).
 *  3. Écrit le fichier via l'abstraction `FileStorage`.
 *  4. Met à jour la `Verification` parente (dateRealisee + statut selon
 *     le résultat saisi).
 *  5. Régénère le calendrier pour recalculer la prochaine échéance de
 *     cette vérification (cf. règle étape 6).
 */
export async function uploadRapport(
  verificationId: string,
  _prev: UploadRapportState,
  formData: FormData,
): Promise<UploadRapportState> {
  // 1. Métadonnées
  const parsed = rapportMetadataSchema.safeParse({
    dateRapport: formData.get("dateRapport"),
    organismeVerif: formData.get("organismeVerif"),
    resultat: formData.get("resultat"),
    commentaires: formData.get("commentaires"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 2. Fichier
  const fichier = formData.get("fichier");
  if (!(fichier instanceof File)) {
    return {
      status: "error",
      message: "Aucun fichier reçu",
      fieldErrors: { fichier: ["Sélectionnez un fichier à uploader"] },
    };
  }
  const val = validerFichier(fichier);
  if (!val.ok) {
    return {
      status: "error",
      message: val.erreur,
      fieldErrors: { fichier: [val.erreur] },
    };
  }

  // 3. Contexte vérification
  const verif = await prisma.verification.findUnique({
    where: { id: verificationId },
    select: { id: true, etablissementId: true },
  });
  if (!verif) {
    return { status: "error", message: "Vérification introuvable" };
  }

  // 4. Lire le fichier en buffer + stocker
  const buffer = Buffer.from(await fichier.arrayBuffer());
  const rapportId = `rap_${randomUUID()}`;
  const cle = cleRapport(verif.etablissementId, rapportId, fichier.name);

  const storage = getStorage();
  await storage.put(cle, buffer, val.mime);

  // 5. Persistance DB (rapport + mise à jour vérification) dans une
  // transaction pour éviter un état incohérent si la mise à jour casse.
  try {
    await prisma.$transaction([
      prisma.rapportVerification.create({
        data: {
          id: rapportId,
          etablissementId: verif.etablissementId,
          verificationId: verif.id,
          dateRapport: parsed.data.dateRapport,
          organismeVerif: parsed.data.organismeVerif,
          resultat: parsed.data.resultat,
          commentaires: parsed.data.commentaires,
          fichierCle: cle,
          fichierNomOriginal: fichier.name,
          fichierMime: val.mime,
          fichierTaille: val.taille,
        },
      }),
      prisma.verification.update({
        where: { id: verif.id },
        data: {
          dateRealisee: parsed.data.dateRapport,
          statut: STATUT_DEPUIS_RESULTAT[parsed.data.resultat],
        },
      }),
    ]);
  } catch (err) {
    // Nettoyage best-effort du fichier si la DB a échoué.
    await storage.delete(cle).catch(() => {});
    throw err;
  }

  // 6. Régénération du calendrier (la prochaine occurrence se recale sur
  // la date du rapport).
  await genererCalendrier(verif.etablissementId);

  revalidatePath(`/etablissements/${verif.etablissementId}/calendrier`);
  revalidatePath(`/etablissements/${verif.etablissementId}/registre`);
  revalidatePath(`/etablissements/${verif.etablissementId}/verifications/${verif.id}`);
  revalidatePath(`/etablissements/${verif.etablissementId}`);

  return { status: "success", rapportId };
}

export async function supprimerRapport(rapportId: string): Promise<void> {
  const rap = await prisma.rapportVerification.findUnique({
    where: { id: rapportId },
    select: {
      id: true,
      etablissementId: true,
      verificationId: true,
      fichierCle: true,
    },
  });
  if (!rap) return;

  const storage = getStorage();

  await prisma.rapportVerification.delete({ where: { id: rapportId } });
  await storage.delete(rap.fichierCle).catch(() => {});

  // Si c'était le seul rapport lié à la vérification et qu'elle est marquée
  // comme réalisée, on la remet en "à planifier" pour permettre une
  // nouvelle saisie.
  const restants = await prisma.rapportVerification.count({
    where: { verificationId: rap.verificationId },
  });
  if (restants === 0) {
    await prisma.verification.update({
      where: { id: rap.verificationId },
      data: { statut: "a_planifier", dateRealisee: null },
    });
    await genererCalendrier(rap.etablissementId);
  }

  revalidatePath(`/etablissements/${rap.etablissementId}/calendrier`);
  revalidatePath(`/etablissements/${rap.etablissementId}/registre`);
  revalidatePath(
    `/etablissements/${rap.etablissementId}/verifications/${rap.verificationId}`,
  );
  redirect(`/etablissements/${rap.etablissementId}/registre`);
}
