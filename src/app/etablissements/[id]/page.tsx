import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CreerDuerpButton } from "@/components/duerps/CreerDuerpButton";
import { SupprimerEtablissementButton } from "@/components/etablissements/SupprimerEtablissementButton";
import { ScoreConformite } from "@/components/dashboard/ScoreConformite";
import { PanneauRecommandations } from "@/components/dashboard/PanneauRecommandations";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { getDashboardData } from "@/lib/dashboard/queries";

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
  if (etab.estIGH)
    out.push(`IGH ${etab.classeIgh ?? ""}`.trim());
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

  const regs = regimes(etab);
  const [equipements, dashboard] = await Promise.all([
    listerEquipementsDeLEtablissement(id),
    getDashboardData(id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/entreprises/${etab.entrepriseId}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etab.entreprise.raisonSociale}
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Établissement</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            {etab.raisonDisplay}
          </h1>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            {etab.adresse}
            <span className="mx-2 text-rule">·</span>
            {etab.effectifSurSite} salarié
            {etab.effectifSurSite > 1 ? "s" : ""} sur site
            {etab.codeNaf && (
              <>
                <span className="mx-2 text-rule">·</span>
                NAF {etab.codeNaf}
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {regs.map((r) => (
              <span
                key={r}
                className="rounded-full border border-rule bg-paper-sunk/60 px-3 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {equipements.length > 0 && (
            <a
              href={`/api/etablissements/${id}/dossier-conformite/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              Dossier de conformité PDF
            </a>
          )}
          <Link
            href={`/etablissements/${id}/modifier`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Modifier
          </Link>
          <SupprimerEtablissementButton id={id} />
        </div>
      </header>

      <div className="filet-pointille my-10" />

      {/* Tableau de bord — score + recommandations + indicateurs clés */}
      {equipements.length > 0 && (
        <section className="space-y-5">
          <h2 className="sr-only">Tableau de bord de conformité</h2>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ScoreConformite score={dashboard.score} />
            <PanneauRecommandations recommandations={dashboard.recommandations} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              href={`/etablissements/${id}/calendrier?urgent=1`}
              className="cartouche block px-4 py-4 transition hover:border-ink"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Vérifs en retard
              </p>
              <p className="mt-1 text-[1.4rem] font-semibold">
                {dashboard.compteurs.verifsEnRetard}
              </p>
            </Link>
            <Link
              href={`/etablissements/${id}/calendrier`}
              className="cartouche block px-4 py-4 transition hover:border-ink"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Sous 30 jours
              </p>
              <p className="mt-1 text-[1.4rem] font-semibold">
                {dashboard.compteurs.verifsSous30j}
              </p>
            </Link>
            <Link
              href={`/etablissements/${id}/actions?enCours=1`}
              className="cartouche block px-4 py-4 transition hover:border-ink"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Actions à couvrir
              </p>
              <p className="mt-1 text-[1.4rem] font-semibold">
                {dashboard.compteurs.actionsOuvertes +
                  dashboard.compteurs.actionsEnCours}
              </p>
            </Link>
            <Link
              href={`/etablissements/${id}/registre`}
              className="cartouche block px-4 py-4 transition hover:border-ink"
            >
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                Rapports (12 mois)
              </p>
              <p className="mt-1 text-[1.4rem] font-semibold">
                {dashboard.compteurs.verifsRealisees12m}
              </p>
            </Link>
          </div>
        </section>
      )}

      {equipements.length > 0 && <div className="filet-pointille my-10" />}

      <section className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.012em]">
            Équipements déclarés
          </h2>
          {equipements.length > 0 && (
            <Link
              href={`/etablissements/${id}/equipements`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Gérer les équipements →
            </Link>
          )}
        </div>

        {equipements.length === 0 ? (
          <div className="cartouche flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucun équipement déclaré pour l&apos;instant. La déclaration
              alimentera votre calendrier de vérifications obligatoires.
            </p>
            <Link
              href={`/etablissements/${id}/equipements`}
              className={buttonVariants({ size: "sm" })}
            >
              Déclarer les équipements
            </Link>
          </div>
        ) : (
          <div className="cartouche px-6 py-5 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              {equipements.length} équipement
              {equipements.length > 1 ? "s" : ""} déclaré
              {equipements.length > 1 ? "s" : ""} —{" "}
              <Link
                href={`/etablissements/${id}/equipements`}
                className="underline underline-offset-2"
              >
                voir la liste
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <div className="filet-pointille my-10" />

      <section className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.012em]">
            Calendrier de conformité
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/etablissements/${id}/actions`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Plan d&apos;actions
            </Link>
            <Link
              href={`/etablissements/${id}/registre`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Registre de sécurité
            </Link>
            <Link
              href={`/etablissements/${id}/calendrier`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Voir le calendrier →
            </Link>
          </div>
        </div>

        {equipements.length === 0 && (
          <div className="cartouche px-6 py-5 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Déclarez d&apos;abord vos équipements pour générer
              automatiquement le calendrier des vérifications périodiques.
            </p>
          </div>
        )}
      </section>

      <div className="filet-pointille my-10" />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.012em]">
            DUERP de cet établissement
          </h2>
          {etab.duerps.length === 0 ? null : (
            <CreerDuerpButton etablissementId={id} variant="outline" />
          )}
        </div>

        {etab.duerps.length === 0 ? (
          <div className="cartouche flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucun DUERP n&apos;a encore été initié pour cet établissement.
            </p>
            <CreerDuerpButton etablissementId={id} />
          </div>
        ) : (
          <ul className="cartouche divide-y divide-dashed divide-rule/50">
            {etab.duerps.map((d) => {
              const derniere = d.versions[0];
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8"
                >
                  <div>
                    <p className="text-[0.95rem] font-semibold">
                      DUERP démarré le{" "}
                      {d.createdAt.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                      {derniere
                        ? `Version ${derniere.numero} · ${derniere.createdAt.toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}`
                        : "Pas encore validé"}
                    </p>
                  </div>
                  <Link
                    href={`/duerp/${d.id}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Ouvrir →
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
