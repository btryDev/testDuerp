// Fusion des deux flux d'échéances en un format unique, posable sur une
// grille (page Calendrier) comme sur une frise (board).
//
// Deux flux entrent ici :
//   - les **vérifications périodiques**, par leur flux historique dédié
//     (`listerEvenementsFenetre`) ;
//   - le **registre des autres modules** (ADR-010, `listerAutresEcheances`) :
//     actions, interventions, permis de feu, plans de prévention, mise à
//     jour du DUERP, attestations de vigilance.
//
// Ils en ressortent en `EvenementGrille`, avec leur famille et leur porte
// de sortie. La règle de fusion est **pure et testée**, et partagée par la
// page et le board : sans elle, le board ne montrait que les vérifications
// et taisait les actions, permis et attestations en retard — deux écrans
// qui prétendaient dire la même chose sans le faire.

import { listerEvenementsFenetre } from "@/lib/dashboard/queries";
import type { EvenementFenetre } from "@/lib/dashboard/queries";
import { JOURS_APRES } from "@/lib/dashboard/frise";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";
import { listerAutresEcheances, type EcheanceCalendrier } from "./echeances";
import type { FamilleEcheance } from "./echeances";
import type { EvenementGrille } from "./grille";

export type FiltresEvenements = {
  /** Partitionne : une famille choisie écarte toutes les autres. */
  famille?: FamilleEcheance;
  /** Qualifie le référentiel d'équipements — donc les contrôles seuls. */
  domaine?: DomaineObligation;
  /** Ne garder que le dépassé, toutes familles confondues. */
  urgentsSeulement?: boolean;
};

/**
 * Assemble les deux flux dans le format de la grille, trié par date.
 *
 * Les vérifications « à planifier » (ton `warn`) sont écartées : leur
 * `datePrevue` est une date de génération, pas une date choisie — les
 * poser sur un jour mentirait. Les appelants les signalent à part (le
 * bandeau « à planifier » du board, le compteur « sans date » de la
 * règle annuelle).
 *
 * C'est **la seule** différence assumée avec la liste mensuelle de la
 * page calendrier, qui les garde parce qu'elle affiche un badge de
 * statut à côté de chaque ligne : « à planifier » y est lisible, pas
 * déguisé en rendez-vous. Toute autre divergence entre les lectures est
 * un défaut, pas un choix.
 *
 * Le filtrage domaine / urgence des **vérifications** est fait en amont
 * par la requête (le domaine vit dans le référentiel, pas en base) : ce
 * qui arrive ici est déjà réduit. Ne restent à trancher que la
 * cohabitation des familles et l'urgence des autres échéances.
 */
export function fusionnerEvenements({
  verifications,
  autres,
  etablissementId,
  filtres = {},
}: {
  verifications: EvenementFenetre[];
  autres: EcheanceCalendrier[];
  etablissementId: string;
  filtres?: FiltresEvenements;
}): EvenementGrille[] {
  const { famille, domaine, urgentsSeulement } = filtres;

  const verifsVisibles =
    famille && famille !== "controle"
      ? []
      : verifications.filter((e) => e.tone !== "warn");

  // Le domaine écarte les autres familles en bloc : il ne les qualifie
  // pas, et prétendre le contraire ferait disparaître des échéances sans
  // que l'utilisateur comprenne pourquoi.
  const autresVisibles = domaine
    ? []
    : autres.filter(
        (e) =>
          (!famille || famille === e.famille) &&
          (!urgentsSeulement || e.tone === "alerte"),
      );

  return [
    ...verifsVisibles.map(
      (e): EvenementGrille => ({
        ...e,
        type: "verification",
        famille: "controle",
        href: `/etablissements/${etablissementId}/verifications/${e.id}`,
      }),
    ),
    ...autresVisibles.map(
      (e): EvenementGrille => ({
        id: e.id,
        libelle: e.libelle,
        date: e.date,
        tone: e.tone,
        type: e.type,
        // La grille appelle « equipement » ce qui se lit sous le libellé :
        // l'équipement pour un contrôle, l'origine pour le reste.
        equipement: e.origine,
        famille: e.famille,
        href: e.href,
      }),
    ),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Toutes les échéances datées de l'établissement, prêtes à poser sur une
 * grille ou une frise.
 *
 * **Fenêtre commune aux deux flux** : pas de borne basse — un retard
 * remonte quelle que soit son ancienneté — et `JOURS_APRES` à venir. Le
 * registre était auparavant non borné : une attestation valable jusqu'en
 * 2031 se posait seule sur la frise, dans une période où aucune
 * vérification n'était chargée.
 *
 * L'horloge est capturée **une fois** et partagée par les deux lectures :
 * deux `new Date()` séparés peuvent tomber de part et d'autre de minuit
 * et produire deux fenêtres décalées d'un jour.
 */
export async function listerEvenementsCalendrier(
  etablissementId: string,
  filtres: FiltresEvenements = {},
  now: Date = new Date(),
): Promise<EvenementGrille[]> {
  const [verifications, autres] = await Promise.all([
    listerEvenementsFenetre(etablissementId, JOURS_APRES, {
      domaine: filtres.domaine,
      urgentsSeulement: filtres.urgentsSeulement,
    }),
    listerAutresEcheances(etablissementId, now),
  ]);
  return fusionnerEvenements({
    verifications,
    autres,
    etablissementId,
    filtres,
  });
}
