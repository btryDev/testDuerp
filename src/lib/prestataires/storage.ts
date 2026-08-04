import { getStorage } from "@/lib/storage";

/**
 * Organisation des clés de stockage pour les pièces justificatives d'un
 * prestataire. On garde la même arborescence que les rapports de vérif
 * pour permettre un scoping simple par établissement en cas de purge.
 */

export type TypePiecePrestataire = "urssaf" | "rcpro" | "kbis";

const PREFIX: Record<TypePiecePrestataire, string> = {
  urssaf: "urssaf",
  rcpro: "rcpro",
  kbis: "kbis",
};

export function clePiecePrestataire(
  etablissementId: string,
  prestataireId: string,
  type: TypePiecePrestataire,
  nomFichier: string,
): string {
  const safe = nomFichier.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  return `prestataires/${etablissementId}/${prestataireId}/${PREFIX[type]}-${Date.now()}-${safe}`;
}

/**
 * Supprime best-effort les 3 pièces d'un prestataire si elles existent.
 * Appelée quand on supprime le prestataire lui-même.
 */
export async function deletePiecesPrestataire(prestataire: {
  attestationUrssafCle?: string | null;
  assuranceRcProCle?: string | null;
  kbisCle?: string | null;
}): Promise<void> {
  const storage = getStorage();
  await Promise.allSettled([
    prestataire.attestationUrssafCle
      ? storage.delete(prestataire.attestationUrssafCle)
      : Promise.resolve(),
    prestataire.assuranceRcProCle
      ? storage.delete(prestataire.assuranceRcProCle)
      : Promise.resolve(),
    prestataire.kbisCle ? storage.delete(prestataire.kbisCle) : Promise.resolve(),
  ]);
}
