import { describe, expect, it } from "vitest";
import {
  empreinteReferentiel,
  obligationsConformite,
} from "./index";
import { estPorteeParSalarie, type Obligation } from "./types";

/**
 * Les transmissions qui nomment un titre absent du catalogue.
 *
 * Extraite pour que la garantie et sa contre-épreuve emploient **le même**
 * prédicat : quand la contre-épreuve recopiait la logique, neutraliser la
 * garantie la laissait verte — elles ne partageaient plus rien.
 */
function renvoisMorts(obligations: readonly Obligation[]): string[] {
  const titres = new Set(
    obligations.filter(estPorteeParSalarie).map((o) => o.id),
  );
  const morts: string[] = [];
  for (const o of obligations) {
    for (const t of o.transmet) {
      if (t.vers !== "salarie_designe") continue;
      if (t.titre === null) continue; // réponse déclarée, cf. types.ts
      if (!titres.has(t.titre)) morts.push(`${o.id} → ${t.titre}`);
    }
  }
  return morts;
}

/**
 * Les garanties de l'ADR-024. Chacune est éprouvée en réinjectant le défaut
 * qu'elle prétend interdire : une garantie qu'on n'a pas vue mordre est une
 * décoration.
 */
describe("transmissions (ADR-024)", () => {
  it("toutes les obligations déclarent leurs transmissions", () => {
    // Le type l'impose déjà — ce test dit ce que le type garantit, pour que
    // quelqu'un qui rendrait le champ optionnel voie rouge et pas seulement
    // vert. `undefined` ne peut pas arriver ici sans une régression de type.
    for (const o of obligationsConformite) {
      expect(Array.isArray(o.transmet), o.id).toBe(true);
    }
  });

  it("une transmission vers un titre pointe sur une obligation salarié réelle", () => {
    // La garantie qui compte. Un identifiant mal recopié créerait un renvoi
    // mort, et un renvoi mort dans ce référentiel se lit comme « rien à
    // signaler » — exactement le faux négatif muet que l'ADR-022 existe pour
    // supprimer.
    expect(renvoisMorts(obligationsConformite)).toEqual([]);
  });

  it("le renvoi mort est bien attrapé, sur le prédicat que la garantie emploie", () => {
    // Contre-épreuve, réécrite deux fois. La première se réduisait à
    // `titres.has("titre-qui-n-existe-pas")`, vraie de n'importe quelle
    // implémentation. La seconde éprouvait un prédicat RECOPIÉ dans le test :
    // neutraliser la garantie laissait la contre-épreuve verte, puisqu'elles
    // ne partageaient plus rien. Les deux appellent maintenant `renvoisMorts`.
    //
    // Et ce test porte une seconde charge : sur le référentiel livré, la
    // garantie ne traverse AUCUNE transmission nommée — il n'en existe qu'une
    // à porteur salarié, et son `titre` est `null`. Éprouvée sur le seul
    // référentiel, elle ne mordrait que le jour d'un ajout. Les cas fabriqués
    // ci-dessous la font mordre aujourd'hui.
    const titreReel = obligationsConformite.filter(estPorteeParSalarie)[0];
    expect(titreReel, "le référentiel doit porter au moins un titre").toBeDefined();

    const avecTransmission = (titre: string | null): Obligation => ({
      id: "temoin-renvoi",
      domaine: "electricite",
      libelle: "Obligation témoin",
      referencesLegales: [{ source: "CODE_TRAVAIL", reference: "R. 0000-0" }],
      periodicite: "autre",
      nature: "etat_permanent",
      pieceAttendue: null,
      realisateurs: ["exploitant"],
      criticite: 3,
      transmet: [
        {
          vers: "salarie_designe",
          titre,
          motif:
            "Motif de test, assez long pour tenir le contrôle de substance du motif.",
        },
      ],
      typologies: { travail: true },
      categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    });

    // `null` : réponse déclarée, jamais un renvoi mort.
    expect(renvoisMorts([...obligationsConformite, avecTransmission(null)])).toEqual([]);
    // Un titre réel du catalogue : accepté.
    expect(
      renvoisMorts([...obligationsConformite, avecTransmission(titreReel.id)]),
    ).toEqual([]);
    // Un identifiant inventé : attrapé, et nommé.
    expect(
      renvoisMorts([...obligationsConformite, avecTransmission("titre-inexistant")]),
    ).toEqual(["temoin-renvoi → titre-inexistant"]);

    // Et le cas qui exerce la FINESSE du prédicat, pas seulement son
    // existence : une obligation portée par l'ÉTABLISSEMENT n'est pas un
    // titre, et la nommer est un renvoi mort. Sans ce cas, élargir
    // `estPorteeParSalarie` en `porteurDe(o) !== "equipement"` — le piège que
    // sa propre docstring décrit — laissait les six tests verts.
    expect(
      renvoisMorts([
        ...obligationsConformite,
        avecTransmission("aeration-controle-installations-r4222-20"),
      ]),
    ).toEqual(["temoin-renvoi → aeration-controle-installations-r4222-20"]);
  });

  it("chaque transmission porte un motif substantiel", () => {
    // Un motif vide ou d'un mot rendrait le champ décoratif : quelqu'un qui
    // relit un article doit lire ce que le TEXTE implique, pas une étiquette.
    for (const o of obligationsConformite) {
      for (const t of o.transmet) {
        expect(t.motif.trim().length, `${o.id} / ${t.vers}`).toBeGreaterThan(40);
      }
    }
  });

  it("une transmission ne fait pas bouger l'empreinte du référentiel", () => {
    // Décision explicite de l'ADR-024, et elle doit rester vérifiée : y faire
    // entrer `transmet` réconcilierait TOUS les calendriers de TOUS les
    // dossiers à chaque annotation de relecture, pour un résultat identique —
    // une transmission ne produit aucune échéance.
    const temoin: Obligation = {
      id: "temoin-transmission",
      domaine: "incendie",
      libelle: "Obligation témoin",
      referencesLegales: [{ source: "CODE_TRAVAIL", reference: "R. 0000-0" }],
      periodicite: "annuelle",
      realisateurs: ["exploitant"],
      criticite: 3,
      transmet: [],
    nature: "echeance_recurrente",
    pieceAttendue: null,
      typologies: { erp: true },
      categoriesEquipement: ["ALARME_INCENDIE"],
    };
    const avant = empreinteReferentiel([temoin]);
    const apres = empreinteReferentiel([
      {
        ...temoin,
        transmet: [
          {
            vers: "modele_absent",
            modele: "ModeleImaginaire",
            motif:
              "Motif de test, assez long pour passer le contrôle de substance du motif.",
          },
        ],
      },
    ]);
    expect(apres).toBe(avant);
  });

  it("l'empreinte réagit toujours à ce qui, lui, change les échéances", () => {
    // Contre-épreuve du test précédent : sans elle, une empreinte cassée qui
    // ne réagirait plus à RIEN le passerait aussi.
    const temoin: Obligation = {
      id: "temoin-transmission",
      domaine: "incendie",
      libelle: "Obligation témoin",
      referencesLegales: [{ source: "CODE_TRAVAIL", reference: "R. 0000-0" }],
      periodicite: "annuelle",
      realisateurs: ["exploitant"],
      criticite: 3,
      transmet: [],
    nature: "echeance_recurrente",
    pieceAttendue: null,
      typologies: { erp: true },
      categoriesEquipement: ["ALARME_INCENDIE"],
    };
    expect(
      empreinteReferentiel([{ ...temoin, periodicite: "biennale" }]),
    ).not.toBe(empreinteReferentiel([temoin]));
  });
});
