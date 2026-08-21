// Ce qui est dépassé — et ce qui arrive — ventilé par famille, source unique.
//
// Deux écrans annonçaient un nombre de retards, et les deux nombres se
// contredisaient : le badge de la sidebar comptait les vérifications
// périodiques, le bandeau du calendrier comptait les familles du registre
// d'échéances (ADR-010). L'écart avait fini par être *documenté*
// dans l'aide de l'écran plutôt que corrigé.
//
// Le tableau de bord, lui, en avait fabriqué deux de plus : son bandeau
// d'accueil additionnait vérifications et actions (deux familles sur
// cinq), et la pastille de son widget « Échéances » comptait les dates
// passées de la frise — donc aussi celles d'un permis de feu **clos**,
// que le registre marque `ok`. Trois nombres sur un écran, aucun faux,
// tous nommés « en retard ».
//
// Il n'y a désormais qu'un seul calcul, ici, appelé par la sidebar, la
// page calendrier et le tableau de bord : les lectures ne peuvent plus
// diverger, et chacune choisit explicitement le périmètre qu'elle annonce
// (ADR-015).

import { compterEtatCalendrier } from "./queries";
import { filtrerParBatiment, listerAutresEcheances } from "./echeances";
import type { EcheanceCalendrier, FamilleEcheance } from "./echeances";
import { JOURS_HORIZON_PROCHE } from "@/lib/dates";
import { estDansLesProchainsJours } from "@/lib/dates/retard";

/** Une ventilation : le détail par famille, et sa somme. */
export type VentilationEcheances = {
  /** Toute famille est présente, à 0 si vide. */
  parFamille: Record<FamilleEcheance, number>;
  /** Toutes familles confondues. */
  total: number;
};

export type RetardsParFamille = VentilationEcheances & {
  /**
   * Vérifications périodiques dépassées seules — sous-ensemble de
   * `parFamille.controle`, qui porte en plus les analyses légionelles
   * (rangées dans la famille `controle` par le registre).
   *
   * C'est ce nombre que porte le badge « Contrôles matériel » : il nomme
   * ce qui a un calendrier réglementaire d'équipement. Cf. ADR-015.
   */
  verifications: number;
};

/**
 * L'état des échéances d'un établissement, en deux ventilations de même
 * périmètre : ce qui est dépassé, et ce qui tombe dans les trente jours
 * sans l'être encore. Les deux ensembles sont disjoints — une échéance
 * dépassée n'est pas « à venir ».
 */
export type EtatEcheances = {
  retards: RetardsParFamille;
  sous30j: VentilationEcheances;
  /**
   * Vérifications sans date de rendez-vous et pas encore dépassées. Ni
   * un retard ni un engagement daté : annoncé à part, jamais fondu dans
   * les deux ventilations ci-dessus.
   */
  verifsAPlanifier: number;
};

const FAMILLES: FamilleEcheance[] = [
  "controle",
  "travaux",
  "operations",
  "papiers",
  "personnel",
];

/** Un compteur par famille, toutes à zéro. */
function ventilationVide(): Record<FamilleEcheance, number> {
  return Object.fromEntries(FAMILLES.map((f) => [f, 0])) as Record<
    FamilleEcheance,
    number
  >;
}

function totaliser(
  parFamille: Record<FamilleEcheance, number>,
): VentilationEcheances {
  return {
    parFamille,
    total: FAMILLES.reduce((n, f) => n + parFamille[f], 0),
  };
}

/**
 * Ventile les retards à partir des deux flux déjà chargés.
 *
 * Pure et testée : c'est elle qui garantit que la sidebar, le bandeau du
 * calendrier et le tableau de bord disent la même chose. Le ton `alerte`
 * est le seul marqueur de dépassement du registre (cf. `EcheanceCalendrier`) —
 * pas la date, qui dirait « en retard » d'un permis de feu clos la semaine
 * dernière — et les vérifications arrivent déjà comptées par
 * `compterEtatCalendrier`.
 */
export function repartirRetards(
  autres: EcheanceCalendrier[],
  verifsEnRetard: number,
): RetardsParFamille {
  const parFamille = ventilationVide();

  parFamille.controle = verifsEnRetard;
  for (const e of autres) {
    if (e.tone === "alerte") parFamille[e.famille] += 1;
  }

  return { ...totaliser(parFamille), verifications: verifsEnRetard };
}

/**
 * Même ventilation, pour l'horizon proche : ce qui tombe d'aujourd'hui à
 * `JOURS_HORIZON_PROCHE` jours **sans être en retard**.
 *
 * Le registre ne porte pas de compteur « à venir » : une échéance non
 * dépassée y est simplement `ok`, quelle que soit sa date. C'est donc ici
 * qu'on applique la fenêtre, avec le prédicat civil partagé (ADR-011) et
 * l'horloge injectée — la même que celle qui a produit les tons.
 */
export function repartirSous30j(
  autres: EcheanceCalendrier[],
  verifsAVenir: number,
  now: Date,
): VentilationEcheances {
  const parFamille = ventilationVide();

  parFamille.controle = verifsAVenir;
  for (const e of autres) {
    if (e.tone === "alerte") continue;
    if (estDansLesProchainsJours(e.date, now, JOURS_HORIZON_PROCHE)) {
      parFamille[e.famille] += 1;
    }
  }

  return totaliser(parFamille);
}

/**
 * Les mêmes échéances, lues en base.
 *
 * L'horloge est capturée **une fois** et partagée par les deux lectures :
 * deux `new Date()` séparés peuvent tomber de part et d'autre de minuit
 * et produire deux fenêtres décalées d'un jour (même précaution que
 * `listerEvenementsCalendrier`).
 *
 * `batimentId` restreint les deux flux au même lieu (ADR-019) : les
 * vérifications par leur équipement, le registre par `filtrerParBatiment`,
 * qui laisse passer ce qui concerne l'établissement entier.
 */
export async function compterEtatEcheances(
  etablissementId: string,
  now: Date = new Date(),
  filtres: { batimentId?: string } = {},
): Promise<EtatEcheances> {
  const [etat, autresTous] = await Promise.all([
    compterEtatCalendrier(etablissementId, now, {
      batimentId: filtres.batimentId,
    }),
    listerAutresEcheances(etablissementId, now),
  ]);
  const autres = filtrerParBatiment(autresTous, filtres.batimentId);

  return {
    retards: repartirRetards(autres, etat.enRetard),
    sous30j: repartirSous30j(autres, etat.aVenir, now),
    verifsAPlanifier: etat.aPlanifier,
  };
}

/**
 * Les seuls retards — ce que lit la sidebar, qui n'a pas de fenêtre à
 * annoncer.
 */
export async function compterEnRetardParFamille(
  etablissementId: string,
  now: Date = new Date(),
): Promise<RetardsParFamille> {
  const { retards } = await compterEtatEcheances(etablissementId, now);
  return retards;
}
