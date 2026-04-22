"use client";

// Orchestrateur du tableau de bord configurable.
// Grille bento 6 colonnes + grid-auto-flow dense pour remplir les
// interstices. Drag-and-drop via @dnd-kit — seul le handle GripVertical
// dans l'overlay d'édition est « activable », les autres contrôles ne
// déclenchent pas de drag. Les mouvements sont restreints à l'axe
// vertical/horizontal combiné (pas de contrainte). Animation smooth
// des voisins par CSS.Transform.toString.

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { EditToolbar } from "./EditToolbar";
import { WidgetShell } from "./WidgetShell";
import { REGISTRY, tailleEnCol } from "./registry";
import { useLayoutPerso } from "./useLayoutPerso";
import type { DashboardBundle, WidgetId } from "./types";

export function DashboardGrid({ bundle }: { bundle: DashboardBundle }) {
  const {
    layout,
    actif,
    ajouter,
    retirer,
    changerVariant,
    reordonner,
    reinitialiser,
  } = useLayoutPerso(bundle.etablissementId);

  const [enEdition, setEnEdition] = useState(false);

  // Sensors : pointer avec distance d'activation (évite les drags
  // accidentels sur les clics boutons) + clavier pour a11y.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = layout.items.findIndex((i) => i.widgetId === active.id);
    const newIdx = layout.items.findIndex((i) => i.widgetId === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    reordonner(arrayMove(layout.items, oldIdx, newIdx));
  };

  const ids = layout.items.map((i) => i.widgetId as WidgetId);

  return (
    <div className="flex flex-col gap-5">
      <EditToolbar
        enEdition={enEdition}
        onToggle={() => setEnEdition((e) => !e)}
        actif={actif}
        onAjouter={ajouter}
        onReinitialiser={reinitialiser}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 [grid-auto-flow:dense]">
            {layout.items.map((item) => {
              const def = REGISTRY[item.widgetId];
              if (!def) return null;
              if (def.visibleQuand && !def.visibleQuand(bundle)) return null;

              const Component = def.Component;
              const colSpan = tailleEnCol(def.taille);

              return (
                <WidgetShell
                  key={item.widgetId}
                  widgetId={item.widgetId}
                  variant={item.variant}
                  enEdition={enEdition}
                  onRetirer={() => retirer(item.widgetId)}
                  onChangerVariant={(v) => changerVariant(item.widgetId, v)}
                  colSpan={colSpan}
                >
                  <Component bundle={bundle} variant={item.variant} />
                </WidgetShell>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
