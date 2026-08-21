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
import { formaterDateCourteFr } from "@/lib/dates";

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
      periodicites: [],
    };

    if (!courant.periodicites.includes(v.periodicite)) {
      courant.periodicites.push(v.periodicite);
    }

    if (etat === "faite") {
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
 * L'état d'un appareil ramené à ce qu'une ligne de liste peut porter :
 * une couleur, une date, une phrase.
 *
 * La page Équipements composait ces trois choses à la main, dans le corps
 * du rendu — impossible à tester, et déjà divergent de ce que la fiche
 * annonce. La règle de préséance est la même que partout ailleurs : le
 * retard prime, puis le rendez-vous pris, puis l'absence de rendez-vous,
 * puis la dernière preuve. Et jamais un mot de conformité : l'outil rend
 * des dates, il ne certifie pas (cf. garde-fous produit).
 */
export type ResumeEquipement = {
  etat: RegistreLigne;
  /** La date que porte la tuile — le prochain rendez-vous, ou à défaut la
   *  dernière preuve. Absente : l'appareil n'a ni l'un ni l'autre. */
  date: Date | null;
  /** Une phrase de faits, prête à afficher. */
  phrase: string;
};

export function resumerEquipement(
  etat: EtatEquipement | undefined,
): ResumeEquipement {
  if (!etat) {
    return {
      etat: "aPlanifier",
      date: null,
      phrase: "Aucune vérification périodique rattachée",
    };
  }

  const parts: string[] = [];
  if (etat.enRetard > 0) {
    parts.push(
      `${etat.enRetard} vérification${etat.enRetard > 1 ? "s" : ""} en retard`,
    );
  }
  if (etat.aPlanifier > 0) {
    parts.push(
      `${etat.aPlanifier} à planifier`,
    );
  }
  if (etat.prochaine) {
    // Une occurrence dépassée est la « prochaine » au sens du calcul,
    // jamais au sens de la langue : annoncer « Prochaine : 4 août » un
    // 20 août serait faux.
    parts.push(
      etat.prochaine.etat === "enRetard"
        ? `attendue le ${formaterDateCourteFr(etat.prochaine.date)}`
        : `prochaine le ${formaterDateCourteFr(etat.prochaine.date)}`,
    );
  }
  parts.push(
    etat.derniere
      ? `dernière vérification le ${formaterDateCourteFr(etat.derniere)}`
      : "aucune vérification connue à ce jour",
  );

  const phrase = parts.join(" · ");
  const majuscule = phrase.charAt(0).toUpperCase() + phrase.slice(1);

  if (etat.enRetard > 0) {
    return { etat: "enRetard", date: etat.prochaine?.date ?? null, phrase: majuscule };
  }
  if (etat.prochaine) {
    return {
      etat: etat.prochaine.etat,
      date: etat.prochaine.date,
      phrase: majuscule,
    };
  }
  if (etat.aPlanifier > 0) {
    return { etat: "aPlanifier", date: null, phrase: majuscule };
  }
  return {
    etat: etat.derniere ? "faite" : "aPlanifier",
    date: etat.derniere,
    phrase: majuscule,
  };
}
