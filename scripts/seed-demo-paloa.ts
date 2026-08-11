#!/usr/bin/env tsx
//
// Jeu de démonstration pour l'établissement Paloa — **additif et réversible**.
//
// Paloa est un cabinet de conseil (NAF 70.22Z), trois salariés, en ERP de
// type W. Ses six unités de travail sont cohérentes avec ce profil, mais
// quatre d'entre elles n'avaient aucun risque coté : une démonstration s'y
// arrêtait aussitôt. Ce script les remplit, et rattache un plan d'actions
// aux risques ainsi créés.
//
// Trois règles que ce script s'impose, parce qu'il écrit dans une base de
// production :
//
//   1. **Il n'écrit que ce qu'il a créé.** Rien n'est modifié ni supprimé de
//      l'existant. Les risques et actions déjà en base sont laissés tels
//      quels, y compris ceux dont les libellés sont incohérents avec un
//      cabinet de conseil.
//   2. **Il est idempotent.** Un risque ou une action portant déjà le même
//      libellé dans la même unité n'est pas recréé. Relancer le script ne
//      duplique rien.
//   3. **Il est réversible.** `--annuler` supprime exactement ce qu'il a
//      créé, reconnu par libellé — et rien d'autre.
//
// La criticité n'est jamais écrite à la main : elle passe par
// `calculerCriticite`, seule définition de la règle dans le produit
// (arrondi de gravité × probabilité / maîtrise). L'écrire en dur ici
// produirait des cotations que l'application recalculerait différemment.
//
//   pnpm seed:demo            # crée
//   pnpm seed:demo --annuler  # retire

import { PrismaClient, type TypeAction, type StatutAction } from "@prisma/client";
import { calculerCriticite } from "@/lib/cotation";

const ETABLISSEMENT_ID = "cmocnriid0002rlti0taekm4y"; // Paloa

const prisma = new PrismaClient({ log: [] });

