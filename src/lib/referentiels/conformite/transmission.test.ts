import { describe, expect, it } from "vitest";
import {
  empreinteReferentiel,
  obligationsConformite,
} from "./index";
import { estPorteeParSalarie, type Obligation } from "./types";

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
    const titres = new Set(
      obligationsConformite.filter(estPorteeParSalarie).map((o) => o.id),
    );
    for (const o of obligationsConformite) {
      for (const t of o.transmet) {
        if (t.vers !== "salarie_designe") continue;
        if (t.titre === null) continue; // réponse déclarée, cf. types.ts
        expect(titres, `${o.id} → ${t.titre}`).toContain(t.titre);
      }
    }
  });

  it("le renvoi mort est bien attrapé", () => {
    // Contre-épreuve du test précédent, et elle a dû être réécrite : sa
    // première version se contentait de `titres.has("titre-qui-n-existe-pas")`,
    // vraie pour n'importe quelle implémentation, y compris un ensemble vide.
    //
    // Pire, elle masquait un fait : sur le référentiel livré, la boucle du
    // test précédent n'exécute AUCUNE assertion. Il n'existe qu'une
    // transmission `salarie_designe`, et son `titre` est `null` — la garantie
    // ne mord que sur un ajout futur. Ce test rejoue donc la vérification sur
    // une obligation fabriquée, pour qu'elle soit éprouvée aujourd'hui et pas
    // le jour où quelqu'un ajoutera une ligne.
    const titres = new Set(
      obligationsConformite.filter(estPorteeParSalarie).map((o) => o.id),
    );
    const verifier = (t: string | null) =>
      t === null || titres.has(t);

    expect(verifier(null)).toBe(true); // réponse déclarée
    expect(verifier([...titres][0])).toBe(true); // titre réel
    expect(verifier("titre-qui-n-existe-pas")).toBe(false); // renvoi mort
    expect(titres.size).toBeGreaterThan(0); // sinon les deux premiers mentent
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
      typologies: { erp: true },
      categoriesEquipement: ["ALARME_INCENDIE"],
    };
    expect(
      empreinteReferentiel([{ ...temoin, periodicite: "biennale" }]),
    ).not.toBe(empreinteReferentiel([temoin]));
  });
});
