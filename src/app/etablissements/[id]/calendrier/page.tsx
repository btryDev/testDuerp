import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { LegalBadge } from "@/components/ui-kit/LegalBadge";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
import { CalendrierGrille } from "@/components/calendrier/CalendrierGrille";
import { GenererCalendrierButton } from "@/components/calendrier/GenererCalendrierButton";
import { getEtablissement } from "@/lib/etablissements/queries";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { genererCalendrier } from "@/lib/calendrier/actions";
import {
  calendrierDesynchronise,
  compterEtatCalendrier,
  listerVerifications,
} from "@/lib/calendrier/queries";
import {
  listerAutresEcheances,
  tonPourDate,
  type EcheanceCalendrier,
  type FamilleEcheance,
} from "@/lib/calendrier/echeances";
import { fusionnerEvenements } from "@/lib/calendrier/evenements";
import { SectionMois } from "@/components/calendrier/SectionMois";
import {
  LABEL_FAMILLE_SINGULIER,
  MarqueurFamille,
} from "@/components/calendrier/MarqueurFamille";
import { FiltresCalendrier } from "@/components/calendrier/FiltresCalendrier";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  libelleMois,
} from "@/lib/calendrier/labels";
import { listerEvenementsFenetre } from "@/lib/dashboard/queries";
import { JOURS_APRES } from "@/lib/dashboard/frise";
import {
  FUSEAU_REFERENCE,
  JOURS_HORIZON_PROCHE,
  composantesCiviles,
} from "@/lib/dates";
import { estDansLesProchainsJours } from "@/lib/dates/retard";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

const DOMAINES_P1: DomaineObligation[] = ["electricite", "incendie", "aeration"];

/** Familles filtrables — « personnel » attendra ses modules. */
const FAMILLES_FILTRABLES: FamilleEcheance[] = [
  "controle",
  "travaux",
  "papiers",
];

// Fuseau épinglé : sans lui, le numéro de jour et le mois d'une date
// stockée à minuit UTC reculaient d'une case sur un serveur en UTC.
const FMT_JOUR = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_REFERENCE,
  day: "2-digit",
});
const FMT_MOIS_COURT = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_REFERENCE,
  month: "short",
});

/**
 * Tuile-chiffre du bandeau — le motif des cartes-compteur du board :
 * champ saturé à grand rayon, chiffre quasi noir, légende mono de la
 * famille du champ. Le registre dit l'état : rose en retard, ardoise à
 * planifier, paille proche, vert acquis.
 */
function TuileChiffre({
  valeur,
  legende,
  registre,
}: {
  valeur: number;
  legende: string;
  registre: "alerte" | "calme" | "proche" | "acquis";
}) {
  const TON: Record<
    typeof registre,
    { fond: string; chiffre: string; texte: string }
  > = {
    alerte: {
      fond: "bg-[color:var(--board-signal)]",
      chiffre: "text-[color:var(--board-signal-on)]",
      texte: "text-[color:var(--board-signal-ink)]",
    },
    proche: {
      fond: "bg-[color:var(--board-amber)]",
      chiffre: "text-[color:var(--board-amber-mark)]",
      texte: "text-[color:var(--board-amber-ink)]",
    },
    acquis: {
      fond: "bg-[color:var(--board-green)]",
      chiffre: "text-[color:var(--board-green-ink)]",
      texte: "text-[color:var(--board-green-ink)]",
    },
    calme: {
      fond: "bg-[color:var(--board-slate-pale)]",
      chiffre: "text-[color:var(--board-slate-ink)]",
      texte: "text-[color:var(--board-slate-soft)]",
    },
  };
  const ton = TON[registre];
  return (
    <div
      className={
        "flex min-w-[118px] flex-1 flex-col items-center justify-center rounded-[26px] px-4 py-5 shadow-[0_14px_30px_-20px_rgba(13,18,36,.30)] " +
        ton.fond
      }
    >
      <span
        className={
          "text-[34px] font-semibold leading-none tracking-[-0.045em] tabular-nums " +
          ton.chiffre
        }
      >
        {String(valeur).padStart(2, "0")}
      </span>
      <span
        className={
          "mt-[5px] whitespace-nowrap font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] " +
          ton.texte
        }
      >
        {legende}
      </span>
    </div>
  );
}

/**
 * Ligne de la liste mensuelle, commune à toutes les natures : tuile-date
 * (le jour dit vrai), marqueur de nature devant le titre (le même
 * vocabulaire de formes que la grille), méta explicite, pastille d'état
 * à droite. Toute la ligne est la porte.
 */
