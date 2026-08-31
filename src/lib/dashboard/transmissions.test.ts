import { describe, expect, it } from "vitest";
import { rapprocher } from "./transmissions";
import { supposeUnTiers } from "@/lib/prestataires/domaines";
import { genererRecommandations, type EntreeRecos } from "./recommandations";
import type { Obligation } from "@/lib/referentiels/conformite/types";

const NOW = new Date("2026-08-28T10:00:00Z");

const obligation = (o: Partial<Obligation> = {}): Obligation =>
  ({
    id: "test",
    domaine: "electricite",
    libelle: "Vérification électrique",
    referencesLegales: [{ source: "CODE_TRAVAIL", reference: "R. 0000-0" }],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    ...o,
  }) as Obligation;

const habilitation = () =>
  obligation({
    id: "habilitation",
    libelle: "Habilitation électrique du personnel",
    periodicite: "autre",
    realisateurs: ["exploitant"],
    transmet: [
      {
        vers: "salarie_designe",
        titre: null,
        motif:
          "R. 4544-10 fait délivrer l'habilitation à un travailleur désigné : l'obligation suppose une personne nommée.",
      },
    ],
  });

describe("rapprochement des transmissions (ADR-024)", () => {
  it("signale un domaine qu'aucun prestataire déclaré ne couvre", () => {
    const t = rapprocher([obligation()], [], new Set());
    expect(t.domainesSansPrestataire).toEqual([
      { domaine: "electricite", libelle: "Électricité" },
    ]);
  });

  it("se tait dès qu'un prestataire couvre le domaine", () => {
    expect(
      rapprocher([obligation()], ["electricite"], new Set()).domainesSansPrestataire,
    ).toEqual([]);
  });

  it("signale une obligation qui suppose une personne, quand aucun titre n'est déclaré", () => {
    const t = rapprocher([habilitation()], ["electricite"], new Set());
    expect(t.obligationsSupposantUnePersonne).toEqual([
      { id: "habilitation", libelle: "Habilitation électrique du personnel" },
    ]);
  });

  it("se tait dès qu'un seul titre est déclaré", () => {
    // Le seuil est délibérément à un. Au-delà, l'outil ne sait plus
    // distinguer « il n'a pas fini de saisir » de « il a saisi ce qui
    // existe » — et insister reviendrait à réclamer un titre qu'on ne sait
    // pas dire dû (ADR-023).
    expect(
      rapprocher([habilitation()], ["electricite"], new Set(["autre-titre"]))
        .obligationsSupposantUnePersonne,
    ).toEqual([]);
  });

  it("l'obligation qui ne transmet rien ne produit aucun signal de personne", () => {
    // Contre-épreuve : sans elle, une implémentation qui signalerait TOUTE
    // obligation passerait les tests précédents.
    expect(
      rapprocher([obligation()], ["electricite"], new Set())
        .obligationsSupposantUnePersonne,
    ).toEqual([]);
  });

  it("une obligation réalisée par l'exploitant ne réclame aucun prestataire", () => {
    // Le faux positif à ne jamais produire : envoyer chercher un tiers pour
    // une obligation que le dirigeant réalise lui-même.
    const t = rapprocher([obligation({ realisateurs: ["exploitant"] })], [], new Set());
    expect(t.domainesSansPrestataire).toEqual([]);
  });

  it("une obligation que l'exploitant PEUT réaliser n'en réclame pas non plus", () => {
    // Le cas que le test précédent ne couvrait pas, et le défaut qui était
    // livré : `realisateurs` est une DISJONCTION. « personne qualifiée OU
    // exploitant » veut dire que le dirigeant a le droit de faire l'acte
    // lui-même. Trois obligations réelles sont dans ce cas, dont le nettoyage
    // des circuits d'extraction (GC 21 § 2) — un restaurateur avec une hotte
    // s'entendait dire qu'aucun prestataire ne couvrait son domaine.
    const o = obligation({
      domaine: "cuisson_hotte",
      realisateurs: ["personne_qualifiee", "exploitant"],
    });
    expect(supposeUnTiers(o)).toBe(false);
    expect(rapprocher([o], [], new Set()).domainesSansPrestataire).toEqual([]);
  });

  it("une disjonction entièrement composée de tiers en réclame bien un", () => {
    // Contre-épreuve du test précédent : sans elle, un `every` qui rendrait
    // toujours faux passerait les deux.
    const o = obligation({
      realisateurs: ["personne_qualifiee", "organisme_agree"],
    });
    expect(supposeUnTiers(o)).toBe(true);
    expect(rapprocher([o], [], new Set()).domainesSansPrestataire).toEqual([
      { domaine: "electricite", libelle: "Électricité" },
    ]);
  });

  it("une transmission qui nomme son titre ne se tait que sur CE titre", () => {
    // Le faux négatif muet qu'un compte global aurait produit : un cuisinier
    // détenteur d'une attestation SST aurait fait disparaître la suggestion
    // de CACES d'un cariste.
    const o = obligation({
      id: "levage-caces",
      libelle: "Autorisation de conduite",
      transmet: [
        {
          vers: "salarie_designe",
          titre: "levage-caces-titre",
          motif:
            "Motif de test, assez long pour tenir le contrôle de substance du motif.",
        },
      ],
    });
    // Un autre titre déclaré ne doit rien éteindre.
    expect(
      rapprocher([o], ["electricite"], new Set(["sst"]))
        .obligationsSupposantUnePersonne,
    ).toHaveLength(1);
    // Le titre nommé, lui, éteint.
    expect(
      rapprocher([o], ["electricite"], new Set(["levage-caces-titre"]))
        .obligationsSupposantUnePersonne,
    ).toEqual([]);
  });
});

