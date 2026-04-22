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
  /** Nombre d'autres événements dans ce mois, au-delà de celui représenté.
   * Permet d'afficher un badge « +N » cliquable dans la frise. */
  autres: number;
  /** Les autres événements du mois, prêts à être dépliés sous la carte
   * principale quand l'utilisateur clique sur le badge. */
  autresItems: Array<{ libelle: string; tag: string; hot: boolean }>;
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
    const existant = buckets[m];

    if (!existant) {
      buckets[m] = {
        mois: m,
        libelle: libelleCourt(v.libelleObligation),
        tag: libellePeriodicite(v.periodicite),
        hot: v.statut === "depassee",
        autres: 0,
        autresItems: [],
      };
    } else {
      // Déjà un événement ce mois-ci — on incrémente le compteur et
      // on empile le détail pour l'affichage déplié. Upgrade en "hot"
      // si au moins un événement du mois est dépassé.
      existant.autres += 1;
      existant.autresItems.push({
        libelle: libelleCourt(v.libelleObligation),
        tag: libellePeriodicite(v.periodicite),
        hot: v.statut === "depassee",
      });
      if (v.statut === "depassee") existant.hot = true;
    }
  }

  return buckets;
}

/**
 * Raccourcit les libellés d'obligation verbeux pour la frise compacte.
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
