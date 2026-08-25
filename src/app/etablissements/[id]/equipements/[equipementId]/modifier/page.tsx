import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CHAMPS_TRI_ETAT,
  type ChampTriEtat,
  type EquipementInput,
} from "@/lib/equipements/schema";
import { EquipementForm } from "@/components/equipements/EquipementForm";
import { modifierEquipement } from "@/lib/equipements/actions";
import { getEquipement } from "@/lib/equipements/queries";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

/**
 * Forme lue du JSON `caracteristiques`, **dérivée du schéma** et non recopiée
 * à la main.
 *
 * La liste était auparavant écrite en dur ici, et n'avait pas suivi l'ajout
 * des questions à trois états ni des champs ESP. Conséquence : la page
 * d'édition ne repassait pas ces valeurs au formulaire, le `<select>`
 * repartait à « Je ne sais pas encore », rien n'était soumis, et
 * `serialiserCaracteristiques` n'écrivait plus la clé. Modifier le libellé
 * d'un équipement effaçait donc en silence toutes ses réponses — et un « non »
 * redevenu « pas de réponse » **rallume** les obligations en opt-out.
 *
 * En dérivant du schéma, toute propriété ajoutée à `equipementSchema` casse la
 * compilation ici tant qu'elle n'est pas repassée au formulaire.
 */
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
