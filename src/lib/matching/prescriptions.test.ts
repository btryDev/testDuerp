import { describe, expect, it } from "vitest";
import { obligationsIncendie } from "@/lib/referentiels/conformite";
import {
  porteurDe,
  type Obligation,
} from "@/lib/referentiels/conformite/types";
import {
  appliquerPrescriptions,
  estObligationSurMesure,
  estPeriodicitePlusStricte,
  PREFIXE_PRESCRIPTION,
} from "./prescriptions";
import type {
  EquipementMatching,
  ObligationApplicable,
  PrescriptionMatching,
} from "./types";

const NOW = new Date("2026-08-25T10:00:00Z");

const extincteur: EquipementMatching = {
  id: "eq-ext",
  libelle: "Extincteurs RDC",
  categorie: "EXTINCTEUR",
  caracteristiques: null,
};
const extincteur2: EquipementMatching = {
  id: "eq-ext-2",
  libelle: "Extincteurs étage",
  categorie: "EXTINCTEUR",
  caracteristiques: null,
};
const alarme: EquipementMatching = {
  id: "eq-alarme",
  libelle: "SSI",
  categorie: "ALARME_INCENDIE",
  caracteristiques: null,
};

const extincteursAnnuelle = obligationsIncendie.find(
  (o) => o.id === "incendie-erp-extincteurs-annuelle",
) as Obligation;
const registre = obligationsIncendie.find(
  (o) => o.id === "incendie-registre-securite",
) as Obligation;

function applicable(
  o: Obligation,
  equipements: EquipementMatching[],
): ObligationApplicable {
  return {
    obligation: o,
    equipementsConcernes: equipements,
    porteur: porteurDe(o),
    raisons: ["ERP"],
  };
}

function prescription(
  partial: Partial<PrescriptionMatching> & Pick<PrescriptionMatching, "id" | "effet">,
): PrescriptionMatching {
  return {
    source: "arrete_municipal",
    reference: "AM 2026-12",
    autorite: "Mairie",
    dateDocument: new Date("2026-03-01T00:00:00Z"),
    dateFin: null,
    obligationId: null,
    libelle: null,
    description: null,
    periodicite: "semestrielle",
    realisateurRequis: ["personne_qualifiee"],
    categorieEquipement: null,
    equipementId: null,
    ...partial,
  };
}

describe("prescriptions — estPeriodicitePlusStricte", () => {
  it("semestrielle est plus stricte qu'annuelle, pas l'inverse ni l'égal", () => {
    expect(estPeriodicitePlusStricte("semestrielle", "annuelle")).toBe(true);
    expect(estPeriodicitePlusStricte("annuelle", "semestrielle")).toBe(false);
    expect(estPeriodicitePlusStricte("annuelle", "annuelle")).toBe(false);
  });

  it("toute périodicité datée renforce une obligation sans échéance", () => {
    expect(estPeriodicitePlusStricte("annuelle", "autre")).toBe(true);
    expect(
      estPeriodicitePlusStricte("annuelle", "mise_en_service_uniquement"),
    ).toBe(true);
    expect(estPeriodicitePlusStricte("autre", "annuelle")).toBe(false);
    expect(estPeriodicitePlusStricte("autre", "autre")).toBe(false);
  });
});

