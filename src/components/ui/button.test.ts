import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

/**
 * Ce que ces tests gardent : un bouton rend UNE casse et UNE police, pas
 * deux dont l'ordre du CSS décide.
 *
 * `cva` concatène. Les variantes `board` posent `normal-case` et
 * `[font-family:var(--font-body)]` par-dessus le `uppercase` et le
 * `[font-family:var(--font-mono)]` du socle, qui restent dans la chaîne. Les
 * appelants qui passaient par `cn(…)` voyaient le conflit tranché, les
 * autres non — d'où deux styles pour la même action sur `/equipements`.
 */

const classes = (options: Parameters<typeof buttonVariants>[0]) =>
  buttonVariants(options).split(/\s+/);

describe("buttonVariants — une seule casse, une seule police", () => {
  it("rend le bouton board en casse normale et en police de corps", () => {
    const board = classes({ variant: "board", size: "board" });
    expect(board).toContain("normal-case");
    expect(board).not.toContain("uppercase");
    expect(board).toContain("[font-family:var(--font-body)]");
    expect(board).not.toContain("[font-family:var(--font-mono)]");
  });

  it("vaut aussi pour la variante board claire", () => {
    // Deux variantes board, deux fois le même piège : la garde porte sur la
    // famille, pas sur un appel.
    const clair = classes({ variant: "boardClair", size: "board" });
    expect(clair).toContain("normal-case");
    expect(clair).not.toContain("uppercase");
  });

  it("laisse aux variantes historiques leur voix de document administratif", () => {
    // Borne basse : la correction ne doit pas passer tout le produit en casse
    // normale. Les petites capitales monospacées restent celles des écrans
    // qui n'ont pas encore migré — elles cohabitent, le temps qu'ils passent.
    const defaut = classes({});
    expect(defaut).toContain("uppercase");
    expect(defaut).toContain("[font-family:var(--font-mono)]");
    expect(defaut).not.toContain("normal-case");
  });

  it("laisse la classe de l'appelant l'emporter sur la variante", () => {
    // Borne haute : trancher les conflits internes ne doit pas neutraliser la
    // dernière classe passée, qui est celle que l'appelant a écrite exprès.
    const force = classes({ variant: "board", className: "uppercase" });
    expect(force).toContain("uppercase");
    expect(force).not.toContain("normal-case");
  });
});
