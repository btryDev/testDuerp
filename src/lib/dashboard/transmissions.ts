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
import { obligationsConformite } from "@/lib/referentiels/conformite";
import type {
  DomaineObligation,
  Obligation,
} from "@/lib/referentiels/conformite/types";

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
 * `titresDeclares` porte les **identifiants d'obligation** des titres saisis,
 * pas leur nombre. La distinction n'est pas cosmétique :
 *
 *  - une transmission qui **nomme** le titre attendu (`titre` non nul) se tait
 *    dès que CE titre est déclaré, et pas avant. Un compte global aurait fait
 *    taire une suggestion de CACES parce qu'un cuisinier détient une
 *    attestation SST — un faux négatif muet, la famille de défauts que
 *    l'ADR-022 existe pour supprimer ;
 *  - une transmission qui ne peut pas le nommer (`titre: null`, faute de
 *    catalogue) se tait dès qu'un titre **du même domaine** est déclaré.
 *
 * ## Pourquoi le domaine, et non « n'importe quel titre »
 *
 * Cette seconde règle disait « dès qu'un titre QUELCONQUE est déclaré ». Elle
 * était juste tant que le catalogue tenait en une ligne : le seul titre
 * déclarable étant l'attestation médicale d'habilitation électrique, « un titre
 * quelconque » et « un titre d'électricité » désignaient la même chose.
 *
 * Le lot 7 a porté le catalogue à neuf lignes, et cette équivalence est tombée
 * — en éteignant le signal qu'elle devait porter. Un restaurateur qui déclare
 * une installation électrique voit « une habilitation est peut-être due,
 * personne n'est déclaré ». Il saisit alors la formation à la sécurité de sa
 * plongeuse — **le premier geste que le catalogue élargi l'invite à faire** —
 * et le signal disparaît définitivement, alors que rien n'a été dit de
 * l'habilitation. Le lot qui devait compléter le mécanisme l'aurait éteint.
 *
 * Le domaine est le bon grain parce que c'est celui de la question posée :
 * `elec-travail-habilitation-personnel` demande « quelqu'un est-il habilité en
 * ÉLECTRICITÉ ? ». Un titre de secourisme n'y répond pas ; un titre
 * d'électricité, oui — et il n'y en a qu'un au catalogue, donc le déclarer
 * signifie bien qu'on a saisi ce qu'on savait saisir dans ce domaine.
 *
 * Ce n'est pas parfait, et il faut le dire : le jour où deux titres
 * d'électricité coexisteront au catalogue, déclarer le premier fera taire une
 * transmission qui visait peut-être le second. Ce sera le moment de faire
 * nommer le titre à la transmission plutôt que de laisser `null` — c'est-à-dire
 * de résoudre la cause, le `titre: null` lui-même, plutôt que d'affiner encore
 * le repli.
 */
export function rapprocher(
  applicables: readonly Obligation[],
  domainesPrestatairesDeclares: readonly DomainePrestataire[],
  titresDeclares: ReadonlySet<string>,
): Transmissions {
  const domaines = domainesSansPrestataire(
    applicables,
    domainesPrestatairesDeclares,
  ).map((d) => ({
    domaine: d,
    libelle: LABEL_DOMAINE_OBLIGATION[d],
  }));

  // Les domaines dans lesquels au moins un titre est déclaré. Construit une
  // fois : `rapprocher` est appelée par le tableau de bord à chaque rendu.
  const domainesDesTitresDeclares = new Set<DomaineObligation>();
  for (const o of obligationsConformite) {
    if (titresDeclares.has(o.id)) domainesDesTitresDeclares.add(o.domaine);
  }

  const personnes = applicables
    .filter((o) =>
      o.transmet.some(
        (t) =>
          t.vers === "salarie_designe" &&
          (t.titre === null
            ? !domainesDesTitresDeclares.has(o.domaine)
            : !titresDeclares.has(t.titre)),
      ),
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
    // `groupBy` et non `count` : on a besoin de SAVOIR lesquels sont
    // déclarés, pas combien. Cf. `rapprocher`.
    prisma.titreSalarie.groupBy({
      by: ["obligationId"],
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
      // Ces deux-là manquaient. La première rédaction de ce commentaire
      // parlait d'« une » divergence et la déclarait résorbée : il y en avait
      // deux autres, dans `equipements/hors-referentiel.ts` et dans la page
      // guide. Corriger un site sur trois et l'écrire au singulier était la
      // faute que ce lot corrige ailleurs.
      //
      // La cause tenait au type : les deux champs y étaient optionnels
      // « pour ne pas casser les projections existantes », donc les omettre
      // compilait. Ils sont requis depuis (`matching/types.ts`).
      personnesPresentesHabituellement: etab.personnesPresentesHabituellement,
      manipuleMatieresR422722: etab.manipuleMatieresR422722,
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
    new Set(titresDeclares.map((t) => t.obligationId)),
  );
}
