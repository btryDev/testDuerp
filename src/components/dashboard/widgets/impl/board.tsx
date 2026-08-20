"use client";

// Blocs du « board éditorial » — direction 4a du design Rojer.
//
// Chaque bloc est un widget du registre : il reçoit le bundle et rend une
// carte à grand rayon sur le canvas quasi blanc — blanche à filet et
// ombre douce (bento), sauf les deux qui passent au noir (voir
// `CarteBoard`). Le système de
// personnalisation (DashboardGrid + EditToolbar, le « ⠿ Personnaliser » du
// mockup) reste donc pleinement opérant — le board n'est que le layout
// par défaut, pas une page figée.
//
// Aucune donnée n'est écrite en dur ici : tout vient du bundle, et les
// dérivations non triviales vivent dans `@/lib/dashboard/{brief,frise,
// obligations}` où elles sont testées.

import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  GanttChart,
} from "lucide-react";
import { construireBrief } from "@/lib/dashboard/brief";
import type { Recommandation } from "@/lib/dashboard/recommandations";
import { construireFrise, type EchelleFrise } from "@/lib/dashboard/frise";
import { composantesCiviles } from "@/lib/dates";
import { estEnRetard, estVerificationEnRetard } from "@/lib/dates/retard";
import {
  badgeEcart,
  compteARebours,
  libelleAnciennete,
  libelleAnteriorite,
  libelleDateCourte,
} from "../temps";
import { VueMois } from "@/components/calendrier/VueMois";
import { VueAnnee } from "@/components/calendrier/VueAnnee";
import {
  COLONNES_MATRICE,
  compterRestes,
  construireMatrice,
  type EtatCellule,
} from "@/lib/dashboard/obligations";
import type { DashboardBundle } from "../types";

/* ─── Primitives partagées ──────────────────────────────────── */

/**
 * Le design distingue deux rayons : 26 px sur les cartes-chiffre, 30 px
 * sur les grands blocs. Le rayon est donc un paramètre, pas une classe
 * qu'on écraserait depuis l'appelant (l'ordre des classes Tailwind ne
 * décide pas de la priorité).
 */
export function CarteBoard({
  children,
  className = "",
  rayon = 30,
  ton = "clair",
}: {
  children: React.ReactNode;
  className?: string;
  rayon?: 26 | 30;
  /**
   * Les blocs sombres sont l'exception : la préparation d'un contrôle
   * (la porte à pousser quand un inspecteur se présente) et, hors
   * défaut, la carte-compteur « Prochaine échéance ». Le reste du board
   * les entoure et les explique ; leur position par défaut vient de
   * `ORDRE_DEFAUT` (registry), et l'utilisateur peut les déplacer.
   *
   * Sur fond noir, aucune encre foncée ne passe : le texte est blanc ou
   * ardoise, et les champs colorés restent les champs clairs de la
   * palette — ils y gagnent même en présence.
   */
  ton?: "clair" | "sombre";
}) {
  return (
    <div
      className={
        // Sur canvas quasi blanc, l'aplat ne sépare plus rien : c'est le
        // filet cheveu et l'ombre douce qui détachent la carte — bento.
        "flex h-full flex-col " +
        (ton === "sombre"
          ? "bg-[color:var(--board-ink)] shadow-[0_1px_2px_rgba(13,18,36,.06),0_16px_40px_-16px_rgba(13,18,36,.22)] "
          : "bg-[color:var(--board-card)] ring-1 ring-[color:rgba(13,18,36,.06)] shadow-[0_1px_2px_rgba(13,18,36,.04),0_12px_32px_-14px_rgba(13,18,36,.10)] ") +
        (rayon === 26 ? "rounded-[26px] " : "rounded-[30px] ") +
        className
      }
    >
      {children}
    </div>
  );
}

/** En-tête standard d'un bloc du board : famille + titre 26 px +
 *  sous-titre, et à droite soit la porte ronde (href), soit des contrôles
 *  libres (actions) — exporté pour que les widgets hors de ce fichier
 *  (équipements) n'aient pas à recopier le motif. */
