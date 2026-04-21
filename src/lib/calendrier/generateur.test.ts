import { describe, expect, it } from "vitest";
import type { ObligationApplicable } from "@/lib/matching";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import type { EquipementMatching } from "@/lib/matching/types";
import {
  comparerParUrgence,
  genererProchainesVerifications,
  type VerificationsPrecedentes,
} from "./generateur";

// ============================================================================
// Fixtures
// ============================================================================

function fakeObligation(
  over: Partial<Obligation> & Pick<Obligation, "id" | "periodicite">,
): Obligation {
  return {
    domaine: "electricite",
    libelle: `Obligation ${over.id}`,
    referencesLegales: [
      { source: "CODE_TRAVAIL", reference: "R. test" },
    ] as Obligation["referencesLegales"],
    realisateurs: ["personne_qualifiee"] as Obligation["realisateurs"],
    criticite: 3,
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"] as Obligation["categoriesEquipement"],
    ...over,
  };
}

function fakeEquipement(id = "eq-1"): EquipementMatching {
  return {
    id,
    libelle: `Équipement ${id}`,
    categorie: "INSTALLATION_ELECTRIQUE",
    caracteristiques: null,
  };
}

function applique(o: Obligation, eqs: EquipementMatching[]): ObligationApplicable {
  return { obligation: o, equipementsConcernes: eqs, raisons: ["test"] };
}

// ============================================================================
// TESTS
// ============================================================================

describe("générateur calendrier — aucune vérif précédente", () => {
  it("crée une occurrence 'a_planifier' urgente pour chaque couple", () => {
    const o = fakeObligation({ id: "o-annuelle", periodicite: "annuelle" });
    const eq = fakeEquipement();
    const now = new Date("2026-01-15T00:00:00Z");

    const res = genererProchainesVerifications([applique(o, [eq])], new Map(), {
      now,
    });

    expect(res).toHaveLength(1);
    expect(res[0].statut).toBe("a_planifier");
    expect(res[0].estUrgent).toBe(true);
    expect(res[0].datePrevue).toEqual(now);
    expect(res[0].cleUnique).toBe("o-annuelle::eq-1");
  });

  it("obligation avec 2 équipements → 2 occurrences (clés distinctes)", () => {
    const o = fakeObligation({ id: "o-a", periodicite: "semestrielle" });
    const e1 = fakeEquipement("eq-1");
    const e2 = fakeEquipement("eq-2");

    const res = genererProchainesVerifications([applique(o, [e1, e2])]);
    expect(res.map((r) => r.cleUnique).sort()).toEqual([
      "o-a::eq-1",
      "o-a::eq-2",
    ]);
  });

  it("périodicité 'autre' → aucune occurrence générée", () => {
    const o = fakeObligation({ id: "registre", periodicite: "autre" });
    const res = genererProchainesVerifications([
      applique(o, [fakeEquipement()]),
    ]);
    expect(res).toHaveLength(0);
  });
});

describe("générateur calendrier — dernière vérif connue", () => {
  it("calcul datePrevue = derniereDate + 365j pour annuelle", () => {
    const o = fakeObligation({ id: "annuelle", periodicite: "annuelle" });
    const eq = fakeEquipement();
    const now = new Date("2026-03-01T00:00:00Z");
    const prec: VerificationsPrecedentes = new Map([
      [`annuelle::eq-1`, new Date("2026-01-10T00:00:00Z")],
    ]);

    const res = genererProchainesVerifications([applique(o, [eq])], prec, {
      now,
    });

    expect(res).toHaveLength(1);
    const dp = res[0].datePrevue;
    const attendu = new Date("2026-01-10T00:00:00Z");
    attendu.setDate(attendu.getDate() + 365);
    expect(dp.getTime()).toBe(attendu.getTime());
    expect(res[0].statut).toBe("planifiee");
    expect(res[0].estUrgent).toBe(false);
  });

  it("dernière vérif ancienne → statut 'depassee' et urgent=true", () => {
    const o = fakeObligation({ id: "annuelle", periodicite: "annuelle" });
    const eq = fakeEquipement();
    const now = new Date("2026-03-01T00:00:00Z");
    const prec: VerificationsPrecedentes = new Map([
      [`annuelle::eq-1`, new Date("2024-01-01T00:00:00Z")],
    ]);

    const res = genererProchainesVerifications([applique(o, [eq])], prec, {
      now,
    });

    expect(res[0].statut).toBe("depassee");
    expect(res[0].estUrgent).toBe(true);
  });

  it("périodicité quinquennale → prochaine date + 1825 jours", () => {
    const o = fakeObligation({ id: "quinq", periodicite: "quinquennale" });
    const eq = fakeEquipement();
    const derniere = new Date("2024-06-01T00:00:00Z");
    const prec: VerificationsPrecedentes = new Map([[`quinq::eq-1`, derniere]]);
    const now = new Date("2026-01-01T00:00:00Z"); // avant la prochaine

    const res = genererProchainesVerifications([applique(o, [eq])], prec, {
      now,
    });
    expect(res[0].statut).toBe("planifiee");
    const attendu = new Date(derniere.getTime());
    attendu.setDate(attendu.getDate() + 1825);
    expect(res[0].datePrevue.getTime()).toBe(attendu.getTime());
  });
});

