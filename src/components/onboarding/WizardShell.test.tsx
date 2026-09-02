// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

/**
 * Ce que le parcours de création ne doit PAS faire.
 *
 * Le point le plus cher est le premier : un formulaire qui couvre trois
 * étapes et ne se soumet qu'à la dernière. Le bouton de droite est le **même
 * nœud DOM** d'une étape à l'autre — React réconcilie par position, seul le
 * `type` du `<button>` change —, et l'« activation behavior » d'un bouton lit
 * son `type` APRÈS que les écouteurs de clic ont tourné. Vérifié en jsdom :
 *
 *   const b = document.createElement("button");   // type="button"
 *   b.addEventListener("click", () => { b.type = "submit"; });
 *   b.click();                                    // → le formulaire part
 *
 * Un clic sur « Suivant » à l'étape 2 laisse donc, sous le curseur, un bouton
 * « Créer mon espace » que le navigateur peut activer dans la foulée : étape 3
 * affichée, espace déjà en création, résumé jamais lu. C'est le symptôme
 * rapporté une fois par la vérification visuelle.
 *
 * Ce qui n'a PAS été établi : que le rendu React s'intercale bien avant
 * l'activation, dans un vrai navigateur. `element.click()` appelé depuis un
 * script ne vide jamais la pile JS, donc le point de contrôle des microtâches
 * — où React déverse ses mises à jour synchrones — ne tombe pas au milieu de
 * la propagation, et la séquence complète ne se reproduit pas ici. On ne
 * corrige donc pas un mécanisme supposé : on tient l'invariant, qui est vrai
 * quelle que soit la cause. Une soumission qui ne vient pas de l'étape 3 n'a
 * pas lieu — le test l'établit en provoquant la soumission directement.
 */

const appels: string[] = [];

vi.mock("@/lib/onboarding/actions", () => ({
  finaliserOnboarding: async () => {
    appels.push("creation");
    return { status: "idle" as const };
  },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {} }),
}));

import { WizardShell } from "./WizardShell";

afterEach(cleanup);
beforeEach(() => {
  appels.length = 0;
  // jsdom n'a pas de mise en page, donc pas de `scrollIntoView`. Le bouchon
  // est ici et non dans le composant : amener le refus sous les yeux est le
  // comportement voulu, pas une précaution à rendre conditionnelle.
  Element.prototype.scrollIntoView = () => {};
});

/** Saisit dans un champ contrôlé par React, comme le ferait une frappe. */
function saisir(label: RegExp | string, valeur: string) {
  const el = screen.getByLabelText(label) as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )!.set!;
  setter.call(el, valeur);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function remplirEtape1() {
  saisir(/Raison sociale/, "Bistrot du marché");
  saisir(/Numéro et rue/, "12 rue des Halles");
  saisir(/Code postal/, "75011");
  saisir(/^Ville/, "Paris");
  saisir(/Code NAF/, "56.10A");
  saisir(/Effectif travailleur/, "8");
}

const souffler = () => new Promise((r) => setTimeout(r, 30));

describe("le formulaire ne se soumet qu'à la dernière étape", () => {
  it("une soumission provoquée à l'étape 1 ne crée rien", async () => {
    const { container } = render(<WizardShell />);
    const form = container.querySelector("form")!;

    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    await souffler();

    expect(appels).toEqual([]);
    // Et on est toujours à l'étape 1 : rien n'a bougé sous l'utilisateur.
    expect(screen.getByText(/Décrivez votre établissement/)).toBeTruthy();
  });

  it("une soumission provoquée à l'étape 2 ne crée rien", async () => {
    const { container } = render(<WizardShell />);
    remplirEtape1();
    await souffler();
    screen.getByRole("button", { name: /Suivant/ }).click();
    await souffler();
    expect(screen.getByText(/Quelques questions/)).toBeTruthy();

    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await souffler();

    expect(appels).toEqual([]);
  });

  it("la même soumission, à l'étape 3, crée l'espace", async () => {
    // La borne haute du même garde-fou : sans elle, le test passerait aussi
    // sur un formulaire qui ne se soumet jamais.
    const { container } = render(<WizardShell />);
    remplirEtape1();
    await souffler();
    screen.getByRole("button", { name: /Suivant/ }).click();
    await souffler();
    screen.getByRole("button", { name: /Suivant/ }).click();
    await souffler();
    expect(screen.getByRole("button", { name: /Créer mon espace/ })).toBeTruthy();

    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await souffler();

    expect(appels).toEqual(["creation"]);
  });
});

describe("le refus de périmètre ferme la porte avant le clic", () => {
  it("cinquante et un salariés : « Suivant » est désactivé", async () => {
    render(<WizardShell />);
    remplirEtape1();
    saisir(/Effectif travailleur/, "51");
    await souffler();

    const suivant = screen.getByRole("button", {
      name: /Suivant/,
    }) as HTMLButtonElement;
    expect(suivant.disabled).toBe(true);
  });

  it("cinquante salariés : elle reste ouverte", async () => {
    render(<WizardShell />);
    remplirEtape1();
    saisir(/Effectif travailleur/, "50");
    await souffler();

    expect(
      (screen.getByRole("button", { name: /Suivant/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("un champ oublié, lui, laisse le bouton actif — c'est le clic qui l'apprend", async () => {
    // La couche voisine : si le bouton se désactivait à la moindre erreur,
    // l'utilisateur n'aurait plus aucun moyen d'apprendre ce qui manque.
    render(<WizardShell />);
    await souffler();

    const suivant = screen.getByRole("button", {
      name: /Suivant/,
    }) as HTMLButtonElement;
    expect(suivant.disabled).toBe(false);

    suivant.click();
    await souffler();
    expect(screen.getByText(/Indiquez la raison sociale/)).toBeTruthy();
  });
});

describe("le refus se rend au champ qu'il vise", () => {
  it("étape 2 : « Précisez le type de votre ERP » est rendu au champ", async () => {
    render(<WizardShell />);
    remplirEtape1();
    await souffler();
    screen.getByRole("button", { name: /Suivant/ }).click();
    await souffler();

    // « Oui » à l'ERP, sans choisir de type.
    const cartes = screen.getAllByRole("button", { name: "Oui" });
    cartes[0].click();
    await souffler();
    screen.getByRole("button", { name: /Suivant/ }).click();
    await souffler();

    const message = screen.getByText(/Précisez le type de votre ERP/);
    const select = screen.getByLabelText("Type d'ERP");
    // Le message vit dans le même bloc que le champ, pas en pied de colonne.
    expect(select.parentElement!.contains(message)).toBe(true);
  });
});
