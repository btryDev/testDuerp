// La marque d'une catégorie d'équipement — deux lettres, pas un dessin.
//
// Les pictos isométriques ont été retirés du projet : quinze PNG de
// ~130 Ko chargés sur chaque liste, dont deux catégories n'avaient jamais
// eu de dessin (installation électrique, « autre ») et retombaient sur une
// icône d'une autre famille graphique. À côté d'une tuile-date et d'une
// pilule d'état, un troisième objet coloré ne disait rien de plus.
//
// Ce qui reste est typographique : un monogramme mono-caps, dans le même
// alphabet que les sur-titres. Il tient l'alignement des listes, se
// recolore, ne pèse rien, et n'a pas besoin qu'on dessine une planche pour
// la seizième catégorie.

import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import { cn } from "@/lib/utils";

/**
 * Deux lettres par catégorie, écrites à la main plutôt que dérivées du
 * libellé : « porte automatique » et « portail automatique » donneraient
 * la même abréviation, et deux catégories qui se ressemblent déjà
 * deviendraient indistinguables. L'unicité est vérifiée par le test.
 */
export const MARQUE_CATEGORIE: Record<CategorieEquipement, string> = {
  INSTALLATION_ELECTRIQUE: "EL",
  EXTINCTEUR: "EX",
  BAES: "BA",
  ALARME_INCENDIE: "AL",
  DESENFUMAGE: "DF",
  VMC: "VM",
  CTA: "CT",
  HOTTE_PRO: "HO",
  APPAREIL_CUISSON_ERP: "CU",
  ASCENSEUR: "AS",
  PORTE_AUTO: "PO",
  PORTAIL_AUTO: "PA",
  EQUIPEMENT_SOUS_PRESSION: "SP",
  STOCKAGE_MATIERE_DANGEREUSE: "SD",
  EQUIPEMENT_LEVAGE: "LV",
  AUTRE: "AU",
};

const TON = {
  /** Sur papier : le carré d'encre de la maquette. */
  encre: "bg-[color:var(--board-ink)] text-white",
  /** Sur l'encre : le voile translucide, l'encre y serait invisible. */
  clair: "bg-white/10 text-white",
  /** Déjà posé dans un champ bleu : les lettres seules, sans second champ. */
  glacier: "text-[color:var(--board-blue-ink)]",
} as const;

export function MarqueCategorie({
  categorie,
  taille = 44,
  ton = "encre",
  className,
}: {
  /** `string` toléré : le bundle du tableau de bord ne porte pas le type
   *  étroit. Une valeur inconnue tombe sur « ?? » plutôt que sur du vide. */
  categorie: CategorieEquipement | string;
  taille?: number;
  ton?: keyof typeof TON;
  className?: string;
}) {
  const marque =
    (MARQUE_CATEGORIE as Partial<Record<string, string>>)[categorie] ?? "??";
  const label =
    (LABEL_CATEGORIE_EQUIPEMENT as Partial<Record<string, string>>)[
      categorie
    ] ?? "Catégorie inconnue";

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid flex-none place-items-center font-mono font-semibold uppercase",
        TON[ton],
        className,
      )}
      style={{
        width: taille,
        height: taille,
        // Le rayon suit la taille : 15/44 est le rapport relevé sur la
        // maquette, et il tient de la pastille de liste au grand format.
        borderRadius: ton === "glacier" ? 0 : Math.round(taille * 0.34),
        fontSize: Math.round(taille * 0.28),
        letterSpacing: "0.08em",
      }}
    >
      {marque}
    </span>
  );
}
