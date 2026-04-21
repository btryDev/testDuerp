import Link from "next/link";
import { notFound } from "next/navigation";
import { EquipementForm } from "@/components/equipements/EquipementForm";
import { modifierEquipement } from "@/lib/equipements/actions";
import { getEquipement } from "@/lib/equipements/queries";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

type Caracteristiques = {
  nombre?: number;
  aGroupeElectrogene?: boolean;
  estLocalPollutionSpecifique?: boolean;
  nbVehiculesParkingCouvert?: number;
  notes?: string;
};

export default async function ModifierEquipementPage({
  params,
}: {
  params: Promise<{ id: string; equipementId: string }>;
}) {
  const { id, equipementId } = await params;
  const eq = await getEquipement(equipementId);
  if (!eq || eq.etablissementId !== id) notFound();

  const caracs = (eq.caracteristiques ?? {}) as Caracteristiques;
  const action = modifierEquipement.bind(null, equipementId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}/equipements`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← Équipements
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">Modifier l&apos;équipement</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          {eq.libelle}
        </h1>
      </header>

      <div className="mt-10">
        <EquipementForm
          action={action}
          valeursInitiales={{
            libelle: eq.libelle,
            categorie: eq.categorie as CategorieEquipement,
            localisation: eq.localisation,
            dateMiseEnService: eq.dateMiseEnService,
            nombre: caracs.nombre ?? null,
            aGroupeElectrogene: caracs.aGroupeElectrogene,
            estLocalPollutionSpecifique: caracs.estLocalPollutionSpecifique,
            nbVehiculesParkingCouvert: caracs.nbVehiculesParkingCouvert ?? null,
            notes: caracs.notes ?? null,
          }}
          libelleSubmit="Enregistrer"
          labelAnnuler={{
            libelle: "Annuler",
            href: `/etablissements/${id}/equipements`,
          }}
        />
      </div>
    </main>
  );
}
