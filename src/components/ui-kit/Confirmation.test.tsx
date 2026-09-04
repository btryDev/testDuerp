// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useConfirmation } from "./Confirmation";

/**
 * Ce que la carte doit tenir, et que la garde `confirmations-natives` ne voit
 * pas : elle interdit `confirm()`, elle ne dit rien de ce qu'on met à la place.
 *
 * Deux propriétés, et la seconde est celle qui se perd en premier quand la
 * question se réécrit à la main dans chaque bouton — c'est arrivé à
 * l'onboarding, dont « Quitter sans enregistrer » sortait en pilule pleine.
 */

afterEach(cleanup);

function Ecran({ alors }: { alors: () => void }) {
  const { demander, confirmation } = useConfirmation();
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          demander({
            titre: "Supprimer cet établissement et tout ce qu'il porte ?",
            detail: "Ses équipements et ses rapports partent avec lui.",
            agir: "Supprimer l'établissement",
            alors,
          })
        }
      >
        Supprimer
      </button>
      {confirmation}
    </div>
  );
}

const souffler = () => new Promise((r) => setTimeout(r, 0));

describe("la question est un nœud de la page", () => {
  it("le clic n'appelle aucune boîte native, et n'agit pas tout de suite", async () => {
    // La borne basse : sans elle, un composant qui agirait sans rien demander
    // passerait ce fichier de bout en bout.
    const natif = vi.fn(() => true);
    vi.stubGlobal("confirm", natif);
    const agi = vi.fn();

    render(<Ecran alors={agi} />);
    screen.getByRole("button", { name: "Supprimer" }).click();
    await souffler();

    expect(natif).not.toHaveBeenCalled();
    expect(agi).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog").textContent).toMatch(
      /Supprimer cet établissement/,
    );
    vi.unstubAllGlobals();
  });

  it("la porte de sortie referme sans agir, celle qui détruit agit une fois", async () => {
    const agi = vi.fn();
    render(<Ecran alors={agi} />);
    screen.getByRole("button", { name: "Supprimer" }).click();
    await souffler();

    screen.getByRole("button", { name: "Ne rien changer" }).click();
    await souffler();
    expect(agi).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();

    screen.getByRole("button", { name: "Supprimer" }).click();
    await souffler();
    screen.getByRole("button", { name: "Supprimer l'établissement" }).click();
    await souffler();
    expect(agi).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});

describe("l'emphase ne va jamais à la porte qui détruit", () => {
  it("la sortie est pleine et prend le focus, l'action destructrice est un contour", async () => {
    // C'est la réserve relevée sur l'onboarding, et la raison pour laquelle ce
    // choix n'est pas une prop : sur une question dont l'enjeu est de perdre
    // quelque chose, l'œil, le pouce et la touche Entrée doivent tous les trois
    // aller vers ce qui ne détruit rien.
    render(<Ecran alors={() => {}} />);
    screen.getByRole("button", { name: "Supprimer" }).click();
    await souffler();

    const sortie = screen.getByRole("button", { name: "Ne rien changer" });
    const detruit = screen.getByRole("button", {
      name: "Supprimer l'établissement",
    });

    // `variant="board"` peint le fond à l'encre ; `boardClair` ne peint rien et
    // pose un liseré. On lit le fond, pas le nom de la classe utilitaire.
    expect(sortie.className).toContain("bg-[color:var(--board-ink)]");
    expect(detruit.className).toContain("bg-transparent");
    expect(detruit.className).not.toContain("bg-[color:var(--board-ink)]");
    expect(document.activeElement).toBe(sortie);
  });
});
