import type { StatutPermisFeu, StatutPlanPrevention } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { JOURS_APRES } from "@/lib/dashboard/frise";
import {
  MOIS_PERIODE_ANNUELLE,
  ajouterJours,
  ajouterMois,
  debutDuJour,
} from "@/lib/dates";
import { estEnRetard } from "@/lib/dates/retard";

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
 *   - `controle`   — faire vérifier (vérifs périodiques, légionelles) ;
 *   - `travaux`    — « Corrections & réparations » : un écart constaté à
 *     reprendre (actions du DUERP, actions de vérification, tickets) ;
 *   - `operations` — « Opérations encadrées » : un chantier daté dont le
 *     préalable est obligatoire (permis de feu, plan de prévention) ;
 *   - `papiers`    — « Documents à renouveler » (DUERP, attestations) ;
 *   - `personnel`  — réservée aux modules à venir.
 *
 * Chaque ligne dit d'où elle sort en toutes lettres (`origine`) —
 * jamais de jargon interne en interface. Les classements par date sont
 * des fonctions pures, testées, à horloge injectée.
 */

export type FamilleEcheance =
  | "controle"
  | "travaux"
  | "operations"
  | "papiers"
  | "personnel";

/**
 * Ce qu'une échéance **est** (ADR-016).
 *
 * La famille regroupe pour filtrer ; le type nomme. `travaux` fusionne quatre
 * objets — une action née du DUERP et un signalement de terrain y voisinent —
 * et un dirigeant qui lit « Corrections » ne sait pas lequel il a sous les
 * yeux. (L'ADR-017 en a sorti les deux qui n'y étaient pas des corrections.)
 */
export type TypeEcheance =
  | "verification"
  | "action-duerp"
  | "action-verification"
  | "intervention"
  | "permis-feu"
  | "plan-prevention"
  | "duerp-maj"
  | "attestation"
  | "legionelles";

/**
 * La famille se **déduit** du type : une source ne la pose plus à la main,
 * donc ne peut plus s'en tromper, ni deux sources se contredire. Ajouter un
 * type sans le rattacher ici ne compile pas.
 */
export const FAMILLE_DE_TYPE: Record<TypeEcheance, FamilleEcheance> = {
  verification: "controle",
  legionelles: "controle",
  "action-duerp": "travaux",
  "action-verification": "travaux",
  intervention: "travaux",
  // Ni des corrections ni des registres : des opérations ponctuelles.
  // Un permis de feu ne répare rien, il autorise un travail par point
  // chaud et impose une surveillance après ; un plan de prévention
  // encadre la venue d'un tiers et impose une inspection commune avant
  // (ADR-017).
  "permis-feu": "operations",
  "plan-prevention": "operations",
  "duerp-maj": "papiers",
  attestation: "papiers",
};

export type EcheanceCalendrier = {
  /** Unique inter-modules : préfixé par le module (`action-…`). */
  id: string;
  /** Ce que c'est. La famille en dérive — cf. `FAMILLE_DE_TYPE`. */
  type: TypeEcheance;
  famille: FamilleEcheance;
  libelle: string;
  /** Le **complément** que le type ne dit pas : le libellé de la
   *  vérification dont sort une action, le numéro d'un signalement. Le mot
   *  standard, lui, vient du type (ADR-016). */
  origine: string;
  date: Date;
  /** Mêmes tons que la grille : dépassé = alerte, sinon ok. */
  tone: "alerte" | "ok";
  href: string;
  /** Où ça se passe (ADR-019). `null` = l'établissement entier : mise à
   *  jour du DUERP, attestation d'un prestataire, action née d'un risque.
   *  Sous un filtre par bâtiment, ces lignes **restent visibles** — les
   *  masquer ferait mentir le calendrier par omission (ADR-010). */
  batiment: BatimentEcheance | null;
};

export type BatimentEcheance = { id: string; nom: string };

