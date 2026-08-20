// L'enveloppe d'une fiche de détail.
//
// Trois enveloppes cohabitaient jusqu'ici : `AppTopbar` collante + colonne
// centrée (tickets, permis de feu, plans de prévention), colonne centrée
// nue (action, vérification), et la gouttière pleine largeur du board
// (calendrier, tableau de bord). Une fiche ouverte depuis le calendrier
// passait donc d'une mise en page à une autre au clic.
//
// Celle-ci est la troisième : même gouttière, même fond, même rythme
// vertical que la liste dont on vient.

import type { ReactNode } from "react";
import { FilRetour } from "@/components/ui-kit/FilRetour";
import type { Provenance } from "@/lib/navigation/provenance";

export function EcranFiche({
  provenance,
  canonique,
  children,
}: {
  /** D'où l'on arrive — le calendrier, le tableau de bord, une autre fiche. */
  provenance: Provenance | null;
  /** Où cette fiche vit dans l'arborescence — son parent de toujours. */
  canonique: Provenance;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col bg-[color:var(--board-card)] px-[var(--board-gutter)] pb-16 pt-7">
      <FilRetour provenance={provenance} canonique={canonique} />
      <div className="mt-4 flex flex-col gap-[22px]">{children}</div>
    </main>
  );
}

/**
 * Le corps à deux colonnes : les faits à gauche, le geste attendu à
 * droite. Sous 1 100 px, la colonne de droite passe dessous — c'est
 * l'ordre de lecture voulu, jamais l'inverse.
 */
export function CorpsFiche({
  principal,
  cote,
}: {
  principal: ReactNode;
  cote?: ReactNode;
}) {
  if (!cote) {
    return <div className="flex flex-col gap-[22px]">{principal}</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-[22px] xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
      <div className="flex min-w-0 flex-col gap-[22px]">{principal}</div>
      <div className="flex min-w-0 flex-col gap-[22px]">{cote}</div>
    </div>
  );
}

/**
 * Titre de section entre deux cartes — quand une fiche a plusieurs
 * chapitres (les rapports, les actions correctives) et qu'une simple tête
 * de carte ne suffit plus à les séparer.
 */
export function TitreSection({
  surtitre,
  titre,
  compte,
  droite,
}: {
  surtitre: string;
  titre: string;
  compte?: number;
  droite?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pt-3">
      <div>
        <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          {surtitre}
        </p>
        <h2 className="board-titre m-0 mt-1.5 flex items-baseline gap-2.5 text-[22px]">
          {titre}
          {compte !== undefined && compte > 0 ? (
            <span className="pastille-board bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]">
              {compte}
            </span>
          ) : null}
        </h2>
      </div>
      {droite}
    </header>
  );
}
