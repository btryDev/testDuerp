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

export const SCHEMA_VERSION = 2;

function cle(etablissementId: string): string {
  return `duerp.dashboard.${etablissementId}`;
}

/**
 * Épingle les widgets obligatoires : chacun est replacé (ou injecté
 * s'il manque) juste après le dernier widget présent qui le précède
 * dans l'ordre du board par défaut — en tête si aucun. Pour le widget
 * équipements, ça veut dire : toujours juste sous le calendrier.
 * L'ordre choisi par l'utilisateur est conservé pour tout le reste.
 */
function epingler(items: LayoutItem[]): LayoutItem[] {
  const resultat = items.filter((it) => !REGISTRY[it.widgetId].obligatoire);
  const ordreDefaut = layoutParDefaut().map((it) => it.widgetId);

  // Les obligatoires sont réinsérés dans l'ordre du board par défaut —
  // pas dans l'ordre des clés du registre, qui n'engage rien.
  const obligatoires = Object.values(REGISTRY)
    .filter((def) => def.obligatoire)
    .sort(
      (a, b) => ordreDefaut.indexOf(a.id) - ordreDefaut.indexOf(b.id),
    );

  for (const def of obligatoires) {
    const variant =
      items.find((it) => it.widgetId === def.id)?.variant ??
      def.defaultVariant;
    const position = ordreDefaut.indexOf(def.id);
    const precedents = new Set(
      position === -1 ? [] : ordreDefaut.slice(0, position),
    );
    let ancre = -1;
    for (let i = resultat.length - 1; i >= 0; i--) {
      if (precedents.has(resultat[i].widgetId)) {
        ancre = i;
        break;
      }
    }
    resultat.splice(ancre + 1, 0, { widgetId: def.id, variant });
  }

  return resultat;
}

/**
 * Normalise un layout lu depuis le storage :
 *  - filtre les widgetId inconnus du registre courant (nettoyage lent)
 *  - remplace les variants inexistants par le variant par défaut
 *  - épingle les widgets obligatoires (voir `epingler`)
 *  - conserve l'ordre utilisateur pour le reste
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

  return epingler(valides);
}

/**
 * Migre un layout hérité d'une ancienne version de schéma.
 *
 * v1 → v2 : refonte du tableau de bord en « board éditorial ». Plusieurs
 * widgets ont changé de propos sous le même id (la frise, le plan
 * d'actions, les documents), si bien qu'un layout v1 réordonné par
 * l'utilisateur ne décrit plus la même chose. On le laisse donc expirer :
 * les versions inconnues retombent sur le layout par défaut, c'est-à-dire
 * le board. Une personnalisation faite après coup, elle, est conservée.
 */
function migrerLayout(brut: unknown): PersistedLayout | null {
  if (!brut || typeof brut !== "object") return null;
  const obj = brut as { version?: unknown; items?: unknown };
  if (typeof obj.version !== "number") return null;
  if (!Array.isArray(obj.items)) return null;

  // Version courante : pass-through (après normalisation).
  if (obj.version === SCHEMA_VERSION) {
    return {
      version: SCHEMA_VERSION,
      items: normaliser(obj.items as LayoutItem[]),
    };
  }

  // Versions antérieures : pas de migration, retour au layout par défaut.
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
    // Motif d'hydratation assumé : le premier rendu (SSR compris) sert
    // le layout par défaut, le storage n'est relu qu'après montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
   *  retourné par @dnd-kit `arrayMove`). L'épinglage garantit que les
   *  widgets obligatoires gardent leur place quel que soit le drag. */
  const reordonner = useCallback((items: LayoutItem[]) => {
    setLayout((l) => ({ ...l, items: epingler(items) }));
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
