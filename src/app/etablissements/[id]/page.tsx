import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CreerDuerpButton } from "@/components/duerps/CreerDuerpButton";
import { SupprimerEtablissementButton } from "@/components/etablissements/SupprimerEtablissementButton";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { compterEtatCalendrier } from "@/lib/calendrier/queries";

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
  const equipements = await listerEquipementsDeLEtablissement(id);
  const etatCalendrier = await compterEtatCalendrier(id);

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
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.012em]">
            Calendrier de conformité
          </h2>
          <Link
            href={`/etablissements/${id}/calendrier`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Voir le calendrier →
          </Link>
        </div>

        <div className="cartouche px-6 py-5 sm:px-8">
          {equipements.length === 0 ? (
            <p className="text-[0.9rem] text-muted-foreground">
              Déclarez d&apos;abord vos équipements pour générer
              automatiquement le calendrier des vérifications périodiques.
            </p>
          ) : etatCalendrier.enRetard === 0 &&
            etatCalendrier.aVenir === 0 &&
            etatCalendrier.realisees12m === 0 ? (
            <p className="text-[0.9rem] text-muted-foreground">
              Le calendrier n&apos;a pas encore été généré. Rendez-vous sur
              la page calendrier pour le créer à partir de vos équipements.
            </p>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-[0.9rem]">
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                  En retard
                </dt>
                <dd className="mt-1 text-[1.4rem] font-semibold">
                  {etatCalendrier.enRetard}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Sous 30 jours
                </dt>
                <dd className="mt-1 text-[1.4rem] font-semibold">
                  {etatCalendrier.aVenir}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Réalisées (12 mois)
                </dt>
                <dd className="mt-1 text-[1.4rem] font-semibold">
                  {etatCalendrier.realisees12m}
                </dd>
              </div>
            </dl>
          )}
        </div>
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
