/**
 * Seed de développement — donne de la matière au tableau de bord.
 *
 * Le board éditorial montre des retards, une moyenne de retard et un
 * anneau de répartition : sur une base quasi vide, ces blocs sont vrais
 * mais illisibles. Ce script crée un plan d'actions réaliste sur un
 * établissement **existant**, pour juger le rendu sur de vraies requêtes
 * plutôt que sur des données de façade.
 *
 *   pnpm db:seed                       → premier établissement trouvé
 *   pnpm db:seed <etablissementId>
 *   pnpm db:seed --planifier           → pose aussi des dates sur les
 *                                        vérifications encore à planifier
 *   pnpm db:seed --serie               → ajoute les occurrences suivantes
 *                                        de chaque vérification, jusqu'à
 *                                        24 mois (implique --planifier)
 *
 * `--planifier` et `--serie` sont explicites parce qu'ils ÉCRIVENT sur des
 * lignes métier existantes (datePrevue et statut de `Verification`),
 * contrairement au reste du seed qui ne fait qu'ajouter ses propres
 * actions. À réserver à une base de développement.
 *
 * Note : la régénération du calendrier depuis l'app (`genererCalendrier`)
 * supprime les occurrences non réalisées et n'en recrée qu'une par couple
 * (obligation × équipement). Les séries semées ici sont donc du décor de
 * développement, effacé au premier « Actualiser » — c'est voulu, elles ne
 * doivent jamais devenir une source de vérité.
 *
 * Idempotent : les actions posées portent un marqueur `[seed]` dans leur
 * description et sont remplacées à chaque exécution. Rien d'autre n'est
 * touché — aucune donnée saisie par l'utilisateur n'est modifiée.
 */

import {
  PrismaClient,
  type DomainePrestataire,
  type Periodicite,
  type PrioriteIntervention,
  type StatutAction,
  type StatutIntervention,
  type TypeAction,
} from "@prisma/client";

const prisma = new PrismaClient();

const MARQUEUR = "[seed]";
const JOUR = 86400000;

/** Fenêtre consultable de la frise, en jours — cf. `lib/dashboard/frise`. */
const HORIZON = 730;
/**
 * Occurrences semées au maximum par couple obligation × équipement.
 *
 * Une obligation hebdomadaire produirait sinon une centaine de lignes sur
 * deux ans, pour un axe illisible et une base de dev inutilement lourde.
 */
const MAX_OCCURRENCES = 8;

/**
 * Copie locale de `PERIODICITE_EN_JOURS` (`lib/referentiels/types-communs`).
 * Le seed tourne hors du bundle Next : on ne traverse pas l'alias `@/`
 * pour une table de onze entrées, mais elle doit rester alignée.
 */
const PERIODICITE_EN_JOURS: Record<Periodicite, number | null> = {
  hebdomadaire: 7,
  mensuelle: 30,
  trimestrielle: 91,
  semestrielle: 182,
  annuelle: 365,
  biennale: 730,
  triennale: 1095,
  quinquennale: 1825,
  decennale: 3650,
  mise_en_service_uniquement: null,
  autre: null,
};

/** Date décalée de `jours` par rapport à maintenant (négatif = passé). */
function dans(jours: number): Date {
  return new Date(Date.now() + jours * JOUR);
}

type Gabarit = {
  libelle: string;
  type: TypeAction;
  statut: StatutAction;
  /** Échéance relative en jours ; négatif = en retard. */
  echeanceJours: number | null;
  criticite: number;
  leveeIlYaJours?: number;
};

