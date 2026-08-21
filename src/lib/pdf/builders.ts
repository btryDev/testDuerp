import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { compterActions, listerActions, origineDeLAction } from "@/lib/actions/queries";
import { listerVerifications, type VerificationListee } from "@/lib/calendrier/queries";
import { listerRapportsDeLEtablissement } from "@/lib/rapports/queries";
import { obligationParId } from "@/lib/referentiels/conformite";
import { calculerScoreDepuisEtat } from "@/lib/dashboard/score";
import { evaluerEtatDuerp } from "@/lib/dashboard/duerp";
import { repartirVerifications } from "./etat-verifications";
import type { LignePlanActions, PlanActionsData } from "./PlanActionsDocument";
import type { LigneRapport, LigneVerif, RegistreData } from "./RegistreDocument";
import type { DossierData } from "./DossierConformiteDocument";

/**
 * Builders qui lisent la DB et construisent les données sérialisables
 * à fournir aux composants PDF. Pas de renduHTML ici — uniquement du
 * shaping de données. Cela permet de tester les builders sans rendre
 * de PDF et de garder les composants PDF purs.
 *
 * Deux règles valent pour tout ce fichier :
 *
 *  1. **Rien n'est lu hors du périmètre du user connecté.** Les listes
 *     passent par des queries déjà scopées (`listerActions`,
 *     `listerVerifications`, `listerRapportsDeLEtablissement`) ; les lectures
 *     directes d'établissement passent par `chargerEtablissementDuUser`
 *     ci-dessous. Un `findUnique` sur l'identifiant seul produisait un
 *     document hybride — en-tête d'un tiers, tableaux vides — donc à la fois
 *     une fuite de données et un document faux.
 *
 *  2. **Aucune règle de retard n'est réécrite ici.** Les prédicats viennent
 *     de `@/lib/dates/retard` (ADR-011), qui est la source de vérité unique
 *     du produit. Un dossier remis à un inspecteur ne peut pas afficher un
 *     compteur différent de celui que l'écran montre à la même seconde.
 */

/**
 * Charge un établissement (et son entreprise) en le bornant au user
 * connecté. Retourne `null` aussi bien pour un établissement inexistant que
 * pour celui d'un tiers : l'appelant ne doit pas pouvoir les distinguer.
 */
async function chargerEtablissementDuUser(etablissementId: string) {
  const user = await requireUser();
  return prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    include: { entreprise: true, _count: { select: { batiments: true } } },
  });
}

function regimesTexte(etab: {
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: string | null;
  categorieErp: string | null;
  classeIgh: string | null;
}): string {
  const out: string[] = [];
  if (etab.estEtablissementTravail) out.push("Établissement de travail");
  if (etab.estERP) {
    let lib = "ERP";
    if (etab.typeErp) lib += ` type ${etab.typeErp}`;
    if (etab.categorieErp) lib += ` cat. ${etab.categorieErp.slice(1)}`;
    out.push(lib);
  }
  if (etab.estIGH) out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) out.push("Habitation");
  return out.join(", ");
}

function contexteAction(a: {
  risque: {
    libelle: string;
    unite: { nom: string };
  } | null;
  verification: {
    libelleObligation: string;
    equipement: { libelle: string };
  } | null;
}): string {
  if (a.risque) {
    return `DUERP — ${a.risque.unite.nom} · ${a.risque.libelle}`;
  }
  if (a.verification) {
    return `Vérification — ${a.verification.equipement.libelle}`;
  }
  return "Libre";
}

/**
 * Le nom d'un équipement tel qu'il s'imprime : précédé de son bâtiment dès
 * que l'établissement en compte plusieurs (ADR-019). Un inspecteur qui lit
 * « Tableau électrique » doit savoir lequel ; en mono-bâtiment, le préfixe
 * ne dirait rien.
 */
function libelleEquipementSitue(
  eq: { libelle: string; batiment: { nom: string } },
  multiBatiments: boolean,
): string {
  return multiBatiments ? `${eq.batiment.nom} — ${eq.libelle}` : eq.libelle;
}

/** Projection d'une vérification vers la ligne imprimée. Partagée par le
 *  registre et le dossier de conformité pour que la même occurrence s'y
 *  affiche à l'identique. */
