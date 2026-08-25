import { describe, expect, it } from "vitest";
import { obligationsConformite } from "@/lib/referentiels/conformite";
import {
  CATEGORIES_TRI_ETAT,
  CHAMPS_TRI_ETAT,
  equipementSchema,
  normaliserFormDataEquipement,
  normaliserTriEtat,
  serialiserCaracteristiques,
  valeurTriEtat,
} from "./schema";

const base = {
  libelle: "TGBT principal",
  categorie: "INSTALLATION_ELECTRIQUE" as const,
};

describe("equipementSchema — validations de base", () => {
  it("accepte un équipement minimal", () => {
    const res = equipementSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  it("refuse un libellé vide", () => {
    const res = equipementSchema.safeParse({ ...base, libelle: "  " });
    expect(res.success).toBe(false);
  });

  it("refuse une catégorie inconnue", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "EXOTIQUE",
    });
    expect(res.success).toBe(false);
  });

  it("accepte une date ISO courte AAAA-MM-JJ et la parse en Date", () => {
    const res = equipementSchema.safeParse({
      ...base,
      dateMiseEnService: "2024-03-15",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.dateMiseEnService).toBeInstanceOf(Date);
    }
  });

  it("refuse une date au format invalide", () => {
    const res = equipementSchema.safeParse({
      ...base,
      dateMiseEnService: "15/03/2024",
    });
    expect(res.success).toBe(false);
  });

  it("laisse la date vide passer comme undefined", () => {
    const res = equipementSchema.safeParse({
      ...base,
      dateMiseEnService: "",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.dateMiseEnService).toBeUndefined();
  });
});

describe("equipementSchema — cohérence catégorie / propriétés (superRefine)", () => {
  it("refuse aGroupeElectrogene=true hors installation électrique", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "VMC",
      aGroupeElectrogene: true,
    });
    expect(res.success).toBe(false);
  });

  it("accepte aGroupeElectrogene=true sur une installation électrique", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "INSTALLATION_ELECTRIQUE",
      aGroupeElectrogene: true,
    });
    expect(res.success).toBe(true);
  });

  it("refuse nbVehiculesParkingCouvert sur une hotte", () => {
    const res = equipementSchema.safeParse({
      ...base,
      categorie: "HOTTE_PRO",
      nbVehiculesParkingCouvert: 300,
    });
    expect(res.success).toBe(false);
  });

  it("accepte nbVehiculesParkingCouvert sur une VMC", () => {
    const res = equipementSchema.safeParse({
      libelle: "VMC parking souterrain",
      categorie: "VMC",
      nbVehiculesParkingCouvert: 420,
    });
    expect(res.success).toBe(true);
  });

  it("refuse estLocalPollutionSpecifique sur un extincteur", () => {
    const res = equipementSchema.safeParse({
      libelle: "Extincteur CO₂ 5kg",
      categorie: "EXTINCTEUR",
      estLocalPollutionSpecifique: true,
    });
    expect(res.success).toBe(false);
  });

  it("accepte estLocalPollutionSpecifique sur une VMC / CTA / Hotte", () => {
    for (const c of ["VMC", "CTA", "HOTTE_PRO"] as const) {
      const res = equipementSchema.safeParse({
        libelle: "Aération",
        categorie: c,
        estLocalPollutionSpecifique: true,
      });
      expect(res.success).toBe(true);
    }
  });
});

describe("serialiserCaracteristiques", () => {
  it("renvoie null si rien de spécifique n'est positionné", () => {
    const res = equipementSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(serialiserCaracteristiques(res.data)).toBeNull();
    }
  });

  it("conserve uniquement les clés renseignées", () => {
    const res = equipementSchema.safeParse({
      ...base,
      aGroupeElectrogene: true,
      nombre: 3,
      notes: "  Sur façade ouest  ",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      const json = serialiserCaracteristiques(res.data);
      expect(json).toEqual({
        aGroupeElectrogene: true,
        nombre: 3,
        notes: "Sur façade ouest",
      });
    }
  });
});

