import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppTopbar } from "@/components/layout/AppTopbar";
import {
  OnboardingChecklist,
  type EtapeOnboarding,
} from "@/components/layout/OnboardingChecklist";
import { DashboardGrid } from "@/components/dashboard/widgets/DashboardGrid";
import { BlocBrief } from "@/components/dashboard/widgets/impl/board";
import type { DashboardBundle } from "@/components/dashboard/widgets/types";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import {
  compterObligationsParMois,
  compterVerifsParEquipement,
  getDashboardData,
  listerEvenementsFenetre,
} from "@/lib/dashboard/queries";
import { JOURS_APRES } from "@/lib/dashboard/frise";
import { statsActionsEnRetard } from "@/lib/actions/queries";
import { getOptionalUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/prisma";
import { countAlertesVigilance } from "@/lib/prestataires/queries";

export default async function EtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const [
    equipements,
    statsEquipements,
    dashboard,
    barsData,
    evenementsHorizon,
    evenementsSemaine,
    evenementsMois,
    statsRetardActions,
    nbVerifs,
    nbRapports,
    prochainesVerifs,
    actionsEnCours,
    rapportsRecents,
    user,
    prestatairesAlertes,
  ] = await Promise.all([
    listerEquipementsDeLEtablissement(id),
    compterVerifsParEquipement(id),
    getDashboardData(id),
    compterObligationsParMois(id),
    // 730 j : la frise défile jusqu'à 24 mois et propose une vue
    // calendrier sur la même donnée — une seule requête pour les deux
    // vues, qui coupent côté client.
    listerEvenementsFenetre(id, JOURS_APRES),
    listerEvenementsFenetre(id, 7),
    listerEvenementsFenetre(id, 30),
    statsActionsEnRetard(id),
    prisma.verification.count({ where: { etablissementId: id } }),
    prisma.rapportVerification.count({ where: { etablissementId: id } }),
    prisma.verification.findMany({
      where: {
        etablissementId: id,
        statut: { in: ["a_planifier", "planifiee", "depassee"] },
      },
      include: { equipement: true },
      orderBy: { datePrevue: "asc" },
      take: 5,
    }),
    prisma.action.findMany({
      where: {
        etablissementId: id,
        statut: { in: ["ouverte", "en_cours"] },
      },
      orderBy: [{ echeance: "asc" }, { criticite: "desc" }],
      take: 3,
    }),
    prisma.rapportVerification.findMany({
      where: { etablissementId: id },
      include: { verification: true },
      orderBy: { dateRapport: "desc" },
      take: 4,
    }),
    getOptionalUser(),
    countAlertesVigilance(id),
  ]);

  // Checklist onboarding : uniquement les étapes actionnables par l'user.
  const etapesOnboarding: EtapeOnboarding[] = [
    {
      id: "etablissement",
      titre: "Décrire votre établissement",
      pourquoi:
        "Adresse, effectif sur site et régimes (ERP, IGH, travail). Ces informations conditionnent les obligations qui vous sont applicables.",
      faite: true,
    },
    {
      id: "equipements",
      titre: "Déclarer vos équipements",
      pourquoi:
        "Installation électrique, extincteurs, hotte, ascenseur… Ce sont eux qui déclenchent les vérifications périodiques à faire.",
      faite: equipements.length > 0,
      href: `/etablissements/${id}/equipements`,
      cta: equipements.length === 0 ? "Commencer la déclaration" : undefined,
    },
    {
      id: "calendrier",
      titre: "Consulter votre calendrier de vérifications",
      pourquoi:
        "Dès que vos équipements sont déclarés, l'outil calcule tout seul les dates des prochaines vérifications obligatoires.",
      faite: nbVerifs > 0,
      href: `/etablissements/${id}/calendrier`,
      cta: nbVerifs === 0 ? "Ouvrir le calendrier" : undefined,
    },
  ];
  const onboardingFini = etapesOnboarding.every((e) => e.faite);

  const duerpDernier = etab.duerps[0] ?? null;
  const jourDernierRapport = rapportsRecents[0]
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - rapportsRecents[0].dateRapport.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  // Date de référence unique, figée côté serveur : tous les blocs qui
  // calculent un « dans N jours » partent de la même valeur, ce qui évite
  // les écarts d'hydratation et rend les rendus reproductibles.
  const aujourdhui = new Date();

  // Le bundle sérialise les champs nécessaires aux widgets. Date
  // objects traversent la frontière server/client via l'App Router.
  const bundle: DashboardBundle = {
    etablissementId: id,
    etablissement: {
      id: etab.id,
      raisonDisplay: etab.raisonDisplay,
      entrepriseId: etab.entrepriseId,
      adresse: etab.adresse,
      effectifSurSite: etab.effectifSurSite,
      codeNaf: etab.codeNaf,
      estEtablissementTravail: etab.estEtablissementTravail,
      estERP: etab.estERP,
      estIGH: etab.estIGH,
      estHabitation: etab.estHabitation,
      typeErp: etab.typeErp,
      categorieErp: etab.categorieErp,
      classeIgh: etab.classeIgh,
      entreprise: {
        raisonSociale: etab.entreprise.raisonSociale,
        siret: etab.entreprise.siret,
        codeNaf: etab.entreprise.codeNaf,
      },
    },
    dashboard,
    equipements: equipements.map((e) => ({
      id: e.id,
      libelle: e.libelle,
      categorie: e.categorie,
      stats: statsEquipements.get(e.id),
    })),
    barsData,
    aujourdhui,
    evenementsHorizon,
    evenementsSemaine,
    evenementsMois,
    statsRetardActions,
    prochainesVerifs: prochainesVerifs.map((v) => ({
      id: v.id,
      libelleObligation: v.libelleObligation,
      datePrevue: v.datePrevue,
      statut: v.statut,
      equipement: { libelle: v.equipement.libelle },
    })),
    actionsEnCours: actionsEnCours.map((a) => ({
      id: a.id,
      libelle: a.libelle,
      statut: a.statut,
      echeance: a.echeance,
    })),
    rapportsRecents: rapportsRecents.map((r) => ({
      id: r.id,
      verificationId: r.verificationId,
      dateRapport: r.dateRapport,
      resultat: r.resultat,
      verification: { libelleObligation: r.verification.libelleObligation },
    })),
    nbVerifs,
    nbRapports,
    duerpDernier: duerpDernier
      ? {
          id: duerpDernier.id,
          versions: duerpDernier.versions.map((v) => ({
            numero: v.numero,
            createdAt: v.createdAt,
          })),
        }
      : null,
    jourDernierRapport,
    moisCourant: new Date().getMonth(),
  };

  return (
    <>
      <AppTopbar
        title="Tableau de bord"
        actions={
          <Link
            href={`/etablissements/${id}/controle`}
            className={buttonVariants({ size: "sm" })}
          >
            Préparer un contrôle →
          </Link>
        }
      />

      {/* Le brief est une section à part entière : bandeau blanc pleine
          largeur, sans rayon, hors du canvas bleu. Le laisser à
          l'intérieur du bleu le faisait ressembler à un bloc posé dessus,
          avec du canvas visible autour. */}
      <BlocBrief bundle={bundle} />

      {/* Canvas bleu du board — `flex-1` pour qu'il descende jusqu'au bas
          du conteneur de défilement, même quand les widgets sont courts.
          Le reste de l'app garde la palette « papier ». */}
      <div className="flex flex-1 flex-col bg-[color:var(--board-canvas)] pb-10">
        {!onboardingFini ? (
          <div className="p-[var(--board-gutter)] pb-0">
            <OnboardingChecklist
              etapes={etapesOnboarding}
              etablissementRaison={etab.raisonDisplay}
            />
          </div>
        ) : null}

        <DashboardGrid bundle={bundle} />

        <footer className="flex flex-wrap items-center justify-between gap-6 px-[calc(var(--board-gutter)+4px)] pt-2 text-[11.5px] text-[color:var(--board-blue-ink)]">
          <p className="m-0 max-w-[640px] leading-[1.55]">
            Outil d&apos;aide à la rédaction structuré sur les publications
            INRS / OiRA. La responsabilité de l&apos;évaluation des risques
            reste celle de l&apos;employeur.
          </p>
          <span className="font-mono uppercase tracking-[0.14em]">
            v2 · modèle données
          </span>
        </footer>
      </div>
    </>
  );
}