describe("prescriptions — renforce_periodicite", () => {
  it("resserre la périodicité sur tous les équipements déclencheurs, avec la raison", () => {
    const res = appliquerPrescriptions(
      [applicable(extincteursAnnuelle, [extincteur, extincteur2])],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          periodicite: "semestrielle",
        }),
      ],
      [extincteur, extincteur2],
      NOW,
    );
    expect(res.ignorees).toHaveLength(0);
    const s = res.applicables[0].surcharges!;
    expect(s["eq-ext"].periodicite).toBe("semestrielle");
    expect(s["eq-ext-2"].periodicite).toBe("semestrielle");
    expect(s["eq-ext"].prescriptionId).toBe("p1");
    expect(s["eq-ext"].raison).toContain("arrêté municipal AM 2026-12");
  });

  it("ne surcharge qu'un seul équipement quand `equipementId` est renseigné", () => {
    const res = appliquerPrescriptions(
      [applicable(extincteursAnnuelle, [extincteur, extincteur2])],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          equipementId: "eq-ext-2",
        }),
      ],
      [extincteur, extincteur2],
      NOW,
    );
    const s = res.applicables[0].surcharges!;
    expect(s["eq-ext"]).toBeUndefined();
    expect(s["eq-ext-2"].periodicite).toBe("semestrielle");
  });

  it("refuse un rythme égal ou plus souple — rattrapé par le référentiel", () => {
    const res = appliquerPrescriptions(
      [applicable(extincteursAnnuelle, [extincteur])],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          periodicite: "biennale",
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res.applicables[0].surcharges).toBeUndefined();
    expect(res.ignorees).toHaveLength(1);
    expect(res.ignorees[0].raison).toContain("rattrapée par le référentiel");
  });

  it("accepte n'importe quel rythme sur une obligation permanente (`autre`)", () => {
    const res = appliquerPrescriptions(
      [applicable(registre, [extincteur])],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: registre.id,
          periodicite: "annuelle",
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res.applicables[0].surcharges!["eq-ext"].periodicite).toBe(
      "annuelle",
    );
  });

  it("ignore une prescription qui cible une obligation non applicable ici", () => {
    const res = appliquerPrescriptions(
      [],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res.ignorees).toHaveLength(1);
    expect(res.ignorees[0].raison).toContain("ne s'applique pas");
  });

  it("deux prescriptions sur le même couple : la plus courte gagne, l'autre est signalée", () => {
    const res = appliquerPrescriptions(
      [applicable(extincteursAnnuelle, [extincteur])],
      [
        prescription({
          id: "p-longue",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          periodicite: "semestrielle",
          dateDocument: new Date("2026-01-01T00:00:00Z"),
        }),
        prescription({
          id: "p-courte",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          periodicite: "trimestrielle",
          dateDocument: new Date("2026-02-01T00:00:00Z"),
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res.applicables[0].surcharges!["eq-ext"].prescriptionId).toBe(
      "p-courte",
    );
    expect(res.ignorees).toHaveLength(0);

    // Ordre inversé de lecture : même résultat (déterminisme).
    const res2 = appliquerPrescriptions(
      [applicable(extincteursAnnuelle, [extincteur])],
      [
        prescription({
          id: "p-courte",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          periodicite: "trimestrielle",
          dateDocument: new Date("2026-01-01T00:00:00Z"),
        }),
        prescription({
          id: "p-longue",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          periodicite: "semestrielle",
          dateDocument: new Date("2026-02-01T00:00:00Z"),
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res2.applicables[0].surcharges!["eq-ext"].prescriptionId).toBe(
      "p-courte",
    );
    expect(res2.ignorees).toHaveLength(1);
    expect(res2.ignorees[0].prescription.id).toBe("p-longue");
  });

  it("une prescription levée (dateFin passée) est ignorée et le dit", () => {
    const res = appliquerPrescriptions(
      [applicable(extincteursAnnuelle, [extincteur])],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
          dateFin: new Date("2026-06-30T00:00:00Z"),
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res.applicables[0].surcharges).toBeUndefined();
    expect(res.ignorees[0].raison).toContain("levée");
  });

  it("ne mute pas le résultat du moteur", () => {
    const entree = applicable(extincteursAnnuelle, [extincteur]);
    appliquerPrescriptions(
      [entree],
      [
        prescription({
          id: "p1",
          effet: "renforce_periodicite",
          obligationId: extincteursAnnuelle.id,
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(entree.surcharges).toBeUndefined();
  });
});

describe("prescriptions — obligation_sur_mesure", () => {
  it("par catégorie : tous les équipements de la catégorie déclenchent", () => {
    const res = appliquerPrescriptions(
      [],
      [
        prescription({
          id: "p1",
          effet: "obligation_sur_mesure",
          libelle: "Essai de la colonne sèche",
          categorieEquipement: "EXTINCTEUR",
        }),
      ],
      [extincteur, extincteur2, alarme],
      NOW,
    );
    expect(res.surMesure).toHaveLength(1);
    expect(res.surMesure[0].equipementsConcernes.map((e) => e.id)).toEqual([
      "eq-ext",
      "eq-ext-2",
    ]);
    expect(res.surMesure[0].raisons[0]).toContain(
      "Prescription propre à votre établissement",
    );
  });

  it("par équipement : seul l'équipement visé déclenche", () => {
    const res = appliquerPrescriptions(
      [],
      [
        prescription({
          id: "p1",
          effet: "obligation_sur_mesure",
          libelle: "Contrôle du SSI par organisme",
          equipementId: "eq-alarme",
        }),
      ],
      [extincteur, alarme],
      NOW,
    );
    expect(res.surMesure[0].equipementsConcernes.map((e) => e.id)).toEqual([
      "eq-alarme",
    ]);
  });

  it("sans déclencheur déclaré : ignorée avec raison", () => {
    const res = appliquerPrescriptions(
      [],
      [
        prescription({
          id: "p1",
          effet: "obligation_sur_mesure",
          libelle: "X",
          categorieEquipement: "ASCENSEUR",
        }),
      ],
      [extincteur],
      NOW,
    );
    expect(res.surMesure).toHaveLength(0);
    expect(res.ignorees[0].raison).toContain("Aucun équipement");
  });
});

describe("prescriptions — namespace des obligations sur mesure", () => {
  it("le préfixe distingue une ligne sur mesure d'une ligne du référentiel", () => {
    expect(estObligationSurMesure(`${PREFIXE_PRESCRIPTION}abc`)).toBe(true);
    expect(estObligationSurMesure("incendie-erp-extincteurs-annuelle")).toBe(
      false,
    );
  });
});
