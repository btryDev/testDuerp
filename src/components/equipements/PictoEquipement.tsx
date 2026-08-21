import Image from "next/image";
import { Snowflake, Wrench, Zap } from "lucide-react";
import { PICTO_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/pictos";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import { cn } from "@/lib/utils";

/**
 * Picto d'une catégorie d'équipement. Catégories sans dessin sur la
 * planche (INSTALLATION_ELECTRIQUE, INSTALLATION_FRIGORIFIQUE, AUTRE) :
 * fallback lucide dans une pastille, pour garder l'alignement des listes.
 *
 * `categorie` accepte `string` car certaines sources (bundle dashboard)
 * ne portent pas le type étroit ; toute valeur inconnue tombe sur le
 * fallback.
 */
export function PictoEquipement({
  categorie,
  taille = 40,
  className,
}: {
  categorie: CategorieEquipement | string;
  taille?: number;
  className?: string;
}) {
  const src = (
    PICTO_CATEGORIE_EQUIPEMENT as Partial<Record<string, string>>
  )[categorie];

  if (!src) {
    const Fallback =
      categorie === "INSTALLATION_ELECTRIQUE"
        ? Zap
        : categorie === "INSTALLATION_FRIGORIFIQUE"
          ? Snowflake
          : Wrench;
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg bg-paper-sunk text-ink/60",
          className,
        )}
        style={{ width: taille, height: taille }}
      >
        <Fallback style={{ width: taille * 0.5, height: taille * 0.5 }} />
      </span>
    );
  }

  const label =
    (LABEL_CATEGORIE_EQUIPEMENT as Partial<Record<string, string>>)[
      categorie
    ] ?? categorie;

  return (
    <Image
      src={src}
      alt={label}
      width={taille}
      height={taille}
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
}
