// Les écarts entre deux déclarations de l'utilisateur (ADR-024).
//
// Ce module fait le rapprochement que personne ne faisait : le référentiel
// dit ce qu'une obligation exige, l'annuaire dit ce que l'utilisateur a
// déclaré, et les deux ne se regardaient jamais. Il rend des FAITS ; les
// règles d'affichage et de priorité vivent dans `recommandations.ts`, qui
// reste pur.
//
// Ce qu'il ne dit jamais : que le dirigeant est en faute. Un domaine sans
// prestataire déclaré signifie très probablement qu'il en a un et ne l'a pas
// saisi. Une obligation qui suppose une personne nommée sans titre déclaré
// signifie que l'outil ne sait pas qui opère — pas que personne n'est
// habilité. Même registre que `equipements/hors-referentiel.ts` : on nomme un
// état de l'outil, on ne qualifie pas la situation de l'établissement.
//
// Pourquoi passer par le moteur de matching et non par les `Verification`
// déjà en base : une obligation de périodicité `autre` — un état permanent —
// ne produit AUCUNE ligne de calendrier. L'habilitation électrique est
// précisément dans ce cas. Lire la base ne l'aurait jamais vue, et c'est
// exactement le cas qui a fait naître cet ADR.

import type { DomainePrestataire } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { determineObligationsApplicables } from "@/lib/matching";
import { LABEL_DOMAINE as LABEL_DOMAINE_OBLIGATION } from "@/lib/calendrier/labels";
import { domainesSansPrestataire } from "@/lib/prestataires/domaines";
import type { Obligation } from "@/lib/referentiels/conformite/types";

export type Transmissions = {
  domainesSansPrestataire: Array<{ domaine: string; libelle: string }>;
  obligationsSupposantUnePersonne: Array<{ id: string; libelle: string }>;
};

export const AUCUNE_TRANSMISSION: Transmissions = {
  domainesSansPrestataire: [],
  obligationsSupposantUnePersonne: [],
};

/**
 * Le calcul, sans la base : la partie testable.
 *
 * `titresDeclares` vaut 0 quand l'employeur n'a déclaré aucun titre. C'est le
 * seul seuil : dès qu'il en déclare un, on cesse de signaler, parce qu'à
 * partir de là l'outil ne peut plus distinguer « il n'a pas fini de saisir »
 * de « il a saisi ce qui existe ». Insister au-delà reviendrait à réclamer un
 * titre qu'on ne sait pas dire dû.
 */
export function rapprocher(
  applicables: readonly Obligation[],
  domainesPrestatairesDeclares: readonly DomainePrestataire[],
  titresDeclares: number,
): Transmissions {
  const domaines = domainesSansPrestataire(
    applicables,
    domainesPrestatairesDeclares,
  ).map((d) => ({
    domaine: d,
    libelle: LABEL_DOMAINE_OBLIGATION[d],
  }));

  const personnes =
    titresDeclares > 0
      ? []
      : applicables
          .filter((o) =>
            o.transmet.some((t) => t.vers === "salarie_designe"),
          )
          .map((o) => ({ id: o.id, libelle: o.libelle }));

  return {
    domainesSansPrestataire: domaines,
    obligationsSupposantUnePersonne: personnes,
  };
}

/** La même lecture, branchée sur la base. Trois requêtes, aucune boucle. */
export async function chargerTransmissions(
  etablissementId: string,
  userId: string,
): Promise<Transmissions> {
  const etab = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId } },
    include: { equipements: { where: { actif: true } } },
  });
  if (!etab) return AUCUNE_TRANSMISSION;

  const [prestataires, titresDeclares] = await Promise.all([
    // `etab.id` et non le paramètre : l'appartenance vient d'être établie
    // par la lecture ci-dessus, et c'est SON identifiant qu'on propage — pas
    // celui reçu de l'appelant. La garantie ne dépend donc pas de ce que
    // l'appelant a vérifié avant.
    prisma.prestataire.findMany({
      where: { etablissementId: etab.id },
      select: { domaines: true },
    }),
    prisma.titreSalarie.count({
      where: { salarie: { etablissementId: etab.id, actif: true } },
    }),
  ]);

  const applicables = determineObligationsApplicables(
    {
      id: etab.id,
      effectifSurSite: etab.effectifSurSite,
      estEtablissementTravail: etab.estEtablissementTravail,
      estERP: etab.estERP,
      estIGH: etab.estIGH,
      estHabitation: etab.estHabitation,
      typeErp: etab.typeErp,
      categorieErp: etab.categorieErp,
      classeIgh: etab.classeIgh,
    },
    etab.equipements.map((eq) => ({
      id: eq.id,
      libelle: eq.libelle,
      categorie: eq.categorie,
      caracteristiques: (eq.caracteristiques ?? null) as Record<
        string,
        unknown
      > | null,
    })),
  ).map((a) => a.obligation);

  return rapprocher(
    applicables,
    prestataires.flatMap((p) => p.domaines),
    titresDeclares,
  );
}
