import { describe, expect, it } from "vitest";
import type { Prestataire } from "@prisma/client";
import { computeVigilance, messageExpiration } from "./vigilance";

function prestataireFake(p: Partial<Prestataire>): Prestataire {
  return {
    id: "p1",
    etablissementId: "e1",
    raisonSociale: "Test",
    siret: null,
    estOrganismeAgree: false,
    domaines: [],
    contactNom: "Nom",
    contactEmail: "test@ex.fr",
    contactTelephone: null,
    attestationUrssafCle: null,
    attestationUrssafNom: null,
    attestationUrssafValableJusquA: null,
    assuranceRcProCle: null,
    assuranceRcProNom: null,
    assuranceRcProValableJusquA: null,
    kbisCle: null,
    kbisNom: null,
    kbisDateEmission: null,
    notesInternes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...p,
  };
}

const JOUR_MS = 1000 * 60 * 60 * 24;

describe("computeVigilance", () => {
  it("marque comme manquante une attestation non renseignée", () => {
    const v = computeVigilance(prestataireFake({}));
    expect(v.urssaf).toBe("manquante");
    expect(v.rcPro).toBe("manquante");
    expect(v.kbis).toBe("absent");
    expect(v.alertesOuvertes).toBe(2);
  });

  it("marque comme a_jour une attestation valide plus d'un mois", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: new Date(Date.now() + 60 * JOUR_MS),
        assuranceRcProValableJusquA: new Date(Date.now() + 180 * JOUR_MS),
        kbisCle: "kbis/key",
      }),
    );
    expect(v.urssaf).toBe("a_jour");
    expect(v.rcPro).toBe("a_jour");
    expect(v.kbis).toBe("present");
    expect(v.alertesOuvertes).toBe(0);
  });

  it("marque comme expire_bientot si < 30 j", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: new Date(Date.now() + 15 * JOUR_MS),
      }),
    );
    expect(v.urssaf).toBe("expire_bientot");
    expect(v.urssafExpireDans).toBeGreaterThanOrEqual(14);
    expect(v.urssafExpireDans).toBeLessThanOrEqual(15);
  });

  it("marque comme expiree si date passée", () => {
    const v = computeVigilance(
      prestataireFake({
        attestationUrssafValableJusquA: new Date(Date.now() - 10 * JOUR_MS),
      }),
    );
    expect(v.urssaf).toBe("expiree");
    expect(v.urssafExpireDans).toBeLessThan(0);
  });
});

describe("messageExpiration", () => {
  it("produit un message humain pour chaque plage", () => {
    expect(messageExpiration(null)).toBe("Non renseignée");
    expect(messageExpiration(-3)).toBe("Expirée il y a 3 j");
    expect(messageExpiration(0)).toBe("Expire aujourd'hui");
    expect(messageExpiration(1)).toBe("Expire demain");
    expect(messageExpiration(15)).toBe("Expire dans 15 j");
    expect(messageExpiration(120)).toBe("Valide 120 j de plus");
  });
});
