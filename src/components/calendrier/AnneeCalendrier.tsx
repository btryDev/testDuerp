"use client";

// L'année du calendrier : la règle graduée posée sur le canvas, puis la
// liste — par mois ou par équipement. Le titre de la page vit au-dessus,
// dans sa bande pleine largeur : ici il n'y a plus que des repères et du
// contenu, aucun objet flottant avant les cartes.
//
// La lecture choisie (mois ou équipement) vit dans l'URL, écrite d'un
// `history.replaceState` sans repasser serveur : le sélecteur de la bande
// de titre (`SelecteurLecture`) l'écrit, ce composant la lit par
// `useSearchParams` et bascule ses blocs d'un `display: none` — les deux
// listes viennent du même calcul, elles sont rendues ensemble. Un lien
// partagé ouvre donc la bonne lecture, et les deux composants restent
// d'accord sans se connaître.
//
// L'état proprement local : le mois déplié (viser une graduation doit
// ouvrir la carte correspondante), l'année affichée, le pli des mois
// passés. Les deux listes restent montées : revenir d'une lecture à
// l'autre retrouve les cartes qu'on avait ouvertes.
//
// Le contenu, lui, est rendu côté serveur et descend ici en `ReactNode`.

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { RegleAnnuelle, type MoisRegle } from "./RegleAnnuelle";
import { SectionMois } from "./SectionMois";
import { ecrireLecture, lectureDesParams } from "./SelecteurLecture";

export type SectionMoisData = {
  /** Clé `AAAA-MM`, partagée avec la règle. */
  cle: string;
  titre: string;
  nb: number;
  nbEnRetard: number;
  nbAPlanifier: number;
  contenu: React.ReactNode;
};

/** Une année de la règle : douze mois, présents ou vides. */
export type AnneeRegle = {
  annee: number;
  mois: MoisRegle[];
};

export type Lecture = "mois" | "equipement";

