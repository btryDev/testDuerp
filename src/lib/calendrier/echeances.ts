import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";

/**
 * Registre des sources d'échéances du calendrier — cf. ADR-010.
 *
 * Toute échéance datée du produit (hors vérifications périodiques, qui
 * ont leur flux historique dédié) passe par ici : une **source** par
 * module, un format unique `EcheanceCalendrier`, un agrégateur qui ne
 * connaît aucun module. Brancher un futur module (visites médicales,
 * formations…) = écrire sa source + l'ajouter à `SOURCES_ECHEANCES` —
 * le calendrier, les filtres, la légende et la liste suivent seuls,
 * puisqu'ils sont pilotés par la donnée.
 *
 * Les grandes familles, pensées pour un dirigeant non-expert :
 *   - `controle`  — faire vérifier (vérifs périodiques, légionelles) ;
 *   - `travaux`   — « Corrections & réparations » (actions, tickets,
 *     permis de feu, plans de prévention) ;
 *   - `papiers`   — « Documents à renouveler » (DUERP, attestations) ;
 *   - `personnel` — réservée aux modules à venir.
 *
 * Chaque ligne dit d'où elle sort en toutes lettres (`origine`) —
 * jamais de jargon interne en interface. Les classements par date sont
 * des fonctions pures, testées, à horloge injectée.
 */

export type FamilleEcheance = "controle" | "travaux" | "papiers" | "personnel";

export type EcheanceCalendrier = {
  /** Unique inter-modules : préfixé par le module (`action-…`). */
  id: string;
  famille: FamilleEcheance;
  libelle: string;
  /** D'où sort l'échéance, en langage courant (« Suite au contrôle… »,
   *  « Signalement n°7 », « À redemander au prestataire »). */
  origine: string;
  date: Date;
  /** Mêmes tons que la grille : dépassé = alerte, sinon ok. */
  tone: "alerte" | "ok";
  href: string;
};

/** Ce qu'une source reçoit : le périmètre déjà vérifié (ownership) et
 *  l'horloge du jour — elle n'a rien d'autre à savoir. */
type ContexteSource = {
  etablissementId: string;
  scope: {
    etablissementId: string;
    etablissement: { entreprise: { userId: string } };
  };
  aujourdhui: Date;
};

type SourceEcheances = (ctx: ContexteSource) => Promise<EcheanceCalendrier[]>;

const JOUR_MS = 86400000;
/** Un an — la mise à jour du DUERP est au moins annuelle (R. 4121-2 CT). */
export const JOURS_MAJ_DUERP = 365;
/** Un an — analyses légionelles ECS (arrêté du 1er février 2010, cité
 *  par le module carnet sanitaire). */
export const JOURS_ANALYSE_LEGIONELLES = 365;

/** Dépassé au lendemain, pas à la minute : une échéance datée
 *  d'aujourd'hui n'est pas « en retard » — la comparaison se fait au
 *  jour calendaire, pas à l'horodatage. */
export function tonPourDate(
  date: Date,
  aujourdhui: Date,
): "alerte" | "ok" {
  const debutDuJour = new Date(
    aujourdhui.getFullYear(),
    aujourdhui.getMonth(),
    aujourdhui.getDate(),
  );
  return date.getTime() < debutDuJour.getTime() ? "alerte" : "ok";
}

/* ─── Classements purs (testés) ─────────────────────────────── */

/** Origine d'une action corrective, en clair : elle naît soit d'un
 *  rapport de vérification (écart constaté), soit du DUERP (mesure de
 *  prévention à mettre en place) — cf. ADR-002. */
export function origineAction(a: {
  verificationLibelle: string | null;
  duerp: boolean;
}): string {
  if (a.verificationLibelle) {
    return `Suite au contrôle « ${a.verificationLibelle} »`;
  }
  if (a.duerp) return "Mesure prévue au DUERP";
  return "À faire sur place";
}

/** Échéance de mise à jour annuelle du DUERP : dernière version + 1 an.
 *  Sans version validée, il n'y a pas de date — le dossier DUERP a ses
 *  propres invitations, le calendrier ne montre que du daté. */
export function echeanceDuerp({
  etablissementId,
  dateDerniereVersion,
  aujourdhui,
}: {
  etablissementId: string;
  dateDerniereVersion: Date | null;
  aujourdhui: Date;
}): EcheanceCalendrier | null {
  if (!dateDerniereVersion) return null;
  const date = new Date(
    dateDerniereVersion.getTime() + JOURS_MAJ_DUERP * JOUR_MS,
  );
  return {
    id: "duerp-maj",
    famille: "papiers",
    libelle: "Mise à jour annuelle du DUERP",
    origine: "À refaire chaque année",
    date,
    tone: tonPourDate(date, aujourdhui),
    href: `/etablissements/${etablissementId}/duerp`,
  };
}

