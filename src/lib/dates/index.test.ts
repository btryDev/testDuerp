import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ajouterAns,
  ajouterJours,
  ajouterMois,
  cleJourCivil,
  composantesCiviles,
  debutDuJour,
  depuisCleJourCivil,
  formaterDateCourteFr,
  formaterDateFr,
  formaterDateHeureFr,
  formaterDateLongueFr,
  formaterJourMoisFr,
  instantCivil,
  joursCivilsEntre,
  MOIS_PERIODE_ANNUELLE,
} from "./index";

// Les dates civiles du produit arrivent en base à **minuit UTC** :
// `new Date("2026-08-10")` vaut 2026-08-10T00:00:00Z, soit 02:00 à Paris.
// C'est ce cas précis, qu'aucun test existant ne couvrait, qui révèle les
// bugs de fuseau — la plupart des fixtures ci-dessous l'utilisent.

afterEach(() => {
  vi.useRealTimers();
});

describe("composantesCiviles — lecture en Europe/Paris", () => {
  it("une date stockée à minuit UTC en été est le bon jour civil, à 02:00", () => {
    const c = composantesCiviles(new Date("2026-08-10T00:00:00Z"));
    expect(c).toMatchObject({ annee: 2026, mois: 8, jour: 10, heure: 2 });
  });

  it("une date stockée à minuit UTC en hiver est le bon jour civil, à 01:00", () => {
    const c = composantesCiviles(new Date("2026-01-10T00:00:00Z"));
    expect(c).toMatchObject({ annee: 2026, mois: 1, jour: 10, heure: 1 });
  });

  it("23:30 heure de Paris en été appartient encore au jour courant", () => {
    // 21:30 UTC — l'ISO dirait déjà « 10 août », mais un cas symétrique
    // (00:30 UTC en hiver) basculerait d'un jour. Cf. cleJourCivil.
    const c = composantesCiviles(new Date("2026-08-10T21:30:00Z"));
    expect(c).toMatchObject({ jour: 10, heure: 23, minute: 30 });
  });

  it("minuit civil est bien l'heure 0 et non 24", () => {
    expect(composantesCiviles(new Date("2026-08-09T22:00:00Z")).heure).toBe(0);
  });
});

describe("debutDuJour", () => {
  it("ramène un instant de la journée à minuit heure de Paris (été : 22:00Z la veille)", () => {
    const d = debutDuJour(new Date("2026-08-10T14:37:12.345Z"));
    expect(d.toISOString()).toBe("2026-08-09T22:00:00.000Z");
  });

  it("ramène un instant d'hiver à minuit heure de Paris (23:00Z la veille)", () => {
    const d = debutDuJour(new Date("2026-01-10T14:37:00Z"));
    expect(d.toISOString()).toBe("2026-01-09T23:00:00.000Z");
  });

  it("est idempotent", () => {
    const une = debutDuJour(new Date("2026-08-10T14:00:00Z"));
    expect(debutDuJour(une).getTime()).toBe(une.getTime());
  });

  it("une date stockée à minuit UTC est postérieure au début de son jour civil", () => {
    // Le cœur du bug historique : 2026-08-10T00:00:00Z (02:00 Paris) est
    // APRÈS minuit Paris du 10 août, donc pas encore passé.
    const stockee = new Date("2026-08-10T00:00:00Z");
    expect(stockee.getTime()).toBeGreaterThan(debutDuJour(stockee).getTime());
  });
});

