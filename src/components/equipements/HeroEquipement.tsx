// La tête d'une fiche d'équipement — un bandeau d'encre.
//
// Pourquoi elle ne réutilise pas `HeroFiche`. Les cinq fiches ouvertes
// depuis le calendrier (action, vérification, ticket, permis, plan)
// affichent une **échéance** : leur tête est blanche parce qu'elle
// prolonge la ligne cliquée, et son bandeau de faits porte les valeurs de
// cette échéance. Un équipement n'est pas une échéance : c'est l'objet qui
// en produit, et il en produit plusieurs. Sa tête ne prolonge aucune ligne,
// elle ouvre un chapitre — d'où l'encre, la même que le bandeau du parc
// dont on vient, et la frise en pied plutôt qu'une rangée de faits.

import type { ReactNode } from "react";
import { TuileDate } from "@/components/ui-kit";
import { MarqueCategorie } from "@/components/equipements/MarqueCategorie";
import type { RegistreLigne } from "@/lib/calendrier/etats";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import type { Frise } from "@/lib/equipements/frise";
import { FriseEquipement } from "./FriseEquipement";

export function HeroEquipement({
  categorie,
  date,
  etat,
  surtitre,
  titre,
  chapeau,
  pastilles,
  actions,
  frise,
}: {
  categorie: CategorieEquipement;
  /** La prochaine échéance. Absente : l'appareil n'a rien de daté devant
   *  lui, et c'est son picto qui tient la place. */
  date: Date | null;
  etat: RegistreLigne;
  surtitre: ReactNode;
  titre: string;
  chapeau?: ReactNode;
  pastilles?: ReactNode;
  actions?: ReactNode;
  frise: Frise | null;
}) {
  return (
    <section className="carte-board overflow-hidden bg-[color:var(--board-ink)] text-white">
      <div className="flex flex-wrap items-start gap-x-7 gap-y-5 px-7 pb-7 pt-8 sm:px-9">
        {date ? (
          <TuileDate date={date} etat={etat} taille="fiche" />
        ) : (
          <MarqueCategorie categorie={categorie} taille={84} ton="clair" />
        )}

        <div className="min-w-[280px] flex-1">
          <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-blue-soft)]">
            {surtitre}
          </p>
          <h1 className="board-titre m-0 mt-2.5 max-w-[24ch] text-[clamp(26px,2.6vw,40px)] text-white">
            {titre}
          </h1>
          {chapeau ? (
            <p className="m-0 mt-3.5 max-w-[58ch] text-[15px] leading-[1.5] text-white/70">
              {chapeau}
            </p>
          ) : null}
          {pastilles ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {pastilles}
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-none flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>

      {frise ? <FriseEquipement frise={frise} /> : null}
    </section>
  );
}
