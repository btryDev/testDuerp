// Construction des grilles d'échéances — mensuelle et annuelle.
//
// Pure et déterministe, comme la frise : on injecte le mois affiché et la
// date du jour, on ne lit jamais l'horloge. La semaine commence le lundi
// (convention française), et la grille est complétée par les jours
// débordants du mois précédent et du suivant pour former des semaines
// entières.

import type { FamilleEcheance } from "./echeances";

export type EvenementGrille = {
  id: string;
  libelle: string;
  date: Date;
  tone: "alerte" | "warn" | "ok";
  equipement: string;
  /** Famille de l'échéance — absente = contrôle (compat board). */
  famille?: FamilleEcheance;
  /** Porte de la pastille — absente = `hrefEvenement` de l'appelant. */
  href?: string;
};

export type JourGrille = {
  /** Clé stable « 2026-08-24 ». */
  cle: string;
  date: Date;
  numero: number;
  /** false pour les jours de débordement (mois précédent / suivant). */
  dansLeMois: boolean;
  estAujourdhui: boolean;
  evenements: EvenementGrille[];
};

export type GrilleMois = {
  /** 1er du mois affiché. */
  mois: Date;
  /** « Août 2026 ». */
  libelle: string;
  semaines: JourGrille[][];
  /** Nombre d'événements tombant dans le mois affiché. */
  nbEvenements: number;
};

export const JOURS_SEMAINE = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const JOUR_MS = 86400000;

function cleJour(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Décalage du 1er du mois par rapport au lundi précédent (0 à 6). */
function decalageLundi(premier: Date): number {
  return (premier.getDay() + 6) % 7;
}

export function construireGrilleMois({
  mois,
  evenements,
  aujourdhui,
}: {
  /** N'importe quelle date du mois à afficher. */
  mois: Date;
  evenements: EvenementGrille[];
  aujourdhui: Date;
}): GrilleMois {
  const premier = new Date(mois.getFullYear(), mois.getMonth(), 1);
  const dernier = new Date(mois.getFullYear(), mois.getMonth() + 1, 0);

  // Regroupement par jour : une seule passe sur les événements, la grille
  // ne fait ensuite que des lectures de map.
  const parJour = new Map<string, EvenementGrille[]>();
  for (const e of evenements) {
    const cle = cleJour(e.date);
    const liste = parJour.get(cle);
    if (liste) liste.push(e);
    else parJour.set(cle, [e]);
  }
  for (const liste of parJour.values()) {
    liste.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  const debut = new Date(premier.getTime() - decalageLundi(premier) * JOUR_MS);
  // Semaines entières couvrant tout le mois : 4 à 6 lignes selon le mois.
  const nbJours = Math.ceil(
    (decalageLundi(premier) + dernier.getDate()) / 7,
  ) * 7;

  const cleAujourdhui = cleJour(aujourdhui);
  const semaines: JourGrille[][] = [];
  let nbEvenements = 0;

  for (let i = 0; i < nbJours; i += 1) {
    const d = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + i);
    const cle = cleJour(d);
    const dansLeMois = d.getMonth() === premier.getMonth();
    const evts = parJour.get(cle) ?? [];
    if (dansLeMois) nbEvenements += evts.length;

    const jour: JourGrille = {
      cle,
      date: d,
      numero: d.getDate(),
      dansLeMois,
      estAujourdhui: cle === cleAujourdhui,
      evenements: evts,
    };

    if (i % 7 === 0) semaines.push([jour]);
    else semaines[semaines.length - 1].push(jour);
  }

  const libelle = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(premier);

  return {
    mois: premier,
    libelle: libelle.charAt(0).toUpperCase() + libelle.slice(1),
    semaines,
    nbEvenements,
  };
}

/** Point d'un mois de la vue année : le ton porte l'urgence, la famille
 *  la forme du marqueur. Ordonnés alerte → warn → ok, pour que le
 *  dépassé reste visible quand la place manque. */
export type PointAnnee = {
  tone: EvenementGrille["tone"];
  famille: FamilleEcheance;
};

export type MoisAnnee = {
  /** 1er du mois. */
  mois: Date;
  /** « Janv. », « Août ». */
  libelle: string;
  estMoisCourant: boolean;
  /** false si le mois est entièrement hors de la fenêtre chargée. */
  dansFenetre: boolean;
  nbParTon: Record<EvenementGrille["tone"], number>;
  points: PointAnnee[];
  nbTotal: number;
};

export type GrilleAnnee = {
  annee: number;
  mois: MoisAnnee[];
  /** Nombre d'événements tombant dans l'année affichée. */
  nbEvenements: number;
};

export function construireGrilleAnnee({
  annee,
  evenements,
  aujourdhui,
  fenetre,
}: {
  annee: number;
  evenements: EvenementGrille[];
  aujourdhui: Date;
  /** Bornes de la période chargée — un mois qui n'y touche pas est grisé. */
  fenetre?: { debut: Date; fin: Date };
}): GrilleAnnee {
  const parMois: Record<EvenementGrille["tone"], number>[] = Array.from(
    { length: 12 },
    () => ({ alerte: 0, warn: 0, ok: 0 }),
  );
  const pointsParMois: PointAnnee[][] = Array.from({ length: 12 }, () => []);
  let nbEvenements = 0;
  for (const e of evenements) {
    if (e.date.getFullYear() !== annee) continue;
    parMois[e.date.getMonth()][e.tone] += 1;
    pointsParMois[e.date.getMonth()].push({
      tone: e.tone,
      famille: e.famille ?? "controle",
    });
    nbEvenements += 1;
  }

  // Le dépassé d'abord : quand la place manque, c'est lui qu'on montre.
  const ORDRE_TONS: Record<EvenementGrille["tone"], number> = {
    alerte: 0,
    warn: 1,
    ok: 2,
  };
  for (const points of pointsParMois) {
    points.sort((a, b) => ORDRE_TONS[a.tone] - ORDRE_TONS[b.tone]);
  }

  const format = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const mois = parMois.map((nbParTon, m): MoisAnnee => {
    const premier = new Date(annee, m, 1);
    const dernier = new Date(annee, m + 1, 0);
    const brut = format.format(premier);
    return {
      mois: premier,
      libelle: brut.charAt(0).toUpperCase() + brut.slice(1),
      estMoisCourant:
        aujourdhui.getFullYear() === annee && aujourdhui.getMonth() === m,
      dansFenetre: fenetre
        ? dernier >= fenetre.debut && premier <= fenetre.fin
        : true,
      nbParTon,
      points: pointsParMois[m],
      nbTotal: nbParTon.alerte + nbParTon.warn + nbParTon.ok,
    };
  });

  return { annee, mois, nbEvenements };
}