/** Expirations datées des pièces de vigilance d'un prestataire —
 *  URSSAF et RC Pro. Une pièce sans date (manquante) n'a pas de place
 *  sur un calendrier : c'est l'alerte vigilance qui la porte. */
export function echeancesPrestataire(
  p: {
    id: string;
    raisonSociale: string;
    attestationUrssafValableJusquA: Date | null;
    assuranceRcProValableJusquA: Date | null;
  },
  aujourdhui: Date,
  etablissementId: string,
): EcheanceCalendrier[] {
  const href = `/etablissements/${etablissementId}/prestataires/${p.id}`;
  const out: EcheanceCalendrier[] = [];
  if (p.attestationUrssafValableJusquA) {
    out.push({
      id: `prestataire-${p.id}-urssaf`,
      famille: "papiers",
      libelle: `Attestation URSSAF — ${p.raisonSociale}`,
      origine: "À redemander au prestataire",
      date: p.attestationUrssafValableJusquA,
      tone: tonPourDate(p.attestationUrssafValableJusquA, aujourdhui),
      href,
    });
  }
  if (p.assuranceRcProValableJusquA) {
    out.push({
      id: `prestataire-${p.id}-rcpro`,
      famille: "papiers",
      libelle: `Assurance RC Pro — ${p.raisonSociale}`,
      origine: "À redemander au prestataire",
      date: p.assuranceRcProValableJusquA,
      tone: tonPourDate(p.assuranceRcProValableJusquA, aujourdhui),
      href,
    });
  }
  return out;
}

/** Un permis de feu non soldé est un travau planifié : il apparaît à sa
 *  date de début. Alerte si cette date est passée sans que les travaux
 *  soient en cours — permis resté en brouillon ou en attente de
 *  signatures, c'est lui qu'il faut solder ou annuler. */
export function echeancePermisFeu(
  p: {
    id: string;
    numero: number;
    lieu: string;
    statut: string;
    dateDebut: Date;
  },
  aujourdhui: Date,
  etablissementId: string,
): EcheanceCalendrier {
  const demarre = p.statut === "en_cours";
  return {
    id: `permis-feu-${p.id}`,
    famille: "travaux",
    libelle: `Permis de feu n°${p.numero} — ${p.lieu}`,
    origine: "Travaux par point chaud",
    date: p.dateDebut,
    tone:
      !demarre && tonPourDate(p.dateDebut, aujourdhui) === "alerte"
        ? "alerte"
        : "ok",
    href: `/etablissements/${etablissementId}/permis-feu/${p.id}`,
  };
}

/** Une opération avec entreprise extérieure apparaît à sa date de début.
 *  Alerte si elle a commencé sans inspection commune préalable — c'est
 *  l'exigence de l'art. R. 4512-7. */
export function echeancePlanPrevention(
  p: {
    id: string;
    numero: number;
    entrepriseExterieureRaison: string;
    dateDebut: Date;
    inspectionDate: Date | null;
  },
  aujourdhui: Date,
  etablissementId: string,
): EcheanceCalendrier {
  const commenceSansInspection =
    p.inspectionDate === null &&
    tonPourDate(p.dateDebut, aujourdhui) === "alerte";
  return {
    id: `plan-prevention-${p.id}`,
    famille: "travaux",
    libelle: `Plan de prévention n°${p.numero} — ${p.entrepriseExterieureRaison}`,
    origine: "Opération avec entreprise extérieure",
    date: p.dateDebut,
    tone: commenceSansInspection ? "alerte" : "ok",
    href: `/etablissements/${etablissementId}/plan-prevention/${p.id}`,
  };
}

/** Prochaine analyse légionelles : dernière analyse + 1 an. Sans
 *  première analyse, pas de date dérivable — la matrice d'obligations
 *  porte l'invitation. */
export function echeanceLegionelles({
  etablissementId,
  dateDerniereAnalyse,
  aujourdhui,
}: {
  etablissementId: string;
  dateDerniereAnalyse: Date | null;
  aujourdhui: Date;
}): EcheanceCalendrier | null {
  if (!dateDerniereAnalyse) return null;
  const date = new Date(
    dateDerniereAnalyse.getTime() + JOURS_ANALYSE_LEGIONELLES * JOUR_MS,
  );
  return {
    id: "legionelles-analyse",
    famille: "controle",
    libelle: "Analyse légionelles (eau chaude sanitaire)",
    origine: "Carnet sanitaire · rythme annuel",
    date,
    tone: tonPourDate(date, aujourdhui),
    href: `/etablissements/${etablissementId}/carnet-sanitaire`,
  };
}

/* ─── Les sources (une par module) ──────────────────────────── */

