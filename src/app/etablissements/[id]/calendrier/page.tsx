import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
import { GenererCalendrierButton } from "@/components/calendrier/GenererCalendrierButton";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { genererCalendrier } from "@/lib/calendrier/actions";
import {
  compterEtatCalendrier,
  grouperParMois,
  listerVerifications,
} from "@/lib/calendrier/queries";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  libelleMois,
} from "@/lib/calendrier/labels";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

const DOMAINES_P1: DomaineObligation[] = ["electricite", "incendie", "aeration"];

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function CalendrierPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    domaine?: string;
    urgent?: string;
  }>;
}) {
  const { id } = await params;
  const { domaine, urgent } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const filtreDomaine = DOMAINES_P1.includes(domaine as DomaineObligation)
    ? (domaine as DomaineObligation)
    : undefined;
  const filtreUrgent = urgent === "1";

  // Self-healing : si l'utilisateur a des équipements déclarés mais aucune
  // vérification en base, on génère automatiquement. Couvre les anciens
  // comptes pré-auto-génération et les rares cas où une mutation a échoué
  // silencieusement à régénérer.
  const etat0 = await compterEtatCalendrier(id);
  if (
    etat0.enRetard === 0 &&
    etat0.aPlanifier === 0 &&
    etat0.aVenir === 0 &&
    etat0.realisees12m === 0
  ) {
    const nbEquipements = (await listerEquipementsDeLEtablissement(id)).length;
    if (nbEquipements > 0) {
      await genererCalendrier(id);
    }
  }

  const [verifs, etat] = await Promise.all([
    listerVerifications(id, {
      domaine: filtreDomaine,
      urgentsSeulement: filtreUrgent,
    }),
    compterEtatCalendrier(id),
  ]);
  const parMois = grouperParMois(verifs);

  const baseHref = `/etablissements/${id}/calendrier`;
  const makeHref = (over: { domaine?: string; urgent?: string }) => {
    const p = new URLSearchParams();
    const d = over.domaine ?? filtreDomaine;
    if (d) p.set("domaine", d);
    if (over.urgent ?? (filtreUrgent ? "1" : undefined)) p.set("urgent", "1");
    const q = p.toString();
    return q ? `${baseHref}?${q}` : baseHref;
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etab.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Calendrier des vérifications</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            Vérifications périodiques
          </h1>
          <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Le calendrier se met à jour automatiquement dès que vous ajoutez
            ou modifiez un équipement. Chaque occurrence cite son obligation
            légale et le profil de réalisateur requis.
          </p>
        </div>
        <GenererCalendrierButton
          etablissementId={id}
          variant="outline"
          libelle="Actualiser"
        />
      </header>

      {/* Indicateurs */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            En retard / à planifier
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{etat.enRetard}</p>
        </div>
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Sous 30 jours
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{etat.aVenir}</p>
        </div>
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Réalisées (12 mois)
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{etat.realisees12m}</p>
        </div>
      </section>

      {/* Filtres */}
      <section className="mt-8 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Filtrer :
        </span>
        <Link
          href={makeHref({ domaine: "" })}
          className={
            "rounded-full border px-3 py-1 text-[0.78rem] " +
            (!filtreDomaine
              ? "border-ink bg-ink text-paper"
              : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
          }
        >
          Tous domaines
        </Link>
        {DOMAINES_P1.map((d) => (
          <Link
            key={d}
            href={makeHref({ domaine: d })}
            className={
              "rounded-full border px-3 py-1 text-[0.78rem] " +
              (filtreDomaine === d
                ? "border-ink bg-ink text-paper"
                : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
            }
          >
            {LABEL_DOMAINE[d]}
          </Link>
        ))}
        <Link
          href={
            filtreUrgent
              ? makeHref({ urgent: "" }).replace(/&?urgent=1/, "")
              : makeHref({ urgent: "1" })
          }
          className={
            "ml-4 rounded-full border px-3 py-1 text-[0.78rem] " +
            (filtreUrgent
              ? "border-rose-600 bg-rose-100 text-rose-900"
              : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
          }
        >
          {filtreUrgent ? "✓ " : ""}Urgents seulement
        </Link>
      </section>

      <div className="filet-pointille my-10" />

      {verifs.length === 0 ? (
        etat.enRetard === 0 &&
        etat.aPlanifier === 0 &&
        etat.aVenir === 0 &&
        etat.realisees12m === 0 ? (
          <EmptyState
            titre="Votre calendrier de vérifications périodiques"
            pourquoi="Le Code du travail et le règlement ERP imposent de vérifier certains équipements à fréquence fixe (extincteurs tous les ans, électricité tous les ans, etc.). L'outil calcule ces échéances à partir des équipements que vous avez déclarés."
            quoiFaire={
              filtreDomaine || filtreUrgent
                ? "retirez les filtres ci-dessus pour voir l'ensemble de vos vérifications."
                : "déclarez vos équipements — le calendrier se remplira automatiquement."
            }
            ctaSecondary={{
              libelle: "Déclarer mes équipements",
              href: `/etablissements/${id}/equipements`,
            }}
          />
        ) : (
          <div className="cartouche px-6 py-10 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucune vérification ne correspond à ces filtres — essayez de les
              retirer pour tout voir.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-10">
          {[...parMois.entries()].map(([cleMois, liste]) => (
            <section key={cleMois} className="space-y-4">
              <h2 className="text-[1rem] font-semibold tracking-[-0.012em] capitalize">
                {libelleMois(cleMois)}
                <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                  · {liste.length} vérification{liste.length > 1 ? "s" : ""}
                </span>
              </h2>

              <ul className="cartouche divide-y divide-dashed divide-rule/50">
                {liste.map((v) => {
                  const o = obligationParId(v.obligationId);
                  return (
                    <li
                      key={v.id}
                      className="flex items-start justify-between gap-4 px-6 py-4 sm:px-8"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[0.95rem] font-semibold">
                          {v.libelleObligation}
                        </p>
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                          {formatDate(v.datePrevue)}
                          <span className="mx-2 text-rule">·</span>
                          {v.equipement.libelle}
                          <span className="mx-2 text-rule">·</span>
                          {LABEL_PERIODICITE[v.periodicite]}
                          {o && (
                            <>
                              <span className="mx-2 text-rule">·</span>
                              {LABEL_DOMAINE[o.domaine]}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <BadgeStatut statut={v.statut} />
                        <Link
                          href={`/etablissements/${id}/verifications/${v.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Détail
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
