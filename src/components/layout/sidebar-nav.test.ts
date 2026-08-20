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

/** Registres de la section « Mes registres », dans l'ordre de rendu. */
function registres(modules?: SidebarModules) {
  const section = construireSections({ etablissementId: ID, modules }).find(
    (s) => s.title === "Mes registres",
  );
  return section?.items ?? [];
}

function etatDe(id: SidebarItemId, modules?: SidebarModules) {
  return registres(modules).find((i) => i.id === id)?.etat;
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

  it("rattache les vérifications aux contrôles matériel", () => {
    expect(deduireActif(`/etablissements/${ID}/verifications/v1`, ID)).toBe(
      "controles",
    );
  });

  it("sépare la lecture d'ensemble du calendrier de celle des contrôles", () => {
    const calendrier = `/etablissements/${ID}/calendrier`;
    expect(deduireActif(calendrier, ID)).toBe("calendrier");
    expect(deduireActif(calendrier, ID, "famille=controle")).toBe("controles");
    // Les autres familles restent des lectures de « Tout » : ce ne sont pas
    // des entrées du panneau, et surligner ailleurs mentirait.
    expect(deduireActif(calendrier, ID, "famille=travaux")).toBe("calendrier");
    expect(deduireActif(calendrier, ID, "vue=equipement")).toBe("calendrier");
  });

  it("accepte la query sous forme d'URLSearchParams", () => {
    // C'est ce que rend `useSearchParams()` côté client : la sidebar le
    // passe tel quel, sans le sérialiser.
    const params = new URLSearchParams({ famille: "controle" });
    expect(deduireActif(`/etablissements/${ID}/calendrier`, ID, params)).toBe(
      "controles",
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

  it("ouvre « À faire » sur l'ensemble puis les contrôles matériel", () => {
    const aFaire = sections()[0];
    expect(aFaire.items.map((i) => i.id)).toEqual([
      "calendrier",
      "controles",
      "actions",
      "interventions",
      "controle",
    ]);
    // Le panneau s'intitule déjà « À faire » : l'item dit « Tout », pas
    // « Calendrier ». Le nom d'écran, lui, sert aux fils de retour.
    expect(aFaire.items[0].label).toBe("Tout");
    // Deux paramètres : `famille` réduit aux contrôles, `vue` les range par
    // appareil. « Matériel » annonce un inventaire, pas un agenda.
    expect(aFaire.items[1].href).toBe(
      `/etablissements/${ID}/calendrier?famille=controle&vue=equipement`,
    );
  });

  it("garde hors des sections ce qui vit au rail", () => {
    // Un résumé n'est pas une tâche, et le guide a son entrée de premier
    // niveau : les laisser ici les afficherait deux fois (ADR-015).
    expect(idsVisibles()).not.toContain("tableau");
    expect(idsVisibles()).not.toContain("guide");
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
      "tableau",
      "a-faire",
      "etablissement",
      "registres",
      "comprendre",
      "connecter",
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

  it("fait du tableau de bord une entrée de rail sans panneau", () => {
    const tableau = rail().find((c) => c.id === "tableau");
    expect(tableau?.items).toBeUndefined();
    expect(tableau?.href).toBe(`/etablissements/${ID}`);
  });

  it("fait de « Connecter » un lien direct, hors des trois panneaux", () => {
    const connecter = rail().find((c) => c.id === "connecter");
    expect(connecter?.items).toBeUndefined();
    expect(connecter?.href).toBe(`/etablissements/${ID}/connecter`);
    // Ce n'est ni une tâche ni un registre : il n'a pas à apparaître dans
    // les sections, sous peine de se retrouver dans deux endroits du rail.
    expect(idsVisibles()).not.toContain("connecter");
  });

  it("garde « Comprendre » en lien direct hors du panneau « À faire »", () => {
    const cats = rail();
    expect(cats.find((c) => c.id === "a-faire")?.items?.map((i) => i.id))
      .not.toContain("guide");
    const comprendre = cats.find((c) => c.id === "comprendre");
    expect(comprendre?.items).toBeUndefined();
    expect(comprendre?.href).toBe(`/etablissements/${ID}/guide`);
    // La césure entre le dossier et les modes d'accès est portée par la
    // donnée, pas devinée au rendu.
    expect(comprendre?.separateurAvant).toBe(true);
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
      counts: { verificationsEnRetard: 2, prestatairesAlertes: 0 },
    });
    expect(cats.find((c) => c.id === "a-faire")?.alert).toBe(true);
    expect(cats.find((c) => c.id === "etablissement")?.alert).toBe(false);
  });

  it("alerte « À faire » sur le retard d'une famille sans vérification", () => {
    // Un permis de feu ou une attestation expirée doit allumer le rail :
    // c'est tout l'objet de la réconciliation des compteurs.
    const cats = construireRail({
      etablissementId: ID,
      counts: { enRetardTotal: 2, verificationsEnRetard: 0 },
    });
    expect(cats.find((c) => c.id === "a-faire")?.alert).toBe(true);
  });

  it("rattache chaque item à la catégorie qui le contient", () => {
    for (const cat of rail()) {
      for (const it of cat.items ?? []) {
        expect(categorieDeItem(it.id)).toBe(cat.id);
      }
    }
    expect(categorieDeItem("tableau")).toBe("tableau");
    expect(categorieDeItem("controles")).toBe("a-faire");
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
        enRetardTotal: 5,
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
    expect(parId("prestataires")).toMatchObject({ count: 1, alert: true });
    expect(parId("duerp")).toMatchObject({ count: 2, alert: true });
  });

  it("donne à chaque lecture du calendrier le compteur de son périmètre", () => {
    // « Tout » annonce toutes les familles, « Contrôles matériel » les
    // seules vérifications : deux nombres différents, et c'est correct —
    // chacun est nommé par son item (ADR-015).
    const items = construireSections({
      etablissementId: ID,
      counts: { enRetardTotal: 5, verificationsEnRetard: 3 },
    }).flatMap((s) => s.items);

    expect(items.find((i) => i.id === "calendrier")).toMatchObject({
      count: 5,
      alert: true,
    });
    expect(items.find((i) => i.id === "controles")).toMatchObject({
      count: 3,
      alert: true,
    });
  });

  it("n'affiche pas d'alerte quand les compteurs sont à zéro", () => {
    const items = construireSections({
      etablissementId: ID,
      counts: {
        enRetardTotal: 0,
        verificationsEnRetard: 0,
        prestatairesAlertes: 0,
      },
    }).flatMap((s) => s.items);

    expect(items.find((i) => i.id === "calendrier")?.alert).toBe(false);
    expect(items.find((i) => i.id === "controles")?.alert).toBe(false);
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

  it("laisse les registres événementiels « non ouverts » tant qu'ils sont vides", () => {
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
      "permis-feu",
      "plan-prevention",
      "carnet-sanitaire",
      "accessibilite",
    ]);
  });

  it("ne retire jamais un registre de la liste", () => {
    // Masquer rendrait le registre introuvable le jour où il devient
    // nécessaire — c'est ce qui avait fait retirer la divulgation progressive.
    const attendus = [
      "accessibilite",
      "carnet-sanitaire",
      "duerp",
      "permis-feu",
      "plan-prevention",
      "registre",
    ];
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
