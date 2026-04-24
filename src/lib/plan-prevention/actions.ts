"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import {
  ligneSchema,
  planPreventionSchema,
  type LigneInput,
} from "./schema";
import { nextNumeroPlan } from "./queries";

export type PlanActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; planId: string; numero: number };

/**
 * Extrait la liste dynamique de lignes (risque / mesure EU / mesure EE)
 * postées via indices `lignes[0].risque`, `lignes[1].risque`, etc. —
 * c'est la forme naturelle pour un formulaire client qui ajoute/supprime
 * des lignes.
 */
function extraireLignes(formData: FormData): LigneInput[] {
  const out: LigneInput[] = [];
  let i = 0;
  while (true) {
    const risque = formData.get(`lignes[${i}].risque`);
    if (risque === null) break;
    const ligne = ligneSchema.safeParse({
      risque,
      mesureEntrepriseUtilisatrice: formData.get(
        `lignes[${i}].mesureEntrepriseUtilisatrice`,
      ),
      mesureEntrepriseExterieure: formData.get(
        `lignes[${i}].mesureEntrepriseExterieure`,
      ),
    });
    if (ligne.success) {
      // On ne garde que les lignes au moins partiellement renseignées.
      if (
        ligne.data.risque.trim() ||
        ligne.data.mesureEntrepriseUtilisatrice ||
        ligne.data.mesureEntrepriseExterieure
      ) {
        out.push(ligne.data);
      }
    }
    i++;
  }
  return out;
}

export async function creerPlanPrevention(
  etablissementId: string,
  _prev: PlanActionState,
  formData: FormData,
): Promise<PlanActionState> {
  await assertEtablissementOwnership(etablissementId);

  const lignes = extraireLignes(formData);

  const parsed = planPreventionSchema.safeParse({
    prestataireId: formData.get("prestataireId"),
    entrepriseExterieureRaison: formData.get("entrepriseExterieureRaison"),
    entrepriseExterieureSiret: formData.get("entrepriseExterieureSiret"),
    efChefNom: formData.get("efChefNom"),
    efChefEmail: formData.get("efChefEmail"),
    efEffectifIntervenant: formData.get("efEffectifIntervenant"),
    euChefNom: formData.get("euChefNom"),
    euChefFonction: formData.get("euChefFonction"),
    dateDebut: formData.get("dateDebut"),
    dateFin: formData.get("dateFin"),
    dureeHeuresEstimee: formData.get("dureeHeuresEstimee"),
    lieux: formData.get("lieux"),
    naturesTravaux: formData.get("naturesTravaux"),
    travauxDangereux: formData.get("travauxDangereux") === "on",
    inspectionDate: formData.get("inspectionDate"),
    inspectionParticipants: formData.get("inspectionParticipants"),
    lignes,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const numero = await nextNumeroPlan(etablissementId);
  const id = `pp_${randomUUID()}`;

  await prisma.planPrevention.create({
    data: {
      id,
      etablissementId,
      numero,
      prestataireId: parsed.data.prestataireId,
      entrepriseExterieureRaison: parsed.data.entrepriseExterieureRaison,
      entrepriseExterieureSiret: parsed.data.entrepriseExterieureSiret,
      efChefNom: parsed.data.efChefNom,
      efChefEmail: parsed.data.efChefEmail,
      efEffectifIntervenant: parsed.data.efEffectifIntervenant,
      euChefNom: parsed.data.euChefNom,
      euChefFonction: parsed.data.euChefFonction,
      dateDebut: parsed.data.dateDebut,
      dateFin: parsed.data.dateFin,
      dureeHeuresEstimee: parsed.data.dureeHeuresEstimee,
      lieux: parsed.data.lieux,
      naturesTravaux: parsed.data.naturesTravaux,
      travauxDangereux: parsed.data.travauxDangereux,
      inspectionDate: parsed.data.inspectionDate,
      inspectionParticipants: parsed.data.inspectionParticipants,
      statut: "attente_signatures",
      lignes: {
        create: parsed.data.lignes.map((l, ordre) => ({
          id: `lig_${randomUUID()}`,
          ordre,
          risque: l.risque,
          mesureEntrepriseUtilisatrice: l.mesureEntrepriseUtilisatrice,
          mesureEntrepriseExterieure: l.mesureEntrepriseExterieure,
        })),
      },
    },
  });

  revalidatePath(`/etablissements/${etablissementId}/plan-prevention`);
  return { status: "success", planId: id, numero };
}

export async function cloturerPlan(planId: string): Promise<void> {
  const plan = await prisma.planPrevention.findUnique({
    where: { id: planId },
    select: { etablissementId: true },
  });
  if (!plan) return;
  await assertEtablissementOwnership(plan.etablissementId);
  await prisma.planPrevention.update({
    where: { id: planId },
    data: { statut: "clos" },
  });
  revalidatePath(`/etablissements/${plan.etablissementId}/plan-prevention/${planId}`);
}

export async function supprimerPlan(planId: string): Promise<void> {
  const plan = await prisma.planPrevention.findUnique({
    where: { id: planId },
    select: { etablissementId: true, statut: true },
  });
  if (!plan) return;
  await assertEtablissementOwnership(plan.etablissementId);
  const etabId = plan.etablissementId;
  if (plan.statut === "brouillon" || plan.statut === "attente_signatures") {
    await prisma.planPrevention.delete({ where: { id: planId } });
  } else {
    await prisma.planPrevention.update({
      where: { id: planId },
      data: { statut: "annule" },
    });
  }
  revalidatePath(`/etablissements/${etabId}/plan-prevention`);
  redirect(`/etablissements/${etabId}/plan-prevention`);
}
