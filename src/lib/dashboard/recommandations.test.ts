import { describe, expect, it } from "vitest";
import { ajouterJours, instantCivil } from "@/lib/dates";
import { evaluerEtatDuerp } from "./duerp";
import {
  genererRecommandations,
  type EntreeRecos,
} from "./recommandations";

// 20 avril 2026, 10:00 heure de Paris.
const NOW = instantCivil(2026, 4, 20, 10);

/** Une date civile décalée de N jours — jamais un `+ N × 86 400 000`, qui
 *  décale d'une heure aux changements d'heure. */
function dateDecalee(joursDeNow: number): Date {
  return ajouterJours(instantCivil(2026, 4, 20), joursDeNow);
}

/** État de DUERP dont la dernière version a `ageJours` jours, dans une
 *  entreprise soumise à la mise à jour annuelle. */
function duerpDe(ageJours: number | null, effectif = 20) {
  return evaluerEtatDuerp(
    {
      ouvert: true,
      dateDerniereVersion: ageJours === null ? null : dateDecalee(-ageJours),
      effectif,
    },
    NOW,
  );
}

/**
 * Dossier « mûr » : équipements déclarés, secteur DUERP choisi, au moins
 * un rapport déposé — aucune règle d'amorçage ne se déclenche, les tests
 * historiques ne testent que les urgences réelles.
 */
function baseEntree(): EntreeRecos {
  return {
    etablissementId: "etab-x",
    verifications: [],
    actions: [],
    nbEquipements: 3,
    duerpSecteurChoisi: true,
    nbRapports: 2,
  };
}

describe("genererRecommandations — tri par urgence", () => {
  it("liste vide quand rien à faire", () => {
    expect(
      genererRecommandations(baseEntree(), { now: NOW }).length,
    ).toBe(0);
  });

  it("vérif dépassée passe en tête", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "depassee",
          datePrevue: dateDecalee(-10),
          libelleObligation: "Vérification élec",
          equipementLibelle: "TGBT",
        },
      ],
      actions: [
        {
          id: "a1",
          statut: "ouverte",
          echeance: dateDecalee(-5),
          libelle: "Refaire câble",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("verif_depassee");
    expect(recs[1].kind).toBe("action_en_retard");
  });

  it("vérif dépassée plus ancienne avant plus récente", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v-recent",
          statut: "depassee",
          datePrevue: dateDecalee(-1),
          libelleObligation: "VMC",
          equipementLibelle: "CTA",
        },
        {
          id: "v-ancien",
          statut: "depassee",
          datePrevue: dateDecalee(-30),
          libelleObligation: "Extincteurs",
          equipementLibelle: "Extincteurs",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].titre).toContain("Extincteurs");
  });

  it("tronque à 5 items max par défaut", () => {
    const verifs = Array.from({ length: 10 }, (_, i) => ({
      id: `v-${i}`,
      statut: "depassee" as const,
      datePrevue: dateDecalee(-i),
      libelleObligation: `Vérif ${i}`,
      equipementLibelle: "X",
    }));
    const e: EntreeRecos = { ...baseEntree(), verifications: verifs };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.length).toBe(5);
  });

  it("accepte une limite custom", () => {
    const actions = Array.from({ length: 10 }, (_, i) => ({
      id: `a-${i}`,
      statut: "ouverte" as const,
      echeance: dateDecalee(-i - 1),
      libelle: `Action ${i}`,
    }));
    const e: EntreeRecos = { ...baseEntree(), actions };
    const recs = genererRecommandations(e, { now: NOW, limite: 3 });
    expect(recs.length).toBe(3);
  });
});

