import { describe, expect, it } from "vitest";
import {
  REGISTRY,
  layoutParDefaut,
  tailleEnCol,
  variantValide,
} from "./registry";
import { __internal, SCHEMA_VERSION } from "./useLayoutPerso";

describe("registre de widgets", () => {
  it("chaque widget a un defaultVariant listé ou un 'default' implicite", () => {
    for (const def of Object.values(REGISTRY)) {
      expect(variantValide(def, def.defaultVariant)).toBe(true);
    }
  });

  it("le layout par défaut n'inclut pas les widgets marqués exclueDuDefaut", () => {
    const ids = layoutParDefaut().map((i) => i.widgetId);
    expect(ids).not.toContain("recos");
    expect(ids).not.toContain("bars-obligations");
    // KPIs unitaires : disponibles mais masqués par défaut.
    expect(ids).not.toContain("kpi-en-retard");
    expect(ids).not.toContain("kpi-sous-30j");
    expect(ids).not.toContain("kpi-actions");
    expect(ids).not.toContain("kpi-rapports");
    // Échéances / Activité : déjà regroupés dans « Indicateurs ».
    expect(ids).not.toContain("echeances");
    expect(ids).not.toContain("activite");
    // L'identité de l'établissement vit désormais dans le rail de nav.
    expect(ids).not.toContain("etablissement");
  });

  it("le layout par défaut est le board éditorial, dans l'ordre", () => {
    expect(layoutParDefaut().map((i) => i.widgetId)).toEqual([
      "brief",
      "calendrier-type",
      "countdown",
      "actions-retard",
      "plan-actions",
      "documents",
      "flux-registre",
      "controle",
    ]);
  });

  it("le board tient exactement sur la grille 6 colonnes", () => {
    // brief (6) · frise (6) · puis trois rangées de deux medium (3+3).
    const cols = layoutParDefaut().map((i) => tailleEnCol(REGISTRY[i.widgetId].taille));
    expect(cols).toEqual([6, 6, 3, 3, 3, 3, 3, 3]);
    expect(cols.reduce((a, b) => a + b, 0) % 6).toBe(0);
  });

  it("un seul widget est obligatoire — l'ancre éditoriale du board", () => {
    const obligatoires = Object.values(REGISTRY)
      .filter((d) => d.obligatoire)
      .map((d) => d.id);
    expect(obligatoires).toEqual(["brief"]);
  });
});

describe("useLayoutPerso — migration et normalisation", () => {
  // Le widget « brief » est obligatoire et réinjecté en tête s'il manque
  // au layout persisté. Les tests qui ne veulent pas s'en soucier
  // l'incluent explicitement en entrée.

  it("migre un layout v1 valide sans le modifier", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "brief", variant: "default" },
        { widgetId: "score", variant: "anneau" },
        { widgetId: "bars-obligations", variant: "radial" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie).not.toBeNull();
    expect(sortie?.version).toBe(SCHEMA_VERSION);
    expect(sortie?.items).toHaveLength(3);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "brief",
      "score",
      "bars-obligations",
    ]);
  });

  it("ignore les widgetId inconnus (nettoyage silencieux)", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "brief", variant: "default" },
        { widgetId: "score", variant: "anneau" },
        { widgetId: "widget-obsolete-v0", variant: "default" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items).toHaveLength(2);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual(["brief", "score"]);
  });

  it("remplace un variant inexistant par le variant par défaut", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "brief", variant: "default" },
        { widgetId: "bars-obligations", variant: "fantaisie-inconnue" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    const bars = sortie?.items.find((i) => i.widgetId === "bars-obligations");
    expect(bars?.variant).toBe("bars");
  });

  it("rejette une version de schéma inconnue (retour aux défauts)", () => {
    const entree = { version: 999, items: [] };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie).toBeNull();
  });

  it("rejette un JSON structurellement invalide", () => {
    expect(__internal.migrerLayout(null)).toBeNull();
    expect(__internal.migrerLayout(undefined)).toBeNull();
    expect(__internal.migrerLayout({ nope: true })).toBeNull();
    expect(__internal.migrerLayout({ version: 1, items: "oops" })).toBeNull();
  });

  it("préserve l'ordre exact des widgets au passage de normalisation", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "brief", variant: "default" },
        { widgetId: "guide", variant: "default" },
        { widgetId: "score", variant: "nombre" },
        { widgetId: "registre", variant: "default" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "brief",
      "guide",
      "score",
      "registre",
    ]);
  });

  it("ré-injecte les widgets obligatoires manquants en tête", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "guide", variant: "default" },
        { widgetId: "score", variant: "anneau" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "brief",
      "guide",
      "score",
    ]);
  });
});
