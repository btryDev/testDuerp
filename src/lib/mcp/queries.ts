// Lectures du serveur MCP — **portée explicite, jamais implicite**.
//
// Les queries de l'application (`src/lib/*/queries.ts`) déterminent leur
// portée en appelant `requireUser()`, qui lit la session Supabase dans les
// cookies de la requête Next. Hors du runtime Next — ce qu'est un serveur
// stdio — il n'y a ni requête ni cookies : ces fonctions ne sont pas
// réutilisables telles quelles.
//
// Ce module reprend donc les mêmes clauses `where`, à une substitution près :
// la chaîne remontante `{ etablissement: { entreprise: { userId } } }` est
// remplacée par l'`etablissementId` que le serveur a reçu au démarrage. D'où
// la règle qui traverse le fichier — **chaque fonction prend
// `etablissementId` en premier paramètre, et chaque `where` le porte** : une
// lecture sans portée n'existe pas ici, y compris sur les relations (les
// unités passent par `duerp.etablissementId`, les risques par leur unité).
//
// Cette forme est aussi ce qui rend le passage au serveur distant possible
// sans réécriture : le jour où la portée viendra d'un jeton OAuth plutôt
// que d'une variable d'environnement, seul l'appelant change.
//
// Lecture seule : aucune fonction d'écriture n'a sa place dans ce fichier.

import type { StatutAction } from "@prisma/client";
import { evaluerEtatDuerp, type EtatDuerp } from "@/lib/dashboard/duerp";
import { estActionEnRetard, STATUTS_ACTION_OUVERTE } from "@/lib/dates/retard";
import { prismaMcp } from "./prisma";

// ---------------------------------------------------------------------
// Fiche établissement
// ---------------------------------------------------------------------

export type FicheEtablissement = NonNullable<
  Awaited<ReturnType<typeof getFicheEtablissement>>
>;

/**
 * Identité de l'établissement et de son entreprise, plus les compteurs qui
 * situent le dossier. `null` si l'identifiant ne correspond à rien — le
 * serveur refuse alors de démarrer plutôt que de servir un dossier vide.
 */
export async function getFicheEtablissement(etablissementId: string) {
  return prismaMcp.etablissement.findUnique({
    where: { id: etablissementId },
    select: {
      raisonDisplay: true,
      adresse: true,
      codeNaf: true,
      effectifSurSite: true,
      estEtablissementTravail: true,
      estERP: true,
      estIGH: true,
      estHabitation: true,
      typeErp: true,
      categorieErp: true,
      entreprise: {
        select: {
          raisonSociale: true,
          siret: true,
          codeNaf: true,
          effectif: true,
          adresse: true,
        },
      },
      _count: {
        select: { equipements: true, verifications: true, actions: true },
      },
    },
  });
}

// ---------------------------------------------------------------------
// État du DUERP
// ---------------------------------------------------------------------

export type RisqueLu = {
  libelle: string;
  criticite: number;
  gravite: number;
  probabilite: number;
  maitrise: number;
  exposeCMR: boolean;
  nbActions: number;
};

export type UniteLue = {
  nom: string;
  estTransverse: boolean;
  risques: RisqueLu[];
};

export type EtatDuerpLu = {
  existe: boolean;
  /** État d'ancienneté calculé par la règle unique du produit. */
  etat: EtatDuerp | null;
  derniereVersionNumero: number | null;
  derniereVersionAu: Date | null;
  effectifEntreprise: number;
  unites: UniteLue[];
};

/**
 * DUERP de l'établissement : unités de travail, risques cotés, et état
 * d'ancienneté.
 *
 * L'ancienneté n'est pas recalculée ici : elle passe par `evaluerEtatDuerp`
 * (`@/lib/dashboard/duerp`), seule lecture de la règle dans le produit — un
 * serveur MCP qui redéfinirait « à jour » dans son coin finirait par
 * contredire le tableau de bord.
 */
