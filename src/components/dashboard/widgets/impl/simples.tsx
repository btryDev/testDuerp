"use client";

// Widgets « simples » sans variant — registre, équipements, DUERP, guide,
// recos. Chacun est une cellule bento ciblée.
//
// Le plan d'actions a migré vers `impl/board.tsx` (rendu en anneau) lors
// de la refonte du tableau de bord ; il garde le même id de registre.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Layers, LayoutGrid } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BentoCell } from "@/components/dashboard/BentoCell";
import { CarteBoard, TitreBloc } from "@/components/dashboard/widgets/impl/board";
import { PictoEquipement } from "@/components/equipements/PictoEquipement";
import { formaterDateFr, formaterJourMoisFr } from "@/lib/dates";
import type { DashboardBundle } from "../types";

function formatDateCourte(d: Date): string {
  return formaterJourMoisFr(d);
}

/* ─── Registre ──────────────────────────────────────────── */

function PillResultat({
  resultat,
}: {
  resultat:
    | "conforme"
    | "observations_mineures"
    | "ecart_majeur"
    | "non_verifiable";
}) {
  if (resultat === "conforme") return <span className="pill-ok">OK</span>;
  if (resultat === "observations_mineures")
    return <span className="pill-warn">Observations</span>;
  if (resultat === "ecart_majeur")
    return <span className="pill-alerte">Écart majeur</span>;
  return <span className="pill-warn">Non vérifiable</span>;
}

export function WidgetRegistre({ bundle }: { bundle: DashboardBundle }) {
  const { rapportsRecents, etablissementId } = bundle;
  return (
    <BentoCell
      kicker="Registre — dernières entrées"
      more={{
        href: `/etablissements/${etablissementId}/registre`,
        label: "Ouvrir",
      }}
    >
      {rapportsRecents.length === 0 ? (
        <p className="text-[0.88rem] text-muted-foreground">
          Aucun rapport déposé pour l&apos;instant.
        </p>
      ) : (
        <table className="w-full border-collapse text-[0.88rem]">
          <thead>
            <tr className="border-b border-rule-soft text-left font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Document</th>
              <th className="py-2 text-right font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rapportsRecents.map((r) => (
              <tr
                key={r.id}
                className="group cursor-pointer border-b border-dashed border-rule-soft transition-colors last:border-b-0 hover:bg-paper-sunk"
              >
                <td className="py-2.5 font-mono text-[0.82rem] text-muted-foreground">
                  <Link
                    href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
                    className="block"
                    aria-label={`Ouvrir ${r.verification.libelleObligation}`}
                  >
                    {formatDateCourte(r.dateRapport)}
                  </Link>
                </td>
                <td className="truncate py-2.5">
                  <Link
                    href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
                    className="block group-hover:underline"
                  >
                    {r.verification.libelleObligation}
                  </Link>
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
                    className="inline-block"
                  >
                    <PillResultat resultat={r.resultat} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </BentoCell>
  );
}

/* ─── Équipements ───────────────────────────────────────── */

function libelleCategorie(c: string): string {
  return c.replace(/_/g, " ").toLowerCase();
}

/** Mini-pastille de signal sur tuile blanche : creux ardoise, point de
 *  couleur + texte encré. Le champ pastel (rose, vert) ne se pose pas
 *  en fond — trop proche en valeur du creux — donc c'est le point qui
 *  porte la couleur. */
function PastilleTuile({
  point,
  encre,
  children,
}: {
  point?: string;
  encre: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--board-slate-pale)] px-2.5 py-[5px] text-[10.5px] font-semibold"
      style={{ color: encre }}
    >
      {point ? (
        <span
          aria-hidden
          className="size-[7px] rounded-full"
          style={{ background: point }}
        />
      ) : null}
      {children}
    </span>
  );
}

/** Filet cheveu + ombre douce des tuiles blanches (bento) — même
 *  recette au repos et au survol, partagée par la tuile appareil et la
 *  ligne de groupe. */
