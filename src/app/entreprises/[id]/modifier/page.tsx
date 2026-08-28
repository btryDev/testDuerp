import Link from "next/link";
import { notFound } from "next/navigation";
import { EntrepriseForm } from "@/components/entreprises/EntrepriseForm";
import { modifierEntreprise } from "@/lib/entreprises/actions";
import { getEntreprise } from "@/lib/entreprises/queries";
import { SupprimerEntrepriseButton } from "@/components/entreprises/SupprimerEntrepriseButton";

export default async function ModifierEntreprisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entreprise = await getEntreprise(id);
  if (!entreprise) notFound();

  const action = modifierEntreprise.bind(null, id);

  return (
    <main className="mx-auto max-w-[760px] px-6 py-10">
      <nav className="board-eyebrow text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
        <Link href={`/entreprises/${id}`} className="hover:underline">
          ← {entreprise.raisonSociale}
        </Link>
      </nav>

      <h1 className="board-titre m-0 mt-4 text-[clamp(22px,2.2vw,27px)]">
        Modifier l&apos;entreprise
      </h1>

      <div className="mt-8">
        <EntrepriseForm
          action={action}
          valeursInitiales={entreprise}
          libelleSubmit="Enregistrer"
          labelAnnuler={{
            libelle: "Annuler",
            href: `/entreprises/${id}`,
          }}
        />
      </div>

      <div className="mt-16 border-t border-[color:var(--board-slate-line)] pt-8">
        <h2 className="m-0 text-[13.5px] font-semibold text-[color:var(--board-signal-ink)]">
          Zone sensible
        </h2>
        <p className="m-0 mt-1.5 max-w-[64ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
          La suppression entraîne celle de tous les DUERP et versions associés.
        </p>
        <div className="mt-4">
          <SupprimerEntrepriseButton id={id} />
        </div>
      </div>
    </main>
  );
}
