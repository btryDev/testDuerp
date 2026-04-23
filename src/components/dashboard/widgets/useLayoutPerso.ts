"use client";

// Persistance locale du layout perso du tableau de bord.
// Clé : `duerp.dashboard.<etablissementId>`.
// Schéma versionné — quand la structure change, on incrémente
// SCHEMA_VERSION et on fournit une fonction de migration dans
// `migrerLayout`. Les clients obsolètes retombent sur les défauts
// plutôt que de crasher.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  REGISTRY,
  layoutParDefaut,
  variantValide,
  type WidgetId,
} from "./registry";
import type { LayoutItem, PersistedLayout } from "./types";

export const SCHEMA_VERSION = 1;

function cle(etablissementId: string): string {
  return `duerp.dashboard.${etablissementId}`;
}

/**
 * Normalise un layout lu depuis le storage :
 *  - filtre les widgetId inconnus du registre courant (nettoyage lent)
 *  - remplace les variants inexistants par le variant par défaut
 *  - ré-injecte les widgets obligatoires manquants (en tête)
 *  - conserve l'ordre utilisateur
 */
function normaliser(items: LayoutItem[]): LayoutItem[] {
  const valides = items
    .filter(
      (it): it is LayoutItem => typeof it?.widgetId === "string" && it.widgetId in REGISTRY,
    )
    .map((it) => {
      const def = REGISTRY[it.widgetId];
      const variant = variantValide(def, it.variant)
        ? it.variant
        : def.defaultVariant;
      return { widgetId: it.widgetId, variant };
    });

  const presents = new Set(valides.map((it) => it.widgetId));
  const obligatoiresManquants = (Object.values(REGISTRY) as typeof REGISTRY[keyof typeof REGISTRY][])
    .filter((d) => d.obligatoire && !presents.has(d.id))
    .map((d) => ({ widgetId: d.id, variant: d.defaultVariant }));

  return [...obligatoiresManquants, ...valides];
}

/**
 * Migre un layout hérité d'une ancienne version de schéma.
 * Pour l'instant schéma v1 — aucune migration nécessaire. Le stub est
 * là pour que les futures évolutions soient triviales à brancher.
 */
function migrerLayout(brut: unknown): PersistedLayout | null {
  if (!brut || typeof brut !== "object") return null;
  const obj = brut as { version?: unknown; items?: unknown };
  if (typeof obj.version !== "number") return null;
  if (!Array.isArray(obj.items)) return null;

  // v1 → v1 : pass-through.
  if (obj.version === SCHEMA_VERSION) {
    return {
      version: SCHEMA_VERSION,
      items: normaliser(obj.items as LayoutItem[]),
    };
  }

  // Migration future v0 → v1, v1 → v2, etc. : ajouter un switch ici.
  // Par défaut on ignore les versions inconnues → retour aux défauts.
  return null;
}

function lireDepuisStorage(
  etablissementId: string,
): PersistedLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cle(etablissementId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrerLayout(parsed);
  } catch {
    return null;
  }
}

function ecrireDansStorage(
  etablissementId: string,
  layout: PersistedLayout,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      cle(etablissementId),
      JSON.stringify(layout),
    );
  } catch {
    // quota dépassé, mode privé, etc. — on avale silencieusement, le
    // layout sera simplement non persistant pour cette session.
  }
}

export function useLayoutPerso(etablissementId: string) {
  const [layout, setLayout] = useState<PersistedLayout>(() => ({
    version: SCHEMA_VERSION,
    items: layoutParDefaut(),
  }));
  const initialise = useRef(false);

  // Hydratation : après le premier rendu côté client, on lit le storage.
  // On évite le mismatch SSR/CSR en conservant le layout par défaut au
  // premier rendu.
  useEffect(() => {
    const stored = lireDepuisStorage(etablissementId);
    if (stored) setLayout(stored);
    initialise.current = true;
  }, [etablissementId]);

  // Écriture : dès qu'on a hydraté, chaque changement part en storage.
  useEffect(() => {
    if (!initialise.current) return;
    ecrireDansStorage(etablissementId, layout);
  }, [etablissementId, layout]);

  const actif = useMemo(
    () => new Set(layout.items.map((it) => it.widgetId)),
    [layout],
  );

  const ajouter = useCallback((widgetId: WidgetId) => {
    setLayout((l) => {
      if (l.items.some((it) => it.widgetId === widgetId)) return l;
      const def = REGISTRY[widgetId];
      if (!def) return l;
      return {
        ...l,
        items: [...l.items, { widgetId, variant: def.defaultVariant }],
      };
    });
  }, []);

  const retirer = useCallback((widgetId: WidgetId) => {
    setLayout((l) => {
      // Garde-fou : les widgets obligatoires ne sont jamais retirés.
      if (REGISTRY[widgetId]?.obligatoire) return l;
      return {
        ...l,
        items: l.items.filter((it) => it.widgetId !== widgetId),
      };
    });
  }, []);

  const changerVariant = useCallback(
    (widgetId: WidgetId, variant: string) => {
      setLayout((l) => ({
        ...l,
        items: l.items.map((it) =>
          it.widgetId === widgetId ? { ...it, variant } : it,
        ),
      }));
    },
    [],
  );

  /** Remplace l'ordre des items par l'array fourni (typiquement
   *  retourné par @dnd-kit `arrayMove`). */
  const reordonner = useCallback((items: LayoutItem[]) => {
    setLayout((l) => ({ ...l, items }));
  }, []);

  const reinitialiser = useCallback(() => {
    setLayout({ version: SCHEMA_VERSION, items: layoutParDefaut() });
  }, []);

  return {
    layout,
    actif,
    ajouter,
    retirer,
    changerVariant,
    reordonner,
    reinitialiser,
  };
}

// Exports pour les tests unitaires
export const __internal = { migrerLayout, normaliser };
