import { describe, expect, it } from "vitest";
import { lignesAFaire, type FicheEquipement } from "./fiche";

/** Dates civiles à minuit UTC, horloge à un instant réel (ADR-011). */
const jour = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** 20 août 2026, 9 h à Paris. */
const AUJOURDHUI = new Date("2026-08-20T07:00:00Z");

/**
 * Une fiche réduite à ce que `lignesAFaire` regarde. Le type complet vient
 * de Prisma et porte trente colonnes dont aucune ne compte ici.
 */
function fiche(
  verifs: Array<{
    id: string;
    datePrevue: string;
    dateRealisee?: string;
    statut?: string;
    periodicite?: string;
  }>,
): FicheEquipement {
  return {
    verifications: verifs.map((v) => ({
      id: v.id,
      libelleObligation: "Vérification annuelle des extincteurs",
      statut: v.statut ?? "planifiee",
      datePrevue: jour(v.datePrevue),
      dateRealisee: v.dateRealisee ? jour(v.dateRealisee) : null,
      periodicite: v.periodicite ?? "annuelle",
      rapports: [],
      actions: [],
    })),
  } as unknown as FicheEquipement;
}

describe("lignesAFaire", () => {
  it("garde le rendez-vous suivant d'un cycle soldé", () => {
    // Le cœur du bug : une `Verification` soldée porte à la fois la
    // réalisation passée et la prochaine échéance (ADR-010). En écartant
    // les lignes « faites », la fiche d'un appareil parfaitement suivi
    // affichait « aucune échéance ouverte » pendant que le calendrier
    // montrait le rendez-vous de l'an prochain.
    const lignes = lignesAFaire(
      fiche([
        {
          id: "v1",
          datePrevue: "2027-01-22",
          dateRealisee: "2026-01-22",
          statut: "realisee_conforme",
        },
      ]),
      "/etablissements/e1",
      AUJOURDHUI,
    );

    expect(lignes).toHaveLength(1);
    expect(lignes[0].date).toEqual(jour("2027-01-22"));
    expect(lignes[0].etat).toBe("lointain");
    expect(lignes[0].href).toBe("/etablissements/e1/verifications/v1");
  });

  it("ne fabrique pas de rendez-vous là où le cycle n'en a pas", () => {
    // Sans périodicité, `datePrevue` est l'ancienne échéance, pas un
    // engagement : rien ne reste à faire.
    const lignes = lignesAFaire(
      fiche([
        {
          id: "v1",
          datePrevue: "2026-01-22",
          dateRealisee: "2026-01-22",
          statut: "realisee_conforme",
          periodicite: "mise_en_service_uniquement",
        },
      ]),
      "/etablissements/e1",
      AUJOURDHUI,
    );

    expect(lignes).toEqual([]);
  });

  it("range les datées avant les sans-date, et le retard en tête", () => {
    const lignes = lignesAFaire(
      fiche([
        { id: "v1", datePrevue: "2027-03-01" },
        { id: "v2", datePrevue: "2026-06-01" },
        { id: "v3", datePrevue: "2028-01-01", statut: "a_planifier" },
      ]),
      "/etablissements/e1",
      AUJOURDHUI,
    );

    expect(lignes.map((l) => l.etat)).toEqual([
      "enRetard",
      "lointain",
      "aPlanifier",
    ]);
    // Une occurrence à planifier ne porte pas de date : la sienne est une
    // date de génération, pas un rendez-vous.
    expect(lignes[2].date).toBeNull();
  });
});
