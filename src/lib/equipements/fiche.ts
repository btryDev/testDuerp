// Ce qu'une fiche d'équipement a besoin de savoir.
//
// Jusqu'ici, un équipement n'avait pas de fiche : la liste offrait
// « Modifier » et « Supprimer », et l'histoire de l'appareil — ses
// vérifications, ses rapports, les écarts qu'il a fait naître — vivait
// éclatée entre le calendrier, le registre et le plan d'actions. Le
// dirigeant devait recoller trois écrans pour répondre à une question
// simple : « où j'en suis avec cet extincteur ? ».
//
// Une seule lecture rassemble tout, puis des fonctions **pures** en tirent
// les trois listes que la fiche affiche : ce qui reste à faire, ce qui a
// été fait, et les obligations qui expliquent pourquoi. Rien n'est
// recalculé côté vue.

import type { ResultatVerification } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import {
  classerVerification,
  classerDate,
  type RegistreLigne,
} from "@/lib/calendrier/etats";
import { estActionEnRetard, estActionOuverte } from "@/lib/dates/retard";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { Obligation } from "@/lib/referentiels/conformite/types";

/**
 * L'équipement, ses lignes de suivi, leurs rapports et les actions qu'elles
 * ont fait naître. Un équipement retiré du parc (`actif: false`) reste
 * lisible : c'est même la seule porte vers son historique (ADR-012).
 */
export async function getFicheEquipement(id: string) {
  const user = await requireUser();
  return prisma.equipement.findFirst({
    where: { id, etablissement: { entreprise: { userId: user.id } } },
    include: {
      etablissement: { select: { id: true, raisonDisplay: true } },
      verifications: {
        orderBy: { datePrevue: "asc" },
        include: {
          rapports: { orderBy: { dateRapport: "desc" } },
          actions: true,
        },
      },
    },
  });
}

export type FicheEquipement = NonNullable<
  Awaited<ReturnType<typeof getFicheEquipement>>
>;
export type VerificationFiche = FicheEquipement["verifications"][number];
export type ActionFiche = VerificationFiche["actions"][number];
export type RapportFiche = VerificationFiche["rapports"][number];

/**
 * Une ligne « à faire » : une échéance de vérification qui n'est pas
 * soldée, ou une action corrective encore ouverte. Les deux se rangent sur
 * la même liste parce que c'est ainsi qu'elles arrivent au dirigeant —
 * l'une comme l'autre lui demandent un geste, à une date.
 */
export type LigneAFaire = {
  cle: string;
  genre: "verification" | "action";
  /** `null` = pas de rendez-vous convenu (occurrence à planifier). */
  date: Date | null;
  etat: RegistreLigne;
  surtitre: string;
  libelle: string;
  detail: string;
  href: string;
};

/** Une ligne d'historique : ce qui a été fait, daté du jour où ça l'a été. */
export type LigneHistoire = {
  cle: string;
  date: Date;
  etat: RegistreLigne;
  surtitre: string;
  libelle: string;
  detail: string;
  /** Le verdict du rapport, quand la ligne en porte un. */
  resultat: ResultatVerification | null;
  href: string | null;
};

/**
 * Ce qui reste à faire sur cet appareil, du plus urgent au plus lointain.
 *
 * Une occurrence « à planifier » n'a pas de rendez-vous : sa `datePrevue`
 * est une date de génération (ADR-010). Elle figure quand même dans la
 * liste — il y a bien quelque chose à faire — mais sans tuile-date, et elle
 * se range après les échéances datées.
 */
export function lignesAFaire(
  eq: FicheEquipement,
  base: string,
  maintenant: Date,
): LigneAFaire[] {
  const lignes: LigneAFaire[] = [];

  for (const v of eq.verifications) {
    const etat = classerVerification(v, maintenant);
    if (etat !== "faite") {
      lignes.push({
        cle: `v-${v.id}`,
        genre: "verification",
        date: etat === "aPlanifier" ? null : v.datePrevue,
        etat,
        surtitre: "Vérification",
        libelle: v.libelleObligation,
        detail:
          etat === "aPlanifier"
            ? "Aucune date convenue — à caler avec votre prestataire"
            : "Échéance portée au calendrier",
        href: `${base}/verifications/${v.id}`,
      });
    }

    for (const a of v.actions) {
      if (!estActionOuverte(a)) continue;
      lignes.push({
        cle: `a-${a.id}`,
        genre: "action",
        date: a.echeance,
        etat: !a.echeance
          ? "aPlanifier"
          : estActionEnRetard(a, maintenant)
            ? "enRetard"
            : classerDate(a.echeance, maintenant),
        surtitre: "Correction",
        libelle: a.libelle,
        detail: a.responsable
          ? `Responsable : ${a.responsable}`
          : "Responsable non désigné",
        href: `${base}/actions/${a.id}`,
      });
    }
  }

  return lignes.sort(comparerParDate);
}

