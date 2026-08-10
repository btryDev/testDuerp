import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { compterActions } from "@/lib/actions/queries";
import { compterEtatCalendrier } from "@/lib/calendrier/queries";
import { computeVigilance } from "@/lib/prestataires/vigilance";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";
import type { ModulesMatrice } from "./obligations";
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

/**
 * Raccourcit les libellés d'obligation verbeux pour les cartes
 * compactes de la frise.
 * « Vérification périodique annuelle installation électrique »
 *    → « Installation électrique »
 */
function libelleCourt(libelle: string): string {
  return libelle
    .replace(/^V[ée]rification\s+(p[ée]riodique\s+)?(annuelle|semestrielle|trimestrielle|mensuelle|hebdomadaire|biennale|triennale|quinquennale|d[ée]cennale)?\s*(des?\s+|de\s+|du\s+|d['’]\s*)?/i, "")
    .replace(/^Entretien\s+(annuel|semestriel|trimestriel)?\s*(des?\s+|de\s+|du\s+)?/i, "")
    .replace(/^Maintien\s+en\s+bon\s+[ée]tat\s+/i, "")
    .replace(/^Exercice\s+(d['’]\s*)?/i, "")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

export type EvenementFenetre = {
  id: string;
  libelle: string;
  date: Date;
  tone: "alerte" | "warn" | "ok";
  equipement: string;
};

/**
 * Liste tous les événements de vérification sur une fenêtre glissante
 * de `joursHorizon` jours à partir d'aujourd'hui. Utilisé par les
 * widgets « Semaine » (7 j) et « Météo » (30 j).
 *
 * Classification des tons :
 *   - alerte : statut depassee, ou planifiee dont la date est déjà passée
 *   - warn   : statut a_planifier (pas encore fixé)
 *   - ok     : planifiee dans le futur
 */
export async function listerEvenementsFenetre(
  etablissementId: string,
  joursHorizon: number,
  filtres?: {
    domaine?: DomaineObligation;
    /** Même sémantique que `listerVerifications` : a_planifier + depassee. */
    urgentsSeulement?: boolean;
  },
): Promise<EvenementFenetre[]> {
  const user = await requireUser();
  const now = new Date();
  // Même règle de jour calendaire que `compterEtatCalendrier` et
  // `tonPourDate` : daté d'aujourd'hui ≠ en retard.
  const debutDuJour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const fin = new Date(now.getTime() + joursHorizon * 86400000);

  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
      datePrevue: { lte: fin },
      // On garde tout ce qui est non réalisé — pour matérialiser les
      // retards et la charge à venir.
      dateRealisee: null,
      ...(filtres?.urgentsSeulement
        ? { statut: { in: ["a_planifier", "depassee"] } }
        : {}),
    },
    include: { equipement: { select: { libelle: true } } },
    orderBy: { datePrevue: "asc" },
  });

  // Filtre par domaine côté TS, comme `listerVerifications` : le domaine
  // est porté par l'obligation en référentiel, pas en base.
  const retenues = filtres?.domaine
    ? verifs.filter(
        (v) => obligationParId(v.obligationId)?.domaine === filtres.domaine,
      )
    : verifs;

  return retenues.map((v) => {
    const enRetard =
      v.statut === "depassee" ||
      (v.statut === "planifiee" && v.datePrevue < debutDuJour);
    const aPlanifier = v.statut === "a_planifier";
    const tone: "alerte" | "warn" | "ok" = enRetard
      ? "alerte"
      : aPlanifier
        ? "warn"
        : "ok";
    return {
      id: v.id,
      libelle: libelleCourt(v.libelleObligation),
      date: v.datePrevue,
      tone,
      equipement: v.equipement.libelle,
    };
  });
}

export type StatsEquipement = {
  enRetard: number;
  aPlanifier: number;
  sous30j: number;
  derniereRealisee: Date | null;
  prochaineDate: Date | null;
};

/**
 * Compte les vérifications par équipement — pour afficher des pastilles
 * de statut sur les cartes du widget « Équipements déclarés ».
 * Retourne une map `equipementId → stats`. Les équipements sans aucune
 * vérification n'apparaissent pas dans la map (l'appelant traite ça
 * comme « aucune vérification »).
 */
export async function compterVerifsParEquipement(
  etablissementId: string,
): Promise<Map<string, StatsEquipement>> {
  const user = await requireUser();
  const now = new Date();
  const dans30j = new Date(now.getTime() + 30 * 86400000);
  const ilYaUnAn = new Date(now.getTime() - 365 * 86400000);

  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
    select: {
      equipementId: true,
      statut: true,
      datePrevue: true,
      dateRealisee: true,
    },
  });

  const map = new Map<string, StatsEquipement>();
  const getStats = (id: string): StatsEquipement => {
    let s = map.get(id);
    if (!s) {
      s = {
        enRetard: 0,
        aPlanifier: 0,
        sous30j: 0,
        derniereRealisee: null,
        prochaineDate: null,
      };
      map.set(id, s);
    }
    return s;
  };

  for (const v of verifs) {
    const s = getStats(v.equipementId);
    const enRetard =
      v.statut === "depassee" ||
      (v.statut === "planifiee" && v.datePrevue < now);
    if (enRetard) s.enRetard += 1;
    if (v.statut === "a_planifier") s.aPlanifier += 1;
    if (
      v.statut === "planifiee" &&
      v.datePrevue >= now &&
      v.datePrevue <= dans30j
    )
      s.sous30j += 1;

    if (v.dateRealisee && v.dateRealisee >= ilYaUnAn) {
      if (!s.derniereRealisee || v.dateRealisee > s.derniereRealisee) {
        s.derniereRealisee = v.dateRealisee;
      }
    }
    if (
      v.statut === "planifiee" &&
      v.datePrevue >= now &&
      (!s.prochaineDate || v.datePrevue < s.prochaineDate)
    ) {
      s.prochaineDate = v.datePrevue;
    }
  }

  return map;
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

/**
 * Alimente les lignes « modules complémentaires » de la matrice
 * « Vos documents, en un coup d'œil » (voir `ModulesMatrice` pour les
 * règles d'apparition de chaque ligne). Uniquement des comptages et
 * des dates — les faits sont interprétés par `construireMatrice`.
 */
export async function getModulesMatrice(
  etablissementId: string,
  estERP: boolean,
): Promise<ModulesMatrice> {
  const user = await requireUser();
  const scope = {
    etablissementId,
    etablissement: { entreprise: { userId: user.id } },
  } as const;
  const now = new Date();
  // Statuts « encore ouverts » : tout sauf l'état final ou l'abandon.
  const permisOuverts = ["brouillon", "attente_signatures", "valide", "en_cours"] as const;
  const plansOuverts = ["brouillon", "inspection_faite", "attente_signatures", "valide"] as const;

  const [
    accessibilite,
    nbPermis,
    nbPermisEchus,
    nbPlans,
    nbPlansSansInspection,
    nbPlansEchus,
    carnet,
    prestataires,
  ] = await Promise.all([
    prisma.registreAccessibilite.findFirst({
      where: scope,
      select: { publie: true },
    }),
    prisma.permisFeu.count({ where: scope }),
    prisma.permisFeu.count({
      where: {
        ...scope,
        dateFin: { lt: now },
        statut: { in: [...permisOuverts] },
      },
    }),
    prisma.planPrevention.count({ where: scope }),
    prisma.planPrevention.count({
      where: {
        ...scope,
        statut: { in: [...plansOuverts] },
        inspectionDate: null,
      },
    }),
    prisma.planPrevention.count({
      where: {
        ...scope,
        dateFin: { lt: now },
        statut: { in: [...plansOuverts] },
      },
    }),
    prisma.carnetSanitaire.findFirst({
      where: scope,
      select: {
        id: true,
        _count: { select: { pointsReleve: { where: { actif: true } } } },
        analyses: {
          orderBy: { dateAnalyse: "desc" },
          take: 1,
          select: { dateAnalyse: true },
        },
      },
    }),
    prisma.prestataire.findMany({ where: scope }),
  ]);

  let jourDernierReleve: number | null = null;
  if (carnet) {
    const dernier = await prisma.releveTemperature.findFirst({
      where: { pointReleve: { carnetId: carnet.id, actif: true } },
      orderBy: { dateReleve: "desc" },
      select: { dateReleve: true },
    });
    if (dernier) {
      jourDernierReleve = Math.max(
        0,
        Math.floor((now.getTime() - dernier.dateReleve.getTime()) / JOUR_MS),
      );
    }
  }
  const derniereAnalyse = carnet?.analyses[0]?.dateAnalyse ?? null;

  return {
    estERP,
    accessibilite: {
      existe: accessibilite !== null,
      publie: accessibilite?.publie ?? false,
    },
    permisFeu: { total: nbPermis, echusNonClos: nbPermisEchus },
    plansPrevention: {
      total: nbPlans,
      sansInspection: nbPlansSansInspection,
      echusNonClos: nbPlansEchus,
    },
    carnetSanitaire: {
      existe: carnet !== null,
      nbPoints: carnet?._count.pointsReleve ?? 0,
      jourDernierReleve,
      jourDerniereAnalyse: derniereAnalyse
        ? Math.max(
            0,
            Math.floor((now.getTime() - derniereAnalyse.getTime()) / JOUR_MS),
          )
        : null,
    },
    prestataires: {
      total: prestataires.length,
      enAlerte: prestataires.filter(
        (p) => computeVigilance(p).alertesOuvertes > 0,
      ).length,
    },
  };
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
  // — le moteur de reco limite à 5 de toute façon). Les deux counts
  // alimentent les règles d'amorçage (6-8).
  const [verifications, actionsOuvertes, nbEquipements, nbRapports] =
    await Promise.all([
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
    prisma.equipement.count({ where: scope }),
    prisma.rapportVerification.count({
      where: { verification: scope },
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
      nbEquipements,
      duerpSecteurChoisi: duerp?.referentielSecteurId != null,
      nbRapports,
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
