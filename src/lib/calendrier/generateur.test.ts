import { describe, expect, it } from "vitest";
import type { ObligationApplicable } from "@/lib/matching";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import type { EquipementMatching } from "@/lib/matching/types";
import {
  comparerParUrgence,
  estMarqueeNonApplicable,
  genererProchainesVerifications,
  libelleSansMarqueur,
  MARQUEUR_NON_APPLICABLE,
  reconcilierCalendrier,
  type OccurrenceExistante,
  type VerificationGenere,
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

describe("générateur calendrier — mise en service comme point de départ", () => {
  const o = () => fakeObligation({ id: "o-annuelle", periodicite: "annuelle" });
  const NOW = new Date("2026-01-15T00:00:00Z");

  it("date le premier cycle d'un équipement neuf, sans le dire urgent", () => {
    // Un extincteur posé le 1er décembre se vérifie le 1er décembre suivant :
    // l'outil sait le déduire, il n'a pas à réclamer la date.
    const res = genererProchainesVerifications(
      [applique(o(), [fakeEquipement()])],
      new Map(),
      {
        now: NOW,
        misesEnService: new Map([["eq-1", new Date("2025-12-01T00:00:00Z")]]),
      },
    );

    expect(res[0].statut).toBe("planifiee");
    expect(res[0].estUrgent).toBe(false);
    expect(res[0].datePrevue).toEqual(new Date("2026-12-01T00:00:00Z"));
  });

  it("ne conclut rien quand le premier cycle est déjà écoulé", () => {
    // Mise en service en 2018 et aucune vérification connue : l'équipement a
    // vécu sans que le dossier le sache. Afficher « en retard depuis 2019 »
    // serait inventer un passé — on dit « à planifier ».
    const res = genererProchainesVerifications(
      [applique(o(), [fakeEquipement()])],
      new Map(),
      {
        now: NOW,
        misesEnService: new Map([["eq-1", new Date("2018-03-01T00:00:00Z")]]),
      },
    );

    expect(res[0].statut).toBe("a_planifier");
    expect(res[0].estUrgent).toBe(true);
    expect(res[0].datePrevue).toEqual(NOW);
  });

  it("laisse la vérification connue primer sur la mise en service", () => {
    const res = genererProchainesVerifications(
      [applique(o(), [fakeEquipement()])],
      new Map([["o-annuelle::eq-1", new Date("2025-06-10T00:00:00Z")]]),
      {
        now: NOW,
        misesEnService: new Map([["eq-1", new Date("2025-12-01T00:00:00Z")]]),
      },
    );

    // 2025-06-10 + 1 an, et non 2025-12-01 + 1 an : un contrôle réalisé est
    // une preuve, une mise en service n'est qu'un point de départ par défaut.
    expect(res[0].datePrevue).toEqual(new Date("2026-06-10T00:00:00Z"));
  });

  it("retombe sur « à planifier » sans mise en service connue", () => {
    const res = genererProchainesVerifications(
      [applique(o(), [fakeEquipement()])],
      new Map(),
      { now: NOW, misesEnService: new Map() },
    );

    expect(res[0].statut).toBe("a_planifier");
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

// ============================================================================
// Réconciliation idempotente — ADR-012
//
// Ces tests décrivent les pertes de données silencieuses que le motif
// « delete puis create » provoquait, et qui ne doivent plus jamais se produire.
// ============================================================================

const NOW = new Date("2026-08-11T09:00:00Z");

/** Une ligne de suivi en base, avec des valeurs déjà alignées sur le
 *  référentiel — de sorte qu'une régénération n'ait rien à changer. */
function ligneExistante(
  over: Partial<OccurrenceExistante> &
    Pick<OccurrenceExistante, "id" | "obligationId" | "equipementId">,
): OccurrenceExistante {
  return {
    libelleObligation: `Obligation ${over.obligationId}`,
    periodicite: "annuelle",
    realisateurRequis: ["personne_qualifiee"],
    datePrevue: new Date("2026-12-01T00:00:00Z"),
    dateRealisee: null,
    statut: "a_planifier",
    porteUnePreuve: false,
    ...over,
  };
}

describe("réconciliation — survie des actions correctives", () => {
  // Scénario du chantier : le dirigeant crée une action corrective sur sa
  // vérification électrique dépassée (responsable, échéance), puis déclare un
  // extincteur le lendemain. La déclaration régénère le calendrier.
  it("ne supprime pas une vérification dépassée porteuse d'une action", () => {
    const o = fakeObligation({ id: "elec", periodicite: "annuelle" });
    const eq = fakeEquipement("eq-elec");
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );

    const existante = ligneExistante({
      id: "v-elec",
      obligationId: "elec",
      equipementId: "eq-elec",
      libelleObligation: "Obligation elec",
      datePrevue: new Date("2026-02-01T00:00:00Z"), // passée
      statut: "depassee",
      porteUnePreuve: true, // une action corrective y est rattachée
    });

    const plan = reconcilierCalendrier([existante], aGenerer, { now: NOW });

    expect(plan.aSupprimer).toEqual([]);
    expect(plan.aCreer).toEqual([]);
    expect(plan.aArchiver).toEqual([]);
    // La ligne est reconnue applicable et strictement inchangée : même id,
    // donc l'action rattachée survit.
    expect(plan.inchangees).toBe(1);
  });

  it("ne repousse jamais l'échéance d'un cycle encore ouvert", () => {
    const o = fakeObligation({ id: "elec", periodicite: "annuelle" });
    const eq = fakeEquipement("eq-elec");
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );
    const datePrevue = new Date("2026-02-01T00:00:00Z");

    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-elec",
          obligationId: "elec",
          equipementId: "eq-elec",
          datePrevue,
          statut: "a_planifier", // statut à requalifier : la date est passée
        }),
      ],
      aGenerer,
      { now: NOW },
    );

    expect(plan.aMettreAJour).toHaveLength(1);
    expect(plan.aMettreAJour[0].datePrevue).toEqual(datePrevue);
    expect(plan.aMettreAJour[0].statut).toBe("depassee");
  });
});

