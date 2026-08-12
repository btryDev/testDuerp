#!/usr/bin/env tsx
//
// Jeux de démonstration — **additifs, idempotents, réversibles**.
//
// Les deux établissements de démonstration n'ont qu'une poignée d'unités de
// travail renseignées : une démonstration s'y arrête aussitôt. Ce script les
// remplit et rattache un plan d'actions aux risques créés.
//
// Le contenu est propre à chaque établissement, et ce n'est pas cosmétique :
// Paloa est un cabinet de conseil en bureaux (NAF 70.22Z), Maak un commerce
// de détail de boissons (NAF 47.25Z). Leur exposition n'a rien de commun, et
// des risques de bureau collés à un commerce sautent aux yeux du premier
// préventeur venu — c'est d'ailleurs le défaut des données existantes, où
// une « plonge » et une « réserve sèche » traînent dans un cabinet de
// conseil.
//
// Trois règles que ce script s'impose, parce qu'il écrit dans une base de
// production :
//
//   1. **Il n'écrit que ce qu'il a créé.** Rien n'est modifié ni supprimé de
//      l'existant.
//   2. **Il est idempotent.** Un risque ou une action portant déjà le même
//      libellé dans la même unité n'est pas recréé.
//   3. **Il est réversible.** `--annuler` supprime exactement ce qu'il a
//      créé, reconnu par libellé — et rien d'autre.
//
// La criticité n'est jamais écrite à la main : elle passe par
// `calculerCriticite`, seule définition de la règle dans le produit.
// L'écrire en dur produirait des cotations que l'application recalculerait
// différemment.
//
//   pnpm seed:demo paloa
//   pnpm seed:demo maak
//   pnpm seed:demo tout
//   pnpm seed:demo maak --annuler

import { PrismaClient, type TypeAction, type StatutAction } from "@prisma/client";
import { calculerCriticite } from "@/lib/cotation";

const ETABLISSEMENTS = {
  paloa: "cmocnriid0002rlti0taekm4y",
  maak: "cmoa4442t0002rlwitios33tc",
} as const;

type Cible = keyof typeof ETABLISSEMENTS;

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

/** Risques par unité de travail, pour chaque établissement. */
const JEUX: Record<Cible, Record<string, RisqueSeed[]>> = {
  // --------------------------------------------------------------
  // Paloa — cabinet de conseil, bureaux, 3 salariés
  // --------------------------------------------------------------
  paloa: {
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
            libelle:
              "Supprimer les multiprises chaînées et ajouter deux prises murales",
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
            libelle:
              "Fixer les rayonnages au mur et limiter le stockage en hauteur",
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
  },

  // --------------------------------------------------------------
  // Maak — commerce de détail de boissons, ERP type M, 2 salariés
  // --------------------------------------------------------------
  maak: {
    "Mise en rayon et vitrine": [
      {
        libelle: "Manutention manuelle — port de cartons de bouteilles",
        description:
          "Réassort quotidien du linéaire, cartons de six à douze bouteilles portés depuis la réserve, parfois au-dessus des épaules pour les rayonnages hauts.",
        gravite: 3,
        probabilite: 4,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Mettre un diable à disposition pour le réassort",
            type: "reduction_source",
            statut: "ouverte",
            echeanceJours: -9,
            responsable: "Gérant",
          },
          {
            libelle: "Ranger les références lourdes en rayonnage bas",
            type: "organisationnelle",
            statut: "en_cours",
            echeanceJours: 14,
          },
        ],
      },
      {
        libelle: "Coupure — bris de verre en rayon et en vitrine",
        description:
          "Casse de bouteilles au réassort et en clientèle, ramassage à la main sans équipement dédié.",
        gravite: 2,
        probabilite: 3,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Constituer un kit de ramassage : pelle, balai, gants anti-coupure",
            type: "protection_individuelle",
            statut: "levee",
            echeanceJours: -45,
          },
        ],
      },
      {
        libelle: "Chute d'objets — bouteilles stockées en rayonnage haut",
        description:
          "Bouteilles en présentation au-dessus de 1,80 m, sans dispositif antichute sur les étagères.",
        gravite: 3,
        probabilite: 2,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Poser des barres antichute sur les étagères hautes",
            type: "protection_collective",
            statut: "ouverte",
            echeanceJours: 25,
          },
        ],
      },
    ],

    "Réception et stockage": [
      {
        libelle: "Manutention et déplacement de charges lourdes — palettes",
        description:
          "Réception de palettes de bouteilles au transpalette manuel, seuil de porte à franchir, sol de réserve irrégulier.",
        gravite: 3,
        probabilite: 3,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Reprendre le seuil de la porte de réserve",
            type: "suppression",
            statut: "ouverte",
            echeanceJours: -16,
            responsable: "Gérant",
          },
          {
            libelle: "Formation à la conduite du transpalette manuel",
            type: "formation",
            statut: "ouverte",
            echeanceJours: null,
          },
        ],
      },
      {
        libelle: "Chute de hauteur — accès aux rayonnages hauts de la réserve",
        description:
          "Accès au stock haut depuis un escabeau non stabilisé, parfois depuis une caisse retournée.",
        gravite: 4,
        probabilite: 2,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Remplacer l'escabeau par une plateforme individuelle roulante",
            type: "protection_collective",
            statut: "ouverte",
            echeanceJours: -3,
            responsable: "Gérant",
          },
        ],
      },
      {
        libelle: "Heurt par véhicule — zone de livraison sur voirie",
        description:
          "Déchargement en bordure de rue, sans zone dédiée ni séparation avec la circulation.",
        gravite: 4,
        probabilite: 2,
        maitrise: 3,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Convenir d'un créneau de livraison hors heures d'affluence",
            type: "organisationnelle",
            statut: "en_cours",
            echeanceJours: 20,
          },
          {
            libelle: "Doter les salariés d'un gilet haute visibilité",
            type: "protection_individuelle",
            statut: "levee",
            echeanceJours: -50,
          },
        ],
      },
    ],

    "Locaux et ambiance générale": [
      {
        libelle: "Chute de plain-pied — sol glissant en surface de vente",
        description:
          "Sol lisse, nettoyage en journée sans signalisation, ruissellement à l'entrée par temps de pluie.",
        gravite: 2,
        probabilite: 3,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Acquérir des panneaux « sol glissant » et nettoyer hors ouverture",
            type: "organisationnelle",
            statut: "ouverte",
            echeanceJours: 12,
          },
        ],
      },
      {
        libelle: "Ambiance thermique — écarts entre réserve réfrigérée et boutique",
        description:
          "Passages répétés entre la cave réfrigérée et la surface de vente, sans vêtement adapté.",
        gravite: 2,
        probabilite: 3,
        maitrise: 3,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Fournir une veste isotherme pour les passages en cave",
            type: "protection_individuelle",
            statut: "ouverte",
            echeanceJours: 40,
          },
        ],
      },
    ],

    "Risques transverses": [
      {
        libelle: "Travail isolé — ouverture et fermeture de la boutique",
        description:
          "Salarié seul en boutique sur une partie de la journée, aucun dispositif d'alerte.",
        gravite: 3,
        probabilite: 3,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Mettre en place une procédure d'appel en début et fin de poste",
            type: "organisationnelle",
            statut: "ouverte",
            echeanceJours: -25,
            responsable: "Gérant",
          },
        ],
      },
      {
        libelle: "Agression et incivilité — encaissement et fonds de caisse",
        description:
          "Encaissement en fin de journée, fonds de caisse conservé sur place, vitrine donnant sur rue peu passante le soir.",
        gravite: 3,
        probabilite: 2,
        maitrise: 2,
        nombreSalariesExposes: 2,
        actions: [
          {
            libelle: "Limiter le fonds de caisse et espacer les dépôts en banque",
            type: "organisationnelle",
            statut: "en_cours",
            echeanceJours: 7,
          },
          {
            libelle: "Sensibilisation à la gestion des incivilités clients",
            type: "formation",
            statut: "ouverte",
            echeanceJours: 90,
          },
        ],
      },
    ],
  },
};

