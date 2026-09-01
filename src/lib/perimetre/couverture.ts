// Ce que Rojer couvre, et ce qu'il ne couvre pas.
//
// Le produit est construit pour les ERP de **5e catégorie** et pour les
// établissements soumis au Code du travail. Ce n'est pas un choix de
// développement, c'est une frontière réglementaire nette : l'article PE 1 § 1
// de l'arrêté du 22 juin 1990 écarte, pour la 5e catégorie, la totalité du
// livre II du règlement de sécurité. Au premier seuil franchi, ce livre
// s'applique d'un coup — dispositions générales (moyens de secours, service
// de sécurité incendie, désenfumage…) et dispositions particulières au type
// d'activité. Le référentiel n'en connaît rien.
//
// D'où ce module. Un établissement hors périmètre ne doit pas être bloqué —
// il n'y a rien de dangereux à consulter ses équipements — mais il doit
// **savoir** que ce qu'il lit est incomplet. Un calendrier et un registre qui
// paraissent complets alors qu'ils ignorent la moitié du règlement sont pires
// qu'un refus : le dirigeant s'y fierait devant une commission.
//
// ## Sept axes, une seule adresse
//
// Le régime ERP n'est pas le seul bord du produit, et il n'a jamais été le
// seul. Trois autres mécanismes disaient déjà, chacun dans son coin, une
// partie de ce que l'outil ignore :
//
//  - `lib/duerps/couverture.ts` (ADR-020) — ce que le DUERP ne couvre pas,
//    déclaré par l'employeur et gravé avec la version ;
//  - `lib/equipements/hors-referentiel.ts` — les appareils pour lesquels le
//    référentiel ne calcule aucune échéance, en trois motifs distincts ;
//  - `lib/referentiels/corpus/` — les articles lus dont le produit ne porte
//    pas l'obligation (`non_couvert`), avec `declareA` qui dit **où** le
//    manque est annoncé.
//
// Un cinquième s'y est ajouté, `public_recu`, et il vient d'ailleurs : ce
// n'est pas un bord du référentiel, c'est une **donnée du dossier qui manque**.
// `matching/engine.ts` retombe sur l'effectif salarié quand le nombre de
// personnes habituellement présentes n'est pas déclaré — une entorse à
// l'ADR-022 § 7, recensée là-bas et dans
// `docs/dette-chantier-porteur-echeance.md` § 4. L'ADR concluait que « le canal
// d'affichage manque », `EcheanceCalendrier.tone` étant binaire. Il cherchait
// une couleur d'échéance ; ce qu'il fallait était une phrase, et c'est
// exactement ce que ce module rend. La projection vit dans
// `matching/public-recu.ts` : ici comme ailleurs, on ne recalcule rien.
//
// Un cinquième axe, `famille_obligation`, a projeté ce dernier pendant une
// journée : il nommait à chaque dirigeant les vingt-sept articles que le
// produit ne porte pas. Retiré le 2026-08-28 par décision produit, et pas
// parce qu'il était faux — c'était le seul des cinq à énoncer une propriété
// du PRODUIT et non du dossier, la même pour tout le monde, et déclarer ce
// qu'on ne couvre pas suppose d'avoir tranché ce qu'on couvre. Il répondait à
// une question qui n'était pas encore posée.
// Ces vingt-sept articles vivent désormais dans
// `docs/couverture-declaree-du-produit.md`, qui dit aussi ce qu'il faudrait
// pour rendre l'axe propre au dossier : un rattachement article →
// `Etablissement.typeErp`.
//
// Ce dernier champ est ce qui a décidé de la forme de ce module. Au
// 2026-08-28, vingt-cinq des vingt-huit articles `non_couvert` portent
// `declareA: "Non déclaré à ce jour."`, et l'un d'eux nomme le défaut mot pour
// mot : « Le bandeau de couverture annonce la catégorie d'ERP, pas les locaux
// à sommeil. » Le corpus attendait donc une adresse où déclarer ses manques,
// et il n'y en avait pas.
//
// Ce module est cette adresse. Il **n'ajoute aucune source de vérité** : il
// projette celles qui existent en une même forme, lisible au même endroit.
// C'est la règle à tenir dans toute évolution — un axe qui déclare au lieu de
// projeter fait de ce module la troisième déclaration que son propre
// commentaire interdisait.
//
// Ni total, ni pourcentage, ni score : les axes ne s'additionnent pas. Quatre
// manques ne font pas « 4 » — ils font quatre phrases, chacune vraie d'une
// chose différente. Et un même axe peut en porter deux : `secteur_duerp` dit
// à la fois ce que le DUERP déclare ne pas couvrir et le fait qu'il s'appuie
// sur le référentiel d'un autre métier. Un chiffre laisserait croire
// à une mesure de la complétude, que rien ne fonde.
//
// Module **pur** : ni Prisma, ni React, ni horloge. Les faits lui sont
// donnés ; leur collecte vit dans `faits.ts`, sur le modèle du couple
// `reperterSansEcheance` / `equipementsSansEcheance`.

