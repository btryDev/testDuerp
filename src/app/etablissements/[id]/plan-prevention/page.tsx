import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { LegalBadge, WhyCard } from "@/components/ui-kit";
import { requireEtablissement } from "@/lib/auth/scope";
import { listPlansPrevention } from "@/lib/plan-prevention/queries";

export const metadata = {
  title: "Plans de prévention",
};

function formatDateCourte(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const LABEL_STATUT = {
  brouillon: "Brouillon",
  inspection_faite: "Inspection faite",
  attente_signatures: "Attente signatures",
  valide: "Validé",
  clos: "Clos",
  annule: "Annulé",
} as const;

const COULEUR_STATUT = {
  brouillon: "var(--seal)",
  inspection_faite: "var(--warm)",
  attente_signatures: "oklch(0.72 0.15 70)",
  valide: "var(--accent-vif)",
  clos: "var(--seal)",
  annule: "var(--muted-foreground)",
} as const;

export default async function PlanPreventionListePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const plans = await listPlansPrevention(id);

  return (
    <>
      <AppTopbar
        title="Plans de prévention"
        subtitle="Obligatoire pour toute entreprise extérieure qui intervient chez vous."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Plans de prévention" },
        ]}
        actions={
          <Link
            href={`/etablissements/${id}/plan-prevention/nouveau`}
            className={buttonVariants({ size: "sm" })}
          >
            + Nouveau plan
          </Link>
        }
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-16">
        <WhyCard
          kicker="Pourquoi cette page"
          titre="Protéger les deux parties contre les risques d'interférence."
          enjeu="Une entreprise qui intervient chez vous fait intervenir son personnel dans votre environnement : si un accident survient faute d'analyse conjointe, votre responsabilité est engagée."
          tonalite="info"
        >
          <p>
            Le plan de prévention est <strong>écrit obligatoire</strong> si les
            travaux dépassent <strong>400 h sur 12 mois</strong> OU figurent sur
            la liste des travaux dangereux de l&apos;arrêté du 19-03-1993. Dans
            tous les cas, une inspection commune préalable est imposée.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LegalBadge
              reference="Art. R4512-6 à R4512-12 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018491957"
            />
            <LegalBadge reference="Décret 92-158" />
            <LegalBadge reference="Arrêté 19-03-1993 — liste dangereuse" />
          </div>
        </WhyCard>

        <section className="mt-10">
          {plans.length === 0 ? (
            <EmptyState
              titre="Vos plans de prévention"
              pourquoi="Dès qu'une entreprise extérieure intervient chez vous (nettoyage, entretien, travaux, livraisons régulières…), vous devez analyser conjointement les risques d'interférence. Cette liste conserve l'historique de ces analyses."
              quoiFaire="Créez un plan pour votre prochaine intervention. Commencez par le diagnostic intégré : l'outil vous dit si un plan écrit est obligatoire ou si un plan recommandé suffit."
              cta="+ Créer un plan de prévention"
              ctaHref={`/etablissements/${id}/plan-prevention/nouveau`}
            />
          ) : (
            <ul className="space-y-3">
              {plans.map((p) => {
                const color = COULEUR_STATUT[p.statut];
                return (
                  <li key={p.id}>
                    <Link
                      href={`/etablissements/${id}/plan-prevention/${p.id}`}
                      className="cartouche group relative block overflow-hidden transition-colors hover:bg-paper-sunk"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: color }}
                      />
                      <div className="flex items-start justify-between gap-4 px-6 py-5">
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-[1.25rem] font-light tabular-nums text-[color:var(--seal)]">
                            PP-{String(p.numero).padStart(3, "0")}
                          </span>
                          <div>
                            <p className="text-[0.95rem] font-semibold leading-tight group-hover:underline">
                              {p.entrepriseExterieureRaison}
                            </p>
                            <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
                              Du {formatDateCourte(p.dateDebut)} au{" "}
                              {formatDateCourte(p.dateFin)}
                              {p.dureeHeuresEstimee
                                ? ` · ${p.dureeHeuresEstimee} h`
                                : ""}{" "}
                              · {p._count.lignes} risque
                              {p._count.lignes > 1 ? "s" : ""} identifié
                              {p._count.lignes > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.1em]"
                          style={{
                            color,
                            background: `color-mix(in oklch, ${color} 12%, transparent)`,
                          }}
                        >
                          {LABEL_STATUT[p.statut]}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
