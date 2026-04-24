import { notFound } from "next/navigation";
import { getRegistrePublicParSlug } from "@/lib/accessibilite/queries";
import { LABEL_HANDICAP, LABEL_REGIME } from "@/lib/accessibilite/schema";

export const metadata = {
  title: "Registre d'accessibilité",
  description:
    "Registre d'accessibilité public d'un établissement recevant du public — arrêté du 19 avril 2017.",
};

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const PICTO: Record<keyof typeof LABEL_HANDICAP, string> = {
  moteur: "♿",
  visuel: "👁",
  auditif: "👂",
  mental: "✶",
  cognitif: "✦",
  psychique: "❋",
};

export default async function RegistrePublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRegistrePublicParSlug(slug);
  if (!r) notFound();

  const etab = r.etablissement;
  const entreprise = etab.entreprise;

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-[color:var(--paper)] px-6 pb-20 pt-8 sm:px-10">
      {/* Hero */}
      <header className="text-center">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--seal)]">
          Registre d&apos;accessibilité
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.25rem]">
          {entreprise.raisonSociale}
        </h1>
        <p className="mt-1 text-[0.95rem] text-[color:var(--ink)]">
          {etab.raisonDisplay}
        </p>
        <p className="mt-0.5 font-mono text-[0.78rem] text-muted-foreground">
          {etab.adresse}
        </p>
      </header>

      {/* Handicaps accueillis — bloc visuel fort */}
      {r.handicapsAccueillis.length > 0 && (
        <section className="mt-10 rounded-3xl border border-[color:var(--accent-vif)]/30 bg-[color:var(--accent-vif-soft)] p-6">
          <p className="label-admin text-[color:var(--accent-vif)]">
            Accessibilité
          </p>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.015em]">
            Cet établissement est adapté à
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {r.handicapsAccueillis.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 rounded-xl bg-[color:var(--paper-elevated)] px-3 py-2.5"
              >
                <span aria-hidden className="text-[1.3rem]">
                  {PICTO[h]}
                </span>
                <span className="text-[0.85rem] font-medium">
                  {LABEL_HANDICAP[h]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 1 — Prestations */}
      {r.prestationsFournies && (
        <section className="mt-10">
          <p className="label-admin">01 · Nos prestations</p>
          <p className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-relaxed text-[color:var(--ink)]">
            {r.prestationsFournies}
          </p>
        </section>
      )}

      {r.servicesAdaptes && (
        <section className="mt-8">
          <p className="label-admin">Services adaptés sur place</p>
          <p className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-relaxed text-[color:var(--ink)]">
            {r.servicesAdaptes}
          </p>
        </section>
      )}

      {/* Section 4 — Équipements */}
      {r.equipementsAccessibilite && (
        <section className="mt-10">
          <p className="label-admin">02 · Équipements d&apos;accessibilité</p>
          <p className="mt-3 whitespace-pre-wrap text-[0.98rem] leading-relaxed text-[color:var(--ink)]">
            {r.equipementsAccessibilite}
          </p>
        </section>
      )}

      <div className="my-10 filet-pointille" />

      {/* Section 2 — Conformité */}
      {r.conformiteRegime && (
        <section>
          <p className="label-admin">Conformité</p>
          <div className="mt-3 rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-4">
            <p className="text-[0.95rem] font-medium">
              {LABEL_REGIME[r.conformiteRegime]}
            </p>
            {r.dateConformite && (
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                Effective depuis le {formatDate(r.dateConformite)}
              </p>
            )}
            {r.numeroAttestationAccess && (
              <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-muted-foreground">
                Attestation n° {r.numeroAttestationAccess}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Section 3 — Formation */}
      {(r.personnelForme ||
        r.dateDerniereFormation ||
        r.organismeFormation) && (
        <section className="mt-8">
          <p className="label-admin">Formation du personnel d&apos;accueil</p>
          <div className="mt-3 rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-4 text-[0.88rem] leading-relaxed text-[color:var(--ink)]">
            {r.personnelForme ? (
              <p>
                Notre personnel d&apos;accueil a été formé à l&apos;accueil des
                personnes en situation de handicap.
              </p>
            ) : (
              <p>Formation en cours de mise en place.</p>
            )}
            {r.dateDerniereFormation && (
              <p className="mt-2 text-[0.8rem] text-muted-foreground">
                Dernière session : {formatDate(r.dateDerniereFormation)}
                {r.organismeFormation && ` · ${r.organismeFormation}`}
                {r.effectifForme && r.effectifForme > 0
                  ? ` · ${r.effectifForme} personne${r.effectifForme > 1 ? "s" : ""} formée${r.effectifForme > 1 ? "s" : ""}`
                  : ""}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-14 border-t border-dashed border-rule pt-6 text-center">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted-foreground">
          Registre tenu conformément à l&apos;arrêté du 19 avril 2017
        </p>
        <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--seal)]">
          Mis à jour le {formatDate(r.updatedAt)}
        </p>
        {entreprise.siret && (
          <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
            SIRET {entreprise.siret}
          </p>
        )}
      </footer>
    </main>
  );
}