export function AnneeCalendrier({
  annee,
  anneesRegle,
  sections,
  sansDate,
  actionsSansEcheance,
  moisInitial,
  cleMoisCourant,
  outils,
  parEquipement,
}: {
  /** Année d'aujourd'hui — celle que la règle affiche à l'arrivée. */
  annee: number;
  /** La règle de chaque année couverte par le dossier, triées. */
  anneesRegle: AnneeRegle[];
  sections: SectionMoisData[];
  sansDate: number;
  /** Ce que le calendrier ne peut pas poser, mais annonce. Cf. RegleAnnuelle. */
  actionsSansEcheance?: {
    nb: number;
    href: string;
    mention: string;
  } | null;
  /** Mois déplié au chargement — le premier qui porte quelque chose. */
  moisInitial: string | null;
  /** Clé `AAAA-MM` du mois d'aujourd'hui — la charnière de la liste. */
  cleMoisCourant: string;
  /**
   * Barre de filtres, en tête du bloc : elle règle ce que les deux
   * lectures montrent, elle n'appartient à aucune.
   */
  outils?: React.ReactNode;
  /** La même année, groupée par appareil. */
  parEquipement?: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState<string | null>(moisInitial);
  // La lecture appartient à l'URL — le sélecteur de la bande de titre
  // l'écrit, `useSearchParams` nous réveille quand elle change.
  const lecture = lectureDesParams(useSearchParams());
  const regleRef = useRef<HTMLDivElement | null>(null);

  // « Collée » : l'instrument a atteint le haut du défilement et la liste
  // passe dessous — c'est là qu'il prend son verre. Le sentinelle est un
  // point de mesure posé juste au-dessus du sticky : tant qu'il est
  // visible, la règle est encore à sa place dans le flux.
  const sentinelle = useRef<HTMLDivElement | null>(null);
  const [collee, setCollee] = useState(false);
  useEffect(() => {
    const el = sentinelle.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) =>
      setCollee(!e.isIntersecting),
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  // L'année affichée — par la règle ET par les cartes : la règle est
  // l'index de la liste, les deux tournent leurs pages ensemble. À
  // l'arrivée, c'est l'année du mois servi d'office (une dette de
  // décembre dernier ouvre la page sur son année, pas sur un présent
  // vide).
  const [anneeRegle, setAnneeRegle] = useState(() =>
    moisInitial ? Number(moisInitial.slice(0, 4)) : annee,
  );

  // Sur l'année en cours, la liste s'ouvre sur aujourd'hui : les mois
  // déjà passés restent pliés derrière leur couture — présents, comptés,
  // mais pas déroulés d'office. Les autres années se montrent entières :
  // on y est venu exprès. Si le mois servi à l'arrivée vit dans le pli,
  // le pli naît ouvert.
  const [voirPasses, setVoirPasses] = useState(
    () =>
      moisInitial !== null &&
      moisInitial < cleMoisCourant &&
      moisInitial.slice(0, 4) === String(annee),
  );

  const idxRegle = Math.max(
    0,
    anneesRegle.findIndex((a) => a.annee === anneeRegle),
  );
  const regle = anneesRegle[idxRegle];

  // Les douze mois de l'année affichée, cartes et creux mêlés : un mois
  // sans échéance se dit d'un mot au lieu de disparaître — l'année se lit
  // entière, sans trou muet entre deux cartes.
  const sectionsParCle = new Map(sections.map((s) => [s.cle, s]));
  const surAnneeCourante = regle.annee === annee;
  const moisPasses = surAnneeCourante
    ? regle.mois.filter((m) => m.cle < cleMoisCourant)
    : [];
  const moisAffiches = surAnneeCourante
    ? regle.mois.filter((m) => m.cle >= cleMoisCourant)
    : regle.mois;
  const elementsPasses = elementsDuSegment(moisPasses, sectionsParCle);
  const elementsAffiches = elementsDuSegment(moisAffiches, sectionsParCle);
  const nbCartesPassees = elementsPasses.reduce(
    (n, e) => n + (e.type === "carte" ? 1 : 0),
    0,
  );
  const nbRetardsPasses = elementsPasses.reduce(
    (n, e) => n + (e.type === "carte" ? e.section.nbEnRetard : 0),
    0,
  );

  const viser = (cle: string) => {
    // Viser un mois depuis la lecture par équipement n'aurait pas de
    // cible : la règle est l'index de l'année, elle ramène donc à la
    // liste mensuelle.
    ecrireLecture("mois");
    // La cible peut dormir dans le pli des mois passés : viser l'ouvre —
    // l'instrument ne pointe jamais une carte que la liste refuse de
    // montrer.
    setAnneeRegle(Number(cle.slice(0, 4)));
    if (cle < cleMoisCourant && cle.slice(0, 4) === String(annee)) {
      setVoirPasses(true);
    }
    setOuvert(cle);
    // Le défilement attend la peinture : la carte grandit en s'ouvrant,
    // et viser sa position d'avant la ferait manquer la cible.
    requestAnimationFrame(() => {
      const cible = document.getElementById(ancreDuMois(cle));
      if (!cible) return;
      // La règle reste collée pendant le défilement : la carte visée doit
      // s'arrêter SOUS elle, pas dessous — la marge se mesure à chaque
      // visée, la hauteur de l'instrument bouge avec sa légende.
      const hRegle = regleRef.current?.offsetHeight ?? 0;
      cible.style.scrollMarginTop = `${hRegle + 20}px`;
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
      {/* La bascule vit dans la bande de titre (`SelecteurLecture`) ; ici
          ne restent que les filtres, qui règlent ce que les deux lectures
          montrent. */}
      {outils ? (
        <div className="mb-1 flex flex-wrap items-center gap-2">{outils}</div>
      ) : null}

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
        {/* L'instrument reste collé en tête du défilement : viser un mois
            fait filer la liste, et sans repère fixe on ne sait plus où la
            règle nous a lâché. Pas de voile sur le wrapper : le verre de
            la carte a besoin de voir la liste derrière lui pour la
            flouter. */}
        <div ref={sentinelle} aria-hidden className="-mb-5 h-0" />
        <div ref={regleRef} className="sticky top-0 z-20">
          <RegleAnnuelle
            verre={collee}
            annee={regle.annee}
            mois={regle.mois}
            moisOuvert={ouvert}
            onChoisirMois={viser}
            sansDate={sansDate}
            actionsSansEcheance={actionsSansEcheance}
            onAnneePrecedente={
              idxRegle > 0
                ? () => setAnneeRegle(anneesRegle[idxRegle - 1].annee)
                : undefined
            }
            onAnneeSuivante={
              idxRegle < anneesRegle.length - 1
                ? () => setAnneeRegle(anneesRegle[idxRegle + 1].annee)
                : undefined
            }
          />
        </div>

        {/* La couture des mois passés vit AU-DESSUS de son contenu : elle
            marque l'endroit où la liste a été pliée, et son compte de
            retards empêche le pli d'enterrer une dette. Elle n'existe que
            sur l'année en cours — et seulement si le passé a des cartes :
            plier du vide ne protège rien. */}
        {nbCartesPassees > 0 ? (
          <CoutureMois
            ouvert={voirPasses}
            onToggle={() => setVoirPasses((v) => !v)}
            libelle={
              voirPasses
                ? "Replier les mois précédents"
                : `Voir les ${nbCartesPassees} mois précédents`
            }
            nbEnRetard={voirPasses ? 0 : nbRetardsPasses}
          />
        ) : null}
        {voirPasses && nbCartesPassees > 0 ? (
          <ElementsMois
            elements={elementsPasses}
            ouvert={ouvert}
            onToggle={setOuvert}
          />
        ) : null}

        <ElementsMois
          elements={elementsAffiches}
          ouvert={ouvert}
          onToggle={setOuvert}
        />
      </div>

      {parEquipement ? (
        <div className={lecture === "equipement" ? "" : "hidden"}>
          {parEquipement}
        </div>
      ) : null}
    </div>
  );
}

/** Un cran de la liste : une carte-mois, ou un creux — un ou plusieurs
 *  mois consécutifs sans la moindre échéance, dits d'une seule ligne. */
type ElementMois =
  | { type: "carte"; section: SectionMoisData }
  | { type: "creux"; cle: string; de: string; a: string };

/**
 * Mêle cartes et creux dans l'ordre des mois. Les mois vides consécutifs
 * fusionnent : « De septembre à novembre — aucune échéance » plutôt que
 * trois cartes creuses qui diluent celles qui comptent.
 */
function elementsDuSegment(
  mois: MoisRegle[],
  sectionsParCle: Map<string, SectionMoisData>,
): ElementMois[] {
  const out: ElementMois[] = [];
  for (const m of mois) {
    const section = sectionsParCle.get(m.cle);
    if (section) {
      out.push({ type: "carte", section });
      continue;
    }
    // Le nom du mois sans son millésime — le creux vit déjà sous le
    // cadran de l'année, la répéter serait du bruit.
    const nom = m.labelLong.split(" ")[0];
    const dernier = out[out.length - 1];
    if (dernier?.type === "creux") dernier.a = nom;
    else out.push({ type: "creux", cle: m.cle, de: nom, a: nom });
  }
  return out;
}

/** Le rendu d'un segment de l'année : les cartes se déplient, les creux
 *  se contentent d'exister. */
function ElementsMois({
  elements,
  ouvert,
  onToggle,
}: {
  elements: ElementMois[];
  ouvert: string | null;
  onToggle: (fn: (courant: string | null) => string | null) => void;
}) {
  return (
    <>
      {elements.map((e) =>
        e.type === "carte" ? (
          <SectionMoisControlee
            key={e.section.cle}
            data={e.section}
            ouvert={ouvert === e.section.cle}
            onToggle={() =>
              onToggle((courant) =>
                courant === e.section.cle ? null : e.section.cle,
              )
            }
          />
        ) : (
          <p
            key={e.cle}
            className="m-0 rounded-[22px] bg-[color:var(--board-slate-pale)] px-7 py-[15px] text-[13px] font-medium text-[color:var(--board-slate-mid)]"
          >
            {e.de === e.a ? (
              <span className="capitalize">{e.de}</span>
            ) : (
              <>
                De {e.de} à {e.a}
              </>
            )}
            {" — aucune échéance"}
          </p>
        ),
      )}
    </>
  );
}

/**
 * La couture d'un pli de la liste : un trait pointillé qui dit « la liste
 * continue ici, repliée ». Le motif du bord pointillé vient des cases
 * « rien à signaler » du board — quelque chose existe, mais ne réclame
 * rien. Le compte de retards, lui, réclame : il garde le rose même plié.
 */
function CoutureMois({
  ouvert,
  onToggle,
  libelle,
  nbEnRetard,
}: {
  ouvert: boolean;
  onToggle: () => void;
  libelle: string;
  /** Retards dormant sous le pli — 0 pour ne rien afficher. */
  nbEnRetard: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={ouvert}
      className="flex items-center justify-center gap-3 rounded-[22px] border border-dashed border-[color:rgba(13,18,36,.18)] px-6 py-[15px] text-[13px] font-semibold text-[color:var(--board-slate-ink)] transition-colors hover:border-solid hover:bg-[color:var(--board-slate-pale)] hover:text-[color:var(--board-ink)]"
    >
      <ChevronDown
        className={
          "size-4 flex-none transition-transform " + (ouvert ? "rotate-180" : "")
        }
      />
      {libelle}
      {nbEnRetard > 0 ? (
        <span className="inline-block rounded-full bg-[color:var(--board-signal)] px-[13px] py-[6px] text-[12px] font-semibold text-[color:var(--board-signal-ink)]">
          {nbEnRetard} en retard
        </span>
      ) : null}
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
