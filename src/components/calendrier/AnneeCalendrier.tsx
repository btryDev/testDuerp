"use client";

// L'année du calendrier : la règle graduée en tête, les cartes-mois
// dessous. Ce composant n'existe que pour tenir l'état commun aux deux —
// quel mois est ouvert — parce que viser une graduation doit ouvrir la
// carte correspondante.
//
// Le contenu des mois reste rendu côté serveur : il descend ici en
// `ReactNode` dans `sections`. Rien de la liste n'a besoin du navigateur,
// seul l'accordéon en a besoin.

import { useState } from "react";
import { RegleAnnuelle, type MoisRegle } from "./RegleAnnuelle";
import { SectionMois } from "./SectionMois";

export type SectionMoisData = {
  /** Clé `AAAA-MM`, partagée avec la règle. */
  cle: string;
  titre: string;
  nb: number;
  nbEnRetard: number;
  nbAPlanifier: number;
  contenu: React.ReactNode;
};

export function AnneeCalendrier({
  annee,
  moisRegle,
  sections,
  totalAnnee,
  sansDate,
  horsAnnee,
  moisInitial,
  outils,
  entete,
}: {
  annee: number;
  moisRegle: MoisRegle[];
  sections: SectionMoisData[];
  totalAnnee: number;
  sansDate: number;
  horsAnnee: number;
  /** Mois déplié au chargement — le premier qui porte quelque chose. */
  moisInitial: string | null;
  /**
   * Barre de filtres, posée entre l'instrument et les cartes : elle règle
   * ce que les deux montrent, elle n'appartient à aucun des deux.
   */
  outils?: React.ReactNode;
  /**
   * Le bloc de titre, posé dans la même rangée que l'instrument : le ciel
   * n'est plus un bandeau pleine largeur (c'est la signature du tableau
   * de bord) mais une carte du bento, à hauteur de la règle. Sans lui, la
   * règle occupe toute la largeur.
   */
  entete?: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState<string | null>(moisInitial);

  const viser = (cle: string) => {
    setOuvert(cle);
    // Le défilement attend la peinture : la carte grandit en s'ouvrant,
    // et viser sa position d'avant la ferait manquer la cible.
    requestAnimationFrame(() => {
      const cible = document.getElementById(ancreDuMois(cle));
      if (!cible) return;
      const doux = !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      cible.scrollIntoView({
        behavior: doux ? "smooth" : "auto",
        block: "start",
      });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        className={
          "grid items-stretch gap-4 " +
          (entete ? "lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]" : "")
        }
      >
        {entete}
        <RegleAnnuelle
          annee={annee}
          mois={moisRegle}
          moisOuvert={ouvert}
          onChoisirMois={viser}
          total={totalAnnee}
          sansDate={sansDate}
          horsAnnee={horsAnnee}
        />
      </div>

      {outils}

      {sections.map((s) => (
        <SectionMoisControlee
          key={s.cle}
          data={s}
          ouvert={ouvert === s.cle}
          onToggle={() =>
            setOuvert((courant) => (courant === s.cle ? null : s.cle))
          }
        />
      ))}
    </div>
  );
}

/** `id` HTML d'une carte-mois. Un seul endroit pour la forme de l'ancre. */
export function ancreDuMois(cle: string): string {
  return `mois-${cle}`;
}

function SectionMoisControlee({
  data,
  ouvert,
  onToggle,
}: {
  data: SectionMoisData;
  ouvert: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionMois
      titre={data.titre}
      nb={data.nb}
      nbEnRetard={data.nbEnRetard}
      nbAPlanifier={data.nbAPlanifier}
      ouvert={ouvert}
      onToggle={onToggle}
      ancre={ancreDuMois(data.cle)}
    >
      {data.contenu}
    </SectionMois>
  );
}
