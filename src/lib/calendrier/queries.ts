import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

export type FiltresCalendrier = {
  domaine?: DomaineObligation;
  /**
   * Filtre sur "retard/urgent" : statut `a_planifier` ou `depassee`.
   * Quand true, on masque les vérifications planifiées et les réalisées.
   */
  urgentsSeulement?: boolean;
};

export async function listerVerifications(
  etablissementId: string,
  filtres: FiltresCalendrier = {},
) {
  const user = await requireUser();
  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
      ...(filtres.urgentsSeulement
        ? { statut: { in: ["a_planifier", "depassee"] } }
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
 * Agrégats pour le tableau de bord / vue synthétique :
 *  - nombre en retard (a_planifier + depassee)
 *  - nombre à venir sous 30 jours (planifiee avec datePrevue ≤ now+30j)
 *  - nombre total réalisées sur les 12 derniers mois
 */
export async function compterEtatCalendrier(etablissementId: string) {
  const user = await requireUser();
  const scope = {
    etablissementId,
    etablissement: { entreprise: { userId: user.id } },
  } as const;
  const now = new Date();
  const dans30j = new Date(now.getTime());
  dans30j.setDate(dans30j.getDate() + 30);
  const ilYaUnAn = new Date(now.getTime());
  ilYaUnAn.setFullYear(ilYaUnAn.getFullYear() - 1);

  // Sémantique distinguée :
  //  - `enRetard`    : statut `depassee`, ou `planifiee` dont la datePrevue
  //    est déjà passée sans dateRealisee — situation réelle de non-conformité
  //  - `aPlanifier`  : statut `a_planifier` — nouvelle occurrence générée à
  //    la création d'un équipement, l'utilisateur n'a pas encore fixé de
  //    date. Non pénalisant : c'est un simple « à faire ».
  //  - `aVenir`      : `planifiee` dans les 30 prochains jours
  const [enRetard, aPlanifier, aVenir, realisees12m] = await Promise.all([
    prisma.verification.count({
      where: {
        ...scope,
        OR: [
          { statut: "depassee" },
          { statut: "planifiee", datePrevue: { lt: now } },
        ],
      },
    }),
    prisma.verification.count({
      where: { ...scope, statut: "a_planifier" },
    }),
    prisma.verification.count({
      where: {
        ...scope,
        statut: "planifiee",
        datePrevue: { gte: now, lte: dans30j },
      },
    }),
    prisma.verification.count({
      where: { ...scope, dateRealisee: { gte: ilYaUnAn } },
    }),
  ]);

  return { enRetard, aPlanifier, aVenir, realisees12m };
}

/**
 * Regroupement par mois (pour l'affichage calendrier).
 */
export function grouperParMois(
  verifs: VerificationListee[],
): Map<string, VerificationListee[]> {
  const out = new Map<string, VerificationListee[]>();
  for (const v of verifs) {
    // Clé tri-friendly : YYYY-MM
    const d = v.datePrevue;
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = out.get(cle) ?? [];
    bucket.push(v);
    out.set(cle, bucket);
  }
  return out;
}
