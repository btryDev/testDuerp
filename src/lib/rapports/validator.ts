/**
 * Validation du fichier uploadé (taille + MIME).
 *
 * On accepte en MVP :
 *   - PDF (majorité des rapports de vérification)
 *   - PNG / JPEG (photos de plaques, rapports scannés)
 *   - DOCX (rapports bureautiques)
 *
 * Limite taille : 20 Mo. Au-dessus, l'utilisateur doit compresser le PDF
 * (majorité des rapports courants font < 5 Mo). On n'accepte pas de ZIP
 * pour éviter le contournement du typage MIME.
 */

export const MIME_AUTORISES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type MimeAutorise = (typeof MIME_AUTORISES)[number];

export const TAILLE_MAX_OCTETS = 20 * 1024 * 1024; // 20 Mo

export type ValidationFichierOk = {
  ok: true;
  mime: MimeAutorise;
  taille: number;
};

export type ValidationFichierError = {
  ok: false;
  erreur: string;
};

export type ResultatValidationFichier =
  | ValidationFichierOk
  | ValidationFichierError;

export function validerFichier(fichier: File | null): ResultatValidationFichier {
  if (!fichier || fichier.size === 0) {
    return { ok: false, erreur: "Aucun fichier sélectionné" };
  }
  if (fichier.size > TAILLE_MAX_OCTETS) {
    return {
      ok: false,
      erreur: `Fichier trop volumineux (max ${Math.round(
        TAILLE_MAX_OCTETS / 1024 / 1024,
      )} Mo)`,
    };
  }
  if (!MIME_AUTORISES.includes(fichier.type as MimeAutorise)) {
    return {
      ok: false,
      erreur: `Type de fichier non accepté (${fichier.type || "inconnu"}). Acceptés : PDF, PNG, JPEG, DOCX.`,
    };
  }
  return { ok: true, mime: fichier.type as MimeAutorise, taille: fichier.size };
}