const OMBRE_TUILE =
  "shadow-[0_0_0_1px_rgba(10,10,10,.07),0_14px_30px_-24px_rgba(13,18,36,.35)] transition-shadow hover:shadow-[0_0_0_1px_rgba(10,10,10,.12),0_18px_34px_-22px_rgba(13,18,36,.45)]";

/** Au-delà d'une rangée, le widget se replie : le reste des tuiles se
 *  déplie à la demande pour que la grille ne mange pas toute la page. */
const TUILES_REPLIEES = 4;

/** Signaux d'un équipement, tels que les pastilles les racontent :
 *  « fait » vaut 1 si une vérification a déjà été réalisée. Seule
 *  lecture des stats du bundle — la tuile et le groupe la partagent. */
function signauxEquipement(eq: DashboardBundle["equipements"][number]) {
  return {
    fait: eq.stats?.derniereRealisee ? 1 : 0,
    retard: eq.stats?.enRetard ?? 0,
    aPlanif: eq.stats?.aPlanifier ?? 0,
  };
}

/** Regroupe les équipements par catégorie et agrège leurs signaux —
 *  la vue « par type » quand plusieurs appareils partagent le même
 *  picto. Tri : les familles nombreuses d'abord, alphabétique ensuite. */
function grouperParCategorie(equipements: DashboardBundle["equipements"]) {
  const groupes = new Map<
    string,
    { categorie: string; nb: number; fait: number; retard: number; aPlanif: number }
  >();
  for (const eq of equipements) {
    const g = groupes.get(eq.categorie) ?? {
      categorie: eq.categorie,
      nb: 0,
      fait: 0,
      retard: 0,
      aPlanif: 0,
    };
    const s = signauxEquipement(eq);
    g.nb += 1;
    g.fait += s.fait;
    g.retard += s.retard;
    g.aPlanif += s.aPlanif;
    groupes.set(eq.categorie, g);
  }
  return [...groupes.values()].sort(
    (a, b) => b.nb - a.nb || a.categorie.localeCompare(b.categorie),
  );
}

/** Clé de la vue préférée, voisine du layout perso du board
 *  (`duerp.dashboard.<id>`, cf. useLayoutPerso). */
function cleVueEquipements(etablissementId: string): string {
  return `duerp.equipements-vue.${etablissementId}`;
}

