"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { getStorage, cleRapport } from "@/lib/storage";
import { validerFichier } from "@/lib/rapports/validator";
import {
  analyseLegionelleSchema,
  estReleveConforme,
  pointReleveSchema,
  releveTemperatureSchema,
  SEUIL_LEGIONELLE_UFC_PAR_L,
} from "./schema";

export type CarnetActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success" };

async function obtenirOuCreerCarnet(etablissementId: string) {
  const existant = await prisma.carnetSanitaire.findUnique({
    where: { etablissementId },
  });
  if (existant) return existant;
  return prisma.carnetSanitaire.create({
    data: {
      id: `cs_${randomUUID()}`,
      etablissementId,
    },
  });
}

export async function creerPointReleve(
  etablissementId: string,
  _prev: CarnetActionState,
  formData: FormData,
): Promise<CarnetActionState> {
  await assertEtablissementOwnership(etablissementId);
  const parsed = pointReleveSchema.safeParse({
    nom: formData.get("nom"),
    localisation: formData.get("localisation"),
    typeReseau: formData.get("typeReseau"),
    seuilMinCelsius: formData.get("seuilMinCelsius"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const carnet = await obtenirOuCreerCarnet(etablissementId);
  await prisma.pointReleve.create({
    data: {
      id: `pt_${randomUUID()}`,
      carnetId: carnet.id,
      ...parsed.data,
    },
  });
  revalidatePath(`/etablissements/${etablissementId}/carnet-sanitaire`);
  return { status: "success" };
}

export async function supprimerPointReleve(
  etablissementId: string,
  pointId: string,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  // Soft delete : on garde les relevés historiques, on désactive le point.
  await prisma.pointReleve.update({
    where: { id: pointId },
    data: { actif: false },
  });
  revalidatePath(`/etablissements/${etablissementId}/carnet-sanitaire`);
}

export async function ajouterReleve(
  etablissementId: string,
  _prev: CarnetActionState,
  formData: FormData,
): Promise<CarnetActionState> {
  await assertEtablissementOwnership(etablissementId);
  const parsed = releveTemperatureSchema.safeParse({
    pointReleveId: formData.get("pointReleveId"),
    dateReleve: formData.get("dateReleve"),
    temperatureCelsius: formData.get("temperatureCelsius"),
    operateur: formData.get("operateur"),
    commentaire: formData.get("commentaire"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const point = await prisma.pointReleve.findUnique({
    where: { id: parsed.data.pointReleveId },
    select: { seuilMinCelsius: true, typeReseau: true, carnet: { select: { etablissementId: true } } },
  });
  if (!point || point.carnet.etablissementId !== etablissementId) {
    return { status: "error", message: "Point de relevé introuvable" };
  }
  const conforme = estReleveConforme(
    parsed.data.temperatureCelsius,
    point.seuilMinCelsius,
    point.typeReseau,
  );
  await prisma.releveTemperature.create({
    data: {
      id: `rel_${randomUUID()}`,
      pointReleveId: parsed.data.pointReleveId,
      dateReleve: parsed.data.dateReleve,
      temperatureCelsius: parsed.data.temperatureCelsius,
      conforme,
      operateur: parsed.data.operateur,
      commentaire: parsed.data.commentaire,
    },
  });
  revalidatePath(`/etablissements/${etablissementId}/carnet-sanitaire`);
  return { status: "success" };
}

export async function ajouterAnalyseLegionelle(
  etablissementId: string,
  _prev: CarnetActionState,
  formData: FormData,
): Promise<CarnetActionState> {
  await assertEtablissementOwnership(etablissementId);
  const parsed = analyseLegionelleSchema.safeParse({
    dateAnalyse: formData.get("dateAnalyse"),
    laboratoire: formData.get("laboratoire"),
    valeurUfcParL: formData.get("valeurUfcParL"),
    commentaire: formData.get("commentaire"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const carnet = await obtenirOuCreerCarnet(etablissementId);

  // Upload optionnel du rapport labo.
  let rapportCle: string | null = null;
  let rapportNom: string | null = null;
  const fichier = formData.get("rapport");
  if (fichier instanceof File && fichier.size > 0) {
    const val = validerFichier(fichier);
    if (!val.ok) {
      return { status: "error", message: val.erreur };
    }
    const id = randomUUID();
    const cle = cleRapport(etablissementId, `legio_${id}`, fichier.name);
    const buffer = Buffer.from(await fichier.arrayBuffer());
    await getStorage().put(cle, buffer, val.mime);
    rapportCle = cle;
    rapportNom = fichier.name;
  }

  const conforme =
    parsed.data.valeurUfcParL === undefined ||
    parsed.data.valeurUfcParL < SEUIL_LEGIONELLE_UFC_PAR_L;

  await prisma.analyseLegionelle.create({
    data: {
      id: `ana_${randomUUID()}`,
      carnetId: carnet.id,
      dateAnalyse: parsed.data.dateAnalyse,
      laboratoire: parsed.data.laboratoire,
      valeurUfcParL: parsed.data.valeurUfcParL,
      conforme,
      rapportCle,
      rapportNom,
      commentaire: parsed.data.commentaire,
    },
  });
  revalidatePath(`/etablissements/${etablissementId}/carnet-sanitaire`);
  return { status: "success" };
}
