import { describe, expect, it } from "vitest";
import {
  couvertureDeLEtablissement,
  couvertureDuRegime,
  riensASignaler,
  type AxeCouverture,
  type FaitsCouverture,
  type RegimeEtablissement,
} from "./couverture";
import type { EtatCouverture } from "@/lib/duerps/couverture";

const regimeCouvert: RegimeEtablissement = {
  estERP: true,
  estIGH: false,
  categorieErp: "N5",
};

/** Un dossier sans rien à signaler : chaque test n'y ajoute que son axe. */
function faits(partiel: Partial<FaitsCouverture> = {}): FaitsCouverture {
  return {
    regime: regimeCouvert,
    duerp: null,
    equipements: { nbSansObligation: 0, nbEquipements: 12 },
    famillesNonPortees: [],
    ...partiel,
  };
}

const axes = (c: { manques: { axe: AxeCouverture }[] }) =>
  c.manques.map((m) => m.axe);
const axesIndetermines = (c: {
  indeterminations: { axe: AxeCouverture }[];
}) => c.indeterminations.map((i) => i.axe);

/* ─── L'axe du régime — le comportement d'origine, préservé ───────────── */

describe("axe du régime", () => {
  it("ne signale rien pour un ERP de 5e catégorie", () => {
    expect(riensASignaler(couvertureDuRegime(regimeCouvert))).toBe(true);
  });

  it("ne signale rien pour un établissement qui n'est pas ERP, sans regarder la catégorie", () => {
    const c = couvertureDuRegime({
      estERP: false,
      estIGH: false,
      categorieErp: null,
    });
    expect(riensASignaler(c)).toBe(true);
  });

  it.each(["N1", "N2", "N3", "N4"] as const)(
    "met hors périmètre un ERP de catégorie %s",
    (categorieErp) => {
      const c = couvertureDuRegime({ ...regimeCouvert, categorieErp });
      expect(axes(c)).toEqual(["categorie_erp"]);
    },
  );

  it("ne tranche pas quand la catégorie manque, et ne suppose surtout pas la 5e", () => {
    // Supposer « couvert » ici est l'erreur que ce module existe pour
    // empêcher : elle produirait un écran rassurant sur une donnée absente.
    const c = couvertureDuRegime({ ...regimeCouvert, categorieErp: null });
    expect(c.manques).toEqual([]);
    expect(axesIndetermines(c)).toEqual(["categorie_erp"]);
    // Et surtout : une indétermination n'est pas un silence.
    expect(riensASignaler(c)).toBe(false);
  });

  it("met un IGH hors périmètre avant même de regarder la catégorie ERP", () => {
    const c = couvertureDuRegime({
      ...regimeCouvert,
      estIGH: true,
      categorieErp: "N5",
    });
    expect(axes(c)).toEqual(["igh"]);
    expect(c.manques[0].motif).toContain("immeuble de grande hauteur");
  });
});

/* ─── L'axe DUERP — une projection de l'ADR-020, pas une déclaration ──── */

