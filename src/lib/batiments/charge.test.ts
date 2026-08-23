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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { repartirVerifications } from "@/lib/pdf/etat-verifications";

const h = vi.hoisted(() => {
  const db = {
    batiments: [] as Array<Record<string, unknown>>,
    verifs: [] as Array<Record<string, unknown>>,
    requetes: [] as unknown[],
  };
  const prisma = {
    batiment: { findMany: async () => db.batiments },
    verification: {
      findMany: async (args: unknown) => {
        db.requetes.push(args);
        return db.verifs;
      },
    },
  };
  return { db, prisma, requireUser: vi.fn(async () => ({ id: "user-1" })) };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/auth/require-user", () => ({ requireUser: h.requireUser }));

const { listerBatimentsAvecCharge } = await import("./queries");

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


/**
 * La composition, et pas seulement le prédicat.
 *
 * Ce qui manquait au fichier : les cas ci-dessus éprouvent
 * `repartirVerifications`, déjà couvert ailleurs. Le défaut qu'ils ne
 * pouvaient pas voir vit **entre** la requête et lui — un `select` qui
 * n'emporte pas de quoi reconnaître une ligne archivée, un regroupement qui
 * perd ou double une occurrence. C'est là que deux écrans se mettent à
 * annoncer deux nombres.
 */
describe("listerBatimentsAvecCharge", () => {
  const RESERVE = "b-reserve";
  const PRINCIPAL = "b-principal";

  const ligne = (
    batimentId: string,
    datePrevue: string,
    libelleObligation = "Vérification annuelle",
  ) => ({
    statut: "planifiee",
    datePrevue: new Date(datePrevue),
    dateRealisee: null,
    libelleObligation,
    equipement: { batimentId },
  });

  beforeEach(() => {
    h.db.requetes = [];
    h.db.batiments = [
      { id: PRINCIPAL, nom: "Bâtiment principal", complementAdresse: null, ordre: 0, _count: { equipements: 4 } },
      { id: RESERVE, nom: "Réserve", complementAdresse: null, ordre: 1, _count: { equipements: 1 } },
    ];
    h.db.verifs = [];
  });

  it("ventile les retards par bâtiment sans en perdre ni en doubler", async () => {
    h.db.verifs = [
      ligne(PRINCIPAL, "2026-08-20T00:00:00+02:00"),
      ligne(PRINCIPAL, "2026-08-19T00:00:00+02:00"),
      ligne(RESERVE, "2026-08-18T00:00:00+02:00"),
      ligne(RESERVE, "2026-09-10T00:00:00+02:00"),
    ];

    const charge = await listerBatimentsAvecCharge("etab-1", NOW);
    const parId = new Map(charge.map((b) => [b.id, b.nbEnRetard]));

    expect(parId.get(PRINCIPAL)).toBe(2);
    expect(parId.get(RESERVE)).toBe(1);
    // La somme des cartes est le nombre de l'établissement : c'est l'égalité
    // que le hero met côte à côte, et c'est elle qui doit tenir.
    const somme = charge.reduce((n, b) => n + b.nbEnRetard, 0);
    const toutes = h.db.verifs as unknown as Array<{
      statut: string;
      datePrevue: Date;
      dateRealisee: Date | null;
    }>;
    expect(somme).toBe(repartirVerifications(toutes, NOW).enRetard.length);
  });

  it("une ligne archivée ne pèse sur aucune carte", async () => {
    // Le `select` doit emporter `libelleObligation`, sinon le marqueur
    // d'archivage (ADR-012) est invisible ici et la carte compte un retard
    // que le calendrier ne compte pas.
    h.db.verifs = [
      ligne(RESERVE, "2026-08-18T00:00:00+02:00", "Ne s'applique plus — Désenfumage"),
    ];

    const charge = await listerBatimentsAvecCharge("etab-1", NOW);

    expect(charge.find((b) => b.id === RESERVE)?.nbEnRetard).toBe(0);
    const args = h.db.requetes[0] as { select: Record<string, unknown> };
    expect(
      args.select.libelleObligation,
      "sans ce champ, la carte ne peut pas reconnaître une ligne archivée",
    ).toBe(true);
  });

  it("un bâtiment sans occurrence est à jour, pas absent", async () => {
    h.db.verifs = [ligne(PRINCIPAL, "2026-08-20T00:00:00+02:00")];

    const charge = await listerBatimentsAvecCharge("etab-1", NOW);

    expect(charge.map((b) => b.id)).toEqual([PRINCIPAL, RESERVE]);
    expect(charge.find((b) => b.id === RESERVE)?.nbEnRetard).toBe(0);
  });

  it("borne la lecture au parc en service et au dossier du user", async () => {
    // Sans RLS (ADR-005), l'isolation est applicative : une lecture qui ne
    // porte pas le prédicat d'appartenance est une convention rompue.
    await listerBatimentsAvecCharge("etab-1", NOW);

    const args = h.db.requetes[0] as { where: Record<string, unknown> };
    expect(args.where).toMatchObject({
      etablissementId: "etab-1",
      etablissement: { entreprise: { userId: "user-1" } },
      equipement: { actif: true },
    });
  });
});
