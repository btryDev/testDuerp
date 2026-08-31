import { describe, expect, it } from "vitest";
import { determineObligationsApplicables } from "./index";
import type { EtablissementMatching } from "./index";

/**
 * Le lot « faux négatifs d'ancrage » — la garantie que le rebranchement tient.
 *
 * Six obligations existaient au référentiel en étant accrochées à une catégorie
 * d'équipement qui ne les conditionne pas. Un établissement qui n'avait pas
 * déclaré cet équipement ne les voyait JAMAIS, alors qu'il y est soumis. Dans un
 * outil de conformité, ce silence est pire qu'un trou : le trou se voit, le faux
 * négatif rassure à tort.
 *
 * Ce fichier existe parce qu'un test vert ne montre pas ça. Le point du lot est
 * qu'une obligation APPARAISSE là où elle n'apparaissait pas — et la seule façon
 * de l'établir est de le demander au moteur, sur un établissement qui n'a
 * strictement rien déclaré.
 *
 * DEUX RÈGLES DE RÉDACTION, et elles ne sont pas décoratives.
 *
 * 1. On passe par `determineObligationsApplicables` avec le référentiel RÉEL —
 *    jamais un tableau d'obligations fabriqué pour l'occasion, jamais une
 *    réimplémentation du prédicat. Ce dépôt a déjà rencontré le piège : un test
 *    qui recopie la règle qu'il prétend vérifier reste vert quand la garantie
 *    est neutralisée. Ici, si quelqu'un remet `categoriesEquipement` sur l'une
 *    de ces obligations, ces tests tombent — et eux seuls.
 *
 * 2. Chaque assertion « l'obligation apparaît » est doublée d'une assertion
 *    « et elle n'apparaît pas ailleurs ». Rebrancher trop large ferait naître
 *    des échéances qui ne sont pas dues : l'erreur symétrique, et tout aussi
 *    grave. Le champ d'application n'a pas bougé, et c'est vérifié ici.
 */

// ---------------------------------------------------------------------------
// Fixtures — le point commun est qu'AUCUNE ne déclare le moindre équipement.
// ---------------------------------------------------------------------------

/** Employeur non-ERP, sous le seuil de R. 4227-34. Le cas le plus dépouillé. */
function bureauSansRien(
  over: Partial<EtablissementMatching> = {},
): EtablissementMatching {
  return {
    id: "etab-bureau-nu",
    effectifSurSite: 12,
    estEtablissementTravail: true,
    estERP: false,
    estIGH: false,
    estHabitation: false,
    typeErp: null,
    categorieErp: null,
    classeIgh: null,
    personnesPresentesHabituellement: null,
    manipuleMatieresR422722: null,
    ...over,
  };
}

/** ERP de 5ᵉ catégorie — le restaurateur du brief, qui n'a rien déclaré. */
function restoErpCat5SansRien(
  over: Partial<EtablissementMatching> = {},
): EtablissementMatching {
  return {
    id: "etab-resto-nu",
    effectifSurSite: 8,
    estEtablissementTravail: true,
    estERP: true,
    estIGH: false,
    estHabitation: false,
    typeErp: "N",
    categorieErp: "N5",
    classeIgh: null,
    personnesPresentesHabituellement: null,
    manipuleMatieresR422722: null,
    ...over,
  };
}

/** Rend les identifiants que le moteur retient, sur un parc VIDE. */
function idsSansAucunEquipement(etab: EtablissementMatching): string[] {
  return determineObligationsApplicables(etab, []).map((a) => a.obligation.id);
}

// ---------------------------------------------------------------------------
// 1. Tenue du registre de sécurité — CCH R. 143-44, CT L. 4711-1 et L. 4711-2
// ---------------------------------------------------------------------------

