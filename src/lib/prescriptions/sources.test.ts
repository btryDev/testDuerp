import { describe, expect, it } from "vitest";
import {
  LABEL_SOURCE_PRESCRIPTION,
  MARQUAGE_CONTRACTUEL,
  SOURCES_PRESCRIPTION,
  estEcheanceContractuelle,
  estSourceContractuelle,
} from "./sources";

/**
 * ADR-032. Ce que ces tests protègent tient en une phrase : le produit peut
 * recevoir une demande d'assureur, et il ne peut jamais la servir comme du
 * droit.
 *
 * Trois couches, séparées à dessein — une liste exhaustive des six sources se
 * réparerait en la recopiant, et cesserait alors de vérifier quoi que ce soit.
 */

describe("sources de prescription — la borne basse", () => {
  it("la demande d'assureur est contractuelle", () => {
    expect(estSourceContractuelle("demande_assureur")).toBe(true);
  });

  it("le marquage nomme les deux moitiés : ce que la ligne engage, et ce qu'elle n'engage pas", () => {
    // Un marquage qui dirait seulement « engagement d'assurance » laisserait
    // le lecteur libre de supposer que c'est aussi une obligation légale.
    expect(MARQUAGE_CONTRACTUEL.toLowerCase()).toContain("assurance");
    expect(MARQUAGE_CONTRACTUEL.toLowerCase()).toContain(
      "pas une obligation légale",
    );
  });
});

describe("sources de prescription — la borne haute", () => {
  it("une seule source est contractuelle, et c'est la demande d'assureur", () => {
    // Ce test tombe dans les deux sens : si un acte d'autorité entre dans la
    // liste contractuelle — un arrêté préfectoral marqué « engagement
    // d'assurance » sous-dirait une obligation réelle —, et si la demande
    // d'assureur en sort, ce qui la ferait passer pour du droit. C'est la
    // ligne que l'ADR-032 refuse de franchir dans les deux directions.
    expect(SOURCES_PRESCRIPTION.filter(estSourceContractuelle)).toEqual([
      "demande_assureur",
    ]);
  });

  it("une source inconnue n'est pas contractuelle", () => {
    // Le prédicat accepte `string` : une valeur venue d'une lecture qui a
    // dérivé doit répondre « non », pas faire tomber un rendu. L'erreur va
    // alors dans le sens visible — la ligne s'affiche sans marquage, et son
    // libellé de source, lui, ne compile pas s'il manque.
    expect(estSourceContractuelle("arrete_du_prefet_de_police")).toBe(false);
    expect(estSourceContractuelle("")).toBe(false);
  });
});

describe("sources de prescription — la couche voisine", () => {
  it("chaque source a un libellé, et aucun n'est vide", () => {
    // Le cliquet réel est le type (`Record<SourcePrescription, string>`) :
    // une source sans libellé ne compile pas. Ce test attrape ce que le type
    // laisse passer — une entrée présente mais vide, qui afficherait un
    // sélecteur muet.
    for (const s of SOURCES_PRESCRIPTION) {
      expect(LABEL_SOURCE_PRESCRIPTION[s].trim().length).toBeGreaterThan(0);
    }
  });

  it("une échéance sans prescription n'est jamais marquée", () => {
    expect(estEcheanceContractuelle({ prescription: null })).toBe(false);
    expect(estEcheanceContractuelle({})).toBe(false);
  });

  it("une échéance née d'un acte d'autorité n'est jamais marquée", () => {
    expect(
      estEcheanceContractuelle({
        prescription: { source: "arrete_prefectoral" },
      }),
    ).toBe(false);
  });

  it("une échéance née d'une demande d'assureur est marquée", () => {
    expect(
      estEcheanceContractuelle({
        prescription: { source: "demande_assureur" },
      }),
    ).toBe(true);
  });
});