describe("axe secteur_duerp — projection de l'ADR-020", () => {
  const avecEtat = (etat: EtatCouverture, nbActivitesDeclarees = 0) =>
    couvertureDeLEtablissement(
      faits({
        duerp: { etat, secteurNom: "Commerce de détail", nbActivitesDeclarees },
      }),
    );

  it("se tait quand le dossier n'a pas de DUERP — un DUERP absent est un autre sujet", () => {
    expect(riensASignaler(couvertureDeLEtablissement(faits({ duerp: null })))).toBe(
      true,
    );
  });

  it("se tait quand l'ADR-020 n'a identifié aucun manque", () => {
    expect(riensASignaler(avecEtat("aucun_manque_identifie"))).toBe(true);
  });

  it.each([
    "secteur_inconnu",
    "secteur_non_instruit",
    "manques_identifies",
  ] as const)("rend un manque pour l'état %s", (etat) => {
    const c = avecEtat(etat, 3);
    expect(axes(c)).toEqual(["secteur_duerp"]);
    expect(c.indeterminations).toEqual([]);
  });

  it("range `reponses_incompletes` en indétermination, jamais en manque", () => {
    // Le distinguer est tout l'enjeu de l'ADR-020 : un silence n'est pas un
    // « non », et l'afficher en rouge dirait au dirigeant qu'un fait est
    // établi alors qu'une question attend sa réponse.
    const c = avecEtat("reponses_incompletes");
    expect(c.manques).toEqual([]);
    expect(axesIndetermines(c)).toEqual(["secteur_duerp"]);
    expect(c.indeterminations[0].quoiFaire).toContain("Activités");
  });

  it("compte les activités déclarées sans jamais les renommer", () => {
    const c = avecEtat("manques_identifies", 2);
    expect(c.manques[0].motif).toContain("2 activités");
  });

  it("accorde au singulier quand il n'y en a qu'une", () => {
    const c = avecEtat("manques_identifies", 1);
    expect(c.manques[0].motif).toContain("1 activité ou unité");
    expect(c.manques[0].motif).not.toContain("activités");
  });

  it("nomme le secteur quand il est résolu, et se passe de lui sinon", () => {
    expect(avecEtat("secteur_non_instruit").manques[0].motif).toContain(
      "Commerce de détail",
    );
    const sansNom = couvertureDeLEtablissement(
      faits({
        duerp: {
          etat: "secteur_non_instruit",
          secteurNom: null,
          nbActivitesDeclarees: 0,
        },
      }),
    );
    expect(sansNom.manques[0].motif).toContain("Le référentiel retenu");
  });

  it("couvre les cinq états de l'ADR-020, et rien de plus", () => {
    // Cette liste est le miroir de l'union `EtatCouverture`. Elle vit ici pour
    // que l'ajout d'un état se voie deux fois : le `switch` exhaustif de
    // `axeDuerp` casse la compilation, et ce test casse au rouge. La
    // compilation seule ne suffirait pas — un `default` ajouté par
    // inadvertance la rendrait de nouveau silencieuse.
    const tous: EtatCouverture[] = [
      "secteur_inconnu",
      "secteur_non_instruit",
      "manques_identifies",
      "reponses_incompletes",
      "aucun_manque_identifie",
    ];
    for (const etat of tous) {
      expect(() => avecEtat(etat)).not.toThrow();
    }
  });
});

/* ─── L'axe équipements — un rappel, pas un second calcul ─────────────── */