import type { EtatCouverture } from "@/lib/duerps/couverture";
import type { CorrespondanceSecteur } from "./secteur";
import type {
  CategorieErp,
  FamilleHabitation,
} from "@/lib/referentiels/types-communs";

/**
 * Les catégories que le produit couvre.
 *
 * ⚠ Destinée à descendre auprès de l'enum qu'elle contraint
 * (`referentiels/types-communs`), et non à rester ici. Ce module importe déjà
 * `CategorieErp` du référentiel ; le jour où le référentiel voudra lire cette
 * constante — pour dire d'un article dépouillé qu'il est hors périmètre — on
 * aurait `referentiels → perimetre → referentiels`. Un cycle entre dossiers
 * finit toujours par se payer.
 *
 * Elle reste ici le temps que les branches se rejoignent : la déplacer depuis
 * deux branches séparées garantirait un conflit. Un seul endroit, quel qu'il
 * soit — jamais deux déclarations de ce que le produit couvre.
 */
export const CATEGORIES_COUVERTES: readonly CategorieErp[] = ["N5"];

/**
 * De quoi le manque parle. Sept axes qui ne se confondent ni ne
 * s'additionnent — chacun a sa source, et chacun se répare par un geste
 * différent.
 */
export type AxeCouverture =
  /** Le régime de l'établissement met tout le reste hors de portée (IGH). */
  | "igh"
  /** La catégorie d'ERP rouvre le livre II, que le référentiel ne connaît pas. */
  | "categorie_erp"
  /** Le DUERP ne couvre pas tout — projection de l'ADR-020. */
  | "secteur_duerp"
  /** Des appareils du parc ne portent aucune échéance — rappel de
   *  `equipements/hors-referentiel.ts`. */
  | "domaine_equipement"
  /** Le public reçu n'est pas déclaré, et le repli du moteur écarte des
   *  obligations — projection de `matching/public-recu.ts`. */
  | "public_recu"
  /** L'immeuble d'habitation n'a pas de famille : les obligations de
   *  l'arrêté du 31 janvier 1986 lui sont servies sans distinction. */
  | "famille_habitation"
  /** L'effectif dépasse la taille que la porte de création accepte, et le
   *  dossier vit quand même — projection de l'ADR-031 § 1 bis. */
  | "effectif";

/**
 * Un fait établi : l'outil ne sait pas dire quelque chose, et on sait quoi.
 *
 * `motif` énonce le fait, `consequence` ce que l'outil ne sait donc pas dire.
 * Aucun des deux ne qualifie la situation de l'établissement au regard du
 * droit — ni « incomplet », ni « non conforme », ni l'inverse rassurant.
 */
export type ManqueCouverture = {
  axe: AxeCouverture;
  /** Le fait, en une phrase adressée au dirigeant. */
  motif: string;
  /** Ce que l'application ne sait donc pas lui dire. */
  consequence: string;
};

/**
 * On ne peut pas trancher : la donnée qui décide manque. Ne jamais traiter ce
 * cas comme « couvert » — c'est exactement l'hypothèse silencieuse que ce
 * module existe pour empêcher.
 */
export type IndeterminationCouverture = {
  axe: AxeCouverture;
  motif: string;
  /** Le geste qui lève le doute. */
  quoiFaire: string;
};

/**
 * L'état de couverture d'un dossier.
 *
 * Deux listes, jamais un état unique : un dossier peut très bien être hors
 * périmètre par sa catégorie **et** avoir une question de secteur non
 * tranchée. Les rabattre sur un mot en perdrait une moitié.
 *
 * Les deux listes vides veut dire « aucun manque identifié », et pas « le
 * dossier est complet » : le référentiel a un périmètre, le droit n'en a pas.
 */
