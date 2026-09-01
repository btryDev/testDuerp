/**
 * Remet un compte à l'état « jamais renseigné », pour rejouer l'onboarding.
 *
 * **Pourquoi un script de remise à zéro plutôt qu'un compte figé.** Un compte
 * qu'on maintiendrait vide en permanence ne serait jamais celui qu'on veut :
 * dès qu'on renseigne le formulaire pour voir ce qu'il produit, il cesse d'être
 * en onboarding. Ce qu'il faut n'est pas un compte spécial, c'est un geste
 * répétable — remplir, regarder, remettre à zéro, recommencer.
 *
 * Ce qu'il fait : supprime l'`Entreprise` du compte. Tout le dossier part avec
 * elle par cascade — établissement, équipements, vérifications, salariés,
 * DUERP, prestataires, registres. Le compte Supabase, lui, n'est pas touché :
 * l'utilisateur reste connecté, et l'application le renvoie à `/onboarding`
 * parce qu'il n'a plus d'entreprise (`app/entreprises/page.tsx:15`).
 *
 * **Ce script détruit des données et n'a aucun moyen de les rendre.** Trois
 * garde-fous, dans cet ordre :
 *
 *   1. il refuse de s'exécuter si `DATABASE_URL` ne pointe pas sur localhost ;
 *   2. il exige l'adresse e-mail en argument, jamais de valeur par défaut ;
 *   3. sans `--vraiment`, il montre ce qu'il supprimerait et s'arrête.
 *
 * Le premier garde-fou n'est pas décoratif : une base de production a été
 * effacée sur ce projet le 2026-08-27 par une commande qui semblait sûre.
 *
 *   pnpm tsx scripts/remettre-en-onboarding.ts                      # liste les dossiers
 *   pnpm tsx scripts/remettre-en-onboarding.ts <userId>
 *   pnpm tsx scripts/remettre-en-onboarding.ts <userId> --vraiment
 *
 * **On désigne un dossier par son `userId`, pas par une adresse e-mail**, et la
 * première rédaction de ce script se trompait sur ce point : elle interrogeait
 * `auth.users`, qui n'existe pas dans la base locale. L'identité vit chez
 * Supabase, seul le dossier est ici — la seule clé commune aux deux mondes est
 * l'UUID que `Entreprise.userId` porte. Sans argument, le script liste les
 * dossiers présents avec leur `userId` : c'est là qu'on lit celui qu'on veut.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function exigerBaseLocale(): void {
  const url = process.env.DATABASE_URL ?? "";
  const locale = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  if (!locale) {
    console.error(
      "REFUS : DATABASE_URL ne pointe pas sur localhost.\n" +
        "Ce script supprime un dossier complet ; il ne s'exécute que sur la base locale.",
    );
    process.exit(1);
  }
}

async function main(): Promise<void> {
  exigerBaseLocale();

  const userId = process.argv[2];
  const vraiment = process.argv.includes("--vraiment");

  const dossiers = await prisma.entreprise.findMany({
    include: {
      etablissements: {
        include: {
          _count: {
            select: {
              equipements: true,
              verifications: true,
              salaries: true,
              batiments: true,
            },
          },
        },
      },
    },
  });

  // Sans argument : on montre ce qu'il y a, avec la clé qui sert à le désigner.
  // Un script destructif ne doit jamais avoir à deviner sa cible.
  if (!userId || userId.startsWith("--")) {
    console.log(`${dossiers.length} dossier(s) dans la base locale :\n`);
    for (const d of dossiers) {
      console.log(`  ${d.userId ?? "(sans compte)"}  ${d.raisonSociale}`);
    }
    console.log(
      "\nUsage : pnpm tsx scripts/remettre-en-onboarding.ts <userId> [--vraiment]",
    );
    return;
  }

  const entreprise = dossiers.find((d) => d.userId === userId);
  if (!entreprise) {
    console.error(
      `Aucun dossier pour ${userId}. Relance sans argument pour voir la liste.`,
    );
    process.exit(1);
  }

  const etab = entreprise.etablissements[0];
  console.log(`Compte    : ${userId}`);
  console.log(
    `Entreprise: ${entreprise.raisonSociale} (SIRET ${entreprise.siret ?? "—"})`,
  );
  if (etab) {
    const c = etab._count;
    console.log(
      `Dossier   : ${c.equipements} équipements, ${c.verifications} vérifications, ` +
        `${c.salaries} salariés, ${c.batiments} bâtiments`,
    );
  }

  if (!vraiment) {
    console.log("\nRien n'a été supprimé. Relance avec --vraiment pour effacer.");
    return;
  }

  await prisma.entreprise.delete({ where: { id: entreprise.id } });
  console.log(`\nSupprimé. Ce compte est de nouveau en onboarding.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
