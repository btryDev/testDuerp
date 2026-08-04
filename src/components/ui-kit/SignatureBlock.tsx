import { cn } from "@/lib/utils";

/**
 * Scellé d'une signature électronique (ADR-006).
 * Affiché sous les documents signés (rapports, permis de feu, plans de
 * prévention…). Rend visibles les éléments de preuve : identité,
 * horodatage serveur, hash du document, méthode d'authentification.
 */
export function SignatureBlock({
  signataireNom,
  signataireRole,
  signataireEmail,
  horodatageIso,
  methode,
  hashDocument,
  nomDocument,
  signatureId,
  verifierHref,
}: {
  signataireNom: string;
  signataireRole?: string | null;
  signataireEmail?: string | null;
  horodatageIso: Date | string;
  methode: "compte_connecte" | "otp_email";
  hashDocument: string;
  nomDocument?: string | null;
  signatureId: string;
  verifierHref?: string;
}) {
  const date =
    typeof horodatageIso === "string" ? new Date(horodatageIso) : horodatageIso;
  const dateHumaine = date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
  const methodeLabel =
    methode === "compte_connecte" ? "Compte connecté + OTP" : "OTP email";
  const hashCourt =
    hashDocument.length > 16
      ? `${hashDocument.slice(0, 10)}…${hashDocument.slice(-6)}`
      : hashDocument;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)] p-5",
      )}
      role="group"
      aria-label={`Signature électronique de ${signataireNom}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--accent-vif)] bg-[color:var(--paper-elevated)] font-mono text-sm text-[color:var(--accent-vif)]"
          >
            ✓
          </span>
          <div>
            <div className="label-admin">Signé électroniquement</div>
            <div className="mt-0.5 text-[0.95rem] font-semibold text-[color:var(--ink)]">
              {signataireNom}
            </div>
            {signataireRole && (
              <div className="text-[0.82rem] text-[color:var(--muted-foreground)]">
                {signataireRole}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="label-admin">Horodatage serveur</div>
          <div className="mt-0.5 font-mono text-[0.82rem] text-[color:var(--ink)]">
            {dateHumaine}
          </div>
          <div className="text-[0.7rem] text-[color:var(--muted-foreground)]">
            Fuseau Europe/Paris
          </div>
        </div>
      </div>

      <div className="filet-pointille" />

      <dl className="grid grid-cols-1 gap-y-2 text-[0.78rem] sm:grid-cols-2 sm:gap-x-6">
        {signataireEmail && (
          <div className="flex gap-2">
            <dt className="text-[color:var(--muted-foreground)]">Email :</dt>
            <dd className="font-mono text-[color:var(--ink)]">{signataireEmail}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-[color:var(--muted-foreground)]">Méthode :</dt>
          <dd className="text-[color:var(--ink)]">{methodeLabel}</dd>
        </div>
        {nomDocument && (
          <div className="col-span-full flex gap-2">
            <dt className="text-[color:var(--muted-foreground)]">Document :</dt>
            <dd className="truncate font-mono text-[color:var(--ink)]">
              {nomDocument}
            </dd>
          </div>
        )}
        <div className="col-span-full flex gap-2">
          <dt className="text-[color:var(--muted-foreground)]">
            Empreinte SHA-256 :
          </dt>
          <dd
            className="font-mono text-[color:var(--ink)]"
            title={hashDocument}
          >
            {hashCourt}
          </dd>
        </div>
        <div className="col-span-full flex items-center justify-between gap-4">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--seal)]">
            ID&nbsp;· {signatureId}
          </span>
          {verifierHref && (
            <a
              href={verifierHref}
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--accent-vif)] px-3 py-1 font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[color:var(--accent-vif)] hover:bg-[color:var(--accent-vif)] hover:text-[color:var(--paper-elevated)]"
            >
              Vérifier l'intégrité →
            </a>
          )}
        </div>
      </dl>
    </div>
  );
}