/**
 * Applique un filtre par bâtiment à une liste d'échéances. Une échéance
 * sans bâtiment concerne tout l'établissement, donc aussi celui-ci : elle
 * passe. Fonction pure, partagée par le calendrier et le tableau de bord.
 */
export function filtrerParBatiment<T extends { batiment: BatimentEcheance | null }>(
  echeances: T[],
  batimentId: string | undefined,
): T[] {
  if (!batimentId) return echeances;
  return echeances.filter(
    (e) => e.batiment === null || e.batiment.id === batimentId,
  );
}

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

/** Un an — la mise à jour du DUERP est au moins annuelle (R. 4121-2 CT).
 *  Exprimé en **mois calendaires** : `+ 365 jours` dérive d'un jour à
 *  chaque bissextile traversée et d'une heure à chaque changement
 *  d'heure, ce qui suffit à faire changer de jour une date stockée à
 *  minuit (ADR-011). */
export const MOIS_MAJ_DUERP = MOIS_PERIODE_ANNUELLE;
/** Un an — analyses légionelles ECS (arrêté du 1er février 2010, cité
 *  par le module carnet sanitaire). Même arithmétique calendaire. */
export const MOIS_ANALYSE_LEGIONELLES = MOIS_PERIODE_ANNUELLE;

/** Statuts qui soldent un permis de feu — au-delà, plus rien à faire.
 *  Miroir exact des `permisOuverts` du tableau de bord : les deux écrans
 *  doivent parler du même ensemble. Le `satisfies` garantit qu'un statut
 *  ajouté à l'enum ne passe pas inaperçu ici. */
export const STATUTS_PERMIS_FEU_CLOS = [
  "termine",
  "annule",
] as const satisfies readonly StatutPermisFeu[];
/** Idem pour une opération avec entreprise extérieure. */
export const STATUTS_PLAN_PREVENTION_CLOS = [
  "clos",
  "annule",
] as const satisfies readonly StatutPlanPrevention[];

/** Le statut lu depuis une donnée non typée (test, snapshot) est une
 *  chaîne : on compare sans forcer l'enum. */
function estClos(statuts: readonly string[], statut: string): boolean {
  return statuts.includes(statut);
}

/** Dépassé au lendemain, pas à la minute : une échéance datée
 *  d'aujourd'hui n'est pas « en retard ». Simple habillage du prédicat
 *  canonique (`estEnRetard`) dans le vocabulaire de tons de la grille —
 *  la règle de retard, elle, n'existe qu'à un seul endroit (ADR-011). */
export function tonPourDate(
  date: Date,
  aujourdhui: Date,
): "alerte" | "ok" {
  return estEnRetard(date, aujourdhui) ? "alerte" : "ok";
}

/* ─── Classements purs (testés) ─────────────────────────────── */

/**
 * Ce qu'une action est, et le complément qui la situe (ADR-002, ADR-016).
 *
 * Le XOR du modèle tranche le type sans colonne nouvelle, et il ne laisse
 * que **deux** cas : une action se rattache à exactement un risque du DUERP
 * ou une vérification, jamais aux deux, jamais à aucun. Une troisième
 * branche « action sans origine » a existé ici ; elle décrivait un état que
 * la contrainte `Action_origine_xor` et `assertOrigineActionValide`
 * interdisent tous deux, et n'a donc jamais pu s'afficher.
 *
 * `libelleObligation` étant non nul en base, son absence signifie
 * exactement « pas de vérification » — donc « rattachée à un risque ». Un
 * second paramètre `duerp` doublait cette information et pouvait la
 * contredire.
 *
 * `origine` ne répète pas le mot porté par le type : elle ne dit que ce
 * qu'il ignore — de quelle vérification l'écart provient. Écrire « Suite au
 * contrôle "X" » dupliquait le marqueur de nature posé juste à côté, et
 * employait « contrôle » au sens réservé à la visite d'un tiers (ADR-015).
 */
