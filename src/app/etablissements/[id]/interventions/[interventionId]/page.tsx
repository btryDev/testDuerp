import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { ChangerStatutButtons } from "@/components/interventions/ChangerStatutButtons";
import { CloturerTicketForm } from "@/components/interventions/CloturerTicketForm";
import { CommentaireForm } from "@/components/interventions/CommentaireForm";
import {
  BadgePriorite,
} from "@/components/interventions/NouveauTicketForm";
import { requireEtablissement } from "@/lib/auth/scope";
import { getIntervention } from "@/lib/interventions/queries";
import { COULEUR_PRIORITE, LABEL_STATUT } from "@/lib/interventions/schema";
import { getOptionalUser } from "@/lib/auth/require-user";

function fmtDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string; interventionId: string }>;
}) {
  const { id, interventionId } = await params;
  const { etablissement } = await requireEtablissement(id);
  const [it, user] = await Promise.all([
    getIntervention(id, interventionId),
    getOptionalUser(),
  ]);
  if (!it) notFound();

  const color = COULEUR_PRIORITE[it.priorite];

  return (
    <>
      <AppTopbar
        title={`Ticket #${String(it.numero).padStart(3, "0")}`}
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          {
            href: `/etablissements/${id}/interventions`,
            label: "Interventions",
          },
          { label: `#${String(it.numero).padStart(3, "0")}` },
        ]}
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-16">
        {/* Hero */}
        <article className="cartouche relative overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: color }}
          />
          <div className="px-7 pb-5 pt-7 sm:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
                #{String(it.numero).padStart(3, "0")}
              </span>
              <BadgePriorite priorite={it.priorite} />
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                · {LABEL_STATUT[it.statut]}
              </span>
            </div>
            <h1 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.02em] leading-tight">
              {it.titre}
            </h1>
            {it.description && (
              <p className="mt-3 whitespace-pre-wrap text-[0.92rem] leading-relaxed text-[color:var(--ink)]">
                {it.description}
              </p>
            )}
            <dl className="mt-5 grid grid-cols-2 gap-y-2 text-[0.82rem] sm:grid-cols-4 sm:gap-x-6">
              {it.localisation && (
                <div>
                  <dt className="label-admin">Lieu</dt>
                  <dd className="mt-1">{it.localisation}</dd>
                </div>
              )}
              {it.assigneA && (
                <div>
                  <dt className="label-admin">Assigné à</dt>
                  <dd className="mt-1">{it.assigneA}</dd>
                </div>
              )}
              {it.echeance && (
                <div>
                  <dt className="label-admin">Échéance</dt>
                  <dd
                    className="mt-1 font-semibold tabular-nums"
                    style={{
                      color:
                        it.echeance < new Date() &&
                        it.statut !== "fait" &&
                        it.statut !== "annule"
                          ? "var(--minium)"
                          : undefined,
                    }}
                  >
                    {fmtDate(it.echeance)?.split(" à ")[0] ?? ""}
                  </dd>
                </div>
              )}
              <div>
                <dt className="label-admin">Créé</dt>
                <dd className="mt-1 font-mono text-[0.78rem]">
                  {fmtDate(it.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Photos */}
          {it.photos.length > 0 && (
            <div className="border-t border-dashed border-rule/60 px-7 py-5 sm:px-10">
              <p className="label-admin mb-3">Photos ({it.photos.length})</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {it.photos.map((cle, i) => (
                  <a
                    key={cle}
                    href={`/api/interventions/photos?cle=${encodeURIComponent(cle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/interventions/photos?cle=${encodeURIComponent(cle)}`}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Risque lié */}
          {it.risqueLibelle && (
            <div className="border-t border-dashed border-rule/60 bg-[color:var(--warm-soft)] px-7 py-4 sm:px-10">
              <p className="label-admin text-[color:var(--warm)]">
                Risque DUERP lié
              </p>
              <p className="mt-1 text-[0.9rem] font-medium text-[color:var(--ink)]">
                {it.risqueLibelle}
              </p>
            </div>
          )}
        </article>

        {/* Statut + actions */}
        <section className="mt-10 cartouche p-6">
          <p className="label-admin">Cycle de vie</p>
          <div className="mt-4 space-y-4">
            {it.statut !== "fait" && it.statut !== "annule" && (
              <div className="space-y-3">
                <div>
                  <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Changer le statut
                  </p>
                  <ChangerStatutButtons
                    etablissementId={id}
                    interventionId={it.id}
                    statut={it.statut}
                  />
                </div>
                <div className="border-t border-dashed border-rule/50 pt-4">
                  <CloturerTicketForm
                    etablissementId={id}
                    interventionId={it.id}
                    risqueLieLibelle={it.risqueLibelle}
                  />
                </div>
              </div>
            )}
            {(it.statut === "fait" || it.statut === "annule") && (
              <div className="space-y-3">
                <div className="rounded-lg bg-[color:var(--accent-vif-soft)] p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--accent-vif)]">
                    {it.statut === "fait" ? "✓ Terminé" : "Annulé"}
                  </p>
                  {it.dateCloture && (
                    <p className="mt-1 text-[0.82rem] text-muted-foreground">
                      Le {fmtDate(it.dateCloture)}
                    </p>
                  )}
                  {it.motifCloture && (
                    <p className="mt-2 whitespace-pre-wrap text-[0.88rem] text-[color:var(--ink)]">
                      {it.motifCloture}
                    </p>
                  )}
                </div>
                <ChangerStatutButtons
                  etablissementId={id}
                  interventionId={it.id}
                  statut={it.statut}
                />
              </div>
            )}
          </div>
        </section>

        {/* Commentaires */}
        <section className="mt-10">
          <header className="mb-4">
            <p className="label-admin">
              Commentaires ({it.commentaires.length})
            </p>
            <h2 className="mt-1 text-[1.15rem] font-semibold tracking-[-0.015em]">
              Historique et mises à jour
            </h2>
          </header>

          {it.commentaires.length > 0 && (
            <ul className="mb-5 space-y-3">
              {it.commentaires.map((c) => (
                <li key={c.id} className="cartouche p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[0.88rem] font-semibold">{c.auteurNom}</p>
                    <p className="font-mono text-[0.68rem] text-muted-foreground">
                      {fmtDate(c.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[0.88rem] leading-relaxed text-[color:var(--ink)]">
                    {c.contenu}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="cartouche p-5">
            <CommentaireForm
              etablissementId={id}
              interventionId={it.id}
              auteurDefaut={user?.email ?? null}
            />
          </div>
        </section>

        {/* Retour */}
        <footer className="mt-10">
          <Link
            href={`/etablissements/${id}/interventions`}
            className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-ink"
          >
            ← Retour au tableau
          </Link>
        </footer>
      </main>
    </>
  );
}
