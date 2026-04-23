import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
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

function regimes(etab: {
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
  typeErp: string | null;
  categorieErp: string | null;
  classeIgh: string | null;
}): string[] {
  const out: string[] = [];
  if (etab.estEtablissementTravail) out.push("Établissement de travail");
  if (etab.estERP)
    out.push(
      `ERP ${etab.typeErp ?? ""}${
        etab.categorieErp ? ` · cat. ${etab.categorieErp.slice(1)}` : ""
      }`.trim(),
    );
  if (etab.estIGH) out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
  if (etab.estHabitation) out.push("Habitation");
  return out;
}

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

  const regs = regimes(etab);

  // Le bundle sérialise les champs nécessaires aux widgets. Date
  // objects traversent la frontière server/client via l'App Router.
  const bundle: DashboardBundle = {
    etablissementId: id,
    etablissement: {
      id: etab.id,
      raisonDisplay: etab.raisonDisplay,
      entrepriseId: etab.entrepriseId,
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
      <AppSidebar
        etablissement={etab}
        active="tableau"
        counts={{
          equipements: equipements.length,
          verificationsEnRetard: dashboard.compteurs.verifsEnRetard,
          actions:
            dashboard.compteurs.actionsOuvertes +
            dashboard.compteurs.actionsEnCours,
        }}
        user={user}
      />

      <div className="flex min-w-0 flex-col">
        <AppTopbar
          title="Tableau de bord"
          kicker={`Établissements / ${etab.raisonDisplay.split(" ")[0]}…`}
          statut={{ label: "Actif", tone: "ok" }}
          subtitleSegments={[
            etab.raisonDisplay,
            etab.adresse,
            ...regs.map((r) => ({ pill: r })),
          ]}
          actions={
            <>
              <Link
                href={`/etablissements/${id}/modifier`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Fiche établissement
              </Link>
              <Link
                href={`/api/etablissements/${id}/dossier-conformite/pdf`}
                className={buttonVariants({ size: "sm" })}
              >
                Dossier PDF ↓
              </Link>
            </>
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
      </div>
    </div>
  );
}
