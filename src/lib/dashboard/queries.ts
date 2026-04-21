import { prisma } from "@/lib/prisma";
import { compterActions } from "@/lib/actions/queries";
import { compterEtatCalendrier } from "@/lib/calendrier/queries";
import {
  calculerScoreConformite,
  type Score,
} from "./score";
import {
  genererRecommandations,
  type Recommandation,
} from "./recommandations";

const JOUR_MS = 1000 * 60 * 60 * 24;

export type DashboardData = {
  score: Score;
  recommandations: Recommandation[];
  compteurs: {
    verifsEnRetard: number;
    verifsSous30j: number;
    verifsRealisees12m: number;
    actionsOuvertes: number;
    actionsEnCours: number;
    actionsEnRetard: number;
    actionsLeveesRecemment: number;
  };
  duerp: {
    existe: boolean;
    duerpId: string | null;
    derniereVersionAu: Date | null;
    ageJours: number | null;
    estAJour: boolean; // < 12 mois
  };
};

export async function getDashboardData(
  etablissementId: string,
): Promise<DashboardData> {
  // Agrégats existants déjà optimisés
  const [etatCalendrier, compteursActions, duerp] = await Promise.all([
    compterEtatCalendrier(etablissementId),
    compterActions(etablissementId),
    prisma.duerp.findFirst({
      where: { etablissementId },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: { orderBy: { numero: "desc" }, take: 1 },
      },
    }),
  ]);

  // Données brutes pour recommandations (15 vérifs + 15 actions suffisent
  // — le moteur de reco limite à 5 de toute façon).
  const [verifications, actionsOuvertes] = await Promise.all([
    prisma.verification.findMany({
      where: { etablissementId },
      select: {
        id: true,
        statut: true,
        datePrevue: true,
        libelleObligation: true,
        equipement: { select: { libelle: true } },
      },
      orderBy: { datePrevue: "asc" },
      take: 30,
    }),
    prisma.action.findMany({
      where: {
        etablissementId,
        statut: { in: ["ouverte", "en_cours"] },
      },
      select: {
        id: true,
        statut: true,
        echeance: true,
        libelle: true,
      },
      orderBy: { echeance: "asc" },
      take: 30,
    }),
  ]);

  const now = new Date();
  const derniereVersion = duerp?.versions[0] ?? null;
  const ageJours =
    derniereVersion !== null
      ? Math.round((now.getTime() - derniereVersion.createdAt.getTime()) / JOUR_MS)
      : null;

  const score = calculerScoreConformite({
    verifsTotal:
      etatCalendrier.enRetard +
      etatCalendrier.aVenir +
      etatCalendrier.realisees12m,
    verifsEnRetard: etatCalendrier.enRetard,
    actionsOuvertesTotal: compteursActions.totalACouvrir,
    actionsEnRetard: compteursActions.enRetard,
    duerpAgeJours: ageJours ?? undefined,
  });

  const recommandations = genererRecommandations(
    {
      etablissementId,
      verifications: verifications.map((v) => ({
        id: v.id,
        statut: v.statut,
        datePrevue: v.datePrevue,
        libelleObligation: v.libelleObligation,
        equipementLibelle: v.equipement.libelle,
      })),
      actions: actionsOuvertes.map((a) => ({
        id: a.id,
        statut: a.statut,
        echeance: a.echeance,
        libelle: a.libelle,
      })),
      duerpAgeJours: ageJours ?? undefined,
      duerpId: duerp?.id,
    },
    { now },
  );

  return {
    score,
    recommandations,
    compteurs: {
      verifsEnRetard: etatCalendrier.enRetard,
      verifsSous30j: etatCalendrier.aVenir,
      verifsRealisees12m: etatCalendrier.realisees12m,
      actionsOuvertes: compteursActions.ouvertes,
      actionsEnCours: compteursActions.enCours,
      actionsEnRetard: compteursActions.enRetard,
      actionsLeveesRecemment: compteursActions.leveesRecemment,
    },
    duerp: {
      existe: Boolean(duerp),
      duerpId: duerp?.id ?? null,
      derniereVersionAu: derniereVersion?.createdAt ?? null,
      ageJours,
      estAJour: ageJours !== null && ageJours < 365,
    },
  };
}
