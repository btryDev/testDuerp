"use server";

// Écritures sur les fiches du registre à saisie libre.
//
// ⚠ Module `"use server"` : **tout export est un point d'entrée réseau**.
// Chaque fonction porte donc elle-même son autorisation, comme le rappelle
// `signatures/actions.ts`.

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { saisiePourSection } from "./champs";
import { lignesDuJournal, schemaDeLaFiche, type LigneJournal } from "./schema";

export type EtatFiche =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

/** Toute écriture passe par là : scope, existence de la fiche, validation. */
type Prepare =
  | { ok: false; etat: EtatFiche }
  | {
      ok: true;
      saisie: NonNullable<ReturnType<typeof saisiePourSection>>;
      valeurs: Record<string, string | null>;
    };

async function preparer(
  etablissementId: string,
  sectionId: string,
  fd: FormData,
): Promise<Prepare> {
  await assertEtablissementOwnership(etablissementId);

  // `sectionId` vient du client. Il ne devient une fiche que s'il désigne une
  // question du catalogue — sinon la table se remplirait de sections
  // fantômes qu'aucun écran ne saurait plus rendre.
  const saisie = saisiePourSection(sectionId);
  const schema = schemaDeLaFiche(sectionId);
  if (!saisie || !schema) {
    return {
      ok: false,
      etat: {
        status: "error",
        message: "Cette fiche ne se remplit pas ici.",
      },
    };
  }

  const brut = Object.fromEntries(fd);
  const parsed = schema.safeParse(brut);
  if (!parsed.success) {
    return {
      ok: false,
      etat: {
        status: "error",
        message: "Vérifiez les champs signalés.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      },
    };
  }
  return {
    ok: true,
    saisie,
    valeurs: parsed.data as Record<string, string | null>,
  };
}

function revalider(etablissementId: string) {
  revalidatePath(`/etablissements/${etablissementId}/registre`);
  revalidatePath(`/etablissements/${etablissementId}`);
}

/**
 * Enregistre les réponses d'une fiche « formulaire ».
 *
 * Un seul jeu de réponses par fiche : c'est un upsert, pas un empilement.
 * L'unicité `[etablissementId, sectionId]` porte la garantie en base.
 */
export async function enregistrerFiche(
  etablissementId: string,
  sectionId: string,
  _prev: EtatFiche,
  formData: FormData,
): Promise<EtatFiche> {
  const p = await preparer(etablissementId, sectionId, formData);
  if (!p.ok) return p.etat;
  if (p.saisie.forme !== "formulaire") {
    return { status: "error", message: "Cette fiche n'est pas un formulaire." };
  }

  await prisma.ficheRegistre.upsert({
    where: { etablissementId_sectionId: { etablissementId, sectionId } },
    create: {
      id: `fic_${randomUUID()}`,
      etablissementId,
      sectionId,
      contenu: { champs: p.valeurs },
    },
    update: { contenu: { champs: p.valeurs } },
  });

  revalider(etablissementId);
  return { status: "success" };
}

/**
 * Ajoute une ligne à une fiche « journal ».
 *
 * Append-only, et c'est le point : un journal de sécurité ne se corrige pas,
 * il se complète. Une ligne réécrite après coup ne prouve plus rien — c'est
 * l'immuabilité de la suite qui fait la valeur de la pièce.
 */
export async function ajouterLigneJournal(
  etablissementId: string,
  sectionId: string,
  _prev: EtatFiche,
  formData: FormData,
): Promise<EtatFiche> {
  const p = await preparer(etablissementId, sectionId, formData);
  if (!p.ok) return p.etat;
  if (p.saisie.forme !== "journal") {
    return { status: "error", message: "Cette fiche n'est pas un journal." };
  }

  // Une ligne entièrement vide n'est pas une ligne : elle ferait du bruit dans
  // une pièce dont la lisibilité est tout l'intérêt.
  if (Object.values(p.valeurs).every((v) => v === null)) {
    return { status: "error", message: "Renseignez au moins un champ." };
  }

  const existante = await prisma.ficheRegistre.findUnique({
    where: { etablissementId_sectionId: { etablissementId, sectionId } },
    select: { id: true, contenu: true },
  });

  const ligne: LigneJournal = {
    id: `lig_${randomUUID()}`,
    valeurs: p.valeurs,
    saisieLe: new Date().toISOString(),
  };
  const lignes = [...lignesDuJournal(existante?.contenu), ligne];

  if (existante) {
    await prisma.ficheRegistre.update({
      where: { id: existante.id },
      data: { contenu: { lignes } },
    });
  } else {
    await prisma.ficheRegistre.create({
      data: {
        id: `fic_${randomUUID()}`,
        etablissementId,
        sectionId,
        contenu: { lignes },
      },
    });
  }

  revalider(etablissementId);
  return { status: "success" };
}