export type CouvertureEtablissement = {
  manques: ManqueCouverture[];
  indeterminations: IndeterminationCouverture[];
};

/** `true` quand il n'y a ni manque ni question ouverte. */
export function riensASignaler(c: CouvertureEtablissement): boolean {
  return c.manques.length === 0 && c.indeterminations.length === 0;
}

/* ─── Les faits, tels que le module les reçoit ────────────────────────── */

/** Le régime déclaré de l'établissement. */
export type RegimeEtablissement = {
  estERP: boolean;
  estIGH: boolean;
  categorieErp: CategorieErp | null;
  estHabitation: boolean;
  familleHabitation: FamilleHabitation | null;
};

/**
 * Ce que l'ADR-020 a déjà établi du DUERP, projeté ici sans être recalculé.
 *
 * `etat` est le type même que rend `evaluerCouverture` : l'importer plutôt que
 * de le recopier est ce qui empêche cet axe de devenir une seconde
 * déclaration. Le `switch` qui le lit est exhaustif — si l'ADR-020 gagne un
 * état, la compilation s'arrête ici, et quelqu'un décide de la phrase.
 */
export type FaitDuerp = {
  etat: EtatCouverture;
  /** Le nom du secteur retenu, ou `null` si l'identifiant n'a rien résolu. */
  secteurNom: string | null;
  /** Combien d'activités le dirigeant déclare exercer et que le référentiel ne
   *  couvre pas. Le détail se lit dans le DUERP, pas ici. */
  nbActivitesDeclarees: number;
  /**
   * Le rapport entre le secteur retenu et celui que le code NAF désigne
   * (`perimetre/secteur.ts`).
   *
   * `diverge` veut dire que le document unique s'appuie sur le référentiel
   * d'un autre métier — soit parce qu'aucun n'est instruit pour cette activité
   * et que la page de choix a proposé « le secteur le plus proche », soit
   * parce que le dirigeant a changé de secteur depuis la recommandation. Les
   * deux appellent une phrase différente, d'où `referentielDuNaf` : le
   * confondre faisait affirmer « aucun référentiel n'est instruit pour votre
   * activité » à une boulangerie dont le référentiel commerce existe.
   *
   * Aucune heuristique : des données déclarées comparées.
   */
  correspondance: CorrespondanceSecteur;
};

/**
 * Ce que `equipements/hors-referentiel.ts` a déjà compté.
 *
 * Le décompte vient de `compterSansObligation`, qui exclut délibérément les
 * obligations permanentes : là, des règles s'appliquent bel et bien, elles
 * n'ont simplement pas de date. Les recompter ici annulerait ce travail — d'où
 * un seul nombre en entrée, et pas la Map des motifs.
 */
export type FaitEquipements = {
  /** Appareils du parc en service pour lesquels aucune obligation ne
   *  s'applique. */
  nbSansObligation: number;
  /** Taille du parc en service, pour situer le nombre sans en faire un taux. */
  nbEquipements: number;
};

/**
 * Ce que le repli de `matching/engine.ts` écarte faute du public reçu.
 *
 * `suspendues` est **calculé**, jamais écrit : `obligationsSuspenduesAuPublicRecu`
 * rejoue le verdict du moteur avec et sans le chiffre manquant, et ne rend que
 * les obligations dont la présence dépend réellement de lui. Le seuil vient de
 * l'obligation elle-même — aucun nombre n'est déclaré ici, sans quoi cet axe
 * serait la troisième déclaration que l'en-tête de ce module interdit.
 */
export type FaitPublicRecu = {
  /**
   * L'effectif salarié, c'est-à-dire ce que le moteur a retenu à la place du
   * chiffre manquant. Il n'est pas là pour décider — il est là pour que la
   * phrase dise au dirigeant sur quoi son calendrier a été calculé.
   */
  effectifRetenu: number;
  /** Ce que ce dossier verrait si le chiffre manquant atteignait leur seuil. */
  suspendues: readonly { libelle: string; seuil: number }[];
};