describe("axe domaine_equipement", () => {
  it("se tait quand tous les appareils déclenchent quelque chose", () => {
    const c = couvertureDeLEtablissement(
      faits({ equipements: { nbSansObligation: 0, nbEquipements: 12 } }),
    );
    expect(riensASignaler(c)).toBe(true);
  });

  it("dit le nombre, le situe, et renvoie au détail plutôt que de le refaire", () => {
    const c = couvertureDeLEtablissement(
      faits({ equipements: { nbSansObligation: 3, nbEquipements: 12 } }),
    );
    expect(axes(c)).toEqual(["domaine_equipement"]);
    expect(c.manques[0].motif).toContain("3 équipements");
    expect(c.manques[0].motif).toContain("sur 12 en service");
    expect(c.manques[0].consequence).toContain("page Équipements");
  });

  it("ne conclut jamais qu'aucune vérification n'est due", () => {
    // C'est la phrase que `hors-referentiel.ts` s'interdit explicitement de
    // dire ; la dire ici, en agrégé, annulerait sa précaution.
    //
    // La première version de ce test cherchait la PRÉSENCE du démenti (« cela
    // ne veut pas dire qu'aucune vérification ne leur est due »). Elle passait
    // encore après qu'on eut préfixé la phrase par l'affirmation contraire :
    // le démenti était toujours là, l'affirmation aussi. Un test de présence
    // ne peut pas garantir une absence.
    const c = couvertureDeLEtablissement(
      faits({ equipements: { nbSansObligation: 1, nbEquipements: 1 } }),
    );
    const phrase = c.manques[0].consequence;
    expect(phrase).toContain(
      "ne veut pas dire qu'aucune vérification ne leur est due",
    );
    // Ce qu'on interdit vraiment : que la phrase AFFIRME quelque part
    // qu'aucune vérification n'est due. Toute occurrence du groupe doit donc
    // être immédiatement précédée du démenti — une seule qui ne le soit pas,
    // et le test tombe, où qu'elle ait été glissée.
    for (const m of phrase.matchAll(/aucune vérification/gi)) {
      const avant = phrase.slice(0, m.index);
      expect(avant, `« ${phrase.slice(Math.max(0, m.index - 40), m.index + 30)} »`)
        .toMatch(/ne veut pas dire qu'$/);
    }
  });
});

/* ─── L'axe des familles non portées ──────────────────────────────────── */

describe("axe famille_obligation", () => {
  it("se tait quand tous les manques du corpus sont déclarés ailleurs", () => {
    const c = couvertureDeLEtablissement(faits({ famillesNonPortees: [] }));
    expect(riensASignaler(c)).toBe(true);
  });

  it("dit combien d'articles le produit a lus sans les porter", () => {
    const c = couvertureDeLEtablissement(
      faits({
        famillesNonPortees: [
          { corpus: "arrete-1980-l3", ref: "PE 28", motif: "…" },
          { corpus: "arrete-1980-l3", ref: "PE 32", motif: "…" },
        ],
      }),
    );
    expect(axes(c)).toEqual(["famille_obligation"]);
    expect(c.manques[0].motif).toContain("2 articles");
  });
});

/* ─── Ce que les axes ne font pas ─────────────────────────────────────── */

describe("les axes ne s'additionnent ni ne se recouvrent", () => {
  const quatreManques = couvertureDeLEtablissement({
    regime: { estERP: true, estIGH: false, categorieErp: "N2" },
    duerp: {
      etat: "secteur_inconnu",
      secteurNom: null,
      nbActivitesDeclarees: 0,
    },
    equipements: { nbSansObligation: 4, nbEquipements: 9 },
    famillesNonPortees: [{ corpus: "c", ref: "PE 28", motif: "…" }],
  });

  it("rend un manque par axe, dans un ordre stable — le régime d'abord", () => {
    expect(axes(quatreManques)).toEqual([
      "categorie_erp",
      "secteur_duerp",
      "domaine_equipement",
      "famille_obligation",
    ]);
  });

  it("ne rend ni total, ni score, ni pourcentage de couverture", () => {
    // Un chiffre unique laisserait croire à une mesure de la complétude, que
    // rien ne fonde : quatre manques sur quatre axes ne sont pas quatre fois
    // la même chose. Le contrat de sortie est donc fermé à deux listes.
    expect(Object.keys(quatreManques).sort()).toEqual([
      "indeterminations",
      "manques",
    ]);
  });

  it("ne qualifie jamais la situation au regard du droit", () => {
    const interdits = /conforme|non conforme|infraction|complet à|% couvert/i;
    for (const m of quatreManques.manques) {
      expect(m.motif).not.toMatch(interdits);
      expect(m.consequence).not.toMatch(interdits);
    }
  });

  it("dit manque ET indétermination quand les deux sont vraies", () => {
    // Les rabattre sur un état unique en perdrait une moitié : c'est la raison
    // d'être des deux listes.
    const c = couvertureDeLEtablissement(
      faits({
        regime: { estERP: true, estIGH: false, categorieErp: null },
        equipements: { nbSansObligation: 2, nbEquipements: 5 },
      }),
    );
    expect(axes(c)).toEqual(["domaine_equipement"]);
    expect(axesIndetermines(c)).toEqual(["categorie_erp"]);
  });
});
