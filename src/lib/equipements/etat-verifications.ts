// Où en est chaque appareil, du point de vue de ses vérifications.
//
// La page Équipements était un inventaire nu — catégorie, libellé,
// localisation, date de mise en service — et ne disait rien de l'état de
// vérification du parc. Or c'est la première question qu'un dirigeant pose
// devant une échéance : « ça vient de quel équipement, et où j'en suis avec
// lui ? » (ADR-015, révision).
//
// Le calendrier répond « qu'est-ce qui tombe quand » ; cette lecture répond
// « où en est chacun ». Deux questions, deux écrans, une seule donnée.

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { classerVerification, type RegistreLigne } from "@/lib/calendrier/etats";
import type { Periodicite } from "@/lib/referentiels/types-communs";

export type EtatEquipement = {
  /** Vérifications dépassées sur cet appareil. */
  enRetard: number;
  /** La prochaine échéance non faite, la plus proche. Absente quand
   *  l'appareil n'a aucune occurrence à venir. */
  prochaine: { date: Date; libelle: string; etat: RegistreLigne } | null;
  /** La dernière vérification réalisée. Absente = aucune connue, ce qui
   *  n'est pas la même chose que « à jour ». */
  derniere: Date | null;
  /** Occurrences sans rendez-vous : leur `datePrevue` est une date de
   *  génération, pas une date choisie (ADR-010). Elles ne peuvent pas se
   *  poser sur un jour, mais l'appareil doit les annoncer. */
  aPlanifier: number;
  /** Vérifications déjà réalisées. Un compte, pas un verdict. */
  faites: number;
  /** Les rythmes portés par cet appareil, dans l'ordre où ils
   *  apparaissent. Ils viennent des lignes de suivi elles-mêmes, jamais
   *  d'une re-déduction depuis le référentiel : c'est ce qui a été généré
   *  qui fait foi, pas ce qui devrait l'être. */
  periodicites: Periodicite[];
};

/**
 * L'état de chaque appareil, indexé par `equipementId`.
 *
 * Une seule lecture pour tout le parc — la page en affiche des dizaines, et
 * une requête par ligne serait un N+1. L'horloge est capturée une fois et
 * partagée par tous les classements (ADR-011).
 */
export async function etatVerificationsParEquipement(
  etablissementId: string,
  now: Date = new Date(),
): Promise<Map<string, EtatEquipement>> {
  const user = await requireUser();
  const verifs = await prisma.verification.findMany({
    where: {
      etablissementId,
      etablissement: { entreprise: { userId: user.id } },
    },
    select: {
      equipementId: true,
      libelleObligation: true,
      statut: true,
      datePrevue: true,
      dateRealisee: true,
      periodicite: true,
    },
    orderBy: { datePrevue: "asc" },
  });

  return repartirParEquipement(verifs, now);
}

/** Ce que fait la lecture, sans la base : la partie testable. Les
 *  occurrences doivent arriver **triées par date croissante**. */
export function repartirParEquipement(
  verifs: Array<{
    equipementId: string;
    libelleObligation: string;
    statut: string;
    datePrevue: Date;
    dateRealisee: Date | null;
    periodicite: Periodicite;
  }>,
  now: Date,
): Map<string, EtatEquipement> {
  const parEquipement = new Map<string, EtatEquipement>();

  for (const v of verifs) {
    const etat = classerVerification(v, now);
    const courant = parEquipement.get(v.equipementId) ?? {
      enRetard: 0,
      prochaine: null,
      derniere: null,
      aPlanifier: 0,
      faites: 0,
      periodicites: [],
    };

    if (!courant.periodicites.includes(v.periodicite)) {
      courant.periodicites.push(v.periodicite);
    }

    if (etat === "faite") {
      courant.faites += 1;
      // `dateRealisee` peut manquer sur un statut « realisee_… » ancien :
      // la date prévue fait alors foi, faute de mieux.
      const faiteLe = v.dateRealisee ?? v.datePrevue;
      if (!courant.derniere || faiteLe > courant.derniere) {
        courant.derniere = faiteLe;
      }
    } else {
      if (etat === "enRetard") courant.enRetard += 1;
      if (etat === "aPlanifier") courant.aPlanifier += 1;
      // Les occurrences arrivent triées par date : la première non faite
      // qui porte un vrai rendez-vous est la prochaine. Une occurrence « à
      // planifier » n'en est pas un — sa date est une date de génération.
      if (!courant.prochaine && etat !== "aPlanifier") {
        courant.prochaine = {
          date: v.datePrevue,
          libelle: v.libelleObligation,
          etat,
        };
      }
    }

    parEquipement.set(v.equipementId, courant);
  }

  return parEquipement;
}

/**
 * L'état d'un appareil ramené à ce qu'une carte d'inventaire porte : un
 * état dominant, et des signaux comptés.
 *
 * Plus de date ici. Le parc répond à « qu'est-ce que j'ai, et où » ; le
 * calendrier répond à « qu'est-ce qui tombe quand ». Poser une échéance
 * sur chaque carte faisait lire l'inventaire comme un agenda — alors que
 * l'agenda existe déjà, à côté, et le dit mieux.
 *
 * La règle de préséance est celle du reste de l'application : le retard
 * prime, puis le rendez-vous pris, puis l'absence de rendez-vous, puis la
 * dernière preuve. Et jamais un mot de conformité — l'outil compte, il ne
 * certifie pas (cf. garde-fous produit) : « 2 faites » dit deux
 * vérifications réalisées, pas un appareil en règle.
 */
export type SignalEquipement = {
  cle: "enRetard" | "aPlanifier" | "faite";
  nb: number;
  libelle: string;
};

export type ResumeEquipement = {
  /** L'état dominant : champ de la jauge de catégorie, et rang de tri. */
  etat: RegistreLigne;
  /** Les signaux à afficher, du plus urgent au plus calme. Vide quand
   *  aucune vérification n'est rattachée — l'écran le dit alors en clair. */
  signaux: SignalEquipement[];
};

export function resumerEquipement(
  etat: EtatEquipement | undefined,
): ResumeEquipement {
  if (!etat) return { etat: "aPlanifier", signaux: [] };

  const signaux: SignalEquipement[] = [];
  if (etat.enRetard > 0) {
    signaux.push({
      cle: "enRetard",
      nb: etat.enRetard,
      libelle: `${etat.enRetard} dépassée${etat.enRetard > 1 ? "s" : ""}`,
    });
  }
  if (etat.aPlanifier > 0) {
    signaux.push({
      cle: "aPlanifier",
      nb: etat.aPlanifier,
      libelle: `${etat.aPlanifier} à planifier`,
    });
  }
  if (etat.faites > 0) {
    signaux.push({
      cle: "faite",
      nb: etat.faites,
      libelle: `${etat.faites} faite${etat.faites > 1 ? "s" : ""}`,
    });
  }

  const dominant: RegistreLigne =
    etat.enRetard > 0
      ? "enRetard"
      : etat.prochaine
        ? etat.prochaine.etat
        : etat.aPlanifier > 0
          ? "aPlanifier"
          : etat.faites > 0
            ? "faite"
            : "aPlanifier";

  return { etat: dominant, signaux };
}
