// Ce qui est dépassé, ventilé par famille — source unique.
//
// Deux écrans annonçaient un nombre de retards, et les deux nombres se
// contredisaient : le badge de la sidebar comptait les vérifications
// périodiques, le bandeau du calendrier comptait les familles du registre
// d'échéances (ADR-010). L'écart avait fini par être *documenté*
// dans l'aide de l'écran plutôt que corrigé.
//
// Il n'y a désormais qu'un seul calcul, ici, appelé par la sidebar comme
// par la page : les deux lectures ne peuvent plus diverger, et chacune
// choisit explicitement le périmètre qu'elle annonce (ADR-015).

import { compterEtatCalendrier } from "./queries";
import { listerAutresEcheances } from "./echeances";
import type { EcheanceCalendrier, FamilleEcheance } from "./echeances";

export type RetardsParFamille = {
  /** Le dépassé de chaque famille, registre d'échéances **et**
   *  vérifications confondus. Toute famille est présente, à 0 si vide. */
  parFamille: Record<FamilleEcheance, number>;
  /**
   * Vérifications périodiques dépassées seules — sous-ensemble de
   * `parFamille.controle`, qui porte en plus les analyses légionelles
   * (rangées dans la famille `controle` par le registre).
   *
   * C'est ce nombre que porte le badge « Contrôles matériel » : il nomme
   * ce qui a un calendrier réglementaire d'équipement. Cf. ADR-015.
   */
  verifications: number;
  /** Toutes familles confondues. Badge « Tout ». */
  total: number;
};

const FAMILLES: FamilleEcheance[] = [
  "controle",
  "travaux",
  "operations",
  "papiers",
  "personnel",
];

/**
 * Ventile les retards à partir des deux flux déjà chargés.
 *
 * Pure et testée : c'est elle qui garantit que la sidebar et le bandeau
 * du calendrier disent la même chose. Le ton `alerte` est le seul
 * marqueur de dépassement du registre (cf. `EcheanceCalendrier`), et les
 * vérifications arrivent déjà comptées par `compterEtatCalendrier`.
 */
export function repartirRetards(
  autres: EcheanceCalendrier[],
  verifsEnRetard: number,
): RetardsParFamille {
  const parFamille = Object.fromEntries(
    FAMILLES.map((f) => [f, 0]),
  ) as Record<FamilleEcheance, number>;

  parFamille.controle = verifsEnRetard;
  for (const e of autres) {
    if (e.tone === "alerte") parFamille[e.famille] += 1;
  }

  return {
    parFamille,
    verifications: verifsEnRetard,
    total: FAMILLES.reduce((n, f) => n + parFamille[f], 0),
  };
}

/**
 * Les mêmes retards, lus en base.
 *
 * L'horloge est capturée **une fois** et partagée par les deux lectures :
 * deux `new Date()` séparés peuvent tomber de part et d'autre de minuit
 * et produire deux fenêtres décalées d'un jour (même précaution que
 * `listerEvenementsCalendrier`).
 */
export async function compterEnRetardParFamille(
  etablissementId: string,
  now: Date = new Date(),
): Promise<RetardsParFamille> {
  const [etat, autres] = await Promise.all([
    compterEtatCalendrier(etablissementId, now),
    listerAutresEcheances(etablissementId, now),
  ]);
  return repartirRetards(autres, etat.enRetard);
}
