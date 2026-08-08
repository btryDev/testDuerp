import { describe, expect, it } from "vitest";
import {
  construireSections,
  deduireActif,
  type ProfilRegistres,
  type SidebarItemId,
} from "./sidebar-nav";

const ID = "etab_1";

const PROFIL_VIDE: ProfilRegistres = {
  estERP: false,
  aRegistreAccessibilite: false,
  nbPermisFeu: 0,
  nbPlansPrevention: 0,
  aCarnetSanitaire: false,
};

function sections(profil?: ProfilRegistres, actif: SidebarItemId = "tableau") {
  return construireSections({ etablissementId: ID, profil, actif });
}

function idsVisibles(profil?: ProfilRegistres, actif: SidebarItemId = "tableau") {
  return sections(profil, actif).flatMap((s) => s.items.map((i) => i.id));
}

function idsRepliables(profil?: ProfilRegistres, actif: SidebarItemId = "tableau") {
  return sections(profil, actif).flatMap((s) =>
    (s.repliables ?? []).map((i) => i.id),
  );
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
});

describe("construireSections — structure", () => {
  it("expose les trois sections dans l'ordre des questions du dirigeant", () => {
    expect(sections(PROFIL_VIDE).map((s) => s.title)).toEqual([
      "À faire",
      "Mon établissement",
      "Mes registres",
    ]);
  });

  it("place le tableau de bord en tête de « À faire »", () => {
    expect(sections(PROFIL_VIDE)[0].items[0].id).toBe("tableau");
  });

  it("garde DUERP et registre de sécurité toujours visibles", () => {
    const ids = idsVisibles(PROFIL_VIDE);
    expect(ids).toContain("duerp");
    expect(ids).toContain("registre");
  });

  it("n'expose aucun id en double", () => {
    const tous = [...idsVisibles(PROFIL_VIDE), ...idsRepliables(PROFIL_VIDE)];
    expect(new Set(tous).size).toBe(tous.length);
  });

  it("préfixe toutes les destinations réelles par l'établissement", () => {
    for (const sec of sections(PROFIL_VIDE)) {
      for (const it of [...sec.items, ...(sec.repliables ?? [])]) {
        if (it.bientot) continue;
        expect(it.href.startsWith(`/etablissements/${ID}`)).toBe(true);
      }
    }
  });

  it("place le guide (« Comprendre ») en dernière position de « À faire »", () => {
    const aFaire = sections(PROFIL_VIDE)[0];
    const dernier = aFaire.items[aFaire.items.length - 1];
    expect(dernier.id).toBe("guide");
    expect(dernier.label).toBe("Comprendre");
    expect(dernier.href).toBe(`/etablissements/${ID}/guide`);
  });

  it("marque « Équipe » comme à venir plutôt qu'en lien mort", () => {
    const equipe = sections(PROFIL_VIDE)
      .flatMap((s) => s.items)
      .find((i) => i.id === "equipe");
    expect(equipe?.bientot).toBe(true);
  });
});

describe("construireSections — divulgation progressive", () => {
  it("replie les quatre registres de domaine pour un établissement vierge", () => {
    expect(idsRepliables(PROFIL_VIDE).sort()).toEqual([
      "accessibilite",
      "carnet-sanitaire",
      "permis-feu",
      "plan-prevention",
    ]);
  });

  it("met l'accessibilité en avant dès que l'établissement est ERP", () => {
    const profil = { ...PROFIL_VIDE, estERP: true };
    expect(idsVisibles(profil)).toContain("accessibilite");
    expect(idsRepliables(profil)).not.toContain("accessibilite");
  });

  it("met un registre de domaine en avant dès qu'il porte de la matière", () => {
    const profil = {
      ...PROFIL_VIDE,
      nbPermisFeu: 2,
      nbPlansPrevention: 1,
      aCarnetSanitaire: true,
    };
    const visibles = idsVisibles(profil);
    expect(visibles).toContain("permis-feu");
    expect(visibles).toContain("plan-prevention");
    expect(visibles).toContain("carnet-sanitaire");
    expect(idsRepliables(profil)).toEqual(["accessibilite"]);
  });

  it("ne replie rien quand le profil est inconnu", () => {
    expect(idsRepliables(undefined)).toEqual([]);
    expect(idsVisibles(undefined)).toContain("carnet-sanitaire");
  });

  it("remonte l'item actif dans la liste principale même s'il est vide", () => {
    // On navigue vers « Permis de feu » alors qu'aucun permis n'existe :
    // le rail doit continuer à montrer où l'on se trouve.
    expect(idsVisibles(PROFIL_VIDE, "permis-feu")).toContain("permis-feu");
    expect(idsRepliables(PROFIL_VIDE, "permis-feu")).not.toContain("permis-feu");
  });

  it("laisse la section « Mes registres » sans divulgation quand tout est nourri", () => {
    const profil: ProfilRegistres = {
      estERP: true,
      aRegistreAccessibilite: true,
      nbPermisFeu: 1,
      nbPlansPrevention: 1,
      aCarnetSanitaire: true,
    };
    const registres = sections(profil).find((s) => s.title === "Mes registres");
    expect(registres?.repliables).toBeUndefined();
  });
});

describe("construireSections — badges", () => {
  it("passe en alerte les compteurs de dette, pas les volumétries", () => {
    const items = construireSections({
      etablissementId: ID,
      actif: "tableau",
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
      actif: "tableau",
      counts: { verificationsEnRetard: 0, prestatairesAlertes: 0 },
    }).flatMap((s) => s.items);

    expect(items.find((i) => i.id === "calendrier")?.alert).toBe(false);
    expect(items.find((i) => i.id === "prestataires")?.alert).toBe(false);
  });
});