export async function getEtatDuerp(
  etablissementId: string,
  now: Date,
): Promise<EtatDuerpLu> {
  const duerp = await prismaMcp.duerp.findFirst({
    where: { etablissementId },
    include: {
      versions: { orderBy: { numero: "desc" }, take: 1 },
      etablissement: {
        select: { entreprise: { select: { effectif: true } } },
      },
      unites: {
        orderBy: { nom: "asc" },
        include: {
          risques: {
            orderBy: { criticite: "desc" },
            select: {
              libelle: true,
              criticite: true,
              gravite: true,
              probabilite: true,
              maitrise: true,
              exposeCMR: true,
              _count: { select: { actions: true } },
            },
          },
        },
      },
    },
  });

  const effectifEntreprise = duerp?.etablissement.entreprise.effectif ?? 0;

  if (!duerp) {
    return {
      existe: false,
      etat: null,
      derniereVersionNumero: null,
      derniereVersionAu: null,
      effectifEntreprise,
      unites: [],
    };
  }

  const derniereVersion = duerp.versions[0] ?? null;
  const etat = evaluerEtatDuerp(
    {
      ouvert: true,
      dateDerniereVersion: derniereVersion?.createdAt ?? null,
      effectif: effectifEntreprise,
    },
    now,
  );

  return {
    existe: true,
    etat,
    derniereVersionNumero: derniereVersion?.numero ?? null,
    derniereVersionAu: derniereVersion?.createdAt ?? null,
    effectifEntreprise,
    unites: duerp.unites.map((u) => ({
      nom: u.nom,
      estTransverse: u.estTransverse,
      risques: u.risques.map((r) => ({
        libelle: r.libelle,
        criticite: r.criticite,
        gravite: r.gravite,
        probabilite: r.probabilite,
        maitrise: r.maitrise,
        exposeCMR: r.exposeCMR,
        nbActions: r._count.actions,
      })),
    })),
  };
}

// ---------------------------------------------------------------------
// Plan d'actions
// ---------------------------------------------------------------------

export type OrigineActionLue = "duerp" | "verification" | "libre";

export type ActionLue = {
  libelle: string;
  statut: StatutAction;
  type: string;
  criticite: number | null;
  echeance: Date | null;
  responsable: string | null;
  origine: OrigineActionLue;
  /** Ce qui a motivé l'action : libellé du risque ou de la vérification. */
  origineLibelle: string | null;
  enRetard: boolean;
};

export type FiltresActionsMcp = {
  statut?: StatutAction;
  /** Ne garder que les actions encore à traiter (ouverte / en_cours). */
  enCoursSeulement?: boolean;
  /** Ne garder que les actions dont l'échéance est dépassée. */
  enRetardSeulement?: boolean;
  criticiteMin?: number;
};

/**
 * Plan d'actions de l'établissement.
 *
 * Le retard n'est pas retranscrit en SQL : il est évalué par
 * `estActionEnRetard` (`@/lib/dates/retard`), le prédicat partagé du produit
 * — une échéance du jour même n'est pas en retard, et cette règle-là ne se
 * duplique pas.
 */
export async function listerActions(
  etablissementId: string,
  filtres: FiltresActionsMcp,
  now: Date,
): Promise<ActionLue[]> {
  const actions = await prismaMcp.action.findMany({
    where: {
      etablissementId,
      ...(filtres.statut ? { statut: filtres.statut } : {}),
      ...(!filtres.statut && (filtres.enCoursSeulement || filtres.enRetardSeulement)
        ? { statut: { in: [...STATUTS_ACTION_OUVERTE] as StatutAction[] } }
        : {}),
      ...(filtres.criticiteMin !== undefined
        ? { criticite: { gte: filtres.criticiteMin } }
        : {}),
    },
    select: {
      libelle: true,
      statut: true,
      type: true,
      criticite: true,
      echeance: true,
      responsable: true,
      risqueId: true,
      verificationId: true,
      risque: { select: { libelle: true } },
      verification: { select: { libelleObligation: true } },
    },
    orderBy: [{ statut: "asc" }, { echeance: "asc" }, { criticite: "desc" }],
  });

  const lues: ActionLue[] = actions.map((a) => ({
    libelle: a.libelle,
    statut: a.statut,
    type: a.type,
    criticite: a.criticite,
    echeance: a.echeance,
    responsable: a.responsable,
    origine: a.risqueId ? "duerp" : a.verificationId ? "verification" : "libre",
    origineLibelle:
      a.risque?.libelle ?? a.verification?.libelleObligation ?? null,
    enRetard: estActionEnRetard(a, now),
  }));

  return filtres.enRetardSeulement ? lues.filter((a) => a.enRetard) : lues;
}
