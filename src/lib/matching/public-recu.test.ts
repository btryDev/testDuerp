import { describe, expect, it } from "vitest";
import {
  determineObligationsApplicables,
  obligationsSuspenduesAuPublicRecu,
} from "./index";
import type { EtablissementMatching } from "./index";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import { composerRegistre } from "@/lib/registre/composition";

/**
 * Ce que le repli sur l'effectif salarié éteint, et à quelles conditions.
 *
 * `engine.ts:249-258` retombe sur l'effectif salarié quand
 * `personnesPresentesHabituellement` n'est pas déclaré. La règle est délibérée
 * et ne fabrique jamais d'obligation ; elle en **retire** en revanche, sans que
 * rien le dise. Ce fichier établit ce qu'elle retire, et surtout ce qu'elle ne
 * retire pas — un axe qui crierait chez tout le monde ne serait pas lu.
 *
 * TROIS RÈGLES DE RÉDACTION.
 *
 * 1. **Aucune liste d'identifiants écrite à la main.** Une liste se répare en
 *    recopiant, donc elle cesse de vérifier. Les tests d'inclusion nomment UNE
 *    obligation, celle dont le défaut a été mesuré ; les tests d'exclusion
 *    portent sur une propriété, vérifiée sur tout ce que la fonction rend.
 * 2. **Le référentiel RÉEL**, sauf là où il s'agit précisément de prouver que
 *    le module ne connaît aucun seuil : là, et là seulement, une obligation
 *    forgée porte un seuil que le référentiel n'a pas.
 * 3. **Le défaut est réinjecté avant d'être annoncé.** Chaque cas « suspendue »
 *    est doublé d'une interrogation du moteur qui montre l'obligation
 *    réellement absente sans le chiffre et réellement présente avec — sinon
 *    l'axe annoncerait un doute sur une obligation que le dirigeant voit déjà.
 */

