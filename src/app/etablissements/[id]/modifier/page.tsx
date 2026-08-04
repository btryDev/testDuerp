import Link from "next/link";
import { notFound } from "next/navigation";
import { EtablissementForm } from "@/components/etablissements/EtablissementForm";
import { modifierEtablissement } from "@/lib/etablissements/actions";
import { getEtablissement } from "@/lib/etablissements/queries";

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
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etab.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">Modifier l&apos;établissement</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          {etab.raisonDisplay}
        </h1>
      </header>

      <div className="mt-10">
        <EtablissementForm
          action={action}
          valeursInitiales={{
            raisonDisplay: etab.raisonDisplay,
            adresse: etab.adresse,
            codeNaf: etab.codeNaf,
            effectifSurSite: etab.effectifSurSite,
            estEtablissementTravail: etab.estEtablissementTravail,
            estERP: etab.estERP,
            estIGH: etab.estIGH,
            estHabitation: etab.estHabitation,
            typeErp: etab.typeErp,
            categorieErp: etab.categorieErp,
            classeIgh: etab.classeIgh,
          }}
          libelleSubmit="Enregistrer"
          labelAnnuler={{
            libelle: "Annuler",
            href: `/etablissements/${id}`,
          }}
        />
      </div>
    </main>
  );
}
