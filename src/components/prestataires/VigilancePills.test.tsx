// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { VigilancePiecePill } from "./VigilancePills";
import { MENTION_ANCRAGE_URSSAF } from "@/lib/prestataires/vigilance";

afterEach(cleanup);

/**
 * Ce que la pastille montre réellement, et non ce que le code laisse penser.
 *
 * `vigilance.test.ts` tient la règle : aucune surface n'affiche
 * `urssafExpireDans` sans lire `urssafPlafonneeParLeSemestre`. Elle le tient
 * en lisant des fichiers, ce qui prouve qu'une prop est passée — pas qu'elle
 * arrive à l'écran. Ces deux-là rendent le composant.
 *
 * L'enjeu est le voisinage des deux lignes : « Expire dans 12 j » et la
 * mention doivent se lire ensemble, sans quoi le chiffre reste seul et
 * continue de se lire comme une échéance de la pièce.
 */
describe("la pastille de vigilance dit d'où l'échéance est comptée", () => {
  it("montre l'échéance et sa provenance sur la même pièce", () => {
    render(
      <VigilancePiecePill
        libelle="Attestation URSSAF"
        statut="expire_bientot"
        jours={12}
        mention={MENTION_ANCRAGE_URSSAF}
      />,
    );
    expect(screen.getByText("Expire dans 12 j")).toBeTruthy();
    expect(screen.getByText(MENTION_ANCRAGE_URSSAF)).toBeTruthy();
  });

  it("ne dit rien quand la date saisie décide", () => {
    // La borne haute : une mention posée sur toutes les pièces cesserait de
    // signaler quoi que ce soit, et ferait douter d'une RC Pro dont la date
    // est celle de la police.
    render(
      <VigilancePiecePill libelle="RC Pro" statut="a_jour" jours={200} />,
    );
    expect(screen.queryByText(MENTION_ANCRAGE_URSSAF)).toBeNull();
  });
});
