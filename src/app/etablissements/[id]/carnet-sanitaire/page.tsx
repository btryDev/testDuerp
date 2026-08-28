import { AppTopbar } from "@/components/layout/AppTopbar";
import {
  LegalBadge,
  PastilleFiche,
  StatusPill,
  WhyCard,
} from "@/components/ui-kit";
import { AjoutPointReleveForm } from "@/components/carnet-sanitaire/AjoutPointReleveForm";
import { AjoutReleveForm } from "@/components/carnet-sanitaire/AjoutReleveForm";
import { AjoutAnalyseForm } from "@/components/carnet-sanitaire/AjoutAnalyseForm";
import { GraphTemperatures } from "@/components/carnet-sanitaire/GraphTemperatures";
import { requireEtablissement } from "@/lib/auth/scope";
import { getCarnetSanitaire } from "@/lib/carnet-sanitaire/queries";
import { listerBatimentsDeLEtablissement } from "@/lib/batiments/queries";
import {
  LABEL_RESEAU,
  SEUIL_LEGIONELLE_UFC_PAR_L,
} from "@/lib/carnet-sanitaire/schema";
import { formaterDateCourteFr } from "@/lib/dates";

export const metadata = {
  title: "Carnet sanitaire eau",
};

function formatDate(d: Date): string {
  return formaterDateCourteFr(d);
}

