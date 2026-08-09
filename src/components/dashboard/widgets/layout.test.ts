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
    // Le brief n'y figure pas : c'est le bandeau de tête de la page, pas
    // un widget — ni déplaçable, ni retirable. Le guide clôt le board :
    // visible d'emblée pour le nouvel inscrit (pédagogie d'amorçage).
    expect(layoutParDefaut().map((i) => i.widgetId)).toEqual([
      "calendrier-type",
      "equipements-grid",
      "countdown",
      "actions-retard",
      "plan-actions",
      "documents",
      "flux-registre",
      "controle",
      "guide",
    ]);
  });

  it("le board s'aligne sur la grille 6 colonnes (unités de 3)", () => {
    // calendrier (6) · équipements (6) · trois rangées de deux medium
    // (3+3) · guide (3).
    // La dernière rangée est volontairement incomplète : la grille CSS
    // auto-flow gère, et un board « point de départ » n'a pas à être
    // un mur plein.
    const cols = layoutParDefaut().map(
      (i) => tailleEnCol(REGISTRY[i.widgetId].taille),
    );
    expect(cols).toEqual([6, 6, 3, 3, 3, 3, 3, 3, 3]);
    expect(cols.every((c) => c % 3 === 0)).toBe(true);
  });

  it("seul le widget équipements est obligatoire", () => {
    // Les équipements sont le socle du calendrier de vérifications :
    // le widget est fixe — non retirable, réinjecté s'il manque du
    // layout persisté. Le reste du board demeure entièrement libre.
    const obligatoires = Object.values(REGISTRY)
      .filter((d) => d.obligatoire)
      .map((d) => d.id);
    expect(obligatoires).toEqual(["equipements-grid"]);
  });
});

describe("useLayoutPerso — migration et normalisation", () => {
  // Un layout personnalisé est restitué dans l'ordre choisi par
  // l'utilisateur ; seul le widget équipements (obligatoire) est
  // réinjecté s'il manque — à sa place du board par défaut.

  it("migre un layout v1 valide en préservant l'ordre utilisateur", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "indicateurs", variant: "default" },
        { widgetId: "score", variant: "anneau" },
        { widgetId: "bars-obligations", variant: "radial" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie).not.toBeNull();
    expect(sortie?.version).toBe(SCHEMA_VERSION);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "equipements-grid",
      "indicateurs",
      "score",
      "bars-obligations",
    ]);
  });

  it("ignore les widgetId inconnus (nettoyage silencieux)", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "indicateurs", variant: "default" },
        { widgetId: "score", variant: "anneau" },
        { widgetId: "widget-obsolete-v0", variant: "default" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "equipements-grid",
      "indicateurs",
      "score",
    ]);
  });

  it("remplace un variant inexistant par le variant par défaut", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "indicateurs", variant: "default" },
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
        { widgetId: "equipements-grid", variant: "default" },
        { widgetId: "indicateurs", variant: "default" },
        { widgetId: "guide", variant: "default" },
        { widgetId: "score", variant: "nombre" },
        { widgetId: "registre", variant: "default" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "equipements-grid",
      "indicateurs",
      "guide",
      "score",
      "registre",
    ]);
  });

  it("réinjecte le widget équipements manquant, juste sous le calendrier", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "guide", variant: "default" },
        { widgetId: "calendrier-type", variant: "default" },
        { widgetId: "score", variant: "anneau" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "guide",
      "calendrier-type",
      "equipements-grid",
      "score",
    ]);
  });

  it("repositionne le widget équipements sous le calendrier s'il est ailleurs", () => {
    // Layout hérité où l'utilisateur avait le widget en fin de board :
    // l'épinglage le ramène sous le calendrier, sans toucher au reste.
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "calendrier-type", variant: "default" },
        { widgetId: "score", variant: "anneau" },
        { widgetId: "equipements-grid", variant: "default" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "calendrier-type",
      "equipements-grid",
      "score",
    ]);
  });

  it("épingle en tête si le calendrier n'est pas sur le board", () => {
    const entree = {
      version: SCHEMA_VERSION,
      items: [
        { widgetId: "guide", variant: "default" },
        { widgetId: "score", variant: "anneau" },
      ],
    };
    const sortie = __internal.migrerLayout(entree);
    expect(sortie?.items.map((i) => i.widgetId)).toEqual([
      "equipements-grid",
      "guide",
      "score",
    ]);
  });
});
