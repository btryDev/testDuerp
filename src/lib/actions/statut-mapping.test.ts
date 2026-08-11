import { describe, expect, it } from "vitest";
import {
  actionVersMesureUI,
  statutActionVersUI,
  statutUIVersAction,
} from "./mapping";

/**
 * Règles de conversion de statut UI (wizard DUERP) ↔ Action (V2),
 * décrites dans ADR-002 :
 *   existante            → levee
 *   prevue + futur/nulle → ouverte
 *   prevue + passé       → en_cours
 *
 * Ce fichier testait auparavant une **copie locale** de la règle : la
 * fonction de production pouvait diverger sans qu'aucun test ne bouge.
 * Il importe désormais `./mapping`.
 *
 * Les échéances sont écrites comme Prisma les rend — minuit UTC pour une
 * date civile saisie — et l'horloge est un instant réel de la journée de
 * travail : c'est la combinaison qui révélait le défaut de bord (ADR-011).
 */

/** Date civile telle qu'elle sort de la base. */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("statut UI → Action (wizard DUERP)", () => {
  /** 21 avril 2026, 9 h à Paris (07:00 UTC). */
  const now = new Date("2026-04-21T07:00:00Z");

  it("'existante' devient 'levee' quelle que soit l'échéance", () => {
    expect(statutUIVersAction("existante", null, now)).toBe("levee");
    expect(statutUIVersAction("existante", jour("2020-01-01"), now)).toBe(
      "levee",
    );
    expect(statutUIVersAction("existante", jour("2030-01-01"), now)).toBe(
      "levee",
    );
  });

  it("'prevue' + échéance future devient 'ouverte'", () => {
    expect(statutUIVersAction("prevue", jour("2026-12-01"), now)).toBe(
      "ouverte",
    );
  });

  it("'prevue' + échéance passée devient 'en_cours'", () => {
    expect(statutUIVersAction("prevue", jour("2025-01-01"), now)).toBe(
      "en_cours",
    );
    expect(statutUIVersAction("prevue", jour("2026-04-20"), now)).toBe(
      "en_cours",
    );
  });

  it("'prevue' datée d'aujourd'hui reste 'ouverte' toute la journée", () => {
    // L'échéance vaut 02:00 à Paris : une comparaison d'horodatage la
    // déclarait dépassée dès le matin, sur une mesure créée le jour même.
    for (const horloge of [
      new Date("2026-04-21T07:00:00Z"),
      new Date("2026-04-21T21:30:00Z"),
    ]) {
      expect(statutUIVersAction("prevue", jour("2026-04-21"), horloge)).toBe(
        "ouverte",
      );
    }
  });

  it("'prevue' sans échéance devient 'ouverte'", () => {
    expect(statutUIVersAction("prevue", null, now)).toBe("ouverte");
    expect(statutUIVersAction("prevue", undefined, now)).toBe("ouverte");
  });
});

describe("Action → statut UI", () => {
  it("ne rend « existante » que pour une action levée", () => {
    expect(statutActionVersUI("levee")).toBe("existante");
    expect(statutActionVersUI("ouverte")).toBe("prevue");
    expect(statutActionVersUI("en_cours")).toBe("prevue");
    expect(statutActionVersUI("abandonnee")).toBe("prevue");
  });

  it("conserve les autres champs en traduisant le statut", () => {
    expect(actionVersMesureUI({ id: "a1", statut: "levee" as const })).toEqual({
      id: "a1",
      statut: "existante",
    });
  });
});