function LigneEcheance({
  href,
  date,
  famille,
  titre,
  meta,
  pastille,
}: {
  href: string;
  date: Date;
  famille: FamilleEcheance;
  titre: string;
  meta: string;
  pastille: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="-mx-2 flex items-center gap-4 rounded-[14px] px-2 py-[11px] transition-colors hover:bg-[color:var(--board-slate-pale)]"
    >
      <span className="flex w-[46px] flex-none flex-col items-center">
        <span className="text-[19px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[color:var(--board-ink)]">
          {FMT_JOUR.format(date)}
        </span>
        <span className="mt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[color:var(--board-slate-soft)]">
          {FMT_MOIS_COURT.format(date)}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 flex items-center gap-2 truncate text-[14px] font-semibold leading-[1.3] tracking-[-0.015em] text-[color:var(--board-ink)]">
          <MarqueurFamille
            famille={famille}
            className="size-3.5 text-[color:var(--board-slate-soft)]"
          />
          <span className="min-w-0 truncate">{titre}</span>
        </p>
        <p className="m-0 mt-0.5 truncate text-[12px] text-[color:var(--board-slate-mid)]">
          {meta}
        </p>
      </div>
      {pastille}
      <ChevronRight className="size-4 flex-none text-[color:var(--board-slate-soft)]" />
    </Link>
  );
}

