import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Les défauts de Prisma pour les transactions interactives — 5 s d'exécution,
    // 2 s d'attente d'une connexion — supposent une base proche. Ils ne tiennent
    // pas dès qu'une transaction enchaîne des écritures ligne à ligne : la
    // resynchronisation du calendrier boucle sur autant d'`update` qu'il y a
    // d'occurrences (`lib/calendrier/actions.ts`), et quelques dizaines de
    // lignes suffisent à dépasser les 5 s si chaque aller-retour se compte en
    // dizaines de millisecondes.
    //
    // Le dépassement ne se contente pas d'échouer : il laisse
    // `referentielVersionCalendrier` non écrit, donc l'établissement reste
    // marqué « à resynchroniser » et l'opération repart au prochain affichage.
    // Une boucle d'échecs, payée à chaque navigation, qui se manifeste en P2028
    // (« Transaction not found »).
    //
    // Ces valeurs sont un filet, pas un permis de laisser durer : la bonne
    // réponse reste de rapprocher le calcul de la base et de grouper les
    // écritures.
    transactionOptions: {
      timeout: 20_000,
      maxWait: 10_000,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
