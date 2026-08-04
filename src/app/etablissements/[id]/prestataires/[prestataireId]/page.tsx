import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { LegalBadge, WhyCard } from "@/components/ui-kit";
import { VigilancePiecePill } from "@/components/prestataires/VigilancePills";
import { SupprimerPrestataireButton } from "@/components/prestataires/SupprimerPrestataireButton";
import { getPrestataire } from "@/lib/prestataires/queries";
import { LABEL_DOMAINE } from "@/lib/prestataires/schema";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PrestataireDetailPage({
  params,
}: {
  params: Promise<{ id: string; prestataireId: string }>;
}) {
  const { id, prestataireId } = await params;
  const p = await getPrestataire(id, prestataireId);
  if (!p) notFound();

  const nbAlertes = p.vigilance.alertesOuvertes;

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}/prestataires`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Annuaire
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">
            {p.estOrganismeAgree ? "Organisme agréé · " : ""}
            {p.siret ? `SIRET ${p.siret}` : "SIRET non renseigné"}
          </p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            {p.raisonSociale}
          </h1>
          {p.domaines.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {p.domaines.map((d) => (
                <li
                  key={d}
                  className="rounded-full bg-[color:var(--paper-sunk)] px-2.5 py-0.5 text-[0.72rem] text-[color:var(--seal)]"
                >
                  {LABEL_DOMAINE[d]}
                </li>
              ))}
            </ul>
          )}
        </div>

        <SupprimerPrestataireButton
          etablissementId={id}
          prestataireId={p.id}
        />
      </header>

      {/* -------- Contact -------- */}
      <section className="mt-10 cartouche p-6">
        <p className="label-admin">Contact</p>
        <dl className="mt-3 grid grid-cols-1 gap-y-2 text-[0.9rem] sm:grid-cols-[140px_1fr]">
          <dt className="text-[color:var(--muted-foreground)]">Nom :</dt>
          <dd className="text-[color:var(--ink)]">{p.contactNom}</dd>
          <dt className="text-[color:var(--muted-foreground)]">Email :</dt>
          <dd>
            <a
              href={`mailto:${p.contactEmail}`}
              className="font-mono text-[color:var(--warm)] hover:underline"
            >
              {p.contactEmail}
            </a>
          </dd>
          {p.contactTelephone && (
            <>
              <dt className="text-[color:var(--muted-foreground)]">Téléphone :</dt>
              <dd className="font-mono text-[color:var(--ink)]">
                {p.contactTelephone}
              </dd>
            </>
          )}
        </dl>
      </section>

      {/* -------- Vigilance -------- */}
      <section className="mt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-admin">Obligation de vigilance</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              {nbAlertes === 0
                ? "Toutes les pièces sont à jour"
                : `${nbAlertes} pièce${nbAlertes > 1 ? "s" : ""} à régulariser`}
            </h2>
          </div>
          <LegalBadge
            reference="Art. L8222-1 CT"
            href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389145"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <VigilancePiecePill
            libelle="Attestation URSSAF"
            statut={p.vigilance.urssaf}
            jours={p.vigilance.urssafExpireDans}
          />
          <VigilancePiecePill
            libelle="RC Pro"
            statut={p.vigilance.rcPro}
            jours={p.vigilance.rcProExpireDans}
          />
          <div className="flex items-center gap-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] px-3 py-2">
            <span
              aria-hidden
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-[0.85rem] ${
                p.vigilance.kbis === "present"
                  ? "bg-[color:var(--accent-vif-soft)] text-[color:var(--accent-vif)]"
                  : "bg-[color:var(--paper-sunk)] text-[color:var(--seal)]"
              }`}
            >
              {p.vigilance.kbis === "present" ? "●" : "—"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="label-admin">Extrait Kbis</div>
              <div className="mt-0.5 text-[0.85rem] font-medium text-[color:var(--ink)]">
                {p.vigilance.kbis === "present" ? "Fourni" : "Non fourni"}
              </div>
              {p.kbisDateEmission && (
                <div className="text-[0.72rem] text-[color:var(--muted-foreground)]">
                  Émis le {formatDate(p.kbisDateEmission)}
                </div>
              )}
            </div>
          </div>
        </div>

        {nbAlertes > 0 && (
          <div className="mt-6">
            <WhyCard
              kicker="Conseil"
              titre="Demandez les pièces manquantes par email"
              enjeu="Un email standard suffit pour obtenir une attestation URSSAF de vigilance — le prestataire la génère en 30 secondes depuis son espace URSSAF."
              tonalite="info"
            >
              <p>
                Prochaine étape du produit : demande automatique par lien sécurisé,
                le prestataire dépose sa pièce en un clic sans se créer de compte.
              </p>
            </WhyCard>
          </div>
        )}
      </section>

      {/* -------- Notes -------- */}
      {p.notesInternes && (
        <section className="mt-10 cartouche-sunk p-6">
          <p className="label-admin">Notes internes</p>
          <p className="mt-3 whitespace-pre-wrap text-[0.9rem] leading-relaxed text-[color:var(--ink)]">
            {p.notesInternes}
          </p>
        </section>
      )}

      {/* -------- Ajouté le -------- */}
      <footer className="mt-10 flex items-center justify-between border-t border-[color:var(--rule-soft)] pt-4 text-[0.75rem] text-[color:var(--muted-foreground)]">
        <span>Ajouté le {formatDate(p.createdAt)}</span>
        <Link
          href={`/etablissements/${id}/prestataires`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          ← Retour à l&apos;annuaire
        </Link>
      </footer>
    </main>
  );
}
