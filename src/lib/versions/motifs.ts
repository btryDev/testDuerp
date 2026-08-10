export type VersionActionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; numero: number };

/**
 * Motifs de mise à jour normalisés (art. R. 4121-2) + libellé pour le PDF.
 * L'ordre reflète ceux listés par le Code du travail.
 */
export const MOTIFS_VERSION = {
  annuelle: "Mise à jour annuelle (art. R. 4121-2)",
  amenagement:
    "Aménagement important (nouveau poste, nouvel équipement, nouveaux locaux)",
  accident: "Accident du travail ou maladie professionnelle",
  nouvelle_info:
    "Nouvelle information portée à la connaissance de l'employeur",
  autre: "Autre",
} as const;

export type MotifVersion = keyof typeof MOTIFS_VERSION;
