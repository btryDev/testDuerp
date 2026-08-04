import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, StatusPill, WhyCard } from "@/components/ui-kit";
import { AjoutPointReleveForm } from "@/components/carnet-sanitaire/AjoutPointReleveForm";
import { AjoutReleveForm } from "@/components/carnet-sanitaire/AjoutReleveForm";
import { AjoutAnalyseForm } from "@/components/carnet-sanitaire/AjoutAnalyseForm";
import { GraphTemperatures } from "@/components/carnet-sanitaire/GraphTemperatures";
import { requireEtablissement } from "@/lib/auth/scope";
import { getCarnetSanitaire } from "@/lib/carnet-sanitaire/queries";
import {
  LABEL_RESEAU,
  SEUIL_LEGIONELLE_UFC_PAR_L,
} from "@/lib/carnet-sanitaire/schema";

export const metadata = {
  title: "Carnet sanitaire eau",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function CarnetSanitairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const carnet = await getCarnetSanitaire(id);

  const nbPoints = carnet?.pointsReleve.length ?? 0;
  const nbReleves =
    carnet?.pointsReleve.reduce((acc, p) => acc + p.releves.length, 0) ?? 0;
  const releveDernier = carnet?.pointsReleve
    .flatMap((p) => p.releves)
    .sort((a, b) => b.dateReleve.getTime() - a.dateReleve.getTime())[0];

  const derniereAnalyse = carnet?.analyses[0];

  return (
    <>
      <AppTopbar
        title="Carnet sanitaire eau"
        subtitle="Prévention légionelles — obligatoire pour tout établissement avec ECS."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Carnet sanitaire" },
        ]}
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-20">
        {/* Why */}
        <WhyCard
          kicker="Pourquoi ce carnet"
          titre="Légionellose — risque mortel, risque contrôlable."
          enjeu="Les légionelles se développent dans les réseaux d'eau chaude sanitaire entre 25 et 45°C. Maintenir l'eau au-dessus de 50°C au puisage est la prévention la plus efficace. Le carnet prouve que vous le faites."
          tonalite="info"
        >
          <div className="mt-3 flex flex-wrap gap-2">
            <LegalBadge
              reference="Arrêté du 1er février 2010"
              href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000021790390/"
              extrait="Le responsable des installations de production, de stockage et de distribution d'eau chaude sanitaire s'assure de la bonne surveillance des installations notamment par un carnet sanitaire dans lequel sont consignées toutes les opérations réalisées."
            />
            <LegalBadge
              reference="Art. R1321-23 CSP"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006908173"
            />
          </div>
        </WhyCard>

        {/* Résumé */}
        {carnet && (
          <div className="mt-8 grid grid-cols-2 divide-x divide-dashed divide-rule/60 rounded-2xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] sm:grid-cols-4">
            <Stat label="Points de relevé" value={nbPoints} />
            <Stat label="Relevés enregistrés" value={nbReleves} />
            <Stat
              label="Dernier relevé"
              value={releveDernier ? formatDate(releveDernier.dateReleve) : "—"}
              mono
            />
            <Stat
              label="Dernière analyse légionelle"
              value={
                derniereAnalyse
                  ? formatDate(derniereAnalyse.dateAnalyse)
                  : "—"
              }
              mono
              accent={derniereAnalyse?.conforme === false ? "alert" : undefined}
            />
          </div>
        )}

        {/* Points de relevé */}
        <section className="mt-10">
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-admin">01 · Points de relevé</p>
              <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
                Vos installations
              </h2>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                Déclarez chaque point où vous mesurez la température (points de
                puisage les plus éloignés du ballon, points sensibles).
              </p>
            </div>
            <AjoutPointReleveForm etablissementId={id} />
          </header>

          {!carnet || nbPoints === 0 ? (
            <div className="cartouche-sunk p-6 text-center">
              <p className="text-[0.9rem] text-muted-foreground">
                Aucun point de relevé configuré. Commencez par ajouter vos
                principaux points de puisage pour démarrer le suivi.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {carnet.pointsReleve.map((p) => {
                const tempActuelle =
                  p.releves[0]?.temperatureCelsius ?? null;
                const conformeActuel =
                  p.releves[0]?.conforme ?? null;
                return (
                  <li
                    key={p.id}
                    className="cartouche relative overflow-hidden"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-[3px]"
                      style={{
                        background:
                          conformeActuel === false
                            ? "var(--minium)"
                            : conformeActuel === true
                              ? "var(--accent-vif)"
                              : "var(--rule)",
                      }}
                    />
                    <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-3 pt-6">
                      <div>
                        <p className="text-[1.02rem] font-semibold">{p.nom}</p>
                        <p className="mt-0.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {LABEL_RESEAU[p.typeReseau]}
                          {p.localisation && ` · ${p.localisation}`}
                          {" · seuil "}
                          {p.typeReseau === "EFS" ? "max" : "min"}{" "}
                          {p.seuilMinCelsius}°C
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {tempActuelle !== null && (
                          <div className="text-right">
                            <p
                              className="font-mono text-[1.4rem] font-semibold tabular-nums"
                              style={{
                                color:
                                  conformeActuel
                                    ? "var(--accent-vif)"
                                    : "var(--minium)",
                              }}
                            >
                              {tempActuelle.toFixed(1)}°
                            </p>
                            <StatusPill
                              status={conformeActuel ? "a_jour" : "non_conforme"}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-5">
                      <GraphTemperatures
                        releves={p.releves}
                        seuilMinCelsius={p.seuilMinCelsius}
                        typeReseau={p.typeReseau}
                      />
                    </div>

                    <div className="border-t border-dashed border-rule/50 bg-[color:var(--paper-sunk)]/60 px-6 py-4">
                      <AjoutReleveForm
                        etablissementId={id}
                        pointReleveId={p.id}
                        seuilMinCelsius={p.seuilMinCelsius}
                        typeReseau={p.typeReseau}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Analyses légionelles */}
        <section className="mt-12">
          <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-admin">02 · Analyses légionelles</p>
              <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
                Prélèvements et résultats laboratoire
              </h2>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                Fréquence recommandée : annuelle minimum, semestrielle pour les
                ERP sensibles (EHPAD, hôpitaux).
              </p>
            </div>
            <AjoutAnalyseForm etablissementId={id} />
          </header>

          {!carnet || carnet.analyses.length === 0 ? (
            <div className="cartouche-sunk p-6 text-center">
              <p className="text-[0.9rem] text-muted-foreground">
                Aucune analyse enregistrée. Conservez les rapports de
                laboratoire pour pouvoir les présenter en cas de contrôle.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {carnet.analyses.map((a) => (
                <li key={a.id} className="cartouche p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.95rem] font-semibold">
                        Analyse du {formatDate(a.dateAnalyse)}
                        {a.laboratoire && (
                          <span className="ml-2 font-normal text-muted-foreground">
                            · {a.laboratoire}
                          </span>
                        )}
                      </p>
                      {a.commentaire && (
                        <p className="mt-1 text-[0.82rem] text-muted-foreground">
                          {a.commentaire}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {a.valeurUfcParL !== null && (
                        <p
                          className="font-mono text-[1.4rem] font-semibold tabular-nums"
                          style={{
                            color: a.conforme
                              ? "var(--accent-vif)"
                              : "var(--minium)",
                          }}
                        >
                          {a.valeurUfcParL.toLocaleString("fr-FR")}
                          <span className="ml-1 text-[0.7rem] text-muted-foreground">
                            UFC/L
                          </span>
                        </p>
                      )}
                      <StatusPill
                        status={a.conforme ? "a_jour" : "non_conforme"}
                        size="sm"
                        label={
                          a.conforme
                            ? `< ${SEUIL_LEGIONELLE_UFC_PAR_L} UFC/L`
                            : `≥ ${SEUIL_LEGIONELLE_UFC_PAR_L} UFC/L — action`
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  mono = false,
  accent,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  accent?: "alert";
}) {
  return (
    <div className="px-5 py-5">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          (mono
            ? "mt-1 font-mono text-[1rem] "
            : "mt-1 text-[1.5rem] ") +
          "font-semibold tabular-nums"
        }
        style={{
          color: accent === "alert" ? "var(--minium)" : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}
