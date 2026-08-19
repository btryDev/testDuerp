"use client";

// L'année du calendrier : la règle graduée posée sur le canvas, puis la
// liste — par mois ou par équipement. Le titre de la page vit au-dessus,
// dans sa bande pleine largeur : ici il n'y a plus que des repères et du
// contenu, aucun objet flottant avant les cartes.
//
// Ce composant n'existe que pour tenir les deux états que ces morceaux
// partagent :
//
//   - **la lecture choisie** (mois ou équipement). Elle a d'abord vécu
//     dans l'URL. C'était défendable — ça se partage, ça se met en favori
//     — mais chaque bascule repassait par le serveur : la page entière
//     re-rendue, ses requêtes refaites, un temps mort pour changer de
//     regard sur des données déjà chargées. Les deux listes viennent du
//     même calcul : elles sont rendues ensemble, et basculer ne coûte
//     plus qu'un `display: none`. Le paramètre d'URL survit comme valeur
//     initiale, pour qu'un lien partagé ouvre la bonne lecture ;
//   - **le mois déplié**, parce que viser une graduation doit ouvrir la
//     carte correspondante.
//
// Les deux listes restent montées : revenir d'une lecture à l'autre
// retrouve les cartes qu'on avait ouvertes, ce qu'un démontage perdrait.
//
// Le contenu, lui, est rendu côté serveur et descend ici en `ReactNode`.
// Rien de ces listes n'a besoin du navigateur — seuls l'accordéon et la
// bascule en ont besoin.

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

export type Lecture = "mois" | "equipement";

export function AnneeCalendrier({
  annee,
  moisRegle,
  sections,
  totalAnnee,
  sansDate,
  horsAnnee,
  moisInitial,
  outils,
  parEquipement,
  lectureInitiale,
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
   * Barre de filtres, posée entre l'instrument et les listes : elle règle
   * ce que les deux montrent, elle n'appartient à aucune des deux.
   */
  outils?: React.ReactNode;
  /** La même année, groupée par appareil. */
  parEquipement?: React.ReactNode;
  lectureInitiale?: Lecture;
}) {
  const [ouvert, setOuvert] = useState<string | null>(moisInitial);
  const [lecture, setLecture] = useState<Lecture>(lectureInitiale ?? "mois");

  const viser = (cle: string) => {
    // Viser un mois depuis la lecture par équipement n'aurait pas de
    // cible : la règle est l'index de l'année, elle ramène donc à la
    // liste mensuelle.
    setLecture("mois");
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
      {/* La bascule et les filtres ouvrent la page : ce sont eux qui
          décident de ce que la règle et les listes montrent — les poser
          sous l'instrument les faisait lire comme un pied de section. */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {parEquipement ? (
          <div className="flex items-center gap-1 rounded-full bg-[color:var(--board-card)] p-1 shadow-[0_0_0_1px_rgba(13,18,36,.06)]">
            <BoutonLecture
              actif={lecture === "mois"}
              onClick={() => setLecture("mois")}
            >
              Par mois
            </BoutonLecture>
            <BoutonLecture
              actif={lecture === "equipement"}
              onClick={() => setLecture("equipement")}
            >
              Par équipement
            </BoutonLecture>
          </div>
        ) : null}
        {outils}
      </div>

      {/* `hidden` plutôt qu'un démontage : la lecture inactive garde ses
          cartes ouvertes, et la bascule ne coûte rien. La règle vit DANS
          le bloc de la lecture par mois — elle en est l'index, et par
          équipement chaque carte porte déjà son année en réduction : la
          grande au-dessus ferait deux fois le même dessin. */}
      <div
        className={
          "flex flex-col gap-5 " + (lecture === "mois" ? "" : "hidden")
        }
      >
        <RegleAnnuelle
          annee={annee}
          mois={moisRegle}
          moisOuvert={ouvert}
          onChoisirMois={viser}
          total={totalAnnee}
          sansDate={sansDate}
          horsAnnee={horsAnnee}
        />

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

      {parEquipement ? (
        <div className={lecture === "equipement" ? "" : "hidden"}>
          {parEquipement}
        </div>
      ) : null}
    </div>
  );
}

function BoutonLecture({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={
        "rounded-full px-4 py-2 text-[13px] font-semibold leading-none transition-colors " +
        (actif
          ? "bg-[color:var(--board-ink)] text-white"
          : "text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]")
      }
    >
      {children}
    </button>
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