// Un plan d'actions plausible pour un établissement de restauration :
// trois retards d'ancienneté variable (pour que la moyenne ait du sens),
// des actions à venir, et des levées récentes qui alimentent l'anneau.
const ACTIONS: Gabarit[] = [
  {
    libelle: "Remplacer le tapis antidérapant de la plonge",
    type: "protection_collective",
    statut: "ouverte",
    echeanceJours: -21,
    criticite: 3,
  },
  {
    libelle: "Reprendre l'éclairage de la réserve sèche",
    type: "reduction_source",
    statut: "en_cours",
    echeanceJours: -9,
    criticite: 2,
  },
  {
    libelle: "Formation gestes et postures — équipe du soir",
    type: "formation",
    statut: "ouverte",
    echeanceJours: -3,
    criticite: 2,
  },
  {
    libelle: "Poser une signalétique sol glissant en zone de cuisson",
    type: "organisationnelle",
    statut: "ouverte",
    echeanceJours: 12,
    criticite: 2,
  },
  {
    libelle: "Renouveler les gants anti-coupure",
    type: "protection_individuelle",
    statut: "ouverte",
    echeanceJours: 34,
    criticite: 1,
  },
  {
    libelle: "Mettre à jour la consigne d'évacuation affichée",
    type: "organisationnelle",
    statut: "en_cours",
    echeanceJours: 21,
    criticite: 2,
  },
  {
    libelle: "Sécuriser le stockage des produits lessiviels",
    type: "suppression",
    statut: "levee",
    echeanceJours: -40,
    criticite: 3,
    leveeIlYaJours: 8,
  },
  {
    libelle: "Installer un repose-pied au poste d'encaissement",
    type: "reduction_source",
    statut: "levee",
    echeanceJours: -30,
    criticite: 1,
    leveeIlYaJours: 19,
  },
];

// Des signalements plausibles, pour nourrir la famille « Corrections »
// du calendrier : un retard, un assigné, un en cours.
const INTERVENTIONS: {
  titre: string;
  priorite: PrioriteIntervention;
  statut: StatutIntervention;
  echeanceJours: number;
  localisation: string;
  assigneA?: string;
}[] = [
  {
    titre: "Fuite au plafond de la réserve",
    priorite: "urgente",
    statut: "ouvert",
    echeanceJours: -5,
    localisation: "Réserve sèche",
  },
  {
    titre: "Poignée de la chambre froide à refixer",
    priorite: "moyenne",
    statut: "assigne",
    echeanceJours: 9,
    localisation: "Chambre froide",
    assigneA: "Karim (maintenance)",
  },
  {
    titre: "Néon qui clignote en salle",
    priorite: "basse",
    statut: "en_cours",
    echeanceJours: 25,
    localisation: "Salle",
  },
];

// Trois prestataires aux pièces de vigilance datées — une expirée, une
// qui expire bientôt, une à jour — pour nourrir la famille « Documents »
// du calendrier et les alertes vigilance.
const PRESTATAIRES: {
  raisonSociale: string;
  domaines: DomainePrestataire[];
  contactNom: string;
  contactEmail: string;
  estOrganismeAgree?: boolean;
  urssafJours: number;
  rcProJours: number;
}[] = [
  {
    raisonSociale: "Vérif Élec Atlantique",
    domaines: ["electricite", "bureau_controle"],
    contactNom: "M. Lopez",
    contactEmail: "contact@verif-elec-atlantique.fr",
    estOrganismeAgree: true,
    urssafJours: 18, // expire bientôt (seuil d'alerte : 30 j)
    rcProJours: 210,
  },
  {
    raisonSociale: "Sécurité Incendie Ouest",
    domaines: ["incendie"],
    contactNom: "Mme Robin",
    contactEmail: "sav@securite-incendie-ouest.fr",
    urssafJours: -12, // expirée
    rcProJours: 90,
  },
  {
    raisonSociale: "Nettoyage Pro Services",
    domaines: ["nettoyage"],
    contactNom: "M. Diallo",
    contactEmail: "contact@nettoyage-pro-services.fr",
    urssafJours: 150,
    rcProJours: 320,
  },
];

/**
 * Étale les vérifications encore `a_planifier` sur les deux ans à venir.
 *
 * Sans ça, un établissement dont le calendrier a été généré mais jamais
 * planifié n'a aucune échéance datée : la frise est vide, et c'est exact.
 * Cette étape simule le travail de programmation qu'un dirigeant ferait
 * dans l'app, pour pouvoir juger le rendu d'une frise remplie.
 *
 * Répartition : une poignée reste dépassée, étalée sur les trois mois
 * écoulés (la frise défile aussi vers le passé, il faut donc y trouver
 * quelque chose), le reste s'échelonne sur la fenêtre consultable.
 */