const sourceActions: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const actions = await prisma.action.findMany({
    where: {
      ...scope,
      statut: { in: ["ouverte", "en_cours"] },
      echeance: { not: null },
    },
    select: {
      id: true,
      libelle: true,
      echeance: true,
      risqueId: true,
      verification: { select: { libelleObligation: true } },
    },
  });
  return actions.flatMap((a) =>
    a.echeance
      ? [
          {
            id: `action-${a.id}`,
            famille: "travaux" as const,
            libelle: a.libelle,
            origine: origineAction({
              verificationLibelle: a.verification?.libelleObligation ?? null,
              duerp: a.risqueId !== null,
            }),
            date: a.echeance,
            tone: tonPourDate(a.echeance, aujourdhui),
            href: `/etablissements/${etablissementId}/actions/${a.id}`,
          },
        ]
      : [],
  );
};

const sourceInterventions: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const interventions = await prisma.intervention.findMany({
    where: {
      ...scope,
      statut: { in: ["ouvert", "assigne", "en_cours"] },
      echeance: { not: null },
    },
    select: { id: true, titre: true, numero: true, echeance: true },
  });
  return interventions.flatMap((i) =>
    i.echeance
      ? [
          {
            id: `intervention-${i.id}`,
            famille: "travaux" as const,
            libelle: i.titre,
            origine: `Signalement n°${i.numero}`,
            date: i.echeance,
            tone: tonPourDate(i.echeance, aujourdhui),
            href: `/etablissements/${etablissementId}/interventions/${i.id}`,
          },
        ]
      : [],
  );
};

const sourceDuerp: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const duerp = await prisma.duerp.findFirst({
    where: scope,
    select: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
  const e = echeanceDuerp({
    etablissementId,
    dateDerniereVersion: duerp?.versions[0]?.createdAt ?? null,
    aujourdhui,
  });
  return e ? [e] : [];
};

const sourcePrestataires: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const prestataires = await prisma.prestataire.findMany({
    where: scope,
    select: {
      id: true,
      raisonSociale: true,
      attestationUrssafValableJusquA: true,
      assuranceRcProValableJusquA: true,
    },
  });
  return prestataires.flatMap((p) =>
    echeancesPrestataire(p, aujourdhui, etablissementId),
  );
};

const sourcePermisFeu: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const permis = await prisma.permisFeu.findMany({
    where: {
      ...scope,
      statut: { notIn: ["termine", "annule"] },
    },
    select: {
      id: true,
      numero: true,
      lieu: true,
      statut: true,
      dateDebut: true,
    },
  });
  return permis.map((p) => echeancePermisFeu(p, aujourdhui, etablissementId));
};

const sourcePlansPrevention: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const plans = await prisma.planPrevention.findMany({
    where: {
      ...scope,
      // L'opération n'apparaît que tant qu'elle n'est pas finie.
      dateFin: { gte: aujourdhui },
    },
    select: {
      id: true,
      numero: true,
      entrepriseExterieureRaison: true,
      dateDebut: true,
      inspectionDate: true,
    },
  });
  return plans.map((p) =>
    echeancePlanPrevention(p, aujourdhui, etablissementId),
  );
};

const sourceLegionelles: SourceEcheances = async ({
  scope,
  aujourdhui,
  etablissementId,
}) => {
  const carnet = await prisma.carnetSanitaire.findFirst({
    where: scope,
    select: {
      analyses: {
        orderBy: { dateAnalyse: "desc" },
        take: 1,
        select: { dateAnalyse: true },
      },
    },
  });
  const e = echeanceLegionelles({
    etablissementId,
    dateDerniereAnalyse: carnet?.analyses[0]?.dateAnalyse ?? null,
    aujourdhui,
  });
  return e ? [e] : [];
};

/**
 * Le registre — ADR-010. Un module qui crée des échéances datées DOIT
 * figurer ici (ou dans les exclusions documentées de l'ADR) ; c'est la
 * garantie que le calendrier ne ment pas par omission.
 */
const SOURCES_ECHEANCES: SourceEcheances[] = [
  sourceActions,
  sourceInterventions,
  sourceDuerp,
  sourcePrestataires,
  sourcePermisFeu,
  sourcePlansPrevention,
  sourceLegionelles,
];

/** Toutes les échéances datées hors vérifications périodiques, triées
 *  par date — l'agrégation du registre, rien d'autre. */
export async function listerAutresEcheances(
  etablissementId: string,
): Promise<EcheanceCalendrier[]> {
  const user = await requireUser();
  const ctx: ContexteSource = {
    etablissementId,
    scope: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
    aujourdhui: new Date(),
  };

  const listes = await Promise.all(SOURCES_ECHEANCES.map((s) => s(ctx)));
  return listes.flat().sort((a, b) => a.date.getTime() - b.date.getTime());
}
