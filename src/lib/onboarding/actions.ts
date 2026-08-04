"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";
import { onboardingSchema } from "./schema";

/**
 * Server action de finalisation du parcours d'onboarding.
 *
 * Crée Entreprise + premier Etablissement dans une transaction unique
 * depuis un seul formulaire (saisi une seule fois, sans duplication
 * ressentie). Redirige ensuite vers la page de l'établissement créé.
 *
 * Les champs communs (adresse, codeNaf, effectif) sont copiés dans les
 * deux entités — côté Entreprise c'est le siège, côté Etablissement
 * c'est le premier site. L'utilisateur pourra dissocier plus tard
 * s'il ajoute un 2e site avec une adresse différente.
 */
export type OnboardingActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; etablissementId: string };

export async function finaliserOnboarding(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const user = await requireUser();

  // 1 user = 1 entreprise = 1 établissement (invariant produit).
  // Si l'utilisateur a déjà un établissement, on ne refait pas
  // l'onboarding : retour direct au dashboard.
  const existant = await getOptionalUserEtablissement();
  if (existant) redirect(`/etablissements/${existant.id}`);
  // On lit les champs un à un — permet de convertir checkboxes (HTML
  // ne soumet "on" que si la case est cochée) en vrais booléens.
  const raw = Object.fromEntries(formData);
  const input = {
    raisonSociale: raw.raisonSociale,
    siret: raw.siret,
    adresse: raw.adresse,
    codeNaf: raw.codeNaf,
    effectifSurSite: raw.effectifSurSite,
    estEtablissementTravail: raw.estEtablissementTravail === "true",
    estERP: raw.estERP === "true",
    estIGH: raw.estIGH === "true",
    estHabitation: raw.estHabitation === "true",
    typeErp: raw.typeErp || undefined,
    categorieErp: raw.categorieErp || undefined,
    classeIgh: raw.classeIgh || undefined,
  };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const d = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const entreprise = await tx.entreprise.create({
      data: {
        userId: user.id,
        raisonSociale: d.raisonSociale,
        siret: d.siret,
        codeNaf: d.codeNaf,
        // L'effectif entreprise est pris égal à l'effectif sur site au
        // démarrage (mono-site TPE). Modifiable ensuite si multi-site.
        effectif: d.effectifSurSite,
        adresse: d.adresse,
      },
    });

    // Nom d'usage de l'établissement = raison sociale par défaut.
    // L'utilisateur pourra le renommer plus tard s'il ouvre un 2ᵉ site.
    const etablissement = await tx.etablissement.create({
      data: {
        entrepriseId: entreprise.id,
        raisonDisplay: d.raisonSociale,
        adresse: d.adresse,
        codeNaf: d.codeNaf,
        effectifSurSite: d.effectifSurSite,
        estEtablissementTravail: d.estEtablissementTravail,
        estERP: d.estERP,
        estIGH: d.estIGH,
        estHabitation: d.estHabitation,
        typeErp: d.typeErp,
        categorieErp: d.categorieErp,
        classeIgh: d.classeIgh,
      },
    });

    return etablissement;
  });

  revalidatePath("/");
  revalidatePath(`/entreprises/${result.entrepriseId}`);
  redirect(`/etablissements/${result.id}`);
}