async function planifierVerifications(etablissementId: string) {
  const aPlanifier = await prisma.verification.findMany({
    where: { etablissementId, statut: "a_planifier", dateRealisee: null },
    select: { id: true },
    orderBy: { datePrevue: "asc" },
  });

  if (aPlanifier.length === 0) {
    console.log("  aucune vérification à planifier");
    return;
  }

  // ~15 % restent en retard, le reste part dans le futur.
  const nbEnRetard = Math.max(1, Math.round(aPlanifier.length * 0.15));
  const nbFutures = aPlanifier.length - nbEnRetard;

  let n = 0;
  for (const [i, v] of aPlanifier.entries()) {
    const jours =
      i < nbEnRetard
        ? // Retards répartis entre −80 et −3 jours : la voie du passé
          // n'est ni vide ni tassée sur la veille.
          -(3 + Math.round((i / Math.max(1, nbEnRetard - 1)) * 77))
        : Math.round(((i - nbEnRetard) / Math.max(1, nbFutures - 1)) * HORIZON) + 4;

    await prisma.verification.update({
      where: { id: v.id },
      data: {
        datePrevue: dans(jours),
        statut: jours < 0 ? "depassee" : "planifiee",
      },
    });
    n += 1;
  }

  console.log(
    `  ${n} vérification(s) programmée(s) — dont ${nbEnRetard} laissée(s) en retard`,
  );
}

/**
 * Ajoute les occurrences suivantes de chaque vérification, à sa propre
 * périodicité, jusqu'au bout de la fenêtre consultable.
 *
 * L'app, elle, ne matérialise que la **prochaine** occurrence par couple
 * (obligation × équipement) : c'est un choix produit — on ne veut pas
 * afficher un calendrier prédictif qui se périmerait à la première vérif
 * réalisée. Une frise de 24 mois nourrie de cette seule occurrence est
 * donc creuse au-delà du premier trimestre. On sème ici la suite, pour
 * juger le rendu d'une charge réaliste.
 */