describe("cleJourCivil / depuisCleJourCivil", () => {
  it("rend le jour civil de Paris, pas celui de l'ISO", () => {
    // 23:30 à Paris en hiver = 22:30Z : même jour des deux côtés.
    expect(cleJourCivil(new Date("2026-01-10T22:30:00Z"))).toBe("2026-01-10");
    // 00:30 à Paris en hiver = 23:30Z la veille : l'ISO dirait « 09 ».
    const nuit = new Date("2026-01-09T23:30:00Z");
    expect(nuit.toISOString().slice(0, 10)).toBe("2026-01-09");
    expect(cleJourCivil(nuit)).toBe("2026-01-10");
  });

  it("une date stockée à minuit UTC garde son jour, été comme hiver", () => {
    expect(cleJourCivil(new Date("2026-08-10T00:00:00Z"))).toBe("2026-08-10");
    expect(cleJourCivil(new Date("2026-01-10T00:00:00Z"))).toBe("2026-01-10");
  });

  it("aller-retour clé → instant → clé", () => {
    for (const cle of ["2026-01-01", "2026-03-29", "2026-08-10", "2026-10-25"]) {
      expect(cleJourCivil(depuisCleJourCivil(cle))).toBe(cle);
    }
  });

  it("depuisCleJourCivil produit minuit de Paris, pas minuit UTC", () => {
    expect(depuisCleJourCivil("2026-08-10").toISOString()).toBe(
      "2026-08-09T22:00:00.000Z",
    );
  });

  it("refuse une clé malformée", () => {
    expect(() => depuisCleJourCivil("10/08/2026")).toThrow();
  });
});

describe("joursCivilsEntre", () => {
  it("compte les minuits franchis, pas les tranches de 24 h", () => {
    const soir = new Date("2026-08-10T21:00:00Z"); // 23:00 Paris, le 10
    const petitMatin = new Date("2026-08-10T23:00:00Z"); // 01:00 Paris, le 11
    expect(joursCivilsEntre(soir, petitMatin)).toBe(1);
  });

  it("est nul dans la même journée civile", () => {
    expect(
      joursCivilsEntre(
        new Date("2026-08-10T06:00:00Z"),
        new Date("2026-08-10T20:00:00Z"),
      ),
    ).toBe(0);
  });

  it("est négatif vers le passé", () => {
    expect(
      joursCivilsEntre(new Date("2026-08-10"), new Date("2026-08-07")),
    ).toBe(-3);
  });

  it("traverse le changement d'heure d'été sans perdre de jour", () => {
    // 2026 : bascule dans la nuit du samedi 28 au dimanche 29 mars.
    expect(
      joursCivilsEntre(new Date("2026-03-28"), new Date("2026-03-30")),
    ).toBe(2);
  });

  it("traverse le changement d'heure d'hiver sans gagner de jour", () => {
    // 2026 : retour à l'heure d'hiver dans la nuit du 24 au 25 octobre.
    expect(
      joursCivilsEntre(new Date("2026-10-24"), new Date("2026-10-26")),
    ).toBe(2);
  });

  it("compte 366 jours sur une année bissextile", () => {
    expect(
      joursCivilsEntre(new Date("2028-01-01"), new Date("2029-01-01")),
    ).toBe(366);
  });
});

describe("ajouterJours", () => {
  it("avance d'un jour civil", () => {
    expect(cleJourCivil(ajouterJours(new Date("2026-08-10"), 1))).toBe(
      "2026-08-11",
    );
  });

  it("franchit le passage à l'heure d'été sans décalage de jour", () => {
    // 28 mars + 1 j = 29 mars, la journée où il ne manque qu'une heure.
    // Un `+ 86 400 000` naïf sur une date stockée à minuit UTC donnerait
    // le bon jour ici, mais l'heure civile dériverait de +1 h.
    const j = ajouterJours(new Date("2026-03-28T00:00:00Z"), 1);
    expect(cleJourCivil(j)).toBe("2026-03-29");
    expect(composantesCiviles(j).heure).toBe(1); // heure de Paris conservée
  });

  it("franchit le retour à l'heure d'hiver sans décalage de jour", () => {
    const j = ajouterJours(new Date("2026-10-24T00:00:00Z"), 1);
    expect(cleJourCivil(j)).toBe("2026-10-25");
    expect(composantesCiviles(j).heure).toBe(2);
  });

  it("recule avec un nombre négatif", () => {
    expect(cleJourCivil(ajouterJours(new Date("2026-03-01"), -1))).toBe(
      "2026-02-28",
    );
  });

  it("30 jours d'affilée équivalent à un saut de 30", () => {
    const depart = new Date("2026-03-15T00:00:00Z");
    let pas = depart;
    for (let i = 0; i < 30; i += 1) pas = ajouterJours(pas, 1);
    expect(cleJourCivil(pas)).toBe(cleJourCivil(ajouterJours(depart, 30)));
  });
});