export function WidgetEquipements({ bundle }: { bundle: DashboardBundle }) {
  const { equipements, etablissementId } = bundle;
  const [deplie, setDeplie] = useState(false);
  const totalEq = equipements.length;
  const tuiles = deplie ? equipements : equipements.slice(0, TUILES_REPLIEES);
  const nbReplies = totalEq - TUILES_REPLIEES;
  const groupes = grouperParCategorie(equipements);

  // Deux lectures : la grille de tuiles (un appareil = une carte) ou le
  // regroupement par type — plus lisible quand le parc répète les mêmes
  // catégories. Défaut : la vue regroupée dès qu'un type compte
  // plusieurs appareils ; le choix de l'utilisateur, lui, est mémorisé
  // et prime sur ce défaut (relu après montage — le localStorage
  // n'existe pas côté serveur).
  const [vueTypes, setVueTypes] = useState(
    groupes.some((g) => g.nb > 1),
  );
  useEffect(() => {
    // Même motif d'hydratation que useLayoutPerso : le premier rendu
    // (SSR compris) sert le défaut, le storage n'est relu qu'après
    // montage — d'où le setState dans l'effet.
    try {
      const memo = window.localStorage.getItem(
        cleVueEquipements(etablissementId),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (memo === "types") setVueTypes(true);
      else if (memo === "tuiles") setVueTypes(false);
    } catch {
      // Storage indisponible (navigation privée…) : on garde le défaut.
    }
  }, [etablissementId]);

  // L'écriture storage reste hors de l'updater : un updater doit être
  // pur (StrictMode l'invoque deux fois).
  const basculerVue = () => {
    const suivante = !vueTypes;
    try {
      window.localStorage.setItem(
        cleVueEquipements(etablissementId),
        suivante ? "types" : "tuiles",
      );
    } catch {
      // Tant pis pour la mémorisation, la bascule reste fonctionnelle.
    }
    setVueTypes(suivante);
  };

  return (
    <CarteBoard className="gap-6 px-7 py-[26px]">
      <TitreBloc
        titre="Équipements"
        sousTitre={
          /* `totalEq` compte des appareils, pas des types — le compte
             de types est celui des groupes. */
          `${totalEq} appareil${totalEq > 1 ? "s" : ""} déclaré${totalEq > 1 ? "s" : ""}` +
          (groupes.length > 0 && groupes.length < totalEq
            ? ` · ${groupes.length} type${groupes.length > 1 ? "s" : ""}`
            : "") +
          (!vueTypes && !deplie && nbReplies > 0
            ? ` · ${nbReplies} repliés`
            : "")
        }
        actions={
          <>
            <Link
              href={`/etablissements/${etablissementId}/equipements/nouveau`}
              className="rounded-full bg-[color:var(--board-ink)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
            >
              + Ajouter
            </Link>
            {totalEq > 1 ? (
              <button
                type="button"
                onClick={basculerVue}
                aria-pressed={vueTypes}
                aria-label={
                  vueTypes
                    ? "Revenir à la vue par appareil"
                    : "Regrouper par type d'équipement"
                }
                title={vueTypes ? "Vue par appareil" : "Vue par type"}
                className={
                  "flex size-9 flex-none items-center justify-center rounded-full transition-colors " +
                  (vueTypes
                    ? "bg-[color:var(--board-ink)] text-white"
                    : "border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] hover:bg-[color:var(--board-blue-pale)]")
                }
              >
                {vueTypes ? (
                  <LayoutGrid className="size-4" />
                ) : (
                  <Layers className="size-4" />
                )}
              </button>
            ) : null}
            <Link
              href={`/etablissements/${etablissementId}/equipements`}
              aria-label="Gérer les équipements"
              className="flex size-9 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
            >
              <ChevronRight className="size-4" />
            </Link>
          </>
        }
      />

      {totalEq === 0 ? (
        <p className="text-[13.5px] text-[color:var(--board-slate-mid)]">
          Aucun équipement déclaré pour l&apos;instant.
        </p>
      ) : vueTypes ? (
        // Vue « par type » : une ligne par catégorie, signaux agrégés —
        // le parc se lit d'un coup d'œil quand les appareils se répètent.
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {groupes.map((g) => (
            <li key={g.categorie}>
              <Link
                href={`/etablissements/${etablissementId}/equipements`}
                className={"flex items-center gap-3.5 rounded-[18px] bg-[color:var(--board-card)] px-3.5 py-3 " + OMBRE_TUILE}
              >
                <span className="flex size-12 flex-none items-center justify-center rounded-[14px] bg-[color:var(--board-blue-pale)]">
                  <PictoEquipement categorie={g.categorie} taille={34} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold capitalize leading-[1.25] text-[color:var(--board-ink)]">
                    {libelleCategorie(g.categorie)}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[color:var(--board-slate-mid)]">
                    {g.nb} appareil{g.nb > 1 ? "s" : ""}
                  </span>
                </span>
                <span className="flex flex-none flex-wrap justify-end gap-1.5">
                  {g.retard > 0 ? (
                    <PastilleTuile
                      point="var(--board-signal-mark)"
                      encre="var(--board-signal-ink)"
                    >
                      {g.retard} dépassé{g.retard > 1 ? "s" : ""}
                    </PastilleTuile>
                  ) : null}
                  {g.fait > 0 ? (
                    <PastilleTuile
                      point="var(--board-green)"
                      encre="var(--board-green-ink)"
                    >
                      {g.fait} fait{g.fait > 1 ? "s" : ""}
                    </PastilleTuile>
                  ) : null}
                  {g.aPlanif > 0 ? (
                    <PastilleTuile encre="var(--board-slate-mid)">
                      {g.aPlanif} à planif.
                    </PastilleTuile>
                  ) : null}
                  {!g.fait && !g.retard && !g.aPlanif ? (
                    <PastilleTuile encre="var(--board-slate-soft)">
                      Aucune vérif
                    </PastilleTuile>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tuiles.map((eq) => {
            const { fait, retard, aPlanif } = signauxEquipement(eq);
            const totalSignals = fait + retard + aPlanif;
            const pct = totalSignals
              ? Math.round(100 * (fait / totalSignals))
              : 0;
            const alert = retard > 0;
            return (
              <Link
                key={eq.id}
                href={`/etablissements/${etablissementId}/equipements`}
                className={"group flex flex-col overflow-hidden rounded-[22px] bg-[color:var(--board-card)] " + OMBRE_TUILE}
              >
                {/* Vitrine : champ bleu glacier, pastille de catégorie
                    posée dessus, picto centré. */}
                <div className="relative flex h-[150px] flex-none items-center justify-center bg-[color:var(--board-blue-pale)]">
                  <span className="absolute left-3 top-3 max-w-[calc(100%-24px)] truncate rounded-full bg-[color:var(--board-card)] px-3 py-[6px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-ink)]">
                    {libelleCategorie(eq.categorie)}
                  </span>
                  <PictoEquipement
                    categorie={eq.categorie}
                    taille={92}
                    className="mt-3 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-3.5">
                  <p className="truncate text-[15px] font-semibold leading-[1.25] text-[color:var(--board-ink)]">
                    {eq.libelle}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <div
                      className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-[color:var(--board-slate-pale)]"
                      aria-hidden
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: alert
                            ? "var(--board-signal-mark)"
                            : "var(--board-blue-strong)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] tabular-nums text-[color:var(--board-slate-soft)]">
                      {pct}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2.5">
                    {retard > 0 ? (
                      <PastilleTuile
                        point="var(--board-signal-mark)"
                        encre="var(--board-signal-ink)"
                      >
                        {retard} dépassé{retard > 1 ? "s" : ""}
                      </PastilleTuile>
                    ) : null}
                    {fait > 0 ? (
                      <PastilleTuile
                        point="var(--board-green)"
                        encre="var(--board-green-ink)"
                      >
                        {fait} fait
                      </PastilleTuile>
                    ) : null}
                    {aPlanif > 0 ? (
                      <PastilleTuile encre="var(--board-slate-mid)">
                        {aPlanif} à planif.
                      </PastilleTuile>
                    ) : null}
                    {!fait && !retard && !aPlanif ? (
                      <PastilleTuile encre="var(--board-slate-soft)">
                        Aucune vérif
                      </PastilleTuile>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!vueTypes && nbReplies > 0 ? (
        <button
          type="button"
          onClick={() => setDeplie((d) => !d)}
          className="-mt-2 flex items-center justify-center gap-2 self-center rounded-full bg-[color:var(--board-slate-pale)] px-4 py-2 text-[12.5px] font-semibold text-[color:var(--board-slate-mid)] transition-colors hover:bg-[color:var(--board-slate-line)] hover:text-[color:var(--board-ink)]"
        >
          {deplie
            ? "Réduire"
            : `Afficher les ${nbReplies} autres`}
          <ChevronDown
            className={
              "size-3.5 transition-transform " + (deplie ? "rotate-180" : "")
            }
          />
        </button>
      ) : null}
    </CarteBoard>
  );
}

/* ─── DUERP ─────────────────────────────────────────────── */

export function WidgetDuerp({ bundle }: { bundle: DashboardBundle }) {
  const { duerpDernier } = bundle;
  if (!duerpDernier) {
    return (
      <BentoCell kicker="DUERP">
        <p className="text-[0.88rem] text-muted-foreground">
          Pas encore initié. Il se crée automatiquement dès la première
          unité de travail évaluée.
        </p>
      </BentoCell>
    );
  }
  const derniereVersion = duerpDernier.versions[0];
  return (
    <BentoCell kicker="DUERP">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.95rem] font-medium">
            Document Unique d&apos;Évaluation des Risques
          </p>
          <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
            {derniereVersion
              ? `v${derniereVersion.numero} du ${formaterDateFr(derniereVersion.createdAt)}`
              : "En cours — pas encore validé"}
          </p>
        </div>
        <Link
          href={`/duerp/${duerpDernier.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Ouvrir →
        </Link>
      </div>
    </BentoCell>
  );
}

/* ─── Guide pédagogique (carte sombre V2) ───────────────── */

const GUIDE_ETAPES = [
  { k: "01", t: "Déclarer les équipements soumis à contrôle" },
  { k: "02", t: "Planifier les vérifications périodiques" },
  { k: "03", t: "Consigner chaque rapport au registre" },
  { k: "04", t: "Tenir le DUERP à jour (au moins 1 fois / an)" },
];

export function WidgetGuide({ bundle }: { bundle: DashboardBundle }) {
  const { etablissementId } = bundle;
  return (
    <section
      className="relative flex flex-col gap-3 overflow-hidden rounded-[14px] px-6 py-[22px]"
      style={{ background: "var(--ink)", color: "#fff" }}
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/55">
        Guide pédagogique
      </p>
      <h3 className="max-w-[320px] text-[18px] font-semibold leading-[1.2] tracking-[-0.015em]">
        Ce qu&apos;on attend de vous,
        <br />
        <span
          className="italic"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontWeight: 400,
            color: "#9AB7FF",
          }}
        >
          par obligation légale.
        </span>
      </h3>
      <ul className="mt-1 flex flex-col gap-2">
        {GUIDE_ETAPES.map((x) => (
          <li
            key={x.k}
            className="grid grid-cols-[auto_1fr] items-center gap-2.5 rounded-[10px] px-2.5 py-2"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span
              className="font-mono tabular-nums text-[11px]"
              style={{ color: "#9AB7FF", letterSpacing: "0.08em" }}
            >
              {x.k}
            </span>
            <span className="text-[13px]" style={{ color: "#D4DAE6" }}>
              {x.t}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={`/etablissements/${etablissementId}/guide`}
        className="mt-2 inline-flex h-[34px] w-fit items-center gap-1.5 rounded-[10px] bg-white px-3.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/90"
      >
        Lire le guide complet →
      </Link>
    </section>
  );
}

/* ─── Recommandations (optionnel, masqué par défaut) ────── */

export function WidgetRecos({ bundle }: { bundle: DashboardBundle }) {
  const recos = bundle.dashboard.recommandations.slice(0, 3);
  return (
    <BentoCell kicker="À faire en priorité" count={recos.length}>
      {recos.length === 0 ? (
        <p className="text-[0.88rem] text-muted-foreground">
          Aucune action prioritaire pour l&apos;instant — tout est à jour. ✓
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {recos.map((r, i) => {
            const tone =
              r.kind === "verif_depassee" || r.kind === "action_en_retard"
                ? "alerte"
                : r.kind === "verif_proche" || r.kind === "action_proche"
                  ? "warn"
                  : "info";
            const bgClass =
              tone === "alerte"
                ? "border-l-[color:var(--minium)] bg-[color:color-mix(in_oklch,var(--minium)_4%,var(--paper-sunk))]"
                : tone === "warn"
                  ? "border-l-[color:var(--warn)] bg-[color:var(--warn-pale)]"
                  : "border-l-[color:var(--accent-vif)] bg-paper-sunk";
            const dotColor =
              tone === "alerte"
                ? "var(--minium)"
                : tone === "warn"
                  ? "var(--warn)"
                  : "var(--accent-vif)";
            return (
              <li
                key={i}
                className={
                  "grid grid-cols-[10px_1fr_auto] items-center gap-3.5 rounded-lg border-l-[3px] px-3.5 py-3 " +
                  bgClass
                }
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: dotColor }}
                />
                <div className="min-w-0">
                  <strong className="block truncate text-[0.9rem] font-medium">
                    {r.titre}
                  </strong>
                  {r.sousTitre ? (
                    <em className="mt-0.5 block truncate text-[0.76rem] not-italic text-muted-foreground">
                      {r.sousTitre}
                    </em>
                  ) : null}
                </div>
                <Link
                  href={r.href}
                  className="rounded-md bg-ink px-3 py-1.5 text-[0.78rem] text-paper-elevated transition-colors hover:bg-[color:color-mix(in_oklch,var(--ink)_85%,var(--accent-vif))]"
                >
                  Ouvrir →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </BentoCell>
  );
}