export function origineAction(a: {
  verificationLibelle: string | null;
}): { type: TypeEcheance; origine: string } {
  if (a.verificationLibelle) {
    return {
      type: "action-verification",
      // « suite à » et non « suite à la vérification » : les libellés
      // d'obligation commencent presque tous par le mot « Vérification »,
      // et la phrase bégayait.
      origine: `suite à « ${a.verificationLibelle} »`,
    };
  }
  return { type: "action-duerp", origine: "prévue au DUERP" };
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
  const date = ajouterMois(dateDerniereVersion, MOIS_MAJ_DUERP);
  return {
    id: "duerp-maj",
    type: "duerp-maj",
    famille: FAMILLE_DE_TYPE["duerp-maj"],
    libelle: "Mise à jour annuelle du DUERP",
    origine: "à refaire chaque année",
    date,
    tone: tonPourDate(date, aujourdhui),
    href: `/etablissements/${etablissementId}/duerp`,
    batiment: null,
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
      type: "attestation",
      famille: FAMILLE_DE_TYPE.attestation,
      libelle: `Attestation URSSAF — ${p.raisonSociale}`,
      origine: "à redemander au prestataire",
      date: p.attestationUrssafValableJusquA,
      tone: tonPourDate(p.attestationUrssafValableJusquA, aujourdhui),
      href,
      batiment: null,
    });
  }
  if (p.assuranceRcProValableJusquA) {
    out.push({
      id: `prestataire-${p.id}-rcpro`,
      type: "attestation",
      famille: FAMILLE_DE_TYPE.attestation,
      libelle: `Assurance RC Pro — ${p.raisonSociale}`,
      origine: "à redemander au prestataire",
      date: p.assuranceRcProValableJusquA,
      tone: tonPourDate(p.assuranceRcProValableJusquA, aujourdhui),
      href,
      batiment: null,
    });
  }
  return out;
}

/** Un permis de feu non soldé est un travail planifié : il apparaît à sa
 *  date de début. Deux motifs d'alerte, et un seul motif de silence :
 *
 *   - la date de début est passée sans que les travaux soient en cours —
 *     permis resté en brouillon ou en attente de signatures, c'est lui
 *     qu'il faut solder ou annuler ;
 *   - la date de fin est passée et le permis n'est toujours pas soldé —
 *     exactement ce que la matrice « Vos documents » du tableau de bord
 *     compte en « échus non clos ». Sans cette branche, la pastille du
 *     board renvoyait vers un calendrier qui ne montrait rien.
 *
 *  Un permis terminé ou annulé n'alerte jamais, quelles que soient ses
 *  dates. */
export function echeancePermisFeu(
  p: {
    id: string;
    numero: number;
    lieu: string;
    statut: string;
    dateDebut: Date;
    dateFin: Date;
    batiment?: BatimentEcheance | null;
  },
  aujourdhui: Date,
  etablissementId: string,
): EcheanceCalendrier {
  const clos = estClos(STATUTS_PERMIS_FEU_CLOS, p.statut);
  const demarre = p.statut === "en_cours";
  const debutManque = !demarre && estEnRetard(p.dateDebut, aujourdhui);
  const finDepassee = estEnRetard(p.dateFin, aujourdhui);
  return {
    id: `permis-feu-${p.id}`,
    type: "permis-feu",
    famille: FAMILLE_DE_TYPE["permis-feu"],
    libelle: `Permis de feu n°${p.numero} — ${p.lieu}`,
    origine: "travaux par point chaud",
    date: p.dateDebut,
    tone: !clos && (debutManque || finDepassee) ? "alerte" : "ok",
    href: `/etablissements/${etablissementId}/permis-feu/${p.id}`,
    batiment: p.batiment ?? null,
  };
}

