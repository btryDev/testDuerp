// Le fil de retour d'une page de détail : deux questions distinctes, deux
// liens distincts.
//
//   ← Calendrier        d'où je viens (la provenance, cf.
//                       `src/lib/navigation/provenance.ts`)
//   Plan d'actions      où cette fiche vit (le parent canonique)
//
// Sans provenance, le premier lien *est* le parent canonique et le second
// disparaît : la page se comporte comme avant. Le parent n'est jamais
// retiré — arriver du calendrier ne doit pas fermer la porte du plan
// d'actions, seulement cesser d'y renvoyer de force.

import Link from "next/link";
import { retourDistinct, type Provenance } from "@/lib/navigation/provenance";

const STYLE_LIEN =
  "font-mono text-[0.68rem] uppercase tracking-[0.16em] transition-colors";

export function FilRetour({
  provenance,
  canonique,
  className,
}: {
  provenance: Provenance | null;
  /** Là où cette fiche vit dans l'arborescence — le parent de toujours. */
  canonique: Provenance;
  className?: string;
}) {
  // Deux liens vers le même écran ne s'affichent pas deux fois parce que
  // l'un porte des filtres : la provenance ne s'ajoute que si elle mène
  // ailleurs.
  const ailleurs = retourDistinct(provenance, canonique.href);
  const retour = provenance ?? canonique;

  return (
    <nav
      aria-label="Retour"
      className={
        "flex flex-wrap items-center gap-x-3 gap-y-1" +
        (className ? ` ${className}` : "")
      }
    >
      <Link
        href={retour.href}
        className={`${STYLE_LIEN} text-muted-foreground hover:text-ink`}
      >
        ← {retour.label}
      </Link>
      {ailleurs && (
        <>
          <span aria-hidden className="text-rule">
            ·
          </span>
          <Link
            href={canonique.href}
            className={`${STYLE_LIEN} text-muted-foreground/70 hover:text-ink`}
          >
            {canonique.label}
          </Link>
        </>
      )}
    </nav>
  );
}