describe("réconciliation — idempotence et stabilité des identifiants", () => {
  it("deux régénérations successives produisent le même état", () => {
    const o1 = fakeObligation({ id: "o1", periodicite: "annuelle" });
    const o2 = fakeObligation({ id: "o2", periodicite: "trimestrielle" });
    const eq = fakeEquipement("eq-1");
    const aGenerer = genererProchainesVerifications(
      [applique(o1, [eq]), applique(o2, [eq])],
      new Map(),
      { now: NOW },
    );

    // 1er passage : calendrier vide → deux créations.
    const plan1 = reconcilierCalendrier([], aGenerer, { now: NOW });
    expect(plan1.aCreer).toHaveLength(2);
    expect(plan1.aMettreAJour).toEqual([]);
    expect(plan1.aSupprimer).toEqual([]);

    // Les créations sont matérialisées avec des identifiants stables.
    const enBase: OccurrenceExistante[] = plan1.aCreer.map((v, i) => ({
      id: `v-${i}`,
      obligationId: v.obligationId,
      equipementId: v.equipementId,
      libelleObligation: v.libelleObligation,
      periodicite: v.periodicite,
      realisateurRequis: v.realisateurRequis,
      datePrevue: v.datePrevue,
      dateRealisee: null,
      statut: v.statut,
      porteUnePreuve: false,
    }));

    // 2e passage, à horloge identique : plus rien à faire.
    const plan2 = reconcilierCalendrier(enBase, aGenerer, { now: NOW });
    expect(plan2.aCreer).toEqual([]);
    expect(plan2.aMettreAJour).toEqual([]);
    expect(plan2.aSupprimer).toEqual([]);
    expect(plan2.aArchiver).toEqual([]);
    expect(plan2.inchangees).toBe(2);

    // 3e passage : toujours rien — l'idempotence n'est pas un coup de chance.
    const plan3 = reconcilierCalendrier(enBase, aGenerer, { now: NOW });
    expect(plan3).toEqual(plan2);
  });

  it("une mise à jour ne change jamais l'identifiant de la ligne", () => {
    const o = fakeObligation({
      id: "o1",
      periodicite: "biennale",
      libelle: "Libellé corrigé au référentiel",
    });
    const eq = fakeEquipement("eq-1");
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );

    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-stable",
          obligationId: "o1",
          equipementId: "eq-1",
          libelleObligation: "Ancien libellé",
          periodicite: "annuelle",
        }),
      ],
      aGenerer,
      { now: NOW },
    );

    expect(plan.aSupprimer).toEqual([]);
    expect(plan.aMettreAJour).toHaveLength(1);
    expect(plan.aMettreAJour[0].id).toBe("v-stable");
    expect(plan.aMettreAJour[0].libelleObligation).toBe(
      "Libellé corrigé au référentiel",
    );
    expect(plan.aMettreAJour[0].periodicite).toBe("biennale");
  });
});

