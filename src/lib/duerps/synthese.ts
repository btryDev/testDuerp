import { mesuresUniquementBasNiveau } from "@/lib/prevention";
import { prioriser } from "@/lib/cotation";
import { tousRisquesConnus } from "@/lib/referentiels";
import type { TypeMesure } from "@/lib/referentiels/types";

type MesureLike = {
  id: string;
  libelle: string;
  type: string;
  statut: string;
  echeance: Date | null;
  responsable: string | null;
};

type RisqueLike = {
  id: string;
  referentielId: string | null;
  libelle: string;
  gravite: number;
  probabilite: number;
  maitrise: number;
  criticite: number;
  cotationSaisie: boolean;
  mesures: MesureLike[];
};

type UniteLike = {
  id: string;
  nom: string;
  estTransverse: boolean;
  risques: RisqueLike[];
};

export type LigneRisque = {
  risqueId: string;
  libelle: string;
  uniteNom: string;
  uniteId: string;
  estTransverse: boolean;
  gravite: number;
  probabilite: number;
  maitrise: number;
  criticite: number;
  cotationSaisie: boolean;
  nombreMesures: number;
  nombreMesuresPrevues: number;
  alerteSousCotation: boolean;
  alerteHierarchieBasse: boolean;
};

export type LigneActionPrevue = {
  mesureId: string;
  libelleMesure: string;
  type: string;
  echeance: Date | null;
  responsable: string | null;
  libelleRisque: string;
  uniteNom: string;
  criticiteRisque: number;
};

export type ResumeSynthese = {
  lignes: LigneRisque[];
  actionsPrevues: LigneActionPrevue[];
  nbUnites: number;
  nbRisques: number;
  nbRisquesNonCotes: number;
  nbMesuresExistantes: number;
  nbMesuresPrevues: number;
  nbAlertesSousCotation: number;
  nbAlertesHierarchie: number;
};

export function construireSynthese(unites: UniteLike[]): ResumeSynthese {
  const refMap = tousRisquesConnus();
  const lignes: LigneRisque[] = [];
  const actions: LigneActionPrevue[] = [];

  let nbMesuresExistantes = 0;
  let nbMesuresPrevues = 0;

  for (const u of unites) {
    for (const r of u.risques) {
      const types = r.mesures.map((m) => m.type as TypeMesure);
      const alerteHierarchieBasse =
        r.mesures.length > 0 && mesuresUniquementBasNiveau(types);

      let alerteSousCotation = false;
      if (r.referentielId && r.cotationSaisie) {
        const ref = refMap.get(r.referentielId);
        if (
          ref?.criticiteReferenceSecteur !== undefined &&
          r.criticite < ref.criticiteReferenceSecteur
        ) {
          alerteSousCotation = true;
        }
      }

      lignes.push({
        risqueId: r.id,
        libelle: r.libelle,
        uniteNom: u.nom,
        uniteId: u.id,
        estTransverse: u.estTransverse,
        gravite: r.gravite,
        probabilite: r.probabilite,
        maitrise: r.maitrise,
        criticite: r.criticite,
        cotationSaisie: r.cotationSaisie,
        nombreMesures: r.mesures.length,
        nombreMesuresPrevues: r.mesures.filter((m) => m.statut === "prevue")
          .length,
        alerteSousCotation,
        alerteHierarchieBasse,
      });

      for (const m of r.mesures) {
        if (m.statut === "prevue") {
          nbMesuresPrevues += 1;
          actions.push({
            mesureId: m.id,
            libelleMesure: m.libelle,
            type: m.type,
            echeance: m.echeance,
            responsable: m.responsable,
            libelleRisque: r.libelle,
            uniteNom: u.nom,
            criticiteRisque: r.criticite,
          });
        } else {
          nbMesuresExistantes += 1;
        }
      }
    }
  }

  const lignesTriees = prioriser(
    lignes.map((l) => ({ ...l, id: l.risqueId })),
  ) as unknown as LigneRisque[];

  const actionsTriees = [...actions].sort((a, b) => {
    // Échéance absente = en queue
    const timeA = a.echeance?.getTime() ?? Number.POSITIVE_INFINITY;
    const timeB = b.echeance?.getTime() ?? Number.POSITIVE_INFINITY;
    if (timeA !== timeB) return timeA - timeB;
    return b.criticiteRisque - a.criticiteRisque;
  });

  return {
    lignes: lignesTriees,
    actionsPrevues: actionsTriees,
    nbUnites: unites.filter((u) => !u.estTransverse).length,
    nbRisques: lignes.length,
    nbRisquesNonCotes: lignes.filter((l) => !l.cotationSaisie).length,
    nbMesuresExistantes,
    nbMesuresPrevues,
    nbAlertesSousCotation: lignes.filter((l) => l.alerteSousCotation).length,
    nbAlertesHierarchie: lignes.filter((l) => l.alerteHierarchieBasse).length,
  };
}
