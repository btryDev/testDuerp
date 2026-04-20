import type { TypeMesure } from "@/lib/referentiels/types";

export const LABEL_TYPE_MESURE: Record<TypeMesure, string> = {
  suppression: "Suppression du risque à la source",
  reduction_source: "Réduction du risque à la source",
  protection_collective: "Protection collective",
  protection_individuelle: "Protection individuelle (EPI)",
  formation: "Formation / information",
  organisationnelle: "Mesure organisationnelle",
};

export const LABEL_STATUT: Record<"existante" | "prevue", string> = {
  existante: "Existante",
  prevue: "Prévue",
};
