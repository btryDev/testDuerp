import Link from "next/link";
import { notFound } from "next/navigation";
import { EquipementForm } from "@/components/equipements/EquipementForm";
import { creerEquipement } from "@/lib/equipements/actions";
import { getEtablissement } from "@/lib/etablissements/queries";
import { CATEGORIES_EQUIPEMENT } from "@/lib/equipements/schema";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

export default async function NouvelEquipementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { id } = await params;
  const { categorie } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  // La grille du parc propose « Ajouter » famille par famille : le
  // formulaire s'ouvre alors sur la bonne catégorie. Une valeur forgée est
  // ignorée plutôt que passée au formulaire — la liste fermée fait foi.
  const categorieInitiale = CATEGORIES_EQUIPEMENT.includes(
    categorie as CategorieEquipement,
  )
    ? (categorie as CategorieEquipement)
    : undefined;

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
          valeursInitiales={
            categorieInitiale ? { categorie: categorieInitiale } : undefined
          }
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
