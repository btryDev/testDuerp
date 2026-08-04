import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { WhyCard, LegalBadge } from "@/components/ui-kit";
import { PrestataireCard } from "@/components/prestataires/PrestataireCard";
import { requireEtablissement } from "@/lib/auth/scope";
import { listPrestataires } from "@/lib/prestataires/queries";

export default async function PrestatairesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const prestataires = await listPrestataires(id);

  const nbAlertes = prestataires.reduce(
    (acc, p) => acc + p.vigilance.alertesOuvertes,
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etablissement.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Annuaire prestataires</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            Vos prestataires et leur conformité
          </h1>
          <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Centralisez les entreprises qui interviennent dans votre établissement
            — artisans, organismes agréés, bureaux de contrôle — et suivez leurs
            pièces administratives. Les alertes s&apos;allument 30 jours avant
            expiration.
          </p>
        </div>

        <Link
          href={`/etablissements/${id}/prestataires/nouveau`}
          className={buttonVariants({ size: "sm" })}
        >
          + Ajouter un prestataire
        </Link>
      </header>

      <div className="mt-8">
        <WhyCard
          kicker="Pourquoi cette page"
          titre="Votre obligation de vigilance"
          enjeu="En cas de travail dissimulé chez un prestataire, vous pouvez être tenu solidairement responsable des cotisations sociales — sauf si vous apportez la preuve écrite de vos vérifications."
          tonalite={nbAlertes > 0 ? "alerte" : "info"}
        >
          <p>
            Pour tout contrat d&apos;au moins <strong>5 000 € HT</strong>, vous
            devez vérifier <strong>tous les 6 mois</strong> que votre prestataire
            est à jour de ses déclarations sociales (attestation URSSAF de
            vigilance), et constituer un dossier consultable.
          </p>
          <div className="mt-3">
            <LegalBadge
              reference="Art. L8222-1 · D8222-5 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389145"
              extrait="Toute personne qui conclut un contrat dont l'objet porte sur une obligation d'un montant minimum de 5 000 euros hors taxes est tenue, lors de la conclusion et tous les six mois jusqu'à la fin de son exécution, de se faire remettre par son cocontractant les documents attestant qu'il a fait l'objet des vérifications et déclarations."
            />
          </div>
        </WhyCard>
      </div>

      {nbAlertes > 0 && (
        <div className="mt-6 rounded-2xl border border-[color:color-mix(in_oklch,var(--minium)_30%,transparent)] bg-[color:color-mix(in_oklch,var(--minium)_6%,transparent)] p-4">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--minium)]">
            ⚠ {nbAlertes} pièce{nbAlertes > 1 ? "s" : ""} à régulariser
          </p>
          <p className="mt-1 text-[0.85rem] text-[color:var(--ink)]">
            Une ou plusieurs attestations sont expirées, expirent dans les 30 jours,
            ou n&apos;ont pas été téléversées. Demandez-les aux prestataires concernés.
          </p>
        </div>
      )}

      <section className="mt-10">
        {prestataires.length === 0 ? (
          <EmptyState
            titre="Votre annuaire de prestataires"
            pourquoi="Un bon annuaire vous fait gagner du temps à chaque intervention : vous retrouvez le contact en 2 secondes, vous envoyez un lien de dépôt de rapport sans ressaisir l'email, et surtout vous gardez trace de toutes les pièces obligatoires."
            quoiFaire="Ajoutez d'abord les prestataires déjà en place — ceux qui font vos vérifications périodiques (électricité, extincteurs, ascenseur…), votre bureau de contrôle, vos artisans récurrents."
            cta="+ Ajouter mon premier prestataire"
            ctaHref={`/etablissements/${id}/prestataires/nouveau`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {prestataires.map((p) => (
              <PrestataireCard
                key={p.id}
                etablissementId={id}
                prestataire={p}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
