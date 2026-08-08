// Placement des événements sur la frise « Les 90 prochains jours »
// (bloc central du board éditorial 4a).
//
// Pure et déterministe : on lui passe la date du jour, on ne lit jamais
// l'horloge ici — c'est ce qui rend la frise testable et le rendu stable
// entre serveur et client.
//
// La frise n'est plus bornée à la largeur de la carte : l'axe est bien
// plus long que ce qu'on voit (trois mois de passé, deux ans à venir) et
// c'est le conteneur qui défile. Les positions sont donc exprimées en
// **pixels** — un pixel vaut `pxParJour`, constant sur tout l'axe — et
// non plus en pourcentage d'un horizon fixe. Conséquence utile : deux
// échéances distantes de dix jours sont toujours à la même distance
// visuelle, quel que soit l'horizon affiché.

import { raccourcirLibelle } from "./libelles";

export type EvenementFrise = {
  id: string;
  libelle: string;
  date: Date;
  tone: "alerte" | "warn" | "ok";
  equipement: string;
};

/** Une échéance, telle qu'elle apparaît dans une carte de la frise. */
export type EvenementMarqueur = {
  id: string;
  libelle: string;
  equipement: string;
  tone: EvenementFrise["tone"];
  /** « 24 SEPT. » */
  libelleDate: string;
  passe: boolean;
};

export type MarqueurFrise = {
  /** Clé stable, dérivée de la première échéance du marqueur. */
  cle: string;
  /** Les échéances portées par ce marqueur — une seule, ou une grappe. */
  evenements: EvenementMarqueur[];
  /** Le libellé de l'échéance si elle est seule, « 3 échéances » sinon. */
  titre: string;
  /** « 24 SEPT. », ou la plage « 6 → 24 JUIL. » pour une grappe. */
  sousTitre: string;
  /** Le ton le plus alarmant du groupe : une alerte ne se dilue pas. */
  tone: EvenementFrise["tone"];
  /** Position de la première échéance, en pixels depuis le début. */
  x: number;
  /** Position de la dernière — égale à `x` hors grappe. */
  xFin: number;
  /** Alternance au-dessus / au-dessous de l'axe, comme dans le design. */
  cote: "haut" | "bas";
  /** Toutes les échéances du marqueur sont derrière nous. */
  passe: boolean;
  /** Au moins une échéance tombe dans les JOURS_PROCHE jours à venir. */
  proche: boolean;
};

export type GraduationMois = {
  /** Clé stable « 2026-08 ». */
  cle: string;
  /** « Août » — l'année n'apparaît qu'en janvier et au premier mois. */
  label: string;
  x: number;
  largeur: number;
  estMoisCourant: boolean;
};

export type Frise = {
  /** Premier jour de la fenêtre (1er du mois). */
  debut: Date;
  /** Dernier jour de la fenêtre (fin de mois). */
  fin: Date;
  /** Largeur totale de l'axe, en pixels. */
  largeur: number;
  /** Abscisse d'aujourd'hui — sert à cadrer le défilement à l'ouverture. */
  xAujourdhui: number;
  /** Événements déjà dépassés, y compris hors fenêtre. */
  nbEnRetard: number;
  marqueurs: MarqueurFrise[];
  /** Échéances placées sur l'axe — grappes comprises. */
  nbPlaces: number;
  mois: GraduationMois[];
};

/**
 * Écart minimal entre deux marqueurs consécutifs, en pixels.
 *
 * Les cartes font 172 px et alternent au-dessus / au-dessous de l'axe :
 * deux voisines ne partagent donc jamais la même ligne, et il suffit que
 * `i` et `i+2` ne se recouvrent pas — soit 88 px entre voisins. On prend
 * 92 pour garder un filet d'air.
 *
 * C'est aussi le seuil de **regroupement** : deux échéances plus proches
 * que ça ne peuvent pas être distinguées à l'œil, on les réunit dans une
 * seule carte plutôt que d'en cacher une. À l'échelle « 12 mois », ce
 * seuil vaut ~35 jours — le regroupement y est donc, de fait, mensuel ;
 * à l'échelle « 90 jours » il vaut ~9 jours. Le regroupement suit ainsi
 * ce que l'écran peut montrer, pas une règle de calendrier arbitraire.
 */
export const ECART_MIN_PX = 92;

/** Échelles disponibles, en pixels par jour. */
export const PX_PAR_JOUR = {
  /** Vue serrée : ~90 jours dans une carte de 900 px. */
  jours: 10,
  /** Vue large : ~12 mois dans la même carte. */
  mois: 2.6,
} as const;

export type EchelleFrise = keyof typeof PX_PAR_JOUR;

/** Seuil « proche » : une échéance à moins de 30 jours mérite l'orange.
 *  Même horizon que la promesse produit — « ce qu'il doit faire dans les
 *  30 prochains jours ». */
export const JOURS_PROCHE = 30;

/** Profondeur de passé consultable, en jours. */
export const JOURS_AVANT = 90;
/** Profondeur d'avenir consultable, en jours (~24 mois). */
export const JOURS_APRES = 730;

const JOUR_MS = 86400000;

function minuit(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Jours pleins entre deux dates — insensible aux changements d'heure. */
function joursEntre(a: Date, b: Date): number {
  return Math.round((minuit(b).getTime() - minuit(a).getTime()) / JOUR_MS);
}

function libelleDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" })
    .format(d)
    .toUpperCase();
}

