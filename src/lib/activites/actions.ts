"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDuerp } from "@/lib/auth/scope";
import { activitesDuSecteur, lireReponsesActivites } from "./reponses";

/**
 * Cloisonnement : `duerpId` vient du client. `requireDuerp` remonte jusqu'à
 * `Entreprise.userId` et répond 404 sinon (ADR-005) — sans lui, on écrivait
 * une déclaration de périmètre dans le dossier d'un autre.
 */

/**
 * Enregistre la réponse à une question d'activité hors couverture (ADR-020).
 *
 * Répondre « oui » ne bloque rien, n'ajoute aucun risque et n'en retire aucun :
 * ça enregistre un fait sur le périmètre du dossier, qui sera gravé dans la
 * prochaine version validée. Le mécanisme est déclaratif et fermé — la seule
 * source est ce que le dirigeant répond, jamais une déduction sur son nom,
 * son NAF ou ses équipements.
 *
 * L'activité est vérifiée contre le référentiel du secteur **retenu** : une
 * clé arbitraire postée depuis le client n'entre pas en base, sans quoi le
 * document pourrait citer une activité que personne n'a instruite.
 */
export async function repondreActivite(
  duerpId: string,
  activiteId: string,
  exercee: boolean,
): Promise<void> {
  const { duerp } = await requireDuerp(duerpId);

  const connue = activitesDuSecteur(duerp.referentielSecteurId).some(
    (a) => a.id === activiteId,
  );
  if (!connue) throw new Error(`Activité inconnue : ${activiteId}`);

  // Fusion sur la valeur relue, et non écrasement : chaque bouton ne répond
  // que de sa propre question. Les autres clés restent telles quelles —
  // y compris absentes, ce qui reste une information à part entière.
  const reponses = lireReponsesActivites(duerp.reponsesActivitesNonCouvertes);
  reponses[activiteId] = exercee;

  await prisma.duerp.update({
    where: { id: duerpId },
    data: { reponsesActivitesNonCouvertes: reponses },
  });

  revalidatePath(`/duerp/${duerpId}/activites`);
  revalidatePath(`/duerp/${duerpId}/synthese`);
}
