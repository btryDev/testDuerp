"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  assertEntrepriseOwnership,
  assertEtablissementOwnership,
} from "@/lib/auth/scope";
import {
  genererCalendrier,
  marquerCalendrierPerime,
} from "@/lib/calendrier/actions";
import { etablissementSchema } from "./schema";

export type EtablissementActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    }
  | { status: "success"; id: string }
  | { status: "success_avec_avertissement"; id: string; message: string };

/**
 * Champs dont dépend le moteur de matching (ADR-004 : régimes cumulables +
 * enums de précision, et seuils d'effectif). Les modifier change l'ensemble
 * des obligations applicables : une boutique qui devient ERP hérite de la
 * vérification électrique annuelle par organisme agréé ; passer de la 5e à la
 * 3e catégorie ajoute le SSI triennal.
 *
 * Jusqu'ici `modifierEtablissement` faisait `update` + `revalidatePath` sans
 * jamais régénérer le calendrier — contrairement à toutes les mutations
 * d'équipement. L'établissement gardait donc ses anciennes obligations
 * indéfiniment, et le « self-healing » de la page calendrier ne rattrapait
 * rien : il ne se déclenche que sur un calendrier totalement vide.
 */
const CHAMPS_STRUCTURANTS = [
  "estEtablissementTravail",
  "estERP",
  "estIGH",
  "estHabitation",
  "typeErp",
  "categorieErp",
  "classeIgh",
  "effectifSurSite",
] as const;

type ChampStructurant = (typeof CHAMPS_STRUCTURANTS)[number];
type ProfilStructurant = Record<ChampStructurant, unknown>;

// Note : ce module porte la directive `"use server"`, qui interdit d'exporter
// autre chose que des fonctions `async`. Les helpers purs restent donc privés ;
// ils sont couverts par les tests des server actions qui les utilisent.

/** Vrai si au moins un champ de matching change de valeur. */
function typologieAChange(
  avant: ProfilStructurant,
  apres: Partial<ProfilStructurant>,
): boolean {
  return CHAMPS_STRUCTURANTS.some(
    (c) => c in apres && (apres[c] ?? null) !== (avant[c] ?? null),
  );
}

/**
 * Normalise les données du formulaire avant validation Zod :
 *  - les checkboxes HTML envoient "on" ou rien ; Zod les attend en booléen
 *  - les selects vides arrivent en string "" ; on les transforme en undefined
 */
function normaliserFormData(fd: FormData): Record<string, unknown> {
  const raw = Object.fromEntries(fd);
  const bool = (k: string) => raw[k] !== undefined;
  return {
    raisonDisplay: raw.raisonDisplay,
    adresse: raw.adresse,
    codeNaf: raw.codeNaf,
    effectifSurSite: raw.effectifSurSite,
    estEtablissementTravail: bool("estEtablissementTravail"),
    estERP: bool("estERP"),
    estIGH: bool("estIGH"),
    estHabitation: bool("estHabitation"),
    typeErp: raw.typeErp || undefined,
    categorieErp: raw.categorieErp || undefined,
    classeIgh: raw.classeIgh || undefined,
  };
}

