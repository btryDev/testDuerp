import { notFound } from "next/navigation";
import { FilRetour } from "@/components/ui-kit";
import {
  CHAMPS_TRI_ETAT,
  type ChampTriEtat,
  type EquipementInput,
} from "@/lib/equipements/schema";
import { EquipementForm } from "@/components/equipements/EquipementForm";
import { modifierEquipement } from "@/lib/equipements/actions";
import { getEquipement } from "@/lib/equipements/queries";
import {
  CHAMP_SANS_ECHEANCE,
  ENCRE_SANS_ECHEANCE,
  EXPLICATION_SANS_ECHEANCE,
  LIBELLE_SANS_ECHEANCE,
  equipementsSansEcheance,
} from "@/lib/equipements/hors-referentiel";
import { listerBatimentsDeLEtablissement } from "@/lib/batiments/queries";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import { lireProvenance } from "@/lib/navigation/provenance";

type Caracteristiques = Partial<
  Pick<
    EquipementInput,
    | "nombre"
    | "aGroupeElectrogene"
    | "estLocalPollutionSpecifique"
    | "nbVehiculesParkingCouvert"
    | "familleEsp"
    | "pressionMaxAdmissibleBar"
    | "volumeLitres"
    | "notes"
    | ChampTriEtat
  >
>;

/**
 * Réponses aux questions à trois états déjà enregistrées. Elles doivent être
 * repassées au formulaire : sans elles, le `<select>` repart sur « Je ne sais
 * pas encore » et la réponse est effacée au premier enregistrement, alors même
 * que l'utilisateur ne touchait qu'au libellé. Une réponse « non » perdue,
 * c'est une échéance qui réapparaît ; une réponse « oui » perdue sur un palier
 * de charge, c'est une périodicité qui se rallonge en silence.
 */
function reponsesTriEtat(
  caracs: Caracteristiques,
): Partial<Record<ChampTriEtat, boolean>> {
  const out: Partial<Record<ChampTriEtat, boolean>> = {};
  for (const champ of CHAMPS_TRI_ETAT) {
    const v = caracs[champ];
    if (typeof v === "boolean") out[champ] = v;
  }
  return out;
}

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
  const batiments = await listerBatimentsDeLEtablissement(id);

  // La fiche d'un équipement s'ouvre depuis le parc, mais aussi depuis la
  // lecture par équipement du calendrier.
  const provenance = lireProvenance(de, id);

  // Le silence du référentiel se dit ici aussi, et pas seulement dans la
  // liste : la fiche est l'écran où l'on vient chercher pourquoi un appareil
  // ne bouge pas. Informatif, jamais bloquant — la catégorie « Autre » reste
  // une soupape de saisie légitime.
  const motifSansEcheance = (await equipementsSansEcheance(id)).get(
    equipementId,
  );

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

      {motifSansEcheance && (
        <div className="cartouche mt-8 px-6 py-5 sm:px-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.85rem] leading-relaxed text-muted-foreground">
            <span
              className="rounded-full px-2 py-0.5 text-[0.72rem] font-semibold"
              style={{
                background: CHAMP_SANS_ECHEANCE,
                color: ENCRE_SANS_ECHEANCE,
              }}
            >
              {LIBELLE_SANS_ECHEANCE[motifSansEcheance]}
            </span>
            <span>{EXPLICATION_SANS_ECHEANCE[motifSansEcheance]}</span>
          </p>
        </div>
      )}

      <div className="mt-10">
        <EquipementForm
          action={action}
          batiments={batiments}
          valeursInitiales={{
            libelle: eq.libelle,
            categorie: eq.categorie as CategorieEquipement,
            batimentId: eq.batimentId,
            localisation: eq.localisation,
            dateMiseEnService: eq.dateMiseEnService,
            nombre: caracs.nombre ?? null,
            aGroupeElectrogene: caracs.aGroupeElectrogene,
            estLocalPollutionSpecifique: caracs.estLocalPollutionSpecifique,
            nbVehiculesParkingCouvert: caracs.nbVehiculesParkingCouvert ?? null,
            familleEsp: caracs.familleEsp ?? null,
            pressionMaxAdmissibleBar: caracs.pressionMaxAdmissibleBar ?? null,
            volumeLitres: caracs.volumeLitres ?? null,
            // Les sept questions à trois états doivent être repassées au
            // formulaire, sinon l'édition les efface : le `<select>` repart à
            // « Je ne sais pas encore », rien n'est soumis, et
            // `serialiserCaracteristiques` ne réécrit pas la clé. Un « non »
            // devenait ainsi une absence de réponse, ce qui **rallume** les
            // obligations en opt-out — modifier le libellé d'un extincteur
            // faisait réapparaître la vérification des RIA.
            ...Object.fromEntries(
              CHAMPS_TRI_ETAT.map((champ) => [champ, caracs[champ]]),
            ),
            notes: caracs.notes ?? null,
            ...reponsesTriEtat(caracs),
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
