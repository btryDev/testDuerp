import { notFound } from "next/navigation";
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
  getModulesMatrice,
  listerEvenementsFenetre,
} from "@/lib/dashboard/queries";
import { JOURS_APRES } from "@/lib/dashboard/frise";
import { statsActionsEnRetard } from "@/lib/actions/queries";
import { prisma } from "@/lib/prisma";

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
    modulesMatrice,
    nbVerifs,
    nbRapports,
    prochainesVerifs,
    rapportsRecents,
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
    getModulesMatrice(id, etab.estERP),
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
    prisma.rapportVerification.findMany({
      where: { etablissementId: id },
      include: { verification: true },
      orderBy: { dateRapport: "desc" },
      take: 4,
    }),
  ]);

  const duerpDernier = etab.duerps[0] ?? null;
  // Fait observable fiable : le secteur a été choisi par l'utilisateur.
  // L'existence seule d'un Duerp ne prouve rien (créations silencieuses
  // historiques par les pages relais).
  const duerpOuvert = duerpDernier?.referentielSecteurId != null;

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
    {
      id: "duerp",
      titre: "Ouvrir votre DUERP",
      pourquoi:
        "Le document unique d'évaluation des risques est obligatoire dès le premier salarié (art. R. 4121-1 du Code du travail). L'outil vous guide : secteur d'activité, puis unités de travail.",
      faite: duerpOuvert,
      href: `/etablissements/${id}/duerp`,
      cta: !duerpOuvert ? "Ouvrir le DUERP" : undefined,
    },
  ];
  const onboardingFini = etapesOnboarding.every((e) => e.faite);

  // Date de référence unique, figée côté serveur : tous les blocs qui
  // calculent un « dans N jours » partent de la même valeur, ce qui évite
  // les écarts d'hydratation et rend les rendus reproductibles.
  const aujourdhui = new Date();

  const jourDernierRapport = rapportsRecents[0]
    ? Math.max(
        0,
        Math.floor(
          (aujourdhui.getTime() - rapportsRecents[0].dateRapport.getTime()) /
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
    aujourdhui,
    evenementsHorizon,
    evenementsSemaine,
    evenementsMois,
    statsRetardActions,
    modulesMatrice,
    prochainesVerifs: prochainesVerifs.map((v) => ({
      id: v.id,
      libelleObligation: v.libelleObligation,
      datePrevue: v.datePrevue,
      statut: v.statut,
      equipement: { libelle: v.equipement.libelle },
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
    moisCourant: aujourdhui.getMonth(),
  };

  return (
    <>
      {/* Le brief est une section à part entière : panneau bleu ciel à
          grand rayon posé dans la gouttière — la seule grande surface
          colorée de la page — qui annonce la file de travail du jour. */}
      <BlocBrief bundle={bundle} />

      {/* Canvas quasi blanc du board — `flex-1` pour qu'il descende
          jusqu'au bas du conteneur de défilement, même quand les widgets
          sont courts. Les cartes s'en détachent par filet et ombre douce
          (bento), pas par l'aplat. Le reste de l'app garde la palette
          « papier ». */}
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
