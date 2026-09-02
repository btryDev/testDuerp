// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { PrescriptionActionState } from "@/lib/prescriptions/actions";
import { PrescriptionForm } from "./PrescriptionForm";

/**
 * Le champ et le bandeau disent la même chose, toujours.
 *
 * React 19 remet un `<form action={…}>` à blanc dès que l'action rend la
 * main. Le `<select>` piloté par l'état ne suivait pas : après un
 * enregistrement, il revenait à « Arrêté préfectoral » pendant que le bandeau
 * ambre « Engagement d'assurance… » restait affiché en dessous. L'un des deux
 * est le marquage que l'ADR-032 rend obligatoire ; l'autre dit qu'il ne
 * s'applique pas.
 */

afterEach(cleanup);

const obligations = [
  { id: "o1", libelle: "Vérification annuelle", periodicite: "annuelle" },
];
const equipements = [
  { id: "eq1", libelle: "Extincteur hall", categorie: "extincteur" },
];

function rendre(
  issue: PrescriptionActionState = { status: "success", prescriptionId: "p1" },
) {
  return render(
    <PrescriptionForm
      action={async () => issue}
      obligations={obligations}
      equipements={equipements}
    />,
  );
}

function choisirSource(valeur: string) {
  const select = screen.getByLabelText(/Nature de l'acte/) as HTMLSelectElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLSelectElement.prototype,
    "value",
  )!.set!;
  setter.call(select, valeur);
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return select;
}

const souffler = () => new Promise((r) => setTimeout(r, 40));

describe("le marquage contractuel suit le champ qui le déclenche", () => {
  it("après enregistrement, le champ ET le bandeau repartent ensemble", async () => {
    const { container } = rendre();
    const select = choisirSource("demande_assureur");
    await souffler();
    expect(screen.getByText(/Engagement d'assurance/)).toBeTruthy();

    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await souffler();

    const apres = screen.getByLabelText(
      /Nature de l'acte/,
    ) as HTMLSelectElement;
    expect(apres.value).toBe("arrete_prefectoral");
    expect(screen.queryByText(/Engagement d'assurance/)).toBeNull();
    // Le champ a bien été reconstruit : c'est le remontage qui remet les deux
    // d'accord, pas une remise à zéro de l'un des deux.
    expect(apres).not.toBe(select);
  });

  it("après un refus, le champ ET le bandeau gardent le choix ensemble", async () => {
    const { container } = rendre({
      status: "error",
      message: "Formulaire invalide",
      fieldErrors: { dateDocument: ["Format attendu : AAAA-MM-JJ"] },
    });
    choisirSource("demande_assureur");
    await souffler();

    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await souffler();

    const apres = screen.getByLabelText(
      /Nature de l'acte/,
    ) as HTMLSelectElement;
    expect(apres.value).toBe("demande_assureur");
    expect(screen.getByText(/Engagement d'assurance/)).toBeTruthy();
  });
});

describe("un assureur n'est pas une autorité (ADR-032)", () => {
  it("le champ s'appelle « Autorité » pour un acte d'autorité", () => {
    rendre();
    expect(screen.getByLabelText("Autorité")).toBeTruthy();
  });

  it("et « Assureur » quand la source est contractuelle", async () => {
    rendre();
    choisirSource("demande_assureur");
    await souffler();
    expect(screen.getByLabelText("Assureur")).toBeTruthy();
    expect(screen.queryByLabelText("Autorité")).toBeNull();
  });
});
