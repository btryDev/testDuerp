import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AjouterMesureCustomForm } from "@/components/duerps/AjouterMesureCustomForm";
import { MesureReferentielToggle } from "@/components/duerps/MesureReferentielToggle";
import { MesureRow } from "@/components/duerps/MesureRow";
import { mesuresUniquementBasNiveau, trierParHierarchie } from "@/lib/prevention";
import { tousRisquesConnus } from "@/lib/referentiels";
import { getRisque } from "@/lib/risques/queries";
import type { TypeMesure } from "@/lib/referentiels/types";

export default async function MesuresPage({
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

  const mesuresRef = risque.referentielId
    ? tousRisquesConnus().get(risque.referentielId)?.mesuresRecommandees ?? []
    : [];
  const idsSelectionnes = new Set(
    risque.mesures
      .map((m) => m.referentielMesureId)
      .filter((x): x is string => Boolean(x)),
  );
  const mesuresRefNonSelectionnees = mesuresRef.filter(
    (m) => !idsSelectionnes.has(m.id),
  );

  const typesRetenus = risque.mesures.map((m) => m.type as TypeMesure);
  const alerteBasNiveau = mesuresUniquementBasNiveau(typesRetenus);

  const mesuresAffichees = trierParHierarchie(
    risque.mesures.map((m) => ({ ...m, type: m.type as TypeMesure })),
  );

  const hrefUnite = `/duerp/${id}/risques/${uniteId}`;
  const hrefCotation = `/duerp/${id}/risques/${uniteId}/${risqueId}`;
  const risquesUnite = risque.unite.risques;
  const idxCourant = risquesUnite.findIndex((r) => r.id === risqueId);
  const suivant = risquesUnite.slice(idxCourant + 1)[0];
  const hrefSuivant = suivant
    ? `/duerp/${id}/risques/${uniteId}/${suivant.id}/mesures`
    : undefined;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted-foreground">
        <Link href={hrefCotation} className="hover:underline">
          ← Cotation du risque
        </Link>
      </nav>

      <div>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Mesures de prévention
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {risque.libelle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Criticité actuelle {risque.criticite}/16 · unité {risque.unite.nom}
        </p>
      </div>

      {alerteBasNiveau && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-50 p-4 text-sm text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100">
          <p className="font-medium">
            Hiérarchie des mesures de prévention (art. L. 4121-2)
          </p>
          <p className="mt-1">
            Les mesures retenues sont uniquement des EPI, de la formation ou
            des mesures organisationnelles. Avez-vous étudié une solution
            collective ou de réduction à la source ? Le Code du travail impose
            de prioriser ces approches avant les EPI.
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Mesures retenues
        </h3>
        {mesuresAffichees.length === 0 ? (
          <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            Aucune mesure retenue pour ce risque.
          </p>
        ) : (
          <ul className="space-y-2">
            {mesuresAffichees.map((m) => (
              <MesureRow
                key={m.id}
                id={m.id}
                libelle={m.libelle}
                type={m.type}
                statut={m.statut as "existante" | "prevue"}
                echeance={m.echeance}
                responsable={m.responsable}
                origine={m.referentielMesureId ? "referentiel" : "custom"}
              />
            ))}
          </ul>
        )}
      </section>

      {mesuresRefNonSelectionnees.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Mesures recommandées par le référentiel
          </h3>
          <p className="text-sm text-muted-foreground">
            Cochez les mesures que vous avez déjà mises en place ou que vous
            comptez mettre en place. Vous pourrez ensuite ajuster le statut
            (existante / prévue) et ajouter échéance + responsable.
          </p>
          <ul className="space-y-2">
            {mesuresRefNonSelectionnees.map((m) => (
              <li key={m.id}>
                <MesureReferentielToggle
                  risqueId={risqueId}
                  mesureRefId={m.id}
                  libelle={m.libelle}
                  type={m.type}
                  selectionne={false}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Ajouter une mesure personnalisée
        </h3>
        <AjouterMesureCustomForm risqueId={risqueId} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <Link
          href={hrefUnite}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Retour à l&apos;unité
        </Link>
        {hrefSuivant && (
          <Link href={hrefSuivant} className={buttonVariants({ size: "lg" })}>
            Risque suivant →
          </Link>
        )}
      </div>
    </div>
  );
}
