import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { BadgeOrigine } from "@/components/actions/BadgeOrigine";
import { BadgeStatutAction } from "@/components/actions/BadgeStatutAction";
import { getEtablissement } from "@/lib/etablissements/queries";
import {
  compterActions,
  listerActions,
  origineDeLAction,
  type OrigineAction,
} from "@/lib/actions/queries";
import { LABEL_TYPE_ACTION } from "@/lib/actions/labels";

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ORIGINES_UI: { key: OrigineAction; label: string }[] = [
  { key: "duerp", label: "DUERP" },
  { key: "verification", label: "Vérifications" },
  { key: "libre", label: "Libres" },
];

export default async function PlanActionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ origine?: string; enCours?: string }>;
}) {
  const { id } = await params;
  const { origine, enCours } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const origineFiltre = ORIGINES_UI.find((o) => o.key === origine)?.key;
  // Défaut : plan d'actions = ce qu'il reste à faire (ouverte/en_cours).
  // L'utilisateur peut passer `?enCours=0` pour inclure les levées/abandons
  // dans une vue audit (même route, cf. toggle ci-dessous).
  const enCoursSeulement = enCours !== "0";

  const [actions, compteurs] = await Promise.all([
    listerActions(id, {
      origine: origineFiltre,
      enCoursSeulement,
    }),
    compterActions(id),
  ]);
  // eslint-disable-next-line react-hooks/purity -- server component, Date.now() lu à chaque rendu côté serveur
  const maintenant = Date.now();

  const baseHref = `/etablissements/${id}/actions`;
  const makeHref = (over: {
    origine?: string;
    enCours?: string;
  }): string => {
    const p = new URLSearchParams();
    const o = over.origine ?? origineFiltre;
    if (o) p.set("origine", o);
    // L'état "en cours seulement" est le défaut implicite (pas de param).
    // Seul le mode "tout afficher" est explicite via ?enCours=0.
    const e = over.enCours ?? (enCoursSeulement ? undefined : "0");
    if (e !== undefined) p.set("enCours", e);
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
          <p className="label-admin">Plan d&apos;actions de conformité</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            Actions correctives
          </h1>
          <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Vue unifiée des actions issues du DUERP (mesures de prévention
            prévues) et des rapports de vérification (levées d&apos;écart).
            Hiérarchie L. 4121-2 appliquée aux mesures du DUERP.
          </p>
        </div>
        <a
          href={`/api/etablissements/${id}/plan-actions/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Exporter PDF
        </a>
      </header>

      {/* Indicateurs */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            À couvrir
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{compteurs.totalACouvrir}</p>
        </div>
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            En cours
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{compteurs.enCours}</p>
        </div>
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            En retard
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{compteurs.enRetard}</p>
        </div>
        <div className="cartouche px-5 py-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Levées (30 j)
          </p>
          <p className="mt-1 text-[1.6rem] font-semibold">{compteurs.leveesRecemment}</p>
        </div>
      </section>

      {/* Filtres */}
      <section className="mt-8 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Origine :
        </span>
        <Link
          href={makeHref({ origine: "" })}
          className={
            "rounded-full border px-3 py-1 text-[0.78rem] " +
            (!origineFiltre
              ? "border-ink bg-ink text-paper"
              : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
          }
        >
          Toutes
        </Link>
        {ORIGINES_UI.map((o) => (
          <Link
            key={o.key}
            href={makeHref({ origine: o.key })}
            className={
              "rounded-full border px-3 py-1 text-[0.78rem] " +
              (origineFiltre === o.key
                ? "border-ink bg-ink text-paper"
                : "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink")
            }
          >
            {o.label}
          </Link>
        ))}
        <Link
          href={
            enCoursSeulement
              ? makeHref({ enCours: "0" }) // basculer vers « tout afficher »
              : makeHref({ enCours: "" }) // retour au défaut
          }
          className={
            "ml-4 rounded-full border px-3 py-1 text-[0.78rem] " +
            (enCoursSeulement
              ? "border-rule bg-paper-sunk/40 text-muted-foreground hover:border-ink"
              : "border-amber-600 bg-amber-100 text-amber-900")
          }
        >
          {enCoursSeulement ? "Inclure levées / abandons" : "✓ Toutes (levées incluses)"}
        </Link>
      </section>

      <div className="filet-pointille my-10" />

      {actions.length === 0 ? (
        origineFiltre ? (
          <div className="cartouche px-6 py-10 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucune action ne correspond à ce filtre — retirez-le pour
              revoir tout le plan.
            </p>
          </div>
        ) : enCoursSeulement && compteurs.leveesRecemment > 0 ? (
          <div className="cartouche px-6 py-10 sm:px-8">
            <p className="text-[0.9rem] text-muted-foreground">
              Aucune action à couvrir actuellement.{" "}
              <Link
                href={makeHref({ enCours: "0" })}
                className="text-ink underline decoration-rule decoration-dotted underline-offset-[3px] hover:decoration-ink"
              >
                Voir aussi les {compteurs.leveesRecemment} levée
                {compteurs.leveesRecemment > 1 ? "s" : ""} récente
                {compteurs.leveesRecemment > 1 ? "s" : ""}
              </Link>
              .
            </p>
          </div>
        ) : (
          <EmptyState
            titre="Le plan d'actions regroupe ce que vous avez à corriger"
            pourquoi="Deux origines possibles. (1) Les mesures de prévention prévues dans votre DUERP — elles remontent automatiquement ici. (2) Les écarts détectés sur un rapport de vérification — vous créez l'action depuis la page de la vérification concernée. Dans les deux cas, vous pouvez les clôturer avec un commentaire de levée."
            quoiFaire="depuis une vérification avec un résultat « observations » ou « écart majeur », cliquez sur « + Créer une action corrective ». Ou continuez à remplir votre DUERP — les mesures s'ajouteront seules."
            ctaSecondary={{
              libelle: "Ouvrir le registre de sécurité",
              href: `/etablissements/${id}/registre`,
            }}
          />
        )
      ) : (
        <ul className="cartouche divide-y divide-dashed divide-rule/50">
          {actions.map((a) => {
            const origine = origineDeLAction(a);
            const echeanceDepassee =
              a.echeance && a.echeance.getTime() < maintenant &&
              (a.statut === "ouverte" || a.statut === "en_cours");
            return (
              <li
                key={a.id}
                className="flex items-start justify-between gap-4 px-6 py-4 sm:px-8"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[0.95rem] font-semibold">{a.libelle}</p>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {LABEL_TYPE_ACTION[a.type]}
                    <span className="mx-2 text-rule">·</span>
                    Échéance : {formatDate(a.echeance)}
                    {a.responsable && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        {a.responsable}
                      </>
                    )}
                    {a.criticite !== null && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        Criticité {a.criticite}
                      </>
                    )}
                    {a.verification && (
                      <>
                        <span className="mx-2 text-rule">·</span>
                        {a.verification.equipement.libelle}
                      </>
                    )}
                  </p>
                  {a.description && (
                    <p className="text-[0.82rem] text-muted-foreground">
                      {a.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <BadgeOrigine origine={origine} />
                    <BadgeStatutAction statut={a.statut} />
                  </div>
                  {echeanceDepassee && (
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-rose-700">
                      ⚠ dépassée
                    </span>
                  )}
                  <Link
                    href={`/etablissements/${id}/actions/${a.id}`}
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
      )}
    </main>
  );
}
