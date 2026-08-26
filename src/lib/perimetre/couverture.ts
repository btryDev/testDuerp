// Ce que Rojer couvre, et ce qu'il ne couvre pas.
//
// Le produit est construit pour les ERP de **5e catégorie** et pour les
// établissements soumis au Code du travail. Ce n'est pas un choix de
// développement, c'est une frontière réglementaire nette : l'article PE 1 § 1
// de l'arrêté du 22 juin 1990 écarte, pour la 5e catégorie, la totalité du
// livre II du règlement de sécurité. Au premier seuil franchi, ce livre
// s'applique d'un coup — dispositions générales (moyens de secours, service
// de sécurité incendie, désenfumage…) et dispositions particulières au type
// d'activité. Le référentiel n'en connaît rien.
//
// D'où ce module. Un établissement hors périmètre ne doit pas être bloqué —
// il n'y a rien de dangereux à consulter ses équipements — mais il doit
// **savoir** que ce qu'il lit est incomplet. Un calendrier et un registre qui
// paraissent complets alors qu'ils ignorent la moitié du règlement sont pires
// qu'un refus : le dirigeant s'y fierait devant une commission.
//
// Module **pur** : ni Prisma, ni React.

import type { CategorieErp } from "@/lib/referentiels/types-communs";

/**
 * Les catégories que le produit couvre.
 *
 * ⚠ Destinée à descendre auprès de l'enum qu'elle contraint
 * (`referentiels/types-communs`), et non à rester ici. Ce module importe déjà
 * `CategorieErp` du référentiel ; le jour où le référentiel voudra lire cette
 * constante — pour dire d'un article dépouillé qu'il est hors périmètre — on
 * aurait `referentiels → perimetre → referentiels`. Un cycle entre dossiers
 * finit toujours par se payer.
 *
 * Elle reste ici le temps que les branches se rejoignent : la déplacer depuis
 * deux branches séparées garantirait un conflit. Un seul endroit, quel qu'il
 * soit — jamais deux déclarations de ce que le produit couvre.
 */
export const CATEGORIES_COUVERTES: readonly CategorieErp[] = ["N5"];

export type Couverture =
  | { statut: "couvert" }
  | {
      /**
       * L'établissement sort du périmètre : ce que l'application montre est
       * incomplet, et le restera tant que le périmètre n'aura pas changé.
       */
      statut: "hors_perimetre";
      /** Ce qui l'en fait sortir, en une phrase adressée au dirigeant. */
      motif: string;
      /** Ce que l'application ne sait donc pas lui dire. */
      consequence: string;
    }
  | {
      /**
       * On ne peut pas trancher : la donnée qui décide manque. Ne jamais
       * traiter ce cas comme « couvert » — c'est exactement l'hypothèse
       * silencieuse qu'il faut éviter.
       */
      statut: "indetermine";
      motif: string;
      /** Le geste qui lève le doute. */
      quoiFaire: string;
    };

export type EtablissementCouverture = {
  estERP: boolean;
  estIGH: boolean;
  categorieErp: CategorieErp | null;
};

const LIBELLE_CATEGORIE: Record<CategorieErp, string> = {
  N1: "1ʳᵉ catégorie",
  N2: "2ᵉ catégorie",
  N3: "3ᵉ catégorie",
  N4: "4ᵉ catégorie",
  N5: "5ᵉ catégorie",
};

export function couvertureDeLEtablissement(
  etab: EtablissementCouverture,
): Couverture {
  // L'IGH d'abord : il est hors périmètre quelle que soit la suite, et le
  // dire en second laisserait croire que la catégorie ERP suffit à trancher.
  if (etab.estIGH) {
    return {
      statut: "hors_perimetre",
      motif:
        "Cet établissement est déclaré immeuble de grande hauteur (IGH).",
      consequence:
        "Le règlement de sécurité des IGH impose un service de sécurité permanent et des vérifications que cet outil ne connaît pas. Ce que vous lisez ici ne couvre pas votre régime.",
    };
  }

  // Un établissement qui n'est pas ERP ne relève que du Code du travail, que
  // le référentiel couvre sans distinction de catégorie.
  if (!etab.estERP) return { statut: "couvert" };

  if (etab.categorieErp === null) {
    return {
      statut: "indetermine",
      motif:
        "La catégorie de votre établissement recevant du public n'est pas renseignée.",
      quoiFaire:
        "Elle figure sur votre arrêté d'ouverture ou sur le procès-verbal de la commission de sécurité. C'est elle qui décide de ce que la réglementation vous impose — sans elle, votre calendrier et votre registre sont incomplets sans qu'on puisse vous dire de combien.",
    };
  }

  if (CATEGORIES_COUVERTES.includes(etab.categorieErp)) {
    return { statut: "couvert" };
  }

  return {
    statut: "hors_perimetre",
    motif: `Cet établissement relève de la ${LIBELLE_CATEGORIE[etab.categorieErp]}.`,
    consequence:
      "Rojer est construit pour les ERP de 5ᵉ catégorie. Au-dessus, le règlement de sécurité applique en entier son livre II — moyens de secours, service de sécurité incendie, et des obligations propres à votre type d'activité — que cet outil ne connaît pas. Votre calendrier et votre registre sont donc incomplets, et le resteront.",
  };
}
