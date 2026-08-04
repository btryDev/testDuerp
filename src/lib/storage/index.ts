import path from "node:path";
import { LocalFileStorage } from "./local";
import type { FileStorage } from "./types";

export type { FileStorage, StorageKey } from "./types";

/**
 * Factory — renvoie l'implémentation de stockage à utiliser côté serveur.
 *
 * Stratégie V2 :
 *   - pour le MVP on utilise le filesystem local dans `./storage/rapports/`
 *     (configurable via `STORAGE_LOCAL_PATH`)
 *   - pour migrer vers Supabase Storage / S3, implémenter une nouvelle
 *     classe (cf. `src/lib/storage/types.ts`) et brancher ici via une
 *     variable `STORAGE_DRIVER`.
 *
 * Attention : sur un environnement sans filesystem persistant (Vercel
 * serverless en prod), cette implémentation n'est pas adaptée. Un ticket
 * infra est à prévoir avant le premier déploiement public.
 */
let _storage: FileStorage | null = null;

export function getStorage(): FileStorage {
  if (_storage) return _storage;

  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "local") {
    const root =
      process.env.STORAGE_LOCAL_PATH ?? path.join(process.cwd(), "storage");
    _storage = new LocalFileStorage(root);
    return _storage;
  }

  throw new Error(
    `Driver de stockage non supporté : ${driver}. Utiliser "local" ou ajouter une implémentation.`,
  );
}

/**
 * Construit la clé de stockage d'un rapport. Stable (évite d'inclure le
 * timestamp) pour permettre un upsert ultérieur si nécessaire, mais inclut
 * le rapportId qui est un cuid unique.
 */
export function cleRapport(
  etablissementId: string,
  rapportId: string,
  nomFichier: string,
): string {
  // Nettoyage basique du nom : uniquement alphanum, point, tiret, underscore.
  const safe = nomFichier.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  return `rapports/${etablissementId}/${rapportId}-${safe}`;
}