/** Aujourd'hui, injecté une fois — les échéances se lisent par rapport à lui. */
const AUJOURDHUI = new Date();
const jours = (n: number) => {
  const d = new Date(AUJOURDHUI);
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

type ActionSeed = {
  libelle: string;
  type: TypeAction;
  statut: StatutAction;
  /** Décalage en jours par rapport à aujourd'hui. `null` = sans échéance. */
  echeanceJours: number | null;
  responsable?: string;
};

type RisqueSeed = {
  libelle: string;
  description: string;
  gravite: number;
  probabilite: number;
  maitrise: number;
  nombreSalariesExposes?: number;
  actions: ActionSeed[];
};

/**
 * Risques par unité de travail. Le contenu vise la vraisemblance métier
 * d'un cabinet de conseil en bureaux — pas l'exhaustivité réglementaire :
 * c'est un jeu de démonstration, pas un référentiel.
 */
const PAR_UNITE: Record<string, RisqueSeed[]> = {
  "Postes de travail sur écran (open-space, bureaux)": [
    {
      libelle: "Fatigue visuelle liée au travail prolongé sur écran",
      description:
        "Exposition quotidienne supérieure à quatre heures, éclairage mixte lumière du jour et plafonniers, reflets sur les écrans en fin de journée.",
      gravite: 2,
      probabilite: 3,
      maitrise: 2,
      nombreSalariesExposes: 3,
      actions: [
        {
          libelle: "Installer des stores occultants côté façade ouest",
          type: "protection_collective",
          statut: "en_cours",
          echeanceJours: 21,
          responsable: "Direction",
        },
        {
          libelle: "Régler la luminosité et la hauteur des trois écrans",
          type: "organisationnelle",
          statut: "levee",
          echeanceJours: -30,
        },
      ],
    },
    {
      libelle: "Troubles musculo-squelettiques — posture assise prolongée",
      description:
        "Postes non réglables, absence de repose-pieds, pauses irrégulières en période de forte charge.",
      gravite: 3,
      probabilite: 3,
      maitrise: 2,
      nombreSalariesExposes: 3,
      actions: [
        {
          libelle: "Remplacer les sièges par des assises réglables",
          type: "reduction_source",
          statut: "ouverte",
          echeanceJours: -12,
          responsable: "Direction",
        },
        {
          libelle: "Sensibiliser aux pauses actives toutes les deux heures",
          type: "formation",
          statut: "ouverte",
          echeanceJours: 45,
        },
      ],
    },
  ],

  "Espaces communs, circulation, sanitaires": [
    {
      libelle: "Chute de plain-pied dans les circulations",
      description:
        "Câbles d'alimentation traversant le couloir de l'open-space, sol lisse à l'entrée par temps de pluie.",
      gravite: 2,
      probabilite: 3,
      maitrise: 2,
      nombreSalariesExposes: 3,
      actions: [
        {
          libelle: "Poser des goulottes de sol sur le passage central",
          type: "protection_collective",
          statut: "ouverte",
          echeanceJours: -5,
        },
        {
          libelle: "Installer un tapis absorbant à l'entrée",
          type: "protection_collective",
          statut: "levee",
          echeanceJours: -60,
        },
      ],
    },
    {
      libelle: "Risque électrique — multiprises en cascade",
      description:
        "Alimentation des postes et du copieur par multiprises chaînées sous les bureaux.",
      gravite: 4,
      probabilite: 2,
      maitrise: 3,
      nombreSalariesExposes: 3,
      actions: [
        {
          libelle: "Supprimer les multiprises chaînées et ajouter deux prises murales",
          type: "suppression",
          statut: "en_cours",
          echeanceJours: 10,
          responsable: "Électricien",
        },
      ],
    },
  ],

  "Archives, locaux techniques, copieurs": [
    {
      libelle: "Manutention manuelle — cartons d'archives",
      description:
        "Port de cartons de dossiers vers les rayonnages hauts, sans marchepied adapté.",
      gravite: 3,
      probabilite: 2,
      maitrise: 2,
      nombreSalariesExposes: 2,
      actions: [
        {
          libelle: "Acquérir un marchepied stable avec main courante",
          type: "protection_collective",
          statut: "ouverte",
          echeanceJours: 30,
        },
        {
          libelle: "Formation gestes et postures — manutention de charges",
          type: "formation",
          statut: "ouverte",
          echeanceJours: null,
        },
      ],
    },
    {
      libelle: "Chute d'objets depuis les rayonnages d'archives",
      description:
        "Rayonnages non fixés au mur, cartons stockés au-dessus de 1,80 m.",
      gravite: 3,
      probabilite: 2,
      maitrise: 1,
      nombreSalariesExposes: 2,
      actions: [
        {
          libelle: "Fixer les rayonnages au mur et limiter le stockage en hauteur",
          type: "protection_collective",
          statut: "ouverte",
          echeanceJours: -20,
          responsable: "Direction",
        },
      ],
    },
  ],

  "Salles de réunion / espaces collaboratifs": [
    {
      libelle: "Chute de plain-pied — câbles de visioconférence",
      description:
        "Câblage temporaire au sol lors des réunions clients, retiré irrégulièrement.",
      gravite: 2,
      probabilite: 2,
      maitrise: 2,
      nombreSalariesExposes: 3,
      actions: [
        {
          libelle: "Passer le câblage visio en encastré sous la table",
          type: "suppression",
          statut: "ouverte",
          echeanceJours: 60,
        },
      ],
    },
  ],
};

async function creer(): Promise<void> {
  const duerp = await prisma.duerp.findFirst({
    where: { etablissementId: ETABLISSEMENT_ID },
    include: { unites: { select: { id: true, nom: true } } },
  });

  if (!duerp) throw new Error("DUERP introuvable pour cet établissement.");

  const parNom = new Map(duerp.unites.map((u) => [u.nom, u.id]));
  let risquesCrees = 0;
  let actionsCreees = 0;
  const ignorees: string[] = [];

  for (const [nomUnite, risques] of Object.entries(PAR_UNITE)) {
    const uniteId = parNom.get(nomUnite);
    if (!uniteId) {
      ignorees.push(nomUnite);
      continue;
    }

    for (const r of risques) {
      const existant = await prisma.risque.findFirst({
        where: { uniteId, libelle: r.libelle },
        select: { id: true },
      });
      if (existant) continue;

      const risque = await prisma.risque.create({
        data: {
          uniteId,
          libelle: r.libelle,
          description: r.description,
          gravite: r.gravite,
          probabilite: r.probabilite,
          maitrise: r.maitrise,
          criticite: calculerCriticite(r),
          cotationSaisie: true,
          nombreSalariesExposes: r.nombreSalariesExposes,
        },
        select: { id: true, criticite: true },
      });
      risquesCrees += 1;

      for (const a of r.actions) {
        await prisma.action.create({
          data: {
            etablissementId: ETABLISSEMENT_ID,
            risqueId: risque.id,
            libelle: a.libelle,
            type: a.type,
            statut: a.statut,
            criticite: risque.criticite,
            echeance: a.echeanceJours === null ? null : jours(a.echeanceJours),
            responsable: a.responsable,
            // Une action levée sans date de levée serait incohérente : le
            // registre affiche « levée le … ».
            leveeLe: a.statut === "levee" ? jours(a.echeanceJours ?? 0) : null,
          },
        });
        actionsCreees += 1;
      }
    }
  }

  console.log(`${risquesCrees} risque(s) et ${actionsCreees} action(s) créés.`);
  if (ignorees.length > 0) {
    console.log(`Unités non trouvées, ignorées : ${ignorees.join(", ")}`);
  }
}

async function annuler(): Promise<void> {
  const libellesRisques = Object.values(PAR_UNITE).flatMap((rs) =>
    rs.map((r) => r.libelle),
  );
  const libellesActions = Object.values(PAR_UNITE).flatMap((rs) =>
    rs.flatMap((r) => r.actions.map((a) => a.libelle)),
  );

  // Les actions d'abord : elles référencent les risques.
  const a = await prisma.action.deleteMany({
    where: { etablissementId: ETABLISSEMENT_ID, libelle: { in: libellesActions } },
  });
  const r = await prisma.risque.deleteMany({
    where: {
      libelle: { in: libellesRisques },
      unite: { duerp: { etablissementId: ETABLISSEMENT_ID } },
    },
  });

  console.log(`${r.count} risque(s) et ${a.count} action(s) retirés.`);
}

async function main(): Promise<void> {
  const doitAnnuler = process.argv.includes("--annuler");
  if (doitAnnuler) await annuler();
  else await creer();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