describe("règles 9-10 : une transmission ne passe jamais devant une urgence", () => {
  const base = (): EntreeRecos => ({
    etablissementId: "etab-x",
    verifications: [
      {
        id: "v1",
        statut: "planifiee",
        datePrevue: new Date("2026-01-01T00:00:00Z"),
        dateRealisee: null,
        libelleObligation: "Vérification en retard",
        equipementLibelle: "Tableau",
      },
    ],
    actions: [],
    nbEquipements: 3,
    duerpSecteurChoisi: true,
    nbRapports: 2,
    transmissions: {
      domainesSansPrestataire: [
        { domaine: "electricite", libelle: "Électricité" },
      ],
      obligationsSupposantUnePersonne: [
        { id: "habilitation", libelle: "Habilitation électrique" },
      ],
    },
  });

  it("le retard reste en tête", () => {
    const recs = genererRecommandations(base(), { now: NOW });
    expect(recs[0].kind).toBe("verif_depassee");
  });

  it("les deux transmissions apparaissent, derrière", () => {
    const recs = genererRecommandations(base(), { now: NOW });
    const kinds = recs.map((r) => r.kind);
    expect(kinds).toContain("transmission_prestataire");
    expect(kinds).toContain("transmission_salarie");
    expect(kinds.indexOf("transmission_prestataire")).toBeGreaterThan(0);
  });

  it("le prestataire passe devant le salarié", () => {
    const recs = genererRecommandations(base(), { now: NOW });
    expect(recs.indexOf(recs.find((r) => r.kind === "transmission_salarie")!)).
      toBeGreaterThan(
        recs.indexOf(recs.find((r) => r.kind === "transmission_prestataire")!),
      );
  });

  it("aucune transmission déclarée, aucune ligne", () => {
    // Contre-épreuve du bloc : sans elle, des règles qui pousseraient
    // toujours deux lignes passeraient tout ce qui précède.
    const e = base();
    e.transmissions = {
      domainesSansPrestataire: [],
      obligationsSupposantUnePersonne: [],
    };
    const kinds = genererRecommandations(e, { now: NOW }).map((r) => r.kind);
    expect(kinds).not.toContain("transmission_prestataire");
    expect(kinds).not.toContain("transmission_salarie");
  });

  it("les liens pointent là où le geste se fait", () => {
    const recs = genererRecommandations(base(), { now: NOW });
    expect(recs.find((r) => r.kind === "transmission_prestataire")?.href).toBe(
      "/etablissements/etab-x/prestataires",
    );
    expect(recs.find((r) => r.kind === "transmission_salarie")?.href).toBe(
      "/etablissements/etab-x/equipe",
    );
  });
});
