// La garantie que ce fichier tient : **aucune zone sans équipement déclaré ne
// peut s'annoncer « à jour »**.
//
// Elle n'est pas vérifiée sur un exemple mais sur tout le domaine utile — le
// produit d'un parc de 0 à 40 par un retard de 0 à 40 —, parce qu'un exemple
// se contourne au premier `if` ajouté au-dessus, et qu'un cas particulier est
// précisément ce qui avait laissé passer le défaut.

import { describe, expect, it } from "vitest";
import { etatCharge, libelleCharge } from "./etat-charge";

const PARCS = Array.from({ length: 41 }, (_, i) => i);
const RETARDS = Array.from({ length: 41 }, (_, i) => i);

describe("etatCharge", () => {
  it("dit « sans objet » d'une zone sans équipement, quel que soit le retard", () => {
    for (const nbEnRetard of RETARDS) {
      expect(etatCharge({ nbEquipements: 0, nbEnRetard }).nature).toBe(
        "sansObjet",
      );
    }
  });

  it("ne dit jamais « à jour » d'une zone sans équipement", () => {
    // LA GARANTIE. Balayage complet du domaine : si un jour quelqu'un teste
    // `nbEnRetard` avant `nbEquipements`, cette assertion tombe pour les 41
    // valeurs de retard, pas seulement pour zéro.
    for (const nbEquipements of PARCS) {
      for (const nbEnRetard of RETARDS) {
        const etat = etatCharge({ nbEquipements, nbEnRetard });
        if (nbEquipements === 0) {
          expect(
            etat.nature,
            `parc vide, ${nbEnRetard} en retard → ${etat.nature}`,
          ).not.toBe("aJour");
          expect(libelleCharge(etat)).not.toBe("À jour");
        }
      }
    }
  });

  it("ne dit « à jour » que d'un parc non vide sans retard", () => {
    for (const nbEquipements of PARCS) {
      for (const nbEnRetard of RETARDS) {
        const aJour = etatCharge({ nbEquipements, nbEnRetard }).nature === "aJour";
        expect(aJour).toBe(nbEquipements > 0 && nbEnRetard === 0);
      }
    }
  });

  it("compte le retard d'un parc non vide", () => {
    const etat = etatCharge({ nbEquipements: 5, nbEnRetard: 3 });
    expect(etat).toEqual({ nature: "enRetard", nbEnRetard: 3 });
  });

  it("traite un parc négatif comme un parc vide plutôt que de le déclarer à jour", () => {
    // Ne devrait pas arriver ; si ça arrive, le mensonge reste interdit.
    expect(etatCharge({ nbEquipements: -1, nbEnRetard: 0 }).nature).toBe(
      "sansObjet",
    );
  });
});

describe("libelleCharge", () => {
  it("ne prétend pas que l'outil a regardé un parc vide", () => {
    const dit = libelleCharge({ nature: "sansObjet" });
    expect(dit).toBe("Sans objet");
    // Aucune formule qui laisserait entendre un constat.
    expect(dit).not.toMatch(/jour|rien à signaler|conforme/i);
  });
});
