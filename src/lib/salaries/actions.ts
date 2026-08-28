"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { genererCalendrier } from "@/lib/calendrier/actions";
import { marquerCalendrierPerime } from "@/lib/calendrier/reconciliation";
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

/**
 * Relance le générateur après une mutation de titre.
 *
 * **Elle manquait, et son absence rendait la fonctionnalité morte.** Le
 * commentaire de `rafraichir` affirmait qu'« un titre déclaré crée une ligne » ;
 * `revalidatePath` ne fait qu'invalider un cache de rendu, il ne génère rien.
 * Et la page calendrier ne régénère d'elle-même que si le calendrier est vide
 * ou si `REFERENTIEL_VERSION` a bougé — donc jamais, sur un établissement en
 * service. Un titre déclaré n'apparaissait au calendrier qu'au prochain
 * événement sans rapport : une mutation d'équipement, un rapport déposé.
 *
 * C'est la règle que `prescriptions/actions.ts` énonce depuis le début :
 * « toute mutation relance `genererCalendrier` ». Ce module était le seul à ne
 * pas la suivre.
 *
 * L'échec est rattrapé comme dans `equipements/actions.ts` : on repose le
 * calendrier en « périmé », état que la prochaine ouverture répare d'elle-même.
 * Sans cette marque, l'échec passerait inaperçu — le calendrier n'étant ni vide
 * ni périmé en version, rien ne le reprendrait.
 */
async function regenererEtRafraichir(etablissementId: string): Promise<void> {
  try {
    await genererCalendrier(etablissementId);
  } catch (err) {
    console.error(
      `[salaries] regen calendrier a échoué pour ${etablissementId}`,
      err,
    );
    await marquerCalendrierPerime(etablissementId);
  }

  // `"layout"` et non le chemin nu : une échéance de titre s'affiche sur CINQ
  // écrans de l'établissement — tableau de bord, calendrier, plan d'actions,
  // fiche d'action, registre —, tous par `libellePorteur`. `revalidatePath`
  // sans second argument n'invalide que le chemin exact, ce qui en couvrait
  // deux sur cinq. La forme large invalide le sous-arbre entier, et le dépôt
  // l'emploie déjà (`lib/auth/actions.ts`).
  revalidatePath(`/etablissements/${etablissementId}`, "layout");
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

  // Pas de régénération ici : une personne sans titre ne porte aucune
  // échéance. C'est `declarerTitre` qui en crée.
  revalidatePath(`/etablissements/${etablissementId}/equipe`);
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

  // Le sous-arbre entier de l'établissement : `libellePorteur` affiche le NOM
  // de la personne sur ses échéances, et cinq écrans le font — tableau de
  // bord, calendrier, plan d'actions, fiche d'action, registre. Un employeur
  // qui corrige une orthographe, geste que cet écran existe pour permettre au
  // titre de l'article 16 du RGPD, ne la voyait nulle part ailleurs.
  //
  // Pas de `genererCalendrier` en revanche, contrairement aux mutations de
  // titre : renommer quelqu'un ne change aucune échéance. Le nom n'est écrit
  // dans aucune colonne de `Verification`, il est joint à la lecture.
  //
  // L'oubli vient du remplacement de `rafraichir` par `regenererEtRafraichir` :
  // les `revalidatePath` que la première faisait ont disparu avec elle, sans
  // que rien ne le signale. Le cas de `creerSalarie` est justifié en
  // commentaire ; celui-ci ne l'était nulle part.
  revalidatePath(`/etablissements/${etablissementId}`, "layout");
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
  // Une sortie de l'effectif change le périmètre des échéances : le générateur
  // doit repasser.
  await regenererEtRafraichir(etablissementId);
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

  await regenererEtRafraichir(etablissementId);
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
  await regenererEtRafraichir(etablissementId);
}
