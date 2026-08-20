import { describe, expect, it } from "vitest";
import {
  avecProvenance,
  lireProvenance,
  nommerEcran,
  origineDepuis,
  retourDistinct,
} from "./provenance";

const ETAB = "etab-1";
const BASE = `/etablissements/${ETAB}`;

describe("nommerEcran", () => {
  it("nomme une liste comme la sidebar la nomme", () => {
    expect(nommerEcran(`${BASE}/calendrier`, ETAB)).toBe("Calendrier");
    expect(nommerEcran(`${BASE}/actions`, ETAB)).toBe("Plan d'actions");
    expect(nommerEcran(BASE, ETAB)).toBe("Tableau de bord");
  });

  it("nomme une fiche par son objet, pas par l'entrée de rail", () => {
    // `/verifications/{id}` surligne « Calendrier » dans le rail : c'est
    // juste pour le rail, ça ne l'est pas pour un lien de retour.
    expect(nommerEcran(`${BASE}/verifications/v1`, ETAB)).toBe("Vérification");
    expect(nommerEcran(`${BASE}/actions/a1`, ETAB)).toBe("Action");
    expect(nommerEcran(`${BASE}/equipements/e1/modifier`, ETAB)).toBe(
      "Équipement",
    );
  });

  it("refuse une route que l'application ne sert pas", () => {
    // Sans ce refus, `deduireActif` retomberait sur « tableau » et le fil
    // annoncerait « ← Tableau de bord » au-dessus d'un lien vers un 404.
    expect(nommerEcran(`${BASE}/inexistant`, ETAB)).toBeNull();
    expect(nommerEcran(`${BASE}/..%2f..%2flogin`, ETAB)).toBeNull();
    // La racine, elle, est bien le tableau de bord.
    expect(nommerEcran(BASE, ETAB)).toBe("Tableau de bord");
  });

  it("refuse un chemin hors de l'établissement", () => {
    expect(nommerEcran("/etablissements/autre/calendrier", ETAB)).toBeNull();
    expect(nommerEcran("/login", ETAB)).toBeNull();
    // Le préfixe seul ne suffit pas : la frontière est un segment entier.
    expect(nommerEcran(`${BASE}-bis/calendrier`, ETAB)).toBeNull();
  });
});

describe("lireProvenance", () => {
  it("rend le fil de retour, état de l'écran compris", () => {
    const p = lireProvenance(`${BASE}/calendrier?vue=equipement&urgent=1`, ETAB);
    expect(p).toEqual({
      href: `${BASE}/calendrier?vue=equipement&urgent=1`,
      label: "Calendrier",
    });
  });

  it("ignore l'absence de provenance", () => {
    expect(lireProvenance(undefined, ETAB)).toBeNull();
    expect(lireProvenance("", ETAB)).toBeNull();
  });

  it("refuse tout ce qui sort du site", () => {
    expect(lireProvenance("https://exemple.test/x", ETAB)).toBeNull();
    expect(lireProvenance("//exemple.test/x", ETAB)).toBeNull();
    expect(lireProvenance("\\\\exemple.test/x", ETAB)).toBeNull();
    expect(lireProvenance("javascript:alert(1)", ETAB)).toBeNull();
    expect(lireProvenance(`${BASE}/calendrier`.repeat(50), ETAB)).toBeNull();
  });

  it("refuse le dossier d'un autre établissement", () => {
    expect(lireProvenance("/etablissements/autre/calendrier", ETAB)).toBeNull();
  });

  it("ne retient que la première valeur si le param est répété", () => {
    const p = lireProvenance([`${BASE}/actions`, "/login"], ETAB);
    expect(p?.href).toBe(`${BASE}/actions`);
  });
});

describe("retourDistinct", () => {
  const provenance = { href: `${BASE}/calendrier?vue=equipement`, label: "Calendrier" };

  it("garde une provenance qui mène ailleurs que le parent", () => {
    expect(retourDistinct(provenance, `${BASE}/actions`)).toBe(provenance);
  });

  it("efface une provenance qui répète le parent, filtres compris", () => {
    const depuisLaListe = { href: `${BASE}/actions?origine=duerp`, label: "Plan d'actions" };
    expect(retourDistinct(depuisLaListe, `${BASE}/actions`)).toBeNull();
  });

  it("rend null sans provenance", () => {
    expect(retourDistinct(null, `${BASE}/actions`)).toBeNull();
  });
});

describe("origineDepuis", () => {
  it("emporte l'état de l'écran courant", () => {
    expect(
      origineDepuis(`${BASE}/actions`, { origine: "duerp", enCours: "0" }),
    ).toBe(`${BASE}/actions?origine=duerp&enCours=0`);
  });

  it("laisse un chemin nu quand il n'y a rien à emporter", () => {
    expect(origineDepuis(`${BASE}/calendrier`, {})).toBe(`${BASE}/calendrier`);
  });

  it("retire la provenance entrante — la chaîne reste bornée à un saut", () => {
    expect(
      origineDepuis(`${BASE}/verifications/v1`, {
        de: `${BASE}/calendrier`,
      }),
    ).toBe(`${BASE}/verifications/v1`);
  });

  it("accepte des URLSearchParams", () => {
    const p = new URLSearchParams({ vue: "equipement", de: "/x" });
    expect(origineDepuis(`${BASE}/calendrier`, p)).toBe(
      `${BASE}/calendrier?vue=equipement`,
    );
  });
});

describe("avecProvenance", () => {
  it("ajoute le paramètre, encodé", () => {
    expect(avecProvenance(`${BASE}/actions/a1`, `${BASE}/calendrier?vue=x`)).toBe(
      `${BASE}/actions/a1?de=%2Fetablissements%2Fetab-1%2Fcalendrier%3Fvue%3Dx`,
    );
  });

  it("se greffe sur une query existante", () => {
    expect(avecProvenance(`${BASE}/actions?enCours=0`, `${BASE}`)).toBe(
      `${BASE}/actions?enCours=0&de=%2Fetablissements%2Fetab-1`,
    );
  });

  it("n'annote pas un lien qui reste sur l'écran courant", () => {
    const origine = `${BASE}/calendrier?famille=travaux`;
    expect(avecProvenance(`${BASE}/calendrier?famille=papiers`, origine)).toBe(
      `${BASE}/calendrier?famille=papiers`,
    );
  });

  it("se glisse avant le fragment, jamais dedans", () => {
    expect(avecProvenance(`${BASE}/actions/a1#cloture`, `${BASE}/calendrier`)).toBe(
      `${BASE}/actions/a1?de=%2Fetablissements%2Fetab-1%2Fcalendrier#cloture`,
    );
  });

  it("rend le lien inchangé sans origine", () => {
    expect(avecProvenance(`${BASE}/actions/a1`, null)).toBe(`${BASE}/actions/a1`);
  });

  it("fait l'aller-retour : ce qui est posé est relu à l'identique", () => {
    const origine = origineDepuis(`${BASE}/calendrier`, { vue: "equipement" });
    const href = avecProvenance(`${BASE}/actions/a1`, origine);
    const param = new URL(href, "https://x.invalid").searchParams.get("de");
    expect(lireProvenance(param ?? undefined, ETAB)).toEqual({
      href: `${BASE}/calendrier?vue=equipement`,
      label: "Calendrier",
    });
  });
});