async function semerSeries(etablissementId: string) {
  const base = await prisma.verification.findMany({
    where: { etablissementId, dateRealisee: null },
    orderBy: { datePrevue: "asc" },
  });

  // Idempotence : on retombe d'abord sur l'invariant de l'app — une seule
  // occurrence non réalisée par couple — puis on resème par-dessus.
  const vues = new Set<string>();
  const surplus: string[] = [];
  const tetes: typeof base = [];
  for (const v of base) {
    const cle = `${v.obligationId}::${v.equipementId}`;
    if (vues.has(cle)) surplus.push(v.id);
    else {
      vues.add(cle);
      tetes.push(v);
    }
  }
  if (surplus.length > 0) {
    await prisma.verification.deleteMany({ where: { id: { in: surplus } } });
    console.log(`  ${surplus.length} occurrence(s) de seed retirée(s)`);
  }

  const aCreer = tetes.flatMap((v) => {
    const pas = PERIODICITE_EN_JOURS[v.periodicite];
    if (pas === null) return []; // one-shot ou obligation permanente

    const suite = [];
    const depart = v.datePrevue.getTime();
    for (let k = 1; k <= MAX_OCCURRENCES; k += 1) {
      const date = new Date(depart + k * pas * JOUR);
      if (date.getTime() > Date.now() + HORIZON * JOUR) break;
      suite.push({
        etablissementId,
        equipementId: v.equipementId,
        obligationId: v.obligationId,
        libelleObligation: v.libelleObligation,
        periodicite: v.periodicite,
        realisateurRequis: v.realisateurRequis,
        datePrevue: date,
        statut: "planifiee" as const,
      });
    }
    return suite;
  });

  if (aCreer.length === 0) {
    console.log("  aucune occurrence suivante à semer");
    return;
  }

  await prisma.verification.createMany({ data: aCreer });
  console.log(
    `  ${aCreer.length} occurrence(s) suivante(s) semée(s) sur ${Math.round(HORIZON / 30)} mois`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  const serie = args.includes("--serie");
  // Semer des occurrences suivantes sur des vérifications sans date ne
  // produirait qu'un tas au même jour : `--serie` implique `--planifier`.
  const planifier = serie || args.includes("--planifier");
  const cible = args.find((a) => !a.startsWith("--"));

  const etab = cible
    ? await prisma.etablissement.findUnique({
        where: { id: cible },
        include: { entreprise: { select: { userId: true } } },
      })
    : await prisma.etablissement.findFirst({
        orderBy: { createdAt: "asc" },
        include: { entreprise: { select: { userId: true } } },
      });

  if (!etab) {
    console.error(
      cible
        ? `Aucun établissement avec l'id ${cible}.`
        : "Aucun établissement en base — créez-en un via l'app avant de semer.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Seed sur « ${etab.raisonDisplay} » (${etab.id})`);

  // 1. Purge des seeds précédents — idempotence.
  const purgeActions = await prisma.action.deleteMany({
    where: { etablissementId: etab.id, description: { startsWith: MARQUEUR } },
  });
  console.log(`  ${purgeActions.count} action(s) de seed retirée(s)`);

  // 2. Origines. La contrainte `Action_origine_xor` impose qu'une action
  //    soit rattachée à exactement un risque OU une vérification. On
  //    s'appuie donc sur des objets réels de l'établissement : les liens
  //    du plan d'actions restent cliquables, et rien n'est orphelin.
  const [risques, verifs] = await Promise.all([
    prisma.risque.findMany({
      where: { unite: { duerp: { etablissementId: etab.id } } },
      select: { id: true },
      take: ACTIONS.length,
    }),
    prisma.verification.findMany({
      where: { etablissementId: etab.id },
      select: { id: true },
      orderBy: { datePrevue: "asc" },
      take: ACTIONS.length,
    }),
  ]);

  if (risques.length === 0 && verifs.length === 0) {
    console.error(
      "  Ni risque ni vérification sur cet établissement : impossible de\n" +
        "  rattacher une action (contrainte Action_origine_xor). Déclarez des\n" +
        "  équipements ou remplissez le DUERP avant de semer.",
    );
    process.exitCode = 1;
    return;
  }

  // 3. Plan d'actions.
  let cree = 0;
  for (const [i, g] of ACTIONS.entries()) {
    // On alterne les origines pour que le plan d'actions montre les deux
    // provenances (DUERP et écart de vérification), comme en vrai.
    const risque = risques[i % risques.length];
    const verif = verifs[i % verifs.length];
    const surRisque = risque !== undefined && (i % 2 === 0 || !verif);

    await prisma.action.create({
      data: {
        etablissementId: etab.id,
        risqueId: surRisque ? risque.id : null,
        verificationId: surRisque ? null : verif.id,
        libelle: g.libelle,
        description: `${MARQUEUR} donnée de démonstration`,
        type: g.type,
        statut: g.statut,
        criticite: g.criticite,
        echeance: g.echeanceJours === null ? null : dans(g.echeanceJours),
        leveeLe:
          g.leveeIlYaJours === undefined ? null : dans(-g.leveeIlYaJours),
        leveeCommentaire:
          g.leveeIlYaJours === undefined ? null : "Levée constatée sur site.",
      },
    });
    cree += 1;
  }
  console.log(`  ${cree} action(s) créée(s)`);

  // Pas de rapports semés : `RapportVerification` exige un fichier
  // réellement stocké (clé, nom, mime, taille). En fabriquer créerait des
  // entrées de registre pointant vers un fichier absent — exactement le
  // genre de donnée de façade qu'on veut éviter. Le bloc « Ce qui a
  // changé » se nourrit des rapports réellement déposés via l'app.

  // 4. Interventions — même idempotence que les actions (marqueur en
  //    description), numéros à la suite des existants (contrainte
  //    d'unicité etablissementId × numero).
  const purgeInterventions = await prisma.intervention.deleteMany({
    where: { etablissementId: etab.id, description: { startsWith: MARQUEUR } },
  });
  console.log(`  ${purgeInterventions.count} intervention(s) de seed retirée(s)`);

  const auteurId = etab.entreprise.userId;
  if (auteurId === null) {
    console.log(
      "  (pas d'interventions semées — l'entreprise n'a pas d'utilisateur rattaché)",
    );
  } else {
    const dernierNumero = await prisma.intervention.aggregate({
      where: { etablissementId: etab.id },
      _max: { numero: true },
    });
    let numero = (dernierNumero._max.numero ?? 0) + 1;
    for (const g of INTERVENTIONS) {
      await prisma.intervention.create({
        data: {
          etablissementId: etab.id,
          numero: numero++,
          titre: g.titre,
          description: `${MARQUEUR} donnée de démonstration`,
          priorite: g.priorite,
          statut: g.statut,
          localisation: g.localisation,
          assigneA: g.assigneA ?? null,
          echeance: dans(g.echeanceJours),
          creeParUserId: auteurId,
        },
      });
    }
    console.log(`  ${INTERVENTIONS.length} intervention(s) créée(s)`);
  }

  // 5. Prestataires — marqueur en notes internes. Les dates de validité
  //    existent sans fichier déposé : c'est un état plausible (date
  //    saisie, pièce pas encore uploadée) et suffisant pour la vigilance
  //    comme pour le calendrier.
  const purgePresta = await prisma.prestataire.deleteMany({
    where: {
      etablissementId: etab.id,
      notesInternes: { startsWith: MARQUEUR },
    },
  });
  console.log(`  ${purgePresta.count} prestataire(s) de seed retiré(s)`);

  for (const g of PRESTATAIRES) {
    await prisma.prestataire.create({
      data: {
        etablissementId: etab.id,
        raisonSociale: g.raisonSociale,
        domaines: g.domaines,
        contactNom: g.contactNom,
        contactEmail: g.contactEmail,
        estOrganismeAgree: g.estOrganismeAgree ?? false,
        attestationUrssafValableJusquA: dans(g.urssafJours),
        assuranceRcProValableJusquA: dans(g.rcProJours),
        notesInternes: `${MARQUEUR} donnée de démonstration`,
      },
    });
  }
  console.log(`  ${PRESTATAIRES.length} prestataire(s) créé(s)`);

  // 6. Un permis de feu à venir et un plan de prévention en cours sans
  //    inspection commune — pour vérifier que le registre d'échéances
  //    (ADR-010) les fait bien remonter dans le calendrier, avec
  //    l'alerte R. 4512-7 sur le plan.
  const purgePermis = await prisma.permisFeu.deleteMany({
    where: {
      etablissementId: etab.id,
      descriptionTravaux: { startsWith: MARQUEUR },
    },
  });
  const purgePlans = await prisma.planPrevention.deleteMany({
    where: {
      etablissementId: etab.id,
      naturesTravaux: { startsWith: MARQUEUR },
    },
  });
  console.log(
    `  ${purgePermis.count} permis de feu et ${purgePlans.count} plan(s) de prévention de seed retirés`,
  );

  const maxPermis = await prisma.permisFeu.aggregate({
    where: { etablissementId: etab.id },
    _max: { numero: true },
  });
  await prisma.permisFeu.create({
    data: {
      etablissementId: etab.id,
      numero: (maxPermis._max.numero ?? 0) + 1,
      prestataireRaison: "BTP Ouest Couverture",
      prestataireContact: "M. Ferreira",
      prestataireEmail: "chantier@btp-ouest-couverture.fr",
      donneurOrdreNom: "Direction de l'établissement",
      dateDebut: dans(11),
      dateFin: dans(12),
      lieu: "Toiture — zone d'étanchéité",
      naturesTravaux: ["travaux_etancheite", "chalumeau"],
      descriptionTravaux: `${MARQUEUR} Reprise d'étanchéité au chalumeau`,
      statut: "attente_signatures",
    },
  });

  const maxPlans = await prisma.planPrevention.aggregate({
    where: { etablissementId: etab.id },
    _max: { numero: true },
  });
  await prisma.planPrevention.create({
    data: {
      etablissementId: etab.id,
      numero: (maxPlans._max.numero ?? 0) + 1,
      entrepriseExterieureRaison: "Clim Service Atlantique",
      efChefNom: "Mme Petit",
      efChefEmail: "interventions@clim-service-atlantique.fr",
      efEffectifIntervenant: 2,
      euChefNom: "Direction de l'établissement",
      dateDebut: dans(-2), // commencé sans inspection commune → alerte
      dateFin: dans(19),
      lieux: "Locaux techniques, cuisine",
      naturesTravaux: `${MARQUEUR} Remplacement des groupes froids`,
      travauxDangereux: true,
    },
  });
  console.log("  1 permis de feu et 1 plan de prévention créés");

  // Pas de version DUERP semée : une version est un document à valeur
  // légale (figé, conservé 40 ans) — validez-en une dans l'app pour voir
  // apparaître l'échéance « mise à jour annuelle » dans Documents.

  if (planifier) {
    await planifierVerifications(etab.id);
  } else {
    console.log(
      "  (vérifications inchangées — relancez avec --planifier pour leur poser des dates)",
    );
  }

  if (serie) {
    await semerSeries(etab.id);
  }

  console.log("Terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
