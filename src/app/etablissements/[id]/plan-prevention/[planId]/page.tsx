import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, SignatureBlock, StatusPill } from "@/components/ui-kit";
import { DemanderSignatureForm } from "@/components/signatures/DemanderSignatureForm";
import {
  BoutonCloturer,
  BoutonSupprimerPlan,
} from "@/components/plan-prevention/PlanActionsButtons";
import { getPlanPrevention } from "@/lib/plan-prevention/queries";
import { diagnostiquerPlan } from "@/lib/plan-prevention/schema";
import { requireEtablissement } from "@/lib/auth/scope";

function fmtDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function fmtDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PlanPreventionDetailPage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>;
}) {
  const { id, planId } = await params;
  const { etablissement } = await requireEtablissement(id);
  const plan = await getPlanPrevention(id, planId);
  if (!plan) notFound();

  const diag = diagnostiquerPlan({
    dureeHeuresEstimee: plan.dureeHeuresEstimee,
    travauxDangereux: plan.travauxDangereux,
  });

  const signatureEU = plan.signatures.find(
    (s) => s.signataireEmail !== plan.efChefEmail,
  );
  const signatureEF = plan.signatures.find(
    (s) => s.signataireEmail === plan.efChefEmail,
  );

  const statutVisuel =
    plan.statut === "valide" || plan.statut === "clos"
      ? "a_jour"
      : plan.statut === "attente_signatures"
        ? "a_planifier"
        : "non_applicable";

  return (
    <>
      <AppTopbar
        title={`Plan PP-${String(plan.numero).padStart(3, "0")}`}
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          {
            href: `/etablissements/${id}/plan-prevention`,
            label: "Plans de prévention",
          },
          { label: `PP-${String(plan.numero).padStart(3, "0")}` },
        ]}
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-16">
        {/* Hero */}
        <article className="cartouche relative overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{
              background: diag.ecritObligatoire
                ? "var(--minium)"
                : "var(--warm)",
            }}
          />
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            <div className="border-b border-dashed border-rule/60 px-7 py-7 md:border-b-0 md:border-r md:px-10 md:py-10">
              <p className="label-admin">
                Plan de prévention · PP-{String(plan.numero).padStart(3, "0")}
              </p>
              <h1 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-[-0.025em]">
                {plan.entrepriseExterieureRaison}
              </h1>
              <p className="mt-1 text-[0.9rem] text-muted-foreground">
                {plan.lieux}
              </p>
              {diag.ecritObligatoire && (
                <p className="mt-3 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--minium)]">
                  Plan écrit obligatoire
                </p>
              )}
              <p className="mt-5 whitespace-pre-wrap text-[0.9rem] leading-relaxed text-[color:var(--ink)]">
                {plan.naturesTravaux}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-4 bg-[color:var(--paper-sunk)] px-7 py-7 md:px-10 md:py-10">
              <StatusPill status={statutVisuel} />
              <dl className="space-y-2 text-[0.82rem]">
                <div>
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Période
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {fmtDateTime(plan.dateDebut)}
                  </dd>
                  <dd className="font-semibold tabular-nums">
                    → {fmtDateTime(plan.dateFin)}
                  </dd>
                </div>
                {plan.dureeHeuresEstimee && (
                  <div>
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Durée estimée
                    </dt>
                    <dd className="font-semibold tabular-nums">
                      {plan.dureeHeuresEstimee} h
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Effectif EE
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {plan.efEffectifIntervenant}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* Inspection commune */}
        <section className="mt-10">
          <p className="label-admin">Inspection commune préalable</p>
          <h2 className="mt-1 text-[1.15rem] font-semibold tracking-[-0.015em]">
            {plan.inspectionDate ? "Réalisée" : "À planifier"}
          </h2>
          <div className="mt-4 cartouche p-5">
            {plan.inspectionDate ? (
              <>
                <p className="text-[0.9rem]">
                  Effectuée le{" "}
                  <strong>{fmtDate(plan.inspectionDate)}</strong>.
                </p>
                {plan.inspectionParticipants && (
                  <p className="mt-2 whitespace-pre-wrap text-[0.85rem] text-[color:var(--ink)]">
                    <span className="label-admin">Participants —&nbsp;</span>
                    {plan.inspectionParticipants}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[0.88rem] text-muted-foreground">
                Aucune date d&apos;inspection commune enregistrée. Cette
                inspection est obligatoire avant le démarrage des travaux
                (art. R4512-7 CT).
              </p>
            )}
          </div>
        </section>

        {/* Matrice risques */}
        <section className="mt-10">
          <p className="label-admin">Analyse risques ↔ mesures</p>
          <h2 className="mt-1 text-[1.15rem] font-semibold tracking-[-0.015em]">
            {plan.lignes.length} risque
            {plan.lignes.length > 1 ? "s" : ""} d&apos;interférence identifié
            {plan.lignes.length > 1 ? "s" : ""}
          </h2>

          <div className="mt-4 space-y-3">
            {plan.lignes.map((l, i) => (
              <article
                key={l.id}
                className="cartouche grid grid-cols-1 gap-0 md:grid-cols-[1fr_1fr]"
              >
                <div className="border-b border-dashed border-rule/50 bg-[color:var(--paper-sunk)] px-5 py-4 md:col-span-2">
                  <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
                    Risque #{i + 1}
                  </p>
                  <p className="mt-1 text-[0.95rem] font-semibold">
                    {l.risque}
                  </p>
                </div>
                <div className="border-b border-dashed border-rule/50 px-5 py-4 md:border-b-0 md:border-r">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--warm)]">
                    Votre mesure (EU)
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[0.85rem] text-[color:var(--ink)]">
                    {l.mesureEntrepriseUtilisatrice || "— (à compléter)"}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--minium)]">
                    Mesure EE
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[0.85rem] text-[color:var(--ink)]">
                    {l.mesureEntrepriseExterieure || "— (à compléter)"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Signatures */}
        <section className="mt-10">
          <p className="label-admin">Signatures</p>
          <h2 className="mt-1 text-[1.15rem] font-semibold tracking-[-0.015em]">
            Co-signature donneur d&apos;ordre + entreprise extérieure
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--warm)]">
                Chef d&apos;entreprise utilisatrice · {plan.euChefNom}
              </p>
              {signatureEU ? (
                <SignatureBlock
                  signataireNom={signatureEU.signataireNom}
                  signataireRole={signatureEU.signataireRole}
                  signataireEmail={signatureEU.signataireEmail}
                  horodatageIso={signatureEU.horodatageIso}
                  methode={signatureEU.methode}
                  hashDocument={signatureEU.hashDocument}
                  nomDocument={signatureEU.nomDocument}
                  signatureId={signatureEU.id}
                  verifierHref={`/verifier/${signatureEU.id}`}
                />
              ) : (
                <div className="cartouche-sunk p-4">
                  <DemanderSignatureForm
                    etablissementId={id}
                    objetType="plan_prevention"
                    objetId={plan.id}
                    libelleDocument={`Plan de prévention PP-${String(plan.numero).padStart(3, "0")} — ${plan.entrepriseExterieureRaison}`}
                    nomDefaut={plan.euChefNom}
                  />
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--minium)]">
                Chef d&apos;entreprise extérieure · {plan.efChefNom}
              </p>
              {signatureEF ? (
                <SignatureBlock
                  signataireNom={signatureEF.signataireNom}
                  signataireRole={signatureEF.signataireRole}
                  signataireEmail={signatureEF.signataireEmail}
                  horodatageIso={signatureEF.horodatageIso}
                  methode={signatureEF.methode}
                  hashDocument={signatureEF.hashDocument}
                  nomDocument={signatureEF.nomDocument}
                  signatureId={signatureEF.id}
                  verifierHref={`/verifier/${signatureEF.id}`}
                />
              ) : (
                <div className="cartouche-sunk p-4">
                  <DemanderSignatureForm
                    etablissementId={id}
                    objetType="plan_prevention"
                    objetId={plan.id}
                    libelleDocument={`Plan de prévention PP-${String(plan.numero).padStart(3, "0")} — ${plan.entrepriseExterieureRaison}`}
                    emailDefaut={plan.efChefEmail}
                    nomDefaut={plan.efChefNom}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cycle de vie */}
        <section className="mt-10 cartouche p-6">
          <p className="label-admin">Cycle de vie</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {(plan.statut === "valide" || plan.statut === "attente_signatures") && (
              <BoutonCloturer planId={plan.id} />
            )}
            {plan.statut === "clos" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-vif-soft)] px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent-vif)]">
                ✓ Plan clos
              </span>
            )}
            <BoutonSupprimerPlan planId={plan.id} />
          </div>
        </section>

        {/* Rappel légal */}
        <footer className="mt-10">
          <LegalBadge
            reference="Art. R4512-6 à R4512-12 CT · décret 92-158"
            href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018491957"
            defaultOpen
          >
            Le plan de prévention est établi conjointement par le chef de
            l&apos;entreprise utilisatrice et celui de l&apos;entreprise
            extérieure avant toute intervention, à la suite d&apos;une
            inspection commune des lieux. Il précise les mesures de prévention
            prises par chaque entreprise face aux risques d&apos;interférence.
          </LegalBadge>
        </footer>
      </main>
    </>
  );
}
