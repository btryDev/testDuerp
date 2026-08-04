import { describe, expect, it } from "vitest";
import {
  rapportMetadataSchema,
  STATUT_DEPUIS_RESULTAT,
} from "./schema";

describe("rapportMetadataSchema", () => {
  it("accepte une saisie minimale valide", () => {
    const res = rapportMetadataSchema.safeParse({
      dateRapport: "2026-03-15",
      resultat: "conforme",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.dateRapport).toBeInstanceOf(Date);
  });

  it("refuse une date au format FR", () => {
    const res = rapportMetadataSchema.safeParse({
      dateRapport: "15/03/2026",
      resultat: "conforme",
    });
    expect(res.success).toBe(false);
  });

  it("refuse un résultat inconnu", () => {
    const res = rapportMetadataSchema.safeParse({
      dateRapport: "2026-03-15",
      resultat: "bizarre",
    });
    expect(res.success).toBe(false);
  });

  it("vide l'organisme si espaces seulement", () => {
    const res = rapportMetadataSchema.safeParse({
      dateRapport: "2026-03-15",
      resultat: "conforme",
      organismeVerif: "   ",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.organismeVerif).toBeUndefined();
  });

  it("refuse un commentaire trop long", () => {
    const res = rapportMetadataSchema.safeParse({
      dateRapport: "2026-03-15",
      resultat: "conforme",
      commentaires: "x".repeat(2001),
    });
    expect(res.success).toBe(false);
  });
});

describe("STATUT_DEPUIS_RESULTAT", () => {
  it("mappe chaque résultat sur un statut Prisma cohérent", () => {
    expect(STATUT_DEPUIS_RESULTAT.conforme).toBe("realisee_conforme");
    expect(STATUT_DEPUIS_RESULTAT.observations_mineures).toBe(
      "realisee_observations",
    );
    expect(STATUT_DEPUIS_RESULTAT.ecart_majeur).toBe("realisee_ecart_majeur");
    expect(STATUT_DEPUIS_RESULTAT.non_verifiable).toBe("a_planifier");
  });
});