describe("réconciliation — un placeholder cède devant une vraie date", () => {
  const genere = (over: Partial<VerificationGenere> = {}): VerificationGenere => ({
    cleUnique: "o-1::eq-1",
    obligationId: "o-1",
    libelleObligation: "Obligation o-1",
    equipementId: "eq-1",
    periodicite: "annuelle",
    realisateurRequis: ["personne_qualifiee"],
    datePrevue: new Date("2026-12-01T00:00:00Z"),
    statut: "a_planifier",
    estUrgent: true,
    criticiteObligation: 3,
    raisons: ["test"],
    ...over,
  });

  it("pose la date calculée sur une ligne qui n'avait jamais de rendez-vous", () => {
    // « À planifier » n'est pas un rendez-vous, c'est son absence : la
    // remplacer par une date déduite de la mise en service n'efface rien.
    const existante = ligneExistante({
      id: "v-1",
      obligationId: "o-1",
      equipementId: "eq-1",
      statut: "a_planifier",
      datePrevue: NOW,
    });
    const plan = reconcilierCalendrier(
      [existante],
      [
        genere({
          statut: "planifiee",
          datePrevue: new Date("2027-03-01T00:00:00Z"),
        }),
      ],
      { now: NOW },
    );

    expect(plan.aMettreAJour[0].datePrevue).toEqual(
      new Date("2027-03-01T00:00:00Z"),
    );
    expect(plan.aMettreAJour[0].statut).toBe("planifiee");
  });

  it("n'efface pas un retard déjà constaté", () => {
    // Une ligne dépassée porte un vrai rendez-vous, manqué. Le générateur ne
    // doit pas pouvoir le repousser — c'est la régression que le
    // delete/create causait autrefois.
    const existante = ligneExistante({
      id: "v-1",
      obligationId: "o-1",
      equipementId: "eq-1",
      statut: "depassee",
      datePrevue: new Date("2026-02-01T00:00:00Z"),
    });
    const plan = reconcilierCalendrier(
      [existante],
      [
        genere({
          statut: "planifiee",
          datePrevue: new Date("2027-03-01T00:00:00Z"),
        }),
      ],
      { now: NOW },
    );

    // Rien à mettre à jour : la ligne garde sa date manquée, et c'est
    // précisément ce qu'on vérifie — la réconciliation n'a pas à y toucher.
    expect(plan.aMettreAJour).toHaveLength(0);
    expect(plan.inchangees).toBe(1);
  });
});

describe("réconciliation — cycles de vérification", () => {
  it("un contrôle encore valide garde son résultat et reçoit sa prochaine échéance", () => {
    const o = fakeObligation({ id: "o1", periodicite: "annuelle" });
    const eq = fakeEquipement("eq-1");
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );
    const dateRealisee = new Date("2026-03-01T00:00:00Z");

    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-1",
          obligationId: "o1",
          equipementId: "eq-1",
          dateRealisee,
          statut: "realisee_conforme",
          datePrevue: new Date("2026-03-01T00:00:00Z"),
          porteUnePreuve: true,
        }),
      ],
      aGenerer,
      { now: NOW },
    );

    expect(plan.aMettreAJour).toHaveLength(1);
    const maj = plan.aMettreAJour[0];
    expect(maj.statut).toBe("realisee_conforme");
    expect(maj.dateRealisee).toEqual(dateRealisee);
    // dateRealisee + 365 j
    expect(maj.datePrevue.getUTCFullYear()).toBe(2027);
  });

  it("un contrôle dont la période est écoulée rouvre un cycle « dépassée »", () => {
    const o = fakeObligation({ id: "o1", periodicite: "annuelle" });
    const eq = fakeEquipement("eq-1");
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );

    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-1",
          obligationId: "o1",
          equipementId: "eq-1",
          dateRealisee: new Date("2024-01-01T00:00:00Z"),
          statut: "realisee_conforme",
          datePrevue: new Date("2024-01-01T00:00:00Z"),
          porteUnePreuve: true,
        }),
      ],
      aGenerer,
      { now: NOW },
    );

    expect(plan.aMettreAJour).toHaveLength(1);
    const maj = plan.aMettreAJour[0];
    // L'outil cesse d'afficher « Conforme » sur un contrôle annuel vieux de
    // deux ans — sans détruire les rapports, qui restent sur la même ligne.
    expect(maj.statut).toBe("depassee");
    expect(maj.dateRealisee).toBeNull();
    expect(maj.id).toBe("v-1");
  });

  it("une obligation one-shot déjà réalisée n'est ni archivée ni replanifiée", () => {
    const o = fakeObligation({
      id: "mes",
      periodicite: "mise_en_service_uniquement",
    });
    const eq = fakeEquipement("eq-1");
    // L'historique n'est volontairement pas passé au générateur : sans cela
    // l'occurrence disparaîtrait de `aGenerer` et serait prise pour une
    // obligation retirée du référentiel.
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );
    const datePrevue = new Date("2025-05-01T00:00:00Z");

    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-mes",
          obligationId: "mes",
          equipementId: "eq-1",
          libelleObligation: "Obligation mes",
          periodicite: "mise_en_service_uniquement",
          datePrevue,
          dateRealisee: new Date("2025-05-01T00:00:00Z"),
          statut: "realisee_conforme",
          porteUnePreuve: true,
        }),
      ],
      aGenerer,
      { now: NOW },
    );

    expect(plan.aArchiver).toEqual([]);
    expect(plan.aSupprimer).toEqual([]);
    expect(plan.aMettreAJour).toEqual([]);
    expect(plan.inchangees).toBe(1);
  });
});

