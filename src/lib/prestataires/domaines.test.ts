import { describe, expect, it } from "vitest";
import { obligationsConformite } from "@/lib/referentiels/conformite";
import {
  DOMAINES_PRESTATAIRE_ATTENDUS,
  domainesSansPrestataire,
  supposeUnTiers,
} from "./domaines";
import { LABEL_DOMAINE as LABEL_PRESTATAIRE } from "./schema";
import type { Obligation } from "@/lib/referentiels/conformite/types";

const obligation = (o: Partial<Obligation> = {}): Obligation =>
  ({
    id: "test",
    domaine: "electricite",
    libelle: "Test",
    referencesLegales: [{ source: "CODE_TRAVAIL", reference: "R. 0000-0" }],
    periodicite: "annuelle",
    realisateurs: ["organisme_agree"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
    ...o,
  }) as Obligation;

describe("correspondance domaine d'obligation → domaine de prestataire", () => {
  it("chaque domaine de prestataire attendu porte un libellé", () => {
    // Le `Record` exhaustif garantit qu'aucun domaine d'obligation n'est
    // oublié ; celui-ci garantit que la contrepartie citée existe vraiment
    // côté annuaire et sait se nommer à l'écran. `froid` est arrivé au
    // référentiel sans contrepartie et personne ne l'a vu pendant des mois.
    for (const [domaine, attendus] of Object.entries(
      DOMAINES_PRESTATAIRE_ATTENDUS,
    )) {
      expect(attendus.length, domaine).toBeGreaterThan(0);
      for (const d of attendus) {
        expect(LABEL_PRESTATAIRE[d], `${domaine} → ${d}`).toBeTruthy();
      }
    }
  });

  it("tout domaine cité par une obligation réelle a une contrepartie", () => {
    // Contre-épreuve sur le référentiel livré, pas sur des cas construits :
    // le `Record` pourrait être exhaustif au sens du type et vide de sens.
    for (const o of obligationsConformite) {
      expect(
        DOMAINES_PRESTATAIRE_ATTENDUS[o.domaine],
        `${o.id} (${o.domaine})`,
      ).toBeDefined();
    }
  });

  it("une obligation réalisée par l'exploitant n'appelle aucun prestataire", () => {
    // LE faux positif à ne pas produire. Signaler « aucun prestataire ne
    // couvre ce domaine » sur une obligation que le dirigeant réalise
    // lui-même l'enverrait chercher un tiers dont il n'a pas besoin.
    const o = obligation({ realisateurs: ["exploitant"] });
    expect(supposeUnTiers(o)).toBe(false);
    expect(domainesSansPrestataire([o], [])).toEqual([]);
  });

  it("un domaine sans prestataire déclaré est signalé", () => {
    expect(domainesSansPrestataire([obligation()], [])).toEqual([
      "electricite",
    ]);
  });

  it("un prestataire du bon domaine éteint le signal", () => {
    expect(domainesSansPrestataire([obligation()], ["electricite"])).toEqual([]);
  });

  it("un bureau de contrôle couvre les domaines qu'il contrôle", () => {
    // Sans ça, un dirigeant qui a déclaré son bureau de contrôle — celui qui
    // fait précisément la vérification — s'entendrait dire qu'il n'a personne.
    expect(domainesSansPrestataire([obligation()], ["bureau_controle"])).toEqual(
      [],
    );
  });

  it("un prestataire d'un autre domaine ne l'éteint pas", () => {
    // Contre-épreuve : sans elle, une implémentation qui ne signale jamais
    // rien passerait les trois tests précédents.
    expect(domainesSansPrestataire([obligation()], ["nettoyage"])).toEqual([
      "electricite",
    ]);
  });

  it("le froid a bien une contrepartie, et ce n'est pas l'entretien général", () => {
    // Le cas qui a motivé la valeur d'enum. Le rabattre sur
    // `entretien_general` aurait compilé et menti : le contrôle d'étanchéité
    // exige un opérateur CERTIFIÉ (règlement (UE) 2024/573).
    expect(DOMAINES_PRESTATAIRE_ATTENDUS.froid).toContain("froid");
    expect(DOMAINES_PRESTATAIRE_ATTENDUS.froid).not.toContain(
      "entretien_general",
    );
  });
});
