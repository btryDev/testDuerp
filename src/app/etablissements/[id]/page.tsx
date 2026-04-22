import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CreerDuerpButton } from "@/components/duerps/CreerDuerpButton";
import { SupprimerEtablissementButton } from "@/components/etablissements/SupprimerEtablissementButton";
import { ScoreConformite } from "@/components/dashboard/ScoreConformite";
import { PanneauRecommandations } from "@/components/dashboard/PanneauRecommandations";
import {
  OnboardingChecklist,
  type EtapeOnboarding,
} from "@/components/layout/OnboardingChecklist";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { getDashboardData } from "@/lib/dashboard/queries";
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

type IndiceTone = "neutral" | "alert" | "warn" | "ok";

/**
 * Tuile d'un module / outil (calendrier, registre, plan d'actions, DUERP…).
 * Même rendu visuel pour tous les outils afin de matérialiser la « boîte à
 * outils » : titre, description, métrique clé, indice contextuel si besoin.
 */
function Outil({
  numero,
  titre,
  description,
  metrique,
  indice,
  href,
  cta,
  children,
}: {
  numero: string;
  titre: string;
  description: string;
  metrique?: { valeur: string | number; libelle: string };
  indice?: { libelle: string; tone: IndiceTone };
  href?: string;
  cta?: string;
  children?: React.ReactNode;
}) {
  const indiceClass: Record<IndiceTone, string> = {
    neutral: "border-rule bg-paper-sunk/70 text-muted-foreground",
    alert: "border-rose-300 bg-rose-50 text-rose-900",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
    ok: "border-emerald-300 bg-emerald-50 text-emerald-900",
  };

  const corps = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="numero-section text-[0.72rem]">{numero}</span>
        {href && (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground transition group-hover:text-ink">
            {cta ?? "Ouvrir"} →
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-[1.02rem] font-semibold tracking-[-0.012em]">
          {titre}
        </h3>
        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-rule/50 pt-4">
        {metrique ? (
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
              {metrique.libelle}
            </p>
            <p className="mt-0.5 text-[1.4rem] font-semibold leading-none tabular-nums">
              {metrique.valeur}
            </p>
          </div>
        ) : (
          <div className="text-[0.78rem] text-muted-foreground">{children}</div>
        )}
        {indice && (
          <span
            className={
              "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] " +
              indiceClass[indice.tone]
            }
          >
            {indice.libelle}
          </span>
        )}
      </div>
    </>
  );

  const classes =
    "group flex h-full flex-col rounded-[calc(var(--radius)*1.4)] bg-paper-elevated p-6 shadow-[0_0_0_1px_var(--rule-soft)] transition hover:shadow-[0_0_0_1px_var(--ink)] sm:p-7";

  if (href) {
    return (
      <Link
        href={href}
        className={
          classes +
          " focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--ink)]"
        }
      >
        {corps}
      </Link>
    );
  }
  return <div className={classes}>{corps}</div>;
}

export default async function EtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const regs = regimes(etab);
  const [equipements, dashboard, nbVerifs, nbRapports] = await Promise.all([
    listerEquipementsDeLEtablissement(id),
    getDashboardData(id),
    prisma.verification.count({ where: { etablissementId: id } }),
    prisma.rapportVerification.count({ where: { etablissementId: id } }),
  ]);

  // Étapes d'onboarding — s'efface une fois toutes les étapes faites
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
        "Installation électrique, extincteurs, hotte, ascenseur… Ce sont eux qui déclenchent les vérifications périodiques à faire (élec annuel, extincteurs, etc.).",
      faite: equipements.length > 0,
      href: `/etablissements/${id}/equipements`,
      cta: equipements.length === 0 ? "Commencer la déclaration" : undefined,
    },
    {
      id: "calendrier",
      titre: "Consulter votre calendrier de vérifications",
      pourquoi:
        "Dès que vos équipements sont déclarés, l'outil calcule tout seul les dates des prochaines vérifications obligatoires. Il n'y a rien à lancer — votre rôle, c'est planifier et déposer les rapports.",
      faite: nbVerifs > 0,
      href: `/etablissements/${id}/calendrier`,
      cta: nbVerifs === 0 ? "Ouvrir le calendrier" : undefined,
    },
    {
      id: "rapport",
      titre: "Déposer un premier rapport de vérification",
      pourquoi:
        "L'outil stocke vos rapports et rappelle les échéances — il ne réalise pas les vérifications à votre place. Dès que vous recevez un rapport (même ancien), déposez-le : la prochaine échéance se recalcule automatiquement. Besoin d'un expert pour effectuer la vérification ? Prenez rendez-vous sur btry.fr.",
      faite: nbRapports > 0,
      href: `/etablissements/${id}/registre`,
      cta: nbRapports === 0 ? "Ouvrir le registre" : undefined,
    },
  ];

  const onboardingFini = etapesOnboarding.every((e) => e.faite);
  const aEquipements = equipements.length > 0;

  // DUERP : la dernière initiée sert d'accès rapide
  const duerpDernier = etab.duerps[0] ?? null;
  const duerpVersion = duerpDernier?.versions[0] ?? null;

  // Formulations des indices et métriques pour les tuiles
  const verifsEnRetard = dashboard.compteurs.verifsEnRetard;
  const verifsSous30j = dashboard.compteurs.verifsSous30j;
  const actionsACouvrir =
    dashboard.compteurs.actionsOuvertes + dashboard.compteurs.actionsEnCours;
  const actionsEnRetard = dashboard.compteurs.actionsEnRetard;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      {/* =====================================================
          1. Fiche d'identité de l'établissement
          ===================================================== */}
      <section aria-labelledby="fiche-heading">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="label-admin">
              Fiche d&apos;identité · Établissement
            </p>
            <h1
              id="fiche-heading"
              className="mt-3 text-[1.9rem] font-semibold tracking-[-0.02em] leading-tight"
            >
              {etab.raisonDisplay}
            </h1>
            <p className="mt-1 text-[0.88rem] text-muted-foreground">
              Rattaché à{" "}
              <Link
                href={`/entreprises/${etab.entrepriseId}`}
                className="underline underline-offset-2 hover:text-ink"
              >
                {etab.entreprise.raisonSociale}
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/etablissements/${id}/modifier`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Modifier la fiche
            </Link>
            <SupprimerEtablissementButton id={id} />
          </div>
        </div>

        {/* Grille de champs — lisible comme un encart administratif */}
        <dl className="cartouche mt-6 grid grid-cols-1 divide-y divide-dashed divide-rule/50 sm:grid-cols-2 sm:divide-y-0 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:border-dashed sm:[&>*:nth-child(even)]:border-rule/50 sm:[&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+3)]:border-dashed sm:[&>*:nth-child(n+3)]:border-rule/50">
          <div className="px-6 py-4 sm:px-8">
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
              Adresse du site
            </dt>
            <dd className="mt-1 text-[0.95rem]">{etab.adresse}</dd>
          </div>
          <div className="px-6 py-4 sm:px-8">
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
              Effectif sur site
            </dt>
            <dd className="mt-1 text-[0.95rem]">
              {etab.effectifSurSite} salarié
              {etab.effectifSurSite > 1 ? "s" : ""}
            </dd>
          </div>
          <div className="px-6 py-4 sm:px-8">
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
              Code NAF
            </dt>
            <dd className="mt-1 font-mono text-[0.85rem]">
              {etab.codeNaf ?? "—"}
            </dd>
          </div>
          <div className="px-6 py-4 sm:px-8">
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
              Régimes applicables
            </dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {regs.length === 0 ? (
                <span className="text-[0.88rem] text-muted-foreground">—</span>
              ) : (
                regs.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-rule bg-paper-sunk/60 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {r}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>
      </section>

      <div className="filet-pointille my-10" />

      {/* =====================================================
          2. Guide de mise en place (tant qu'il n'est pas fini)
          ===================================================== */}
      {!onboardingFini && (
        <>
          <OnboardingChecklist
            etapes={etapesOnboarding}
            etablissementRaison={etab.raisonDisplay}
          />
          <div className="filet-pointille my-10" />
        </>
      )}

      {/* =====================================================
          3. État de conformité (score + recommandations)
          ===================================================== */}
      {aEquipements && (
        <>
          <section aria-labelledby="etat-heading" className="space-y-5">
            <div>
              <p className="label-admin">État de conformité</p>
              <h2
                id="etat-heading"
                className="mt-2 text-[1.15rem] font-semibold tracking-[-0.012em]"
              >
                Où vous en êtes aujourd&apos;hui
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ScoreConformite score={dashboard.score} />
              <PanneauRecommandations recommandations={dashboard.recommandations} />
            </div>
          </section>
          <div className="filet-pointille my-10" />
        </>
      )}

      {/* =====================================================
          4. Boîte à outils — les modules de pilotage
          ===================================================== */}
      <section aria-labelledby="outils-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-admin">Boîte à outils</p>
            <h2
              id="outils-heading"
              className="mt-2 text-[1.15rem] font-semibold tracking-[-0.012em]"
            >
              Vos modules de pilotage de la conformité
            </h2>
            <p className="mt-1.5 max-w-xl text-[0.85rem] leading-relaxed text-muted-foreground">
              Chaque module couvre une famille d&apos;obligations. Les
              compteurs affichés reflètent la situation en temps réel.
            </p>
          </div>
          {aEquipements && (
            <a
              href={`/api/etablissements/${id}/dossier-conformite/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Dossier de conformité PDF
            </a>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Équipements */}
          <Outil
            numero="01."
            titre="Équipements"
            description="Déclaration des équipements présents (électricité, extincteurs, hotte, ascenseur…). C'est ce qui déclenche les vérifications obligatoires."
            href={`/etablissements/${id}/equipements`}
            cta={aEquipements ? "Gérer" : "Déclarer"}
            metrique={{
              valeur: equipements.length,
              libelle: aEquipements
                ? equipements.length > 1
                  ? "équipements déclarés"
                  : "équipement déclaré"
                : "à déclarer",
            }}
            indice={
              !aEquipements
                ? { libelle: "À démarrer", tone: "warn" }
                : undefined
            }
          />

          {/* Calendrier */}
          <Outil
            numero="02."
            titre="Calendrier de vérifications"
            description="Dates des vérifications périodiques obligatoires (art. R4323-22 et suiv., règlement ERP). Généré à partir des équipements."
            href={`/etablissements/${id}/calendrier`}
            cta="Ouvrir"
            metrique={{
              valeur: verifsEnRetard + verifsSous30j,
              libelle: "à traiter sous 30 jours",
            }}
            indice={
              verifsEnRetard > 0
                ? {
                    libelle: `${verifsEnRetard} en retard`,
                    tone: "alert",
                  }
                : verifsSous30j > 0
                  ? {
                      libelle: `${verifsSous30j} sous 30 j`,
                      tone: "warn",
                    }
                  : aEquipements
                    ? { libelle: "À jour", tone: "ok" }
                    : { libelle: "En attente", tone: "neutral" }
            }
          />

          {/* Registre de sécurité */}
          <Outil
            numero="03."
            titre="Registre de sécurité"
            description="Stockage horodaté de tous vos rapports de vérification (art. L4711-5). L'outil archive — il ne réalise pas les contrôles. Présentable en 30 s à un inspecteur."
            href={`/etablissements/${id}/registre`}
            cta="Ouvrir"
            metrique={{
              valeur: nbRapports,
              libelle:
                nbRapports > 1
                  ? "rapports déposés"
                  : "rapport déposé",
            }}
            indice={
              dashboard.compteurs.verifsRealisees12m > 0
                ? {
                    libelle: `${dashboard.compteurs.verifsRealisees12m} sur 12 mois`,
                    tone: "neutral",
                  }
                : undefined
            }
          />

          {/* Plan d'actions */}
          <Outil
            numero="04."
            titre="Plan d'actions"
            description="Actions correctives issues du DUERP ou des rapports. Hiérarchie des mesures de l'art. L4121-2 appliquée."
            href={`/etablissements/${id}/actions`}
            cta="Ouvrir"
            metrique={{
              valeur: actionsACouvrir,
              libelle:
                actionsACouvrir > 1 ? "actions à couvrir" : "action à couvrir",
            }}
            indice={
              actionsEnRetard > 0
                ? {
                    libelle: `${actionsEnRetard} en retard`,
                    tone: "alert",
                  }
                : actionsACouvrir === 0 && aEquipements
                  ? { libelle: "Aucune ouverte", tone: "ok" }
                  : undefined
            }
          />

          {/* DUERP */}
          {duerpDernier ? (
            <Outil
              numero="05."
              titre="DUERP"
              description="Document unique d'évaluation des risques professionnels (art. R4121-1). Versionné et conservé 40 ans."
              href={`/duerp/${duerpDernier.id}`}
              cta="Ouvrir"
              metrique={
                duerpVersion
                  ? {
                      valeur: `v${duerpVersion.numero}`,
                      libelle: `validé le ${duerpVersion.createdAt.toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}`,
                    }
                  : {
                      valeur: "—",
                      libelle: "pas encore validé",
                    }
              }
              indice={
                !duerpVersion
                  ? { libelle: "En cours", tone: "warn" }
                  : undefined
              }
            />
          ) : (
            <Outil
              numero="05."
              titre="DUERP"
              description="Document unique d'évaluation des risques professionnels (art. R4121-1). Versionné et conservé 40 ans."
            >
              <div className="flex w-full items-center justify-between gap-3">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Aucun DUERP initié
                </p>
                <CreerDuerpButton etablissementId={id} variant="outline" />
              </div>
            </Outil>
          )}
        </div>

        {/* Si plusieurs DUERPs coexistent (cas rare), on renvoie vers l'historique de versions */}
        {etab.duerps.length > 1 && duerpDernier && (
          <p className="mt-5 text-[0.82rem] text-muted-foreground">
            {etab.duerps.length} DUERPs coexistent sur cet établissement — la
            tuile ouvre le plus récent.{" "}
            <Link
              href={`/duerp/${duerpDernier.id}/versions`}
              className="underline underline-offset-2 hover:text-ink"
            >
              Voir l&apos;historique des versions →
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
