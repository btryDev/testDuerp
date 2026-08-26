// Le registre s'imprime-t-il, quelles que soient les formes de fiche ?
//
// Le document a longtemps été deux tableaux : un extrait du calendrier. Il
// porte maintenant les quarante-neuf fiches, sous quatre formes qui ne se
// rendent pas pareil — questions/réponses, journal, contenu tenu ailleurs, et
// la fiche que rien ne recueille. Une largeur de colonne calculée à la volée
// ou une forme oubliée casse le rendu sans casser la compilation : ce test
// est le seul garde-fou qui le verrait.

import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { RegistreDocument, type RegistreData } from "./RegistreDocument";

const data: RegistreData = {
  entreprise: "Btry",
  etablissement: "Le Comptoir",
  adresse: "1 rue des Lilas",
  genereLe: new Date("2026-08-26T10:00:00Z"),
  bilan: { dues: 4, outillees: 3, faites: 1, aRemplir: 1, tenuesAilleurs: 1, nonOutillees: 1 },
  parties: [
    {
      id: "1",
      titre: "Organisation",
      fiches: [
        { id: "a", titre: "Renseignements généraux", attendu: "Raison sociale…", raisons: [], etat: "Toutes les réponses", ton: "faite",
          champs: [{ libelle: "Raison sociale", valeur: "Btry" }, { libelle: "Adresse", valeur: "Non renseigné" }] },
        { id: "b", titre: "Contrôles administratifs", attendu: "Date, représentant…", raisons: [], etat: "Aucune ligne consignée", ton: "attente",
          colonnes: ["Date", "Représentant", "Visa"], lignes: [] },
      ],
    },
    {
      id: "2.1",
      titre: "Matériel d'intervention",
      fiches: [
        { id: "c", titre: "Extincteurs", attendu: "Inventaire", raisons: [], etat: "Tenue dans vos équipements", ton: "renvoi",
          source: "vos équipements", tenues: [{ titre: "Extincteur hall", meta: "Bât. A · Entrée" }] },
        { id: "d", titre: "Annexes", attendu: "Pièces libres", raisons: [], etat: "À tenir hors de l'outil", ton: "muet" },
      ],
    },
  ],
  rapports: [],
  verifsEnAttente: [],
};

describe("RegistreDocument", () => {
  it("rend un PDF non vide avec les quatre formes de fiche", async () => {
    const buf = await renderToBuffer(<RegistreDocument data={data} />);
    expect(buf.length).toBeGreaterThan(2000);
  }, 30000);
});