describe("réconciliation — obligations devenues non applicables", () => {
  it("supprime une ligne sans aucune preuve", () => {
    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-orphelin",
          obligationId: "retiree",
          equipementId: "eq-supprime",
        }),
      ],
      [],
      { now: NOW },
    );

    expect(plan.aSupprimer).toEqual(["v-orphelin"]);
    expect(plan.aArchiver).toEqual([]);
  });

  it("archive au lieu de supprimer dès qu'une preuve existe", () => {
    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-preuve",
          obligationId: "retiree",
          equipementId: "eq-desactive",
          libelleObligation: "Vérification annuelle de l'installation",
          porteUnePreuve: true,
        }),
      ],
      [],
      { now: NOW },
    );

    expect(plan.aSupprimer).toEqual([]);
    expect(plan.aArchiver).toEqual([
      {
        id: "v-preuve",
        libelleObligation: `${MARQUEUR_NON_APPLICABLE}Vérification annuelle de l'installation`,
      },
    ]);
  });

  it("une date de réalisation suffit à interdire la suppression", () => {
    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-realisee",
          obligationId: "retiree",
          equipementId: "eq-1",
          dateRealisee: new Date("2025-01-01T00:00:00Z"),
          statut: "realisee_conforme",
          porteUnePreuve: false, // rapport retiré du registre depuis
        }),
      ],
      [],
      { now: NOW },
    );

    expect(plan.aSupprimer).toEqual([]);
    expect(plan.aArchiver).toHaveLength(1);
  });

  it("n'archive pas deux fois la même ligne (idempotence de l'archivage)", () => {
    const dejaMarquee = ligneExistante({
      id: "v-preuve",
      obligationId: "retiree",
      equipementId: "eq-1",
      libelleObligation: `${MARQUEUR_NON_APPLICABLE}Vérification annuelle`,
      porteUnePreuve: true,
    });

    const plan = reconcilierCalendrier([dejaMarquee], [], { now: NOW });
    expect(plan.aArchiver).toEqual([]);
    expect(plan.aSupprimer).toEqual([]);
    expect(plan.inchangees).toBe(1);
  });

  it("retire le marqueur si l'obligation redevient applicable", () => {
    const o = fakeObligation({ id: "o1", periodicite: "annuelle" });
    const eq = fakeEquipement("eq-1");
    const aGenerer = genererProchainesVerifications(
      [applique(o, [eq])],
      new Map(),
      { now: NOW },
    );

    const plan = reconcilierCalendrier(
      [
        ligneExistante({
          id: "v-1",
          obligationId: "o1",
          equipementId: "eq-1",
          libelleObligation: `${MARQUEUR_NON_APPLICABLE}Obligation o1`,
          porteUnePreuve: true,
        }),
      ],
      aGenerer,
      { now: NOW },
    );

    expect(plan.aMettreAJour).toHaveLength(1);
    expect(
      estMarqueeNonApplicable(plan.aMettreAJour[0].libelleObligation),
    ).toBe(false);
  });
});

describe("marqueur de non-applicabilité", () => {
  it("est idempotent et réversible", () => {
    const brut = "Vérification quinquennale";
    const marque = `${MARQUEUR_NON_APPLICABLE}${brut}`;
    expect(estMarqueeNonApplicable(brut)).toBe(false);
    expect(estMarqueeNonApplicable(marque)).toBe(true);
    expect(libelleSansMarqueur(marque)).toBe(brut);
    expect(libelleSansMarqueur(brut)).toBe(brut);
  });
});
