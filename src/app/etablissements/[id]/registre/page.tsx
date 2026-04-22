import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { BadgeResultat } from "@/components/rapports/BadgeResultat";
import { SupprimerRapportButton } from "@/components/rapports/SupprimerRapportButton";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerRapportsDeLEtablissement } from "@/lib/rapports/queries";
import { LABEL_DOMAINE } from "@/lib/calendrier/labels";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

const DOMAINES_P1: DomaineObligation[] = ["electricite", "incendie", "aeration"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
}

export default async function RegistrePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ domaine?: string; q?: string }>;
}) {
  const { id } = await params;
  const { domaine, q } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const filtreDomaine = DOMAINES_P1.includes(domaine as DomaineObligation)
    ? (domaine as DomaineObligation)
    : undefined;

  const rapports = await listerRapportsDeLEtablissement(id, {
    domaine: filtreDomaine,
    recherche: q,
  });

  const baseHref = `/etablissements/${id}/registre`;
  const makeHref = (over: { domaine?: string; q?: string }) => {
    const p = new URLSearchParams();
    const d = over.domaine ?? filtreDomaine;
    const qq = over.q ?? q ?? "";
    if (d) p.set("domaine", d);
    if (qq) p.set("q", qq);
    const s = p.toString();
    return s ? `${baseHref}?${s}` : baseHref;
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etab.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Registre de sécurité</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            Rapports de vérification
          </h1>
          <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Centralisation horodatée des rapports de vérification
            réglementaire. Article L. 4711-5 du Code du travail —
            l&apos;ensemble doit être tenu à disposition de
            l&apos;inspection et de la commission de sécurité.
          </p>
          <p className="max-w-2xl text-[0.82rem] leading-relaxed text-muted-foreground">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em]">
              Note —
            </span>{" "}
            l&apos;outil <strong className="text-ink">stocke</strong> vos
            rapports, il ne réalise pas les vérifications. Les contrôles
            doivent être effectués par un organisme agréé ou une personne
            qualifiée.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.btry.fr/solution/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Prendre rendez-vous ↗
          </a>
          <a
            href={`/api/etablissements/${id}/registre/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Exporter PDF
          </a>
        </div>
      </header>

      {/* Filtres */}
      <section className="mt-10 flex flex-wrap items-center gap-2">
        <form action={baseHref} method="get" className="flex items-center gap-2">
          {filtreDomaine && (
            <input type="hidden" name="domaine" value={filtreDomaine} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher un organisme, un libellé…"
            className="h-9 min-w-[18rem] rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
          />
          <button
            type="submit"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Filtrer
          </button>
        </form>
      </section>

      <section className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Domaine :
        </span>
        <Link
          href={makeHref({ domaine: "" })}
          className={
            "rounded-full border px-3 py-1 text-[0.78rem] " +
            (!filtreDomaine
              ? "border-ink bg-ink text-paper"
              : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
          }
        >
          Tous
        </Link>
        {DOMAINES_P1.map((d) => (
          <Link
            key={d}
            href={makeHref({ domaine: d })}
            className={
              "rounded-full border px-3 py-1 text-[0.78rem] " +
              (filtreDomaine === d
                ? "border-ink bg-ink text-paper"
                : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
            }
          >
            {LABEL_DOMAINE[d]}
          </Link>
        ))}
      </section>

      <div className="filet-pointille my-10" />

      {rapports.length === 0 ? (
        q || filtreDomaine ? (
          <div className="cartouche px-6 py-10 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucun rapport ne correspond à ces filtres — essayez de les
              retirer.
            </p>
          </div>
        ) : (
          <EmptyState
            titre="Le registre de sécurité centralise vos rapports de vérification"
            pourquoi="Cette plateforme stocke vos rapports — elle ne réalise pas les contrôles. Chaque fois qu'un organisme agréé ou une personne qualifiée vérifie une installation (électricité, extincteurs, hotte…), il vous remet un rapport. L'article L. 4711-5 du Code du travail impose de le tenir à disposition d'un contrôleur. Le registre numérique vous évite la boîte d'archive."
            quoiFaire="ouvrez une vérification dans votre calendrier, déposez le fichier (PDF, photo, DOCX) et indiquez le résultat. L'outil met automatiquement à jour la prochaine échéance. Pas encore d'expert pour effectuer la vérification ? Prenez rendez-vous."
            cta="Ouvrir le calendrier"
            ctaHref={`/etablissements/${id}/calendrier`}
            ctaSecondary={{
              libelle: "Prendre rendez-vous",
              href: "https://www.btry.fr/solution/",
            }}
          />
        )
      ) : (
        <ul className="cartouche divide-y divide-dashed divide-rule/50">
          {rapports.map((r) => {
            const dom = obligationParId(r.verification.obligationId)?.domaine;
            return (
              <li
                key={r.id}
                className="flex items-start justify-between gap-4 px-6 py-4 sm:px-8"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[0.95rem] font-semibold">
                    {r.verification.libelleObligation}
                  </p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {formatDate(r.dateRapport)}
                    <span className="mx-2 text-rule">·</span>
                    {r.verification.equipement.libelle}
                    {r.organismeVerif && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        {r.organismeVerif}
                      </>
                    )}
                    {dom && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        {LABEL_DOMAINE[dom]}
                      </>
                    )}
                    <span className="mx-2 text-rule">·</span>
                    {formatTaille(r.fichierTaille)}
                  </p>
                  {r.commentaires && (
                    <p className="text-[0.82rem] text-muted-foreground">
                      {r.commentaires}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <BadgeResultat resultat={r.resultat} />
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/api/rapports/${r.id}/fichier`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Ouvrir
                    </a>
                    <Link
                      href={`/etablissements/${id}/verifications/${r.verificationId}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Vérification
                    </Link>
                    <SupprimerRapportButton id={r.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