/** Le restaurant du brief : six salariés, du public, et un champ vide. */
function restaurant(
  over: Partial<EtablissementMatching> = {},
): EtablissementMatching {
  return {
    id: "etab-resto",
    effectifSurSite: 6,
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

const ids = (etab: EtablissementMatching) =>
  determineObligationsApplicables(etab, []).map((a) => a.obligation.id);

/* ─── Le défaut, réinjecté ────────────────────────────────────────────── */

describe("le défaut existe, et il est muet", () => {
  /**
   * R. 4227-39 : les exercices et essais semestriels, criticité 4. C'est
   * l'obligation la plus lourde des deux, et celle que le palier 1 a rebranchée
   * sur le porteur établissement pour qu'un établissement n'ayant rien déclaré
   * la voie quand même. Un champ facultatif la rééteint.
   */
  const EXERCICE = "incendie-travail-exercice-semestriel";

  it("le moteur ne rend pas les exercices semestriels au restaurant qui n'a pas déclaré son public", () => {
    expect(ids(restaurant())).not.toContain(EXERCICE);
  });

  it("il les rend dès que le chiffre est déclaré au-dessus du seuil", () => {
    expect(
      ids(restaurant({ personnesPresentesHabituellement: 60 })),
    ).toContain(EXERCICE);
  });

  it("la seule différence entre les deux dossiers est ce champ", () => {
    // Si ce test tombe, c'est qu'un autre critère s'est glissé dans la
    // comparaison, et les deux au-dessus ne prouvent plus rien.
    const sans = restaurant();
    const avec = restaurant({ personnesPresentesHabituellement: 60 });
    const differences = (
      Object.keys(sans) as (keyof EtablissementMatching)[]
    ).filter((k) => sans[k] !== avec[k]);
    expect(differences).toEqual(["personnesPresentesHabituellement"]);
  });
});

/* ─── L'axe le nomme ──────────────────────────────────────────────────── */

describe("ce que le repli éteint est rendu", () => {
  it("nomme les exercices semestriels au restaurant qui n'a pas déclaré son public", () => {
    const suspendues = obligationsSuspenduesAuPublicRecu(restaurant(), []);
    expect(suspendues.map((o) => o.id)).toContain(
      "incendie-travail-exercice-semestriel",
    );
  });

  it("porte le libellé du référentiel, jamais une reformulation", () => {
    const suspendues = obligationsSuspenduesAuPublicRecu(restaurant(), []);
    // Le libellé s'affiche au dirigeant. S'il divergeait de celui du
    // calendrier, il croirait qu'on lui parle d'autre chose.
    for (const s of suspendues) {
      const reelle = determineObligationsApplicables(
        restaurant({ personnesPresentesHabituellement: s.seuil }),
        [],
      ).find((a) => a.obligation.id === s.id);
      expect(reelle, s.id).toBeDefined();
      expect(s.libelle).toBe(reelle?.obligation.libelle);
    }
  });

  it("ne rend que des obligations réellement absentes aujourd'hui et réellement présentes avec le chiffre", () => {
    // La propriété qui ferme la porte aux faux positifs, vérifiée sur tout ce
    // que la fonction rend — pas sur une liste.
    const etab = restaurant();
    const suspendues = obligationsSuspenduesAuPublicRecu(etab, []);
    expect(suspendues.length).toBeGreaterThan(0);
    const aujourdhui = ids(etab);
    for (const s of suspendues) {
      expect(aujourdhui, s.id).not.toContain(s.id);
      expect(
        ids(restaurant({ personnesPresentesHabituellement: s.seuil })),
        s.id,
      ).toContain(s.id);
    }
  });
});

/* ─── Ce qui ne doit rien produire ────────────────────────────────────── */

describe("aucun doute annoncé là où il n'y en a pas", () => {
  it("le dossier qui a déclaré son public ne produit rien, au-dessus du seuil", () => {
    expect(
      obligationsSuspenduesAuPublicRecu(
        restaurant({ personnesPresentesHabituellement: 60 }),
        [],
      ),
    ).toEqual([]);
  });

  it("ni en dessous du seuil — une réponse basse est une réponse", () => {
    // Le point est là : le silence de l'outil vient de l'absence de donnée, pas
    // de l'absence d'obligation. Un dirigeant qui déclare vingt personnes a
    // tranché, et l'axe doit se taire.
    expect(
      obligationsSuspenduesAuPublicRecu(
        restaurant({ personnesPresentesHabituellement: 20 }),
        [],
      ),
    ).toEqual([]);
  });

  it("ni quand l'effectif salarié atteint déjà le seuil — le repli donne la même réponse", () => {
    const etab = restaurant({ effectifSurSite: 51 });
    expect(obligationsSuspenduesAuPublicRecu(etab, [])).toEqual([]);
    // Et l'obligation est bien là : ce n'est pas un silence de plus.
    expect(ids(etab)).toContain("incendie-travail-exercice-semestriel");
  });

  it("ni quand les matières de R. 4227-22 sont déclarées — la seconde branche emporte déjà le champ", () => {
    // R. 4227-34 est disjonctif : « quelle que soit leur importance ». Le
    // chiffre manquant ne changerait rien, et l'annoncer serait du bruit.
    const etab = restaurant({ manipuleMatieresR422722: true });
    expect(obligationsSuspenduesAuPublicRecu(etab, [])).toEqual([]);
    expect(ids(etab)).toContain("incendie-travail-exercice-semestriel");
  });

  it("ni pour un établissement que le régime exclut de toute façon", () => {
    // Les deux obligations en jeu portent `travail: true`. Un immeuble
    // d'habitation sans salariés ne les verrait pas davantage avec le chiffre.
    const habitation = restaurant({
      estEtablissementTravail: false,
      estERP: false,
      typeErp: null,
      categorieErp: null,
      estHabitation: true,
    });
    expect(obligationsSuspenduesAuPublicRecu(habitation, [])).toEqual([]);
  });
});

/* ─── Aucun seuil en dur, et aucun porteur oublié ─────────────────────── */

describe("le module lit le référentiel, il ne le recopie pas", () => {
  /** Un gabarit d'obligation d'établissement, à seuil paramétrable. */
  function forgee(
    id: string,
    seuil: number,
    porteur: "etablissement" | "salarie",
  ): Obligation {
    return {
      id,
      domaine: "incendie",
      libelle: `Obligation forgée ${id}`,
      referencesLegales: [
        {
          source: "CODE_TRAVAIL",
          reference: "R. 4227-34",
          article: "R. 4227-34",
          url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532067/",
        },
      ],
      periodicite: "annuelle",
      nature: "echeance_recurrente",
      pieceAttendue: null,
      realisateurs: ["exploitant"],
      criticite: 3,
      transmet: [],
      porteur,
      typologies: { travail: true, personnesPresentesMin: seuil },
    } as Obligation;
  }

  it("prend un seuil que le référentiel n'a pas — donc 51 n'est écrit nulle part ici", () => {
    // Si quelqu'un remplaçait la lecture de `personnesPresentesMin` par une
    // constante, ce test tomberait seul : le restaurant a vingt personnes
    // salariées de moins que 51, et l'obligation forgée se déclenche à 20.
    const suspendues = obligationsSuspenduesAuPublicRecu(
      restaurant({ effectifSurSite: 6 }),
      [],
      [forgee("forgee-seuil-20", 20, "etablissement")],
    );
    expect(suspendues).toEqual([
      { id: "forgee-seuil-20", libelle: "Obligation forgée forgee-seuil-20", seuil: 20 },
    ]);
  });

  it("ne rend pas une obligation portée par un salarié, que le moteur n'affiche jamais", () => {
    // ADR-023 : `evaluerObligation` rend `null` pour ce porteur, avec ou sans
    // le chiffre. Annoncer un doute sur une ligne qui n'apparaîtrait pas serait
    // un faux positif — et c'est le piège qu'une garde écrite sur
    // `matchTypologie` seul n'aurait pas vu.
    expect(
      obligationsSuspenduesAuPublicRecu(restaurant(), [], [
        forgee("forgee-salarie", 20, "salarie"),
      ]),
    ).toEqual([]);
  });
});

/* ─── La couche voisine — le registre de sécurité ─────────────────────── */

describe("le registre de sécurité perd la même chose, par le même repli", () => {
  /**
   * `registre/sections.ts` réutilise `TypologieApplication` et
   * `registre/composition.ts` appelle le même `matchTypologie` : le repli les
   * atteint aussi. C'est ce qui autorise la phrase de l'axe à dire « ni à votre
   * calendrier ni à votre registre de sécurité ». Sans ce test, elle serait
   * une affirmation de plus.
   */
  const fiches = (etab: EtablissementMatching) =>
    composerRegistre(etab, []).map((d) => d.section.id);

  it("la fiche des équipes locales d'évacuation manque tant que le public n'est pas déclaré", () => {
    expect(fiches(restaurant())).not.toContain("service-securite-evacuation");
  });

  it("elle revient dès que le chiffre est déclaré", () => {
    expect(
      fiches(restaurant({ personnesPresentesHabituellement: 60 })),
    ).toContain("service-securite-evacuation");
  });
});