/**
 * L'effectif du dossier, et la taille que la porte de création accepte.
 *
 * Les DEUX sont des faits reçus, et le second en particulier. Le seuil vit
 * dans `etablissements/schema.ts` (`EFFECTIF_MAX`), qui le fait respecter à
 * la création ; le réécrire ici en ferait une seconde déclaration de ce que
 * le produit sait servir — et deux constantes dans deux modules ne peuvent
 * même pas se contredire par un test, elles divergent en silence. Il vient
 * donc de `faits.ts`, qui a le droit d'importer du code au runtime là où ce
 * module ne l'a pas.
 */
export type FaitEffectif = {
  /** L'effectif salarié déclaré sur le site. */
  surSite: number;
  /** Au-delà duquel la création d'un dossier est refusée (ADR-031). */
  seuilServi: number;
};

export type FaitsCouverture = {
  regime: RegimeEtablissement;
  /** `null` quand le dossier n'a pas de DUERP : l'axe se tait alors, il ne
   *  conclut pas. Un DUERP absent est un autre sujet que mal couvert. */
  duerp: FaitDuerp | null;
  equipements: FaitEquipements;
  /** `null` quand les faits n'ont pas été collectés — écrans qui n'ont que le
   *  régime sous la main. L'axe se tait alors ; il ne conclut pas « renseigné ». */
  publicRecu: FaitPublicRecu | null;
  /** `null` quand l'effectif n'a pas été collecté. L'axe se tait alors ; il ne
   *  conclut pas « dans la cible ». */
  effectif: FaitEffectif | null;
};

/* ─── Les axes ────────────────────────────────────────────────────────── */

const LIBELLE_CATEGORIE: Record<CategorieErp, string> = {
  N1: "1ʳᵉ catégorie",
  N2: "2ᵉ catégorie",
  N3: "3ᵉ catégorie",
  N4: "4ᵉ catégorie",
  N5: "5ᵉ catégorie",
};

/**
 * L'habitation sans famille — indétermination, jamais un manque.
 *
 * La nuance compte : un manque dit « l'outil ne couvre pas », une
 * indétermination dit « il ne sait pas encore, et voici comment le lui
 * apprendre ». Ici le produit sert bien le régime ; il lui manque une donnée
 * que le dirigeant possède. Le moteur, lui, ne retire rien en attendant : il
 * retient les obligations et les marque « à confirmer » (cf.
 * `matching/engine.ts`, `evaluerHabitation`). Les deux moitiés de la même
 * honnêteté — on sert, et on dit sur quoi on sert large.
 */
function axeFamilleHabitation(
  regime: RegimeEtablissement,
  indeterminations: IndeterminationCouverture[],
): void {
  if (!regime.estHabitation) return;
  if (regime.familleHabitation !== null) return;
  indeterminations.push({
    axe: "famille_habitation",
    motif:
      "La famille de votre immeuble d'habitation n'est pas renseignée.",
    quoiFaire:
      "Elle figure au dossier de l'immeuble ; votre syndic ou votre bureau de contrôle vous la donne. Sans elle, les obligations propres à l'habitation vous sont toutes présentées, y compris celles qui ne visent peut-être pas votre immeuble : mieux vaut une ligne en trop, que vous pouvez écarter, qu'une ligne manquante que personne ne verrait.",
  });
}

function axeRegime(
  regime: RegimeEtablissement,
  manques: ManqueCouverture[],
  indeterminations: IndeterminationCouverture[],
): void {
  // L'IGH d'abord : il est hors périmètre quelle que soit la suite, et le
  // dire en second laisserait croire que la catégorie ERP suffit à trancher.
  if (regime.estIGH) {
    manques.push({
      axe: "igh",
      motif: "Cet établissement est déclaré immeuble de grande hauteur (IGH).",
      consequence:
        "Le règlement de sécurité des IGH impose un service de sécurité permanent et des vérifications que cet outil ne connaît pas. Ce que vous lisez ici ne couvre pas votre régime.",
    });
    return;
  }

  // Un établissement qui n'est pas ERP ne relève que du Code du travail, que
  // le référentiel couvre sans distinction de catégorie.
  if (!regime.estERP) return;

  if (regime.categorieErp === null) {
    indeterminations.push({
      axe: "categorie_erp",
      motif:
        "La catégorie de votre établissement recevant du public n'est pas renseignée.",
      quoiFaire:
        "Elle figure sur votre arrêté d'ouverture ou sur le procès-verbal de la commission de sécurité. C'est elle qui décide de ce que la réglementation vous impose — sans elle, votre calendrier et votre registre sont incomplets sans qu'on puisse vous dire de combien.",
    });
    return;
  }

  if (CATEGORIES_COUVERTES.includes(regime.categorieErp)) return;

  manques.push({
    axe: "categorie_erp",
    motif: `Cet établissement relève de la ${LIBELLE_CATEGORIE[regime.categorieErp]}.`,
    consequence:
      "Rojer est construit pour les ERP de 5ᵉ catégorie. Au-dessus, le règlement de sécurité applique en entier son livre II — moyens de secours, service de sécurité incendie, et des obligations propres à votre type d'activité — que cet outil ne connaît pas. Votre calendrier et votre registre sont donc incomplets, et le resteront.",
  });
}