describe("générateur calendrier — mise en service uniquement", () => {
  it("aucune vérif précédente → une occurrence urgente", () => {
    const o = fakeObligation({
      id: "mes",
      periodicite: "mise_en_service_uniquement",
    });
    const res = genererProchainesVerifications([
      applique(o, [fakeEquipement()]),
    ]);
    expect(res).toHaveLength(1);
    expect(res[0].estUrgent).toBe(true);
    expect(res[0].statut).toBe("a_planifier");
  });

  it("vérif précédente connue → plus d'occurrence (one-shot consommé)", () => {
    const o = fakeObligation({
      id: "mes",
      periodicite: "mise_en_service_uniquement",
    });
    const prec: VerificationsPrecedentes = new Map([
      [`mes::eq-1`, new Date("2025-05-01T00:00:00Z")],
    ]);
    const res = genererProchainesVerifications(
      [applique(o, [fakeEquipement()])],
      prec,
    );
    expect(res).toHaveLength(0);
  });
});

describe("générateur calendrier — tri par urgence", () => {
  it("urgents d'abord, puis date croissante, puis criticité décroissante", () => {
    const o1 = fakeObligation({ id: "o1", periodicite: "annuelle", criticite: 5 });
    const o2 = fakeObligation({ id: "o2", periodicite: "annuelle", criticite: 3 });
    const e1 = fakeEquipement("e1");
    const e2 = fakeEquipement("e2");

    const now = new Date("2026-03-01T00:00:00Z");
    const prec: VerificationsPrecedentes = new Map([
      // o1/e1 : dépassée
      ["o1::e1", new Date("2024-01-01T00:00:00Z")],
      // o2/e2 : planifiée dans 6 mois
      ["o2::e2", new Date("2025-09-01T00:00:00Z")],
    ]);

    const res = genererProchainesVerifications(
      [applique(o1, [e1]), applique(o2, [e2])],
      prec,
      { now },
    );
    res.sort(comparerParUrgence);
    expect(res[0].cleUnique).toBe("o1::e1"); // dépassée en premier
    expect(res[1].cleUnique).toBe("o2::e2");
  });

  it("entre deux dépassées, date plus ancienne d'abord", () => {
    const o1 = fakeObligation({ id: "o1", periodicite: "annuelle" });
    const o2 = fakeObligation({ id: "o2", periodicite: "annuelle" });
    const e = fakeEquipement();
    const now = new Date("2026-03-01T00:00:00Z");
    const prec: VerificationsPrecedentes = new Map([
      ["o1::eq-1", new Date("2023-01-01T00:00:00Z")],
      ["o2::eq-1", new Date("2024-01-01T00:00:00Z")],
    ]);
    // Note : les deux obligations partagent le même équipement "eq-1" ;
    // les clés distinctes viennent de l'obligationId.
    const res = genererProchainesVerifications(
      [applique(o1, [e]), applique(o2, [e])],
      prec,
      { now },
    );
    res.sort(comparerParUrgence);
    expect(res[0].cleUnique).toBe("o1::eq-1"); // plus anciennement dépassée
  });

  it("à date égale, criticité 5 passe avant criticité 3", () => {
    const o1 = fakeObligation({ id: "o1", periodicite: "annuelle", criticite: 3 });
    const o2 = fakeObligation({ id: "o2", periodicite: "annuelle", criticite: 5 });
    const e = fakeEquipement();
    const now = new Date("2026-03-01T00:00:00Z");
    const derniere = new Date("2025-03-01T00:00:00Z");
    const prec: VerificationsPrecedentes = new Map([
      ["o1::eq-1", derniere],
      ["o2::eq-1", derniere],
    ]);
    const res = genererProchainesVerifications(
      [applique(o1, [e]), applique(o2, [e])],
      prec,
      { now },
    );
    res.sort(comparerParUrgence);
    expect(res[0].cleUnique).toBe("o2::eq-1"); // criticité 5 en tête
  });
});

describe("générateur calendrier — performance", () => {
  it("génère 100 occurrences en moins de 500 ms", () => {
    // 100 obligations avec 1 équipement chacune
    const input: ObligationApplicable[] = Array.from({ length: 100 }, (_, i) => {
      const o = fakeObligation({ id: `o-${i}`, periodicite: "annuelle" });
      const eq = fakeEquipement(`eq-${i}`);
      return applique(o, [eq]);
    });
    const t0 = performance.now();
    const res = genererProchainesVerifications(input);
    const dt = performance.now() - t0;
    expect(res.length).toBe(100);
    expect(dt).toBeLessThan(500);
  });
});

describe("générateur calendrier — déterminisme", () => {
  it("deux appels identiques donnent le même résultat", () => {
    const o = fakeObligation({ id: "o", periodicite: "annuelle" });
    const eq = fakeEquipement();
    const now = new Date("2026-01-01T00:00:00Z");
    const a = genererProchainesVerifications([applique(o, [eq])], new Map(), {
      now,
    });
    const b = genererProchainesVerifications([applique(o, [eq])], new Map(), {
      now,
    });
    expect(a).toEqual(b);
  });
});
