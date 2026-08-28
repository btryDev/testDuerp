import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  CarteFiche,
  LegalBadge,
  LignesFiche,
  WhyCard,
} from "@/components/ui-kit";
import { PermisFeuCard } from "@/components/permis-feu/PermisFeuCard";
import { requireEtablissement } from "@/lib/auth/scope";
import { listPermisFeu } from "@/lib/permis-feu/queries";

export const metadata = {
  title: "Permis de feu",
};

/**
 * Le registre des permis de feu, en charte board (`docs/charte-board.md`).
 *
 * L'écran était en charte papier : `AppTopbar`, colonne centrée
 * `max-w-4xl`, `cartouche`, et un `EmptyState` qui porte la même dette. Il
 * suit désormais le patron de liste du board — bandeau bord à bord,
 * gouttière `--board-gutter`, lignes du kit `fiche/`.
 *
 * Le « pourquoi cette page » est passé en pied, comme sur l'annuaire des
 * prestataires : on le lit une fois, on ne le relit pas à chaque visite,
 * et ce qu'on vient chercher ici est la liste.
 */
export default async function PermisFeuListePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const permis = await listPermisFeu(id);

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
              Permis de feu
            </h1>
            <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
              Obligatoire avant tout travail par point chaud (soudage, découpe,
              meulage…).
            </p>
          </div>

          <Link
            href={`/etablissements/${id}/permis-feu/nouveau`}
            className={buttonVariants({ variant: "board", size: "board" })}
          >
            <Plus className="size-3.5" aria-hidden />
            Nouveau permis
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-7 px-[var(--board-gutter)] pt-6">
        {permis.length === 0 ? (
          /* État vide, pas état d'erreur : il dit ce que l'écran fera, d'où
             viendront les données, et ouvre une porte (charte § 6). */
          <section className="carte-board px-7 py-8 sm:px-8">
            <div className="flex max-w-[62ch] flex-col gap-3">
              <h2 className="board-titre m-0 text-[22px]">
                Vos permis de feu
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Chaque travail par point chaud réalisé chez vous doit faire
                l&apos;objet d&apos;un permis signé conjointement avec le
                prestataire avant démarrage. Cette liste vous permet de
                retrouver l&apos;historique complet.
              </p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Créez votre premier permis dès qu&apos;un soudeur, un plombier
                au chalumeau, un couvreur au fer chaud intervient sur site.
              </p>
              <div className="mt-2">
                <Link
                  href={`/etablissements/${id}/permis-feu/nouveau`}
                  className={buttonVariants({
                    variant: "board",
                    size: "board",
                  })}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Créer un permis de feu
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* Pas de sur-titre sur la carte : le `h1` nomme déjà la vue
             (interdit 12). Le corps laisse les lignes poser leurs propres
             gouttières. */
          <CarteFiche corpsClassName="py-1.5">
            <LignesFiche>
              {permis.map((p) => (
                <PermisFeuCard key={p.id} etablissementId={id} permis={p} />
              ))}
            </LignesFiche>
          </CarteFiche>
        )}

        <WhyCard
          charte="board"
          kicker="Pourquoi cette page"
          titre="Un permis de feu = votre assurance et votre preuve."
          enjeu="80 % des incendies de travaux se déclarent après le chantier, pendant la surveillance. Un permis signé engage le prestataire et vous protège."
          tonalite="info"
        >
          <p className="m-0">
            Ce n&apos;est pas imposé par un article unique du Code du travail,
            mais par un <strong>faisceau d&apos;obligations</strong> : sécurité
            incendie du bâtiment, exigence quasi-systématique des assureurs
            (APSAD R43), règlement ERP (art. MS 52) pour les travaux en ERP.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LegalBadge
              charte="board"
              reference="INRS ED 6030"
              href="https://www.inrs.fr/media.html?refINRS=ED%206030"
            >
              Recommandation de référence — checklist officielle des mesures
              préventives avant, pendant, après.
            </LegalBadge>
            <LegalBadge
              charte="board"
              reference="Art. R4224-17 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530333"
            />
            <LegalBadge charte="board" reference="MS 52 ERP · APSAD R43" />
          </div>
        </WhyCard>
      </div>
    </main>
  );
}
