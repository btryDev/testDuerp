// La charge affichée sur une carte-bâtiment du hero.
//
// `listerBatimentsAvecCharge` ouvre la base ; ce qu'on vérifie ici est la
// seule chose qui pourrait diverger silencieusement : que le comptage passe
// bien par `repartirVerifications`, donc par les prédicats canoniques
// (ADR-011), et non par une septième définition maison du retard.
//
// Le cas qui a motivé ce test : une échéance datée d'AUJOURD'HUI n'est jamais
// en retard — le retard commence à minuit, heure de Paris, le lendemain. Une
// comparaison naïve `datePrevue < now` la compte en retard dès 00h01, et la
// carte annonce « 1 à traiter » à quelqu'un qui a toute sa journée.

import { describe, expect, it } from "vitest";
import { repartirVerifications } from "@/lib/pdf/etat-verifications";

const NOW = new Date("2026-08-21T14:30:00+02:00");

function verif(datePrevue: string, statut = "planifiee") {
  return { statut, datePrevue: new Date(datePrevue), dateRealisee: null };
}

describe("charge d'un bâtiment", () => {
  it("ne compte pas en retard une échéance du jour même", () => {
    const etat = repartirVerifications([verif("2026-08-21T00:00:00+02:00")], NOW);
    expect(etat.enRetard).toHaveLength(0);
  });

  it("compte en retard l'échéance de la veille", () => {
    const etat = repartirVerifications([verif("2026-08-20T00:00:00+02:00")], NOW);
    expect(etat.enRetard).toHaveLength(1);
  });

  it("ne compte pas une occurrence déjà réalisée", () => {
    const etat = repartirVerifications(
      [
        {
          statut: "realisee_conforme",
          datePrevue: new Date("2026-07-01T00:00:00+02:00"),
          dateRealisee: new Date("2026-07-02T00:00:00+02:00"),
        },
      ],
      NOW,
    );
    expect(etat.enRetard).toHaveLength(0);
  });

  it("range dans « sous 30 jours » ce qui tombe dans l'horizon proche", () => {
    const etat = repartirVerifications([verif("2026-09-10T00:00:00+02:00")], NOW);
    expect(etat.aVenir).toHaveLength(1);
    expect(etat.enRetard).toHaveLength(0);
  });

  it("laisse hors des deux compteurs une échéance lointaine", () => {
    // Ni un retard, ni un engagement de la période : la carte n'en dit rien.
    const etat = repartirVerifications([verif("2027-03-01T00:00:00+01:00")], NOW);
    expect(etat.enRetard).toHaveLength(0);
    expect(etat.aVenir).toHaveLength(0);
  });

  it("répartit sans double compte — les ensembles sont disjoints", () => {
    const etat = repartirVerifications(
      [
        verif("2026-08-20T00:00:00+02:00"),
        verif("2026-09-10T00:00:00+02:00"),
        verif("2026-08-21T00:00:00+02:00"),
      ],
      NOW,
    );
    const somme =
      etat.enRetard.length +
      etat.aPlanifier.length +
      etat.aVenir.length +
      etat.realisees12m.length;
    expect(somme).toBe(etat.total);
  });
});
