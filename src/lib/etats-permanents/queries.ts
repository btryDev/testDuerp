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
import { requireUser } from "@/lib/auth/require-user";
import {
  determineObligationsApplicables,
  projeterEtablissement,
  type EquipementMatching,
  type EtablissementMatching,
} from "@/lib/matching";
import type { Obligation } from "@/lib/referentiels/conformite";
import { LABEL_DOMAINE } from "@/lib/calendrier/labels";
import type { DomaineObligation } from "@/lib/referentiels/conformite";
import { modeDeclarationApplique, type ModeDeclaration } from "./regle";

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
  /** Les états à déclarer en place, groupés par domaine. */
  groupes: GroupeEtatsPermanents[];
  /**
   * Ce qui revient sans rythme écrit, **à part et non mêlé aux états**.
   *
   * Le contrôle visuel du 2026-08-31 a tranché ce point : les deux verbes
   * cohabitaient dans la même carte, avec deux pastilles strictement
   * identiques, et la seule différence tenait dans les trois mots du bouton. Le
   * relecteur a coché douze lignes en sept secondes sans en lire une seule — et
   * dans ce geste-là, deux pastilles qui se ressemblent sont la même action.
   *
   * La distinction est donc portée par le **regroupement**, qui se voit sans se
   * lire, et non par une teinte ou une icône qu'il faudrait décoder. C'est
   * aussi ce qui permet à l'explication de vivre à côté des lignes concernées
   * plutôt qu'en pied de page, « là où l'on arrive après avoir tout coché ».
   */
  faits: LigneEtatPermanent[];
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

  // Le prédicat d'appartenance, porté par la lecture elle-même.
  //
  // L'unique appelant d'aujourd'hui passe par `requireEtablissement(id)`, et
  // cette lecture était donc sûre. Ça ne suffit pas, et le dépôt l'a déjà écrit
  // ailleurs : `batimentParDefaut` porte le même prédicat MALGRÉ un appelant
  // vérifié, avec la note « décrit l'usage, pas une dispense ».
  //
  // La raison est dans la signature : cette fonction accepte n'importe quel
  // `EtablissementMatching`. Le jour où un second appelant la nourrit d'un id
  // qui n'a pas été confronté au user, les déclarations d'un autre compte
  // sortent — avec leur note libre, qui est du texte écrit par un dirigeant sur
  // sa propre conformité. La sécurité d'une lecture ne doit pas dépendre de qui
  // l'appelle : c'est ce que `batiments/queries.ts` formule par « une lecture
  // qui ne le porte pas devient une fuite le jour où quelqu'un rend la fonction
  // publique ».
  const user = await requireUser();
  const declarations = await prisma.declarationEtatPermanent.findMany({
    where: {
      etablissementId: etablissement.id,
      etablissement: { entreprise: { userId: user.id } },
    },
    select: { obligationId: true, declareLe: true, note: true },
  });
  const parObligation = new Map(declarations.map((d) => [d.obligationId, d]));

  const parDomaine = new Map<DomaineObligation, LigneEtatPermanent[]>();
  const faits: LigneEtatPermanent[] = [];
  let enPlace = 0;
  let total = 0;
  let faitsDates = 0;
  let faitsDatesRenseignes = 0;

  for (const app of applicables) {
    const o = app.obligation;
    // La règle vit dans `regle.ts`, surcharge de prescription comprise. Elle
    // était calculée ici, et la garde de l'action ne la calculait pas : deux
    // lectures de la même règle, dont une fausse.
    const mode = modeDeclarationApplique(app);
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

    if (mode.mode === "fait") {
      faits.push(ligne);
    } else {
      const liste = parDomaine.get(o.domaine) ?? [];
      liste.push(ligne);
      parDomaine.set(o.domaine, liste);
    }
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

  // Les lignes « fait le » sont triées comme les autres : ce qui reste à faire
  // d'abord. Un écran dont le haut est déjà coché ne dit pas ce qu'il reste.
  faits.sort((a, b) => {
    if ((a.declareLe === null) !== (b.declareLe === null)) {
      return a.declareLe === null ? -1 : 1;
    }
    return a.obligation.libelle.localeCompare(b.obligation.libelle, "fr");
  });

  return { groupes, faits, enPlace, total, faitsDates, faitsDatesRenseignes };
}

/**
 * Les deux compteurs du score, et rien d'autre.
 *
 * **Pourquoi une entrée séparée plutôt que `listerEtatsPermanents` appelée
 * depuis le tableau de bord.** L'écran a besoin des groupes, des libellés et
 * des dates ; le score n'a besoin que de deux entiers. Faire transiter le
 * reste par le tableau de bord et par le générateur de PDF les rendrait
 * dépendants de la forme d'affichage d'un écran, qui bouge.
 *
 * **Mais le calcul, lui, n'est pas dupliqué**, et c'est la seule chose qui
 * compte : cette fonction ne recompte rien, elle prend `enPlace` et `total` du
 * même passage que l'écran. Un compteur réécrit ici finirait par diverger de
 * celui qu'affiche l'écran — c'est déjà arrivé au score lui-même, quand le
 * tableau de bord et le dossier PDF composaient chacun son dénominateur et
 * sortaient deux notes différentes au même instant.
 *
 * **`userId` en paramètre plutôt qu'un `requireUser()` interne**, sur le
 * modèle de `dashboard/transmissions.ts` : les deux appelants viennent d'un
 * contexte déjà authentifié, et rappeler `requireUser()` ajoutait une lecture
 * de session par affichage du tableau de bord. La garantie ne s'en remet pas
 * pour autant à l'appelant — le prédicat d'appartenance est porté par la
 * requête ci-dessous, et c'est `etab.id` qui est propagé ensuite, jamais
 * l'identifiant reçu.
 */
export async function compterEtatsPermanents(
  etablissementId: string,
  userId: string,
): Promise<{ total: number; enPlace: number }> {
  const etab = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId } },
    include: { equipements: { where: { actif: true } } },
  });
  // Un dossier qui n'est pas celui de l'utilisateur n'a pas d'état permanent
  // à montrer, et zéro sur zéro ne produit aucune indétermination : le score
  // reste ce qu'il aurait été sans ce terme.
  if (!etab) return { total: 0, enPlace: 0 };

  const { total, enPlace } = await listerEtatsPermanents(
    etab,
    etab.equipements.map((eq) => ({
      id: eq.id,
      libelle: eq.libelle,
      categorie: eq.categorie,
      caracteristiques: (eq.caracteristiques ?? null) as Record<
        string,
        unknown
      > | null,
    })),
  );

  return { total, enPlace };
}
