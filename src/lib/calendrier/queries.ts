import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import {
  REFERENTIEL_VERSION,
  obligationParId,
} from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";
import { cleJourCivil, debutDuJour } from "@/lib/dates";
// Module **pur** : c'est lui qui détient la partition en quatre ensembles
// disjoints (retard / à planifier / à venir / réalisées 12 mois), déjà
// utilisée par les documents générés. Le compteur du calendrier passe par
// lui pour que l'en-tête de la page, le tableau de bord et le dossier de
// conformité annoncent nécessairement les mêmes nombres.
import { repartirVerifications } from "@/lib/pdf/etat-verifications";

/**
 * Lectures du calendrier des vérifications périodiques.
 *
 * `listerVerifications` rend les lignes de suivi complètes, historique
 * réalisé compris : la page calendrier les déplie ensuite en événements
 * (`lecturesCalendrier`), et les PDF en ont besoin telles quelles.
 *
 * Les comparaisons de dates passent toutes par `@/lib/dates` (ADR-011) :
 * une échéance datée d'aujourd'hui n'est jamais en retard.
 */

export type FiltresCalendrier = {
  domaine?: DomaineObligation;
  /**
   * Ne garder que ce qui est réellement **en retard** : statut `depassee`,
   * ou `planifiee` / `a_planifier` dont la `datePrevue` est passée, sans
   * date de réalisation. Même définition que `estVerificationEnRetard`
   * (ADR-011).
   *
   * L'ancien filtre retenait `a_planifier` **quelle que soit sa date** :
   * une occurrence générée le matin même pour l'an prochain apparaissait
   * dans « urgents », pendant qu'une occurrence planifiée et dépassée en
   * sortait. C'était l'inverse de ce que le mot annonce.
   */
  urgentsSeulement?: boolean;
};

export async function listerVerifications(
  etablissementId: string,
  filtres: FiltresCalendrier = {},
) {
  const user = await requireUser();
  // L'horloge est capturée **au bord**, une seule fois, et n'est plus
  // relue au fil des comparaisons (ADR-011).
  const now = new Date();
  const debut = debutDuJour(now);

  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
      ...(filtres.urgentsSeulement
        ? {
            dateRealisee: null,
            OR: [
              { statut: "depassee" as const },
              {
                statut: { in: ["planifiee" as const, "a_planifier" as const] },
                datePrevue: { lt: debut },
              },
            ],
          }
        : {}),
    },
    include: { equipement: true },
    orderBy: [{ datePrevue: "asc" }],
  });

  // Filtre par domaine côté TS (le domaine est porté par l'obligation en
  // référentiel, pas en base). Plus simple et évite un enum en base.
  if (filtres.domaine) {
    return verifs.filter(
      (v) => obligationParId(v.obligationId)?.domaine === filtres.domaine,
    );
  }
  return verifs;
}

export type VerificationListee = Awaited<
  ReturnType<typeof listerVerifications>
>[number];

export async function getVerification(id: string) {
  const user = await requireUser();
  const v = await prisma.verification.findFirst({
    where: { id, etablissement: { entreprise: { userId: user.id } } },
    include: {
      equipement: true,
      etablissement: {
        select: {
          id: true,
          raisonDisplay: true,
          entrepriseId: true,
          entreprise: { select: { raisonSociale: true } },
        },
      },
      rapports: {
        orderBy: { dateRapport: "desc" },
      },
    },
  });
  return v;
}

/**
 * Agrégats pour l'en-tête du calendrier et le tableau de bord :
 *  - `enRetard`     : échéance passée sans réalisation
 *  - `aPlanifier`   : sans date convenue, mais pas encore en retard
 *  - `aVenir`       : planifiées dans l'horizon proche (30 jours)
 *  - `realisees12m` : réalisées sur la fenêtre d'historique
 *
 * Les quatre ensembles sont **disjoints** : leur somme est le
 * dénominateur du score de conformité, sans double compte. La partition
 * n'est pas refaite ici — elle est déléguée à `repartirVerifications`,
 * qui sert aussi les documents générés. Avant, chaque écran écrivait sa
 * propre requête : `a_planifier` était compté en entier d'un côté (y
 * compris les occurrences déjà dépassées, donc en double avec les
 * retards) et ignoré de l'autre, et les bornes de fenêtre étaient prises
 * à l'heure courante plutôt qu'au début du jour.
 *
 * Une seule lecture, trois colonnes : moins coûteux que les quatre
 * `count` qu'elle remplace, et exact par construction.
 */
export async function compterEtatCalendrier(
  etablissementId: string,
  now: Date = new Date(),
) {
  const user = await requireUser();
  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
    select: { statut: true, datePrevue: true, dateRealisee: true },
  });

  const etat = repartirVerifications(verifs, now);
  return {
    enRetard: etat.enRetard.length,
    aPlanifier: etat.aPlanifier.length,
    aVenir: etat.aVenir.length,
    realisees12m: etat.realisees12m.length,
  };
}

/**
 * Regroupement par mois (pour l'affichage calendrier).
 *
 * La clé est calculée sur le **jour civil de Paris** : sur une date
 * stockée à minuit UTC, `getMonth()` du serveur tombe juste par hasard,
 * mais un horodatage de fin de soirée bascule d'un mois le 31.
 */
export function grouperParMois(
  verifs: VerificationListee[],
): Map<string, VerificationListee[]> {
  const out = new Map<string, VerificationListee[]>();
  for (const v of verifs) {
    // Clé tri-friendly : YYYY-MM
    const cle = cleJourCivil(v.datePrevue).slice(0, 7);
    const bucket = out.get(cle) ?? [];
    bucket.push(v);
    out.set(cle, bucket);
  }
  return out;
}

/**
 * Le calendrier de cet établissement a-t-il été généré avec une version
 * antérieure du référentiel de conformité ?
 *
 * `null` en base signifie « jamais réconcilié depuis l'introduction du
 * mécanisme » : ces établissements sont rattrapés au premier affichage.
 *
 * Le référentiel vit en TypeScript versionné (ADR-003), mais ses effets sont
 * figés en base à la génération. Sans cette comparaison, une correction du
 * référentiel n'atteignait les calendriers existants qu'au hasard d'une
 * mutation d'équipement ou d'un dépôt de rapport.
 */
export async function calendrierDesynchronise(
  etablissementId: string,
): Promise<boolean> {
  const user = await requireUser();
  const etab = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    select: { referentielVersionCalendrier: true },
  });
  if (!etab) return false;
  return etab.referentielVersionCalendrier !== REFERENTIEL_VERSION;
}
