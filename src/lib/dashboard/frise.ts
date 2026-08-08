// Placement des événements sur la frise « Les 90 prochains jours »
// (bloc central du board éditorial 4a).
//
// Pure et déterministe : on lui passe la date du jour, on ne lit jamais
// l'horloge ici — c'est ce qui rend la frise testable et le rendu stable
// entre serveur et client.

export type EvenementFrise = {
  id: string;
  libelle: string;
  date: Date;
  tone: "alerte" | "warn" | "ok";
  equipement: string;
};

export type MarqueurFrise = {
  id: string;
  libelle: string;
  equipement: string;
  tone: EvenementFrise["tone"];
  /** Position sur l'axe, en pourcentage de l'horizon. */
  pct: number;
  /** Alternance au-dessus / au-dessous de l'axe, comme dans le design. */
  cote: "haut" | "bas";
  /** « 24 SEPT. » */
  libelleDate: string;
};

export type Frise = {
  /** Événements déjà dépassés — épinglés en tête de frise. */
  nbEnRetard: number;
  marqueurs: MarqueurFrise[];
  /** Événements dans l'horizon mais écartés faute de place. */
  nbMasques: number;
  mois: Array<{ label: string; pct: number }>;
};

/** Écart minimal entre deux marqueurs, en % de l'axe, pour rester lisible. */
export const ECART_MIN_PCT = 13;
/** Nombre maximal de marqueurs affichés simultanément. */
export const MAX_MARQUEURS = 5;

const JOUR_MS = 86400000;

function joursEntre(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / JOUR_MS;
}

function libelleDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  })
    .format(d)
    .toUpperCase();
}

export function construireFrise({
  evenements,
  aujourdhui,
  horizonJours = 90,
}: {
  evenements: EvenementFrise[];
  aujourdhui: Date;
  horizonJours?: number;
}): Frise {
  const enRetard = evenements.filter((e) => joursEntre(aujourdhui, e.date) < 0);

  const dansHorizon = evenements
    .filter((e) => {
      const j = joursEntre(aujourdhui, e.date);
      return j >= 0 && j <= horizonJours;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Sélection des marqueurs.
  //
  // Un filtre glouton « garde le premier, saute tout ce qui est trop
  // proche » s'effondre sur une série régulière : huit échéances espacées
  // de onze jours sur un axe de quatre-vingt-dix sont toutes sous le seuil
  // d'écart, et l'on n'en affiche qu'une. On échantillonne donc d'abord de
  // façon régulière sur toute la fenêtre, puis on ne recale que ce qui se
  // chevauche encore.
  const pctDe = (e: EvenementFrise) =>
    (joursEntre(aujourdhui, e.date) / horizonJours) * 100;

  const cible = Math.min(MAX_MARQUEURS, dansHorizon.length);
  const echantillon: EvenementFrise[] = [];

  if (cible > 0) {
    // La première alerte de la fenêtre est retenue d'office : c'est
    // l'information la moins remplaçable de la frise.
    const premiereAlerte = dansHorizon.find((e) => e.tone === "alerte");
    const indices = new Set<number>();
    if (premiereAlerte) indices.add(dansHorizon.indexOf(premiereAlerte));

    for (let i = 0; indices.size < cible && i < cible; i += 1) {
      const idx =
        cible === 1
          ? 0
          : Math.round((i * (dansHorizon.length - 1)) / (cible - 1));
      indices.add(idx);
    }

    echantillon.push(
      ...[...indices].sort((a, b) => a - b).map((i) => dansHorizon[i]),
    );
  }

  // Anti-chevauchement sur l'échantillon retenu.
  const retenus: EvenementFrise[] = [];
  for (const e of echantillon) {
    const dernier = retenus[retenus.length - 1];
    if (!dernier || pctDe(e) - pctDe(dernier) >= ECART_MIN_PCT) {
      retenus.push(e);
    } else if (e.tone === "alerte" && dernier.tone !== "alerte") {
      retenus[retenus.length - 1] = e;
    }
  }

  const marqueurs: MarqueurFrise[] = retenus.map((e, i) => ({
    id: e.id,
    libelle: e.libelle,
    equipement: e.equipement,
    tone: e.tone,
    pct: Math.min(
      100,
      Math.max(0, (joursEntre(aujourdhui, e.date) / horizonJours) * 100),
    ),
    cote: i % 2 === 0 ? "haut" : "bas",
    libelleDate: libelleDate(e.date),
  }));

  return {
    nbEnRetard: enRetard.length,
    marqueurs,
    nbMasques: dansHorizon.length - retenus.length,
    mois: construireMois(aujourdhui, horizonJours),
  };
}

/** Graduations mensuelles : le mois courant, puis chaque 1er du mois. */
function construireMois(
  aujourdhui: Date,
  horizonJours: number,
): Array<{ label: string; pct: number }> {
  const fmt = new Intl.DateTimeFormat("fr-FR", { month: "long" });
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const out = [{ label: cap(fmt.format(aujourdhui)), pct: 0 }];

  const curseur = new Date(
    aujourdhui.getFullYear(),
    aujourdhui.getMonth() + 1,
    1,
  );
  while (joursEntre(aujourdhui, curseur) <= horizonJours) {
    out.push({
      label: cap(fmt.format(curseur)),
      pct: (joursEntre(aujourdhui, curseur) / horizonJours) * 100,
    });
    curseur.setMonth(curseur.getMonth() + 1);
  }
  return out;
}
