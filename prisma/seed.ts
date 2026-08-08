/**
 * Seed de développement — donne de la matière au tableau de bord.
 *
 * Le board éditorial montre des retards, une moyenne de retard et un
 * anneau de répartition : sur une base quasi vide, ces blocs sont vrais
 * mais illisibles. Ce script crée un plan d'actions réaliste sur un
 * établissement **existant**, pour juger le rendu sur de vraies requêtes
 * plutôt que sur des données de façade.
 *
 *   pnpm db:seed                  → premier établissement trouvé
 *   pnpm db:seed <etablissementId>
 *
 * Idempotent : les actions posées portent un marqueur `[seed]` dans leur
 * description et sont remplacées à chaque exécution. Rien d'autre n'est
 * touché — aucune donnée saisie par l'utilisateur n'est modifiée.
 */

import {
  PrismaClient,
  type StatutAction,
  type TypeAction,
} from "@prisma/client";

const prisma = new PrismaClient();

const MARQUEUR = "[seed]";
const JOUR = 86400000;

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

async function main() {
  const cible = process.argv[2];

  const etab = cible
    ? await prisma.etablissement.findUnique({ where: { id: cible } })
    : await prisma.etablissement.findFirst({ orderBy: { createdAt: "asc" } });

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

  console.log("Terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
