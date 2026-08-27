import type { Prisma } from "@prisma/client";

/**
 * Le filtre par bâtiment d'une liste de vérifications (ADR-019, ADR-022).
 *
 * Pourquoi une fonction plutôt qu'un objet écrit sur place : depuis que
 * `Verification.equipementId` peut être `null`, un `where` de la forme
 *
 *     { equipement: { batimentId } }
 *
 * est une **jointure interne**. Prisma la traduit par un `INNER JOIN`, et une
 * ligne portée par l'établissement — qui n'a pas d'équipement, donc pas de
 * bâtiment — en disparaît **sans erreur de compilation et sans trace**. C'est
 * exactement ce que l'ADR-010 et l'ADR-019 interdisent : « les masquer ferait
 * mentir le calendrier par omission ».
 *
 * Une échéance sans lieu concerne tout l'établissement, donc aussi le bâtiment
 * qu'on regarde. Elle passe le filtre. C'est la même règle que
 * `filtrerParBatiment` applique aux échéances déjà chargées ; celle-ci
 * l'applique en SQL.
 *
 * Rend `{}` quand aucun bâtiment n'est demandé, pour s'étaler dans un `where`
 * sans condition à l'appel.
 */
export function porteeBatiment(
  batimentId: string | undefined,
): Prisma.VerificationWhereInput {
  if (!batimentId) return {};
  return {
    OR: [{ equipementId: null }, { equipement: { batimentId } }],
  };
}
