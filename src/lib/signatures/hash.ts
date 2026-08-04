import { createHash } from "node:crypto";

/**
 * Calcule l'empreinte SHA-256 hexadécimale d'un buffer ou d'une chaîne.
 * Utilisé pour figer l'intégrité d'un document signé : toute modification
 * d'un octet post-signature produira un hash différent → signature invalidée.
 */
export function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Hash d'un fichier stocké via l'abstraction `FileStorage`.
 * Lit le contenu complet en mémoire — convient aux documents réglementaires
 * (rapports de vérif, permis de feu…) qui restent < 20 Mo.
 */
export async function sha256File(contenu: Buffer): Promise<string> {
  return sha256Hex(contenu);
}
