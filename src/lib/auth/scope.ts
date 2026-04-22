// Helpers de scoping par utilisateur (ADR-005).
// Toute lecture/écriture d'une entité doit vérifier que l'entreprise racine
// appartient bien au user connecté. On passe par ces helpers pour éviter de
// dupliquer les WHERE clauses un peu partout.

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "./require-user";

/**
 * Récupère une entreprise appartenant au user connecté, ou 404.
 * Utilisé dans les pages /entreprises/[id] et les actions qui reçoivent
 * un entrepriseId en paramètre.
 */
export async function requireEntreprise(entrepriseId: string) {
  const user = await requireUser();
  const entreprise = await prisma.entreprise.findFirst({
    where: { id: entrepriseId, userId: user.id },
  });
  if (!entreprise) notFound();
  return { user, entreprise };
}

/**
 * Récupère un établissement dont l'entreprise appartient au user connecté,
 * ou 404. Utilisé par toutes les pages /etablissements/[id]/... et les
 * actions qui reçoivent un etablissementId.
 */
export async function requireEtablissement(etablissementId: string) {
  const user = await requireUser();
  const etablissement = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    include: { entreprise: true },
  });
  if (!etablissement) notFound();
  return { user, etablissement };
}

/**
 * Récupère un DUERP dont l'établissement appartient au user, ou 404.
 */
export async function requireDuerp(duerpId: string) {
  const user = await requireUser();
  const duerp = await prisma.duerp.findFirst({
    where: {
      id: duerpId,
      etablissement: { entreprise: { userId: user.id } },
    },
    include: { etablissement: { include: { entreprise: true } } },
  });
  if (!duerp) notFound();
  return { user, duerp };
}

/**
 * Vérifie (sans retourner l'entité) qu'un etablissementId appartient au user.
 * Utile dans les server actions où on veut juste un garde-fou.
 */
export async function assertEtablissementOwnership(etablissementId: string) {
  const user = await requireUser();
  const exists = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    select: { id: true },
  });
  if (!exists) notFound();
  return user;
}

/**
 * Vérifie qu'un entrepriseId appartient au user.
 */
export async function assertEntrepriseOwnership(entrepriseId: string) {
  const user = await requireUser();
  const exists = await prisma.entreprise.findFirst({
    where: { id: entrepriseId, userId: user.id },
    select: { id: true },
  });
  if (!exists) notFound();
  return user;
}
