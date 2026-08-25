import Link from "next/link";
import { requireEtablissement } from "@/lib/auth/scope";
import { cleJourCivil, formaterDateFr } from "@/lib/dates";
import { chargerPagePrescriptions } from "@/lib/prescriptions/queries";
import { creerPrescription } from "@/lib/prescriptions/actions";
import { LABEL_SOURCE_PRESCRIPTION } from "@/lib/prescriptions/schema";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { PrescriptionActions } from "@/components/prescriptions/PrescriptionActions";

/**
 * Prescriptions particulières propres à l'établissement (ADR-014) : arrêtés
 * du maire ou du préfet, arrêtés ICPE, demandes de l'inspection du travail.
 * L'état de chaque prescription (active / levée / ignorée avec raison) est
 * recalculé à l'affichage par la même fonction pure que le générateur.
 */
export default async function PrescriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const { prescriptions, obligations, equipements } =
    await chargerPagePrescriptions(id);
  const action = creerPrescription.bind(null, id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etablissement.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">Prescriptions propres à votre établissement</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          Ce qu&apos;une autorité vous a prescrit, à vous seul
        </h1>
        <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
          Le calendrier est calculé à partir d&apos;un référentiel commun à tous
          les établissements. Un arrêté du maire ou du préfet pris après avis de
          la commission de sécurité, un arrêté préfectoral ICPE ou une demande
          de l&apos;inspection du travail peuvent imposer davantage — un rythme
          plus court, une vérification supplémentaire. Déclarez-les ici : le
          calendrier les reprend, avec leur référence.
        </p>
      </header>

      <section className="mt-10 space-y-4">
        <h2 className="text-[1.05rem] font-semibold">Prescriptions déclarées</h2>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune prescription déclarée. Si aucune autorité ne vous a rien
            prescrit, il n&apos;y a rien à faire ici.
          </p>
        ) : (
          <ul className="divide-y divide-rule/60 rounded-md border border-rule/60">
            {prescriptions.map((p) => (
              <li key={p.id} className="space-y-1 px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {LABEL_SOURCE_PRESCRIPTION[p.source as keyof typeof LABEL_SOURCE_PRESCRIPTION] ?? p.source}{" "}
                    {p.reference}
                    {p.autorite ? ` — ${p.autorite}` : ""}
                  </p>
                  <span
                    className={
                      p.etat.etat === "active"
                        ? "font-mono text-[0.68rem] uppercase tracking-[0.14em] text-emerald-700"
                        : p.etat.etat === "levee"
                          ? "font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground"
                          : "font-mono text-[0.68rem] uppercase tracking-[0.14em] text-amber-700"
                    }
                  >
                    {p.etat.etat === "active"
                      ? "Active"
                      : p.etat.etat === "levee"
                        ? "Levée"
                        : "Non appliquée"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.effet === "renforce_periodicite"
                    ? `Renforce « ${p.libelleObligationCiblee} »`
                    : `Obligation sur mesure : ${p.libelle}`}
                  {" · "}
                  {/* `formaterDateFr` et non `toISOString()` : une date d'acte
                      est stockée à minuit Paris (ADR-011), et le slice de
                      l'ISO affichait la veille. */}
                  acte du {formaterDateFr(p.dateDocument)}
                </p>
                <p className="text-sm">{p.etat.detail}</p>
                <div className="pt-2">
                  <PrescriptionActions
                    etablissementId={id}
                    prescriptionId={p.id}
                    estLevee={p.etat.etat === "levee"}
                    lignesAvecPreuve={p.lignesAvecPreuve}
                    dateDocument={cleJourCivil(p.dateDocument)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-[1.05rem] font-semibold">Déclarer une prescription</h2>
        <PrescriptionForm
          action={action}
          obligations={obligations}
          equipements={equipements}
        />
      </section>
    </main>
  );
}
