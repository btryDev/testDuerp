import Link from "next/link";
import { notFound } from "next/navigation";
import { EquipementForm } from "@/components/equipements/EquipementForm";
import { creerEquipement } from "@/lib/equipements/actions";
import { getEtablissement } from "@/lib/etablissements/queries";

export default async function NouvelEquipementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const action = creerEquipement.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}/equipements`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Équipements de {etab.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">Nouvel équipement</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          Déclarer un équipement
        </h1>
      </header>

      <div className="mt-10">
        <EquipementForm
          action={action}
          libelleSubmit="Créer l'équipement"
          labelAnnuler={{
            libelle: "Annuler",
            href: `/etablissements/${id}/equipements`,
          }}
        />
      </div>
    </main>
  );
}