/** Les datées d'abord, dans l'ordre ; les sans-date à la fin. */
function comparerParDate(
  a: { date: Date | null },
  b: { date: Date | null },
): number {
  if (a.date && b.date) return a.date.getTime() - b.date.getTime();
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
}

/**
 * Ce qui a été fait, du plus récent au plus ancien.
 *
 * Un rapport déposé fait foi : c'est lui qu'on présente en cas de
 * contrôle, donc c'est lui qui date la ligne. Une vérification marquée
 * réalisée sans rapport figure aussi — elle est moins solide, l'écran ne le
 * cache pas. La mise en service ferme la liste : elle explique pourquoi
 * l'appareil a un calendrier.
 */
export function lignesHistoire(
  eq: FicheEquipement,
  base: string,
  maintenant: Date,
): LigneHistoire[] {
  const lignes: LigneHistoire[] = [];

  for (const v of eq.verifications) {
    const href = `${base}/verifications/${v.id}`;

    if (v.rapports.length > 0) {
      // Les actions correctives d'une ligne de suivi sont rattachées à la
      // ligne, pas au rapport : impossible de dire lequel des dépôts les a
      // fait naître. On les annonce donc sur le plus récent (les rapports
      // arrivent triés décroissants), et sur lui seul — les répéter à
      // chaque dépôt ferait lire plusieurs fois les mêmes écarts.
      const nbActions = v.actions.length;
      v.rapports.forEach((r, i) => {
        lignes.push({
          cle: `r-${r.id}`,
          date: r.dateRapport,
          etat: "faite",
          surtitre: "Vérification",
          libelle: v.libelleObligation,
          detail: [
            "Rapport déposé",
            r.organismeVerif,
            i === 0 && nbActions > 0
              ? `${nbActions} action${nbActions > 1 ? "s" : ""} corrective${nbActions > 1 ? "s" : ""}`
              : null,
          ]
            .filter(Boolean)
            .join(" · "),
          resultat: r.resultat,
          href,
        });
      });
      continue;
    }

    if (classerVerification(v, maintenant) === "faite") {
      lignes.push({
        cle: `v-${v.id}`,
        date: v.dateRealisee ?? v.datePrevue,
        etat: "faite",
        surtitre: "Vérification",
        libelle: v.libelleObligation,
        detail: "Marquée réalisée — aucun rapport au dossier",
        resultat: null,
        href,
      });
    }
  }

  if (eq.dateMiseEnService) {
    lignes.push({
      cle: "mise-en-service",
      date: eq.dateMiseEnService,
      etat: "aPlanifier",
      surtitre: "Déclaration",
      libelle: "Mise en service de l'équipement",
      detail: "Ajouté au parc, calendrier généré",
      resultat: null,
      href: null,
    });
  }

  return lignes.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Les obligations qui pèsent sur cet appareil, dédoublonnées.
 *
 * Elles sont lues dans le référentiel TypeScript à partir des
 * `obligationId` portés par les lignes de suivi (ADR-003) — jamais
 * reconstituées depuis les libellés stockés. Une obligation retirée du
 * référentiel depuis la génération n'a plus de fiche : elle est écartée
 * plutôt qu'affichée sans sa source, puisqu'une référence réglementaire
 * ne s'invente pas.
 */
export function obligationsDeLEquipement(eq: FicheEquipement): Obligation[] {
  const vues = new Set<string>();
  const out: Obligation[] = [];
  for (const v of eq.verifications) {
    if (vues.has(v.obligationId)) continue;
    vues.add(v.obligationId);
    const o = obligationParId(v.obligationId);
    if (o) out.push(o);
  }
  return out;
}
