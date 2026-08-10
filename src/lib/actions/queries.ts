import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import type { StatutAction } from "@prisma/client";

export type OrigineAction = "duerp" | "verification" | "libre";

export type FiltresPlanActions = {
  origine?: OrigineAction;
  statut?: StatutAction;
  /** criticité minimale (>=) */
  criticiteMin?: number;
  /** true = masquer les levées/abandonnées */
  enCoursSeulement?: boolean;
};

export async function listerActions(
  etablissementId: string,
  filtres: FiltresPlanActions = {},
) {
  const user = await requireUser();
  const where: Parameters<typeof prisma.action.findMany>[0] = {
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
  };

  if (filtres.origine === "duerp") {
    where.where = { ...where.where, risqueId: { not: null } };
  } else if (filtres.origine === "verification") {
    where.where = { ...where.where, verificationId: { not: null } };
  } else if (filtres.origine === "libre") {
    where.where = {
      ...where.where,
      risqueId: null,
      verificationId: null,
    };
  }

  if (filtres.statut) {
    where.where = { ...where.where, statut: filtres.statut };
  } else if (filtres.enCoursSeulement) {
    where.where = {
      ...where.where,
      statut: { in: ["ouverte", "en_cours"] },
    };
  }

  if (filtres.criticiteMin !== undefined) {
    where.where = {
      ...where.where,
      criticite: { gte: filtres.criticiteMin },
    };
  }

  return prisma.action.findMany({
    ...where,
    include: {
      risque: {
        include: { unite: { include: { duerp: true } } },
      },
      verification: {
        include: { equipement: true },
      },
    },
    orderBy: [
      { statut: "asc" }, // ouverte / en_cours avant le reste
      { echeance: "asc" },
      { criticite: "desc" },
    ],
  });
}

export type ActionListee = Awaited<ReturnType<typeof listerActions>>[number];

export function origineDeLAction(a: {
  risqueId: string | null;
  verificationId: string | null;
}): OrigineAction {
  if (a.risqueId) return "duerp";
  if (a.verificationId) return "verification";
  return "libre";
}

export async function getAction(id: string) {
  const user = await requireUser();
  return prisma.action.findFirst({
    where: { id, etablissement: { entreprise: { userId: user.id } } },
    include: {
      risque: {
        include: { unite: { include: { duerp: true } } },
      },
      verification: {
        include: {
          equipement: true,
          rapports: {
            orderBy: { dateRapport: "desc" },
          },
        },
      },
      etablissement: {
        select: { id: true, raisonDisplay: true },
      },
    },
  });
}

/**
 * Compteurs pour le tableau de bord étape 9. Agrégats calculés en base
 * pour rester performants même à volume.
 */
export async function compterActions(etablissementId: string) {
  const user = await requireUser();
  const scope = {
    etablissementId,
    etablissement: { entreprise: { userId: user.id } },
  } as const;
  const now = new Date();

  const [ouvertes, enCours, enRetard, leveesRecemment] = await Promise.all([
    prisma.action.count({
      where: { ...scope, statut: "ouverte" },
    }),
    prisma.action.count({
      where: { ...scope, statut: "en_cours" },
    }),
    prisma.action.count({
      where: {
        ...scope,
        statut: { in: ["ouverte", "en_cours"] },
        echeance: { lt: now },
      },
    }),
    prisma.action.count({
      where: {
        ...scope,
        statut: "levee",
        leveeLe: {
          gte: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
        },
      },
    }),
  ]);

  return {
    ouvertes,
    enCours,
    enRetard,
    leveesRecemment, // sur 30 derniers jours
    totalACouvrir: ouvertes + enCours,
  };
}

export type StatsRetardActions = {
  nb: number;
  /** Retard moyen en jours sur l'ensemble des actions en retard. */
  retardMoyenJours: number;
  /** L'action la plus anciennement dépassée, pour l'accroche du widget. */
  plusAncienne: { id: string; libelle: string; joursRetard: number } | null;
};

/**
 * Statistiques sur les actions dont l'échéance est dépassée.
 *
 * Requête dédiée qui lit TOUTES les échéances dépassées : une moyenne
 * calculée sur une liste tronquée serait fausse dès que l'établissement
 * dépasse la limite.
 */
export async function statsActionsEnRetard(
  etablissementId: string,
): Promise<StatsRetardActions> {
  const user = await requireUser();
  const now = new Date();

  const enRetard = await prisma.action.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
      statut: { in: ["ouverte", "en_cours"] },
      echeance: { lt: now },
    },
    select: { id: true, libelle: true, echeance: true },
    orderBy: { echeance: "asc" },
  });

  if (enRetard.length === 0) {
    return { nb: 0, retardMoyenJours: 0, plusAncienne: null };
  }

  const joursDepuis = (d: Date) =>
    Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));

  // `echeance` est non-null par construction du filtre `lt: now`.
  const retards = enRetard.map((a) => joursDepuis(a.echeance as Date));
  const moyenne = Math.round(
    retards.reduce((s, j) => s + j, 0) / retards.length,
  );

  return {
    nb: enRetard.length,
    retardMoyenJours: moyenne,
    plusAncienne: {
      id: enRetard[0].id,
      libelle: enRetard[0].libelle,
      joursRetard: retards[0],
    },
  };
}