// =============================================================================
// Questions à trois états (amendement 2026-08)
// =============================================================================

describe("normaliserTriEtat", () => {
  it("reconnaît les formes affirmatives", () => {
    for (const v of ["oui", "true", "on", "1", "  OUI  ", true]) {
      expect(normaliserTriEtat(v)).toBe(true);
    }
  });

  it("reconnaît les formes négatives", () => {
    for (const v of ["non", "false", "off", "0", " NON ", false]) {
      expect(normaliserTriEtat(v)).toBe(false);
    }
  });

  it("ne fabrique JAMAIS un « non » depuis une valeur inconnue ou absente", () => {
    // Point de sécurité : un `false` implicite éteindrait une obligation de
    // criticité élevée sans que personne n'ait répondu quoi que ce soit.
    for (const v of ["", "  ", undefined, null, 42, {}, "peut-être"]) {
      expect(normaliserTriEtat(v)).toBeUndefined();
    }
  });
});

describe("valeurTriEtat", () => {
  it("fait l'aller-retour avec normaliserTriEtat", () => {
    for (const v of [true, false, undefined]) {
      expect(normaliserTriEtat(valeurTriEtat(v))).toBe(v);
    }
    expect(normaliserTriEtat(valeurTriEtat(null))).toBeUndefined();
  });
});

describe("equipementSchema — questions à trois états", () => {
  it("accepte oui / non / absence sur la bonne catégorie", () => {
    for (const [valeur, attendu] of [
      ["oui", true],
      ["non", false],
      ["", undefined],
    ] as const) {
      const res = equipementSchema.safeParse({
        libelle: "Extincteurs du hall",
        categorie: "EXTINCTEUR",
        aRobinetsIncendieArmes: valeur,
      });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.aRobinetsIncendieArmes).toBe(attendu);
    }
  });

  it("refuse une réponse posée sur une catégorie incompatible", () => {
    for (const { champ, categories } of CATEGORIES_TRI_ETAT) {
      const categorieHorsChamp = "BAES";
      expect(categories).not.toContain(categorieHorsChamp);
      const res = equipementSchema.safeParse({
        libelle: "Bloc de secours",
        categorie: categorieHorsChamp,
        [champ]: "oui",
      });
      expect(res.success, champ).toBe(false);
    }
  });

  it("refuse aussi une réponse « non » hors catégorie", () => {
    const res = equipementSchema.safeParse({
      libelle: "Bloc de secours",
      categorie: "BAES",
      sertAuLevageDePersonnes: "non",
    });
    expect(res.success).toBe(false);
  });

  it("sérialise « non » (distinct de l'absence de réponse)", () => {
    const res = equipementSchema.safeParse({
      libelle: "Transpalette",
      categorie: "EQUIPEMENT_LEVAGE",
      sertAuLevageDePersonnes: "non",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(serialiserCaracteristiques(res.data)).toEqual({
        sertAuLevageDePersonnes: false,
      });
    }
  });

  it("ne sérialise rien quand la question n'a pas reçu de réponse", () => {
    const res = equipementSchema.safeParse({
      libelle: "Transpalette",
      categorie: "EQUIPEMENT_LEVAGE",
      sertAuLevageDePersonnes: "",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(serialiserCaracteristiques(res.data)).toBeNull();
    }
  });
});

describe("normaliserFormDataEquipement", () => {
  function fd(entries: Record<string, string>): FormData {
    const f = new FormData();
    for (const [k, v] of Object.entries(entries)) f.append(k, v);
    return f;
  }

  it("case à cocher absente ⇒ false ; question à trois états absente ⇒ undefined", () => {
    const out = normaliserFormDataEquipement(
      fd({ libelle: "Transpalette", categorie: "EQUIPEMENT_LEVAGE" }),
    );
    expect(out.aGroupeElectrogene).toBe(false);
    expect(out.sertAuLevageDePersonnes).toBeUndefined();
    expect(out.aAccessoiresDeLevage).toBeUndefined();
  });

  it("transmet les réponses explicites au schéma", () => {
    const out = normaliserFormDataEquipement(
      fd({
        libelle: "Nacelle",
        categorie: "EQUIPEMENT_LEVAGE",
        sertAuLevageDePersonnes: "oui",
        aAccessoiresDeLevage: "non",
      }),
    );
    const res = equipementSchema.safeParse(out);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.sertAuLevageDePersonnes).toBe(true);
      expect(res.data.aAccessoiresDeLevage).toBe(false);
    }
  });
});

