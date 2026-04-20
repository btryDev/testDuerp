import { prisma } from "@/lib/prisma";
import type {
  DuerpSnapshot,
  MesureSnapshot,
  UniteSnapshot,
} from "./snapshot";
import type { TypeMesure } from "@/lib/referentiels/types";

/**
 * Construit un snapshot DUERP à partir de l'état courant en base.
 * Partagé entre la validation de version et l'aperçu brouillon du PDF.
 * Ne persiste rien — la persistance reste à la charge de l'appelant.
 */
export async function construireSnapshot(
  duerpId: string,
  options: { numero: number; motif: string | null },
): Promise<DuerpSnapshot | null> {
  const duerp = await prisma.duerp.findUnique({
    where: { id: duerpId },
    include: {
      entreprise: true,
      unites: {
        orderBy: { nom: "asc" },
        include: {
          risques: {
            orderBy: { libelle: "asc" },
            include: { mesures: true },
          },
        },
      },
    },
  });
  if (!duerp) return null;

  const unitesSnap: UniteSnapshot[] = duerp.unites.map((u) => ({
    id: u.id,
    nom: u.nom,
    description: u.description,
    estTransverse: u.estTransverse,
    aucunRisqueJustif: u.aucunRisqueJustif,
    risques: u.risques.map((r) => ({
      id: r.id,
      referentielId: r.referentielId,
      libelle: r.libelle,
      description: r.description,
      gravite: r.gravite,
      probabilite: r.probabilite,
      maitrise: r.maitrise,
      criticite: r.criticite,
      cotationSaisie: r.cotationSaisie,
      nombreSalariesExposes: r.nombreSalariesExposes,
      dateMesuresPhysiques: r.dateMesuresPhysiques
        ? r.dateMesuresPhysiques.toISOString()
        : null,
      exposeCMR: r.exposeCMR,
      mesures: r.mesures.map<MesureSnapshot>((m) => ({
        id: m.id,
        libelle: m.libelle,
        type: m.type as TypeMesure,
        statut: m.statut as "existante" | "prevue",
        echeance: m.echeance ? m.echeance.toISOString() : null,
        responsable: m.responsable,
      })),
    })),
  }));

  return {
    version: options.numero,
    genereLe: new Date().toISOString(),
    motif: options.motif,
    referentielSecteurId: duerp.referentielSecteurId,
    entreprise: {
      raisonSociale: duerp.entreprise.raisonSociale,
      siret: duerp.entreprise.siret,
      codeNaf: duerp.entreprise.codeNaf,
      effectif: duerp.entreprise.effectif,
      adresse: duerp.entreprise.adresse,
    },
    unites: unitesSnap,
  };
}
