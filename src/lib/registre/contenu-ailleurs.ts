// Ce qu'une fiche porte quand un autre écran la tient.
//
// L'inventaire des moyens de secours (parties 2.1 et 2.2), c'est le parc
// d'équipements ; les vérifications des moyens d'extinction et des
// installations (3.1 et 3.2), c'est le calendrier. Ces fiches n'ont pas de
// formulaire propre, et n'en auront jamais : ce serait une seconde saisie du
// même fait, qui divergerait de la première.
//
// Mais elles ne sont pas vides pour autant. L'écran d'une fiche affichait
// « cette fiche se tient depuis vos équipements » et un lien — on ouvrait
// une fiche de son propre registre pour y lire qu'elle était ailleurs.
// Trente et une fiches sur quarante-neuf : trente et un culs-de-sac, alors
// que le dirigeant venait justement voir ce qu'elle contient.
//
// Savoir quelle partie se lit dans quelle table est une connaissance du
// registre, pas de l'écran. Elle vit donc ici, avec le reste — la route
// appelle une fonction et ne connaît ni Prisma ni la carte des parties.
//
// Ce module ne rend que de la donnée : ni React, ni classe CSS. Les chemins
// en sont — un href canonique est un fait, sa décoration de provenance est
// une affaire de navigation, donc d'appelant.

import type { StatutVerification } from "@prisma/client";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { listerVerifications } from "@/lib/calendrier/queries";
import { formaterDateCourteFr } from "@/lib/dates";
import type { SectionRegistre } from "./sections";

/** Une ligne de ce que la fiche porte, telle qu'elle se lira. */
export type LigneTenue = {
  id: string;
  titre: string;
  /** La précision qui distingue deux lignes — un lieu, une date. */
  meta?: string;
  /** La fiche de l'objet. Canonique : l'appelant y ajoute sa provenance. */
  href?: string;
  /** Le statut d'une vérification, quand la ligne en est une. */
  statut?: StatutVerification;
};

export type ContenuAilleurs = {
  lignes: LigneTenue[];
  /** L'écran qui tient ces lignes, et où les modifier. */
  source: { libelle: string; href: string };
  /** Ce qu'on dit quand la fiche est due mais que rien ne la remplit encore. */
  vide: string;
};

/** Les parties dont le contenu est un inventaire d'équipements. */
const PARTIES_INVENTAIRE = new Set(["2.1", "2.2"]);
/** Les parties dont le contenu est une suite de vérifications. */
const PARTIES_VERIFICATIONS = new Set(["3.1", "3.2"]);

/**
 * Ce que porte une fiche tenue ailleurs, ou `null` si aucune ne la tient.
 *
 * `null` aussi quand la section ne déclare aucune catégorie d'équipement :
 * sans elle on ne saurait pas quoi lister, et un extrait faux serait pire
 * qu'un renvoi honnête.
 */
export async function lireContenuTenuAilleurs(
  etablissementId: string,
  partieId: string,
  section: SectionRegistre,
): Promise<ContenuAilleurs | null> {
  const categories = section.categoriesEquipement;
  if (!categories || categories.length === 0) return null;
  const cats = new Set<string>(categories);
  const base = `/etablissements/${etablissementId}`;

  if (PARTIES_INVENTAIRE.has(partieId)) {
    const equipements = await listerEquipementsDeLEtablissement(
      etablissementId,
    );
    return {
      lignes: equipements
        .filter((e) => cats.has(e.categorie))
        .map((e) => ({
          id: e.id,
          titre: e.libelle,
          meta: [e.batiment?.nom, e.localisation].filter(Boolean).join(" · "),
          href: `${base}/equipements/${e.id}`,
        })),
      source: { libelle: "vos équipements", href: `${base}/equipements` },
      vide: "Aucun équipement de cette catégorie n'est déclaré pour l'instant. La fiche figure à votre registre parce qu'elle vous est due — déclarez le matériel dans vos équipements et il apparaîtra ici.",
    };
  }

  if (PARTIES_VERIFICATIONS.has(partieId)) {
    const verifications = await listerVerifications(etablissementId);
    return {
      lignes: verifications
        .filter((v) => cats.has(v.equipement.categorie))
        .map((v) => ({
          id: v.id,
          titre: v.libelleObligation,
          meta: [
            v.equipement.libelle,
            v.dateRealisee
              ? `faite le ${formaterDateCourteFr(v.dateRealisee)}`
              : v.datePrevue
                ? `prévue le ${formaterDateCourteFr(v.datePrevue)}`
                : "à planifier",
          ].join(" · "),
          href: `${base}/verifications/${v.id}`,
          statut: v.statut,
        })),
      source: { libelle: "votre calendrier", href: `${base}/calendrier` },
      vide: "Aucune vérification n'est encore programmée pour ce matériel. Elle apparaîtra ici dès que votre calendrier en portera une.",
    };
  }

  return null;
}
