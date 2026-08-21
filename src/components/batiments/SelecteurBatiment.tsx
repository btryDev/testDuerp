import Link from "next/link";
import type { ReactNode } from "react";
import { LABEL_TOUT_ETABLISSEMENT } from "@/lib/calendrier/labels";

/**
 * Rangée de chips « Tout l'établissement · Bâtiment A · Bâtiment B ».
 *
 * Un filtre d'écran vit dans l'URL (ADR-015) : chaque chip est un lien
 * vers la même page avec `?batiment=`. Le composant est serveur, sans état
 * — la page relit le paramètre et filtre. Il n'est rendu qu'à partir de
 * deux bâtiments (ADR-019) : l'appelant le garantit, lui ne fait que
 * dessiner.
 */
export function SelecteurBatiment({
  baseHref,
  batiments,
  actif,
  compteurs,
  legende,
}: {
  baseHref: string;
  batiments: { id: string; nom: string }[];
  /** Id du bâtiment filtré — `undefined` = tout l'établissement. */
  actif: string | undefined;
  /** Nombre affiché à droite du nom (équipements, échéances…). */
  compteurs?: Map<string, number>;
  /** Phrase sous la rangée : ce que le filtre couvre, et ce qu'il ne
   *  couvre pas. Le produit dit toujours son périmètre. */
  legende?: ReactNode;
}) {
  return (
    <nav aria-label="Filtrer par bâtiment" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Bâtiment
        </span>
        <Chip href={baseHref} actif={!actif}>
          {LABEL_TOUT_ETABLISSEMENT}
        </Chip>
        {batiments.map((b) => (
          <Chip
            key={b.id}
            href={`${baseHref}?batiment=${encodeURIComponent(b.id)}`}
            actif={actif === b.id}
          >
            {b.nom}
            {compteurs?.has(b.id) ? (
              <span className="ml-1.5 opacity-60">{compteurs.get(b.id)}</span>
            ) : null}
          </Chip>
        ))}
      </div>
      {legende ? (
        <p className="m-0 text-[0.8rem] leading-relaxed text-muted-foreground">
          {legende}
        </p>
      ) : null}
    </nav>
  );
}

function Chip({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={actif ? "true" : undefined}
      className={
        "rounded-full border px-3 py-1 text-[0.8rem] transition-colors " +
        (actif
          ? "border-ink bg-ink text-background"
          : "border-rule text-foreground/80 hover:border-ink")
      }
    >
      {children}
    </Link>
  );
}
