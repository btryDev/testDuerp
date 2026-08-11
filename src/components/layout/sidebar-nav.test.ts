import { describe, expect, it } from "vitest";
import {
  categorieDeItem,
  construireRail,
  construireSections,
  deduireActif,
  type SidebarItemId,
} from "./sidebar-nav";

const ID = "etab_1";

function sections() {
  return construireSections({ etablissementId: ID });
}

function idsVisibles() {
  return sections().flatMap((s) => s.items.map((i) => i.id));
}

describe("deduireActif", () => {
  it("distingue la fiche établissement du tableau de bord", () => {
    expect(deduireActif(`/etablissements/${ID}`, ID)).toBe("tableau");
    expect(deduireActif(`/etablissements/${ID}/modifier`, ID)).toBe("fiche");
  });

  it("rattache les vérifications au calendrier", () => {
    expect(deduireActif(`/etablissements/${ID}/verifications/v1`, ID)).toBe(
      "calendrier",
    );
  });

  it("retombe sur le tableau de bord pour un chemin inconnu", () => {
    expect(deduireActif(`/etablissements/${ID}/inconnu`, ID)).toBe("tableau");
  });

  it("ne confond pas deux établissements", () => {
    expect(deduireActif(`/etablissements/autre/actions`, ID)).toBe("tableau");
  });

  it("reconnaît la page « Connecter »", () => {
    expect(deduireActif(`/etablissements/${ID}/connecter`, ID)).toBe(
      "connecter",
    );
  });
});

describe("construireSections — structure", () => {
  it("expose les trois sections dans l'ordre des questions du dirigeant", () => {
    expect(sections().map((s) => s.title)).toEqual([
      "À faire",
      "Mon établissement",
      "Mes registres",
    ]);
  });

  it("place le tableau de bord en tête de « À faire »", () => {
    expect(sections()[0].items[0].id).toBe("tableau");
  });

  it("expose les six registres à plat, DUERP et registre de sécurité en tête", () => {
    const registres = sections().find((s) => s.title === "Mes registres");
    expect(registres?.items.map((i) => i.id)).toEqual([
      "duerp",
      "registre",
      "accessibilite",
      "permis-feu",
      "plan-prevention",
      "carnet-sanitaire",
    ]);
  });

  it("n'expose aucun id en double", () => {
    const tous = idsVisibles();
    expect(new Set(tous).size).toBe(tous.length);
  });

  it("préfixe toutes les destinations réelles par l'établissement", () => {
    for (const sec of sections()) {
      for (const it of sec.items) {
        if (it.bientot) continue;
        expect(it.href.startsWith(`/etablissements/${ID}`)).toBe(true);
      }
    }
  });

  it("place le guide (« Comprendre ») en dernière position de « À faire »", () => {
    const aFaire = sections()[0];
    const dernier = aFaire.items[aFaire.items.length - 1];
    expect(dernier.id).toBe("guide");
    expect(dernier.label).toBe("Comprendre");
    expect(dernier.href).toBe(`/etablissements/${ID}/guide`);
  });

  it("marque « Équipe » comme à venir plutôt qu'en lien mort", () => {
    const equipe = sections()
      .flatMap((s) => s.items)
      .find((i) => i.id === "equipe");
    expect(equipe?.bientot).toBe(true);
  });
});

describe("construireRail — rail à deux niveaux", () => {
  function rail() {
    return construireRail({ etablissementId: ID });
  }

  it("expose les catégories dans l'ordre du rail", () => {
    expect(rail().map((c) => c.id)).toEqual([
      "a-faire",
      "etablissement",
      "registres",
      "comprendre",
      "connecter",
    ]);
  });

  it("fait de « Connecter » un lien direct, hors des trois panneaux", () => {
    const connecter = rail().find((c) => c.id === "connecter");
    expect(connecter?.items).toBeUndefined();
    expect(connecter?.href).toBe(`/etablissements/${ID}/connecter`);
    // Ce n'est ni une tâche ni un registre : il n'a pas à apparaître dans
    // les sections, sous peine de se retrouver dans deux endroits du rail.
    expect(idsVisibles()).not.toContain("connecter");
  });

  it("sort « Comprendre » du panneau « À faire » pour en faire un lien direct", () => {
    const cats = rail();
    const aFaire = cats.find((c) => c.id === "a-faire");
    expect(aFaire?.items?.map((i) => i.id)).not.toContain("guide");
    const comprendre = cats.find((c) => c.id === "comprendre");
    expect(comprendre?.items).toBeUndefined();
    expect(comprendre?.href).toBe(`/etablissements/${ID}/guide`);
  });

  it("reprend les mêmes items que les sections, guide excepté", () => {
    const idsSections = construireSections({ etablissementId: ID }).flatMap(
      (s) => s.items.map((i) => i.id),
    );
    const idsRail = rail().flatMap((c) => (c.items ?? []).map((i) => i.id));
    expect([...idsRail, "guide"].sort()).toEqual(idsSections.sort());
  });

  it("agrège les alertes des items au niveau de la catégorie", () => {
    const cats = construireRail({
      etablissementId: ID,
      counts: { verificationsEnRetard: 2, prestatairesAlertes: 0 },
    });
    expect(cats.find((c) => c.id === "a-faire")?.alert).toBe(true);
    expect(cats.find((c) => c.id === "etablissement")?.alert).toBe(false);
  });

  it("rattache chaque item à la catégorie qui le contient", () => {
    for (const cat of rail()) {
      for (const it of cat.items ?? []) {
        expect(categorieDeItem(it.id)).toBe(cat.id);
      }
    }
    expect(categorieDeItem("guide")).toBe("comprendre");
    expect(categorieDeItem("connecter")).toBe("connecter");
  });
});

describe("construireSections — badges", () => {
  it("passe en alerte les compteurs de dette, pas les volumétries", () => {
    const items = construireSections({
      etablissementId: ID,
      counts: {
        equipements: 13,
        verificationsEnRetard: 3,
        prestatairesAlertes: 1,
        risquesAReevaluer: 2,
        actions: 5,
      },
    }).flatMap((s) => s.items);

    const parId = (id: SidebarItemId) => items.find((i) => i.id === id);

    expect(parId("equipements")?.count).toBe(13);
    expect(parId("equipements")?.alert).toBeFalsy();
    expect(parId("actions")?.count).toBe(5);
    expect(parId("actions")?.alert).toBeFalsy();
    expect(parId("calendrier")).toMatchObject({ count: 3, alert: true });
    expect(parId("prestataires")).toMatchObject({ count: 1, alert: true });
    expect(parId("duerp")).toMatchObject({ count: 2, alert: true });
  });

  it("n'affiche pas d'alerte quand les compteurs sont à zéro", () => {
    const items = construireSections({
      etablissementId: ID,
      counts: { verificationsEnRetard: 0, prestatairesAlertes: 0 },
    }).flatMap((s) => s.items);

    expect(items.find((i) => i.id === "calendrier")?.alert).toBe(false);
    expect(items.find((i) => i.id === "prestataires")?.alert).toBe(false);
  });
});