export default async function CalendrierPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    domaine?: string;
    urgent?: string;
    famille?: string;
  }>;
}) {
  const { id } = await params;
  const { domaine, urgent, famille } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const filtreFamille = FAMILLES_FILTRABLES.includes(
    famille as FamilleEcheance,
  )
    ? (famille as FamilleEcheance)
    : undefined;
  // Le domaine est un attribut des contrôles : il n'a de sens que sur
  // eux (filtre famille « Tout » ou « Contrôles »).
  const filtreDomaine =
    (!filtreFamille || filtreFamille === "controle") &&
    DOMAINES_P1.includes(domaine as DomaineObligation)
      ? (domaine as DomaineObligation)
      : undefined;
  const filtreUrgent = urgent === "1";

  // Rattrapage à l'affichage, pour deux motifs distincts :
  //
  //  1. **Calendrier vide alors que des équipements sont déclarés** — anciens
  //     comptes d'avant la génération automatique, ou mutation qui a échoué
  //     silencieusement à régénérer.
  //  2. **Calendrier généré avec une version antérieure du référentiel** — le
  //     référentiel vit en TypeScript (ADR-003) et ses corrections (périodicité
  //     rectifiée, obligation retirée, libellé reformulé) n'étaient jusqu'ici
  //     propagées qu'au hasard d'une mutation d'équipement. Deux établissements
  //     identiques pouvaient afficher deux échéances différentes, et une
  //     obligation supprimée du référentiel laissait des lignes orphelines
  //     invisibles des filtres du registre et du dossier de contrôle.
  //
  // La réconciliation est idempotente et ne détruit jamais une ligne portant un
  // rapport, une action ou une date de réalisation (cf. ADR-012) : la relancer
  // est sans risque, et elle ne réécrit que ce qui a réellement changé.
  const etat0 = await compterEtatCalendrier(id);
  const aucuneOccurrenceEnBase =
    etat0.enRetard === 0 &&
    etat0.aPlanifier === 0 &&
    etat0.aVenir === 0 &&
    etat0.realisees12m === 0;

  if (aucuneOccurrenceEnBase) {
    const nbEquipements = (await listerEquipementsDeLEtablissement(id)).length;
    if (nbEquipements > 0) {
      await genererCalendrier(id);
    }
  } else if (await calendrierDesynchronise(id)) {
    await genererCalendrier(id);
  }

  const [verifsBruts, etat, evenementsVerifs, autresEcheances] =
    await Promise.all([
      listerVerifications(id, {
        domaine: filtreDomaine,
        urgentsSeulement: filtreUrgent,
      }),
      compterEtatCalendrier(id),
      // Même fenêtre que la frise du board : la grille mois/année du
      // widget est réutilisée ici avec la même donnée — et les mêmes
      // filtres que la liste, pour que les deux racontent la même chose.
      listerEvenementsFenetre(id, JOURS_APRES, {
        domaine: filtreDomaine,
        urgentsSeulement: filtreUrgent,
      }),
      listerAutresEcheances(id),
    ]);
  const aujourdhui = new Date();

  // Cohabitation des familles : le filtre famille partitionne, le
  // domaine implique « contrôles », l'urgence garde le dépassé partout.
  const verifsVisibles =
    !filtreFamille || filtreFamille === "controle" ? verifsBruts : [];
  // Les échéances du registre suivent le filtre famille — y compris la
  // famille « controle » (analyses légionelles). Seul le filtre domaine
  // les écarte : il qualifie le référentiel d'équipements, rien d'autre.
  const autresVisibles = filtreDomaine
    ? []
    : autresEcheances.filter(
        (e) =>
          (!filtreFamille || filtreFamille === e.famille) &&
          (!filtreUrgent || e.tone === "alerte"),
      );

  // Le header compte toutes les familles — sans quoi il dirait « rien
  // en retard » pendant que la grille montre du rouge (actions,
  // attestations…). Les compteurs vérifications (`etat`) sont complétés
  // par les échéances du registre.
  //
  // La fenêtre « sous 30 jours » se compte en **jours civils**, bornes
  // incluses (cf. `estDansLesProchainsJours`) : l'ancien `aujourdhui +
  // 30 × 86 400 000` comparait des instants, et écartait le trentième
  // jour dès que l'heure courante dépassait minuit.
  const nbAutresEnRetard = autresEcheances.filter(
    (e) => e.tone === "alerte",
  ).length;
  const nbAutresSous30j = autresEcheances.filter(
    (e) =>
      e.tone === "ok" &&
      estDansLesProchainsJours(e.date, aujourdhui, JOURS_HORIZON_PROCHE),
  ).length;
  const totalEnRetard = etat.enRetard + nbAutresEnRetard;
  const totalSous30j = etat.aVenir + nbAutresSous30j;

  // La grille reçoit tout dans le même format — la même fusion que le
  // board, pour que les deux écrans montrent le même contenu.
  const evenementsGrille = fusionnerEvenements({
    verifications: evenementsVerifs,
    autres: autresEcheances,
    etablissementId: id,
    filtres: {
      famille: filtreFamille,
      domaine: filtreDomaine,
      urgentsSeulement: filtreUrgent,
    },
  });

  // La liste mensuelle mêle les deux, triés par date dans chaque mois.
  type LigneMois =
    | { genre: "verif"; date: Date; v: (typeof verifsBruts)[number] }
    | { genre: "autre"; date: Date; e: EcheanceCalendrier };
  const lignes: LigneMois[] = [
    ...verifsVisibles.map((v) => ({
      genre: "verif" as const,
      date: v.datePrevue,
      v,
    })),
    ...autresVisibles.map((e) => ({ genre: "autre" as const, date: e.date, e })),
  ];
  const parMois = new Map<string, LigneMois[]>();
  for (const l of lignes) {
    // Mois civil lu en heure de Paris : `getMonth()` sur une date stockée
    // à minuit UTC dépend du fuseau du serveur, et rangeait une échéance
    // du 1er du mois dans le mois précédent sur un hôte à l'ouest de UTC.
    const c = composantesCiviles(l.date);
    const cle = `${c.annee}-${String(c.mois).padStart(2, "0")}`;
    const bucket = parMois.get(cle) ?? [];
    bucket.push(l);
    parMois.set(cle, bucket);
  }
  const moisTries = [...parMois.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [, liste] of moisTries) {
    liste.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Pilules de famille : seules celles qui ont au moins une échéance —
  // une famille vide n'a pas à encombrer la rangée.
  const famillesPresentes = FAMILLES_FILTRABLES.filter(
    (f) =>
      f === "controle" || autresEcheances.some((e) => e.famille === f),
  );

  const baseHref = `/etablissements/${id}/calendrier`;

  const calendrierVide =
    etat.enRetard === 0 &&
    etat.aPlanifier === 0 &&
    etat.aVenir === 0 &&
    etat.realisees12m === 0;
  // La grille s'affiche dès qu'il existe quelque chose de daté, quelle
  // que soit sa nature.
  const afficherGrille = !calendrierVide || autresEcheances.length > 0;

  return (
    <>
      {/* Bandeau ciel — même principe de fonds inversés que le board :
          le ciel tient l'en-tête pleine largeur, le canvas quasi blanc
          ne commence qu'en dessous. */}
      <div className="bg-[color:var(--board-sky)] px-[var(--board-gutter)] pb-12 pt-11">
        <Link
          href={`/etablissements/${id}`}
          className="inline-block rounded-full bg-[color:var(--board-card)] px-[14px] py-[6px] text-[11.5px] font-semibold tracking-[0.06em] text-[color:var(--board-blue-ink)] transition-opacity hover:opacity-80"
        >
          ← Tableau de bord
        </Link>

        <div className="mt-6 grid items-end gap-x-12 gap-y-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="m-0 max-w-[520px] text-pretty text-[clamp(28px,3vw,40px)] font-semibold leading-[1.06] tracking-[-0.04em] text-[color:var(--board-ink)]">
              Vérifications périodiques
            </h1>
            <p className="mt-3.5 max-w-[460px] text-[14.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
              Le calendrier se met à jour tout seul dès que vous ajoutez ou
              modifiez un équipement. Chaque occurrence cite son obligation
              légale et le profil de réalisateur requis.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <LegalBadge
                reference="Art. R. 4323-23 s. CT"
                href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018531479"
                extrait="Des arrêtés […] déterminent les équipements de travail ou les catégories d'équipement de travail pour lesquels l'employeur procède ou fait procéder à des vérifications générales périodiques afin que soit décelée en temps utile toute détérioration susceptible de créer des dangers."
              />
              <LegalBadge
                reference="Arrêté du 25 juin 1980 (ERP)"
                href="https://www.legifrance.gouv.fr/loda/id/LEGITEXT000020303557/"
              >
                <p>
                  Règlement de sécurité contre les risques d&apos;incendie et
                  de panique dans les ERP — fonde les périodicités des
                  vérifications ERP (électricité, moyens de secours,
                  désenfumage…).
                </p>
              </LegalBadge>
            </div>
          </div>

          {/* Les compteurs, en tuiles-chiffre façon cartes du board. */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-3">
              <TuileChiffre
                valeur={totalEnRetard}
                legende={totalEnRetard > 0 ? "en retard" : "rien en retard"}
                registre={totalEnRetard > 0 ? "alerte" : "acquis"}
              />
              <TuileChiffre
                valeur={etat.aPlanifier}
                legende="à planifier"
                registre="calme"
              />
              <TuileChiffre
                valeur={totalSous30j}
                legende="sous 30 jours"
                registre={totalSous30j > 0 ? "proche" : "calme"}
              />
              <TuileChiffre
                valeur={etat.realisees12m}
                legende="faites sur 12 mois"
                registre={etat.realisees12m > 0 ? "acquis" : "calme"}
              />
            </div>
            {/* Deux écrans voisins affichent « en retard » sans compter la
                même chose : ici toutes les familles d'échéances, dans la
                barre latérale les seules vérifications périodiques. Tant
                que les deux nombres cohabitent, on dit lequel est lequel
                plutôt que de laisser l'utilisateur arbitrer. */}
            <p className="m-0 max-w-[420px] text-right text-[11.5px] leading-[1.45] text-[color:var(--board-slate-mid)]">
              Ces compteurs réunissent toutes les familles d&apos;échéances —
              contrôles, travaux et papiers.
              {nbAutresEnRetard > 0
                ? ` Le badge « en retard » de la barre latérale ne compte, lui, que les vérifications périodiques : ${etat.enRetard} sur ${totalEnRetard}.`
                : " Le badge « en retard » de la barre latérale ne compte, lui, que les vérifications périodiques."}
            </p>
          </div>
        </div>
      </div>

      {/* Canvas quasi blanc — les cartes-mois s'en détachent par filet
          cheveu et ombre douce, jamais par l'aplat. */}
      <div className="flex flex-1 flex-col bg-[color:var(--board-canvas)] px-[var(--board-gutter)] pb-14 pt-7">
        <div className="flex flex-wrap items-center gap-2">
          {/* Un seul point d'entrée pour filtrer : le panneau « Filtres »
              (types en toutes lettres, domaines, urgence) ; les filtres
              actifs restent lisibles en chips retirables. */}
          <FiltresCalendrier
            baseHref={baseHref}
            famillesDisponibles={famillesPresentes}
            domaines={DOMAINES_P1.map((d) => ({
              id: d,
              label: LABEL_DOMAINE[d],
            }))}
            filtres={{
              famille: filtreFamille,
              domaine: filtreDomaine,
              urgent: filtreUrgent,
            }}
          />
          <div className="ml-auto">
            <GenererCalendrierButton etablissementId={id} libelle="Actualiser" />
          </div>
        </div>

        {/* La grille du widget, filtrée comme la liste : mêmes
            événements, deux lectures — quel jour, puis dans quel ordre. */}
        {afficherGrille ? (
          <div className="mt-6">
            <CalendrierGrille
              etablissementId={id}
              evenements={evenementsGrille}
              aujourdhui={aujourdhui}
              nbSansDate={
                !filtreFamille || filtreFamille === "controle"
                  ? etat.aPlanifier
                  : 0
              }
            />
          </div>
        ) : null}

        {lignes.length === 0 ? (
          calendrierVide && autresEcheances.length === 0 ? (
            // Calendrier vraiment vide : on explique d'où viendraient les
            // échéances, et on donne la porte de sortie — même motif que
            // l'état vide de la frise du board.
            <section className="mt-6 rounded-[30px] bg-[color:var(--board-card)] px-8 py-10 shadow-[0_1px_2px_rgba(13,18,36,.04),0_12px_32px_-14px_rgba(13,18,36,.10)] ring-1 ring-[color:rgba(13,18,36,.06)]">
              <div className="flex max-w-[560px] flex-col items-start gap-3">
                <h2 className="m-0 text-[22px] font-semibold leading-[1.15] tracking-[-0.03em] text-[color:var(--board-ink)]">
                  Votre calendrier se remplit tout seul
                </h2>
                <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                  Le Code du travail et le règlement ERP imposent de vérifier
                  certains équipements à fréquence fixe — extincteurs tous les
                  ans, installation électrique tous les ans, etc. L&apos;outil
                  calcule ces échéances à partir des équipements que vous avez
                  déclarés : il n&apos;y en a pas encore.
                </p>
                <Link
                  href={`/etablissements/${id}/equipements`}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-[color:var(--board-ink)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
                >
                  Déclarer mes équipements
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </section>
          ) : (
            // Des vérifications existent, mais les filtres les masquent
            // toutes : on le dit, et la pilule ramène à la vue complète.
            <section className="mt-6 flex flex-col items-start gap-3 rounded-[22px] bg-[color:var(--board-slate-pale)] px-6 py-7">
              <p className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)]">
                Rien ne correspond à ces filtres
              </p>
              <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                Vos échéances existent, mais aucune ne relève de la famille, du
                domaine ou de l&apos;urgence sélectionnés.
              </p>
              <Link
                href={baseHref}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-[color:var(--board-ink)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-85"
              >
                Retirer les filtres
                <ArrowUpRight className="size-3.5" />
              </Link>
            </section>
          )
        ) : (
          <div className="mt-6 flex flex-col gap-5">
            {moisTries.map(([cleMois, liste], indexMois) => {
              // L'en-tête du mois porte le rouge même replié : replier
              // ne doit jamais cacher un retard.
              const nbEnRetard = liste.filter((l) =>
                l.genre === "verif"
                  ? l.v.statut === "depassee" ||
                    (l.v.statut === "planifiee" &&
                      tonPourDate(l.v.datePrevue, aujourdhui) === "alerte")
                  : l.e.tone === "alerte",
              ).length;
              return (
              <SectionMois
                key={cleMois}
                titre={libelleMois(cleMois)}
                nb={liste.length}
                nbEnRetard={nbEnRetard}
                // Seul le premier mois arrive déplié — les en-têtes
                // (compte + rouge éventuel) suffisent pour le reste.
                defautOuvert={indexMois === 0}
              >
                <ul className="m-0 mt-3 flex list-none flex-col p-0">
                  {liste.map((ligne, i) => {
                    const sep =
                      i === 0
                        ? ""
                        : "border-t border-[color:rgba(10,10,10,.07)]";
                    // La tuile-date et la structure de ligne sont
                    // communes ; la famille s'annonce par le marqueur et
                    // la méta, l'état par la pastille de droite.
                    if (ligne.genre === "verif") {
                      const v = ligne.v;
                      const o = obligationParId(v.obligationId);
                      return (
                        <li key={v.id} className={sep}>
                          <LigneEcheance
                            href={`/etablissements/${id}/verifications/${v.id}`}
                            date={v.datePrevue}
                            famille="controle"
                            titre={v.libelleObligation}
                            meta={
                              `${LABEL_FAMILLE_SINGULIER.controle} · ` +
                              `${v.equipement.libelle} · ` +
                              LABEL_PERIODICITE[v.periodicite] +
                              (o ? ` · ${LABEL_DOMAINE[o.domaine]}` : "")
                            }
                            pastille={<BadgeStatut statut={v.statut} />}
                          />
                        </li>
                      );
                    }
                    const e = ligne.e;
                    return (
                      <li key={e.id} className={sep}>
                        <LigneEcheance
                          href={e.href}
                          date={e.date}
                          famille={e.famille}
                          titre={e.libelle}
                          meta={`${LABEL_FAMILLE_SINGULIER[e.famille]} · ${e.origine}`}
                          // La tuile-date suffit pour le futur : seule
                          // l'alerte mérite une pastille.
                          pastille={
                            e.tone === "alerte" ? (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[color:var(--board-signal)] px-[13px] py-[6px] text-[12px] font-semibold text-[color:var(--board-signal-ink)]">
                                En retard
                              </span>
                            ) : null
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </SectionMois>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