export default async function CarnetSanitairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const carnet = await getCarnetSanitaire(id);
  const batiments = await listerBatimentsDeLEtablissement(id);

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

      {/* Écran d'application plein : la gouttière règle la largeur utile,
          pas un `max-w-*` centré (charte § 5). */}
      <main className="flex flex-1 flex-col gap-7 bg-[color:var(--board-canvas)] px-[var(--board-gutter)] pt-7 pb-20">
        {/* Why */}
        <WhyCard
          charte="board"
          kicker="Pourquoi ce carnet"
          titre="Légionellose — risque mortel, risque contrôlable."
          enjeu="Les légionelles se développent dans les réseaux d'eau chaude sanitaire entre 25 et 45°C. Maintenir l'eau au-dessus de 50°C au puisage est la prévention la plus efficace. Le carnet prouve que vous le faites."
          tonalite="info"
        >
          <div className="mt-3 flex flex-wrap gap-2">
            <LegalBadge
              charte="board"
              reference="Arrêté du 1er février 2010"
              href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000021790390/"
              extrait="Le responsable des installations de production, de stockage et de distribution d'eau chaude sanitaire s'assure de la bonne surveillance des installations notamment par un carnet sanitaire dans lequel sont consignées toutes les opérations réalisées."
            />
            <LegalBadge
              charte="board"
              reference="Art. R1321-23 CSP"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006908173"
            />
          </div>
        </WhyCard>

        {/* Résumé — quatre chiffres dans une seule carte. Le filet vertical
            qui les sépare est plein : le board n'a pas de pointillé, il
            sépare par un trait ou pas du tout. */}
        {carnet && (
          <div className="carte-board grid grid-cols-2 divide-x divide-[color:var(--board-slate-line)] sm:grid-cols-4">
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
              mention={
                derniereAnalyse?.conforme === false ? "Écart relevé" : undefined
              }
            />
          </div>
        )}

        {/* Points de relevé */}
        <section className="flex flex-col gap-5">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                01 · Points de relevé
              </p>
              <h2 className="board-titre m-0 mt-1.5 text-[22px]">
                Vos installations
              </h2>
              <p className="m-0 mt-1.5 max-w-[66ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Déclarez chaque point où vous mesurez la température (points de
                puisage les plus éloignés du ballon, points sensibles).
              </p>
            </div>
            <AjoutPointReleveForm etablissementId={id} batiments={batiments} />
          </header>

          {!carnet || nbPoints === 0 ? (
            <div className="rounded-[22px] bg-[color:var(--board-slate-pale)] px-6 py-6 text-center">
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Aucun point de relevé configuré. Commencez par ajouter vos
                principaux points de puisage pour démarrer le suivi.
              </p>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-5 p-0">
              {carnet.pointsReleve.map((p) => {
                const tempActuelle =
                  p.releves[0]?.temperatureCelsius ?? null;
                const dansLaPlage = p.releves[0]?.conforme ?? null;
                return (
                  <li key={p.id} className="carte-board">
                    <div className="flex flex-wrap items-start justify-between gap-3 px-7 pb-3 pt-6 sm:px-8">
                      <div>
                        <p className="m-0 text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--board-ink)]">
                          {p.nom}
                        </p>
                        <p className="board-eyebrow m-0 mt-1 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                          {LABEL_RESEAU[p.typeReseau]}
                          {p.localisation && ` · ${p.localisation}`}
                          {" · seuil "}
                          {p.typeReseau === "EFS" ? "max" : "min"}{" "}
                          {p.seuilMinCelsius}°C
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {tempActuelle !== null && (
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Rien ne peint « dans la plage » : le board n'a
                                pas de couleur qui veuille dire « conforme »,
                                et une mesure attendue n'est pas un fait
                                accompli. La mesure porte l'encre courante ;
                                seul l'écart prend le signal. */}
                            <p
                              className="m-0 font-mono text-[22px] font-semibold tabular-nums"
                              style={{
                                color: dansLaPlage
                                  ? "var(--board-ink)"
                                  : "var(--board-signal-ink)",
                              }}
                            >
                              {tempActuelle.toFixed(1)}°
                            </p>
                            <StatusPill
                              charte="board"
                              size="sm"
                              status={dansLaPlage ? "a_jour" : "non_conforme"}
                              label={dansLaPlage ? "Dans la plage" : undefined}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-7 pb-5 sm:px-8">
                      <GraphTemperatures
                        releves={p.releves}
                        seuilMinCelsius={p.seuilMinCelsius}
                        typeReseau={p.typeReseau}
                      />
                    </div>

                    <div className="border-t border-[color:var(--board-slate-line)] px-7 py-5 sm:px-8">
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
        <section className="flex flex-col gap-5">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                02 · Analyses légionelles
              </p>
              <h2 className="board-titre m-0 mt-1.5 text-[22px]">
                Prélèvements et résultats laboratoire
              </h2>
              <p className="m-0 mt-1.5 max-w-[66ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Fréquence recommandée : annuelle minimum, semestrielle pour les
                ERP sensibles (EHPAD, hôpitaux).
              </p>
            </div>
            <AjoutAnalyseForm etablissementId={id} />
          </header>

          {!carnet || carnet.analyses.length === 0 ? (
            <div className="rounded-[22px] bg-[color:var(--board-slate-pale)] px-6 py-6 text-center">
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Aucune analyse enregistrée. Conservez les rapports de
                laboratoire pour pouvoir les présenter en cas de contrôle.
              </p>
            </div>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {carnet.analyses.map((a) => (
                <li key={a.id} className="carte-board px-7 py-6 sm:px-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--board-ink)]">
                        Analyse du {formatDate(a.dateAnalyse)}
                        {a.laboratoire && (
                          <span className="font-normal text-[color:var(--board-slate-mid)]">
                            {" "}
                            · {a.laboratoire}
                          </span>
                        )}
                      </p>
                      {a.commentaire && (
                        <p className="m-0 mt-1.5 max-w-[66ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                          {a.commentaire}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {a.valeurUfcParL !== null && (
                        <p
                          className="m-0 font-mono text-[22px] font-semibold tabular-nums"
                          style={{
                            color: a.conforme
                              ? "var(--board-ink)"
                              : "var(--board-signal-ink)",
                          }}
                        >
                          {/* nombre, pas une date : séparateurs de milliers */}
                          {a.valeurUfcParL.toLocaleString("fr-FR")}
                          <span className="ml-1 text-[11px] font-medium text-[color:var(--board-slate-mid)]">
                            UFC/L
                          </span>
                        </p>
                      )}
                      <StatusPill
                        charte="board"
                        size="sm"
                        status={a.conforme ? "a_jour" : "non_conforme"}
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
  mention,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  /** Ce que le chiffre appelle, en toutes lettres. Le papier ne peignait
   *  que la valeur en rouge ; une signalétique qui tient à une couleur
   *  disparaît en niveaux de gris et pour qui n'y voit pas (interdit 10). */
  mention?: string;
}) {
  return (
    <div className="px-6 py-5">
      <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
        {label}
      </p>
      <p
        className={
          (mono
            ? "m-0 mt-1.5 font-mono text-[15px] "
            : "m-0 mt-1.5 text-[24px] ") +
          "font-semibold tabular-nums"
        }
        style={{
          color: mention ? "var(--board-signal-ink)" : "var(--board-ink)",
        }}
      >
        {value}
      </p>
      {mention && (
        <div className="mt-2">
          <PastilleFiche ton="retard">{mention}</PastilleFiche>
        </div>
      )}
    </div>
  );
}
