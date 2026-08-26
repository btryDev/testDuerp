import { describe, expect, it } from "vitest";
import {
  couvertureDeLEtablissement,
  type EtablissementCouverture,
} from "./couverture";

const base: EtablissementCouverture = {
  estERP: true,
  estIGH: false,
  categorieErp: "N5",
};

describe("couvertureDeLEtablissement", () => {
  it("couvre un ERP de 5e catégorie", () => {
    expect(couvertureDeLEtablissement(base).statut).toBe("couvert");
  });

  it("couvre un établissement qui n'est pas ERP, sans regarder la catégorie", () => {
    const travailSeul = { ...base, estERP: false, categorieErp: null };
    expect(couvertureDeLEtablissement(travailSeul).statut).toBe("couvert");
  });

  it.each(["N1", "N2", "N3", "N4"] as const)(
    "met hors périmètre un ERP de catégorie %s",
    (categorieErp) => {
      const c = couvertureDeLEtablissement({ ...base, categorieErp });
      expect(c.statut).toBe("hors_perimetre");
    },
  );

  it("ne tranche pas quand la catégorie manque, et ne suppose surtout pas la 5e", () => {
    // Supposer « couvert » ici est l'erreur que ce module existe pour
    // empêcher : elle produirait un écran rassurant sur une donnée absente.
    const c = couvertureDeLEtablissement({ ...base, categorieErp: null });
    expect(c.statut).toBe("indetermine");
  });

  it("met un IGH hors périmètre avant même de regarder la catégorie ERP", () => {
    const c = couvertureDeLEtablissement({
      ...base,
      estIGH: true,
      categorieErp: "N5",
    });
    expect(c.statut).toBe("hors_perimetre");
    if (c.statut === "hors_perimetre") {
      expect(c.motif).toContain("immeuble de grande hauteur");
    }
  });
});
