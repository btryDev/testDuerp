import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Les défauts de Prisma pour les transactions interactives — 5 s
    // d'exécution, 2 s d'attente d'une connexion — supposent une base proche.
    // Ils ne tiennent pas dès qu'une transaction enchaîne des écritures ligne à
    // ligne, puisque chaque aller-retour s'y ajoute.
    //
    // Un seul chemin est encore dans ce cas : l'import d'un DUERP existant
    // (`lib/duerps/import/actions.ts`), dont la boucle imbriquée relit et écrit
    // par unité, par risque et par mesure. Il faudra l'écrire comme le
    // calendrier — identifiants générés en amont, lectures sorties de la
    // transaction, écritures groupées — et ces valeurs pourront alors revenir
    // à leurs défauts.
    //
    // À ne pas confondre avec un permis de laisser durer : un délai plus long
    // ne rend pas une transaction bavarde acceptable, il l'empêche seulement
    // d'échouer en P2028 le jour où la latence monte.
    transactionOptions: {
      timeout: 20_000,
      maxWait: 10_000,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
