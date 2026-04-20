import Link from "next/link";
import { notFound } from "next/navigation";
import { CotationForm } from "@/components/duerps/CotationForm";
import { getRisque } from "@/lib/risques/queries";

export default async function CotationPage({
  params,
}: {
  params: Promise<{ id: string; uniteId: string; risqueId: string }>;
}) {
  const { id, uniteId, risqueId } = await params;
  const risque = await getRisque(risqueId);
  if (
    !risque ||
    risque.uniteId !== uniteId ||
    risque.unite.duerpId !== id
  ) {
    notFound();
  }

  const risquesUnite = risque.unite.risques;
  const idxCourant = risquesUnite.findIndex((r) => r.id === risqueId);
  const suivant = risquesUnite
    .slice(idxCourant + 1)
    .find((r) => !r.cotationSaisie);

  const hrefRetourUnite = `/duerp/${id}/risques/${uniteId}`;
  const hrefMesures = `/duerp/${id}/risques/${uniteId}/${risqueId}/mesures`;
  const hrefSuivant = suivant
    ? `/duerp/${id}/risques/${uniteId}/${suivant.id}`
    : undefined;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href={hrefRetourUnite} className="hover:underline">
          ← {risque.unite.nom}
        </Link>
      </nav>

      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Cotation du risque
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {risque.libelle}
        </h2>
        {risque.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {risque.description}
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          Risque {idxCourant + 1} sur {risquesUnite.length} pour cette unité
          {" · "}
          {risque.cotationSaisie ? "déjà coté" : "à coter"}
        </p>
      </div>

      <CotationForm
        risqueId={risqueId}
        initial={{
          gravite: risque.gravite,
          probabilite: risque.probabilite,
          maitrise: risque.maitrise,
          nombreSalariesExposes: risque.nombreSalariesExposes,
          dateMesuresPhysiques: risque.dateMesuresPhysiques
            ? risque.dateMesuresPhysiques.toISOString().slice(0, 10)
            : null,
          exposeCMR: risque.exposeCMR,
        }}
        cotationSaisie={risque.cotationSaisie}
        hrefRetourUnite={hrefRetourUnite}
        hrefMesures={hrefMesures}
        hrefSuivant={hrefSuivant}
      />
    </div>
  );
}