/** Une opération avec entreprise extérieure apparaît à sa date de début.
 *  Mêmes deux motifs d'alerte que le permis de feu, son module jumeau :
 *
 *   - elle a commencé sans inspection commune préalable — exigence de
 *     l'art. R. 4512-7 ;
 *   - sa date de fin est passée et l'opération n'est ni close ni annulée
 *     (« échue non close » du tableau de bord).
 *
 *  Une opération close ou annulée n'alerte jamais. */
export function echeancePlanPrevention(
  p: {
    id: string;
    numero: number;
    entrepriseExterieureRaison: string;
    statut: string;
    dateDebut: Date;
    dateFin: Date;
    inspectionDate: Date | null;
    batiment?: BatimentEcheance | null;
  },
  aujourdhui: Date,
  etablissementId: string,
): EcheanceCalendrier {
  const clos = estClos(STATUTS_PLAN_PREVENTION_CLOS, p.statut);
  const commenceSansInspection =
    p.inspectionDate === null && estEnRetard(p.dateDebut, aujourdhui);
  const finDepassee = estEnRetard(p.dateFin, aujourdhui);
  return {
    id: `plan-prevention-${p.id}`,
    type: "plan-prevention",
    famille: FAMILLE_DE_TYPE["plan-prevention"],
    libelle: `Plan de prévention n°${p.numero} — ${p.entrepriseExterieureRaison}`,
    origine: "opération avec entreprise extérieure",
    date: p.dateDebut,
    tone: !clos && (commenceSansInspection || finDepassee) ? "alerte" : "ok",
    href: `/etablissements/${etablissementId}/plan-prevention/${p.id}`,
    batiment: p.batiment ?? null,
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
  const date = ajouterMois(dateDerniereAnalyse, MOIS_ANALYSE_LEGIONELLES);
  return {
    id: "legionelles-analyse",
    type: "legionelles",
    famille: FAMILLE_DE_TYPE.legionelles,
    libelle: "Analyse légionelles (eau chaude sanitaire)",
    origine: "carnet sanitaire · rythme annuel",
    date,
    tone: tonPourDate(date, aujourdhui),
    href: `/etablissements/${etablissementId}/carnet-sanitaire`,
    // L'analyse porte sur le réseau, et le carnet est un par établissement
    // (dette assumée, ADR-019).
    batiment: null,
  };
}

/* ─── Les sources (une par module) ──────────────────────────── */

/**
 * Actions correctives ouvertes.
 *
 * **Angle mort assumé** : une action sans échéance n'a pas de jour où se
 * poser — le calendrier ne montre que du daté, et inventer une date
 * serait un mensonge d'affichage. Elle n'est pas perdue pour autant :
 * `compterActions().sansEcheance` (`src/lib/actions/queries.ts`) la
 * dénombre pour que l'interface puisse inviter à la dater, sur le modèle
 * du `nbSansDate` déjà affiché par la grille pour les vérifications à
 * planifier.
 */
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
      verification: {
        select: {
          libelleObligation: true,
          equipement: {
            select: { batiment: { select: { id: true, nom: true } } },
          },
        },
      },
    },
  });
  return actions.flatMap((a) =>
    a.echeance
      ? [
          {
            id: `action-${a.id}`,
            ...origineAction({
              verificationLibelle: a.verification?.libelleObligation ?? null,
            }),
            famille: "travaux" as const,
            libelle: a.libelle,
            date: a.echeance,
            tone: tonPourDate(a.echeance, aujourdhui),
            href: `/etablissements/${etablissementId}/actions/${a.id}`,
            // Une action de vérification est là où est l'équipement ; une
            // action du DUERP relève d'une unité de travail, qui peut
            // traverser les bâtiments.
            batiment: a.verification?.equipement.batiment ?? null,
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
            type: "intervention" as const,
            famille: FAMILLE_DE_TYPE.intervention,
            libelle: i.titre,
            origine: `n°${i.numero}`,
            date: i.echeance,
            tone: tonPourDate(i.echeance, aujourdhui),
            href: `/etablissements/${etablissementId}/interventions/${i.id}`,
            batiment: null,
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
  // Sélection **déterministe**, et identique à celle du tableau de bord :
  // `findFirst` sans `orderBy` laisse Postgres rendre la ligne qu'il veut.
  // Avec plusieurs DUERP, l'échéance « mise à jour annuelle » et l'âge
  // affiché au board pouvaient porter sur deux documents différents. La
  // contrainte d'unicité `Duerp.etablissementId` rend le cas impossible en
  // base, mais l'ordre reste explicite : une requête ne doit pas dépendre
  // d'un invariant écrit ailleurs. Les versions sont ordonnées par
  // `numero` (unique par DUERP), et non par `createdAt` qui peut être
  // partagé par deux lignes d'une même transaction.
  const duerp = await prisma.duerp.findFirst({
    where: scope,
    orderBy: { updatedAt: "desc" },
    select: {
      versions: {
        orderBy: { numero: "desc" },
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
      // Seul le cycle de vie décide de la sortie du calendrier — jamais la
      // date : un permis échu mais non soldé doit rester visible, c'est
      // précisément l'anomalie à traiter.
      statut: { notIn: [...STATUTS_PERMIS_FEU_CLOS] },
    },
    select: {
      id: true,
      numero: true,
      lieu: true,
      statut: true,
      dateDebut: true,
      dateFin: true,
      batiment: { select: { id: true, nom: true } },
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
      // Le cycle de vie décide, pas la date — symétriquement au module
      // jumeau (permis de feu). L'ancien filtre `dateFin >= aujourd'hui`
      // faisait disparaître du calendrier les opérations échues et non
      // closes, celles-là mêmes que le tableau de bord compte en « échues
      // non closes » : l'utilisateur cliquait sur la pastille et ne
      // trouvait rien. Il laissait à l'inverse une opération soldée mais
      // datée du mois prochain s'afficher comme travaux à venir.
      statut: { notIn: [...STATUTS_PLAN_PREVENTION_CLOS] },
    },
    select: {
      id: true,
      numero: true,
      entrepriseExterieureRaison: true,
      statut: true,
      dateDebut: true,
      dateFin: true,
      inspectionDate: true,
      batiment: { select: { id: true, nom: true } },
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
  // `CarnetSanitaire.etablissementId` est unique : la ligne est
  // déterminée. Le départage des analyses, lui, ne l'est pas — deux
  // analyses peuvent porter la même `dateAnalyse` (deux points de relevé
  // le même jour) : on tranche par ordre d'enregistrement.
  const carnet = await prisma.carnetSanitaire.findFirst({
    where: scope,
    select: {
      analyses: {
        orderBy: [{ dateAnalyse: "desc" }, { createdAt: "desc" }],
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

/**
 * Toutes les échéances datées hors vérifications périodiques, triées par
 * date — l'agrégation du registre, rien d'autre.
 *
 * **Fenêtre** : la même que le flux des vérifications
 * (`listerEvenementsFenetre`, bornée à `JOURS_APRES`). Pas de borne
 * basse — un retard remonte quelle que soit son ancienneté ; borne haute
 * à deux ans, sans quoi une attestation valable jusqu'en 2031 se posait
 * seule sur la frise, dans une période où aucune vérification n'était
 * chargée : l'utilisateur y lisait « rien d'autre à faire » alors que
 * seule la moitié des sources y était représentée.
 */
export async function listerAutresEcheances(
  etablissementId: string,
  aujourdhui: Date = new Date(),
): Promise<EcheanceCalendrier[]> {
  const user = await requireUser();
  const ctx: ContexteSource = {
    etablissementId,
    scope: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
    aujourdhui,
  };

  const finFenetre = ajouterJours(debutDuJour(aujourdhui), JOURS_APRES);
  const listes = await Promise.all(SOURCES_ECHEANCES.map((s) => s(ctx)));
  return listes
    .flat()
    .filter((e) => e.date.getTime() <= finFenetre.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
