/**
 * Ce que l'écran « Ce qui doit être en place » lit.
 *
 * **Le sens de lecture est le point de ce module** : on part des obligations
 * que le moteur rend pour ce dossier, et on y **joint** les déclarations. Jamais
 * l'inverse.
 *
 * C'est ce qui règle, sans aucune machinerie, la contrainte d'idempotence de
 * l'ADR-012 : une déclaration dont l'obligation a quitté le référentiel n'a plus
 * d'obligation à laquelle se joindre, donc elle ne s'affiche plus. Elle n'est
 * pas supprimée pour autant — si l'obligation revient, la déclaration revient
 * avec elle. Une `Verification` orpheline, elle, doit être archivée et marquée,
 * parce qu'elle porte une date : elle affirme quelque chose. Une déclaration
 * n'affirme rien tant que personne ne la lit.
 */

import { prisma } from "@/lib/prisma";
import {
  determineObligationsApplicables,
  projeterEtablissement,
  type EquipementMatching,
  type EtablissementMatching,
} from "@/lib/matching";
import type { Obligation } from "@/lib/referentiels/conformite";
import { LABEL_DOMAINE } from "@/lib/calendrier/labels";
import type { DomaineObligation } from "@/lib/referentiels/conformite";
import { modeDeclaration, type ModeDeclaration } from "./regle";

export type LigneEtatPermanent = {
  obligation: Obligation;
  mode: ModeDeclaration["mode"];
  compteDansLEnTete: boolean;
  /** L'écrit que le texte attend, quand il en attend un. */
  pieceAttendue: string | null;
  /** `null` = non déclaré. Sinon la date de la déclaration. */
  declareLe: Date | null;
  note: string | null;
};

export type GroupeEtatsPermanents = {
  domaine: DomaineObligation;
  libelle: string;
  lignes: LigneEtatPermanent[];
};

export type EtatsPermanentsDuDossier = {
  groupes: GroupeEtatsPermanents[];
  /**
   * Le compteur d'en-tête. **Mesuré, jamais écrit à la main** : le brief le
   * demande, et ce dépôt s'est fait prendre plusieurs fois par des comptes
   * recopiés — jusque dans les briefs eux-mêmes.
   *
   * Il ne porte QUE les lignes en mode « état ». Une obligation qui revient
   * sans rythme écrit ne peut pas entrer dans « 6 sur 12 en place » : le
   * compteur porte une affirmation, pas un décompte.
   */
  enPlace: number;
  total: number;
  /** Les lignes « fait le », comptées à part et jamais additionnées au reste. */
  faitsDates: number;
  faitsDatesRenseignes: number;
};

/**
 * Charge les états permanents d'un établissement, déclarations jointes.
 *
 * Les obligations portées par un salarié n'y figurent jamais, et ce n'est pas
 * un filtre de ce module : le moteur ne les rend pas (ADR-023, leurs instances
 * naissent d'un `TitreSalarie` déclaré). L'écran Équipe leur donne déjà une
 * surface juste — « Sans terme écrit · Délivré le … » — et en ouvrir une
 * seconde ici ferait deux états qui divergeraient.
 */
export async function listerEtatsPermanents(
  etablissement: EtablissementMatching,
  equipements: EquipementMatching[],
): Promise<EtatsPermanentsDuDossier> {
  const applicables = determineObligationsApplicables(
    projeterEtablissement(etablissement),
    equipements,
  );

  const declarations = await prisma.declarationEtatPermanent.findMany({
    where: { etablissementId: etablissement.id },
    select: { obligationId: true, declareLe: true, note: true },
  });
  const parObligation = new Map(declarations.map((d) => [d.obligationId, d]));

  const parDomaine = new Map<DomaineObligation, LigneEtatPermanent[]>();
  let enPlace = 0;
  let total = 0;
  let faitsDates = 0;
  let faitsDatesRenseignes = 0;

  for (const app of applicables) {
    const o = app.obligation;
    // La périodicité effective, surcharge de prescription comprise : une
    // obligation à qui un arrêté préfectoral donne un rythme quitte cet écran
    // pour le calendrier. `surcharges` est indexé par équipement ; une
    // obligation portée par l'établissement n'en reçoit jamais.
    const surcharge = app.equipementsConcernes
      .map((eq) => app.surcharges?.[eq.id])
      .find((s) => s !== undefined);
    const periodiciteEffective = surcharge?.periodicite ?? o.periodicite;

    const mode = modeDeclaration(o, periodiciteEffective);
    if (!mode) continue;

    const d = parObligation.get(o.id) ?? null;
    const ligne: LigneEtatPermanent = {
      obligation: o,
      mode: mode.mode,
      compteDansLEnTete: mode.compteDansLEnTete,
      pieceAttendue: o.pieceAttendue,
      declareLe: d?.declareLe ?? null,
      note: d?.note ?? null,
    };

    if (mode.compteDansLEnTete) {
      total += 1;
      if (ligne.declareLe) enPlace += 1;
    } else {
      faitsDates += 1;
      if (ligne.declareLe) faitsDatesRenseignes += 1;
    }

    const liste = parDomaine.get(o.domaine) ?? [];
    liste.push(ligne);
    parDomaine.set(o.domaine, liste);
  }

  const groupes: GroupeEtatsPermanents[] = [...parDomaine.entries()]
    .map(([domaine, lignes]) => ({
      domaine,
      libelle: LABEL_DOMAINE[domaine],
      // À l'intérieur d'un domaine : ce qui reste à faire d'abord. Un écran
      // dont le haut est déjà coché ne dit pas ce qu'il reste.
      lignes: lignes.sort((a, b) => {
        if ((a.declareLe === null) !== (b.declareLe === null)) {
          return a.declareLe === null ? -1 : 1;
        }
        return a.obligation.libelle.localeCompare(b.obligation.libelle, "fr");
      }),
    }))
    .sort((a, b) => a.libelle.localeCompare(b.libelle, "fr"));

  return { groupes, enPlace, total, faitsDates, faitsDatesRenseignes };
}
