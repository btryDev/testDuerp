import { describe, expect, it } from "vitest";
import { nomDossierArchive, nomEntreeArchive } from "./noms";

describe("nomEntreeArchive", () => {
  it("garde un nom ordinaire et son extension", () => {
    expect(nomEntreeArchive("attestation-urssaf-2026.pdf", "URSSAF.pdf")).toBe(
      "attestation-urssaf-2026.pdf",
    );
  });

  it("neutralise une remontée d'arborescence", () => {
    expect(nomEntreeArchive("../../../../.ssh/authorized_keys", "URSSAF.pdf")).toBe(
      "authorized_keys",
    );
    expect(nomEntreeArchive("..\\..\\Windows\\System32\\drivers.sys", "K.pdf")).toBe(
      "drivers.sys",
    );
  });

  it("refuse un nom qui n'est qu'une remontée", () => {
    expect(nomEntreeArchive("..", "URSSAF.pdf")).toBe("URSSAF.pdf");
    expect(nomEntreeArchive("../", "URSSAF.pdf")).toBe("URSSAF.pdf");
    expect(nomEntreeArchive("/", "URSSAF.pdf")).toBe("URSSAF.pdf");
  });

  it("retombe sur le défaut quand le nom est vide ou absent", () => {
    expect(nomEntreeArchive(null, "RC_Pro.pdf")).toBe("RC_Pro.pdf");
    expect(nomEntreeArchive("   ", "RC_Pro.pdf")).toBe("RC_Pro.pdf");
    expect(nomEntreeArchive("***", "RC_Pro.pdf")).toBe("___");
  });

  it("remplace les caractères hors jeu sûr sans toucher au point d'extension", () => {
    expect(nomEntreeArchive("Kbis Société & Cie.pdf", "Kbis.pdf")).toBe(
      "Kbis_Société_&_Cie.pdf".replace(/[^a-zA-Z0-9._-]/g, "_"),
    );
  });

  it("borne la longueur", () => {
    const long = `${"a".repeat(300)}.pdf`;
    expect(nomEntreeArchive(long, "K.pdf").length).toBe(120);
  });
});

describe("nomDossierArchive", () => {
  it("remplace les espaces par des soulignés", () => {
    expect(nomDossierArchive("Ascenseurs du Nord", "Prestataire")).toBe(
      "Ascenseurs_du_Nord",
    );
  });

  it("retombe sur le défaut quand la raison sociale n'a aucun caractère sûr", () => {
    expect(nomDossierArchive("///", "Prestataire")).toBe("Prestataire");
  });
});