/**
 * Projette l'état de couverture du DUERP (ADR-020) sur l'axe `secteur_duerp`.
 *
 * Le `switch` est exhaustif par construction : `EtatCouverture` est importé,
 * pas recopié, et le `never` final fait échouer la compilation le jour où
 * l'ADR-020 gagne un état. C'est la seule chose qui garantit que cet axe reste
 * une projection et ne dérive pas en seconde déclaration.
 *
 * Aucune phrase ici ne cite une activité : le détail est écrit dans le DUERP,
 * avec son `cequiManque` rédigé pour un tiers, et le recopier en produirait
 * une variante qui vieillirait à part.
 */
function axeDuerp(
  duerp: FaitDuerp | null,
  manques: ManqueCouverture[],
  indeterminations: IndeterminationCouverture[],
): void {
  if (duerp === null) return;

  const secteur = duerp.secteurNom;

  switch (duerp.etat) {
    case "secteur_inconnu": {
      // Trois situations sous un seul état de l'ADR-020, et une seule des
      // trois autorise à dire qu'aucun référentiel n'existe pour l'activité.
      //
      // La première version disait cette phrase dans les trois cas, sans
      // jamais regarder le code NAF. Or `duerps/actions.ts` crée le DUERP
      // SANS secteur puis redirige vers l'écran de choix : pendant tout cet
      // intervalle — et définitivement si le dirigeant abandonne — une
      // boulangerie en 47.24Z lisait sur son board et dans le PDF remis à un
      // tiers qu'aucun référentiel ne correspondait à son activité, pendant
      // que l'écran suivant lui recommandait Commerce de détail.
      const c = duerp.correspondance;

      const sansBase =
        "Le document unique a été ouvert sans base de risques types : aucune unité de travail, aucun risque et aucune mesure n'y sont pré-chargés. Le référentiel de conformité, lui, fonctionne normalement — il ne lit pas votre code d'activité.";

      const conseilNaf = (nom: string) =>
        ` Le référentiel « ${nom} » correspond à votre code d'activité : le retenir depuis le document unique chargera ses unités et ses risques types.`;

      // `diverge` sous `secteur_inconnu` : le document PORTE un identifiant de
      // secteur, mais plus aucun référentiel ne le résout. C'est le second cas
      // que l'ADR-020 nomme — « ou secteur retiré depuis ».
      //
      // Il mérite sa phrase, et surtout pas celle d'en dessous : une première
      // version tirait `referentielDuNaf` de `sans_secteur_retenu` OU de
      // `diverge` et écrivait dans les deux cas « n'a pas encore de référentiel
      // sectoriel » — l'inverse exact de ce que `diverge` établit, puisqu'un
      // identifiant y est présent. Le bandeau et le PDF sortaient alors deux
      // blocs qui se contredisaient à une ligne d'intervalle.
      if (c.statut === "diverge") {
        manques.push({
          axe: "secteur_duerp",
          motif:
            "Le référentiel sectoriel retenu par le document unique n'existe plus dans l'outil.",
          consequence:
            "Le document conserve ce qui y a été saisi, mais plus rien ne le rattache à un référentiel : les risques types de son secteur ne peuvent plus lui être proposés." +
            (c.referentielDuNaf ? conseilNaf(c.referentielDuNaf.nom) : ""),
        });
        return;
      }

      if (c.statut === "sans_naf") {
        manques.push({
          axe: "secteur_duerp",
          motif:
            "Le document unique n'a pas de référentiel sectoriel, et aucun code d'activité n'est renseigné.",
          consequence: `${sansBase} Sans code d'activité, on ne peut pas non plus vous dire quel référentiel conviendrait.`,
        });
        return;
      }

      // Reste `sans_secteur_retenu` — `correspond` est impossible ici, il
      // suppose un identifiant que le référentiel résout.
      const refDuNaf =
        c.statut === "sans_secteur_retenu" ? c.referentielDuNaf : null;

      if (refDuNaf) {
        manques.push({
          axe: "secteur_duerp",
          motif:
            "Le document unique n'a pas encore de référentiel sectoriel, alors que votre code d'activité en désigne un.",
          consequence: sansBase + conseilNaf(refDuNaf.nom),
        });
        return;
      }

      manques.push({
        axe: "secteur_duerp",
        motif:
          "Aucun référentiel sectoriel n'est instruit pour l'activité de cet établissement.",
        consequence: sansBase,
      });
      return;
    }

    case "secteur_non_instruit":
      manques.push({
        axe: "secteur_duerp",
        motif: secteur
          ? `Le référentiel « ${secteur} » ne dit pas quelles activités il laisse de côté.`
          : "Le référentiel retenu ne dit pas quelles activités il laisse de côté.",
        consequence:
          "Sa liste d'activités non couvertes n'a pas encore été instruite. Une liste vide n'affirme pas qu'un secteur couvre tout : elle affirme que personne n'a encore regardé.",
      });
      return;

    case "manques_identifies":
      manques.push({
        axe: "secteur_duerp",
        motif:
          duerp.nbActivitesDeclarees > 0
            ? `Le document unique nomme ${duerp.nbActivitesDeclarees} activité${duerp.nbActivitesDeclarees > 1 ? "s" : ""} ou unité${duerp.nbActivitesDeclarees > 1 ? "s" : ""} que son référentiel ne couvre pas.`
            : "Le document unique nomme au moins une unité de travail que son référentiel ne couvre pas.",
        consequence:
          "Ce que le document ne traite pas à leur sujet y est écrit, activité par activité, et s'imprime avec lui.",
      });
      return;

    case "reponses_incompletes":
      indeterminations.push({
        axe: "secteur_duerp",
        motif:
          "Des questions d'activité du document unique n'ont pas reçu de réponse.",
        quoiFaire:
          "Elles se répondent depuis la page « Activités » du document unique. Tant qu'elles restent ouvertes, on ne peut pas dire si le référentiel couvre ou non ce que vous exercez — un silence n'est pas un « non ».",
      });
      return;

    case "aucun_manque_identifie":
      return;
  }

  // Le garde d'exhaustivité, et il n'est pas décoratif : `EtatCouverture` est
  // importé de l'ADR-020, pas recopié. Le jour où elle gagne un état, la
  // compilation s'arrête ici et quelqu'un doit décider de la phrase — c'est
  // la seule chose qui empêche cet axe de dériver en seconde déclaration.
  // Surtout, aucun `default` : il rattraperait l'état nouveau en silence et
  // rendrait ce garde inutile.
  const jamais: never = duerp.etat;
  throw new Error(`État de couverture DUERP inconnu : ${String(jamais)}`);
}

