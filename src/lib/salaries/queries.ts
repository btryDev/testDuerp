import { prisma } from "@/lib/prisma";
import { classerDate, type RegistreLigne } from "@/lib/calendrier/etats";
import { titreParId } from "./catalogue";

/**
 * L'état d'un titre, tel que l'écran l'affiche.
 *
 * `aPlanifier` a ici un sens précis, et il n'est pas « en retard » : un titre
 * sans échéance écrite. L'habilitation électrique en est le cas type — le Code
 * renvoie à des modalités qu'il qualifie lui-même de recommandées, et le
 * produit ne décrète pas un rendez-vous là où le texte n'en pose aucun
 * (ADR-023 § 6). Le peindre en rouge inventerait une non-conformité.
 */
export type EtatTitre = RegistreLigne;

export function classerTitre(
  echeanceLe: Date | null,
  now: Date,
): EtatTitre {
  if (echeanceLe === null) return "aPlanifier";
  return classerDate(echeanceLe, now);
}

const SELECTION_TITRE = {
  id: true,
  obligationId: true,
  delivreLe: true,
  echeanceLe: true,
  note: true,
} as const;

export async function listerEquipe(etablissementId: string, now: Date) {
  const salaries = await prisma.salarie.findMany({
    where: { etablissementId },
    // Les personnes sorties de l'effectif en dernier, mais toujours là : leur
    // titre prouve qu'elles étaient habilitées AU MOMENT où elles ont opéré,
    // et cette preuve couvre l'employeur sur une période passée
    // (`docs/rgpd.md` § 4.3). Les masquer ferait disparaître la preuve de
    // l'écran sans la supprimer de la base — le pire des deux.
    orderBy: [{ actif: "desc" }, { nom: "asc" }, { prenom: "asc" }],
    select: {
      id: true,
      nom: true,
      prenom: true,
      poste: true,
      entreLe: true,
      actif: true,
      titres: { select: SELECTION_TITRE, orderBy: { delivreLe: "desc" } },
    },
  });

  return salaries.map((s) => ({
    ...s,
    titres: s.titres.map((t) => ({
      ...t,
      libelle: titreParId(t.obligationId)?.libelle ?? t.obligationId,
      etat: classerTitre(t.echeanceLe, now),
    })),
  }));
}

export async function getSalarie(
  etablissementId: string,
  salarieId: string,
  now: Date,
) {
  const s = await prisma.salarie.findFirst({
    // `etablissementId` dans le `where`, jamais seulement l'id : c'est la
    // portée de tenancy (ADR-005). Un identifiant deviné ne doit pas ouvrir
    // la fiche d'une personne d'un autre dossier.
    where: { id: salarieId, etablissementId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      poste: true,
      entreLe: true,
      actif: true,
      createdAt: true,
      titres: { select: SELECTION_TITRE, orderBy: { delivreLe: "desc" } },
    },
  });
  if (!s) return null;

  return {
    ...s,
    titres: s.titres.map((t) => {
      const o = titreParId(t.obligationId);
      return {
        ...t,
        libelle: o?.libelle ?? t.obligationId,
        /** Une pièce médicale ne s'affiche jamais avec un dépôt de fichier. */
        pieceMedicale: o?.pieceMedicale ?? false,
        referencesLegales: o?.referencesLegales ?? [],
        etat: classerTitre(t.echeanceLe, now),
      };
    }),
  };
}

/**
 * Le compteur du rail : les titres qui appellent un geste.
 *
 * `aPlanifier` n'y entre pas — un titre sans terme écrit n'est pas en attente
 * de quelque chose, il n'a simplement pas de rendez-vous. Le compter
 * afficherait une pastille rouge permanente que rien ne peut éteindre.
 */
export async function compterTitresEnRetard(
  etablissementId: string,
  now: Date,
): Promise<number> {
  const titres = await prisma.titreSalarie.findMany({
    where: { salarie: { etablissementId, actif: true }, echeanceLe: { not: null } },
    select: { echeanceLe: true },
  });
  return titres.filter(
    (t) => t.echeanceLe !== null && classerDate(t.echeanceLe, now) === "enRetard",
  ).length;
}

export type SalarieDeLaListe = Awaited<ReturnType<typeof listerEquipe>>[number];
export type SalarieDetail = NonNullable<Awaited<ReturnType<typeof getSalarie>>>;

/**
 * Les titres effectivement déclarés dans cet établissement.
 *
 * Distinct du **catalogue**, qui liste tout ce que le référentiel sait
 * encoder. La différence n'est pas cosmétique : c'est elle qui décide si le
 * texte d'information remis aux salariés (art. 13) décrit le traitement qui a
 * lieu, ou un traitement imaginaire.
 *
 * Le texte listait le catalogue. Un employeur qui saisissait trois personnes
 * sans déclarer aucun titre remettait donc à ses salariés un document
 * affirmant qu'on suivait leur attestation médicale — sur la pièce la plus
 * sensible qui soit, et alors que rien n'était suivi.
 */
export async function libellesTitresDeclares(
  etablissementId: string,
): Promise<string[]> {
  // Sans `actif: true`, délibérément — le seul `where` du module dans ce cas.
  // Le traitement se poursuit après le départ d'une personne (art. 17.3.b), et
  // le texte d'information doit décrire le traitement réel, pas seulement sa
  // part en cours.
  const lignes = await prisma.titreSalarie.groupBy({
    by: ["obligationId"],
    where: { salarie: { etablissementId } },
  });
  // `?? l.obligationId` et non un filtre : un titre dont l'identifiant ne
  // résout plus au référentiel disparaîtrait sinon en silence du texte
  // d'information — qui sous-décrirait le traitement, exactement la faute que
  // cette fonction corrige, en miroir. `getSalarie` gère déjà le cas ainsi.
  return lignes
    .map((l) => titreParId(l.obligationId)?.libelle ?? l.obligationId)
    .sort((a, b) => a.localeCompare(b, "fr"));
}