describe("faux négatif — tenue du registre de sécurité", () => {
  /**
   * R. 143-44, version en vigueur depuis le 1er juillet 2026 : « Dans les
   * établissements soumis aux prescriptions du présent chapitre, il doit être
   * tenu un registre de sécurité. » Le chapitre, c'est tous les ERP. L'article
   * ne nomme aucun équipement.
   */
  it("un ERP de 5ᵉ catégorie qui n'a rien déclaré reçoit le registre", () => {
    expect(idsSansAucunEquipement(restoErpCat5SansRien())).toContain(
      "incendie-registre-securite",
    );
  });

  /**
   * Côté Code du travail, L. 4711-1 et L. 4711-2 obligent tout employeur à
   * tenir et conserver les pièces des vérifications, sans seuil d'effectif.
   * L'ancrage à un extincteur déclaré n'avait aucun fondement de ce côté-là
   * non plus.
   */
  it("un employeur non-ERP qui n'a rien déclaré reçoit le registre", () => {
    expect(idsSansAucunEquipement(bureauSansRien())).toContain(
      "incendie-registre-securite",
    );
  });

  /**
   * Le garde-fou symétrique : `typologies` reste `{ travail: true, erp: true }`,
   * une disjonction. Un immeuble d'habitation pur, qui n'est ni employeur ni
   * ERP, ne doit rien recevoir — le rebranchement n'a pas transformé
   * l'obligation en obligation universelle.
   */
  it("un immeuble d'habitation, ni employeur ni ERP, ne le reçoit pas", () => {
    const habitation: EtablissementMatching = {
      id: "etab-hab-nu",
      effectifSurSite: 0,
      estEtablissementTravail: false,
      estERP: false,
      estIGH: false,
      estHabitation: true,
      typeErp: null,
      categorieErp: null,
      classeIgh: null,
      personnesPresentesHabituellement: null,
      manipuleMatieresR422722: null,
    };
    expect(idsSansAucunEquipement(habitation)).not.toContain(
      "incendie-registre-securite",
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Exercices d'évacuation semestriels — CT R. 4227-39
// ---------------------------------------------------------------------------

describe("faux négatif — exercices et essais semestriels", () => {
  /**
   * Le cœur du lot. R. 4227-34 dispose que les établissements de son champ
   * « sont équipés d'un système d'alarme sonore » : l'alarme y est le CONTENU
   * d'une obligation, pas la condition d'une autre. Ancrer l'exercice sur
   * ALARME_INCENDIE revenait à ne l'exiger que de ceux qui avaient déjà obéi.
   */
  it("un établissement de plus de 50 personnes sans alarme déclarée reçoit l'exercice", () => {
    expect(
      idsSansAucunEquipement(
        bureauSansRien({ personnesPresentesHabituellement: 60 }),
      ),
    ).toContain("incendie-travail-exercice-semestriel");
  });

  /**
   * Seconde branche du champ, disjonctive : la manipulation de matières
   * inflammables de R. 4227-22, quel que soit l'effectif.
   */
  it("un établissement manipulant des matières R. 4227-22 le reçoit, quel que soit l'effectif", () => {
    expect(
      idsSansAucunEquipement(
        bureauSansRien({ effectifSurSite: 3, manipuleMatieresR422722: true }),
      ),
    ).toContain("incendie-travail-exercice-semestriel");
  });

  /**
   * Le garde-fou symétrique, et il compte autant : le champ de R. 4227-34
   * n'a pas bougé. Le salon de coiffure de deux personnes ne reçoit toujours
   * rien. Si ce test tombe, le rebranchement a sur-appliqué.
   */
  it("un petit établissement hors du champ de R. 4227-34 ne le reçoit pas", () => {
    expect(
      idsSansAucunEquipement(bureauSansRien({ effectifSurSite: 4 })),
    ).not.toContain("incendie-travail-exercice-semestriel");
  });
});

// ---------------------------------------------------------------------------
// 3. Consigne de sécurité incendie — CT R. 4227-37
// ---------------------------------------------------------------------------

describe("faux négatif — consigne de sécurité incendie affichée", () => {
  /**
   * R. 4227-37 : « Dans les établissements mentionnés à l'article R. 4227-34,
   * une consigne de sécurité incendie est établie et affichée de manière très
   * apparente. » Aucun équipement dans le texte.
   */
  it("un établissement du champ de R. 4227-34 sans équipement reçoit la consigne", () => {
    expect(
      idsSansAucunEquipement(
        bureauSansRien({ personnesPresentesHabituellement: 60 }),
      ),
    ).toContain("incendie-travail-consigne-affichee");
  });

  it("un établissement hors de ce champ ne la reçoit pas", () => {
    expect(
      idsSansAucunEquipement(bureauSansRien({ effectifSurSite: 4 })),
    ).not.toContain("incendie-travail-consigne-affichee");
  });
});

// ---------------------------------------------------------------------------
// 4. Visite de commission — le faux négatif CONNU qui reste ouvert
// ---------------------------------------------------------------------------

describe("visite de commission — faux négatif connu, délibérément non corrigé", () => {
  /**
   * Ce test constate un DÉFAUT, il ne célèbre pas une garantie. Il est ici pour
   * que personne ne croie la ligne traitée.
   *
   * R. 143-41 fonde les visites sans condition d'équipement — le faux négatif
   * est réel. Mais PE 37, seul article du Livre III à organiser une visite
   * périodique en 5ᵉ catégorie, ne vise que les établissements comportant
   * « pour le public, des locaux à sommeil ». Cette restriction décide de
   * l'EXISTENCE de la visite, pas de son rythme : la retirer ferait naître une
   * échéance chez chaque boutique. Or elle est aujourd'hui portée par une
   * caractéristique de l'ALARME_INCENDIE, et un porteur établissement
   * n'accepte pas de `conditions`.
   *
   * Le déblocage est un attribut d'établissement, donc une migration — hors du
   * périmètre de ce lot. Le jour où cet attribut existera, ce test devra
   * tomber : c'est ce qui le rend utile.
   */
  it("un hôtel de 5ᵉ catégorie sans alarme déclarée ne reçoit toujours PAS la visite", () => {
    expect(idsSansAucunEquipement(restoErpCat5SansRien())).not.toContain(
      "incendie-erp-5-visite-commission",
    );
  });
});

// ---------------------------------------------------------------------------
// La mesure du lot
// ---------------------------------------------------------------------------

describe("la mesure du lot — ce que reçoit un établissement sans équipement", () => {
  /**
   * Le chiffre qui dit si le lot a servi à quelque chose.
   *
   * Ces nombres sont figés volontairement. Ils bougeront au prochain lot de
   * couverture, et c'est très bien : leur rôle est d'obliger à constater le
   * mouvement, pas de l'interdire.
   *
   * Ils ont bougé une première fois à l'assemblage avec le lot 7, le jour même,
   * et le mécanisme a fonctionné : les cinq lignes ajoutées ci-dessous ont dû
   * être constatées une par une au lieu de passer inaperçues. Les tests
   * `toContain` du reste du fichier, eux, sont restés verts — les
   * rebranchements de ce lot tiennent en présence du lot 7.
   */
  it("un ERP de 5ᵉ catégorie sans aucun équipement déclaré", () => {
    expect(idsSansAucunEquipement(restoErpCat5SansRien()).sort()).toEqual([
      "aeration-controle-installations-r4222-20",
      "formation-securite-etablissement-information",
      "formation-securite-etablissement-organisation",
      "incendie-erp-pe4-entretien-installations-techniques",
      "incendie-registre-securite",
      "sante-travail-etablissement-liste-postes-risques",
      "secours-etablissement-materiel",
      "secours-etablissement-mesures",
    ]);
  });

  it("un employeur non-ERP du champ de R. 4227-34, sans aucun équipement", () => {
    expect(
      idsSansAucunEquipement(
        bureauSansRien({ personnesPresentesHabituellement: 60 }),
      ).sort(),
    ).toEqual([
      "aeration-controle-installations-r4222-20",
      "formation-securite-etablissement-information",
      "formation-securite-etablissement-organisation",
      "incendie-registre-securite",
      "incendie-travail-consigne-affichee",
      "incendie-travail-exercice-semestriel",
      "sante-travail-etablissement-liste-postes-risques",
      "secours-etablissement-materiel",
      "secours-etablissement-mesures",
    ]);
  });
});
