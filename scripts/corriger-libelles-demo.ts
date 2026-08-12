#!/usr/bin/env tsx
//
// Réécriture des libellés d'actions hérités des données de démonstration.
//
// Les deux établissements portent un même lot d'actions manifestement issu
// d'un jeu « restauration » : une plonge, une réserve sèche, une zone de
// cuisson, une équipe du soir — chez un cabinet de conseil et chez un
// caviste. Le défaut n'est pas seulement de vocabulaire : ces actions sont
// **rattachées au mauvais risque**. « Remplacer le tapis antidérapant de la
// plonge » pend d'un risque « Ambiance sonore ».
//
// Comme les sorties du serveur MCP affichent l'action *et* son origine sur
// la même ligne, l'incohérence est visible à chaque lecture. On corrige donc
// le libellé pour qu'il réponde à l'origine à laquelle l'action est
// effectivement rattachée — plutôt que de déplacer les rattachements, ce qui
// réécrirait la structure du DUERP.
//
// Ce que ce script ne fait pas, volontairement : il ne touche ni aux
// statuts, ni aux échéances, ni aux rattachements. Un libellé est une
// étiquette ; le reste est de la donnée métier dont la réécriture n'a pas
// été demandée.
//
// Réversible : `--annuler` remet les libellés d'origine. Idempotent dans les
// deux sens — une action déjà renommée n'est pas retouchée.
//
//   pnpm fix:libelles maak
//   pnpm fix:libelles tout --annuler

import { PrismaClient } from "@prisma/client";

const ETABLISSEMENTS = {
  paloa: "cmocnriid0002rlti0taekm4y",
  maak: "cmoa4442t0002rlwitios33tc",
} as const;

type Cible = keyof typeof ETABLISSEMENTS;

/** `avant` → `apres`, par établissement. La raison tient dans le commentaire
 *  qui accompagne chaque ligne : l'origine à laquelle l'action répond. */
const RENOMMAGES: Record<Cible, Array<{ avant: string; apres: string }>> = {
  // Cabinet de conseil, bureaux.
  paloa: [
    {
      // ← risque « Charge physique : travail prolongé sur écran »
      avant: "Remplacer le tapis antidérapant de la plonge",
      apres: "Fournir un repose-pieds réglable à chaque poste",
    },
    {
      // ← vérification périodique des installations électriques
      avant: "Reprendre l'éclairage de la réserve sèche",
      apres: "Reprendre l'éclairage du local d'archives",
    },
    {
      // ← risque « Charge physique : travail prolongé sur écran »
      avant: "Formation gestes et postures — équipe du soir",
      apres: "Formation gestes et postures — travail sur écran",
    },
    {
      // ← vérification électrique après travaux
      avant: "Poser une signalétique sol glissant en zone de cuisson",
      apres: "Faire contrôler le tableau après l'ajout de prises murales",
    },
    {
      // ← risque « Charge physique : travail prolongé sur écran »
      avant: "Renouveler les gants anti-coupure",
      apres: "Équiper les postes de supports d'écran réglables",
    },
    {
      // ← risque « Charge physique : travail prolongé sur écran »
      avant: "Sécuriser le stockage des produits lessiviels",
      apres: "Dégager les espaces sous les bureaux pour les jambes",
    },
    {
      // ← vérification « Consigne incendie affichée et mise à jour »
      avant: "Installer un repose-pied au poste d'encaissement",
      apres: "Afficher le plan d'évacuation à jour à l'accueil",
    },
  ],

  // Commerce de détail de boissons.
  maak: [
    {
      // ← risque « Ambiance sonore (musique, ventilation, affluence) »
      avant: "Remplacer le tapis antidérapant de la plonge",
      apres: "Baisser le niveau de sonorisation aux heures d'affluence",
    },
    {
      // ← vérification annuelle des extincteurs
      avant: "Reprendre l'éclairage de la réserve sèche",
      apres: "Dégager et signaler l'accès aux extincteurs de la réserve",
    },
    {
      // ← risque « Ambiance sonore »
      avant: "Formation gestes et postures — équipe du soir",
      apres: "Sensibiliser à l'exposition sonore prolongée en boutique",
    },
    {
      // ← vérification annuelle des blocs de secours
      avant: "Poser une signalétique sol glissant en zone de cuisson",
      apres: "Remplacer les blocs de secours hors service de la réserve",
    },
    {
      // ← risque « Ambiance sonore »
      avant: "Renouveler les gants anti-coupure",
      apres: "Éloigner l'enceinte du poste de caisse",
    },
    {
      // ← risque « Ambiance sonore »
      avant: "Sécuriser le stockage des produits lessiviels",
      apres: "Mesurer le niveau sonore en période d'affluence",
    },
  ],
};

const prisma = new PrismaClient({ log: [] });

async function appliquer(cible: Cible, inverse: boolean): Promise<void> {
  const etablissementId = ETABLISSEMENTS[cible];
  let modifiees = 0;
  const absents: string[] = [];

  for (const { avant, apres } of RENOMMAGES[cible]) {
    const de = inverse ? apres : avant;
    const vers = inverse ? avant : apres;

    const r = await prisma.action.updateMany({
      where: { etablissementId, libelle: de },
      data: { libelle: vers },
    });

    if (r.count === 0) absents.push(de);
    else modifiees += r.count;
  }

  console.log(`${cible} : ${modifiees} libellé(s) réécrit(s).`);
  if (absents.length > 0) {
    console.log(`  déjà à jour ou introuvables : ${absents.length}`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const inverse = args.includes("--annuler");
  const demande = args.find((a) => !a.startsWith("--"));

  if (!demande) {
    console.error(
      "Précisez la cible : paloa, maak ou tout. Exemple : pnpm fix:libelles maak",
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

  for (const cible of cibles) await appliquer(cible, inverse);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await prisma.$disconnect();
  process.exit(1);
});
