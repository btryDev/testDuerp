import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { repartirVerifications } from "@/lib/pdf/etat-verifications";

/**
 * Lectures des bâtiments d'un établissement (ADR-019).
 *
 * Invariant : tout établissement a au moins un bâtiment — la migration en a
 * créé un par établissement existant, la création d'établissement en crée un
 * dans la même transaction, la suppression du dernier est refusée.
 */

export type BatimentListe = {
  id: string;
  nom: string;
  complementAdresse: string | null;
  ordre: number;
  nbEquipements: number;
};

export async function listerBatimentsDeLEtablissement(
  etablissementId: string,
): Promise<BatimentListe[]> {
  const user = await requireUser();
  const rows = await prisma.batiment.findMany({
    where: { etablissementId, etablissement: { entreprise: { userId: user.id } } },
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      nom: true,
      complementAdresse: true,
      ordre: true,
      _count: { select: { equipements: { where: { actif: true } } } },
    },
  });
  return rows.map(({ _count, ...b }) => ({ ...b, nbEquipements: _count.equipements }));
}

/**
 * Le bâtiment d'ordre 0 — celui vers lequel vont les équipements créés par un
 * chemin qui ne demande pas de bâtiment à l'utilisateur (pré-remplissage
 * post-onboarding). À appeler dans un périmètre déjà vérifié.
 *
 * Lève si l'établissement n'a aucun bâtiment : c'est une violation
 * d'invariant, pas un cas à rattraper en silence.
 */
export async function batimentParDefaut(etablissementId: string) {
  const b = await prisma.batiment.findFirst({
    where: { etablissementId },
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
    select: { id: true, nom: true },
  });
  if (!b) {
    throw new Error(
      `Établissement ${etablissementId} sans bâtiment : invariant ADR-019 rompu`,
    );
  }
  return b;
}

/**
 * Résout un `batimentId` optionnel venu d'un formulaire : vide = non
 * précisé (`null`), sinon le bâtiment doit appartenir à l'établissement —
 * la base ne le vérifie pas (clé simple), l'action le fait ici. `ok: false`
 * = id étranger ou inconnu.
 */
export async function resoudreBatimentOptionnel(
  etablissementId: string,
  batimentId: string | null | undefined,
): Promise<{ ok: true; id: string | null } | { ok: false }> {
  if (!batimentId) return { ok: true, id: null };
  const b = await prisma.batiment.findFirst({
    where: { id: batimentId, etablissementId },
    select: { id: true },
  });
  return b ? { ok: true, id: b.id } : { ok: false };
}

// `estMultiBatiments` et la résolution du filtre d'URL vivent dans
// `./filtre` : ce sont des règles pures, elles n'ont rien à faire dans un
// module qui ouvre la base.

/**
 * Les bâtiments avec leur charge de travail — ce que le hero du tableau de
 * bord affiche sur chaque carte-bâtiment.
 *
 * Requête distincte de `listerBatimentsDeLEtablissement` à dessein : celle-ci
 * lit toutes les occurrences de vérification de l'établissement, ce que les
 * autres appelants (sélecteur, formulaires) n'ont aucune raison de payer.
 *
 * Les compteurs passent par `repartirVerifications`, donc par les prédicats
 * canoniques de `@/lib/dates/retard` (ADR-011). Recompter « en retard » à la
 * main ici aurait fabriqué une septième définition du retard — exactement ce
 * que ce module a été écrit pour empêcher : le hero et le calendrier
 * annonceraient deux chiffres différents sur la même donnée.
 *
 * L'horloge est injectée : le rendu reste déterministe et testable.
 */
export type BatimentCharge = BatimentListe & {
  /** Occurrences dont l'échéance est passée sans réalisation. */
  nbEnRetard: number;
  /** Occurrences planifiées dans les trente jours. */
  nbSous30j: number;
};

export async function listerBatimentsAvecCharge(
  etablissementId: string,
  now: Date,
): Promise<BatimentCharge[]> {
  const batiments = await listerBatimentsDeLEtablissement(etablissementId);

  const verifs = await prisma.verification.findMany({
    where: { etablissementId, equipement: { actif: true } },
    select: {
      statut: true,
      datePrevue: true,
      dateRealisee: true,
      equipement: { select: { batimentId: true } },
    },
  });

  const parBatiment = new Map<string, typeof verifs>();
  for (const v of verifs) {
    const cle = v.equipement.batimentId;
    const liste = parBatiment.get(cle);
    if (liste) liste.push(v);
    else parBatiment.set(cle, [v]);
  }

  return batiments.map((b) => {
    const etat = repartirVerifications(parBatiment.get(b.id) ?? [], now);
    return {
      ...b,
      nbEnRetard: etat.enRetard.length,
      nbSous30j: etat.aVenir.length,
    };
  });
}
