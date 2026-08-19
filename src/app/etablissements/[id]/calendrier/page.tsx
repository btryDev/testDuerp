import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { LegalBadge } from "@/components/ui-kit/LegalBadge";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
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
import { AnneeCalendrier } from "@/components/calendrier/AnneeCalendrier";
import type { MoisRegle } from "@/components/calendrier/RegleAnnuelle";
import {
  CHAMP_ETAT,
  ENCRE_ETAT,
  PRIORITE_ETAT,
  type EtatEcheance,
  type RegistreLigne,
} from "@/lib/calendrier/etats";
import {
  VueParEquipement,
  type EtatMois,
  type LigneEquipement,
  type OccurrenceEquipement,
} from "@/components/calendrier/VueParEquipement";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import {
  LABEL_FAMILLE_SINGULIER,
  MarqueurFamille,
} from "@/components/calendrier/MarqueurFamille";
import { FiltresCalendrier } from "@/components/calendrier/FiltresCalendrier";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  MOIS_FR,
  MOIS_FR_COURT,
  libelleMois,
} from "@/lib/calendrier/labels";
import {
  FUSEAU_REFERENCE,
  JOURS_HORIZON_PROCHE,
  composantesCiviles,
  joursCivilsEntre,
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
/**
 * Une ligne de la cartouche de compteurs : libellé mono à gauche, chiffre
 * à droite, filet au-dessus. La lecture est verticale — c'est ce qui la
 * distingue des tuiles carrées du tableau de bord, qui disent la même
 * chose à l'horizontale.
 */
function LigneCompteur({
  libelle,
  valeur,
  registre,
}: {
  libelle: string;
  valeur: number;
  registre: "alerte" | "calme" | "proche" | "acquis";
}) {
  const ENCRE: Record<typeof registre, string> = {
    alerte: "text-[color:var(--board-signal-ink)]",
    proche: "text-[color:var(--board-amber-ink)]",
    acquis: "text-[color:var(--board-green-ink)]",
    calme: "text-[color:var(--board-ink)]",
  };
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-[color:rgba(10,10,10,.14)] py-[11px]">
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-[color:var(--board-slate-ink)]">
        {libelle}
      </span>
      <span
        className={"board-titre text-[26px] tabular-nums " + ENCRE[registre]}
      >
        {valeur}
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
/**
 * La tuile-date porte la couleur de l'état parce que c'est l'objet que
 * l'œil trouve en premier dans une liste de vingt lignes : la date EST
 * l'information urgente. La pastille de droite garde, elle, le
 * vocabulaire de statut de l'application (« Conforme », « À planifier »…),
 * qui dit autre chose que le retard.
 */
function LigneEcheance({
  href,
  date,
  famille,
  titre,
  meta,
  pastille,
  registre,
}: {
  href: string;
  date: Date;
  famille: FamilleEcheance;
  titre: string;
  meta: string;
  pastille: React.ReactNode;
  registre: RegistreLigne;
}) {
  return (
    <Link
      href={href}
      className="-mx-3 flex items-center gap-4 rounded-[20px] px-3 py-3 transition-colors hover:bg-[color:var(--board-slate-pale)]"
    >
      <span
        className="flex size-[50px] flex-none flex-col items-center justify-center rounded-[17px]"
        style={{ background: CHAMP_ETAT[registre] }}
      >
        <span className="board-titre text-[18px] leading-none tabular-nums">
          {FMT_JOUR.format(date)}
        </span>
        <span
          className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: ENCRE_ETAT[registre] }}
        >
          {FMT_MOIS_COURT.format(date)}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 flex items-center gap-2 truncate text-[14.5px] font-semibold leading-[1.3] tracking-[-0.015em] text-[color:var(--board-ink)]">
          <MarqueurFamille
            famille={famille}
            className="size-3.5 text-[color:var(--board-slate-soft)]"
          />
          <span className="min-w-0 truncate">{titre}</span>
        </p>
        <p className="m-0 mt-1 truncate text-[12.5px] text-[color:var(--board-slate-mid)]">
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
    vue?: string;
  }>;
}) {
  const { id } = await params;
  const { domaine, urgent, famille, vue } = await searchParams;
  // Deux lectures de la même donnée : « que dois-je faire en août ? » et
  // « qu'est-ce que cet appareil me demande ? ». Le choix vit dans l'URL —
  // il se partage, se met en favori, et survit à un rechargement.
  const vueEquipement = vue === "equipement";
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

  const [verifsBruts, etat, autresEcheances, equipements] = await Promise.all([
    listerVerifications(id, {
      domaine: filtreDomaine,
      urgentsSeulement: filtreUrgent,
    }),
    compterEtatCalendrier(id),
    listerAutresEcheances(id),
    // Le parc entier, pas seulement les appareils qui portent une
    // échéance : la lecture par équipement doit pouvoir dire combien
    // n'en ont aucune.
    listerEquipementsDeLEtablissement(id),
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

  // ─────────────────────────────────────────────────────────────────
  // La règle annuelle : les mêmes lignes, vues de loin.
  //
  // Deux règles de fond, héritées de la grille qu'elle remplace :
  //
  //   1. Les occurrences « à planifier » n'entrent PAS dans les barres.
  //      Leur `datePrevue` est une date de génération, pas un rendez-vous :
  //      les poser sur un mois donnerait à lire un engagement qui n'existe
  //      pas. Elles sont annoncées à part, par le compteur « sans date » —
  //      et la liste, elle, les garde, parce qu'elle affiche leur statut.
  //   2. La couleur d'un segment dit l'état, jamais le volume (cf.
  //      `RegleAnnuelle`).
  const anneeCourante = composantesCiviles(aujourdhui).annee;

  const etatDeLaLigne = (l: LigneMois): EtatEcheance => {
    if (l.genre === "verif") {
      const v = l.v;
      if (v.dateRealisee || v.statut.startsWith("realisee")) return "faite";
      if (
        v.statut === "depassee" ||
        tonPourDate(v.datePrevue, aujourdhui) === "alerte"
      ) {
        return "enRetard";
      }
    } else if (l.e.tone === "alerte") {
      return "enRetard";
    }
    return estDansLesProchainsJours(l.date, aujourdhui, JOURS_HORIZON_PROCHE)
      ? "proche"
      : "aVenir";
  };

  const datable = (l: LigneMois) =>
    l.genre !== "verif" || l.v.statut !== "a_planifier";

  const moisRegle: MoisRegle[] = Array.from({ length: 12 }, (_, i) => {
    const cle = `${anneeCourante}-${String(i + 1).padStart(2, "0")}`;
    const compte = { enRetard: 0, proche: 0, aVenir: 0, faite: 0 };
    for (const l of parMois.get(cle) ?? []) {
      if (!datable(l)) continue;
      compte[etatDeLaLigne(l)] += 1;
    }
    return {
      cle,
      label: MOIS_FR_COURT[i],
      labelLong: `${MOIS_FR[i]} ${anneeCourante}`,
      ...compte,
    };
  });

  const totalAnnee = moisRegle.reduce(
    (n, m) => n + m.enRetard + m.proche + m.aVenir + m.faite,
    0,
  );
  // Ce que la règle ne peut pas montrer sans mentir : les mois d'une
  // autre année. Elles restent dans la liste, et la règle le dit.
  const horsAnnee = lignes.filter(
    (l) =>
      datable(l) && composantesCiviles(l.date).annee !== anneeCourante,
  ).length;

  // ─────────────────────────────────────────────────────────────────
  // La lecture par équipement : mêmes occurrences, autre regroupement.
  //
  // Seuls les contrôles s'y rattachent — une attestation de prestataire ou
  // un travail du plan d'actions ne tient à aucun appareil. Les compter
  // sous un équipement serait faux, les taire ferait croire que le parc
  // porte toute la conformité : la vue les annonce à part.
  const parEquipement = new Map<
    string,
    {
      libelle: string;
      categorie: string;
      mois: EtatMois[];
      compte: Record<EtatEcheance, number>;
      aPlanifier: number;
      dates: { date: Date; etat: EtatEcheance }[];
      occurrences: OccurrenceEquipement[];
    }
  >();

  for (const v of verifsVisibles) {
    const cle = v.equipement.id;
    let e = parEquipement.get(cle);
    if (!e) {
      e = {
        libelle: v.equipement.libelle,
        categorie: LABEL_CATEGORIE_EQUIPEMENT[v.equipement.categorie],
        mois: Array.from({ length: 12 }, () => null),
        compte: { enRetard: 0, proche: 0, aVenir: 0, faite: 0 },
        aPlanifier: 0,
        dates: [],
        occurrences: [],
      };
      parEquipement.set(cle, e);
    }
    if (v.statut === "a_planifier") {
      e.aPlanifier += 1;
      continue;
    }
    const ligne = { genre: "verif" as const, date: v.datePrevue, v };
    const etat = etatDeLaLigne(ligne);
    e.compte[etat] += 1;
    e.dates.push({ date: v.datePrevue, etat });

    const c = composantesCiviles(v.datePrevue);
    if (c.annee === anneeCourante) {
      const i = c.mois - 1;
      const actuel = e.mois[i];
      // Une case ne peut porter qu'un état : c'est le plus urgent du
      // mois qui gagne. Mélanger les teintes sur 18 px ne se lirait pas.
      if (!actuel || PRIORITE_ETAT[etat] > PRIORITE_ETAT[actuel]) e.mois[i] = etat;

      const o = obligationParId(v.obligationId);
      e.occurrences.push({
        id: v.id,
        href: `/etablissements/${id}/verifications/${v.id}`,
        mois: c.mois,
        jour: FMT_JOUR.format(v.datePrevue),
        moisCourt: FMT_MOIS_COURT.format(v.datePrevue),
        titre: v.libelleObligation,
        meta:
          LABEL_PERIODICITE[v.periodicite] +
          (o ? ` · ${LABEL_DOMAINE[o.domaine]}` : ""),
        etat,
        statut: v.statut,
      });
    }
  }

  const lignesEquipement: LigneEquipement[] = [...parEquipement.entries()]
    .map(([idEq, e]) => {
      const enRetard = e.dates
        .filter((d) => d.etat === "enRetard")
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const aVenir = e.dates
        .filter((d) => d.etat === "proche" || d.etat === "aVenir")
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      // La plus ancienne dette d'abord : c'est elle qui coûte. À défaut,
      // la prochaine échéance.
      const cible = enRetard[0] ?? aVenir[0] ?? null;
      const jours = cible
        ? Math.abs(joursCivilsEntre(aujourdhui, cible.date))
        : 0;
      return {
        id: idEq,
        libelle: e.libelle,
        categorie: e.categorie,
        mois: e.mois,
        enRetard: e.compte.enRetard,
        proche: e.compte.proche,
        aVenir: e.compte.aVenir,
        faite: e.compte.faite,
        aPlanifier: e.aPlanifier,
        occurrences: [...e.occurrences].sort((a, b) =>
          a.mois - b.mois || a.jour.localeCompare(b.jour),
        ),
        prochaine: cible
          ? {
              etat: cible.etat,
              libelle:
                cible.etat === "enRetard"
                  ? `Dépassée de ${jours} j`
                  : jours === 0
                    ? "Aujourd'hui"
                    : `Dans ${jours} jour${jours > 1 ? "s" : ""}`,
            }
          : null,
      };
    })
    .sort((a, b) => b.enRetard - a.enRetard || a.libelle.localeCompare(b.libelle));

  // Les équipements déclarés qui ne portent aucune occurrence : ils ne
  // font pas de ligne, mais leur nombre se dit.
  const sansEcheance = Math.max(
    0,
    equipements.length - lignesEquipement.length,
  );
  const sansEquipement = autresVisibles.length;

  // Le mois déplié à l'arrivée : celui où l'on est, s'il porte quelque
  // chose ; sinon le premier mois qui a du retard — c'est là que se joue
  // la conformité —, sinon le premier mois tout court.
  const cleMoisCourant = `${anneeCourante}-${String(
    composantesCiviles(aujourdhui).mois,
  ).padStart(2, "0")}`;
  const moisInitial =
    (parMois.has(cleMoisCourant) ? cleMoisCourant : null) ??
    moisRegle.find((m) => m.enRetard > 0)?.cle ??
    moisTries[0]?.[0] ??
    null;

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

  const carteTitre = (
    <div className="flex flex-col rounded-[30px] bg-[color:var(--board-sky)] px-7 py-[26px]">
      <p className="board-eyebrow m-0 text-[color:var(--board-ink)]">
        Échéances · {anneeCourante}
      </p>
      <h1 className="board-titre m-0 mt-3 text-[clamp(26px,2.4vw,34px)] tracking-[-0.042em]">
        Vérifications périodiques
      </h1>
      <p className="m-0 mt-3.5 text-[14px] leading-[1.6] text-[color:var(--board-slate-ink)]">
        Le calendrier se met à jour tout seul dès que vous ajoutez ou
        modifiez un équipement — chaque occurrence cite son obligation
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
            Règlement de sécurité contre les risques d&apos;incendie et de
            panique dans les ERP — fonde les périodicités des vérifications
            ERP (électricité, moyens de secours, désenfumage…).
          </p>
        </LegalBadge>
      </div>

      {/* Les compteurs en cartouche : une ligne par registre, séparées
          par des filets. Le board les pose en tuiles carrées côte à
          côte — deux objets différents pour deux écrans différents. */}
      <div className="mt-auto pt-7">
        <LigneCompteur
          libelle="En retard"
          valeur={totalEnRetard}
          registre={totalEnRetard > 0 ? "alerte" : "acquis"}
        />
        <LigneCompteur
          libelle="Sous 30 jours"
          valeur={totalSous30j}
          registre={totalSous30j > 0 ? "proche" : "calme"}
        />
        <LigneCompteur
          libelle="À planifier"
          valeur={etat.aPlanifier}
          registre="calme"
        />
        <LigneCompteur
          libelle="Faites sur 12 mois"
          valeur={etat.realisees12m}
          registre={etat.realisees12m > 0 ? "acquis" : "calme"}
        />
        {/* Deux écrans voisins affichent « en retard » sans compter la
            même chose : ici toutes les familles d'échéances, dans la
            barre latérale les seules vérifications périodiques. Tant que
            les deux nombres cohabitent, on dit lequel est lequel plutôt
            que de laisser l'utilisateur arbitrer. */}
        <p className="m-0 mt-4 text-[11.5px] leading-[1.45] text-[color:var(--board-slate-mid)]">
          Ces compteurs réunissent toutes les familles d&apos;échéances —
          contrôles, travaux et papiers.
          {nbAutresEnRetard > 0
            ? ` Le badge « en retard » de la barre latérale ne compte, lui, que les vérifications périodiques : ${etat.enRetard} sur ${totalEnRetard}.`
            : " Le badge « en retard » de la barre latérale ne compte, lui, que les vérifications périodiques."}
        </p>
      </div>
    </div>
  );

  // Un seul point d'entrée pour filtrer : le panneau « Filtres » (types en
  // toutes lettres, domaines, urgence) ; les filtres actifs restent
  // lisibles en chips retirables. `AnneeCalendrier` le pose entre
  // l'instrument et la liste, la branche « calendrier vide » le pose
  // seul — d'où la variable.
  const barreOutils = (
    <FiltresCalendrier
      baseHref={baseHref}
      famillesDisponibles={famillesPresentes}
      domaines={DOMAINES_P1.map((d) => ({ id: d, label: LABEL_DOMAINE[d] }))}
      filtres={{
        famille: filtreFamille,
        domaine: filtreDomaine,
        urgent: filtreUrgent,
      }}
      vue={vueEquipement ? "equipement" : undefined}
    />
  );

  return (
    <>
      {/* Plus de bandeau pleine largeur : le ciel devient une carte du
          bento, à hauteur de l'instrument. C'est ce qui distingue cet
          écran du tableau de bord — même bleu, même famille, mais une
          lecture verticale (titre en pile, compteurs en cartouche) là où
          le board déroule une frise horizontale. */}
      <div className="flex flex-1 flex-col bg-[color:var(--board-canvas)] px-[var(--board-gutter)] pb-14 pt-7">
        <Link
          href={`/etablissements/${id}`}
          className="mb-4 inline-flex w-fit items-center rounded-full bg-[color:var(--board-card)] px-[14px] py-[7px] text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] shadow-[0_0_0_1px_rgba(13,18,36,.06)] transition-opacity hover:opacity-80"
        >
          ← Tableau de bord
        </Link>

        {lignes.length === 0 ? (
          <div>
            {barreOutils}
            {calendrierVide && autresEcheances.length === 0 ? (
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
            )}
          </div>
        ) : (
          <div>
            <AnneeCalendrier
              entete={carteTitre}
              annee={anneeCourante}
              moisRegle={moisRegle}
              totalAnnee={totalAnnee}
              horsAnnee={horsAnnee}
              /* « Sans date » ne concerne que les contrôles : sous un
                 filtre de famille qui les écarte, le compteur mentirait. */
              sansDate={
                !filtreFamille || filtreFamille === "controle"
                  ? etat.aPlanifier
                  : 0
              }
              moisInitial={moisInitial}
              lectureInitiale={vueEquipement ? "equipement" : "mois"}
              outils={barreOutils}
              parEquipement={
                <VueParEquipement
                  annee={anneeCourante}
                  lignes={lignesEquipement}
                  etablissementId={id}
                  sansEquipement={sansEquipement}
                  sansEcheance={sansEcheance}
                />
              }
              sections={moisTries.map(([cleMois, liste]) => ({
                cle: cleMois,
                titre: libelleMois(cleMois),
                nb: liste.length,
                // L'en-tête du mois porte le rouge même replié : replier
                // ne doit jamais cacher un retard.
                nbEnRetard: liste.filter((l) =>
                  l.genre === "verif"
                    ? l.v.statut === "depassee" ||
                      (l.v.statut === "planifiee" &&
                        tonPourDate(l.v.datePrevue, aujourdhui) === "alerte")
                    : l.e.tone === "alerte",
                ).length,
                // Ce que la règle ne place pas : la carte le dit, sans
                // quoi son total et celui de l'instrument se contredisent.
                nbAPlanifier: liste.filter(
                  (l) => l.genre === "verif" && l.v.statut === "a_planifier",
                ).length,
                contenu: (
                  // La clé n'est pas décorative : le contenu du mois est
                  // créé côté serveur puis traverse la frontière client
                  // dans une propriété. React le reçoit alors comme un
                  // enfant de liste et réclame sa clé, faute de quoi la
                  // console du calendrier reste rouge en développement.
                  <ul
                    key={cleMois}
                    className="m-0 mt-3 flex list-none flex-col p-0"
                  >
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
                              registre={
                                v.statut === "a_planifier"
                                  ? "aPlanifier"
                                  : etatDeLaLigne(ligne)
                              }
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
                            registre={etatDeLaLigne(ligne)}
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
                ),
              }))}
            />
          </div>
        )}

        {/* Le recalcul n'est pas une commande de tous les jours : les
            échéances se régénèrent seules à chaque changement d'équipement,
            au premier chargement d'un calendrier vide, et quand le
            référentiel change de version. Ce bouton ne sert qu'au cas que
            l'auto-réparation ne voit pas — une régénération qui a échoué
            derrière une modification réussie, laissant un calendrier ni
            vide ni périmé, seulement faux. À ce titre il vit en pied de
            page, pas dans la barre d'outils : posé à côté de « Filtres »,
            il se lisait comme une action courante et son libellé
            « Actualiser » ne disait pas qu'il réécrit des occurrences. */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--board-slate-line)] pt-6">
          <p className="m-0 max-w-[620px] text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
            Vos échéances se recalculent toutes seules dès que vous ajoutez ou
            modifiez un équipement. Ce bouton ne sert que si l&apos;une de ces
            mises à jour a échoué — il ne touche jamais une occurrence portant
            un rapport, une action ou une date de réalisation.
          </p>
          <GenererCalendrierButton
            etablissementId={id}
            libelle="Recalculer les échéances"
          />
        </div>
      </div>
    </>
  );
}
