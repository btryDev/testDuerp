"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEtablissementOwnership } from "@/lib/auth/scope";
import { obligationParId } from "@/lib/referentiels/conformite";
import { modeDeclaration } from "./regle";

/**
 * Déclarer, et défaire.
 *
 * **Aucun appel au générateur de calendrier**, contrairement à toutes les
 * autres mutations du produit — et c'est délibéré. La règle « toute mutation
 * relance `genererCalendrier` » existe parce qu'un titre déclaré ou un
 * équipement ajouté **change les échéances**. Une déclaration d'état permanent
 * n'en change aucune : par construction, ces obligations n'engendrent aucune
 * ligne de `Verification` (`estSansRendezVous`). Relancer le générateur ici
 * coûterait une passe complète pour un plan vide, et surtout laisserait croire
 * qu'une déclaration touche au calendrier — ce qu'elle ne doit pas faire.
 *
 * C'est la traduction en code de la contrainte de l'ADR-027 : une déclaration
 * n'allume rien ailleurs.
 */

export type DeclarationActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

/**
 * Vérifie que l'obligation existe ET qu'elle relève bien de cet écran.
 *
 * Sans ce contrôle, un formulaire trafiqué pourrait déclarer « en place » une
 * échéance récurrente ou une obligation événementielle — c'est-à-dire écrire en
 * base une affirmation que l'écran n'a jamais proposée, et que rien ensuite ne
 * viendrait contredire. Le garde-fou est ici et non dans le composant : une
 * validation qui vit dans le rendu n'est pas une validation.
 */
function obligationDeclarable(obligationId: string): boolean {
  const o = obligationParId(obligationId);
  if (!o) return false;
  return modeDeclaration(o) !== null;
}

export async function declarerEnPlace(
  etablissementId: string,
  obligationId: string,
  note?: string | null,
): Promise<DeclarationActionState> {
  await assertEtablissementOwnership(etablissementId);

  if (!obligationDeclarable(obligationId)) {
    return {
      status: "error",
      message:
        "Cette obligation ne se déclare pas ici : elle a une échéance, ou elle revient à chaque fois qu'un fait se produit.",
    };
  }

  const propre = note?.trim() ? note.trim() : null;

  await prisma.declarationEtatPermanent.upsert({
    where: { etablissementId_obligationId: { etablissementId, obligationId } },
    // Redéclarer redate. C'est le sens de la ligne : l'employeur affirme
    // qu'aujourd'hui l'état est là. Une seconde déclaration n'empile pas un
    // historique — un historique de déclarations ressemblerait à une trace, et
    // une trace ressemble à une preuve.
    update: { declareLe: new Date(), note: propre },
    create: { etablissementId, obligationId, note: propre },
  });

  revalidatePath(`/etablissements/${etablissementId}/etats-permanents`);
  return { status: "success" };
}

export async function retirerDeclaration(
  etablissementId: string,
  obligationId: string,
): Promise<DeclarationActionState> {
  await assertEtablissementOwnership(etablissementId);

  // `deleteMany` et non `delete` : décocher une ligne jamais déclarée ne doit
  // pas lever. L'écran est optimiste, deux clics rapides peuvent arriver dans
  // l'ordre inverse, et un `P2025` affiché au dirigeant ne lui apprendrait
  // rien.
  await prisma.declarationEtatPermanent.deleteMany({
    where: { etablissementId, obligationId },
  });

  revalidatePath(`/etablissements/${etablissementId}/etats-permanents`);
  return { status: "success" };
}
