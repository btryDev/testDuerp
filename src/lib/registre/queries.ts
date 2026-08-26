// Lecture : la composition du registre pour un établissement réel.
//
// `composition.ts` est pur et ne connaît pas la base. Ce module fait le pont :
// il projette l'établissement et son parc dans la forme minimale attendue par
// le moteur (`EtablissementMatching`, `EquipementMatching`) et rend les fiches
// dues, regroupées par partie.
//
// La projection est la même que celle du calendrier (`calendrier/actions.ts`) :
// même onze champs, même sémantique. Les deux doivent répondre à partir des
// mêmes faits — un registre qui annoncerait une fiche que le calendrier ignore
// serait un troisième avis sur la même question.

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { cleJourCivil } from "@/lib/dates";
import {
  aplatirRegistre,
  composerRegistreParPartie,
  type PartieDue,
  type SectionDue,
} from "./composition";
import { CHAMPS_PAR_SECTION, saisiePourSection, type FormeSaisie } from "./champs";
import { lireContenu, lignesDuJournal } from "./schema";

/**
 * Ce qu'une fiche a déjà recueilli, prêt à rendre — l'un ou l'autre, jamais
 * les deux : une fiche est un formulaire ou un journal, pas les deux à la fois.
 */
export type ContenuLu =
  | { champs?: Record<string, string | null>; lignes?: undefined }
  | { lignes?: ReturnType<typeof lignesDuJournal>; champs?: undefined };

export type RegistreDeLEtablissement = {
  parties: PartieDue[];
  /**
   * Par identifiant de fiche : ce qu'elle porte déjà.
   *
   * Les fiches adossées à l'établissement y figurent aussi, alimentées depuis
   * les colonnes qui portent leurs réponses. Elles ne stockent rien en propre
   * — c'est tout leur intérêt, une seule source — mais l'écran n'a pas à
   * connaître cette différence pour les afficher.
   */
  contenus: Record<string, ContenuLu>;
};

/**
 * Le registre d'un établissement : les fiches dues, et ce qu'elles portent
 * déjà. `null` si l'établissement n'existe pas ou n'appartient pas à
 * l'utilisateur — le scope est porté ici, pas par l'appelant.
 */
