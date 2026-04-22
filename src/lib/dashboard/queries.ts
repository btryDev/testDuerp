import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
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

export type BarMois = {
  mois: number; // 0-11
  annee: number;
  couvert: number;
  aVenir: number;
  retard: number;
};

export type EvenementMoisReel = {
  mois: number; // 0-11
  libelle: string;
  tag: string;
  hot: boolean;
};

/**
 * Pour la frise "Calendrier" — pour chaque mois de l'année courante,
 * on retient **un seul événement** (la vérif la plus ancienne du mois)
 * avec son libellé et son tag périodicité. Les mois sans aucune vérif
 * renvoient `null` (affichage "période calme").
 *
 * `hot = true` si la vérif est dépassée OU si c'est la première
 * occurrence annuelle d'un DUERP ou contrôle majeur — simple heuristique.
 */
export async function listerEvenementsParMois(
  etablissementId: string,
  annee: number = new Date().getFullYear(),
): Promise<Array<EvenementMoisReel | null>> {
  const user = await requireUser();
  const debut = new Date(annee, 0, 1);
  const fin = new Date(annee + 1, 0, 1);

  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
      OR: [
        { datePrevue: { gte: debut, lt: fin } },
        { dateRealisee: { gte: debut, lt: fin } },
      ],
    },
    select: {
      libelleObligation: true,
      datePrevue: true,
      dateRealisee: true,
      periodicite: true,
      statut: true,
    },
    orderBy: { datePrevue: "asc" },
  });

  const buckets: Array<EvenementMoisReel | null> = Array.from(
    { length: 12 },
    () => null,
  );

  for (const v of verifs) {
    const ref = v.dateRealisee ?? v.datePrevue;
    if (ref.getFullYear() !== annee) continue;
    const m = ref.getMonth();
    if (buckets[m]) continue; // on garde seulement le premier

    buckets[m] = {
      mois: m,
      libelle: v.libelleObligation,
      tag: libellePeriodicite(v.periodicite),
      hot: v.statut === "depassee",
    };
  }

  return buckets;
}

function libellePeriodicite(p: string): string {
  switch (p) {
    case "hebdomadaire":
      return "Hebdo";
    case "mensuelle":
      return "Mensuel";
    case "trimestrielle":
      return "Trimestriel";
    case "semestrielle":
      return "Semestriel";
    case "annuelle":
      return "Annuel";
    case "biennale":
      return "Biennal";
    case "triennale":
      return "Triennal";
    case "quinquennale":
      return "Quinquennal";
    case "decennale":
      return "Décennal";
    case "mise_en_service_uniquement":
      return "Mise en service";
    default:
      return "Périodique";
  }
}

/**
 * Agrège les vérifications de l'année civile courante par mois, pour les
 * barres du dashboard. Utilisé par `BarsObligations`. Scoping par user
 * via la chaîne etablissement.entreprise.userId.
 *
 * Classification :
 *  - `couvert`  : dateRealisee dans le mois (quel que soit le résultat)
 *  - `retard`   : statut depassee, ou (a_planifier/planifiee avec datePrevue < aujourd'hui)
 *  - `aVenir`   : planifiée/a_planifier dans le futur
 *
 * On bucket sur `dateRealisee ?? datePrevue` — un rapport réalisé en mai
 * apparaît bien dans le mois de mai, même si la datePrevue était ailleurs.
 */
export async function compterObligationsParMois(
  etablissementId: string,
  annee: number = new Date().getFullYear(),
): Promise<BarMois[]> {
  const user = await requireUser();
  const debut = new Date(annee, 0, 1);
  const fin = new Date(annee + 1, 0, 1);

  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
      OR: [
        { datePrevue: { gte: debut, lt: fin } },
        { dateRealisee: { gte: debut, lt: fin } },
      ],
    },
    select: {
      datePrevue: true,
      dateRealisee: true,
      statut: true,
    },
  });

  const buckets: BarMois[] = Array.from({ length: 12 }, (_, i) => ({
    mois: i,
    annee,
    couvert: 0,
    aVenir: 0,
    retard: 0,
  }));

  const now = new Date();
  for (const v of verifs) {
    const ref = v.dateRealisee ?? v.datePrevue;
    if (ref.getFullYear() !== annee) continue;
    const m = ref.getMonth();

    if (v.dateRealisee) {
      buckets[m].couvert += 1;
    } else if (
      v.statut === "depassee" ||
      (v.statut === "planifiee" && v.datePrevue < now)
    ) {
      // Retard strict : la date prévue est passée sans rapport.
      // `a_planifier` n'est PAS un retard — l'utilisateur n'a simplement
      // pas encore planifié (cas typique d'un équipement nouvellement
      // déclaré). Il est comptabilisé comme « à venir ».
      buckets[m].retard += 1;
    } else {
      buckets[m].aVenir += 1;
    }
  }

  return buckets;
}

export type DashboardData = {
  score: Score;
  recommandations: Recommandation[];
  compteurs: {
    verifsEnRetard: number;
    verifsAPlanifier: number;
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
  const user = await requireUser();
  const scope = {
    etablissementId,
    etablissement: { entreprise: { userId: user.id } },
  } as const;

  // Agrégats existants déjà optimisés
  const [etatCalendrier, compteursActions, duerp] = await Promise.all([
    compterEtatCalendrier(etablissementId),
    compterActions(etablissementId),
    prisma.duerp.findFirst({
      where: {
        etablissementId,
        etablissement: { entreprise: { userId: user.id } },
      },
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
      where: scope,
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
        ...scope,
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
      etatCalendrier.aPlanifier +
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
      verifsAPlanifier: etatCalendrier.aPlanifier,
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
