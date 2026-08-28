// La collecte des faits que `couverture.ts` met en forme.
//
// Séparé pour la même raison que `reperterSansEcheance` l'est de
// `equipementsSansEcheance` : le calcul doit rester pur et testable sans base,
// et la lecture doit rester au même endroit pour tous les écrans qui
// l'affichent. Un écran qui collecterait ses faits lui-même finirait par en
// oublier un, et le bandeau dirait moins que la vérité sans que rien le
// signale.
//
// Ce module ne décide de rien. Il lit, projette, et passe la main. Toute
// phrase adressée au dirigeant vit dans `couverture.ts` ; tout constat sur les
// appareils vit dans `equipements/hors-referentiel.ts` ; tout constat sur le
// DUERP vit dans `duerps/couverture.ts`.

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { evaluerCouverture } from "@/lib/duerps/couverture";
import { lireReponsesActivites } from "@/lib/activites/reponses";
import {
  compterSansObligation,
  reperterSansEcheance,
} from "@/lib/equipements/hors-referentiel";
import { famillesNonPortees } from "./familles";
import { correspondanceSecteur } from "./secteur";
import {
  couvertureDeLEtablissement,
  type CouvertureEtablissement,
  type FaitsCouverture,
} from "./couverture";

/**
 * Rassemble les faits de couverture d'un établissement, puis les met en forme.
 *
 * Rend `null` si l'établissement n'existe pas ou n'appartient pas à
 * l'utilisateur — jamais un état « couvert » par défaut. Une couverture
 * rassurante sur un dossier introuvable est exactement l'hypothèse silencieuse
 * que ce dossier de modules existe pour empêcher.
 */
export async function couvertureDuDossier(
  etablissementId: string,
): Promise<CouvertureEtablissement | null> {
  const faits = await faitsDeCouverture(etablissementId);
  return faits === null ? null : couvertureDeLEtablissement(faits);
}

/** La lecture seule, exposée pour les écrans qui veulent les faits bruts. */
export async function faitsDeCouverture(
  etablissementId: string,
): Promise<FaitsCouverture | null> {
  const user = await requireUser();
  const etab = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    include: {
      // Le code NAF de l'entreprise : celui de l'établissement n'est
      // renseigné que lorsqu'il en diffère (cf. `illustration.ts`).
      entreprise: { select: { codeNaf: true } },
      // Le parc **en service** : un équipement désactivé ne génère plus rien.
      equipements: { where: { actif: true } },
      // « 1 établissement = 1 DUERP » est un invariant de base
      // (`Duerp.etablissementId @unique`) : le premier est le seul.
      duerps: { include: { unites: true } },
    },
  });
  if (!etab) return null;

  const equipementsMatching = etab.equipements.map((eq) => ({
    id: eq.id,
    libelle: eq.libelle,
    categorie: eq.categorie,
    caracteristiques: (eq.caracteristiques ?? null) as Record<
      string,
      unknown
    > | null,
  }));

  const sansEcheance = reperterSansEcheance(
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
    equipementsMatching,
  );

  const duerp = etab.duerps[0] ?? null;
  // Le tri « déclarée / écartée / sans réponse » et les cinq états viennent
  // d'`evaluerCouverture`, seule autorité sur la question (ADR-020). On ne le
  // refait pas ici : on projette ce qu'il rend.
  const couvertureDuerp = duerp
    ? evaluerCouverture({
        secteurId: duerp.referentielSecteurId ?? "",
        reponses: lireReponsesActivites(duerp.reponsesActivitesNonCouvertes),
        unites: duerp.unites,
      })
    : null;

  return {
    regime: {
      estERP: etab.estERP,
      estIGH: etab.estIGH,
      categorieErp: etab.categorieErp,
    },
    duerp: couvertureDuerp && {
      etat: couvertureDuerp.etat,
      secteurNom: couvertureDuerp.secteurNom,
      // Les deux manques de l'ADR-020 ne se confondent pas et ne s'additionnent
      // pas là-bas — ici on ne rend qu'un nombre pour dire « il y en a », et
      // c'est le DUERP qui les nomme un à un, chacun dans sa liste.
      nbActivitesDeclarees:
        couvertureDuerp.activitesDeclarees.length +
        couvertureDuerp.unitesHorsReferentiel.length,
      // Deux données déclarées comparées, aucune devinée. La règle vit dans
      // `secteur.ts` : écrite ici, entre deux appels Prisma, elle n'était
      // couverte par aucun test — une mutation qui la remplaçait par `true`
      // constant passait au vert.
      //
      // Les DEUX codes NAF, et c'est le type qui l'impose désormais :
      // `Etablissement.codeNaf` est optionnel, renseigné seulement s'il
      // diffère de celui de l'entreprise. Passer le premier seul faisait taire
      // l'axe sur tout établissement secondaire sans NAF propre — le cas
      // courant, et précisément celui qu'il devait signaler.
      correspondance: correspondanceSecteur(
        { etablissement: etab.codeNaf, entreprise: etab.entreprise.codeNaf },
        duerp?.referentielSecteurId,
      ),
    },
    equipements: {
      nbSansObligation: compterSansObligation(sansEcheance),
      nbEquipements: etab.equipements.length,
    },
    famillesNonPortees: famillesNonPortees(),
  };
}
