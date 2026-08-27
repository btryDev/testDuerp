"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { salarieSchema, titreSchema } from "./schema";
import { titreParId } from "./catalogue";

export type SalarieActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success"; salarieId: string };

export type TitreActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success" };

function rafraichir(etablissementId: string, salarieId?: string) {
  revalidatePath(`/etablissements/${etablissementId}/equipe`);
  if (salarieId) {
    revalidatePath(`/etablissements/${etablissementId}/equipe/${salarieId}`);
  }
  // Le calendrier aussi : un titre déclaré y crée une ligne, un titre
  // supprimé en retire une. Sans cette invalidation, l'utilisateur revient
  // au calendrier et n'y voit pas ce qu'il vient de saisir.
  revalidatePath(`/etablissements/${etablissementId}/calendrier`);
  revalidatePath(`/etablissements/${etablissementId}`);
}

export async function creerSalarie(
  etablissementId: string,
  _prev: SalarieActionState,
  formData: FormData,
): Promise<SalarieActionState> {
  await assertEtablissementOwnership(etablissementId);

  const parsed = salarieSchema.safeParse({
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    poste: formData.get("poste"),
    entreLe: formData.get("entreLe"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const salarie = await prisma.salarie.create({
    data: { etablissementId, ...parsed.data },
    select: { id: true },
  });

  rafraichir(etablissementId, salarie.id);
  return { status: "success", salarieId: salarie.id };
}

export async function modifierSalarie(
  etablissementId: string,
  salarieId: string,
  _prev: SalarieActionState,
  formData: FormData,
): Promise<SalarieActionState> {
  await assertEtablissementOwnership(etablissementId);

  const parsed = salarieSchema.safeParse({
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    poste: formData.get("poste"),
    entreLe: formData.get("entreLe"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // `updateMany` et non `update` : le filtre porte l'`etablissementId`, donc
  // un identifiant appartenant à un autre dossier ne modifie rien au lieu de
  // lever une erreur qui confirmerait son existence.
  const { count } = await prisma.salarie.updateMany({
    where: { id: salarieId, etablissementId },
    data: parsed.data,
  });
  if (count === 0) {
    return { status: "error", message: "Cette personne est introuvable" };
  }

  rafraichir(etablissementId, salarieId);
  return { status: "success", salarieId };
}

/**
 * Sortie de l'effectif — un basculement, jamais une suppression.
 *
 * La preuve qu'une personne était habilitée au moment où elle a opéré doit
 * survivre à son départ : c'est elle qui couvre l'employeur sur une période
 * passée (`docs/rgpd.md` § 4.3). Supprimer la fiche emporterait ses titres en
 * cascade et effacerait cette preuve.
 *
 * Le droit à l'effacement s'exerce, lui, par un autre chemin et sur décision :
 * il ne se confond pas avec « cette personne ne travaille plus ici ».
 */
export async function basculerActif(
  etablissementId: string,
  salarieId: string,
  actif: boolean,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  await prisma.salarie.updateMany({
    where: { id: salarieId, etablissementId },
    data: { actif },
  });
  rafraichir(etablissementId, salarieId);
}

export async function declarerTitre(
  etablissementId: string,
  salarieId: string,
  _prev: TitreActionState,
  formData: FormData,
): Promise<TitreActionState> {
  await assertEtablissementOwnership(etablissementId);

  const parsed = titreSchema.safeParse({
    obligationId: formData.get("obligationId"),
    delivreLe: formData.get("delivreLe"),
    echeanceLe: formData.get("echeanceLe"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Le référentiel vit en TypeScript, `TitreSalarie.obligationId` n'a donc
  // pas de clé étrangère : rien en base n'empêche d'y écrire l'identifiant
  // d'une obligation d'équipement. Le générateur s'en protège déjà, mais il
  // le fait en TAISANT la ligne — l'utilisateur aurait saisi un titre qui
  // n'apparaîtrait jamais nulle part, sans un mot. On refuse ici.
  if (!titreParId(parsed.data.obligationId)) {
    return {
      status: "error",
      message: "Ce titre n'existe pas au référentiel",
      fieldErrors: { obligationId: ["Choisissez un titre de la liste"] },
    };
  }

  const salarie = await prisma.salarie.findFirst({
    where: { id: salarieId, etablissementId },
    select: { id: true },
  });
  if (!salarie) {
    return { status: "error", message: "Cette personne est introuvable" };
  }

  // `upsert` sur `(salarieId, obligationId)` : redéclarer le même titre est
  // un renouvellement, pas un doublon. Sans lui, l'unicité en base rendrait
  // une erreur Prisma brute là où l'utilisateur fait le geste normal — saisir
  // la nouvelle attestation quand l'ancienne expire.
  await prisma.titreSalarie.upsert({
    where: {
      salarieId_obligationId: {
        salarieId,
        obligationId: parsed.data.obligationId,
      },
    },
    create: { salarieId, ...parsed.data },
    update: {
      delivreLe: parsed.data.delivreLe,
      echeanceLe: parsed.data.echeanceLe,
      note: parsed.data.note,
    },
  });

  rafraichir(etablissementId, salarieId);
  return { status: "success" };
}

export async function retirerTitre(
  etablissementId: string,
  salarieId: string,
  titreId: string,
): Promise<void> {
  await assertEtablissementOwnership(etablissementId);
  await prisma.titreSalarie.deleteMany({
    where: { id: titreId, salarie: { id: salarieId, etablissementId } },
  });
  rafraichir(etablissementId, salarieId);
}
