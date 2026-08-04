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
import { DemanderSignatureForm } from "@/components/signatures/DemanderSignatureForm";
import { SignatureBlock } from "@/components/ui-kit";
import { listSignatures } from "@/lib/signatures/queries";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateCourte(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function joursEntre(d: Date): number {
  const now = new Date();
  const msJour = 1000 * 60 * 60 * 24;
  return Math.round((d.getTime() - now.getTime()) / msJour);
}

/**
 * Bande colorée en tête d'un cartouche — signe visuel du statut sans
 * ajouter de label redondant. Les couleurs viennent des tokens du design
 * system (cf. src/app/globals.css).
 */
function BandeStatut({ statut }: { statut: string }) {
  const color =
    statut === "depassee" || statut === "realisee_ecart_majeur"
      ? "var(--minium)"
      : statut === "realisee_observations" || statut === "a_planifier"
        ? "oklch(0.72 0.15 70)"
        : "var(--accent-vif)";
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 top-0 h-[3px]"
      style={{ background: color }}
    />
  );
}

function BandeResultat({ resultat }: { resultat: string }) {
  const color =
    resultat === "ecart_majeur"
      ? "var(--minium)"
      : resultat === "observations_mineures"
        ? "oklch(0.72 0.15 70)"
        : resultat === "non_verifiable"
          ? "var(--seal)"
          : "var(--accent-vif)";
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 top-0 h-[3px]"
      style={{ background: color }}
    />
  );
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
  const boundUpload = uploadRapport.bind(null, v.id);

  // Signatures posées sur chaque rapport de cette vérification.
  const signaturesParRapport = new Map<
    string,
    Awaited<ReturnType<typeof listSignatures>>
  >();
  for (const r of v.rapports) {
    signaturesParRapport.set(
      r.id,
      await listSignatures("rapport_verification", r.id),
    );
  }

  const joursRestants = joursEntre(v.datePrevue);
  const enRetard = joursRestants < 0 && !v.dateRealisee;
  const urgent = joursRestants >= 0 && joursRestants <= 30 && !v.dateRealisee;
  const aUnRapport = v.rapports.length > 0;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      {/* Retour */}
      <nav className="mb-10">
        <Link
          href={`/etablissements/${id}/calendrier`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Calendrier
        </Link>
      </nav>

      {/* ╔══════════════════════════════════════════════════════════════╗
          HERO — dossier d'identification de la vérification
          ╚══════════════════════════════════════════════════════════════╝ */}
      <article className="cartouche relative overflow-hidden">
        <BandeStatut statut={v.statut} />

        {/* Kicker obligation */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-7 pb-2 pt-8 sm:px-10">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--seal)]">
            {obligation ? LABEL_DOMAINE[obligation.domaine] : "Vérification"}
            <span className="mx-2 text-rule">·</span>
            {LABEL_PERIODICITE[v.periodicite]}
          </p>
          <BadgeStatut statut={v.statut} />
        </div>

        {/* Titre + contexte échéance */}
        <div className="px-7 pb-6 pt-1 sm:px-10">
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.025em] leading-[1.1] text-ink sm:text-[2rem]">
            {v.libelleObligation}
          </h1>
          {obligation?.description && (
            <p className="mt-3 max-w-prose text-[0.92rem] leading-relaxed text-muted-foreground">
              {obligation.description}
            </p>
          )}

          {/* Alerte contextuelle d'échéance — grosse typo narrative */}
          {(enRetard || urgent) && (
            <p
              className="mt-5 font-mono text-[0.78rem] uppercase tracking-[0.1em]"
              style={{
                color: enRetard
                  ? "var(--minium)"
                  : "oklch(0.48 0.14 60)",
              }}
            >
              {enRetard
                ? `Échéance dépassée de ${Math.abs(joursRestants)} j. À régulariser dès que possible.`
                : `Échéance dans ${joursRestants} j.`}
            </p>
          )}
        </div>

        {/* Grille 3 colonnes — échéances + équipement + réalisateur */}
        <div className="grid grid-cols-1 divide-y divide-dashed divide-rule/60 border-t border-dashed border-rule/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Échéance */}
          <div className="px-7 py-5 sm:px-6">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              Prochaine échéance
            </p>
            <p className="mt-1.5 text-[1rem] font-semibold tabular-nums">
              {formatDateCourte(v.datePrevue)}
            </p>
            {v.dateRealisee && (
              <p className="mt-0.5 text-[0.74rem] text-muted-foreground">
                Dernière : {formatDateCourte(v.dateRealisee)}
              </p>
            )}
          </div>

          {/* Équipement */}
          <div className="px-7 py-5 sm:px-6">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              Équipement
            </p>
            <p className="mt-1.5 text-[1rem] font-semibold leading-tight">
              {v.equipement.libelle}
            </p>
            <p className="mt-0.5 text-[0.74rem] text-muted-foreground">
              {LABEL_CATEGORIE_EQUIPEMENT[v.equipement.categorie]}
              {v.equipement.localisation && ` · ${v.equipement.localisation}`}
            </p>
            <Link
              href={`/etablissements/${id}/equipements/${v.equipement.id}/modifier`}
              className="mt-1 inline-block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--warm)] hover:underline"
            >
              Modifier →
            </Link>
          </div>

          {/* Réalisateur */}
          <div className="px-7 py-5 sm:px-6">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              Réalisateur requis
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[0.88rem]">
              {v.realisateurRequis.map((r) => (
                <li key={r} className="font-medium">
                  {LABEL_REALISATEUR[r]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Références légales — tiroir pliable pour ne pas écraser */}
        {obligation && obligation.referencesLegales.length > 0 && (
          <details className="group border-t border-dashed border-rule/60">
            <summary className="flex cursor-pointer select-none items-center justify-between px-7 py-3 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-ink sm:px-10">
              <span>
                § Références légales
                <span className="ml-2 text-rule">
                  · {obligation.referencesLegales.length}
                </span>
              </span>
              <span
                aria-hidden
                className="text-[0.7rem] transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <ul className="divide-y divide-dashed divide-rule/50 border-t border-dashed border-rule/40 text-[0.88rem]">
              {obligation.referencesLegales.map((ref, idx) => (
                <li
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-2 px-7 py-3 sm:px-10"
                >
                  <span>
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
                      {ref.source}
                    </span>
                    <span className="ml-3">{ref.reference}</span>
                  </span>
                  {ref.urlLegifrance && (
                    <a
                      href={ref.urlLegifrance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.8rem] text-[color:var(--warm)] underline-offset-2 hover:underline"
                    >
                      Consulter →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </article>

      {/* ╔══════════════════════════════════════════════════════════════╗
          RAPPORTS — cœur de la page
          État vide = appel à l'action + formulaire d'upload unifiés
          État rempli = cartes-documents + bouton ajouter dans header
          ╚══════════════════════════════════════════════════════════════╝ */}
      <section className="mt-14">
        {aUnRapport ? (
          <>
            {/* Header */}
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[color:var(--seal)]">
                  Dossier
                </p>
                <h2 className="mt-1 text-[1.25rem] font-semibold tracking-[-0.015em]">
                  Rapports déposés
                  <span className="ml-2 font-mono text-[0.72rem] text-muted-foreground">
                    {v.rapports.length}
                  </span>
                </h2>
              </div>
              <details className="group">
                <summary
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  }) + " cursor-pointer"}
                >
                  <span className="group-open:hidden">+ Nouveau rapport</span>
                  <span className="hidden group-open:inline">Annuler</span>
                </summary>
                {/* Form d'upload caché par défaut, s'ouvre au clic */}
                <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-[color:var(--warm)]/40 bg-[color:var(--paper-sunk)] md:min-w-[520px]">
                  <div className="border-b border-dashed border-rule/60 px-6 py-4">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[color:var(--warm)]">
                      Nouveau rapport
                    </p>
                    <p className="mt-1 text-[0.82rem] text-muted-foreground">
                      Un rapport additionnel met à jour la date de réalisation et régénère la prochaine échéance.
                    </p>
                  </div>
                  <div className="px-6 py-6">
                    <UploadRapportForm
                      action={boundUpload}
                      labelAnnuler={undefined}
                    />
                  </div>
                </div>
              </details>
            </header>

            {/* Liste des rapports */}
            <ul className="space-y-5">
              {v.rapports.map((r, idx) => {
                const sigs = signaturesParRapport.get(r.id) ?? [];
                return (
                  <li key={r.id}>
                    <article className="cartouche relative overflow-hidden">
                      <BandeResultat resultat={r.resultat} />

                      {/* Entête document — date + badge résultat à droite */}
                      <div className="flex flex-wrap items-start justify-between gap-4 px-7 pb-5 pt-7 sm:px-8">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-baseline gap-3">
                            <span className="font-mono text-[1.65rem] font-light leading-none tabular-nums text-[color:var(--seal)]">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <p className="text-[1.05rem] font-semibold leading-tight">
                                Rapport du {formatDate(r.dateRapport)}
                              </p>
                              {r.organismeVerif && (
                                <p className="text-[0.85rem] text-muted-foreground">
                                  par {r.organismeVerif}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <BadgeResultat resultat={r.resultat} />
                      </div>

                      {/* Corps — fichier + commentaires */}
                      <div className="border-t border-dashed border-rule/60 px-7 py-4 sm:px-8">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="grid h-10 w-8 shrink-0 place-items-end rounded-[4px] bg-paper-sunk p-1 text-[0.52rem] font-mono uppercase text-muted-foreground"
                            style={{
                              boxShadow: "inset 0 0 0 1px var(--rule)",
                            }}
                          >
                            PDF
                          </span>
                          <span className="truncate font-mono text-[0.82rem] text-ink">
                            {r.fichierNomOriginal}
                          </span>
                        </div>
                        {r.commentaires && (
                          <p className="mt-3 text-[0.88rem] leading-relaxed text-ink/90">
                            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                              Observations —&nbsp;
                            </span>
                            {r.commentaires}
                          </p>
                        )}
                      </div>

                      {/* Actions — une rangée, claire */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-rule/60 px-7 py-3 sm:px-8">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/api/rapports/${r.id}/fichier`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            Ouvrir le fichier ↗
                          </a>
                          <DemanderSignatureForm
                            etablissementId={id}
                            objetType="rapport_verification"
                            objetId={r.id}
                            libelleDocument={`${v.libelleObligation} — rapport du ${formatDate(r.dateRapport)}`}
                          />
                        </div>
                        <SupprimerRapportButton id={r.id} />
                      </div>

                      {/* Signatures — empilées dans le document, pas à côté */}
                      {sigs.length > 0 && (
                        <div className="space-y-3 border-t border-dashed border-rule/60 bg-[color:var(--paper-sunk)]/60 px-7 py-5 sm:px-8">
                          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[color:var(--accent-vif)]">
                            ✓ {sigs.length}{" "}
                            {sigs.length > 1 ? "signatures" : "signature"}
                          </p>
                          <div className="space-y-3">
                            {sigs.map((s) => (
                              <SignatureBlock
                                key={s.id}
                                signataireNom={s.signataireNom}
                                signataireRole={s.signataireRole}
                                signataireEmail={s.signataireEmail}
                                horodatageIso={s.horodatageIso}
                                methode={s.methode}
                                hashDocument={s.hashDocument}
                                nomDocument={s.nomDocument}
                                signatureId={s.id}
                                verifierHref={`/verifier/${s.id}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          /* ÉTAT VIDE — CTA + formulaire fusionnés dans un même cartouche */
          <article className="cartouche relative overflow-hidden">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: "var(--warm)" }}
            />
            <div className="grid gap-0 md:grid-cols-[0.85fr_1fr]">
              {/* Colonne gauche : pitch visuel */}
              <div className="flex flex-col justify-between gap-8 border-b border-dashed border-rule/60 bg-[color:var(--warm-soft)] px-8 py-10 md:border-b-0 md:border-r">
                <div className="space-y-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--warm)]">
                    En attente
                  </p>
                  <h2 className="text-[1.45rem] font-semibold tracking-[-0.02em] leading-tight text-ink">
                    Cette vérification attend son rapport.
                  </h2>
                  <p className="text-[0.9rem] leading-relaxed text-ink/80">
                    Dès que vous téléversez le rapport du vérificateur, la
                    vérification est marquée comme réalisée et la prochaine
                    échéance est recalculée automatiquement.
                  </p>
                </div>

                {/* Mini-checklist de préparation */}
                <ul className="space-y-2 text-[0.84rem] text-ink/80">
                  {[
                    "Le fichier du rapport (PDF de préférence)",
                    "La date de réalisation",
                    "Le résultat constaté",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-[7px] inline-block h-1 w-3 rounded-full bg-[color:var(--warm)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {obligation?.referencesLegales[0]?.reference ??
                    "Obligation réglementaire"}
                </p>
              </div>

              {/* Colonne droite : formulaire */}
              <div className="bg-[color:var(--paper-elevated)] px-7 py-8 sm:px-9">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--seal)]">
                  Déposer le rapport
                </p>
                <div className="mt-5">
                  <UploadRapportForm
                    action={boundUpload}
                    labelAnnuler={{
                      libelle: "Annuler",
                      href: `/etablissements/${id}/calendrier`,
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        )}
      </section>

      {/* ╔══════════════════════════════════════════════════════════════╗
          ACTIONS CORRECTIVES — visuel discret en pied de page
          ╚══════════════════════════════════════════════════════════════╝ */}
      <section className="mt-14">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-[color:var(--seal)]">
              Levées d&apos;écart
            </p>
            <h2 className="mt-1 text-[1.25rem] font-semibold tracking-[-0.015em]">
              Actions correctives
              {actionsLiees.length > 0 && (
                <span className="ml-2 font-mono text-[0.72rem] text-muted-foreground">
                  {actionsLiees.length}
                </span>
              )}
            </h2>
          </div>
          {actionsLiees.length > 0 && (
            <details className="group">
              <summary
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                }) + " cursor-pointer"}
              >
                <span className="group-open:hidden">+ Créer une action</span>
                <span className="hidden group-open:inline">Annuler</span>
              </summary>
              <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-[color:var(--rule)] bg-[color:var(--paper-sunk)] md:min-w-[520px]">
                <div className="px-6 py-6">
                  <CreerActionVerifForm action={boundCreerAction} />
                </div>
              </div>
            </details>
          )}
        </header>

        {actionsLiees.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {actionsLiees.map((a) => {
              const enRetardAction =
                a.echeance && a.echeance < new Date() && a.statut !== "levee";
              return (
                <li key={a.id}>
                  <Link
                    href={`/etablissements/${id}/actions/${a.id}`}
                    className="cartouche group block h-full p-5 transition-colors hover:bg-paper-sunk"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[0.92rem] font-semibold leading-snug">
                        {a.libelle}
                      </p>
                      <BadgeStatutAction statut={a.statut} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em]">
                      <span
                        style={{
                          color: enRetardAction
                            ? "var(--minium)"
                            : "var(--muted-foreground)",
                        }}
                      >
                        {a.echeance
                          ? `Échéance ${formatDateCourte(a.echeance)}`
                          : "Pas d'échéance"}
                      </span>
                      {a.responsable && (
                        <>
                          <span className="text-rule">·</span>
                          <span className="text-muted-foreground">
                            {a.responsable}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="mt-3 inline-block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--warm)] opacity-60 transition-opacity group-hover:opacity-100">
                      Ouvrir →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          /* État vide actions — petit cartouche invitation */
          <details className="cartouche-sunk group overflow-hidden">
            <summary className="flex cursor-pointer select-none items-center justify-between px-6 py-5 sm:px-8">
              <div>
                <p className="text-[0.92rem] font-medium">
                  Aucun écart à lever pour l&apos;instant.
                </p>
                <p className="mt-0.5 text-[0.82rem] text-muted-foreground">
                  Créez une action corrective si le rapport mentionne une
                  observation à traiter.
                </p>
              </div>
              <span
                className={
                  buttonVariants({ variant: "outline", size: "sm" }) +
                  " shrink-0"
                }
              >
                <span className="group-open:hidden">+ Créer</span>
                <span className="hidden group-open:inline">Annuler</span>
              </span>
            </summary>
            <div className="border-t border-dashed border-rule/60 bg-[color:var(--paper-elevated)] px-6 py-6 sm:px-8">
              <CreerActionVerifForm action={boundCreerAction} />
            </div>
          </details>
        )}
      </section>
    </main>
  );
}