export function TitreBloc({
  famille,
  titre,
  sousTitre,
  href,
  actions,
}: {
  /**
   * Sur-titre mono, repris du cadran de la page publique : il dit de
   * quelle famille relève le bloc (« ÉCHÉANCES », « SUIVI », « PREUVE »)
   * avant que le titre ne dise ce qu'il montre. C'est un repère de
   * lecture, pas une décoration — un board de douze cartes se parcourt
   * mieux quand chacune annonce son registre. Les blocs dont le titre
   * porte déjà sa famille s'en passent.
   */
  famille?: string;
  titre: string;
  sousTitre?: React.ReactNode;
  href?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0">
        {famille ? (
          <p className="board-eyebrow m-0 mb-2">{famille}</p>
        ) : null}
        <h2 className="board-titre m-0 text-[26px]">{titre}</h2>
        {sousTitre ? (
          <p className="mt-[7px] text-[13.5px] text-[color:var(--board-slate-mid)]">
            {sousTitre}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="ml-auto flex flex-none items-center gap-2.5">
          {actions}
        </div>
      ) : href ? (
        <Link
          href={href}
          aria-label={`Ouvrir ${titre}`}
          className="ml-auto flex size-9 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

/** Pastille de comptage — bleue par défaut, rose en alerte. Le champ
 *  d'alerte est d'un cran plus présent que le bleu neutre (1,30 contre
 *  1,13 sur carte blanche) : c'est le seul écart de poids qu'on s'autorise
 *  entre les deux tons. */
function Pastille({
  children,
  ton = "neutre",
}: {
  children: React.ReactNode;
  ton?: "neutre" | "alerte";
}) {
  const classes =
    ton === "alerte"
      ? "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]"
      : "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]";
  return (
    <span
      className={
        "inline-block rounded-full px-[13px] py-[6px] text-[12px] font-semibold " +
        classes
      }
    >
      {children}
    </span>
  );
}

function Lien({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-1 inline-flex items-center gap-2 rounded-full bg-[color:var(--board-ink)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
    >
      {children}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}

/* ─── 1 · Le brief ──────────────────────────────────────────── */

/**
 * Le brief n'est pas un widget : c'est le bandeau de tête du tableau de
 * bord, rendu par la page au-dessus de la grille — panneau bleu ciel à
 * grand rayon, seule grande surface colorée de la page. Il n'est ni
 * déplaçable ni retirable, et c'est voulu.
 *
 * Il dit ce qu'il y a à traiter, et rien d'autre : à gauche le compte
 * (« 2 éléments à traiter ») et le paragraphe d'état dérivés des
 * compteurs réels (`construireBrief`), à droite la file de travail —
 * les deux recommandations les plus urgentes du moteur, numérotées dans
 * l'ordre où les prendre, chacune avec sa porte « Ouvrir ». La ligne
 * pointillée sous la file solde le reste : rien d'autre sous trente
 * jours, ou le compte de ce qui s'y trouve, en lien vers le calendrier.
 * Aucune chaîne décorative : tout vient du bundle.
 */

/** Tons d'une carte-tâche : le rose marque le dépassé (vérification ou
 *  action en retard), le bleu tout le reste — y compris les amorces. */
const KINDS_ALERTE: ReadonlySet<Recommandation["kind"]> = new Set([
  "verif_depassee",
  "action_en_retard",
]);

function CarteTache({
  numero,
  reco,
  aujourdhui,
}: {
  numero: number;
  reco: Recommandation;
  aujourdhui: Date;
}) {
  const alerte = KINDS_ALERTE.has(reco.kind);

  // Méta : le sous-titre du moteur, complété par la date quand elle
  // existe — « depuis N j » pour le dépassé, la date courte sinon.
  //
  // L'ancienneté est comptée en jours civils et vaut `null` le jour de
  // l'échéance : le `Math.max(1, …)` d'avant annonçait « depuis 1 j » dès
  // le jour dit, sur une échéance que le produit ne tient pas encore pour
  // dépassée. Dans ce cas on retombe sur la date, qui ne ment pas.
  let meta = reco.sousTitre ?? "";
  if (reco.date) {
    const anciennete = alerte ? libelleAnciennete(reco.date, aujourdhui) : null;
    meta = anciennete
      ? `${meta} ${anciennete}`
      : meta
        ? `${meta} · ${libelleDateCourte(reco.date)}`
        : libelleDateCourte(reco.date);
  }

  return (
    <li className="flex items-center gap-4 rounded-[24px] bg-[color:var(--board-card)] py-3.5 pl-4 pr-3.5 shadow-[0_14px_30px_-20px_rgba(13,18,36,.30)]">
      <span
        className={
          "flex size-10 flex-none items-center justify-center rounded-full text-[15px] font-semibold tabular-nums " +
          (alerte
            ? "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]"
            : "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]")
        }
      >
        {numero}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
          {reco.titre}
        </p>
        {meta ? (
          <p className="m-0 mt-0.5 truncate text-[12.5px] text-[color:var(--board-slate-mid)]">
            {meta}
          </p>
        ) : null}
      </div>
      <Link
        href={reco.href}
        aria-label={`Ouvrir : ${reco.titre}`}
        className={
          "flex-none rounded-full bg-[color:var(--board-ink)] px-[18px] py-[9px] text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
        }
      >
        Ouvrir
      </Link>
    </li>
  );
}

export function BlocBrief({ bundle }: { bundle: DashboardBundle }) {
  const { etablissementId, aujourdhui, dashboard, nbRapports } = bundle;
  const { compteurs, duerp, recommandations } = dashboard;

  const brief = construireBrief({
    aujourdhui,
    compteurs,
    // `etat` transmis : sans lui le brief se rabattait sur sa formulation de
    // repli et n'annonçait jamais « aucune version validée » — il disait
    // « votre DUERP a plus de douze mois » à quelqu'un qui venait de l'ouvrir.
    duerp: {
      existe: duerp.existe,
      estAJour: duerp.estAJour,
      etat: duerp.etat,
    },
    recommandations: recommandations.map((r) => ({
      kind: r.kind,
      titre: r.titre,
      href: r.href,
    })),
    nbRapports,
  });

  // La file de travail : les urgences réelles d'abord (priorités 1-5 du
  // moteur) ; sur un dossier en mise en place, les amorces la prennent.
  const reelles = recommandations.filter((r) => r.priorite <= 5);
  const file = (reelles.length > 0 ? reelles : recommandations).slice(0, 2);

  // Le titre est celui de `construireBrief`, dérivé des **compteurs** de
  // l'établissement. Il était auparavant écrasé par `reelles.length`,
  // c'est-à-dire par le nombre de recommandations — que le moteur plafonne
  // à cinq (`genererRecommandations`, limite par défaut). Un dossier avec
  // quarante échéances dépassées annonçait donc « 5 éléments à traiter » :
  // l'outil minorait la non-conformité, ce qu'il s'interdit.
  const titre = brief.titre;

  // Le total réellement à traiter, pour dire que la file n'en est qu'un
  // extrait. Même agrégat que `construireBrief` : ce qui est dépassé.
  const totalUrgent = compteurs.verifsEnRetard + compteurs.actionsEnRetard;
  const extrait = reelles.length > 0 && totalUrgent > file.length;

  // « Autre » au sens strict : les vérifications proches déjà en carte
  // ne sont pas recomptées dans le solde.
  const prochesAffichees = file.filter((r) => r.kind === "verif_proche").length;
  const sous30j = Math.max(0, compteurs.verifsSous30j - prochesAffichees);
  const hrefCalendrier = `/etablissements/${etablissementId}/calendrier`;

  return (
    // Fonds inversés : le hero porte le ciel en bandeau pleine largeur,
    // sans rayon ni gouttière — le canvas quasi blanc ne commence qu'en
    // dessous.
    <div className="bg-[color:var(--board-sky)] px-[46px] pb-[72px] pt-[68px]">
      <div className="grid items-center gap-x-12 gap-y-8 lg:grid-cols-[1fr_1.08fr]">
        <div>
          {/* Même badge que le hero de la page publique : pilule blanche,
              mono capitales, point de la famille bleue en tête. */}
          <span className="board-eyebrow inline-flex items-center gap-2.5 rounded-full bg-[color:var(--board-card)] px-[14px] py-[7px]">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-[color:var(--board-blue-ink)]"
            />
            {brief.datePill}
          </span>
          {/* `text-pretty` plutôt que l'équilibrage de `.board-titre` : sur un
              titre de trois mots-clés, équilibrer les lignes en fabrique une
              troisième et casse le bloc. */}
          <h1 className="board-titre mt-5 max-w-[480px] text-pretty text-[clamp(30px,3.2vw,44px)] leading-[1.04] tracking-[-0.04em]">
            {titre}
          </h1>
          <p className="mt-3.5 max-w-[440px] text-[14.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
            {brief.paragraphe}
          </p>
        </div>

        <div>
          {/* La file n'est pas la liste : elle montre par où commencer.
              Le dire explicitement évite de lire deux cartes comme
              « il n'y a que ça ». */}
          {extrait ? (
            <p className="board-eyebrow m-0 mb-2.5">
              Par où commencer — {file.length} sur {totalUrgent}
            </p>
          ) : null}

          {file.length > 0 ? (
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {file.map((r, i) => (
                <CarteTache
                  key={r.href}
                  numero={i + 1}
                  reco={r}
                  aujourdhui={aujourdhui}
                />
              ))}
            </ol>
          ) : null}

          {/* Le solde de la file. À zéro, on le dit — le silence se
              lirait comme un oubli ; sinon, la ligne est la porte vers
              le calendrier. */}
          {sous30j > 0 ? (
            <Link
              href={hrefCalendrier}
              className="mt-3 flex items-center gap-3 rounded-[18px] border border-dashed border-[color:rgba(10,10,10,.28)] px-4 py-3 transition-colors hover:border-solid hover:bg-[color:var(--board-card)]/40"
            >
              <span className="flex size-7 flex-none items-center justify-center rounded-full bg-[color:var(--board-card)]">
                <CalendarDays className="size-3.5 text-[color:var(--board-ink)]" />
              </span>
              <span className="text-[13px] text-[color:var(--board-slate-ink)]">
                {sous30j} autre{sous30j > 1 ? "s" : ""} échéance
                {sous30j > 1 ? "s" : ""} sous 30 jours —
                voir le calendrier
              </span>
            </Link>
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-[18px] border border-dashed border-[color:rgba(10,10,10,.28)] px-4 py-3">
              <span className="flex size-7 flex-none items-center justify-center rounded-full bg-[color:var(--board-card)]">
                <Check className="size-3.5 text-[color:var(--board-ink)]" />
              </span>
              <span className="text-[13px] text-[color:var(--board-slate-ink)]">
                Aucune autre échéance sous 30 jours.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── 2 · La frise ──────────────────────────────────────────── */

/** Hauteur de la zone de marqueurs, en pixels. */
const PISTE_HAUTEUR = 236;
/** Ordonnée de l'axe dans cette zone. */
const AXE_Y = 112;
/** Demi-largeur d'une carte de marqueur — sert à la borner aux extrémités. */
const DEMI_CARTE = 86;
/** Marge à gauche d'aujourd'hui au cadrage initial, en pixels. */
const CADRAGE_INITIAL = 130;

/** Registre visuel d'un marqueur. La frise ne sert que deux urgences :
 *  le rouge (dépassé ou en alerte), l'orange (dans les 30 jours). Tout
 *  le reste est gris — une échéance lointaine n'a rien à crier. */
type RegistreMarqueur = "chaud" | "proche" | "calme";

function registreMarqueur(m: {
  passe: boolean;
  tone: string;
  proche: boolean;
}): RegistreMarqueur {
  if (m.passe || m.tone === "alerte") return "chaud";
  if (m.proche) return "proche";
  return "calme";
}

/** Couleur du point posé sur l'axe : rose du champ pour le chaud, noir
 *  pour le proche, ardoise pour le calme. */
const TON_POINT: Record<RegistreMarqueur, string> = {
  chaud: "var(--board-signal-mark)",
  proche: "var(--board-amber-mark)",
  calme: "var(--board-slate-soft)",
};

/** Texte posé sur le point en grappe. Le rose du chaud ne porte pas le
 *  blanc — il prend l'encre rouge sombre ; noir et ardoise le gardent. */
const TON_POINT_TEXTE: Record<RegistreMarqueur, string> = {
  chaud: "var(--board-signal-ink)",
  proche: "#fff",
  calme: "#fff",
};

/** Champ et textes de la carte, par registre. */
const TON_CARTE: Record<
  RegistreMarqueur,
  { fond: string; titre: string; sousTitre: string }
> = {
  chaud: {
    fond: "bg-[color:var(--board-signal-mid)]",
    titre: "text-[color:var(--board-signal-ink)]",
    sousTitre: "text-[color:var(--board-signal-ink)]",
  },
  proche: {
    fond: "bg-[color:var(--board-amber)]",
    titre: "text-[color:var(--board-amber-ink)]",
    sousTitre: "text-[color:var(--board-amber-ink)]",
  },
  calme: {
    fond: "bg-[color:var(--board-slate-pale)]",
    titre: "text-[color:var(--board-ink)]",
    sousTitre: "text-[color:var(--board-slate-mid)]",
  },
};

/** Flèche de défilement — desktop uniquement (au doigt, on fait glisser). */
function FlecheDefilement({
  sens,
  onClick,
  visible,
}: {
  sens: "gauche" | "droite";
  onClick: () => void;
  visible: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!visible}
      aria-label={
        sens === "gauche"
          ? "Reculer dans la frise"
          : "Avancer dans la frise"
      }
      className={
        "absolute top-[100px] z-20 hidden size-10 items-center justify-center rounded-full border border-[color:rgba(10,10,10,.12)] bg-[color:var(--board-card)] text-[color:var(--board-ink)] shadow-[0_2px_10px_rgba(10,10,10,.10)] transition-opacity md:flex " +
        (sens === "gauche" ? "left-1" : "right-1") +
        (visible ? " opacity-100 hover:bg-[color:var(--board-blue-pale)]" : " opacity-0")
      }
    >
      {sens === "gauche" ? (
        <ChevronLeft className="size-4" />
      ) : (
        <ChevronRight className="size-4" />
      )}
    </button>
  );
}

export function BlocFrise({ bundle }: { bundle: DashboardBundle }) {
  // Bascules inline, comme dans le design. Elles vivent ici plutôt que
  // dans le système de variants pour rester accessibles hors mode
  // « Personnaliser ».
  const [echelle, setEchelle] = useState<EchelleFrise>("jours");
  const [vue, setVue] = useState<"frise" | "calendrier">("calendrier");
  // Maille de la vue calendrier : l'année entière d'emblée — la grille
  // d'un mois reste accessible via la bascule mois / année.
  const [maille, setMaille] = useState<"mois" | "annee">("annee");
  // Le mois affiché est lu en heure de Paris, pas dans le fuseau du
  // navigateur : ce composant est client, et `getMonth()` sur un instant
  // proche de minuit ouvrait le calendrier sur le mois précédent pour un
  // utilisateur à l'ouest de UTC.
  const [mois, setMois] = useState(() => {
    const c = composantesCiviles(bundle.aujourdhui);
    return new Date(c.annee, c.mois - 1, 1);
  });

  const piste = useRef<HTMLDivElement | null>(null);
  const [bords, setBords] = useState({ gauche: false, droite: false });

  // La fenêtre couvre trois mois de passé et deux ans à venir : c'est le
  // conteneur qui défile, l'échelle ne fait que zoomer.
  const frise = construireFrise({
    evenements: bundle.evenementsHorizon,
    aujourdhui: bundle.aujourdhui,
    echelle,
  });

  const majBords = useCallback(() => {
    const el = piste.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setBords({
      gauche: el.scrollLeft > 4,
      droite: el.scrollLeft < max - 4,
    });
  }, []);

  // À l'ouverture — et à chaque changement d'échelle — la frise s'ouvre
  // sur aujourd'hui, pas sur le premier jour consultable : le passé est
  // atteignable, il n'est pas ce qu'on vient regarder.
  useLayoutEffect(() => {
    if (vue !== "frise") return;
    const el = piste.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, frise.xAujourdhui - CADRAGE_INITIAL);
    majBords();
  }, [vue, echelle, frise.xAujourdhui, majBords]);

  const defiler = (sens: -1 | 1) => {
    const el = piste.current;
    if (!el) return;
    const anime = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    el.scrollBy({
      left: sens * el.clientWidth * 0.8,
      behavior: anime ? "smooth" : "auto",
    });
  };

  // Le compte « en retard » de l'en-tête ne vient pas de la frise :
  // `construireFrise` place ses marqueurs avec un `minuit()` calculé dans
  // le fuseau du **navigateur** (cf. `lib/dashboard/frise.ts`), ce qui
  // décale le compte d'un jour à l'ouest de UTC. Ici on applique le
  // prédicat de retard partagé (ADR-011), qui répond la même chose partout.
  const nbEnRetard = bundle.evenementsHorizon.filter((e) =>
    estEnRetard(e.date, bundle.aujourdhui),
  ).length;

  const hrefCalendrier = `/etablissements/${bundle.etablissementId}/calendrier`;
  const nbSansDate = bundle.dashboard.compteurs.verifsAPlanifier;

  return (
    <CarteBoard className="px-[30px] pb-5 pt-[26px]">
      <div className="flex items-start gap-4">
        <div>
          <p className="board-eyebrow m-0 mb-2">Échéances</p>
          <h2 className="board-titre m-0 text-[30px]">
            {vue === "calendrier"
              ? "Votre calendrier"
              : echelle === "jours"
                ? "Les 90 prochains jours"
                : "Les 12 prochains mois"}
          </h2>
          <p className="mt-2 text-[13.5px] text-[color:var(--board-slate-mid)]">
            {vue === "calendrier"
              ? maille === "annee"
                ? "L’année d’un bloc — cliquez un mois pour le détailler."
                : "Mois par mois, ce qui tombe et quel jour."
              : "Ce qui tombe, quand, et ce qui est déjà pris en charge — faites défiler pour aller jusqu’à 24 mois."}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {nbEnRetard > 0 ? (
            <Link
              href={hrefCalendrier}
              // Toutes familles confondues, comme le calendrier — et non
              // les seules vérifications, comme le badge de la barre
              // latérale. Les deux nombres peuvent donc différer.
              title="Échéances en retard, toutes familles confondues (contrôles, travaux, papiers)"
              className="hidden sm:inline-block"
            >
              <Pastille ton="alerte">
                {nbEnRetard} en retard
              </Pastille>
            </Link>
          ) : null}
          {vue === "calendrier"
            ? (["mois", "annee"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaille(m)}
                  aria-pressed={maille === m}
                  className={
                    "rounded-full px-[13px] py-[6px] text-[11.5px] font-semibold transition-colors " +
                    (maille === m
                      ? "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]"
                      : "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]")
                  }
                >
                  {m === "mois" ? "Mois" : "Année"}
                </button>
              ))
            : null}
          {vue === "frise"
            ? (["jours", "mois"] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEchelle(e)}
                  aria-pressed={echelle === e}
                  className={
                    "rounded-full px-[13px] py-[6px] text-[11.5px] font-semibold transition-colors " +
                    (echelle === e
                      ? "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]"
                      : "bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]")
                  }
                >
                  {e === "jours" ? "90 jours" : "12 mois"}
                </button>
              ))
            : null}
          <button
            type="button"
            onClick={() => setVue(vue === "frise" ? "calendrier" : "frise")}
            aria-pressed={vue === "calendrier"}
            aria-label={
              vue === "frise"
                ? "Passer en vue calendrier"
                : "Revenir à la frise"
            }
            title={
              vue === "frise" ? "Vue calendrier" : "Vue frise"
            }
            className={
              "flex size-9 flex-none items-center justify-center rounded-full transition-colors " +
              (vue === "calendrier"
                ? "bg-[color:var(--board-ink)] text-white"
                : "border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] hover:bg-[color:var(--board-blue-pale)]")
            }
          >
            {vue === "frise" ? (
              <CalendarDays className="size-4" />
            ) : (
              <GanttChart className="size-4" />
            )}
          </button>
          <Link
            href={hrefCalendrier}
            aria-label="Ouvrir le calendrier"
            className="flex size-9 flex-none items-center justify-center rounded-full border border-[color:rgba(10,10,10,.16)] text-[color:var(--board-ink)] transition-colors hover:bg-[color:var(--board-blue-pale)]"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {vue === "calendrier" ? (
        maille === "annee" ? (
          <VueAnnee
            annee={mois.getFullYear()}
            evenements={bundle.evenementsHorizon}
            aujourdhui={bundle.aujourdhui}
            // Même fenêtre que la frise : au-delà, la donnée n'est pas
            // chargée, et une carte-mois vide mentirait.
            fenetre={{ debut: frise.debut, fin: frise.fin }}
            onPrecedent={() =>
              setMois((m) => new Date(m.getFullYear() - 1, m.getMonth(), 1))
            }
            onSuivant={() =>
              setMois((m) => new Date(m.getFullYear() + 1, m.getMonth(), 1))
            }
            onChoisirMois={(m) => {
              setMois(m);
              setMaille("mois");
            }}
            peutReculer={new Date(mois.getFullYear() - 1, 11, 31) >= frise.debut}
            peutAvancer={new Date(mois.getFullYear() + 1, 0, 1) <= frise.fin}
          />
        ) : (
          <VueMois
            mois={mois}
            evenements={bundle.evenementsHorizon}
            aujourdhui={bundle.aujourdhui}
            hrefEvenement={(e) =>
              `/etablissements/${bundle.etablissementId}/verifications/${e.id}`
            }
            onPrecedent={() =>
              setMois((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
            onSuivant={() =>
              setMois((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
            }
            // Même fenêtre que la frise : au-delà, la donnée n'est pas
            // chargée, et une grille vide ne voudrait rien dire.
            peutReculer={mois > frise.debut}
            peutAvancer={mois < frise.fin}
          />
        )
      ) : frise.marqueurs.length === 0 ? (
        // Rien à placer sur l'axe : on ne dessine pas une frise déserte de
        // 236 px. On dit ce qui bloque, et on donne la porte de sortie.
        <div className="mt-7 flex flex-col items-start gap-3 rounded-[22px] bg-[color:var(--board-slate-pale)] px-6 py-7">
          {bundle.equipements.length === 0 ? (
            <>
              <p className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
                Votre calendrier est vide
              </p>
              <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                Il se remplit tout seul à partir des équipements déclarés — il
                n&apos;y en a pas encore.
              </p>
              <Lien
                href={`/etablissements/${bundle.etablissementId}/equipements/nouveau`}
              >
                Déclarer un équipement
              </Lien>
            </>
          ) : nbEnRetard > 0 ? (
            <>
              <p className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
                {nbEnRetard} échéance{nbEnRetard > 1 ? "s" : ""} en
                retard, aucune à venir
              </p>
              <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                {nbEnRetard > 1 ? "Elles datent" : "Elle date"} d&apos;avant
                la période affichée — trois mois en arrière au plus — et rien
                n&apos;est programmé ensuite : il n&apos;y a donc rien à poser
                sur la frise.
              </p>
              <Lien href={hrefCalendrier}>Voir le calendrier</Lien>
            </>
          ) : (
            <p className="m-0 text-[13.5px] text-[color:var(--board-slate-mid)]">
              Aucune échéance sur cette période.
            </p>
          )}
        </div>
      ) : (
        // La frise déborde volontairement la carte : elle est plus longue
        // que large, et c'est le conteneur qui défile. Le débord négatif
        // ramène la zone de défilement aux bords de la carte, pour que
        // rien ne paraisse coupé au milieu du texte.
        <div className="relative -mx-[30px] mt-7">
          <FlecheDefilement
            sens="gauche"
            visible={bords.gauche}
            onClick={() => defiler(-1)}
          />
          <FlecheDefilement
            sens="droite"
            visible={bords.droite}
            onClick={() => defiler(1)}
          />

          <div
            ref={piste}
            onScroll={majBords}
            role="region"
            aria-label="Frise des échéances, de 3 mois en arrière à 24 mois en avant"
            className="overflow-x-auto overflow-y-hidden overscroll-x-contain"
          >
            <div className="w-max px-[30px]">
              <div
                className="relative"
                style={{ width: frise.largeur, height: PISTE_HAUTEUR }}
              >
                {/* L'axe porte l'encre pleine. C'est la ligne
                    structurante du plus grand bloc du board : au filet
                    précédent elle disparaissait, et les points
                    semblaient flotter sans support. */}
                <div
                  className="absolute inset-x-0 h-1 rounded-sm bg-[color:var(--board-ink)]"
                  style={{ top: AXE_Y }}
                />

                {/* Repère « aujourd'hui » : sans lui, un axe qui commence
                    trois mois en arrière ne dit plus où l'on est. Le trait
                    passe derrière les cartes — c'est un repère, pas un
                    élément de premier plan — et l'étiquette se pose sous
                    la voie basse, seule bande toujours libre. */}
                <div
                  className="absolute border-l border-dashed border-[color:var(--board-slate)]"
                  style={{ left: frise.xAujourdhui, top: 0, height: PISTE_HAUTEUR - 20 }}
                />
                <span
                  className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--board-ink)] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white"
                  style={{ left: frise.xAujourdhui, top: PISTE_HAUTEUR - 20 }}
                >
                  Aujourd&apos;hui
                </span>

                {frise.marqueurs.map((m) => {
                  const grappe = m.evenements.length > 1;
                  const registre = registreMarqueur(m);
                  const carte = TON_CARTE[registre];
                  return (
                    <Fragment key={m.cle}>
                      {/* Une grappe couvre un intervalle réel : on le
                          matérialise sur l'axe, sinon la carte laisserait
                          croire à une date unique. */}
                      {grappe && m.xFin > m.x ? (
                        <span
                          className="absolute h-1 rounded-sm"
                          style={{
                            left: m.x,
                            width: m.xFin - m.x,
                            top: AXE_Y,
                            background: TON_POINT[registre],
                            opacity: 0.45,
                          }}
                        />
                      ) : null}
                      {/* Le point est à la date exacte — c'est lui qui dit
                          vrai. En grappe, il porte le nombre. */}
                      {grappe ? (
                        <span
                          className="absolute z-10 flex h-5 min-w-5 -translate-x-1/2 items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold shadow-[0_0_0_4px_var(--board-card)]"
                          style={{
                            left: m.x,
                            top: AXE_Y - 8,
                            background: TON_POINT[registre],
                            color: TON_POINT_TEXTE[registre],
                          }}
                        >
                          {m.evenements.length}
                        </span>
                      ) : (
                        <span
                          className="absolute z-10 size-3.5 -translate-x-1/2 rounded-full shadow-[0_0_0_4px_var(--board-card)]"
                          style={{
                            left: m.x,
                            top: AXE_Y - 7,
                            background: TON_POINT[registre],
                          }}
                        />
                      )}
                      {/* La carte est centrée sur le point, mais bornée aux
                          extrémités de l'axe : elle y glisse légèrement, le
                          point reste à sa place. */}
                      <Link
                        href={
                          grappe
                            ? hrefCalendrier
                            : (m.evenements[0].href ??
                              `/etablissements/${bundle.etablissementId}/verifications/${m.evenements[0].id}`)
                        }
                        title={m.evenements
                          .map((e) => `${e.libelleDate} · ${e.libelle} — ${e.equipement}`)
                          .join("\n")}
                        className={
                          "absolute w-[172px] -translate-x-1/2 rounded-[18px] px-[15px] py-3 text-center transition-opacity hover:opacity-85 " +
                          carte.fond
                        }
                        style={{
                          left: Math.min(
                            Math.max(m.x, DEMI_CARTE),
                            frise.largeur - DEMI_CARTE,
                          ),
                          ...(m.cote === "haut"
                            ? { bottom: PISTE_HAUTEUR - 96 }
                            : { top: 128 }),
                        }}
                      >
                        <p
                          className={
                            "m-0 text-[14px] font-semibold leading-[1.25] tracking-[-0.015em] " +
                            carte.titre
                          }
                        >
                          {m.titre}
                        </p>
                        <p
                          className={
                            "mt-[5px] text-[11.5px] font-semibold tracking-[0.06em] " +
                            carte.sousTitre
                          }
                        >
                          {m.sousTitre}
                        </p>
                      </Link>
                    </Fragment>
                  );
                })}
              </div>

              {/* Les graduations défilent avec l'axe : c'est ce qui permet
                  de savoir où l'on est après trois écrans de défilement. */}
              <div
                className="relative mt-2.5 border-t border-[color:var(--board-slate-line)] pt-3.5"
                style={{ width: frise.largeur, height: 34 }}
              >
                {frise.mois.map((m) => (
                  <span
                    key={m.cle}
                    className={
                      "absolute top-3.5 truncate border-l border-[color:var(--board-slate)] pl-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] " +
                      (m.estMoisCourant
                        ? "text-[color:var(--board-ink)]"
                        : "text-[color:var(--board-slate-soft)]")
                    }
                    style={{ left: m.x, width: m.largeur }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Une vérification « à planifier » n'a pas de date choisie : ni la
          frise ni la grille ne la posent, les y placer à leur date de
          génération mentirait. Même note que la page Calendrier — sinon
          elles disparaîtraient sans explication. */}
      {nbSansDate > 0 ? (
        <p className="mt-2 text-[11.5px] text-[color:var(--board-slate-soft)]">
          {nbSansDate > 1
            ? `${nbSansDate} vérifications à planifier n'ont pas encore de date`
            : "1 vérification à planifier n'a pas encore de date"}{" "}
          — <Lien href={hrefCalendrier}>datez-les au calendrier</Lien> pour
          qu&apos;elles apparaissent ici.
        </p>
      ) : null}

      {vue === "frise" && frise.nbPlaces > frise.marqueurs.length ? (
        // Rien n'est caché : ce qui est trop rapproché pour tenir en
        // cartes distinctes est réuni en grappes. On le dit, sinon le
        // pastillage numéroté ressemble à une décoration.
        <p className="mt-2 text-[11.5px] text-[color:var(--board-slate-soft)]">
          {frise.nbPlaces} échéances sur la période. Les plus rapprochées sont
          groupées — {echelle === "mois" ? "zoomez sur « 90 jours »" : "ouvrez la vue calendrier"}{" "}
          pour les détailler.
        </p>
      ) : null}
    </CarteBoard>
  );
}

/* ─── 3 · À faire ───────────────────────────────────────────── */

/** Étiquette de type par kind de recommandation. Les amorces n'en ont
 *  pas : ce sont des invitations, leur sous-titre suffit. */
const TYPE_RECO: Partial<Record<Recommandation["kind"], string>> = {
  verif_depassee: "Vérification",
  verif_proche: "Vérification",
  action_en_retard: "Action",
  action_proche: "Action",
  duerp_a_jour: "DUERP",
};

/**
 * La to-do du dossier : vérifications ET actions mélangées, triées par
 * urgence réelle par le moteur de recommandations — l'utilisateur n'a
 * pas à savoir si « ce qui presse » est une échéance de vérification ou
 * une action corrective, c'est la même liste. Ce bloc remplace les deux
 * cartes-compteur « Prochaine échéance » et « Actions en retard » du
 * board par défaut (toujours disponibles dans le tiroir).
 *
 * Le brief du haut garde son rôle : les 2 items les plus urgents, à
 * traiter maintenant. Ici, la profondeur — jusqu'à 5 items datés, et le
 * solde sous 30 jours en pied de carte.
 */
export function BlocAFaire({ bundle }: { bundle: DashboardBundle }) {
  const { etablissementId, aujourdhui, dashboard } = bundle;
  const { recommandations, compteurs } = dashboard;

  // Même partition que le brief : les urgences réelles d'abord
  // (priorités 1-5) ; sur un dossier en mise en place, les amorces.
  const reelles = recommandations.filter((r) => r.priorite <= 5);
  const file = (reelles.length > 0 ? reelles : recommandations).slice(0, 5);

  // Le solde ne recompte pas les vérifications proches déjà listées.
  const prochesAffichees = file.filter(
    (r) => r.kind === "verif_proche",
  ).length;
  const solde = Math.max(0, compteurs.verifsSous30j - prochesAffichees);

  // Le moteur de recommandations plafonne à cinq items : la carte ne peut
  // donc pas être la liste exhaustive du retard. Le reste est compté
  // depuis les compteurs, sans quoi un dossier à quarante retards se
  // lirait « cinq choses à faire, rien d'autre sous 30 jours ».
  const totalUrgent = compteurs.verifsEnRetard + compteurs.actionsEnRetard;
  const urgentsAffiches = file.filter((r) => KINDS_ALERTE.has(r.kind)).length;
  const resteUrgent = Math.max(0, totalUrgent - urgentsAffiches);

  const hrefCalendrier = `/etablissements/${etablissementId}/calendrier`;

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc
        famille="Priorités"
        titre="À faire"
        sousTitre={
          resteUrgent > 0
            ? "Les cinq plus urgentes — vérifications et actions mêlées."
            : "Vérifications et actions, par ordre d'urgence."
        }
        href={hrefCalendrier}
      />

      {file.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-start justify-center gap-2.5 rounded-[18px] bg-[color:var(--board-slate-pale)] px-5 py-6">
          <span className="inline-block rounded-full bg-[color:var(--board-green)] px-[13px] py-[6px] text-[12px] font-semibold text-[color:var(--board-green-ink)]">
            À jour
          </span>
          <p className="m-0 text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
            Rien à traiter : aucune vérification ni action ne réclame
            votre attention.
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-3 flex flex-1 list-none flex-col p-0">
          {file.map((r, i) => {
            const alerte = KINDS_ALERTE.has(r.kind);
            const type = TYPE_RECO[r.kind];
            // Écart en jours civils : le badge ne change qu'à minuit,
            // heure de Paris. Avec la division par 86 400 000, une
            // échéance du jour passait de « Auj. » à « J−1 » vers 14 h.
            const badge = r.date ? badgeEcart(r.date, aujourdhui) : null;
            // Méta : le type d'objet d'abord — c'est lui qui lève
            // l'ambiguïté — puis « en retard » ou la date.
            const meta = type
              ? `${type} · ${
                  alerte
                    ? "en retard"
                    : r.date
                      ? libelleDateCourte(r.date)
                      : (r.sousTitre ?? "")
                }`
              : (r.sousTitre ?? "");
            return (
              <li
                key={r.href}
                className={
                  i === 0
                    ? ""
                    : "border-t border-[color:rgba(10,10,10,.07)]"
                }
              >
                <Link
                  href={r.href}
                  className="-mx-2 flex items-center gap-3 rounded-[14px] px-2 py-[11px] transition-colors hover:bg-[color:var(--board-slate-pale)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[14px] font-semibold leading-[1.3] tracking-[-0.015em] text-[color:var(--board-ink)]">
                      {r.titre}
                    </p>
                    <p className="m-0 mt-0.5 truncate text-[12px] text-[color:var(--board-slate-mid)]">
                      {meta}
                    </p>
                  </div>
                  {badge ? (
                    <Pastille ton={alerte ? "alerte" : "neutre"}>
                      {badge}
                    </Pastille>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="m-0 mt-auto border-t border-[color:rgba(10,10,10,.10)] pt-[14px] text-[13px] leading-[1.5] text-[color:var(--board-slate-mid)]">
        {resteUrgent > 0 ? (
          <Link
            href={hrefCalendrier}
            className="text-[color:var(--board-ink)] underline-offset-2 hover:underline"
          >
            {resteUrgent} autre{resteUrgent > 1 ? "s" : ""} en retard
            {solde > 0
              ? `, et ${solde} échéance${solde > 1 ? "s" : ""} sous 30 jours`
              : ""}{" "}
            — voir le calendrier
          </Link>
        ) : solde > 0 ? (
          <Link
            href={hrefCalendrier}
            className="text-[color:var(--board-ink)] underline-offset-2 hover:underline"
          >
            {solde} autre{solde > 1 ? "s" : ""} échéance
            {solde > 1 ? "s" : ""} sous 30 jours — voir le calendrier
          </Link>
        ) : (
          "Rien d'autre sous 30 jours."
        )}
      </p>
    </CarteBoard>
  );
}

/* ─── 3bis · Prochaine échéance (hors défaut — repris dans « À faire ») ── */

export function BlocProchaineEcheance({ bundle }: { bundle: DashboardBundle }) {
  const { prochainesVerifs, aujourdhui, etablissementId } = bundle;

  if (prochainesVerifs.length === 0) {
    return (
      <CarteBoard
        ton="sombre"
        rayon={26}
        className="justify-center px-[26px] py-6"
      >
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-slate)]">
          Prochaine échéance
        </p>
        <p className="mt-3 text-[15px] text-white/70">
          Aucune vérification planifiée pour l&apos;instant.
        </p>
      </CarteBoard>
    );
  }

  const trie = [...prochainesVerifs].sort(
    (a, b) => a.datePrevue.getTime() - b.datePrevue.getTime(),
  );
  const v = trie[0];
  // Le compte à rebours est en jours civils, et le rouge suit le prédicat
  // partagé (ADR-011) : une échéance datée d'aujourd'hui n'est pas en
  // retard. Avec la division par 86 400 000, la carte virait au rouge
  // l'après-midi du jour dit, sans que rien n'ait changé.
  const { nombre, legende } = compteARebours(v.datePrevue, aujourdhui);
  const enRetard = estVerificationEnRetard(
    { statut: v.statut, datePrevue: v.datePrevue, dateRealisee: null },
    aujourdhui,
  );

  return (
    <CarteBoard
      ton="sombre"
      rayon={26}
      className="flex-row items-center gap-[18px] px-[26px] py-6"
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-slate)]">
          Prochaine échéance
        </p>
        <Link
          href={`/etablissements/${etablissementId}/verifications/${v.id}`}
          className="mt-3 block text-[19px] font-semibold leading-[1.2] tracking-[-0.025em] text-white hover:underline"
        >
          {v.libelleObligation}
        </Link>
        <span className="mt-2.5 inline-block">
          <Pastille ton={enRetard ? "alerte" : "neutre"}>
            {libelleDateCourte(v.datePrevue)} · {v.equipement.libelle}
          </Pastille>
        </span>
      </div>
      {/* Le compte à rebours est la seule surface claire de la carte :
          sur le noir, le glacier devient un carton posé dessus plutôt
          qu'une pastille de plus. */}
      <div
        className={
          "flex size-24 flex-none flex-col items-center justify-center rounded-[26px] " +
          (enRetard
            ? "bg-[color:var(--board-signal)]"
            : "bg-[color:var(--board-blue-pale)]")
        }
      >
        <span
          className={
            "text-[34px] font-semibold leading-none tracking-[-0.045em] " +
            (enRetard
              ? "text-[color:var(--board-signal-on)]"
              : "text-[color:var(--board-ink)]")
          }
        >
          {nombre}
        </span>
        <span
          className={
            // Le chiffre reste quasi-noir dans les deux cas ; c'est le
            // champ pastel et la légende colorée qui disent lequel des
            // deux on regarde.
            "mt-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] " +
            (enRetard
              ? "text-[color:var(--board-signal-ink)]"
              : "text-[color:var(--board-blue-ink)]")
          }
        >
          {legende}
        </span>
      </div>
    </CarteBoard>
  );
}

/* ─── 4 · Actions en retard (hors défaut — repris dans « À faire ») ── */

export function BlocActionsEnRetard({ bundle }: { bundle: DashboardBundle }) {
  const stats = bundle.statsRetardActions;
  const href = `/etablissements/${bundle.etablissementId}/actions`;

  return (
    <CarteBoard rayon={26} className="flex-row items-center gap-[18px] px-[26px] py-6">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-slate-soft)]">
          Actions en retard
        </p>
        <Link
          href={href}
          className="mt-3 block text-[19px] font-semibold leading-[1.2] tracking-[-0.025em] text-[color:var(--board-ink)] hover:underline"
        >
          {stats.plusAncienne
            ? stats.plusAncienne.libelle
            : "Aucune action dépassée"}
        </Link>
        <span className="mt-2.5 inline-block">
          {stats.nb > 0 ? (
            <Pastille ton="alerte">
              Retard moyen {stats.retardMoyenJours} jour
              {stats.retardMoyenJours > 1 ? "s" : ""}
            </Pastille>
          ) : (
            <Pastille>Plan d&apos;actions à jour</Pastille>
          )}
        </span>
      </div>
      <div
        className={
          "flex size-24 flex-none flex-col items-center justify-center rounded-[26px] " +
          (stats.nb > 0
            ? "bg-[color:var(--board-signal)]"
            : "bg-[color:var(--board-green)]")
        }
      >
        <span
          className={
            "text-[34px] font-semibold leading-none tracking-[-0.045em] " +
            (stats.nb > 0
              ? "text-[color:var(--board-signal-on)]"
              : "text-[color:var(--board-green-ink)]")
          }
        >
          {String(stats.nb).padStart(2, "0")}
        </span>
        <span
          className={
            "mt-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] " +
            (stats.nb > 0
              ? "text-[color:var(--board-signal-ink)]"
              : "text-[color:var(--board-green-ink)]")
          }
        >
          en retard
        </span>
      </div>
    </CarteBoard>
  );
}

/* ─── 5 · Où en est le plan d'actions ───────────────────────── */

export function BlocPlanActions({ bundle }: { bundle: DashboardBundle }) {
  const c = bundle.dashboard.compteurs;

  // Arcs disjoints : `actionsEnRetard` recoupe ouvertes + en cours (c'est
  // un filtre sur l'échéance, pas un statut), il ne peut donc pas être un
  // arc de plus sans fausser le total. Il est rendu en légende « dont ».
  const arcs = [
    {
      cle: "ouvertes",
      label: "Ouvertes",
      valeur: c.actionsOuvertes,
      couleur: "var(--board-blue-soft)",
    },
    {
      cle: "encours",
      label: "En cours",
      valeur: c.actionsEnCours,
      couleur: "var(--board-blue-strong)",
    },
    {
      cle: "levees",
      label: "Clôturées ce mois",
      valeur: c.actionsLeveesRecemment,
      couleur: "var(--board-green)",
    },
  ];

  const total = arcs.reduce((s, a) => s + a.valeur, 0);
  const ouvertes = c.actionsOuvertes + c.actionsEnCours;

  let curseur = 0;
  const stops = arcs
    .map((a) => {
      const debut = curseur;
      curseur += total > 0 ? (a.valeur / total) * 100 : 0;
      return `${a.couleur} ${debut}% ${curseur}%`;
    })
    .join(",");

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc
        famille="Suivi"
        titre="Où en est le plan d'actions"
        href={`/etablissements/${bundle.etablissementId}/actions`}
      />

      <div className="mt-6 flex items-center gap-[22px]">
        <div
          className="flex size-[126px] flex-none items-center justify-center rounded-full"
          style={{
            background:
              total > 0
                ? `conic-gradient(${stops})`
                : "var(--board-slate-line)",
          }}
        >
          <div className="flex size-[74px] flex-col items-center justify-center rounded-full bg-[color:var(--board-card)]">
            <span className="text-[24px] font-semibold leading-none tracking-[-0.04em] text-[color:var(--board-ink)]">
              {ouvertes}
            </span>
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--board-blue-ink)]">
              ouvertes
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[11px]">
          {arcs.map((a) => (
            <div
              key={a.cle}
              className="flex items-center gap-[9px] text-[13px] text-[color:var(--board-slate-ink)]"
            >
              <span
                className="size-[9px] rounded-[3px]"
                style={{ background: a.couleur }}
              />
              <span className="flex-1">{a.label}</span>
              <span
                className={
                  "font-semibold " +
                  (a.cle === "levees"
                    ? "text-[color:var(--board-green-ink-soft)]"
                    : "text-[color:var(--board-ink)]")
                }
              >
                {a.cle === "levees" && a.valeur > 0 ? "+" : ""}
                {a.valeur}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-[9px] text-[13px] text-[color:var(--board-slate-ink)]">
            <span className="size-[9px] rounded-[3px] bg-[color:var(--board-signal-mark)]" />
            <span className="flex-1">dont en retard</span>
            <span className="font-semibold text-[color:var(--board-ink)]">
              {c.actionsEnRetard}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-[22px] border-t border-[color:rgba(10,10,10,.10)] pt-[18px] text-[13px] leading-[1.5] text-[color:var(--board-slate-mid)]">
        {ouvertes === 0
          ? "Aucune action ouverte sur cet établissement."
          : c.actionsEnRetard === 0
            ? "Aucune action ne dépasse son échéance."
            : `${c.actionsEnRetard} action${c.actionsEnRetard > 1 ? "s" : ""} sur ${ouvertes} dépasse${c.actionsEnRetard > 1 ? "nt" : ""} son échéance.`}
      </p>
    </CarteBoard>
  );
}

/* ─── 6 · Ce qui a changé ───────────────────────────────────── */

const LIBELLE_RESULTAT: Record<string, string> = {
  conforme: "Conforme",
  observations_mineures: "Observations mineures",
  ecart_majeur: "Écart majeur",
  non_verifiable: "Non vérifiable",
};

export function BlocCeQuiAChange({ bundle }: { bundle: DashboardBundle }) {
  const { rapportsRecents, aujourdhui, etablissementId, dashboard } = bundle;

  // Ancienneté en jours civils : un rapport déposé ce matin est « du
  // jour » même s'il n'a pas encore 24 h, et un rapport d'hier soir reste
  // « d'hier » toute la journée.
  const quand = (d: Date) => libelleAnteriorite(d, aujourdhui).toUpperCase();

  // Le premier « à faire » du moteur de recos ferme la liste, comme la
  // ligne ambre du design.
  const aFaire = dashboard.recommandations[0];

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc
        famille="Preuve"
        titre="Ce qui a changé"
        sousTitre="Les derniers mouvements sur votre dossier."
        href={`/etablissements/${etablissementId}/registre`}
      />

      <div className="mt-5 flex flex-col gap-2">
        {rapportsRecents.length === 0 && !aFaire ? (
          <p className="text-[13.5px] text-[color:var(--board-slate-mid)]">
            Rien de neuf sur les derniers jours.
          </p>
        ) : null}

        {rapportsRecents.slice(0, 3).map((r, i) => (
          <Link
            key={r.id}
            href={`/etablissements/${etablissementId}/verifications/${r.verificationId}`}
            className={
              "flex items-center gap-3 rounded-full px-4 py-[13px] transition-colors hover:bg-[color:var(--board-blue-pale)] " +
              // Le plus récent est mis en avant, comme dans le design.
              (i === 0
                ? "bg-[color:var(--board-blue-pale)]"
                : "bg-[color:var(--board-slate-pale)]")
            }
          >
            <span
              className={
                "flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] " +
                (r.resultat === "ecart_majeur"
                  ? "bg-[color:var(--board-signal-mark)] font-semibold text-[color:var(--board-signal-ink)]"
                  : "bg-[color:var(--board-green)] text-[color:var(--board-green-ink)]")
              }
            >
              {r.resultat === "ecart_majeur" ? "!" : "✓"}
            </span>
            <span className="flex-1 text-[13.5px] font-medium leading-[1.35] text-[color:var(--board-ink)]">
              {r.verification.libelleObligation} —{" "}
              {LIBELLE_RESULTAT[r.resultat] ?? r.resultat}
            </span>
            <span className="flex-none text-[11.5px] font-semibold text-[color:var(--board-slate-soft)]">
              {quand(r.dateRapport)}
            </span>
          </Link>
        ))}

        {aFaire ? (
          <Link
            href={aFaire.href}
            className="flex items-center gap-3 rounded-full border border-[color:var(--board-signal-line)] bg-[color:var(--board-signal-pale)] px-4 py-[13px] transition-opacity hover:opacity-85"
          >
            <span className="flex size-[22px] flex-none items-center justify-center rounded-full bg-[color:var(--board-signal-mark)] text-[11px] font-semibold text-[color:var(--board-signal-ink)]">
              !
            </span>
            <span className="flex-1 text-[13.5px] font-medium leading-[1.35] text-[color:var(--board-ink)]">
              {aFaire.titre}
            </span>
            <span className="flex-none text-[11.5px] font-semibold text-[color:var(--board-signal-ink)]">
              À FAIRE
            </span>
          </Link>
        ) : null}
      </div>
    </CarteBoard>
  );
}

/* ─── 7 · Vos documents, en un coup d'œil ───────────────────── */

function Rond({ etat }: { etat: EtatCellule }) {
  if (etat === "na") {
    return (
      <span
        title="Sans objet pour cette ligne"
        className="flex size-6 items-center justify-center text-[color:var(--board-slate-soft)]"
      >
        <span className="h-px w-2.5 bg-current" />
      </span>
    );
  }
  if (etat === "ok") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-[color:var(--board-green)] text-[12px] text-[color:var(--board-green-ink)]">
        ✓
      </span>
    );
  }
  return (
    <span
      title="Reste à faire"
      className="size-6 rounded-full bg-[color:var(--board-slate-line)]"
    />
  );
}

export function BlocDocuments({ bundle }: { bundle: DashboardBundle }) {
  const lignes = construireMatrice({
    etablissementId: bundle.etablissementId,
    duerp: bundle.dashboard.duerp,
    nbRapports: bundle.nbRapports,
    nbVerifs: bundle.nbVerifs,
    jourDernierRapport: bundle.jourDernierRapport,
    compteurs: bundle.dashboard.compteurs,
    modules: bundle.modulesMatrice,
  });
  const restes = compterRestes(lignes);

  return (
    <CarteBoard className="px-7 py-[26px]">
      <TitreBloc famille="Dossier" titre="Vos documents, en un coup d'œil" />

      <div className="mt-[22px] grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-[7px]">
        <span className="rounded-full bg-[color:var(--board-blue-ink)] px-3.5 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
          Document
        </span>
        {COLONNES_MATRICE.map((c) => (
          <span
            key={c}
            className="rounded-full bg-[color:var(--board-slate-pale)] px-2.5 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[color:var(--board-slate-mid)]"
          >
            {c}
          </span>
        ))}

        {lignes.map((l) => (
          <Fragment key={l.id}>
            <Link
              href={l.href}
              className="rounded-full bg-[color:var(--board-blue-pale)] px-4 py-[11px] text-[13px] font-medium leading-[1.3] text-[color:var(--board-ink)] transition-opacity hover:opacity-80"
            >
              {l.libelle}
            </Link>
            {l.cellules.map((etat, i) => (
              <span key={i} className="flex justify-center">
                <Rond etat={etat} />
              </span>
            ))}
          </Fragment>
        ))}
      </div>

      <p className="mt-[18px] text-[13px] leading-[1.5] text-[color:var(--board-slate-mid)]">
        {restes === 0
          ? "Tout ce que l'outil sait mesurer est établi. Un tiret signale une colonne sans objet pour la ligne."
          : `Un rond vide n'est pas une faute : c'est ce qu'il reste à faire. ${restes} point${restes > 1 ? "s" : ""} ouvert${restes > 1 ? "s" : ""}.`}
      </p>
    </CarteBoard>
  );
}

/* ─── 8 · Préparer un contrôle ──────────────────────────────── */

export function BlocControle({ bundle }: { bundle: DashboardBundle }) {
  return (
    <CarteBoard ton="sombre" className="overflow-hidden">
      {/* Le bloc s'inverse : la hachure passe en blanc très bas, et le
          dossier devient la seule pièce claire — c'est lui qu'on tend à
          l'inspecteur. */}
      <div
        aria-hidden
        className="flex min-h-[240px] flex-1 items-center justify-center bg-[image:repeating-linear-gradient(135deg,rgba(255,255,255,.028)_0_10px,transparent_10px_20px)]"
      >
        <svg viewBox="0 0 160 110" className="w-[52%]" fill="none">
          <rect
            x="34"
            y="20"
            width="92"
            height="72"
            rx="10"
            fill="var(--board-blue-pale)"
          />
          <rect
            x="48"
            y="36"
            width="64"
            height="7"
            rx="3.5"
            fill="var(--board-blue-mid)"
          />
          <rect
            x="48"
            y="52"
            width="46"
            height="7"
            rx="3.5"
            fill="var(--board-blue-soft)"
          />
          <rect
            x="48"
            y="68"
            width="54"
            height="7"
            rx="3.5"
            fill="var(--board-blue-soft)"
          />
          <circle cx="118" cy="80" r="16" fill="var(--board-green)" />
          <path
            d="M111 80.5 116 85.5 125.5 75.5"
            stroke="var(--board-green-ink)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <Link
        href={`/etablissements/${bundle.etablissementId}/controle`}
        className="flex items-center gap-3.5 px-6 py-5 transition-colors hover:bg-white/[.06]"
      >
        <div className="min-w-0">
          <p className="m-0 text-[16px] font-semibold tracking-[-0.02em] text-white">
            Préparer un contrôle
          </p>
          <p className="mt-1 text-[13px] text-[color:var(--board-slate)]">
            Rassemblez vos pièces avant la visite d&apos;un inspecteur.
          </p>
        </div>
        {/* Le bouton s'inverse avec la carte : c'est la même touche que
            partout ailleurs, lue à l'envers. */}
        <span className="ml-auto flex size-[38px] flex-none items-center justify-center rounded-full bg-white text-[color:var(--board-ink)]">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>
    </CarteBoard>
  );
}