/**
 * Le secteur retenu n'est pas celui du code NAF.
 *
 * Axe distinct des cinq états de l'ADR-020, et qui s'ajoute à eux : un DUERP
 * peut très bien n'avoir « aucun manque identifié » au sens de sa propre
 * liste d'activités, et reposer sur le référentiel d'un autre métier. Les
 * confondre ferait disparaître le second — c'est le cas que l'ouverture de la
 * porte d'onboarding (B1) rend courant, et il serait invisible sans cette
 * ligne.
 *
 * Deux phrases, parce qu'il y a deux situations et qu'une seule d'entre elles
 * autorise à dire qu'aucun référentiel n'existe pour l'activité. La première
 * version les confondait et affirmait, jusque dans le dossier remis à un
 * tiers, un fait que la comparaison n'établit pas.
 */
function axeSecteurParDefaut(
  duerp: FaitDuerp | null,
  manques: ManqueCouverture[],
): void {
  if (duerp === null || duerp.correspondance.statut !== "diverge") return;

  // `secteur_inconnu` a déjà tout dit : là, l'identifiant retenu ne résout
  // aucun référentiel, et « il ne correspond pas à votre code d'activité » est
  // vrai mais creux — le fait utile est qu'il n'existe plus. Deux messages
  // pour un fait, dont l'un tirerait le lecteur vers une comparaison qui n'a
  // plus d'objet.
  if (duerp.etat === "secteur_inconnu") return;

  const refDuNaf = duerp.correspondance.referentielDuNaf;
  const retenu = duerp.secteurNom
    ? `le référentiel « ${duerp.secteurNom} »`
    : "un référentiel";

  manques.push({
    axe: "secteur_duerp",
    motif: `Le document unique s'appuie sur ${retenu}, qui ne correspond pas à votre code d'activité.`,
    consequence: refDuNaf
      ? `Votre code d'activité désigne le référentiel « ${refDuNaf.nom} ». Les unités de travail et les risques pré-chargés dans ce document décrivent donc une autre activité que celle que vous avez déclarée — à relire un par un, et à compléter par ce qu'ils ne prévoient pas.`
      : "Aucun référentiel n'est instruit pour votre activité : celui-ci a été retenu comme le plus proche. Les unités de travail et les risques pré-chargés décrivent donc un autre métier que le vôtre — à relire un par un, et à compléter par ce qu'ils ne prévoient pas.",
  });
}