describe("aller-retour édition — aucune réponse ne se perd", () => {
  /**
   * Le bug : la page d'édition recopiait à la main la liste des propriétés à
   * repasser au formulaire, et n'avait pas suivi l'ajout des questions à trois
   * états. Modifier le libellé d'un équipement effaçait toutes ses réponses —
   * et un « non » redevenu « pas de réponse » RALLUME les obligations en
   * opt-out. Perte de données silencieuse, à conséquence réglementaire.
   *
   * Ce test garde le maillon sérialisation : tout ce qui est stocké doit
   * revenir identique après un aller-retour formulaire.
   */
  it("un équipement pleinement renseigné se relit sans perte", () => {
    const saisie = {
      libelle: "SSI du hall",
      categorie: "ALARME_INCENDIE" as const,
      dessertLocauxSommeil: "non",
    };
    const res = equipementSchema.safeParse(saisie);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const stocke = serialiserCaracteristiques(res.data);
    expect(stocke).toEqual({ dessertLocauxSommeil: false });

    // Second passage : la page repasse la valeur stockée au formulaire, qui la
    // resoumet. Le « non » doit survivre.
    const relu = equipementSchema.safeParse({
      libelle: saisie.libelle,
      categorie: saisie.categorie,
      dessertLocauxSommeil: valeurTriEtat(false),
    });
    expect(relu.success).toBe(true);
    if (relu.success) {
      expect(serialiserCaracteristiques(relu.data)).toEqual(stocke);
    }
  });

  it("une valeur non repassée au formulaire est bien perdue (ce que le test ci-dessus prévient)", () => {
    // Démonstration du mécanisme, pour que la régression soit lisible : si la
    // page oublie un champ, le schéma reçoit `undefined` et la clé disparaît.
    const res = equipementSchema.safeParse({
      libelle: "SSI du hall",
      categorie: "ALARME_INCENDIE",
    });
    expect(res.success).toBe(true);
    if (res.success) expect(serialiserCaracteristiques(res.data)).toBeNull();
  });
});

describe("cohérence schéma ↔ référentiel d'obligations", () => {
  it("toute propriété conditionnant une obligation est collectée par le formulaire", () => {
    // Une condition qui porte sur une propriété que rien ne renseigne est une
    // condition que l'utilisateur ne peut jamais satisfaire ni infirmer.
    const collectees = new Set<string>([
      ...CHAMPS_TRI_ETAT,
      "aGroupeElectrogene",
      "estLocalPollutionSpecifique",
      "nbVehiculesParkingCouvert",
    ]);
    for (const o of obligationsConformite) {
      for (const c of o.conditions ?? []) {
        expect(collectees, `${o.id} → ${c.propriete}`).toContain(c.propriete);
      }
    }
  });

  it("la catégorie visée par une condition accepte bien la propriété côté schéma", () => {
    for (const o of obligationsConformite) {
      for (const c of o.conditions ?? []) {
        const regle = CATEGORIES_TRI_ETAT.find(
          (r) => r.champ === c.propriete,
        );
        if (!regle) continue;
        expect(regle.categories, `${o.id} → ${c.propriete}`).toContain(
          c.categorie,
        );
      }
    }
  });
});