describe("genererRecommandations — catégories", () => {
  it("vérif à venir sous 7 jours", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(3),
          libelleObligation: "Contrôle alarme",
          equipementLibelle: "SSI",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("verif_proche");
  });

  it("vérif à venir au-delà de 7 jours — ignorée", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(30),
          libelleObligation: "Contrôle",
          equipementLibelle: "X",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW }).length).toBe(0);
  });

  it("action à venir sous 15 jours", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      actions: [
        {
          id: "a1",
          statut: "ouverte",
          echeance: dateDecalee(10),
          libelle: "Remplacer BAES",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("action_proche");
  });

  it("DUERP périmé → recommande la mise à jour", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerp: duerpDe(400),
      duerpId: "duerp-x",
    };
    const recs = genererRecommandations(e, { now: NOW });
    const reco = recs.find((r) => r.kind === "duerp_a_jour");
    expect(reco?.titre).toBe("DUERP à mettre à jour");
    expect(reco?.sousTitre).toBe("Dernière version il y a 13 mois");
  });

  it("DUERP récent → pas de recommandation", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerp: duerpDe(100),
      duerpId: "duerp-x",
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.some((r) => r.kind === "duerp_a_jour")).toBe(false);
  });

  it("prévient un mois avant l'échéance annuelle", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerp: duerpDe(350),
      duerpId: "duerp-x",
    };
    const reco = genererRecommandations(e, { now: NOW }).find(
      (r) => r.kind === "duerp_a_jour",
    );
    expect(reco?.sousTitre).toBe("Mise à jour annuelle à prévoir");
  });

  it("ne parle pas de « mise à jour » quand aucune version n'a été validée", () => {
    // Un DUERP tout juste ouvert n'a pas « plus de douze mois » : il n'a
    // simplement rien de figé. Deux situations, deux libellés.
    const e: EntreeRecos = {
      ...baseEntree(),
      duerp: duerpDe(null),
      duerpId: "duerp-x",
    };
    const reco = genererRecommandations(e, { now: NOW }).find(
      (r) => r.kind === "duerp_a_jour",
    );
    expect(reco?.titre).toBe("Validez la première version de votre DUERP");
  });

  it("ne reproche pas l'ancienneté sous onze salariés (art. R. 4121-2)", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerp: duerpDe(400, 4),
      duerpId: "duerp-x",
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.some((r) => r.kind === "duerp_a_jour")).toBe(false);
  });

  it("action clôturée ignorée", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      actions: [
        {
          id: "a-closed",
          statut: "levee",
          echeance: dateDecalee(-30),
          libelle: "Déjà fait",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW }).length).toBe(0);
  });
});

describe("genererRecommandations — définition du retard (ADR-011)", () => {
  it("remonte une vérification « planifiee » dont la date est passée", () => {
    // Le statut `depassee` n'est écrit qu'à la génération du calendrier et
    // n'est jamais réévalué : « planifiée puis oubliée » est l'état normal
    // d'un contrôle en retard. Il n'entrait dans aucune règle — le bandeau
    // annonçait des échéances à traiter, la file de travail restait vide.
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(-40),
          libelleObligation: "Vérification élec",
          equipementLibelle: "TGBT",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("verif_depassee");
    expect(recs[0].sousTitre).toContain("échéance dépassée");
  });

  it("remonte une vérification « a_planifier » dont la date est passée", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "a_planifier",
          datePrevue: dateDecalee(-3),
          libelleObligation: "Extincteurs",
          equipementLibelle: "Extincteurs",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW })[0].kind).toBe(
      "verif_depassee",
    );
  });

  it("ne compte pas les jours d'une occurrence jamais planifiée", () => {
    // Sa `datePrevue` est la date de génération du calendrier, pas un
    // rendez-vous : la transmettre faisait afficher « dépassée depuis
    // 107 j », où 107 mesurait l'âge du dossier. Le fait vrai est
    // qu'aucune vérification n'est enregistrée.
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "a_planifier",
          datePrevue: dateDecalee(-107),
          libelleObligation: "Extincteurs",
          equipementLibelle: "Extincteurs",
        },
      ],
    };
    const reco = genererRecommandations(e, { now: NOW })[0];

    expect(reco.date).toBeUndefined();
    expect(reco.sousTitre).toContain("aucune vérification enregistrée");
    expect(reco.sousTitre).not.toContain("dépassée");
  });

  it("garde la date d'une échéance réellement manquée", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(-40),
          libelleObligation: "Vérification élec",
          equipementLibelle: "TGBT",
        },
      ],
    };
    const reco = genererRecommandations(e, { now: NOW })[0];

    expect(reco.date).toEqual(dateDecalee(-40));
    expect(reco.sousTitre).toContain("échéance dépassée");
  });

  it("n'étiquette pas « dépassée » une occurrence datée d'aujourd'hui", () => {
    // Deux règles opposées cohabitaient dans le même dossier : la requête
    // du dashboard documentait qu'`a_planifier` n'est pas un retard, le
    // moteur de recos la classait « échéance dépassée » dès le jour même.
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "a_planifier",
          datePrevue: dateDecalee(0),
          libelleObligation: "Extincteurs",
          equipementLibelle: "Extincteurs",
        },
      ],
    };
    expect(
      genererRecommandations(e, { now: NOW }).some(
        (r) => r.kind === "verif_depassee",
      ),
    ).toBe(false);
  });

  it("ignore une occurrence déjà réalisée, même datée d'hier", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(-1),
          dateRealisee: dateDecalee(-1),
          libelleObligation: "Contrôle fait",
          equipementLibelle: "TGBT",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW })).toHaveLength(0);
  });

  it("retient une vérification planifiée aujourd'hui comme « proche »", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(0),
          libelleObligation: "Contrôle alarme",
          equipementLibelle: "SSI",
        },
      ],
    };
    expect(genererRecommandations(e, { now: NOW })[0].kind).toBe("verif_proche");
  });

  it("une action dont l'échéance tombe aujourd'hui est « à venir », pas en retard", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      actions: [
        {
          id: "a1",
          statut: "en_cours",
          echeance: dateDecalee(0),
          libelle: "Remplacer BAES",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs).toHaveLength(1);
    expect(recs[0].kind).toBe("action_proche");
  });
});

