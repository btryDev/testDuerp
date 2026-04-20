import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AjouterUniteForm } from "@/components/duerps/AjouterUniteForm";
import { UniteRow } from "@/components/duerps/UniteRow";
import { WizardSteps } from "@/components/duerps/WizardSteps";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { construireEtapes } from "@/lib/duerps/etapes";
import { getDuerp } from "@/lib/duerps/queries";

export default async function UnitesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();

  const unitesVisibles = duerp.unites.filter((u) => !u.estTransverse);
  const unitesOk = unitesVisibles.length > 0;
  const etapes = construireEtapes(id, "unites", {
    secteurOk: Boolean(duerp.referentielSecteurId),
    unitesOk,
    risquesOk: false,
    transversesOk: duerp.transversesRepondues,
  });

  return (
    <div className="space-y-12">
      <WizardSteps etapes={etapes} />

      <header className="max-w-2xl">
        <p className="label-admin inline-flex items-center">
          Unités de travail
          <InfoTooltip align="left">
            Une « unité de travail » regroupe des salariés exposés aux mêmes
            risques. Ça peut être un poste (ex. accueil), une zone (ex.
            cuisine) ou une activité (ex. livraison). L&apos;évaluation se
            fait unité par unité.
          </InfoTooltip>
        </p>
        <h2 className="mt-4 text-[1.6rem] font-semibold tracking-[-0.018em] leading-tight">
          Vérifiez, ajustez, complétez.
        </h2>
        <p className="mt-4 text-[0.95rem] leading-[1.7] text-muted-foreground">
          Une unité regroupe des salariés exposés aux mêmes risques (un poste,
          une zone, une activité). Les unités ci-dessous ont été pré-remplies
          selon votre secteur. Vous pouvez les renommer, les supprimer, ou en
          ajouter.
        </p>
      </header>

      <section className="cartouche overflow-hidden">
        <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            {String(unitesVisibles.length).padStart(2, "0")} unité
            {unitesVisibles.length > 1 ? "s" : ""}
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Modifiables
          </p>
        </div>

        {unitesVisibles.length === 0 ? (
          <p className="px-6 py-8 text-[0.9rem] text-muted-foreground sm:px-8">
            Aucune unité de travail. Ajoutez-en au moins une pour continuer.
          </p>
        ) : (
          <ul className="divide-y divide-dashed divide-rule/50">
            {unitesVisibles.map((u) => (
              <UniteRow
                key={u.id}
                id={u.id}
                nom={u.nom}
                description={u.description}
                nombreRisques={u.risques.length}
              />
            ))}
          </ul>
        )}

        <div className="border-t border-dashed border-rule/60">
          <AjouterUniteForm duerpId={id} />
        </div>
      </section>

      <div className="flex items-center justify-end">
        <Link
          href={`/duerp/${id}/risques`}
          className={buttonVariants({ size: "lg" })}
          aria-disabled={!unitesOk}
          tabIndex={unitesOk ? undefined : -1}
          style={!unitesOk ? { pointerEvents: "none", opacity: 0.5 } : undefined}
        >
          Étape suivante : risques →
        </Link>
      </div>
    </div>
  );
}
