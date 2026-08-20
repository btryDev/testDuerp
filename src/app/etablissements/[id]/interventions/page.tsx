import { AppTopbar } from "@/components/layout/AppTopbar";
import { LegalBadge, WhyCard } from "@/components/ui-kit";
import { EmptyState } from "@/components/layout/EmptyState";
import { TicketCard } from "@/components/interventions/TicketCard";
import { NouveauTicketTrigger } from "@/components/interventions/NouveauTicketTrigger";
import { requireEtablissement } from "@/lib/auth/scope";
import {
  listInterventions,
  listRisquesEtablissement,
} from "@/lib/interventions/queries";
import { LABEL_STATUT } from "@/lib/interventions/schema";
import type { Intervention, StatutIntervention } from "@prisma/client";

export const metadata = {
  title: "Interventions",
};

const COLONNES: { statut: StatutIntervention; ton: string }[] = [
  { statut: "ouvert", ton: "var(--minium)" },
  { statut: "assigne", ton: "var(--warn)" },
  { statut: "en_cours", ton: "var(--warm)" },
  { statut: "fait", ton: "var(--accent-vif)" },
];

export default async function InterventionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const [interventions, risques] = await Promise.all([
    listInterventions(id),
    listRisquesEtablissement(id),
  ]);

  // Horloge lue une fois pour toute la page : deux `new Date()` séparés
  // peuvent tomber de part et d'autre de minuit et faire diverger deux
  // cartes du même tableau (ADR-011).
  const aujourdhui = new Date();

  const parColonne = new Map<StatutIntervention, Intervention[]>();
  // Ce que le calendrier ne peut pas montrer : sans échéance, une
  // intervention n'a pas de jour où se poser (ADR-010). Le plan d'actions
  // annonce déjà ses actions « à dater » ; les interventions, elles,
  // n'avaient aucun compteur — cet écran était leur seul lieu d'existence,
  // et il ne le disait pas.
  const sansEcheance = interventions.filter(
    (i) => i.echeance === null && i.statut !== "fait" && i.statut !== "annule",
  ).length;

  for (const col of COLONNES) parColonne.set(col.statut, []);
  for (const it of interventions) {
    if (it.statut === "annule") continue;
    const arr = parColonne.get(it.statut) ?? [];
    arr.push(it);
    parColonne.set(it.statut, arr);
  }

  return (
    <>
      <AppTopbar
        title="Interventions"
        subtitle="Dysfonctionnements signalés et suivis jusqu'à leur clôture — boucle avec le DUERP."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Interventions" },
        ]}
        actions={
          <NouveauTicketTrigger
            etablissementId={id}
            risques={risques}
            label="+ Nouveau"
          />
        }
      />

      <main className="mx-auto max-w-7xl px-8 py-8 pb-16">
        <WhyCard
          kicker="Pourquoi les interventions"
          titre="Le quotidien, c'est 80% du risque réel."
          enjeu="Un extincteur déplacé, une porte qui coince, une ampoule grillée, une fuite — chaque signalement que vous tracez aujourd'hui est une preuve de diligence demain."
          tonalite="info"
        >
          <p>
            L&apos;article <strong>R4224-17 du Code du travail</strong> impose
            le maintien des lieux de travail en conformité. L&apos;inspection
            du travail vérifie la <strong>traçabilité</strong> — un tableau
            d&apos;interventions vaut mille classeurs.
          </p>
          <div className="mt-3">
            <LegalBadge
              reference="Art. R4224-17 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530333"
            >
              Chaque intervention liée à un risque du DUERP déclenche
              automatiquement sa réévaluation à la clôture. Votre DUERP reste{" "}
              <em>vivant</em>.
            </LegalBadge>
          </div>
        </WhyCard>

        {interventions.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              titre="Vos interventions"
              pourquoi="Chaque dysfonctionnement constaté doit être tracé : c'est la preuve que vous gérez activement la conformité quotidienne. En cas d'accident ou de contrôle, c'est cet historique qui protège."
              quoiFaire="Créez votre première intervention. Une photo depuis votre téléphone, un titre, une priorité — et c'est tracé."
            />
            <div className="mt-4">
              <NouveauTicketTrigger
                etablissementId={id}
                risques={risques}
                label="+ Créer ma première intervention"
              />
            </div>
          </div>
        ) : (
          <section className="mt-10">
            {sansEcheance > 0 ? (
              <p className="mb-4 text-[0.85rem] text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  {sansEcheance} intervention{sansEcheance > 1 ? "s" : ""} sans
                  échéance
                </strong>{" "}
                — elle{sansEcheance > 1 ? "s n'apparaissent" : " n'apparaît"} pas
                au calendrier tant qu&apos;aucune date ne leur est donnée.
              </p>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COLONNES.map((col) => {
                const items = parColonne.get(col.statut) ?? [];
                return (
                  <div
                    key={col.statut}
                    className="flex flex-col rounded-2xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)]/60 p-3"
                  >
                    <div className="mb-3 flex items-baseline justify-between px-1">
                      <p
                        className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: col.ton }}
                      >
                        {LABEL_STATUT[col.statut]}
                      </p>
                      <span className="font-mono text-[0.72rem] font-semibold text-muted-foreground">
                        {items.length}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {items.length === 0 ? (
                        <li className="rounded-lg border border-dashed border-[color:var(--rule)] bg-transparent py-6 text-center text-[0.78rem] text-muted-foreground">
                          Vide
                        </li>
                      ) : (
                        items.map((it) => (
                          <li key={it.id}>
                            <TicketCard
                              etablissementId={id}
                              intervention={it}
                              aujourdhui={aujourdhui}
                            />
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