describe("genererRecommandations — amorçage (règles 6-8)", () => {
  it("dossier vierge → une seule reco : déclarer les équipements", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      nbEquipements: 0,
      duerpSecteurChoisi: false,
      nbRapports: 0,
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs).toHaveLength(1);
    expect(recs[0].kind).toBe("amorce_equipements");
    expect(recs[0].href).toBe("/etablissements/etab-x/equipements");
  });

  it("équipements déclarés mais secteur DUERP non choisi → amorce DUERP", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      nbEquipements: 2,
      duerpSecteurChoisi: false,
      nbRapports: 1,
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs).toHaveLength(1);
    expect(recs[0].kind).toBe("amorce_duerp");
    expect(recs[0].href).toBe("/etablissements/etab-x/duerp");
  });

  it("vérifications planifiées sans aucun rapport → amorce premier rapport", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      nbRapports: 0,
      verifications: [
        {
          id: "v1",
          statut: "planifiee",
          datePrevue: dateDecalee(60),
          libelleObligation: "Vérif élec",
          equipementLibelle: "TGBT",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs).toHaveLength(1);
    expect(recs[0].kind).toBe("amorce_rapport");
    expect(recs[0].href).toBe("/etablissements/etab-x/calendrier");
  });

  it("une urgence réelle passe toujours devant une amorce", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      duerpSecteurChoisi: false,
      verifications: [
        {
          id: "v1",
          statut: "depassee",
          datePrevue: dateDecalee(-10),
          libelleObligation: "Vérif élec",
          equipementLibelle: "TGBT",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].kind).toBe("verif_depassee");
    expect(recs.some((r) => r.kind === "amorce_duerp")).toBe(true);
  });

  it("dossier mûr → aucune amorce", () => {
    const recs = genererRecommandations(baseEntree(), { now: NOW });
    expect(recs).toHaveLength(0);
  });

  it("pas d'amorce DUERP tant qu'aucun équipement n'est déclaré (une étape à la fois)", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      nbEquipements: 0,
      duerpSecteurChoisi: false,
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs.some((r) => r.kind === "amorce_duerp")).toBe(false);
    expect(recs.some((r) => r.kind === "amorce_equipements")).toBe(true);
  });
});

describe("genererRecommandations — href", () => {
  it("génère les bons chemins d'URL", () => {
    const e: EntreeRecos = {
      ...baseEntree(),
      verifications: [
        {
          id: "v-123",
          statut: "depassee",
          datePrevue: dateDecalee(-5),
          libelleObligation: "Test",
          equipementLibelle: "E",
        },
      ],
    };
    const recs = genererRecommandations(e, { now: NOW });
    expect(recs[0].href).toBe("/etablissements/etab-x/verifications/v-123");
  });
});
