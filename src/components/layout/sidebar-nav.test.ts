import { describe, expect, it } from "vitest";
import {
  categorieDeItem,
  construireRail,
  construireSections,
  deduireActif,
  type SidebarItemId,
  type SidebarModules,
} from "./sidebar-nav";

const ID = "etab_1";

/** Établissement le plus courant de nos trois secteurs : un ERP qui n'a
 *  encore ouvert aucun registre événementiel. */
const MODULES_ERP_NEUF: SidebarModules = {
  estERP: true,
  nbPermisFeu: 0,
  nbPlansPrevention: 0,
  carnetSanitaireExiste: false,
};

/** Items d'une section, dans l'ordre de rendu. */
function itemsDe(titre: string, modules?: SidebarModules) {
  const section = construireSections({ etablissementId: ID, modules }).find(
    (s) => s.title === titre,
  );
  return section?.items ?? [];
}

/** Registres de la section « Mes registres », dans l'ordre de rendu. */
function registres(modules?: SidebarModules) {
  return itemsDe("Mes registres", modules);
}

function operations(modules?: SidebarModules) {
  return itemsDe("Opérations", modules);
}

function etatDe(id: SidebarItemId, modules?: SidebarModules) {
  return [...registres(modules), ...operations(modules)].find(
    (i) => i.id === id,
  )?.etat;
}

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

  it("range les bâtiments sous « Mon établissement » (ADR-019)", () => {
    expect(deduireActif(`/etablissements/${ID}/batiments`, ID)).toBe("batiments");
    expect(categorieDeItem("batiments")).toBe("etablissement");
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
  it("expose les sections dans l'ordre des questions du dirigeant", () => {
    expect(sections().map((s) => s.title)).toEqual([
      "À faire",
      "Opérations",
      "Mon établissement",
      "Mes registres",
    ]);
  });

  it("sort les opérations ponctuelles de « Mes registres »", () => {
    // Un registre se tient en continu ; un permis de feu naît d'un chantier
    // daté et meurt clos (ADR-017).
    expect(operations().map((i) => i.id)).toEqual([
      "permis-feu",
      "plan-prevention",
    ]);
    expect(registres().map((i) => i.id)).not.toContain("permis-feu");
    expect(registres().map((i) => i.id)).not.toContain("plan-prevention");
  });

  it("ne porte dans « À faire » que des activités, jamais un filtre", () => {
    const aFaire = sections()[0];
    expect(aFaire.items.map((i) => i.id)).toEqual([
      "calendrier",
      "actions",
      "controle",
    ]);
    // Aucune destination du panneau ne porte de query : un filtre est un
    // réglage d'écran, pas une place dans l'arborescence (ADR-015 révisé).
    for (const it of aFaire.items) {
      expect(it.href).not.toContain("?");
    }
  });

  it("garde hors des sections ce qui vit ailleurs", () => {
    // Un résumé n'est pas une tâche — on y revient par la marque (ADR-015,
    // seconde révision) ; le guide a son entrée de premier niveau : les
    // laisser ici les afficherait deux fois.
    expect(idsVisibles()).not.toContain("tableau");
    expect(idsVisibles()).not.toContain("guide");
  });

  it("expose les registres à plat, DUERP et registre de sécurité en tête", () => {
    expect(registres().map((i) => i.id)).toEqual([
      "duerp",
      "registre",
      "accessibilite",
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

  it("« Équipe » mène à son écran et n'est plus annoncée à venir", () => {
    // L'entrée est restée inerte le temps que le porteur salarié existe
    // (ADR-023). Il existe : elle doit mener quelque part, et surtout ne plus
    // porter `bientot` — une entrée « à venir » qui navigue ment deux fois.
    const equipe = sections()
      .flatMap((s) => s.items)
      .find((i) => i.id === "equipe");
    expect(equipe?.href).toBe(`/etablissements/${ID}/equipe`);
    expect(equipe?.bientot).toBeFalsy();
  });

  it("surligne « Équipe » sur la fiche d'une personne", () => {
    // La fiche vit sous `/equipe/<id>` : sans branche dans `deduireActif`,
    // elle retomberait sur « Tableau de bord » et le rail désignerait un
    // écran que l'utilisateur n'a pas ouvert.
    expect(deduireActif(`/etablissements/${ID}/equipe`, ID)).toBe("equipe");
    expect(deduireActif(`/etablissements/${ID}/equipe/abc`, ID)).toBe("equipe");
  });

  it("ne donne pas deux fois la même icône à deux entrées", () => {
    // « La même icône ne peut pas nommer un objet ici et une action là »
    // (docs/charte-board.md). `Users` désignait Prestataires ET Équipe.
    const items = sections().flatMap((s) => s.items);
    const parIcone = new Map<unknown, string[]>();
    for (const it of items) {
      parIcone.set(it.Icon, [...(parIcone.get(it.Icon) ?? []), it.id]);
    }
    const collisions = [...parIcone.values()].filter((ids) => ids.length > 1);
    expect(collisions).toEqual([]);
  });
});

describe("construireRail — rail à deux niveaux", () => {
  function rail() {
    return construireRail({ etablissementId: ID });
  }

  it("expose les catégories dans l'ordre du rail", () => {
    // Les deux catégories d'activité d'abord, les descriptives ensuite.
    expect(rail().map((c) => c.id)).toEqual([
      "a-faire",
      "operations",
      "etablissement",
      "registres",
      "parametres",
    ]);
  });

  it("donne une page d'entrée à chaque catégorie, panneau ou non", () => {
    // ADR-015 : cliquer une entrée de rail navigue. Une icône de premier
    // niveau qui ne mène nulle part n'est qu'un tiroir.
    for (const cat of rail()) {
      expect(cat.href.startsWith(`/etablissements/${ID}`)).toBe(true);
    }
  });

  it("fait entrer chaque panneau par son premier item", () => {
    // Sans quoi le rail déposerait sur un écran que le panneau ne montre
    // pas, et aucun item ne serait surligné à l'arrivée.
    for (const cat of rail()) {
      if (!cat.items) continue;
      expect(cat.href).toBe(cat.items[0].href);
    }
  });

  it("ne donne pas d'entrée de rail au tableau de bord", () => {
    // On y revient par la marque en tête de rail, comme un logo ramène à
    // l'accueil. Une entrée de plus l'aurait mis au rang des quatre
    // questions du dirigeant, alors qu'il y répond toutes.
    expect(rail().some((c) => c.id === "tableau")).toBe(false);
    expect(idsVisibles()).not.toContain("tableau");
  });

  it("fait de « Paramètres » un lien direct, hors des trois panneaux", () => {
    const parametres = rail().find((c) => c.id === "parametres");
    expect(parametres?.items).toBeUndefined();
    expect(parametres?.href).toBe(`/etablissements/${ID}/connecter`);
    // Ce n'est ni une tâche ni un registre : il n'a pas à apparaître dans
    // les sections, sous peine de se retrouver dans deux endroits du rail.
    expect(idsVisibles()).not.toContain("connecter");
    // La césure entre le dossier et son réglage est portée par la donnée,
    // pas devinée au rendu.
    expect(parametres?.separateurAvant).toBe(true);
  });

  it("ne met plus « Comprendre » dans le rail", () => {
    // Le guide reste en ligne, mais ce n'est pas une des questions du
    // dirigeant : c'est une lecture, pas un endroit où l'on travaille. Une
    // entrée de rail permanente lui donnait le rang d'un registre tenu.
    const cats = rail();
    expect(cats.some((c) => c.id === "parametres")).toBe(true);
    expect(cats.map((c) => c.href)).not.toContain(
      `/etablissements/${ID}/guide`,
    );
    // Et il ne se réfugie pas non plus dans un panneau.
    expect(idsVisibles()).not.toContain("guide");
  });

  it("reprend exactement les items des sections", () => {
    const idsSections = construireSections({ etablissementId: ID }).flatMap(
      (s) => s.items.map((i) => i.id),
    );
    const idsRail = rail().flatMap((c) => (c.items ?? []).map((i) => i.id));
    expect(idsRail.sort()).toEqual(idsSections.sort());
  });

  it("agrège les alertes des items au niveau de la catégorie", () => {
    const cats = construireRail({
      etablissementId: ID,
      counts: { enRetardTotal: 2, prestatairesAlertes: 0 },
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
    expect(categorieDeItem("tableau")).toBe("tableau");
    expect(categorieDeItem("connecter")).toBe("parametres");
    // Le guide n'a plus d'entrée de rail : sa page reste atteignable, et
    // aucune tuile ne s'allume dessus. Le rattacher au voisin le plus proche
    // allumait « Paramètres » sur un écran qui n'en fait pas partie, avec
    // une tuile qui mène ailleurs — l'ADR-015 veut qu'une entrée de rail
    // désigne une page, pas une approximation.
    expect(categorieDeItem("guide")).toBeNull();
  });
});

describe("construireSections — badges", () => {
  it("passe en alerte les compteurs de dette, pas les volumétries", () => {
    const items = construireSections({
      etablissementId: ID,
      counts: {
        equipements: 13,
        enRetardTotal: 5,
        prestatairesAlertes: 1,
        actions: 5,
      },
    }).flatMap((s) => s.items);

    const parId = (id: SidebarItemId) => items.find((i) => i.id === id);

    expect(parId("equipements")?.count).toBe(13);
    expect(parId("equipements")?.alert).toBeFalsy();
    expect(parId("actions")?.count).toBe(5);
    expect(parId("actions")?.alert).toBeFalsy();
    expect(parId("prestataires")).toMatchObject({ count: 1, alert: true });
  });

  it("donne au calendrier le retard de toutes les familles", () => {
    const items = construireSections({
      etablissementId: ID,
      counts: { enRetardTotal: 5 },
    }).flatMap((s) => s.items);

    expect(items.find((i) => i.id === "calendrier")).toMatchObject({
      count: 5,
      alert: true,
    });
  });

  it("n'affiche pas d'alerte quand les compteurs sont à zéro", () => {
    const items = construireSections({
      etablissementId: ID,
      counts: { enRetardTotal: 0, prestatairesAlertes: 0 },
    }).flatMap((s) => s.items);

    expect(items.find((i) => i.id === "calendrier")?.alert).toBe(false);
    expect(items.find((i) => i.id === "prestataires")?.alert).toBe(false);
  });
});

describe("construireSections — qualification des registres", () => {
  it("ne qualifie rien quand l'état des modules n'est pas fourni", () => {
    // Un appelant qui ne sait pas vaut mieux qu'une entrée qualifiée à tort :
    // on retombe exactement sur le comportement d'avant.
    expect(registres().every((i) => i.etat === undefined)).toBe(true);
  });

  it("laisse DUERP et registre de sécurité hors qualification", () => {
    // Tout employeur tient un DUERP ; le registre de sécurité reçoit les
    // rapports de n'importe quelle vérification. Rien à conditionner.
    expect(etatDe("duerp", MODULES_ERP_NEUF)).toBeUndefined();
    expect(etatDe("registre", MODULES_ERP_NEUF)).toBeUndefined();
  });

  it("rend l'accessibilité applicable dès que l'établissement est ERP", () => {
    // Même sans registre créé : c'est précisément ce qu'il reste à faire.
    expect(etatDe("accessibilite", MODULES_ERP_NEUF)).toBe("actif");
  });

  it("marque l'accessibilité non applicable hors ERP", () => {
    expect(
      etatDe("accessibilite", { ...MODULES_ERP_NEUF, estERP: false }),
    ).toBe("non-applicable");
  });

  it("laisse l'événementiel « non ouvert » tant qu'il est vide", () => {
    expect(etatDe("permis-feu", MODULES_ERP_NEUF)).toBe("non-ouvert");
    expect(etatDe("plan-prevention", MODULES_ERP_NEUF)).toBe("non-ouvert");
    expect(etatDe("carnet-sanitaire", MODULES_ERP_NEUF)).toBe("non-ouvert");
  });

  it("active un registre événementiel dès la première pièce", () => {
    const modules: SidebarModules = {
      estERP: true,
      nbPermisFeu: 1,
      nbPlansPrevention: 2,
      carnetSanitaireExiste: true,
    };
    expect(etatDe("permis-feu", modules)).toBe("actif");
    expect(etatDe("plan-prevention", modules)).toBe("actif");
    expect(etatDe("carnet-sanitaire", modules)).toBe("actif");
  });

  it("remonte ce qui concerne l'établissement et relègue le non applicable", () => {
    const ordre = registres({ ...MODULES_ERP_NEUF, estERP: false }).map(
      (i) => i.id,
    );
    expect(ordre).toEqual([
      "duerp",
      "registre",
      "carnet-sanitaire",
      "accessibilite",
    ]);
  });

  it("ne retire jamais un registre de la liste", () => {
    // Masquer rendrait le registre introuvable le jour où il devient
    // nécessaire — c'est ce qui avait fait retirer la divulgation progressive.
    const attendus = ["accessibilite", "carnet-sanitaire", "duerp", "registre"];
    const cas: Array<SidebarModules | undefined> = [
      MODULES_ERP_NEUF,
      { ...MODULES_ERP_NEUF, estERP: false },
      undefined,
    ];
    for (const modules of cas) {
      expect(
        registres(modules)
          .map((i) => i.id)
          .sort(),
      ).toEqual(attendus);
    }
  });

  it("garde une destination réelle pour un registre non applicable", () => {
    // L'entrée reste un lien : la page explique, et permet de corriger le
    // régime déclaré si c'est la déclaration qui était fausse.
    const accessibilite = registres({
      ...MODULES_ERP_NEUF,
      estERP: false,
    }).find((i) => i.id === "accessibilite");
    expect(accessibilite?.href).toBe(`/etablissements/${ID}/accessibilite`);
    expect(accessibilite?.bientot).toBeFalsy();
  });

  it("propage la qualification jusqu'au panneau du rail", () => {
    const panneau = construireRail({
      etablissementId: ID,
      modules: { ...MODULES_ERP_NEUF, estERP: false },
    }).find((c) => c.id === "registres");
    expect(panneau?.items?.find((i) => i.id === "accessibilite")?.etat).toBe(
      "non-applicable",
    );
  });
});