export async function composerRegistreDeLEtablissement(
  etablissementId: string,
): Promise<RegistreDeLEtablissement | null> {
  const user = await requireUser();
  const etab = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    select: {
      id: true,
      effectifSurSite: true,
      estEtablissementTravail: true,
      estERP: true,
      estIGH: true,
      estHabitation: true,
      typeErp: true,
      categorieErp: true,
      classeIgh: true,
      personnesPresentesHabituellement: true,
      manipuleMatieresR422722: true,
      // Seul le parc en service compte (ADR-012) : un appareil retiré ne fait
      // plus apparaître sa fiche d'inventaire ni sa fiche de vérification.
      // Les colonnes que les fiches « Renseignements généraux » et
      // « Établissement recevant du public » relisent (CCH R. 143-44).
      raisonDisplay: true,
      adresse: true,
      natureActivite: true,
      effectifPublicAdmis: true,
      dateAutorisationOuverture: true,
      dateCertificatConformite: true,
      entreprise: { select: { raisonSociale: true, adresse: true } },
      equipements: {
        where: { actif: true },
        select: { id: true, libelle: true, categorie: true },
        orderBy: [{ categorie: "asc" }, { createdAt: "asc" }],
      },
      fichesRegistre: { select: { sectionId: true, contenu: true } },
    },
  });
  if (!etab) return null;

  const parties = composerRegistreParPartie(
    {
      id: etab.id,
      effectifSurSite: etab.effectifSurSite,
      estEtablissementTravail: etab.estEtablissementTravail,
      estERP: etab.estERP,
      estIGH: etab.estIGH,
      estHabitation: etab.estHabitation,
      typeErp: etab.typeErp,
      categorieErp: etab.categorieErp,
      classeIgh: etab.classeIgh,
      personnesPresentesHabituellement: etab.personnesPresentesHabituellement,
      manipuleMatieresR422722: etab.manipuleMatieresR422722,
    },
    etab.equipements.map((eq) => ({
      id: eq.id,
      libelle: eq.libelle,
      categorie: eq.categorie,
      caracteristiques: null,
    })),
  );

  // Ce que les fiches à saisie libre ont déjà recueilli.
  const contenus: Record<string, ContenuLu> = {};
  for (const f of etab.fichesRegistre) {
    const c = lireContenu(f.contenu);
    contenus[f.sectionId] =
      "lignes" in c
        ? { lignes: lignesDuJournal(f.contenu) }
        : { champs: c.champs };
  }

  // Les fiches adossées à l'établissement lisent la colonne qui porte la
  // réponse. Une date sort en clé de jour civil (ADR-011) : `cleJourCivil` et
  // non `toISOString()`, sinon une date s'afficherait la veille.
  const jour = (d: Date | null) => (d ? cleJourCivil(d) : null);
  const parSource: Record<string, string | null> = {
    "Etablissement.adresse": etab.adresse,
    "Etablissement.natureActivite": etab.natureActivite,
    "Etablissement.typeErp": etab.typeErp,
    "Etablissement.categorieErp": etab.categorieErp,
    "Etablissement.effectifPublicAdmis":
      etab.effectifPublicAdmis === null ? null : String(etab.effectifPublicAdmis),
    "Etablissement.dateAutorisationOuverture": jour(etab.dateAutorisationOuverture),
    "Etablissement.dateCertificatConformite": jour(etab.dateCertificatConformite),
    "Entreprise.raisonSociale": etab.entreprise.raisonSociale,
    "Entreprise.adresse": etab.entreprise.adresse,
  };

  for (const [sectionId, saisie] of Object.entries(CHAMPS_PAR_SECTION)) {
    if (saisie.forme !== "etablissement") continue;
    contenus[sectionId] = {
      champs: Object.fromEntries(
        saisie.champs.map((c) => [c.cle, parSource[c.source] ?? null]),
      ),
    };
  }

  return { parties, contenus };
}

/** Le voisinage d'une fiche dans l'ordre du document. */
export type VoisineFiche = { id: string; titre: string };

export type FicheDuRegistre = {
  due: SectionDue;
  partie: { id: PartieDue["id"]; titre: string };
  saisie: FormeSaisie | undefined;
  contenu: ContenuLu;
  /** Rang dans l'ordre du document, à partir de 1. */
  rang: number;
  total: number;
  precedente: VoisineFiche | null;
  suivante: VoisineFiche | null;
};

/**
 * Une fiche seule, pour son écran dédié.
 *
 * `null` si l'établissement n'est pas à l'utilisateur, **ou si la fiche ne lui
 * est pas due** — l'appelant en fait un `notFound()`. Une fiche qui ne
 * concerne pas cet établissement n'a pas à s'ouvrir par son URL : elle ne
 * figure pas à son registre, et l'y laisser entrer donnerait à saisir des
 * réponses qui ne s'imprimeraient nulle part.
 */
export async function lireFicheDuRegistre(
  etablissementId: string,
  sectionId: string,
): Promise<FicheDuRegistre | null> {
  const registre = await composerRegistreDeLEtablissement(etablissementId);
  if (!registre) return null;

  const plat = aplatirRegistre(registre.parties);
  const i = plat.findIndex((f) => f.due.section.id === sectionId);
  if (i === -1) return null;

  const voisine = (n: number): VoisineFiche | null => {
    const v = plat[n];
    return v ? { id: v.due.section.id, titre: v.due.section.titre } : null;
  };

  return {
    due: plat[i].due,
    partie: { id: plat[i].partie.id, titre: plat[i].partie.titre },
    saisie: saisiePourSection(sectionId),
    contenu: registre.contenus[sectionId] ?? {},
    rang: i + 1,
    total: plat.length,
    precedente: voisine(i - 1),
    suivante: voisine(i + 1),
  };
}
