import Link from "next/link";
import { LABEL_DOMAINE } from "@/lib/prestataires/schema";
import type { PrestataireAvecVigilance } from "@/lib/prestataires/queries";
import { VigilancePiecePill } from "./VigilancePills";

export function PrestataireCard({
  etablissementId,
  prestataire,
}: {
  etablissementId: string;
  prestataire: PrestataireAvecVigilance;
}) {
  const { vigilance } = prestataire;
  const nbAlertes = vigilance.alertesOuvertes;

  return (
    <article className="cartouche relative overflow-hidden p-6">
      {nbAlertes > 0 && (
        <span
          aria-hidden
          className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[color:color-mix(in_oklch,var(--minium)_14%,transparent)] px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--minium)]"
        >
          ⚠ {nbAlertes} alerte{nbAlertes > 1 ? "s" : ""}
        </span>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {prestataire.estOrganismeAgree && (
            <span className="inline-flex items-center rounded-full border border-[color:var(--warm)] bg-[color:var(--warm-soft)] px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--warm)]">
              Organisme agréé
            </span>
          )}
          <p className="label-admin">
            {prestataire.siret ? `SIRET · ${prestataire.siret}` : "SIRET non renseigné"}
          </p>
        </div>

        <h3 className="text-[1.15rem] font-semibold tracking-[-0.015em] text-[color:var(--ink)]">
          {prestataire.raisonSociale}
        </h3>

        {prestataire.domaines.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {prestataire.domaines.map((d) => (
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

      <div className="filet-pointille mt-5 mb-5" />

      <dl className="grid grid-cols-1 gap-y-1 text-[0.82rem] sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="text-[color:var(--muted-foreground)]">Contact :</dt>
        <dd className="text-[color:var(--ink)]">{prestataire.contactNom}</dd>
        <dt className="text-[color:var(--muted-foreground)]">Email :</dt>
        <dd className="font-mono text-[color:var(--ink)]">
          <a
            href={`mailto:${prestataire.contactEmail}`}
            className="hover:underline"
          >
            {prestataire.contactEmail}
          </a>
        </dd>
        {prestataire.contactTelephone && (
          <>
            <dt className="text-[color:var(--muted-foreground)]">Téléphone :</dt>
            <dd className="font-mono text-[color:var(--ink)]">
              {prestataire.contactTelephone}
            </dd>
          </>
        )}
      </dl>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <VigilancePiecePill
          libelle="Attestation URSSAF (6 mois)"
          statut={vigilance.urssaf}
          jours={vigilance.urssafExpireDans}
        />
        <VigilancePiecePill
          libelle="RC Pro"
          statut={vigilance.rcPro}
          jours={vigilance.rcProExpireDans}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--seal)]">
          {vigilance.kbis === "present" ? "Kbis fourni" : "Kbis non fourni"}
        </p>
        <Link
          href={`/etablissements/${etablissementId}/prestataires/${prestataire.id}`}
          className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[color:var(--warm)] hover:underline"
        >
          Détails →
        </Link>
      </div>
    </article>
  );
}