describe("ajouterMois — écrêtage en fin de mois", () => {
  it("31 janvier + 1 mois = 28 février (année commune)", () => {
    expect(cleJourCivil(ajouterMois(new Date("2026-01-31"), 1))).toBe(
      "2026-02-28",
    );
  });

  it("31 janvier + 1 mois = 29 février (année bissextile)", () => {
    expect(cleJourCivil(ajouterMois(new Date("2028-01-31"), 1))).toBe(
      "2028-02-29",
    );
  });

  it("31 mai + 1 mois = 30 juin, jamais le 1er juillet", () => {
    expect(cleJourCivil(ajouterMois(new Date("2026-05-31"), 1))).toBe(
      "2026-06-30",
    );
  });

  it("n'écrête pas quand le mois cible est assez long", () => {
    expect(cleJourCivil(ajouterMois(new Date("2026-01-15"), 6))).toBe(
      "2026-07-15",
    );
  });

  it("change d'année en avançant", () => {
    expect(cleJourCivil(ajouterMois(new Date("2026-11-30"), 3))).toBe(
      "2027-02-28",
    );
  });

  it("change d'année en reculant", () => {
    expect(cleJourCivil(ajouterMois(new Date("2026-02-15"), -3))).toBe(
      "2025-11-15",
    );
  });

  it("conserve l'heure civile en traversant un changement d'heure", () => {
    // Janvier (UTC+1) → août (UTC+2) : minuit UTC devient 01:00 Paris,
    // et doit le rester après le saut de mois.
    const j = ajouterMois(new Date("2026-01-10T00:00:00Z"), 7);
    expect(cleJourCivil(j)).toBe("2026-08-10");
    expect(composantesCiviles(j).heure).toBe(1);
  });
});

describe("ajouterAns", () => {
  it("29 février + 1 an = 28 février", () => {
    expect(cleJourCivil(ajouterAns(new Date("2028-02-29"), 1))).toBe(
      "2029-02-28",
    );
  });

  it("29 février + 4 ans retombe sur un 29 février", () => {
    expect(cleJourCivil(ajouterAns(new Date("2028-02-29"), 4))).toBe(
      "2032-02-29",
    );
  });

  it("un an de périodicité ne dérive pas, contrairement à 365 jours", () => {
    // Le littéral `365 * 86 400 000` que ce module remplace : dès que
    // l'intervalle contient un 29 février, il retombe un jour trop tôt.
    // Une vérification annuelle « repoussée » ainsi avancerait d'un jour
    // à chaque bissextile traversée.
    const depart = new Date("2028-01-01T00:00:00Z"); // 2028 est bissextile
    expect(cleJourCivil(ajouterAns(depart, 1))).toBe("2029-01-01");
    const par365 = new Date(depart.getTime() + 365 * 86_400_000);
    expect(cleJourCivil(par365)).toBe("2028-12-31");
  });

  it("ajouterAns(d, 1) équivaut à ajouterMois(d, MOIS_PERIODE_ANNUELLE)", () => {
    const d = new Date("2026-08-10");
    expect(ajouterAns(d, 1).getTime()).toBe(
      ajouterMois(d, MOIS_PERIODE_ANNUELLE).getTime(),
    );
  });
});