function ligneVerif(v: VerificationListee, multiBatiments: boolean): LigneVerif {
  return {
    id: v.id,
    libelleObligation: v.libelleObligation,
    equipementLibelle: libelleEquipementSitue(v.equipement, multiBatiments),
    datePrevue: v.datePrevue,
    statut: v.statut,
    domaine: obligationParId(v.obligationId)?.domaine ?? null,
  };
}

export async function construirePlanActionsData(
  etablissementId: string,
): Promise<PlanActionsData | null> {
  const etab = await chargerEtablissementDuUser(etablissementId);
  if (!etab) return null;

  // Le PDF Plan d'actions documente ce qui reste à faire à la date
  // d'édition (cf. mentions légales : « actions correctives en cours »).
  // On exclut donc les levées/abandons de la table — les compteurs de
  // levées restent exposés dans la synthèse pour donner de la visibilité.
  const [actions, compteurs] = await Promise.all([
    listerActions(etablissementId, { enCoursSeulement: true }),
    compterActions(etablissementId),
  ]);

  const lignes: LignePlanActions[] = actions.map((a) => ({
    id: a.id,
    libelle: a.libelle,
    description: a.description,
    type: a.type,
    statut: a.statut,
    criticite: a.criticite,
    echeance: a.echeance,
    responsable: a.responsable,
    origine: origineDeLAction(a),
    contexte: contexteAction(a),
    leveeLe: a.leveeLe,
    leveeCommentaire: a.leveeCommentaire,
  }));

  return {
    entreprise: etab.entreprise.raisonSociale,
    etablissement: etab.raisonDisplay,
    adresse: etab.adresse,
    genereLe: new Date(),
    totalOuvertes: compteurs.ouvertes,
    totalEnCours: compteurs.enCours,
    totalLevees: compteurs.leveesRecemment,
    actions: lignes,
  };
}

export async function construireRegistreData(
  etablissementId: string,
): Promise<RegistreData | null> {
  const etab = await chargerEtablissementDuUser(etablissementId);
  if (!etab) return null;
  const multiBatiments = etab._count.batiments > 1;

  const [rapports, verifs] = await Promise.all([
    listerRapportsDeLEtablissement(etablissementId),
    listerVerifications(etablissementId),
  ]);

  const lignesRapports: LigneRapport[] = rapports.map((r) => ({
    id: r.id,
    dateRapport: r.dateRapport,
    resultat: r.resultat,
    organismeVerif: r.organismeVerif,
    libelleObligation: r.verification.libelleObligation,
    equipementLibelle: libelleEquipementSitue(
      r.verification.equipement,
      multiBatiments,
    ),
    domaine: obligationParId(r.verification.obligationId)?.domaine ?? null,
    fichierNomOriginal: r.fichierNomOriginal,
    commentaires: r.commentaires,
  }));

  // « En attente » = tout ce qui n'a pas encore de rapport, quelle que soit
  // la date : c'est le pendant documentaire des rapports listés au-dessus.
  const verifsEnAttente: LigneVerif[] = verifs
    .filter((v) =>
      ["a_planifier", "planifiee", "depassee"].includes(v.statut),
    )
    .map((v) => ligneVerif(v, multiBatiments));

  return {
    entreprise: etab.entreprise.raisonSociale,
    etablissement: etab.raisonDisplay,
    adresse: etab.adresse,
    genereLe: new Date(),
    rapports: lignesRapports,
    verifsEnAttente,
  };
}

