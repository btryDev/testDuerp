import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  CarteFiche,
  LegalBadge,
  LigneFiche,
  LignesFiche,
  PastilleFiche,
  TuileDate,
  TuileMuette,
  WhyCard,
} from "@/components/ui-kit";
import { requireEtablissement } from "@/lib/auth/scope";
import { ETAT_PLAN } from "@/lib/plan-prevention/etats";
import { listPlansPrevention } from "@/lib/plan-prevention/queries";
import { classerDate, type RegistreLigne } from "@/lib/calendrier/etats";
import { formaterDateCourteFr } from "@/lib/dates";

export const metadata = {
  title: "Plans de prévention",
};


/**
 * Le registre des plans de prévention, en charte board — jumeau de l'écran
 * des permis de feu, et bâti sur le même patron de liste : bandeau bord à
 * bord, gouttière `--board-gutter`, lignes du kit `fiche/`.
 *
 * Ce qu'il remplace : `AppTopbar`, colonne `max-w-4xl`, `cartouche` coiffé
 * d'un filet de couleur, et un `EmptyState` en charte papier.
 */
export default async function PlanPreventionListePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const plans = await listPlansPrevention(id);
  const maintenant = new Date();

  return (
    <main className="flex flex-1 flex-col bg-[color:var(--board-canvas)] pb-16">
      <header className="border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-card)] px-[var(--board-gutter)] py-[22px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href={`/etablissements/${id}`}
              className="board-eyebrow inline-flex items-center gap-2 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)] transition-colors hover:text-[color:var(--board-ink)]"
            >
              <ArrowLeft className="size-3" aria-hidden />
              {etablissement.raisonDisplay}
            </Link>
            <h1 className="board-titre m-0 mt-2.5 text-[clamp(22px,2.2vw,27px)]">
              Plans de prévention
            </h1>
            <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
              Obligatoire pour toute entreprise extérieure qui intervient chez
              vous.
            </p>
          </div>

          <Link
            href={`/etablissements/${id}/plan-prevention/nouveau`}
            className={buttonVariants({ variant: "board", size: "board" })}
          >
            <Plus className="size-3.5" aria-hidden />
            Nouveau plan
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-7 px-[var(--board-gutter)] pt-6">
        {plans.length === 0 ? (
          /* État vide, pas état d'erreur : il dit ce que l'écran fera, d'où
             viendront les données, et ouvre une porte (charte § 6). */
          <section className="carte-board px-7 py-8 sm:px-8">
            <div className="flex max-w-[62ch] flex-col gap-3">
              <h2 className="board-titre m-0 text-[22px]">
                Vos plans de prévention
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Dès qu&apos;une entreprise extérieure intervient chez vous
                (nettoyage, entretien, travaux, livraisons régulières…), vous
                devez analyser conjointement les risques d&apos;interférence.
                Cette liste conserve l&apos;historique de ces analyses.
              </p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Créez un plan pour votre prochaine intervention. Commencez par
                le diagnostic intégré : l&apos;outil vous dit si un plan écrit
                est obligatoire ou si un plan recommandé suffit.
              </p>
              <div className="mt-2">
                <Link
                  href={`/etablissements/${id}/plan-prevention/nouveau`}
                  className={buttonVariants({
                    variant: "board",
                    size: "board",
                  })}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Créer un plan de prévention
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* Pas de sur-titre sur la carte : le `h1` nomme déjà la vue
             (interdit 12). */
          <CarteFiche corpsClassName="py-1.5">
            <LignesFiche>
              {plans.map((p) => {
                // Un plan clos est un acquis quelle que soit sa date. Un plan
                // annulé n'a plus de rendez-vous : lui peindre une tuile-date
                // annoncerait une intervention qui n'aura pas lieu.
                const etat: RegistreLigne =
                  p.statut === "clos"
                    ? "faite"
                    : classerDate(p.dateDebut, maintenant);
                const nbRisques = p._count.lignes;
                return (
                  <LigneFiche
                    key={p.id}
                    href={`/etablissements/${id}/plan-prevention/${p.id}`}
                    tuile={
                      p.statut === "annule" ? (
                        <TuileMuette>Annulé</TuileMuette>
                      ) : (
                        <TuileDate date={p.dateDebut} etat={etat} />
                      )
                    }
                    surtitre={
                      <span className="tabular-nums">
                        PP-{String(p.numero).padStart(3, "0")}
                      </span>
                    }
                    titre={p.entrepriseExterieureRaison}
                    detail={
                      <>
                        {nbRisques} risque{nbRisques > 1 ? "s" : ""} identifié
                        {nbRisques > 1 ? "s" : ""}
                        <span className="mt-0.5 block font-mono text-[11.5px] tabular-nums text-[color:var(--board-slate-soft)]">
                          Du {formaterDateCourteFr(p.dateDebut)} au{" "}
                          {formaterDateCourteFr(p.dateFin)}
                          {p.dureeHeuresEstimee
                            ? ` · ${p.dureeHeuresEstimee} h`
                            : ""}
                        </span>
                      </>
                    }
                    droite={
                      <PastilleFiche ton={ETAT_PLAN[p.statut].ton}>
                        {ETAT_PLAN[p.statut].mot}
                      </PastilleFiche>
                    }
                  />
                );
              })}
            </LignesFiche>
          </CarteFiche>
        )}

        <WhyCard
          charte="board"
          kicker="Pourquoi cette page"
          titre="Protéger les deux parties contre les risques d'interférence."
          enjeu="Une entreprise qui intervient chez vous fait intervenir son personnel dans votre environnement : si un accident survient faute d'analyse conjointe, votre responsabilité est engagée."
          tonalite="info"
        >
          <p className="m-0">
            Le plan de prévention est <strong>écrit obligatoire</strong> si les
            travaux atteignent <strong>400 h sur 12 mois</strong> OU figurent sur
            la liste des travaux dangereux de l&apos;arrêté du 19-03-1993. Dans
            tous les cas, une inspection commune préalable est imposée.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LegalBadge
              charte="board"
              reference="Art. R4512-6 à R4512-12 CT"
              href="https://www.legifrance.gouv.fr/codes/id/LEGISCTA000018529787/"
            />
            <LegalBadge charte="board" reference="Décret 92-158" />
            <LegalBadge
              charte="board"
              reference="Arrêté 19-03-1993 — liste dangereuse"
            />
          </div>
        </WhyCard>
      </div>
    </main>
  );
}