/**
 * Rappelle ce que `equipements/hors-referentiel.ts` a déjà établi, sans le
 * refaire : ce module-là garde ses trois motifs et ses trois phrases, appareil
 * par appareil, sur la page équipements. Ici on ne dit que le fait agrégé, et
 * on renvoie à la page où il se détaille.
 */
function axeEquipements(
  eq: FaitEquipements,
  manques: ManqueCouverture[],
): void {
  if (eq.nbSansObligation <= 0) return;

  const pluriel = eq.nbSansObligation > 1;
  manques.push({
    axe: "domaine_equipement",
    motif: `${eq.nbSansObligation} équipement${pluriel ? "s" : ""} de votre inventaire ne déclenche${pluriel ? "nt" : ""} aucune obligation du référentiel${
      eq.nbEquipements > 0 ? `, sur ${eq.nbEquipements} en service` : ""
    }.`,
    consequence:
      "Leur catégorie n'est citée par aucune règle que le référentiel porte, ou aucune ne s'applique compte tenu de la typologie de l'établissement. Cela ne veut pas dire qu'aucune vérification ne leur est due : le détail, appareil par appareil, se lit sur la page Équipements.",
  });
}

/**
 * Le public reçu n'est pas déclaré, et des obligations s'en trouvent écartées.
 *
 * Une **indétermination**, jamais un manque : le fait n'est pas que le
 * référentiel ignore quelque chose — il le sait très bien —, c'est que la
 * donnée qui décide n'a pas été donnée. La réponse appartient au dirigeant, et
 * `quoiFaire` nomme le geste. C'est exactement le cas que le type décrit :
 * « ne jamais traiter ce cas comme couvert ».
 *
 * L'axe se tait quand `suspendues` est vide, et ce vide couvre trois
 * situations, toutes sans doute à lever : le chiffre est déclaré ; l'effectif
 * salarié atteint déjà le seuil, si bien que le repli donne la même réponse ;
 * ou l'obligation tombe pour un motif que le public reçu ne changerait pas.
 * Le tri se fait dans `matching/public-recu.ts`, sur le verdict du moteur —
 * pas ici, sur une liste de cas.
 *
 * Chaque obligation porte son propre seuil dans la phrase. Deux obligations
 * partagent aujourd'hui le même (51), et une tournure unique se lirait mieux —
 * mais elle supposerait un seuil commun que rien ne garantit, et le jour où
 * elle serait fausse personne ne le verrait.
 */
function axePublicRecu(
  fait: FaitPublicRecu | null,
  indeterminations: IndeterminationCouverture[],
): void {
  if (fait === null || fait.suspendues.length === 0) return;

  const n = fait.suspendues.length;
  const liste = fait.suspendues
    .map((o) => `« ${o.libelle} » (à partir de ${o.seuil} personnes présentes)`)
    .join(", ");

  indeterminations.push({
    axe: "public_recu",
    motif:
      "Le nombre de personnes habituellement présentes dans cet établissement — salariés, clients, élèves, patients ou visiteurs réunis — n'est pas renseigné.",
    quoiFaire:
      `Faute de ce chiffre, le calcul a retenu vos ${fait.effectifRetenu} salariés. ` +
      `${n} obligation${n > 1 ? "s" : ""} ne figure${n > 1 ? "nt" : ""} donc ni à votre calendrier ni à votre registre de sécurité : ${liste}. ` +
      "Le nombre se renseigne sur la fiche de l'établissement ; il compte le public que vous recevez, pas seulement vos salariés.",
  });
}

