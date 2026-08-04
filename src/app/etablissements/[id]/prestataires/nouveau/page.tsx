import Link from "next/link";
import { FormulairePrestataire } from "@/components/prestataires/FormulairePrestataire";
import { requireEtablissement } from "@/lib/auth/scope";
import { creerPrestataire } from "@/lib/prestataires/actions";

export default async function NouveauPrestatairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);

  const action = creerPrestataire.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}/prestataires`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Annuaire des prestataires
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">
          {etablissement.raisonDisplay} · Nouveau prestataire
        </p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          Ajouter un prestataire
        </h1>
        <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
          Remplissez au minimum <strong>l&apos;identité</strong> et le
          <strong> contact principal</strong>. Les pièces justificatives
          (URSSAF, RC Pro, Kbis) peuvent être ajoutées plus tard — mais les
          joindre dès maintenant vous sécurise au regard de l&apos;obligation
          de vigilance.
        </p>
      </header>

      <div className="mt-10">
        <FormulairePrestataire etablissementId={id} action={action} />
      </div>
    </main>
  );
}
