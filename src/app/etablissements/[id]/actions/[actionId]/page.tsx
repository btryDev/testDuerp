import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeOrigine } from "@/components/actions/BadgeOrigine";
import { BadgeStatutAction } from "@/components/actions/BadgeStatutAction";
import { CloturerActionForm } from "@/components/actions/CloturerActionForm";
import { SupprimerActionButton } from "@/components/actions/SupprimerActionButton";
import { cloturerAction } from "@/lib/actions/plan";
import { getAction, origineDeLAction } from "@/lib/actions/queries";
import { LABEL_TYPE_ACTION } from "@/lib/actions/labels";

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string; actionId: string }>;
}) {
  const { id, actionId } = await params;
  const a = await getAction(actionId);
  if (!a || a.etablissementId !== id) notFound();

  const origine = origineDeLAction(a);
  const boundCloture = cloturerAction.bind(null, actionId);
  const estOuverte = a.statut === "ouverte" || a.statut === "en_cours";
  // eslint-disable-next-line react-hooks/purity -- server component, Date.now() lu à chaque rendu
  const maintenant = Date.now();
  const echeanceDepassee =
    a.echeance && a.echeance.getTime() < maintenant && estOuverte;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}/actions`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Plan d&apos;actions
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Action corrective</p>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.02em] leading-tight">
            {a.libelle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <BadgeOrigine origine={origine} />
            <BadgeStatutAction statut={a.statut} />
            {echeanceDepassee && (
              <span className="inline-flex items-center rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-rose-900">
                échéance dépassée
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <SupprimerActionButton
            id={a.id}
            redirectTo={`/etablissements/${id}/actions`}
          />
        </div>
      </header>

      <div className="filet-pointille my-10" />

      {/* Détails */}
      <section className="cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Fiche
          </p>
        </div>
        <dl className="divide-y divide-dashed divide-rule/50 text-[0.9rem]">
          <div className="flex justify-between px-6 py-3 sm:px-8">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{LABEL_TYPE_ACTION[a.type]}</dd>
          </div>
          {a.criticite !== null && (
            <div className="flex justify-between px-6 py-3 sm:px-8">
              <dt className="text-muted-foreground">Criticité</dt>
              <dd>{a.criticite} / 5</dd>
            </div>
          )}
          <div className="flex justify-between px-6 py-3 sm:px-8">
            <dt className="text-muted-foreground">Échéance</dt>
            <dd>{formatDate(a.echeance)}</dd>
          </div>
          {a.responsable && (
            <div className="flex justify-between px-6 py-3 sm:px-8">
              <dt className="text-muted-foreground">Responsable</dt>
              <dd>{a.responsable}</dd>
            </div>
          )}
          {a.description && (
            <div className="px-6 py-3 sm:px-8">
              <dt className="text-muted-foreground">Description</dt>
              <dd className="mt-1">{a.description}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Origine DUERP */}
      {a.risque && (
        <section className="mt-6 cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Rattachement — DUERP
            </p>
          </div>
          <div className="space-y-1 px-6 py-5 sm:px-8 text-[0.9rem]">
            <p>
              <span className="text-muted-foreground">Risque : </span>
              {a.risque.libelle}
            </p>
            <p>
              <span className="text-muted-foreground">Unité : </span>
              {a.risque.unite.nom}
            </p>
            <p className="pt-2">
              <Link
                href={`/duerp/${a.risque.unite.duerp.id}/risques/${a.risque.unite.id}/${a.risque.id}/mesures`}
                className="text-[0.82rem] underline underline-offset-2"
              >
                Ouvrir le risque dans le DUERP →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Origine Vérification */}
      {a.verification && (
        <section className="mt-6 cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Rattachement — Vérification
            </p>
          </div>
          <div className="space-y-1 px-6 py-5 sm:px-8 text-[0.9rem]">
            <p className="font-semibold">
              {a.verification.libelleObligation}
            </p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              {a.verification.equipement.libelle}
            </p>
            <p className="pt-2">
              <Link
                href={`/etablissements/${id}/verifications/${a.verification.id}`}
                className="text-[0.82rem] underline underline-offset-2"
              >
                Ouvrir la vérification →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Clôture / historique */}
      {a.statut === "levee" ? (
        <section className="mt-6 cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Clôture
            </p>
          </div>
          <dl className="divide-y divide-dashed divide-rule/50 px-6 py-3 text-[0.9rem] sm:px-8">
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Levée le</dt>
              <dd>{formatDate(a.leveeLe)}</dd>
            </div>
            {a.leveeCommentaire && (
              <div className="py-3">
                <dt className="text-muted-foreground">Justificatif</dt>
                <dd className="mt-1">{a.leveeCommentaire}</dd>
              </div>
            )}
          </dl>
        </section>
      ) : (
        estOuverte && (
          <section className="mt-6 cartouche overflow-hidden">
            <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                Clôturer cette action
              </p>
            </div>
            <div className="px-6 py-6 sm:px-8">
              <CloturerActionForm
                action={boundCloture}
                rapportsDisponibles={a.verification?.rapports.map((r) => ({
                  id: r.id,
                  label: `${r.dateRapport.toLocaleDateString("fr-FR")} — ${
                    r.fichierNomOriginal
                  }`,
                }))}
              />
            </div>
          </section>
        )
      )}
    </main>
  );
}