export async function construireDossierConformiteData(
  etablissementId: string,
): Promise<DossierData | null> {
  const user = await requireUser();
  const etab = await prisma.etablissement.findFirst({
    where: { id: etablissementId, entreprise: { userId: user.id } },
    include: {
      entreprise: true,
      _count: { select: { batiments: true } },
      duerps: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          versions: { orderBy: { numero: "desc" }, take: 1 },
          unites: { include: { risques: true } },
        },
      },
    },
  });
  if (!etab) return null;
  const multiBatiments = etab._count.batiments > 1;

  // Les vérifications et les rapports sont lus **une seule fois** : les
  // compteurs de la synthèse et les listes détaillées en dessous doivent
  // décrire le même ensemble. Avant, le compteur venait d'un agrégat SQL et
  // la liste d'un filtre TypeScript portant sur d'autres statuts — le PDF
  // annonçait « 5 vérifications en retard » puis en détaillait 3.
  const [compteursActions, plan, rapports, verifs] = await Promise.all([
    compterActions(etablissementId),
    construirePlanActionsData(etablissementId),
    listerRapportsDeLEtablissement(etablissementId),
    listerVerifications(etablissementId),
  ]);

  const now = new Date();
  const etatVerifs = repartirVerifications(verifs, now);

  const duerp = etab.duerps[0] ?? null;
  const derniereVersion = duerp?.versions[0] ?? null;
  // Le score passe par **la même** entrée que le tableau de bord. L'entrée
  // historique, qui ne recevait qu'un âge en jours, ignorait deux choses que
  // `evaluerEtatDuerp` sait : le seuil d'effectif de la mise à jour annuelle
  // (art. R. 4121-2) et le cas « DUERP ouvert, aucune version validée ». Deux
  // dossiers sortaient donc notés différemment à l'écran et dans le document
  // remis à l'inspecteur, à la même seconde.
  const etatDuerp = evaluerEtatDuerp(
    {
      ouvert: duerp !== null,
      dateDerniereVersion: derniereVersion?.createdAt ?? null,
      effectif: etab.entreprise.effectif,
    },
    now,
  );

  const score = calculerScoreDepuisEtat({
    // Dénominateur = tous les engagements de la période. `aPlanifier` en
    // fait partie : l'omettre rétrécissait le dénominateur et faisait
    // sortir un score inférieur à celui du tableau de bord, au même
    // instant, dans le document remis à l'inspecteur.
    verifs: {
      total: etatVerifs.total,
      enRetard: etatVerifs.enRetard.length,
    },
    actions: {
      ouvertesTotal: compteursActions.totalACouvrir,
      enRetard: compteursActions.enRetard,
    },
    duerp: etatDuerp.ouvert ? etatDuerp : null,
  });

  const criticiteMax =
    duerp?.unites
      .flatMap((u) => u.risques)
      .reduce<number | null>(
        (max, r) => (max === null || r.criticite > max ? r.criticite : max),
        null,
      ) ?? null;

  const rapportsRecents: LigneRapport[] = rapports.slice(0, 10).map((r) => ({
    id: r.id,
    dateRapport: r.dateRapport,
    resultat: r.resultat,
    organismeVerif: r.organismeVerif,
    libelleObligation: r.verification.libelleObligation,
    equipementLibelle: libelleEquipementSitue(
      r.verification.equipement,
      multiBatiments,
    ),
    domaine: obligationParId(r.verification.obligationId)?.domaine ?? null,
    fichierNomOriginal: r.fichierNomOriginal,
    commentaires: r.commentaires,
  }));

  return {
    entreprise: etab.entreprise.raisonSociale,
    siret: etab.entreprise.siret,
    etablissement: etab.raisonDisplay,
    adresse: etab.adresse,
    effectifSurSite: etab.effectifSurSite,
    codeNaf: etab.codeNaf ?? etab.entreprise.codeNaf,
    regimesTexte: regimesTexte(etab),
    genereLe: now,
    score,
    duerp:
      duerp === null
        ? null
        : {
            duerpId: duerp.id,
            numeroDerniereVersion: derniereVersion?.numero ?? null,
            dateDerniereVersion: derniereVersion?.createdAt ?? null,
            nombreUnites: duerp.unites.length,
            nombreRisques: duerp.unites.reduce(
              (n, u) => n + u.risques.length,
              0,
            ),
            criticiteMax,
          },
    compteurs: {
      verifsEnRetard: etatVerifs.enRetard.length,
      verifsPlanifiees: etatVerifs.aVenir.length,
      verifsRealisees12m: etatVerifs.realisees12m.length,
      actionsOuvertes: compteursActions.ouvertes + compteursActions.enCours,
      actionsEnRetard: compteursActions.enRetard,
    },
    rapportsRecents,
    // Exactement les occurrences comptées juste au-dessus, projetées en
    // lignes de tableau : le nombre annoncé et le détail imprimé ne peuvent
    // plus diverger.
    verifsEnRetard: etatVerifs.enRetard.map((v) => ligneVerif(v, multiBatiments)),
    actionsEnCours:
      plan?.actions.filter(
        (a) => a.statut === "ouverte" || a.statut === "en_cours",
      ) ?? [],
  };
}
