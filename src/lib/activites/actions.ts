"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDuerp } from "@/lib/auth/scope";
import { activitesDuSecteur } from "./reponses";

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
 * `exercee` vaut `true`, `false` ou **`null`** — les trois états que l'ADR-020
 * distingue, dans les deux sens. Sans le troisième, un « non » cliqué par
 * erreur ne pouvait plus être retiré : la clé restait écrite, et le document
 * partait affirmer pour quarante ans que le dirigeant avait *déclaré ne pas
 * exercer* l'activité. Une affirmation que personne n'a faite est exactement
 * ce que ce module existe pour empêcher — elle ne devient pas acceptable
 * parce qu'elle vient d'un clic.
 *
 * L'activité est vérifiée contre le référentiel du secteur **retenu** : une
 * clé arbitraire postée depuis le client n'entre pas en base, sans quoi le
 * document pourrait citer une activité que personne n'a instruite.
 *
 * ## Pourquoi du SQL brut ici, et nulle part ailleurs
 *
 * Chaque question est une ligne indépendante avec son propre bouton d'envoi :
 * deux réponses peuvent partir en même temps (deux onglets, deux appareils,
 * un double-clic sur deux lignes voisines). Une lecture-modification-écriture
 * de tout l'objet JSON les faisait se marcher dessus — la seconde écriture
 * repartait de la valeur d'avant et effaçait la première. Le résultat n'est
 * pas « une réponse perdue » au sens bénin : la clé redevient **absente**,
 * c'est-à-dire le silence que l'ADR-020 s'emploie précisément à distinguer
 * d'un « non ». Et ce silence part ensuite tel quel dans le snapshot d'une
 * version conservée quarante ans.
 *
 * `jsonb_set` écrit **une seule clé** en un seul UPDATE : le reste de l'objet
 * n'est jamais relu côté application, donc jamais réécrit à l'identique, donc
 * jamais rétabli dans un état périmé. La dernière écriture d'une même clé
 * gagne — c'est la sémantique voulue, un bouton ne répond que de sa question —
 * mais aucune écriture ne touche plus la réponse d'une autre question.
 *
 * Trois détails portent le contrat de forme (`Record<string, boolean>`) :
 * - `create_missing` à `true` (le 4ᵉ argument) : une clé jamais répondue est
 *   créée, au lieu d'être ignorée.
 * - le `CASE` sur `jsonb_typeof` : la colonne est un `Json?` libre, elle vaut
 *   `NULL` tant que rien n'a été répondu, et pourrait contenir un scalaire ou
 *   un tableau écrit par une version antérieure ou une main humaine.
 *   `jsonb_set` échouerait dessus. On repart alors d'un objet vide — ce que
 *   faisait déjà `lireReponsesActivites`, tolérante par construction.
 * - `to_jsonb(... ::boolean)` : la valeur reste un booléen JSON. En chaîne,
 *   `lireReponsesActivites` la rejetterait et la réponse redeviendrait un
 *   silence.
 *
 * Le retrait d'une réponse (`null`) suit la même règle avec l'opérateur `-` :
 * une seule clé ôtée, en une seule instruction, sans relire l'objet.
 *
 * Les valeurs sont toutes passées en paramètres liés (`$1`, `$2`, `$3`) par le
 * template balisé de Prisma : rien de ce qui vient du client n'est concaténé
 * dans le SQL. `updatedAt` est posé à la main, parce que le `@updatedAt` de
 * Prisma est appliqué par le client et non par la base.
 */
export async function repondreActivite(
  duerpId: string,
  activiteId: string,
  exercee: boolean | null,
): Promise<void> {
  const { duerp } = await requireDuerp(duerpId);

  const connue = activitesDuSecteur(duerp.referentielSecteurId).some(
    (a) => a.id === activiteId,
  );
  if (!connue) throw new Error(`Activité inconnue : ${activiteId}`);

  // Deux instructions plutôt qu'un fragment SQL composé : chacune reste un
  // UPDATE d'une seule ligne touchant une seule clé, ce qui est précisément
  // la propriété qui empêche deux réponses concurrentes de s'effacer.
  const lignes =
    exercee === null
      ? // Retrait de la clé (opérateur `-` de jsonb) : le seul geste qui rende
        // le silence de nouveau atteignable après une réponse.
        await prisma.$executeRaw`
          UPDATE "Duerp"
             SET "reponsesActivitesNonCouvertes" =
                   CASE
                     WHEN jsonb_typeof("reponsesActivitesNonCouvertes") = 'object'
                     THEN "reponsesActivitesNonCouvertes" - ${activiteId}::text
                     ELSE '{}'::jsonb
                   END,
                 "updatedAt" = NOW()
           WHERE "id" = ${duerpId}`
      : await prisma.$executeRaw`
          UPDATE "Duerp"
             SET "reponsesActivitesNonCouvertes" = jsonb_set(
                   CASE
                     WHEN jsonb_typeof("reponsesActivitesNonCouvertes") = 'object'
                     THEN "reponsesActivitesNonCouvertes"
                     ELSE '{}'::jsonb
                   END,
                   ARRAY[${activiteId}]::text[],
                   to_jsonb(${exercee}::boolean),
                   true
                 ),
                 "updatedAt" = NOW()
           WHERE "id" = ${duerpId}`;

  // `requireDuerp` vient de garantir la ligne : zéro ligne touchée veut dire
  // qu'elle a disparu entre-temps. Se taire renverrait l'utilisateur à un
  // écran qui affiche sa réponse alors que rien n'est enregistré.
  if (lignes === 0) {
    throw new Error(`DUERP introuvable à l'écriture : ${duerpId}`);
  }

  revalidatePath(`/duerp/${duerpId}/activites`);
  revalidatePath(`/duerp/${duerpId}/synthese`);
}
