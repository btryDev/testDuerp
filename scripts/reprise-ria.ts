#!/usr/bin/env tsx
//
// Reprise des robinets d'incendie armés (RIA) vers leur catégorie propre.
//
// Jusqu'au 2026-08-25, les RIA n'avaient pas de catégorie d'équipement : la
// vérification annuelle (arrêté du 25 juin 1980, art. MS 73 § 2) était
// rattachée aux EXTINCTEUR portant la propriété opt-out
// `aRobinetsIncendieArmes`. La catégorie `RIA` existe désormais (migration
// 20260825130000). Ce script fait la reprise des données existantes, dans
// l'esprit de l'ADR-012 — jamais de perte silencieuse :
//
//   - extincteur `aRobinetsIncendieArmes: true`  → un équipement RIA est créé
//     dans le même établissement, et la ligne de calendrier
//     `incendie-erp-ria-annuelle` existante (rapports, actions, dateRealisee)
//     est RÉAFFECTÉE au nouvel équipement — identifiants conservés ;
//   - extincteur sans réponse (clé absente)      → même reprise : la forme
//     `non_infirmee` maintenait l'obligation ; le dirigeant pourra désactiver
//     le RIA créé, ce qui est un « non » explicite et visible ;
//   - extincteur `aRobinetsIncendieArmes: false` → rien n'est créé ; la clé
//     est retirée des caractéristiques.
//
// Idempotent : un RIA déjà issu d'un extincteur (`caracteristiques.origine =
// "reprise-ria"`, `depuisEquipementId`) n'est pas recréé.
//
// La base pointée par `.env` est la PRODUCTION. Le script tourne en
// `--dry-run` par défaut et n'écrit qu'avec `--appliquer`. Faire un snapshot
// Supabase avant. Une fois qu'aucun extincteur ne porte plus la clé, retirer
// la branche EXTINCTEUR de l'obligation (cf. notesInternes de
// `incendie-erp-ria-annuelle`) et la question du formulaire.
//
//   pnpm tsx scripts/reprise-ria.ts            # dry-run
//   pnpm tsx scripts/reprise-ria.ts --appliquer

import { PrismaClient, type Prisma } from "@prisma/client";

const OBLIGATION_RIA = "incendie-erp-ria-annuelle";
const CLE = "aRobinetsIncendieArmes";

async function main() {
  const appliquer = process.argv.includes("--appliquer");
  const prisma = new PrismaClient();

  const extincteurs = await prisma.equipement.findMany({
    where: { categorie: "EXTINCTEUR" },
    select: {
      id: true,
      etablissementId: true,
      libelle: true,
      localisation: true,
      caracteristiques: true,
    },
  });

  const riaExistants = await prisma.equipement.findMany({
    where: { categorie: "RIA" },
    select: { id: true, caracteristiques: true },
  });
  const dejaRepris = new Map<string, string>();
  for (const r of riaExistants) {
    const c = (r.caracteristiques ?? {}) as Record<string, unknown>;
    if (c.origine === "reprise-ria" && typeof c.depuisEquipementId === "string") {
      dejaRepris.set(c.depuisEquipementId, r.id);
    }
  }

  let aCreer = 0;
  let aReaffecter = 0;
  let aNettoyer = 0;
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  for (const ext of extincteurs) {
    const carac = (ext.caracteristiques ?? {}) as Record<string, unknown>;
    // Clé absente = jamais répondu : reprise aussi (opt-out ⇒ l'obligation
    // était maintenue).
    const reponse = carac[CLE];
    const { [CLE]: _retiree, ...sansCle } = carac;
    void _retiree;

    if (reponse === false) {
      aNettoyer += 1;
      console.log(`[non]   ${ext.id} « ${ext.libelle} » — clé retirée, rien créé`);
      operations.push(
        prisma.equipement.update({
          where: { id: ext.id },
          data: { caracteristiques: sansCle as Prisma.InputJsonValue },
        }),
      );
      continue;
    }

    let riaId = dejaRepris.get(ext.id);
    if (!riaId) {
      aCreer += 1;
      riaId = `ria_${ext.id}`;
      console.log(
        `[${reponse === true ? "oui" : "?"}]   ${ext.id} « ${ext.libelle} » → RIA ${riaId}`,
      );
      operations.push(
        prisma.equipement.create({
          data: {
            id: riaId,
            etablissementId: ext.etablissementId,
            categorie: "RIA",
            libelle: "Robinets d'incendie armés",
            localisation: ext.localisation,
            caracteristiques: {
              origine: "reprise-ria",
              depuisEquipementId: ext.id,
              reponseInitiale: reponse === true ? "oui" : "non renseignée",
            },
          },
        }),
      );
    }

    const lignes = await prisma.verification.findMany({
      where: { equipementId: ext.id, obligationId: OBLIGATION_RIA },
      select: { id: true },
    });
    for (const l of lignes) {
      aReaffecter += 1;
      operations.push(
        prisma.verification.update({
          where: { id: l.id },
          data: { equipementId: riaId },
        }),
      );
    }
    operations.push(
      prisma.equipement.update({
        where: { id: ext.id },
        data: { caracteristiques: sansCle as Prisma.InputJsonValue },
      }),
    );
  }

  console.log(
    `\n${extincteurs.length} extincteur(s) lus — ${aCreer} RIA à créer, ${aReaffecter} ligne(s) de calendrier à réaffecter, ${aNettoyer} clé(s) « non » à retirer.`,
  );

  if (!appliquer) {
    console.log("Dry-run : aucune écriture. Relancer avec --appliquer.");
  } else {
    await prisma.$transaction(operations);
    console.log("Appliqué. Régénérer les calendriers au prochain affichage.");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