describe("instantCivil", () => {
  it("construit minuit de Paris en été", () => {
    expect(instantCivil(2026, 8, 10).toISOString()).toBe(
      "2026-08-09T22:00:00.000Z",
    );
  });

  it("construit minuit de Paris en hiver", () => {
    expect(instantCivil(2026, 1, 10).toISOString()).toBe(
      "2026-01-09T23:00:00.000Z",
    );
  });

  it("construit minuit le jour du passage à l'heure d'été", () => {
    // Le 29 mars 2026, la journée démarre bien à 00:00 (UTC+1) : c'est
    // 02:00 qui saute à 03:00, pas minuit.
    expect(instantCivil(2026, 3, 29).toISOString()).toBe(
      "2026-03-28T23:00:00.000Z",
    );
  });

  it("construit minuit le jour du retour à l'heure d'hiver", () => {
    expect(instantCivil(2026, 10, 25).toISOString()).toBe(
      "2026-10-24T22:00:00.000Z",
    );
  });
});

describe("formatage — fuseau épinglé", () => {
  it("formaterDateFr rend jj/mm/aaaa dans le fuseau de Paris", () => {
    expect(formaterDateFr(new Date("2026-08-10T00:00:00Z"))).toBe("10/08/2026");
    // 23:30 Paris le 10 août = 21:30Z ; le format ne doit pas basculer.
    expect(formaterDateFr(new Date("2026-08-10T21:30:00Z"))).toBe("10/08/2026");
  });

  it("formaterDateFr ne recule pas d'un jour la nuit (bug du fuseau serveur)", () => {
    // 00:30 à Paris le 10 janvier = 23:30Z le 9 : un formatage en UTC
    // afficherait « 09/01/2026 ».
    expect(formaterDateFr(new Date("2026-01-09T23:30:00Z"))).toBe("10/01/2026");
  });

  it("formaterDateLongueFr rend le mois en toutes lettres", () => {
    expect(formaterDateLongueFr(new Date("2026-08-10T00:00:00Z"))).toBe(
      "10 août 2026",
    );
  });

  it("formaterDateCourteFr abrège le mois", () => {
    expect(formaterDateCourteFr(new Date("2026-09-24T00:00:00Z"))).toMatch(
      /^24 sept\.? 2026$/,
    );
  });

  it("formaterJourMoisFr rend le jour et le mois, sans année", () => {
    expect(formaterJourMoisFr(new Date("2026-09-24T00:00:00Z"))).toMatch(
      /^24 sept\.?$/,
    );
  });

  it("formaterJourMoisFr ne recule pas d'un jour la nuit", () => {
    // 00:30 à Paris le 1er janvier = 23:30Z le 31 décembre : un formatage
    // en UTC afficherait « 31 déc. », soit le mois **et** l'année d'avant.
    expect(formaterJourMoisFr(new Date("2025-12-31T23:30:00Z"))).toMatch(
      /^01 janv\.?$/,
    );
  });

  it("formaterDateHeureFr rend l'heure de Paris, pas l'heure UTC", () => {
    expect(formaterDateHeureFr(new Date("2026-08-10T12:05:00Z"))).toBe(
      "10/08/2026 14:05",
    );
    expect(formaterDateHeureFr(new Date("2026-01-10T12:05:00Z"))).toBe(
      "10/01/2026 13:05",
    );
  });

  it("formaterDateHeureFr affiche minuit en 00:00", () => {
    expect(formaterDateHeureFr(new Date("2026-08-09T22:00:00Z"))).toBe(
      "10/08/2026 00:00",
    );
  });
});

describe("indépendance vis-à-vis de l'horloge et du fuseau du serveur", () => {
  it("aucune primitive ne lit l'horloge : le résultat ne dépend pas de vi.setSystemTime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T00:00:00Z"));
    const a = debutDuJour(new Date("2026-03-15T10:00:00Z"));
    vi.setSystemTime(new Date("2027-12-31T23:59:59Z"));
    const b = debutDuJour(new Date("2026-03-15T10:00:00Z"));
    expect(a.getTime()).toBe(b.getTime());
  });
});