export async function creerEtablissement(
  entrepriseId: string,
  _prev: EtablissementActionState,
  formData: FormData,
): Promise<EtablissementActionState> {
  await assertEntrepriseOwnership(entrepriseId);

  // 1 entreprise = 1 établissement : si un établissement existe déjà
  // pour cette entreprise, on redirige au lieu d'en créer un second.
  const dejaExistant = await prisma.etablissement.findFirst({
    where: { entrepriseId },
    select: { id: true },
  });
  if (dejaExistant) redirect(`/etablissements/${dejaExistant.id}`);

  const parsed = etablissementSchema.safeParse(normaliserFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const etab = await prisma.etablissement.create({
    data: {
      entrepriseId,
      ...parsed.data,
    },
  });

  revalidatePath(`/entreprises/${entrepriseId}`);
  redirect(`/etablissements/${etab.id}`);
}

export async function modifierEtablissement(
  id: string,
  _prev: EtablissementActionState,
  formData: FormData,
): Promise<EtablissementActionState> {
  await assertEtablissementOwnership(id);
  const parsed = etablissementSchema.safeParse(normaliserFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // État avant modification : c'est lui qui dit si le calendrier doit être
  // recalculé.
  const avant = await prisma.etablissement.findUnique({
    where: { id },
    select: {
      estEtablissementTravail: true,
      estERP: true,
      estIGH: true,
      estHabitation: true,
      typeErp: true,
      categorieErp: true,
      classeIgh: true,
      effectifSurSite: true,
    },
  });
  if (!avant) {
    return { status: "error", message: "Établissement introuvable" };
  }

  const etab = await prisma.etablissement.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/entreprises/${etab.entrepriseId}`);
  revalidatePath(`/etablissements/${id}`);

  if (typologieAChange(avant, parsed.data)) {
    try {
      await genererCalendrier(id);
      revalidatePath(`/etablissements/${id}/calendrier`);
    } catch (err) {
      console.error(
        `[etablissements] regen calendrier a échoué pour ${id}`,
        err,
      );
      // Marqué périmé : la prochaine ouverture du calendrier le
      // recalculera d'elle-même (cf. `marquerCalendrierPerime`).
      await marquerCalendrierPerime(id);
      return {
        status: "success_avec_avertissement",
        id,
        message:
          "Fiche enregistrée. Vos obligations n'ont pas pu être recalculées " +
          "à l'instant : elles le seront automatiquement à la prochaine " +
          "ouverture de la page « Calendrier ».",
      };
    }
  }

  return { status: "success", id };
}

/**
 * Résultat d'une demande de suppression. La suppression peut être **refusée**
 * par la loi : ce n'est pas une erreur technique, et l'utilisateur a droit à
 * une explication, pas à une page d'erreur Next.
 */
export type SuppressionResult = {
  statut: "refus";
  message: string;
  /** Où aller pour récupérer ses documents avant toute autre démarche. */
  exportHref: string;
};

/**
 * Message de refus commun à la suppression d'un établissement et à celle
 * d'une entreprise. Formulé pour un dirigeant non-juriste : ce qui bloque,
 * pourquoi, et ce qu'il peut faire à la place.
 */
function messageConservationDuerp(nbVersions: number): string {
  return (
    `Suppression impossible : ${nbVersions} version${nbVersions > 1 ? "s" : ""} ` +
    `de votre document unique d'évaluation des risques ${nbVersions > 1 ? "sont" : "est"} ` +
    "archivée" +
    (nbVersions > 1 ? "s" : "") +
    " ici. La loi impose de les conserver 40 ans " +
    "(art. R. 4121-4 du Code du travail) : elles servent à prouver, des " +
    "décennies plus tard, à quels risques un salarié a été exposé. Ce refus " +
    "s'applique même à une demande d'effacement (art. 17.3 du RGPD, obligation " +
    "légale). Vous pouvez en revanche exporter l'intégralité de vos documents."
  );
}

/**
 * Compte les versions de DUERP figées rattachées à un établissement.
 * Sert de garde applicatif **avant** de tenter la suppression : la base la
 * refuserait de toute façon (`onDelete: Restrict` posé par la migration
 * `20260810120000_integrite_et_conservation`), mais avec une erreur Prisma
 * P2003 illisible.
 */
async function compterVersionsDuerp(etablissementId: string): Promise<number> {
  return prisma.duerpVersion.count({
    where: { duerp: { etablissementId } },
  });
}

/**
 * Supprime un établissement — ou explique pourquoi c'est impossible.
 *
 * En cas de succès, la fonction ne rend pas la main : elle redirige. Elle ne
 * retourne donc qu'en cas de **refus**.
 */
export async function supprimerEtablissement(
  id: string,
): Promise<SuppressionResult> {
  await assertEtablissementOwnership(id);

  const etab = await prisma.etablissement.findUnique({
    where: { id },
    select: { id: true, entrepriseId: true },
  });
  if (!etab) {
    return {
      statut: "refus",
      message: "Établissement introuvable.",
      exportHref: "/",
    };
  }

  const nbVersions = await compterVersionsDuerp(id);
  if (nbVersions > 0) {
    return {
      statut: "refus",
      message: messageConservationDuerp(nbVersions),
      exportHref: `/etablissements/${id}/controle`,
    };
  }

  try {
    await prisma.etablissement.delete({ where: { id } });
  } catch (err) {
    // Filet de sécurité : une version de DUERP a pu être créée entre le
    // comptage et la suppression, ou un autre `Restrict` a été ajouté depuis.
    // Dans tous les cas, l'utilisateur ne doit jamais voir « P2003 ».
    console.error(`[etablissements] suppression refusée pour ${id}`, err);
    return {
      statut: "refus",
      message:
        "Suppression impossible : cet établissement porte des documents à " +
        "conservation obligatoire. Exportez votre dossier de conformité, puis " +
        "contactez le support si vous souhaitez fermer le compte.",
      exportHref: `/etablissements/${id}/controle`,
    };
  }

  revalidatePath(`/entreprises/${etab.entrepriseId}`);
  redirect(`/entreprises/${etab.entrepriseId}`);
}
