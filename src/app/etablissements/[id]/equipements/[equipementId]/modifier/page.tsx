import { notFound } from "next/navigation";
import { FilRetour } from "@/components/ui-kit";
import { EquipementForm } from "@/components/equipements/EquipementForm";
import { modifierEquipement } from "@/lib/equipements/actions";
import { getEquipement } from "@/lib/equipements/queries";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import { lireProvenance } from "@/lib/navigation/provenance";

type Caracteristiques = {
  nombre?: number;
  aGroupeElectrogene?: boolean;
  estLocalPollutionSpecifique?: boolean;
  nbVehiculesParkingCouvert?: number;
  notes?: string;
};

export default async function ModifierEquipementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; equipementId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, equipementId } = await params;
  const { de } = await searchParams;
  const eq = await getEquipement(equipementId);
  if (!eq || eq.etablissementId !== id) notFound();

  // La fiche d'un équipement s'ouvre depuis le parc, mais aussi depuis la
  // lecture par équipement du calendrier.
  const provenance = lireProvenance(de, id);

  const caracs = (eq.caracteristiques ?? {}) as Caracteristiques;
  const action = modifierEquipement.bind(null, equipementId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <FilRetour
        provenance={provenance}
        canonique={{
          href: `/etablissements/${id}/equipements`,
          label: "Équipements",
        }}
      />

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
