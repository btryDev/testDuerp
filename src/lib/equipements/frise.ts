// La vie d'un équipement, posée sur un axe.
//
// La fiche d'un équipement répond à deux questions que ni le calendrier ni
// le registre ne posent ensemble : « depuis quand est-il là ? » et « où en
// est-on dans son cycle ? ». Une liste de dates y répond mal — il faut les
// soustraire mentalement pour voir que la dernière vérification date de six
// mois et que la prochaine tombe dans huit jours.
//
// Ici, les jalons sont projetés sur un axe qui va du premier événement
// connu au dernier, **et qui contient toujours aujourd'hui** : une frise de
// la vie d'un appareil dont le présent tomberait hors cadre ne dirait plus
// où l'on en est, ce qui est pourtant sa seule raison d'être.
//
// Le module est **pur** : il ne connaît ni Prisma ni React, et ne rend
// aucune couleur — l'état de chaque jalon reste le vocabulaire du registre
// (`RegistreLigne`), et c'est la vue qui va chercher le champ correspondant
// dans `CHAMP_ETAT`.

import { joursCivilsEntre } from "@/lib/dates";
import type { RegistreLigne } from "@/lib/calendrier/etats";

/** Un point de la frise : une date, ce qu'elle dit, l'état qu'elle porte. */
export type JalonFrise = {
  cle: string;
  date: Date;
  /** Le mot posé sous le point — « Conforme », « Mise en service ». */
  libelle: string;
  etat: RegistreLigne;
  /**
   * Le jalon qui appelle un geste — l'échéance courante. Rendu plus gros,
   * avec un halo. Un seul par frise, sinon aucun ne ressort.
   */
  vedette?: boolean;
  /**
   * Jalon secondaire : il partage l'axe sans revendiquer l'attention (les
   * autres échéances ouvertes, une action corrective entre deux visites).
   */
  second?: boolean;
};

/**
 * Où s'écrit l'étiquette. Deux rangées, parce qu'un repère qui appelle un
 * geste tombe presque toujours près d'aujourd'hui : sur une seule ligne,
 * les deux mots se chevauchent systématiquement.
 */
export type RangeeFrise = "haute" | "basse";

export type JalonPose = JalonFrise & {
  position: number;
  rangee: RangeeFrise;
  /** Faux quand un voisin trop proche a déjà pris la place : le point
   *  reste, le mot s'efface. */
  etiquette: boolean;
};

export type Frise = {
  /** Les jalons, triés par date croissante, avec leur place. */
  jalons: JalonPose[];
  /** Position du repère « aujourd'hui ». Toujours dans [0, 1]. */
  aujourdhui: number;
  debut: Date;
  fin: Date;
};

/**
 * Écart minimal entre deux étiquettes d'une même rangée, en fraction
 * d'axe. Relevé sur la maquette : en deçà, les libellés se touchent.
 */
const ECART_MIN = 0.16;

/** Ramène une position dans [0, 1]. */
function borner(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Décide quelles étiquettes d'une rangée s'écrivent. On garde toujours la
 * première et la dernière — les bornes situent l'axe — puis on avance de
 * gauche à droite en sautant ce qui est trop serré.
 */
function poserEtiquettes(
  positions: number[],
  reserves: number[],
): boolean[] {
  const out = positions.map(() => false);
  if (positions.length === 0) return out;

  const trop = (p: number, refs: number[]) =>
    refs.some((r) => Math.abs(p - r) < ECART_MIN);

  const prises = [...reserves];
  const ordre = [
    0,
    positions.length - 1,
    ...positions.map((_, i) => i).slice(1, -1),
  ];
  for (const i of ordre) {
    if (out[i]) continue;
    if (trop(positions[i], prises)) continue;
    out[i] = true;
    prises.push(positions[i]);
  }
  return out;
}

/**
 * Projette des jalons sur un axe qui contient aussi le jour courant.
 *
 * Rend `null` quand il n'y a rien à montrer : sans deux repères au moins,
 * une frise réduite à un point mentirait sur ce qu'on sait.
 *
 * Les écarts sont comptés en **jours civils** (ADR-011) : mesurer en
 * millisecondes ferait glisser les points d'un cheveu au passage à l'heure
 * d'été, ce qui n'a aucun sens sur une échelle qui couvre des années.
 */
export function construireFrise({
  jalons,
  maintenant,
}: {
  jalons: JalonFrise[];
  maintenant: Date;
}): Frise | null {
  if (jalons.length < 2) return null;

  const tries = [...jalons].sort((a, b) => a.date.getTime() - b.date.getTime());
  const premier = tries[0].date;
  const dernier = tries[tries.length - 1].date;
  const debut =
    joursCivilsEntre(premier, maintenant) < 0 ? maintenant : premier;
  const fin = joursCivilsEntre(dernier, maintenant) > 0 ? maintenant : dernier;
  const etendue = joursCivilsEntre(debut, fin);

  const positions =
    etendue <= 0
      ? tries.map(() => 0)
      : tries.map((j) => borner(joursCivilsEntre(debut, j.date) / etendue));
  const aujourdhui =
    etendue <= 0 ? 0 : borner(joursCivilsEntre(debut, maintenant) / etendue);

  const rangees: RangeeFrise[] = tries.map((j) =>
    j.vedette || j.second ? "basse" : "haute",
  );

  // Le repère du jour occupe la rangée haute : il est écrit quoi qu'il
  // arrive, les autres étiquettes lui cèdent la place.
  const indicesHaute = rangees.flatMap((r, i) => (r === "haute" ? [i] : []));
  const indicesBasse = rangees.flatMap((r, i) => (r === "basse" ? [i] : []));
  const etiquettesHaute = poserEtiquettes(
    indicesHaute.map((i) => positions[i]),
    [aujourdhui],
  );
  const etiquettesBasse = poserEtiquettes(
    indicesBasse.map((i) => positions[i]),
    [],
  );

  const etiquette = tries.map(() => false);
  indicesHaute.forEach((i, k) => (etiquette[i] = etiquettesHaute[k]));
  indicesBasse.forEach((i, k) => (etiquette[i] = etiquettesBasse[k]));

  return {
    jalons: tries.map((j, i) => ({
      ...j,
      position: positions[i],
      rangee: rangees[i],
      etiquette: etiquette[i],
    })),
    aujourdhui,
    debut,
    fin,
  };
}
