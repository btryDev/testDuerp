import { describe, expect, it } from "vitest";
import { identitePublique, type EtablissementPublic } from "./identite";

/**
 * Qui la page publique désigne.
 *
 * Le défaut relevé à l'écran le 2026-09-04 : le titre portait l'entreprise.
 * En mono-site le visiteur lisait deux fois le même nom ; en multi-site, le QR
 * code du 3 quai Nord ouvrait une page titrée du nom d'un autre lieu.
 *
 * Les cas ci-dessous ne sont pas une liste de fichiers ni une énumération de
 * comptes : ce sont les trois configurations que le modèle permet — le nom du
 * dossier égale celui de la société, le contient, ou en diffère — plus la
 * couche voisine (les blancs et la casse ne font pas deux entités).
 */

function etab(partial: Partial<EtablissementPublic> = {}): EtablissementPublic {
  return {
    raisonDisplay: "Le Comptoir des Halles",
    adresse: "14 rue des Halles, 44000 Nantes",
    entreprise: { raisonSociale: "Le Comptoir des Halles" },
    ...partial,
  };
}

describe("le sujet du registre public", () => {
  it("titre l'ÉTABLISSEMENT, pas l'entreprise", () => {
    // Le cas du QR code collé au 3 quai Nord. Les deux noms sont distincts et
    // le titre doit être celui du lieu devant lequel se tient le visiteur.
    const identite = identitePublique(
      etab({
        raisonDisplay: "Chez Marcel",
        adresse: "3 quai Nord, 44000 Nantes",
        entreprise: { raisonSociale: "SARL Dupont" },
      }),
    );
    expect(identite.titre).toBe("Chez Marcel");
    expect(identite.titre).not.toBe("SARL Dupont");
  });

  it("nomme l'exploitant quand le titre ne le dit pas", () => {
    // Borne haute : l'entreprise n'est pas bannie, elle est reléguée. Quand
    // l'enseigne ne dit pas qui exploite, la taire priverait le lecteur d'un
    // renseignement qu'il n'a nulle part ailleurs sur cette page.
    const identite = identitePublique(
      etab({
        raisonDisplay: "Chez Marcel",
        entreprise: { raisonSociale: "SARL Dupont" },
      }),
    );
    expect(identite.exploitant).toBe("SARL Dupont");
  });

  it("ne répète pas l'entreprise en mono-site — elle se retire", () => {
    // Le cas de la quasi-totalité de la cible. Une répétition déplacée reste
    // une répétition : deux lignes identiques font croire à deux entités.
    const identite = identitePublique(etab());
    expect(identite.titre).toBe("Le Comptoir des Halles");
    expect(identite.exploitant).toBeNull();
  });

  it("se tait aussi quand le titre CONTIENT déjà le nom de l'entreprise", () => {
    // La forme courante d'un second établissement — « maison — site ». Le
    // nom de la société y est déjà lisible ; le redonner dessous n'ajoute
    // rien, et apprend à ne plus lire la ligne du dessous.
    const identite = identitePublique(
      etab({ raisonDisplay: "Le Comptoir des Halles — Quai Nord" }),
    );
    expect(identite.titre).toBe("Le Comptoir des Halles — Quai Nord");
    expect(identite.exploitant).toBeNull();
  });

  it("la casse, les accents et les espaces ne font pas deux entités", () => {
    // La couche voisine : sans normalisation, « LE COMPTOIR  DES HALLES »
    // saisi à l'onboarding rouvrirait la répétition qu'on vient de retirer.
    const identite = identitePublique(
      etab({
        raisonDisplay: "Café de l’Hôtel",
        entreprise: { raisonSociale: "  CAFE DE L'HOTEL " },
      }),
    );
    expect(identite.exploitant).toBeNull();
  });

  it("l'adresse reste celle de l'établissement", () => {
    // C'est elle qui distingue deux lieux d'une même maison : si elle venait
    // d'ailleurs, le reste de la correction ne servirait à rien.
    const identite = identitePublique(
      etab({ adresse: "3 quai Nord, 44000 Nantes" }),
    );
    expect(identite.adresse).toBe("3 quai Nord, 44000 Nantes");
  });

  it("ne rend aucun SIRET, sous aucun nom", () => {
    // L'arrêté du 19 avril 2017 n'en demande pas (art. 1er, neuf pièces, aucun
    // identifiant d'immatriculation), et celui de l'entreprise serait faux
    // pour tous les sites sauf un. Le type l'interdit ; ce test le dit à voix
    // haute, pour qu'un ajout « pratique » se heurte à une intention écrite.
    const identite = identitePublique(etab());
    expect(Object.keys(identite).sort()).toEqual([
      "adresse",
      "exploitant",
      "titre",
    ]);
  });
});