function libelleDateLong(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function construireFrise({
  evenements,
  aujourdhui,
  echelle = "jours",
  joursAvant = JOURS_AVANT,
  joursApres = JOURS_APRES,
}: {
  evenements: EvenementFrise[];
  aujourdhui: Date;
  echelle?: EchelleFrise;
  joursAvant?: number;
  joursApres?: number;
}): Frise {
  const pxParJour = PX_PAR_JOUR[echelle];

  // La fenêtre s'aligne sur des mois entiers : les graduations mensuelles
  // sont alors des blocs pleins, jamais un « Août » tronqué à cinq jours.
  const brutDebut = new Date(minuit(aujourdhui).getTime() - joursAvant * JOUR_MS);
  const debut = new Date(brutDebut.getFullYear(), brutDebut.getMonth(), 1);
  const brutFin = new Date(minuit(aujourdhui).getTime() + joursApres * JOUR_MS);
  const fin = new Date(brutFin.getFullYear(), brutFin.getMonth() + 1, 0);

  const x = (d: Date) => joursEntre(debut, d) * pxParJour;
  const largeur = (joursEntre(debut, fin) + 1) * pxParJour;

  const nbEnRetard = evenements.filter(
    (e) => joursEntre(aujourdhui, e.date) < 0,
  ).length;

  const dansFenetre = evenements
    .filter((e) => e.date >= debut && e.date <= fin)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Regroupement : rien n'est écarté. Tout ce qui tomberait à moins de
  // ECART_MIN_PX de la première échéance du groupe rejoint ce groupe, et
  // la carte annonce alors un compte et une plage de dates au lieu d'un
  // libellé. Le groupe suivant démarre forcément au-delà du seuil, donc
  // deux cartes ne se recouvrent jamais.
  const groupes: EvenementFrise[][] = [];
  for (const e of dansFenetre) {
    const groupe = groupes[groupes.length - 1];
    if (groupe && x(e.date) - x(groupe[0].date) < ECART_MIN_PX) {
      groupe.push(e);
    } else {
      groupes.push([e]);
    }
  }

  const marqueurs: MarqueurFrise[] = groupes.map((groupe, i) => {
    const evenements: EvenementMarqueur[] = groupe.map((e) => ({
      id: e.id,
      // Les cartes font 172 px : un libellé réglementaire entier s'y fait
      // couper au milieu d'un mot.
      libelle: raccourcirLibelle(e.libelle),
      equipement: e.equipement,
      tone: e.tone,
      libelleDate: libelleDate(e.date),
      passe: joursEntre(aujourdhui, e.date) < 0,
    }));
    const premier = groupe[0];
    const dernier = groupe[groupe.length - 1];

    return {
      cle: premier.id,
      evenements,
      titre:
        groupe.length === 1
          ? evenements[0].libelle
          : `${groupe.length} échéances`,
      sousTitre:
        groupe.length === 1
          ? libelleDateLong(premier.date)
          : libellePlage(premier.date, dernier.date),
      // Une alerte au milieu d'un groupe calme reste visible : c'est elle
      // qui décide de la couleur de la carte.
      tone: groupe.some((e) => e.tone === "alerte")
        ? "alerte"
        : groupe.some((e) => e.tone === "warn")
          ? "warn"
          : "ok",
      x: x(premier.date),
      xFin: x(dernier.date),
      cote: i % 2 === 0 ? "haut" : "bas",
      passe: evenements.every((e) => e.passe),
      proche: groupe.some((e) => {
        const j = joursEntre(aujourdhui, e.date);
        return j >= 0 && j <= JOURS_PROCHE;
      }),
    };
  });

  return {
    debut,
    fin,
    largeur,
    xAujourdhui: x(aujourdhui),
    nbEnRetard,
    marqueurs,
    nbPlaces: dansFenetre.length,
    mois: construireMois(debut, fin, aujourdhui, pxParJour),
  };
}

/** « 24 SEPT. », « 6 → 24 JUIL. », « 28 JUIL. → 3 SEPT. ». */
function libellePlage(debut: Date, fin: Date): string {
  if (debut.getMonth() === fin.getMonth() && debut.getDate() === fin.getDate()) {
    return libelleDate(debut);
  }
  if (debut.getMonth() === fin.getMonth()) {
    return `${debut.getDate()} → ${libelleDate(fin)}`;
  }
  return `${libelleDate(debut)} → ${libelleDate(fin)}`;
}

/** Graduations mensuelles : un bloc par mois couvert par la fenêtre. */
function construireMois(
  debut: Date,
  fin: Date,
  aujourdhui: Date,
  pxParJour: number,
): GraduationMois[] {
  const fmt = new Intl.DateTimeFormat("fr-FR", { month: "long" });
  const out: GraduationMois[] = [];

  const curseur = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (curseur <= fin) {
    const finMois = new Date(curseur.getFullYear(), curseur.getMonth() + 1, 0);
    const nbJours = finMois.getDate();
    // L'année n'est rappelée qu'aux frontières : en janvier, et sur le
    // premier bloc de la fenêtre — ailleurs elle ne fait qu'encombrer.
    const marqueAnnee =
      out.length === 0 || curseur.getMonth() === 0;
    out.push({
      cle: `${curseur.getFullYear()}-${String(curseur.getMonth() + 1).padStart(2, "0")}`,
      label: marqueAnnee
        ? `${cap(fmt.format(curseur))} ${String(curseur.getFullYear()).slice(2)}`
        : cap(fmt.format(curseur)),
      x: joursEntre(debut, curseur) * pxParJour,
      largeur: nbJours * pxParJour,
      estMoisCourant:
        curseur.getFullYear() === aujourdhui.getFullYear() &&
        curseur.getMonth() === aujourdhui.getMonth(),
    });
    curseur.setMonth(curseur.getMonth() + 1);
  }
  return out;
}
