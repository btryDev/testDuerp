import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EtablissementForm } from "@/components/etablissements/EtablissementForm";
import { modifierEtablissement } from "@/lib/etablissements/actions";
import { getEtablissement } from "@/lib/etablissements/queries";
import { cleJourCivil } from "@/lib/dates";

export default async function ModifierEtablissementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const action = modifierEtablissement.bind(null, id);

  return (
    <main className="flex flex-1 flex-col bg-[color:var(--board-canvas)] pb-16">
      {/* Le fil de retour porte le nom de l'établissement, le titre porte le
          geste : c'est le gabarit des écrans de saisie déjà migrés, et il
          évite d'écrire deux fois la même raison sociale. */}
      <header className="border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-card)] px-[var(--board-gutter)] py-[22px]">
        <Link
          href={`/etablissements/${id}`}
          className="board-eyebrow inline-flex items-center gap-2 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)] transition-colors hover:text-[color:var(--board-ink)]"
        >
          <ArrowLeft className="size-3" aria-hidden />
          {etab.raisonDisplay}
        </Link>
        <h1 className="board-titre m-0 mt-2.5 text-[clamp(22px,2.2vw,27px)]">
          Modifier l&apos;établissement
        </h1>
      </header>

      <div className="px-[var(--board-gutter)] pt-6">
        <div className="carte-board max-w-[880px] px-7 py-7 sm:px-8">
          <EtablissementForm
            action={action}
            valeursInitiales={{
              raisonDisplay: etab.raisonDisplay,
              adresse: etab.adresse,
              codeNaf: etab.codeNaf,
              effectifSurSite: etab.effectifSurSite,
              personnesPresentesHabituellement:
                etab.personnesPresentesHabituellement,
              manipuleMatieresR422722: etab.manipuleMatieresR422722,
              estEtablissementTravail: etab.estEtablissementTravail,
              estERP: etab.estERP,
              estIGH: etab.estIGH,
              estHabitation: etab.estHabitation,
              typeErp: etab.typeErp,
              categorieErp: etab.categorieErp,
              classeIgh: etab.classeIgh,
              familleHabitation: etab.familleHabitation,
              natureActivite: etab.natureActivite,
              effectifPublicAdmis: etab.effectifPublicAdmis,
              // `<input type="date">` attend une clé de jour civil. La produire
              // via `cleJourCivil` et non `toISOString().slice(0,10)` : ancrée
              // dans le fuseau de référence (ADR-011), sinon une date de début
              // de journée s'afficherait la veille.
              dateAutorisationOuverture: etab.dateAutorisationOuverture
                ? cleJourCivil(etab.dateAutorisationOuverture)
                : null,
              dateCertificatConformite: etab.dateCertificatConformite
                ? cleJourCivil(etab.dateCertificatConformite)
                : null,
            }}
            libelleSubmit="Enregistrer"
            labelAnnuler={{
              libelle: "Annuler",
              href: `/etablissements/${id}`,
            }}
          />
        </div>
      </div>
    </main>
  );
}
