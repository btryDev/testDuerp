import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, SignatureBlock, StatusPill } from "@/components/ui-kit";
import { DemanderSignatureForm } from "@/components/signatures/DemanderSignatureForm";
import {
  BoutonDemarrer,
  BoutonSupprimer,
  BoutonTerminer,
} from "@/components/permis-feu/PermisFeuActions";
import { getPermisFeu } from "@/lib/permis-feu/queries";
import { LABEL_NATURE } from "@/lib/permis-feu/schema";
import {
  GROUPES_LABEL,
  MESURES_PERMIS_FEU,
  mesuresParGroupe,
} from "@/lib/permis-feu/referentiel";
import { requireEtablissement } from "@/lib/auth/scope";

function formatDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function dureeHhMm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export default async function PermisFeuDetailPage({
  params,
}: {
  params: Promise<{ id: string; permisFeuId: string }>;
}) {
  const { id, permisFeuId } = await params;
  const { etablissement } = await requireEtablissement(id);
  const permis = await getPermisFeu(id, permisFeuId);
  if (!permis) notFound();

  const mesuresCochees = new Set(permis.mesuresValidees);
  const groupes = mesuresParGroupe();

  // Signatures : on attend 2 signatures (donneur + prestataire).
  const signatureDonneur = permis.signatures.find(
    (s) => s.signataireEmail !== permis.prestataireEmail,
  );
  const signaturePrestataire = permis.signatures.find(
    (s) => s.signataireEmail === permis.prestataireEmail,
  );

  const statutVisuel =
    permis.statut === "valide" || permis.statut === "termine"
      ? "a_jour"
      : permis.statut === "en_cours"
        ? "non_conforme"
        : permis.statut === "attente_signatures"
          ? "a_planifier"
          : "non_applicable";

  return (
    <>
      <AppTopbar
        title={`Permis de feu PF-${String(permis.numero).padStart(3, "0")}`}
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { href: `/etablissements/${id}/permis-feu`, label: "Permis de feu" },
          { label: `PF-${String(permis.numero).padStart(3, "0")}` },
        ]}
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-16">
        {/* Hero permis */}
        <article className="cartouche relative overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{
              background:
                permis.statut === "en_cours"
                  ? "var(--minium)"
                  : permis.statut === "valide" || permis.statut === "termine"
                    ? "var(--accent-vif)"
                    : "oklch(0.72 0.15 70)",
            }}
          />
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            <div className="border-b border-dashed border-rule/60 px-7 py-7 md:border-b-0 md:border-r md:px-10 md:py-10">
              <p className="label-admin">
                Permis de feu · PF-{String(permis.numero).padStart(3, "0")}
              </p>
              <h1 className="mt-3 text-[1.8rem] font-semibold leading-tight tracking-[-0.025em]">
                {permis.prestataireRaison}
              </h1>
              <p className="mt-1 text-[0.92rem] text-muted-foreground">
                {permis.lieu}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {permis.naturesTravaux.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-[color:color-mix(in_oklch,var(--minium)_10%,transparent)] px-2.5 py-1 text-[0.72rem] font-medium text-[color:var(--minium)]"
                  >
                    {LABEL_NATURE[n]}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 bg-[color:var(--paper-sunk)] px-7 py-7 md:px-10 md:py-10">
              <StatusPill status={statutVisuel} />
              <dl className="space-y-2 text-[0.82rem]">
                <div>
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Début
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {formatDateTime(permis.dateDebut)}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Fin
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {formatDateTime(permis.dateFin)}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Surveillance post-travaux
                  </dt>
                  <dd className="font-semibold tabular-nums text-[color:var(--minium)]">
                    {dureeHhMm(permis.dureeSurveillanceMinutes)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="border-t border-dashed border-rule/60 px-7 py-5 sm:px-10">
            <p className="label-admin mb-2">Description des travaux</p>
            <p className="whitespace-pre-wrap text-[0.92rem] leading-relaxed">
              {permis.descriptionTravaux}
            </p>
          </div>
        </article>

        {/* Signatures */}
        <section className="mt-10">
          <header className="mb-5">
            <p className="label-admin">Signatures électroniques</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              {permis.signatures.length < 2
                ? `${2 - permis.signatures.length} signature${2 - permis.signatures.length > 1 ? "s" : ""} manquante${2 - permis.signatures.length > 1 ? "s" : ""}`
                : "Permis co-signé et valide"}
            </h2>
          </header>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Donneur d'ordre */}
            <div>
              <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
                Donneur d&apos;ordre · {permis.donneurOrdreNom}
              </p>
              {signatureDonneur ? (
                <SignatureBlock
                  signataireNom={signatureDonneur.signataireNom}
                  signataireRole={signatureDonneur.signataireRole}
                  signataireEmail={signatureDonneur.signataireEmail}
                  horodatageIso={signatureDonneur.horodatageIso}
                  methode={signatureDonneur.methode}
                  hashDocument={signatureDonneur.hashDocument}
                  nomDocument={signatureDonneur.nomDocument}
                  signatureId={signatureDonneur.id}
                  verifierHref={`/verifier/${signatureDonneur.id}`}
                />
              ) : (
                <div className="cartouche-sunk p-4">
                  <p className="text-[0.85rem] text-muted-foreground">
                    En attente de votre signature côté site.
                  </p>
                  <div className="mt-3">
                    <DemanderSignatureForm
                      etablissementId={id}
                      objetType="permis_feu"
                      objetId={permis.id}
                      libelleDocument={`Permis de feu PF-${String(permis.numero).padStart(3, "0")} — ${permis.prestataireRaison}`}
                      emailDefaut={undefined}
                      nomDefaut={permis.donneurOrdreNom}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prestataire */}
            <div>
              <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
                Prestataire · {permis.prestataireContact}
              </p>
              {signaturePrestataire ? (
                <SignatureBlock
                  signataireNom={signaturePrestataire.signataireNom}
                  signataireRole={signaturePrestataire.signataireRole}
                  signataireEmail={signaturePrestataire.signataireEmail}
                  horodatageIso={signaturePrestataire.horodatageIso}
                  methode={signaturePrestataire.methode}
                  hashDocument={signaturePrestataire.hashDocument}
                  nomDocument={signaturePrestataire.nomDocument}
                  signatureId={signaturePrestataire.id}
                  verifierHref={`/verifier/${signaturePrestataire.id}`}
                />
              ) : (
                <div className="cartouche-sunk p-4">
                  <p className="text-[0.85rem] text-muted-foreground">
                    En attente de la signature du technicien{" "}
                    <span className="font-mono text-[color:var(--ink)]">
                      {permis.prestataireEmail}
                    </span>
                    .
                  </p>
                  <div className="mt-3">
                    <DemanderSignatureForm
                      etablissementId={id}
                      objetType="permis_feu"
                      objetId={permis.id}
                      libelleDocument={`Permis de feu PF-${String(permis.numero).padStart(3, "0")} — ${permis.prestataireRaison}`}
                      emailDefaut={permis.prestataireEmail}
                      nomDefaut={permis.prestataireContact}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cycle de vie */}
        <section className="mt-10 cartouche p-6">
          <p className="label-admin">Cycle de vie</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {permis.statut === "attente_signatures" &&
              permis.signatures.length >= 2 && (
                <BoutonDemarrer permisFeuId={permis.id} />
              )}
            {permis.statut === "valide" && (
              <BoutonDemarrer permisFeuId={permis.id} />
            )}
            {permis.statut === "en_cours" && (
              <>
                <span className="inline-flex items-center gap-2 rounded-full bg-[color:color-mix(in_oklch,var(--minium)_12%,transparent)] px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--minium)]">
                  🔥 Travaux en cours · surveillance {dureeHhMm(permis.dureeSurveillanceMinutes)}
                </span>
                <BoutonTerminer permisFeuId={permis.id} />
              </>
            )}
            {permis.statut === "termine" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-vif-soft)] px-3 py-1 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent-vif)]">
                ✓ Travaux terminés · aucun départ de feu
              </span>
            )}
            <BoutonSupprimer permisFeuId={permis.id} />
          </div>
        </section>

        {/* Checklist mesures (lecture seule + stats) */}
        <section className="mt-10">
          <header className="mb-5">
            <p className="label-admin">Check-list INRS ED 6030</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              Mesures validées ({permis.mesuresValidees.length}/{MESURES_PERMIS_FEU.length})
            </h2>
          </header>

          <div className="space-y-4">
            {(["avant", "pendant", "apres"] as const).map((g) => (
              <div key={g} className="cartouche p-5">
                <p className="text-[0.9rem] font-semibold">
                  {GROUPES_LABEL[g].label}
                </p>
                <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
                  {GROUPES_LABEL[g].sous}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {groupes[g].map((m) => {
                    const ok = mesuresCochees.has(m.id);
                    return (
                      <li
                        key={m.id}
                        className="flex items-start gap-2 text-[0.85rem]"
                      >
                        <span
                          aria-hidden
                          className={
                            "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[0.66rem] " +
                            (ok
                              ? "bg-[color:var(--accent-vif)] text-white"
                              : "bg-[color:var(--paper-sunk)] text-[color:var(--seal)]")
                          }
                        >
                          {ok ? "✓" : "○"}
                        </span>
                        <span
                          className={
                            ok
                              ? "text-[color:var(--ink)]"
                              : "text-muted-foreground line-through decoration-dashed"
                          }
                        >
                          {m.libelle}
                        </span>
                        {m.priorite === "obligatoire" && !ok && (
                          <span className="ml-auto shrink-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--minium)]">
                            non cochée
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {permis.mesuresNotes && (
            <div className="mt-4 rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] p-4">
              <p className="label-admin mb-2">Notes de prévention</p>
              <p className="whitespace-pre-wrap text-[0.88rem] text-[color:var(--ink)]">
                {permis.mesuresNotes}
              </p>
            </div>
          )}
        </section>

        {/* Rappel légal */}
        <footer className="mt-10">
          <LegalBadge
            reference="INRS ED 6030 · APSAD R43 · Art. R4224-17 CT"
            defaultOpen
          >
            Le permis de feu engage conjointement l&apos;entreprise utilisatrice
            et l&apos;entreprise extérieure. Il fait foi de l&apos;analyse de
            risque menée avant travaux et des mesures prises. En cas de sinistre,
            ce document est le premier demandé par l&apos;assureur.
          </LegalBadge>
        </footer>
      </main>
    </>
  );
}

