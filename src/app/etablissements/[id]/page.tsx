import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppTopbar } from "@/components/layout/AppTopbar";
import {
  OnboardingChecklist,
  type EtapeOnboarding,
} from "@/components/layout/OnboardingChecklist";
import { DashboardGrid } from "@/components/dashboard/widgets/DashboardGrid";
import type { DashboardBundle } from "@/components/dashboard/widgets/types";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import {
  compterObligationsParMois,
  compterVerifsParEquipement,
  getDashboardData,
  listerEvenementsFenetre,
  listerEvenementsParMois,
} from "@/lib/dashboard/queries";
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
    evenementsAnnee,
    evenementsSemaine,
    evenementsMois,
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
    listerEvenementsParMois(id),
    listerEvenementsFenetre(id, 7),
    listerEvenementsFenetre(id, 30),
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
    evenementsAnnee,
    evenementsSemaine,
    evenementsMois,
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

      <div className="flex flex-col gap-5 px-8 py-6 pb-12">
        {!onboardingFini ? (
          <OnboardingChecklist
            etapes={etapesOnboarding}
            etablissementRaison={etab.raisonDisplay}
          />
        ) : null}

        <DashboardGrid bundle={bundle} />

        <hr aria-hidden className="filet-pointille mt-2" />
        <footer className="flex flex-wrap items-center justify-between gap-6 text-[11.5px] text-muted-foreground">
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
