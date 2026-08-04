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
 *
 * Le format `mesures: [...]` est conservé dans le snapshot malgré le passage
 * à `Action` en base (ADR-002) : les snapshots sont des documents versionnés
 * à valeur légale, consommés tels quels par le moteur PDF. La conversion
 * Action → MesureSnapshot est triviale et documentée dans le code ci-dessous.
 */
export async function construireSnapshot(
  duerpId: string,
  options: { numero: number; motif: string | null },
): Promise<DuerpSnapshot | null> {
  const duerp = await prisma.duerp.findUnique({
    where: { id: duerpId },
    include: {
      etablissement: { include: { entreprise: true } },
      unites: {
        orderBy: { nom: "asc" },
        include: {
          risques: {
            orderBy: { libelle: "asc" },
            include: { actions: true },
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
      mesures: r.actions.map<MesureSnapshot>((a) => ({
        id: a.id,
        libelle: a.libelle,
        type: a.type as TypeMesure,
        // Action.statut (ouverte|en_cours|levee|abandonnee) → MesureSnapshot.statut (existante|prevue).
        // "levee" = mesure déjà en place = "existante" ; sinon "prevue".
        statut: a.statut === "levee" ? "existante" : "prevue",
        echeance: a.echeance ? a.echeance.toISOString() : null,
        responsable: a.responsable,
      })),
    })),
  }));

  const etab = duerp.etablissement;
  const ent = etab.entreprise;

  return {
    version: options.numero,
    genereLe: new Date().toISOString(),
    motif: options.motif,
    referentielSecteurId: duerp.referentielSecteurId,
    entreprise: {
      raisonSociale: ent.raisonSociale,
      siret: ent.siret,
      codeNaf: etab.codeNaf ?? ent.codeNaf,
      effectif: etab.effectifSurSite,
      adresse: etab.adresse,
    },
    unites: unitesSnap,
  };
}