/**
 * L'effectif dépasse ce que la porte de création accepte (ADR-031 § 1 bis).
 *
 * Un **manque**, jamais un refus : la borne d'effectif ne vaut qu'à la
 * création. Un client qui passe de quarante-cinq à soixante salariés reste
 * servi — lui fermer son dossier parce qu'il a embauché serait absurde. Mais
 * la promesse implicite doit rester explicite, et c'est ici qu'elle le
 * devient : « le même traitement d'honnêteté que les ERP de 1ʳᵉ à 4ᵉ
 * catégorie », dit l'ADR, et c'est le même axe qui le porte.
 *
 * Sans cette ligne, le dossier au-dessus du seuil ne lisait rien de son
 * dépassement, et la page des éléments exclus lui aurait présenté « plus de
 * cinquante travailleurs » sous les refus à l'entrée — un cas qui n'est pas le
 * sien, puisque son dossier existe.
 *
 * Aucun seuil écrit ici : `seuilServi` est reçu. Voir `FaitEffectif`.
 */
function axeEffectif(
  fait: FaitEffectif | null,
  manques: ManqueCouverture[],
): void {
  if (fait === null || fait.surSite <= fait.seuilServi) return;

  manques.push({
    axe: "effectif",
    motif: `Cet établissement déclare ${fait.surSite} salariés, au-delà des ${fait.seuilServi} pour lesquels Rojer est construit.`,
    consequence:
      "Au-delà de cinquante salariés, des obligations que cet outil ne porte pas s'ajoutent — le programme annuel de prévention des risques et le règlement intérieur, notamment. Votre dossier reste ouvert et ce qu'il contient reste juste ; il est incomplet sur ce qui vient avec la taille, et le restera.",
  });
}

/* ─── L'entrée ────────────────────────────────────────────────────────── */

/**
 * Rend tout ce que l'outil ne sait pas dire de ce dossier, axe par axe.
 *
 * Fonction pure : aucun accès base, aucune lecture d'horloge, aucun effet de
 * bord. Les faits lui sont donnés — `faits.ts` les collecte.
 *
 * L'ordre des manques est stable et voulu : le régime d'abord, parce qu'il
 * peut mettre tout le reste hors de portée ; puis ce qui est propre à ce
 * dossier (DUERP, parc) ; puis ce qui est vrai du produit entier.
 */
export function couvertureDeLEtablissement(
  faits: FaitsCouverture,
): CouvertureEtablissement {
  const manques: ManqueCouverture[] = [];
  const indeterminations: IndeterminationCouverture[] = [];

  axeRegime(faits.regime, manques, indeterminations);
  // Juste après le régime, et pour la même raison : la taille de la structure
  // qualifie tout le reste de ce que le dossier contient.
  axeEffectif(faits.effectif, manques);
  axeDuerp(faits.duerp, manques, indeterminations);
  axeSecteurParDefaut(faits.duerp, manques);
  axeFamilleHabitation(faits.regime, indeterminations);
  axeEquipements(faits.equipements, manques);
  axePublicRecu(faits.publicRecu, indeterminations);

  return { manques, indeterminations };
}

/**
 * Le seul axe du régime, pour les écrans qui n'ont que l'établissement sous la
 * main et pas encore le reste des faits.
 *
 * ⚠ Ce n'est pas une seconde API de couverture : c'est le même axe, appelé
 * seul. Un écran qui s'en contente affiche moins que la vérité — préférer
 * `couvertureDeLEtablissement` partout où les faits sont collectables.
 */
export function couvertureDuRegime(
  regime: RegimeEtablissement,
): CouvertureEtablissement {
  return couvertureDeLEtablissement({
    regime,
    duerp: null,
    equipements: { nbSansObligation: 0, nbEquipements: 0 },
    publicRecu: null,
    effectif: null,
  });
}