async function creer(cible: Cible): Promise<void> {
  const etablissementId = ETABLISSEMENTS[cible];
  const duerp = await prisma.duerp.findFirst({
    where: { etablissementId },
    include: { unites: { select: { id: true, nom: true } } },
  });

  if (!duerp) throw new Error(`DUERP introuvable pour ${cible}.`);

  const parNom = new Map(duerp.unites.map((u) => [u.nom, u.id]));
  let risquesCrees = 0;
  let actionsCreees = 0;
  const ignorees: string[] = [];

  for (const [nomUnite, risques] of Object.entries(JEUX[cible])) {
    // Les libellés d'unité varient d'un établissement à l'autre : on
    // rapproche sur le début du nom pour tolérer un suffixe comme
    // « (transverse) », sans jamais rapprocher deux unités distinctes.
    const uniteId =
      parNom.get(nomUnite) ??
      [...parNom.entries()].find(([nom]) => nom.startsWith(nomUnite))?.[1];

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
            etablissementId,
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

  console.log(
    `${cible} : ${risquesCrees} risque(s) et ${actionsCreees} action(s) créés.`,
  );
  if (ignorees.length > 0) {
    console.log(`  unités non trouvées, ignorées : ${ignorees.join(", ")}`);
  }
}

async function annuler(cible: Cible): Promise<void> {
  const etablissementId = ETABLISSEMENTS[cible];
  const jeu = Object.values(JEUX[cible]);
  const libellesRisques = jeu.flatMap((rs) => rs.map((r) => r.libelle));
  const libellesActions = jeu.flatMap((rs) =>
    rs.flatMap((r) => r.actions.map((a) => a.libelle)),
  );

  // Les actions d'abord : elles référencent les risques.
  const a = await prisma.action.deleteMany({
    where: { etablissementId, libelle: { in: libellesActions } },
  });
  const r = await prisma.risque.deleteMany({
    where: {
      libelle: { in: libellesRisques },
      unite: { duerp: { etablissementId } },
    },
  });

  console.log(`${cible} : ${r.count} risque(s) et ${a.count} action(s) retirés.`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const doitAnnuler = args.includes("--annuler");
  const demande = args.find((a) => !a.startsWith("--"));

  if (!demande) {
    console.error(
      "Précisez la cible : paloa, maak ou tout. Exemple : pnpm seed:demo maak",
    );
    process.exit(1);
  }

  const cibles: Cible[] =
    demande === "tout"
      ? (Object.keys(ETABLISSEMENTS) as Cible[])
      : demande in ETABLISSEMENTS
        ? [demande as Cible]
        : [];

  if (cibles.length === 0) {
    console.error(`Cible inconnue : « ${demande} ». Attendu : paloa, maak ou tout.`);
    process.exit(1);
  }

  for (const cible of cibles) {
    if (doitAnnuler) await annuler(cible);
    else await creer(cible);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
