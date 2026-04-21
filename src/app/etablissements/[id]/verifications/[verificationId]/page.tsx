import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
import { BadgeResultat } from "@/components/rapports/BadgeResultat";
import { SupprimerRapportButton } from "@/components/rapports/SupprimerRapportButton";
import { UploadRapportForm } from "@/components/rapports/UploadRapportForm";
import { BadgeStatutAction } from "@/components/actions/BadgeStatutAction";
import { CreerActionVerifForm } from "@/components/actions/CreerActionVerifForm";
import { getVerification } from "@/lib/calendrier/queries";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  LABEL_REALISATEUR,
} from "@/lib/calendrier/labels";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import { obligationParId } from "@/lib/referentiels/conformite";
import { uploadRapport } from "@/lib/rapports/actions";
import { creerActionDepuisVerification } from "@/lib/actions/plan";
import { prisma } from "@/lib/prisma";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string; verificationId: string }>;
}) {
  const { id, verificationId } = await params;
  const v = await getVerification(verificationId);
  if (!v || v.etablissementId !== id) notFound();

  const obligation = obligationParId(v.obligationId);
  const actionsLiees = await prisma.action.findMany({
    where: { verificationId: v.id },
    orderBy: [{ statut: "asc" }, { echeance: "asc" }],
  });
  const boundCreerAction = creerActionDepuisVerification.bind(null, v.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}/calendrier`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Calendrier
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Vérification</p>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.02em] leading-tight">
            {v.libelleObligation}
          </h1>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <BadgeStatut statut={v.statut} />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
              {obligation ? LABEL_DOMAINE[obligation.domaine] : "—"}
              <span className="mx-2 text-rule">·</span>
              {LABEL_PERIODICITE[v.periodicite]}
            </span>
          </div>
        </div>
      </header>

      <div className="filet-pointille my-10" />

      {/* Échéances */}
      <section className="cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Échéances
          </p>
        </div>
        <dl className="divide-y divide-dashed divide-rule/50 text-[0.9rem]">
          <div className="flex justify-between px-6 py-3 sm:px-8">
            <dt className="text-muted-foreground">Prochaine échéance</dt>
            <dd className="font-semibold">{formatDate(v.datePrevue)}</dd>
          </div>
          {v.dateRealisee && (
            <div className="flex justify-between px-6 py-3 sm:px-8">
              <dt className="text-muted-foreground">Dernière réalisation</dt>
              <dd>{formatDate(v.dateRealisee)}</dd>
            </div>
          )}
          <div className="flex justify-between px-6 py-3 sm:px-8">
            <dt className="text-muted-foreground">Périodicité</dt>
            <dd>{LABEL_PERIODICITE[v.periodicite]}</dd>
          </div>
        </dl>
      </section>

      {/* Équipement */}
      <section className="mt-6 cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Équipement concerné
          </p>
        </div>
        <div className="space-y-1 px-6 py-5 sm:px-8">
          <p className="text-[0.95rem] font-semibold">{v.equipement.libelle}</p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            {LABEL_CATEGORIE_EQUIPEMENT[v.equipement.categorie]}
            {v.equipement.localisation && (
              <>
                <span className="mx-2 text-rule">·</span>
                {v.equipement.localisation}
              </>
            )}
          </p>
          <p className="pt-2">
            <Link
              href={`/etablissements/${id}/equipements/${v.equipement.id}/modifier`}
              className="text-[0.82rem] underline underline-offset-2"
            >
              Modifier l&apos;équipement
            </Link>
          </p>
        </div>
      </section>

      {/* Réalisateur */}
      <section className="mt-6 cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Réalisateur requis
          </p>
        </div>
        <ul className="divide-y divide-dashed divide-rule/50">
          {v.realisateurRequis.map((r) => (
            <li
              key={r}
              className="px-6 py-3 text-[0.9rem] sm:px-8"
            >
              {LABEL_REALISATEUR[r]}
            </li>
          ))}
        </ul>
      </section>

      {/* Références légales + raisons */}
      {obligation && (
        <section className="mt-6 cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Références légales
            </p>
            {obligation.description && (
              <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                {obligation.description}
              </p>
            )}
          </div>
          <ul className="divide-y divide-dashed divide-rule/50 text-[0.9rem]">
            {obligation.referencesLegales.map((ref, idx) => (
              <li
                key={idx}
                className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 sm:px-8"
              >
                <span>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {ref.source}
                  </span>
                  <span className="ml-3">{ref.reference}</span>
                </span>
                {ref.urlLegifrance && (
                  <a
                    href={ref.urlLegifrance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.8rem] underline underline-offset-2"
                  >
                    Consulter →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Rapports déjà déposés */}
      <section className="mt-10 space-y-4">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.012em]">
          Rapports déposés
          <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            · {v.rapports.length}
          </span>
        </h2>

        {v.rapports.length === 0 ? (
          <div className="cartouche px-6 py-5 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucun rapport n&apos;a encore été déposé pour cette vérification.
              Utilisez le formulaire ci-dessous pour enregistrer un rapport
              et marquer la vérification comme réalisée.
            </p>
          </div>
        ) : (
          <ul className="cartouche divide-y divide-dashed divide-rule/50">
            {v.rapports.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-4 px-6 py-4 sm:px-8"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[0.95rem] font-semibold">
                    {formatDate(r.dateRapport)}
                    {r.organismeVerif && (
                      <span className="ml-2 text-muted-foreground">
                        · {r.organismeVerif}
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.fichierNomOriginal}
                  </p>
                  {r.commentaires && (
                    <p className="text-[0.82rem] text-muted-foreground">
                      {r.commentaires}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <BadgeResultat resultat={r.resultat} />
                  <div className="flex gap-2">
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
                    <SupprimerRapportButton id={r.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions correctives liées */}
      <section className="mt-10 space-y-4">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.012em]">
          Actions correctives
          <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            · {actionsLiees.length}
          </span>
        </h2>

        {actionsLiees.length > 0 && (
          <ul className="cartouche divide-y divide-dashed divide-rule/50">
            {actionsLiees.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-4 px-6 py-3 sm:px-8"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.92rem] font-semibold">{a.libelle}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Échéance : {formatDate(a.echeance) ?? "—"}
                    {a.responsable && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        {a.responsable}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <BadgeStatutAction statut={a.statut} />
                  <Link
                    href={`/etablissements/${id}/actions/${a.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Détail
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <details className="cartouche overflow-hidden">
          <summary className="cursor-pointer select-none border-b border-dashed border-rule/60 px-6 py-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground sm:px-8">
            + Créer une action corrective
          </summary>
          <div className="px-6 py-6 sm:px-8">
            <CreerActionVerifForm action={boundCreerAction} />
          </div>
        </details>
      </section>

      {/* Formulaire d'upload */}
      <section className="mt-10 cartouche overflow-hidden">
        <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Déposer un rapport
          </p>
          <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
            L&apos;enregistrement du rapport marque la vérification comme
            réalisée et régénère automatiquement la prochaine échéance.
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <UploadRapportForm
            action={uploadRapport.bind(null, v.id)}
            labelAnnuler={{
              libelle: "Annuler",
              href: `/etablissements/${id}/calendrier`,
            }}
          />
        </div>
      </section>
    </main>
  );
}
