import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, WhyCard } from "@/components/ui-kit";
import { ImportDuerpWizard } from "@/components/duerps/ImportDuerpWizard";
import { requireEtablissement } from "@/lib/auth/scope";

export const metadata = {
  title: "Importer un DUERP existant",
};

export default async function ImportDuerpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);

  return (
    <>
      <AppTopbar
        title="Importer un DUERP"
        subtitle="Si vous avez déjà un DUERP Excel, téléversez-le pour démarrer plus vite."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { href: `/etablissements/${id}/duerp`, label: "DUERP" },
          { label: "Importer" },
        ]}
        actions={
          <Link
            href={`/etablissements/${id}/duerp`}
            className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-ink"
          >
            Retour au DUERP →
          </Link>
        }
      />

      <main className="mx-auto max-w-3xl px-8 py-8 pb-16">
        <WhyCard
          kicker="Pourquoi importer"
          titre="Repartez de ce que vous avez déjà."
          enjeu="La loi ne vous demande pas de repartir de zéro à chaque outil : elle exige un DUERP tenu à jour, peu importe son support d'origine."
          tonalite="info"
        >
          <p>
            Téléversez votre DUERP Excel actuel. Nous détectons les colonnes
            automatiquement, vous vérifiez l&apos;aperçu, vous importez. Les
            risques, unités de travail et mesures existantes sont créés en base,
            et vous continuez à le faire évoluer dans la plateforme.
          </p>
          <div className="mt-3">
            <LegalBadge
              reference="Art. R4121-1 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530833"
              extrait="L'employeur transcrit et met à jour dans un document unique les résultats de l'évaluation des risques pour la santé et la sécurité des travailleurs à laquelle il procède."
            >
              Le Code du travail impose <strong>un</strong> DUERP tenu à jour —
              il ne prescrit pas de format imposé.
            </LegalBadge>
          </div>
        </WhyCard>

        <div className="mt-10">
          <ImportDuerpWizard etablissementId={id} />
        </div>

        <div className="mt-10 rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] p-5">
          <p className="label-admin">Format attendu</p>
          <ul className="mt-3 space-y-1 text-[0.82rem] text-[color:var(--ink)]">
            <li>
              <strong>Colonnes obligatoires :</strong> Unité de travail · Risque
              · Gravité (1-4) · Probabilité (1-4) · Maîtrise (1-4)
            </li>
            <li>
              <strong>Colonnes optionnelles :</strong> Description · Mesures
              existantes (séparées par <code>|</code> ou <code>;</code>)
            </li>
            <li>
              Les variantes d&apos;orthographe et d&apos;accents sont tolérées :{" "}
              <em>unité / unite / poste</em>, <em>risque / libelle / danger</em>, etc.
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}
