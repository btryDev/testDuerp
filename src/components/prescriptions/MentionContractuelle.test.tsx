// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MentionContractuelle } from "./MentionContractuelle";
import { PastilleFiche } from "@/components/ui-kit/fiche/PastilleFiche";
import { CHAMP_ETAT, ENCRE_ETAT } from "@/lib/calendrier/etats";

afterEach(cleanup);

/**
 * Ce que ces tests gardent : le marquage contractuel (ADR-032) et les
 * pastilles d'état du calendrier ne peuvent pas porter la même peinture.
 *
 * Ils se posent côte à côte — sur la fiche d'une vérification, « Engagement
 * d'assurance » et « Échéance aujourd'hui » sont voisins dans le même
 * `HeroFiche`. Ils portaient le même champ plein et la même encre : seule la
 * casse les séparait. Or l'un dit une urgence de calendrier, l'autre dit que
 * la ligne ne vient pas du droit. Deux propos sans rapport, une seule
 * peinture.
 *
 * On compare les CLASSES de champ et d'encre, pas la couleur calculée :
 * jsdom ne charge pas Tailwind, et c'est de toute façon la classe qui décide.
 */
function classesDe(racine: HTMLElement): string[] {
  const el = racine.querySelector("span");
  if (!el) throw new Error("aucune pastille rendue");
  return [...el.classList];
}

const champ = (classes: string[]) => classes.filter((c) => c.startsWith("bg-"));
const encre = (classes: string[]) =>
  classes.filter((c) => c.startsWith("text-[color:"));

const marquage = () => classesDe(render(<MentionContractuelle />).container);

const pastilleProche = () =>
  classesDe(
    render(
      <PastilleFiche ton="proche">Échéance aujourd&apos;hui</PastilleFiche>,
    ).container,
  );

describe("MentionContractuelle — la peinture", () => {
  it("ne porte pas le champ de l'état « proche »", () => {
    // La collision exacte qui a été corrigée : `bg-[color:var(--board-amber)]`
    // des deux côtés, sur la même fiche, à trois centimètres l'un de l'autre.
    expect(champ(marquage())).not.toEqual(champ(pastilleProche()));
  });

  it("ne porte le champ d'AUCUN état du calendrier", () => {
    // Borne haute : glisser de l'ambre vers le bleu ou l'ardoise recréerait la
    // même confusion avec un autre état. La table des états est la source
    // unique — on la lit, on ne recopie pas une liste qui se réparerait en
    // recopiant.
    const champs = champ(marquage());
    for (const valeur of Object.values(CHAMP_ETAT)) {
      expect(champs).not.toContain(`bg-[color:${valeur}]`);
    }
  });

  it("reste dans la famille ambre, et n'emprunte pas le rouge du retard", () => {
    // Borne basse : la correction ne doit pas se payer d'un glissement vers le
    // signal. Une échéance d'assurance n'est ni en retard ni fautive
    // (ADR-032), et c'est l'argument que le composant porte depuis l'origine.
    const classes = marquage().join(" ");
    expect(classes).toContain("--board-amber");
    expect(classes).not.toContain("--board-signal");
  });

  it("garde une encre, et pas seulement un champ", () => {
    // « Un champ, une encre, jamais l'un sans l'autre » (charte § 1.5). Un
    // voile pâle sans encre déclarée hériterait de la couleur du texte
    // voisin, qui n'est pas la même sur les huit surfaces qui l'affichent.
    expect(encre(marquage())).toEqual([`text-[color:${ENCRE_ETAT.proche}]`]);
  });
});
