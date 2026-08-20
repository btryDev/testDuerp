import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { AideEcran } from "@/components/ui-kit/AideEcran";
import { LegalBadge } from "@/components/ui-kit/LegalBadge";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
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
  type EcheanceCalendrier,
  type FamilleEcheance,
} from "@/lib/calendrier/echeances";
import {
  AnneeCalendrier,
  type AnneeRegle,
} from "@/components/calendrier/AnneeCalendrier";
import type { MoisRegle } from "@/components/calendrier/RegleAnnuelle";
import {
  CHAMP_ETAT,
  ENCRE_ETAT,
  PRIORITE_ETAT,
  classerDate,
  lecturesCalendrier,
  type EtatEcheance,
  type LectureCalendrier,
  type RegistreLigne,
} from "@/lib/calendrier/etats";
import {
  VueParEquipement,
  type EtatMois,
  type GroupeEquipement,
  type LigneEquipement,
  type OccurrenceEquipement,
} from "@/components/calendrier/VueParEquipement";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import {
  LABEL_FAMILLE,
  LABEL_FAMILLE_SINGULIER,
  MarqueurFamille,
} from "@/components/calendrier/MarqueurFamille";
import { FiltresCalendrier } from "@/components/calendrier/FiltresCalendrier";
import { SelecteurLecture } from "@/components/calendrier/SelecteurLecture";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  MOIS_FR,
  MOIS_FR_COURT,
  libelleMois,
} from "@/lib/calendrier/labels";
import {
  FUSEAU_REFERENCE,
  composantesCiviles,
  joursCivilsEntre,
} from "@/lib/dates";
import { obligationParId } from "@/lib/referentiels/conformite";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";

const DOMAINES_P1: DomaineObligation[] = [
  "electricite",
  "incendie",
  "aeration",
];

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
  const { domaine, urgent, famille } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const filtreFamille = FAMILLES_FILTRABLES.includes(famille as FamilleEcheance)
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

  let regenere = false;
  if (aucuneOccurrenceEnBase) {
    const nbEquipements = (await listerEquipementsDeLEtablissement(id)).length;
    if (nbEquipements > 0) {
      await genererCalendrier(id);
      regenere = true;
    }
  } else if (await calendrierDesynchronise(id)) {
    await genererCalendrier(id);
    regenere = true;
  }

  const [verifsBruts, etat, autresEcheances, equipements] = await Promise.all([
    listerVerifications(id, {
      domaine: filtreDomaine,
      urgentsSeulement: filtreUrgent,
    }),
    // Les compteurs viennent d'être calculés trois lignes plus haut : on
    // ne les refait que si une régénération a changé la donnée entre-temps.
    regenere ? compterEtatCalendrier(id) : Promise.resolve(etat0),
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

  // Toutes familles confondues — l'aide d'écran s'en sert pour expliquer
  // l'écart avec le badge de la barre latérale, qui ne compte que les
  // vérifications périodiques.
  const nbAutresEnRetard = autresEcheances.filter(
    (e) => e.tone === "alerte",
  ).length;
  const totalEnRetard = etat.enRetard + nbAutresEnRetard;

  // La liste mensuelle mêle les deux, triés par date dans chaque mois.
  //
  // Une vérification n'est pas posée telle quelle : `lecturesCalendrier`
  // déplie la ligne de suivi — un cycle soldé donne DEUX événements, le
  // fait au jour du fait et le rendez-vous suivant à sa date, classé
  // comme un futur ordinaire. Sans ce dépli, la prochaine échéance d'un
  // contrôle annuel soldé s'affichait en vert « faite »… un an trop tôt.
  type LigneMois =
    | {
        genre: "verif";
        date: Date;
        v: (typeof verifsBruts)[number];
        registre: RegistreLigne;
        lecture: LectureCalendrier["lecture"];
      }
    | { genre: "autre"; date: Date; e: EcheanceCalendrier };
  const lignes: LigneMois[] = [
    ...verifsVisibles.flatMap((v) =>
      lecturesCalendrier(v, aujourdhui).map((lec) => ({
        genre: "verif" as const,
        date: lec.date,
        v,
        registre: lec.registre,
        lecture: lec.lecture,
      })),
    ),
    ...autresVisibles.map((e) => ({
      genre: "autre" as const,
      date: e.date,
      e,
    })),
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

  // Le classement vit dans `lib/calendrier/etats` (bâti sur les prédicats
  // de `lib/dates/retard`) : cette page l'a redérivé à la main une fois,
  // et ça a produit deux compteurs contradictoires sur le même écran. Le
  // registre d'une ligne de vérification est figé au dépli
  // (`lecturesCalendrier`), plus jamais recalculé.
  const etatDeLaLigne = (l: LigneMois): EtatEcheance => {
    if (l.genre !== "verif") {
      return l.e.tone === "alerte"
        ? "enRetard"
        : classerDate(l.date, aujourdhui);
    }
    // « À planifier » (donc à date future — le classifieur a déjà rangé
    // les dates passées en retard) est écarté des barres par `datable` ;
    // si la ligne arrive quand même ici, sa date de génération se classe
    // comme une date ordinaire plutôt que d'inventer un état de barre.
    return l.registre === "aPlanifier"
      ? classerDate(l.date, aujourdhui)
      : l.registre;
  };

  // « Datable » : mérite une place sur les barres. Une `a_planifier` qui
  // attend son rendez-vous n'en a pas (sa date est une date de
  // génération) ; une `a_planifier` en retard en a une — le mois où elle
  // est devenue due — comme sur la frise du tableau de bord.
  const datable = (l: LigneMois) =>
    l.genre !== "verif" || l.registre !== "aPlanifier";

  const regleDeLAnnee = (a: number): MoisRegle[] =>
    Array.from({ length: 12 }, (_, i) => {
      const cle = `${a}-${String(i + 1).padStart(2, "0")}`;
      const compte = { enRetard: 0, proche: 0, lointain: 0, faite: 0 };
      for (const l of parMois.get(cle) ?? []) {
        if (!datable(l)) continue;
        compte[etatDeLaLigne(l)] += 1;
      }
      return {
        cle,
        label: MOIS_FR_COURT[i],
        labelLong: `${MOIS_FR[i]} ${a}`,
        ...compte,
      };
    });

  // La règle couvre TOUTES les années du dossier, d'un seul tenant : de
  // la plus ancienne dette au contrôle quinquennal le plus lointain, sans
  // trou — une année déserte entre deux se feuillette comme les autres,
  // sinon les flèches sauteraient des pages. L'année courante est toujours
  // du voyage : c'est la page ouverte à l'arrivée.
  const anneesAvecLignes = [...parMois.keys()].map((k) => Number(k.slice(0, 4)));
  const anneeMin = Math.min(anneeCourante, ...anneesAvecLignes);
  const anneeMax = Math.max(anneeCourante, ...anneesAvecLignes);
  const anneesRegle: AnneeRegle[] = Array.from(
    { length: anneeMax - anneeMin + 1 },
    (_, i) => ({ annee: anneeMin + i, mois: regleDeLAnnee(anneeMin + i) }),
  );

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
      categorieCode: string;
      mois: EtatMois[];
      compte: Record<EtatEcheance, number>;
      aPlanifier: number;
      /** Occurrences datées hors de l'année affichée. */
      horsAnnee: number;
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
        categorieCode: v.equipement.categorie,
        mois: Array.from({ length: 12 }, () => null),
        compte: { enRetard: 0, proche: 0, lointain: 0, faite: 0 },
        aPlanifier: 0,
        horsAnnee: 0,
        dates: [],
        occurrences: [],
      };
      parEquipement.set(cle, e);
    }
    // Même dépli que la liste mensuelle : un cycle soldé pose le fait au
    // jour du fait ET le rendez-vous suivant à sa date — sans quoi la
    // carte de l'appareil peignait sa prochaine échéance en vert.
    for (const lec of lecturesCalendrier(v, aujourdhui)) {
      if (lec.registre === "aPlanifier") {
        e.aPlanifier += 1;
        continue;
      }
      const etat = lec.registre;
      // `dates` sert la « prochaine échéance », qui n'est bornée par
      // aucune année : une dette de l'an dernier compte toujours.
      e.dates.push({ date: lec.date, etat });

      // Les compteurs décrivent l'APPAREIL, pas l'année : une dette de
      // l'an dernier reste une dette, et une vérification faite en
      // septembre dernier reste faite. Les borner à l'année civile les
      // faisait disparaître de l'écran au 1er janvier — ce qui est faux,
      // et pire que l'écart qu'on cherchait à éviter.
      e.compte[etat] += 1;

      const c = composantesCiviles(lec.date);
      if (c.annee !== anneeCourante) {
        // La règle, elle, ne montre qu'une année. L'écart entre ce
        // qu'elle marque et ce que comptent les pilules se dit plutôt
        // qu'il ne se corrige : « +1 hors 2026 ».
        e.horsAnnee += 1;
      } else {
        const i = c.mois - 1;
        const actuel = e.mois[i];
        // Une case ne peut porter qu'un état : c'est le plus urgent du
        // mois qui gagne. Mélanger les teintes sur 18 px ne se lirait pas.
        if (!actuel || PRIORITE_ETAT[etat] > PRIORITE_ETAT[actuel])
          e.mois[i] = etat;

        const o = obligationParId(v.obligationId);
        e.occurrences.push({
          // Deux lectures d'une même ligne peuvent cohabiter dans
          // l'année : la clé porte la lecture pour rester unique.
          id: `${v.id}:${lec.lecture}`,
          href: `/etablissements/${id}/verifications/${v.id}`,
          mois: c.mois,
          jour: FMT_JOUR.format(lec.date),
          moisCourt: FMT_MOIS_COURT.format(lec.date),
          titre: v.libelleObligation,
          meta:
            LABEL_PERIODICITE[v.periodicite] +
            (o ? ` · ${LABEL_DOMAINE[o.domaine]}` : ""),
          etat,
          // Le rendez-vous suivant n'hérite pas du statut réalisé de la
          // ligne : sa pastille dit ce qu'il est — planifié.
          statut: lec.lecture === "prochaine" ? "planifiee" : v.statut,
        });
      }
    }
  }

  const lignesEquipement: LigneEquipement[] = [...parEquipement.entries()]
    .map(([idEq, e]) => {
      const enRetard = e.dates
        .filter((d) => d.etat === "enRetard")
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const futures = e.dates
        .filter((d) => d.etat === "proche" || d.etat === "lointain")
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      // La plus ancienne dette d'abord : c'est elle qui coûte. À défaut,
      // la prochaine échéance.
      const cible = enRetard[0] ?? futures[0] ?? null;
      const jours = cible
        ? Math.abs(joursCivilsEntre(aujourdhui, cible.date))
        : 0;
      return {
        id: idEq,
        libelle: e.libelle,
        categorie: e.categorie,
        categorieCode: e.categorieCode,
        hrefFiche: `/etablissements/${id}/equipements/${idEq}/modifier`,
        mois: e.mois,
        enRetard: e.compte.enRetard,
        proche: e.compte.proche,
        lointain: e.compte.lointain,
        faite: e.compte.faite,
        aPlanifier: e.aPlanifier,
        horsAnnee: e.horsAnnee,
        occurrences: [...e.occurrences].sort(
          (a, b) => a.mois - b.mois || a.jour.localeCompare(b.jour),
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
    .sort(
      (a, b) => b.enRetard - a.enRetard || a.libelle.localeCompare(b.libelle),
    );

  // Les appareils se lisent par catégorie : six extincteurs dispersés
  // dans une liste triée par retard, c'est six fois la même question
  // posée à six endroits, alors qu'on les traite ensemble — un seul
  // prestataire, une seule visite. Le groupe porte donc le solde de la
  // catégorie, et l'ordre met devant celle qui coûte le plus.
  const groupesEquipement: GroupeEquipement[] = [
    ...lignesEquipement
      .reduce((acc, l) => {
        const g = acc.get(l.categorieCode) ?? {
          categorie: l.categorie,
          categorieCode: l.categorieCode,
          uniteLigne: "appareil",
          lignes: [],
          enRetard: 0,
          proche: 0,
          lointain: 0,
          faite: 0,
          aPlanifier: 0,
        };
        g.lignes.push(l);
        g.enRetard += l.enRetard;
        g.proche += l.proche;
        g.lointain += l.lointain;
        g.faite += l.faite;
        g.aPlanifier += l.aPlanifier;
        acc.set(l.categorieCode, g);
        return acc;
      }, new Map<string, GroupeEquipement>())
      .values(),
  ].sort(
    (a, b) =>
      b.enRetard - a.enRetard ||
      b.proche - a.proche ||
      a.categorie.localeCompare(b.categorie),
  );

  // Ce qui ne tient à aucun appareil — attestation de prestataire,
  // correction du plan d'actions, analyse du carnet sanitaire — se rangeait
  // jusqu'ici dans une note de bas de vue, c'est-à-dire nulle part. Ces
  // échéances ont pourtant un porteur naturel : leur famille. Le groupe
  // « Autres échéances » les accueille, une carte par famille, avec la
  // même règle annuelle et le même tiroir que les appareils.
  const parFamille = new Map<
    FamilleEcheance,
    {
      mois: EtatMois[];
      compte: Record<EtatEcheance, number>;
      horsAnnee: number;
      dates: { date: Date; etat: EtatEcheance }[];
      occurrences: OccurrenceEquipement[];
    }
  >();

  for (const e of autresVisibles) {
    let f = parFamille.get(e.famille);
    if (!f) {
      f = {
        mois: Array.from({ length: 12 }, () => null),
        compte: { enRetard: 0, proche: 0, lointain: 0, faite: 0 },
        horsAnnee: 0,
        dates: [],
        occurrences: [],
      };
      parFamille.set(e.famille, f);
    }
    const etat = etatDeLaLigne({ genre: "autre", date: e.date, e });
    f.dates.push({ date: e.date, etat });
    f.compte[etat] += 1;

    const c = composantesCiviles(e.date);
    if (c.annee !== anneeCourante) {
      f.horsAnnee += 1;
    } else {
      const i = c.mois - 1;
      const actuel = f.mois[i];
      if (!actuel || PRIORITE_ETAT[etat] > PRIORITE_ETAT[actuel]) {
        f.mois[i] = etat;
      }
      f.occurrences.push({
        id: e.id,
        href: e.href,
        mois: c.mois,
        jour: FMT_JOUR.format(e.date),
        moisCourt: FMT_MOIS_COURT.format(e.date),
        titre: e.libelle,
        meta: e.origine,
        etat,
      });
    }
  }

  const lignesAutres: LigneEquipement[] = [...parFamille.entries()]
    .map(([famille, f]) => {
      const enRetard = f.dates
        .filter((d) => d.etat === "enRetard")
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const futures = f.dates
        .filter((d) => d.etat === "proche" || d.etat === "lointain")
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      const cible = enRetard[0] ?? futures[0] ?? null;
      const jours = cible
        ? Math.abs(joursCivilsEntre(aujourdhui, cible.date))
        : 0;
      return {
        id: `famille-${famille}`,
        libelle: LABEL_FAMILLE[famille],
        categorie: "Autres échéances",
        categorieCode: "AUTRES",
        // Une famille n'a pas de fiche : sa porte, c'est la liste
        // mensuelle filtrée sur elle.
        hrefFiche: `/etablissements/${id}/calendrier?famille=${famille}`,
        mois: f.mois,
        enRetard: f.compte.enRetard,
        proche: f.compte.proche,
        lointain: f.compte.lointain,
        faite: f.compte.faite,
        aPlanifier: 0,
        horsAnnee: f.horsAnnee,
        occurrences: [...f.occurrences].sort(
          (a, b) => a.mois - b.mois || a.jour.localeCompare(b.jour),
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
    .sort(
      (a, b) => b.enRetard - a.enRetard || a.libelle.localeCompare(b.libelle),
    );

  // En queue, jamais mêlé au parc : ce groupe ne parle pas d'appareils.
  if (lignesAutres.length > 0) {
    groupesEquipement.push({
      categorie: "Autres échéances",
      categorieCode: "AUTRES",
      uniteLigne: "famille",
      lignes: lignesAutres,
      enRetard: lignesAutres.reduce((n, l) => n + l.enRetard, 0),
      proche: lignesAutres.reduce((n, l) => n + l.proche, 0),
      lointain: lignesAutres.reduce((n, l) => n + l.lointain, 0),
      faite: 0,
      aPlanifier: 0,
    });
  }

  // Les équipements déclarés qui ne portent aucune occurrence : ils ne
  // font pas de ligne, mais leur nombre se dit.
  const sansEcheance = Math.max(
    0,
    equipements.length - lignesEquipement.length,
  );

  // Le mois déplié à l'arrivée : celui où l'on est, s'il porte quelque
  // chose ; sinon le premier mois qui a du retard — c'est là que se joue
  // la conformité —, sinon le premier mois tout court.
  const cleMoisCourant = `${anneeCourante}-${String(
    composantesCiviles(aujourdhui).mois,
  ).padStart(2, "0")}`;
  const moisInitial =
    (parMois.has(cleMoisCourant) ? cleMoisCourant : null) ??
    anneesRegle.flatMap((a) => a.mois).find((m) => m.enRetard > 0)?.cle ??
    moisTries[0]?.[0] ??
    null;

  // Pilules de famille : seules celles qui ont au moins une échéance —
  // une famille vide n'a pas à encombrer la rangée.
  const famillesPresentes = FAMILLES_FILTRABLES.filter(
    (f) => f === "controle" || autresEcheances.some((e) => e.famille === f),
  );

  const baseHref = `/etablissements/${id}/calendrier`;

  const calendrierVide =
    etat.enRetard === 0 &&
    etat.aPlanifier === 0 &&
    etat.aVenir === 0 &&
    etat.realisees12m === 0;

  // La bande de titre : pleine largeur, en encre.
  //
  // Elle a été un bandeau ciel, puis une carte du bento. Les deux
  // posaient un objet de plus avant la liste : sur un écran où chaque
  // équipement est déjà une carte, trois blocs à ombre se disputaient le
  // premier regard. La bande ne flotte pas, elle borne — et l'encre
  // plutôt que le ciel, parce que le bleu revenait trois fois sur la même
  // page (bandeau, en-têtes de carte, pilules) et finissait par ne plus
  // rien désigner.
  const bandeTitre = (
    <div className="bg-[color:var(--board-ink)] px-[var(--board-gutter)] py-[22px] text-white">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        <div className="flex min-w-0 items-center gap-[18px]">
          <Link
            href={`/etablissements/${id}`}
            aria-label="Retour au tableau de bord"
            className="flex size-8 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-4 rotate-180" />
          </Link>
          <div className="min-w-0">
            <p className="board-eyebrow m-0 text-[color:var(--board-blue-soft)]">
              Échéances · {anneeCourante}
            </p>
            <h1 className="board-titre m-0 mt-1.5 text-[clamp(22px,2.2vw,27px)] text-white">
              Vérifications périodiques
            </h1>
          </div>
        </div>

        {/* Les compteurs qui vivaient ici doublonnaient la règle et les
            pilules des cartes ; la bande porte plutôt le choix qui
            commande tout l'écran : la lecture. Il n'apparaît que si le
            calendrier a des lignes — deux onglets sur du vide seraient un
            décor. */}
        {lignes.length > 0 ? <SelecteurLecture /> : null}
      </div>
    </div>
  );

  // Ce que la page doit expliquer mais qu'on ne lit qu'une fois — d'où
  // vient le calendrier, ce que comptent les compteurs, les articles qui
  // fondent l'obligation, comment lire la règle. En texte courant au-dessus
  // du contenu, ces notes coûtaient trois lignes et deux badges à chaque
  // visite ; elles vivent désormais derrière le « ? » de la barre d'outils,
  // et les autres pages rangeront les leurs au même endroit (`AideEcran`).
  const aide = (
    <AideEcran titre="Comment lire cette page">
      <p className="m-0">
        Le calendrier se met à jour tout seul dès que vous ajoutez ou modifiez
        un équipement — chaque occurrence cite son obligation légale et le
        profil de réalisateur requis.
      </p>
      <p className="m-0">
        La règle en tête montre une année d&apos;un bloc : la hauteur
        d&apos;une barre dit le volume du mois, sa couleur l&apos;état le plus
        urgent, et cliquer un mois ouvre son détail. Les occurrences « à
        planifier » n&apos;y figurent pas tant qu&apos;aucune date n&apos;est
        convenue — elles sont comptées à part.
      </p>
      <p className="m-0">
        Les flèches changent d&apos;année, et les cartes du dessous suivent :
        chaque année se lit entière, mois vides compris. Sur l&apos;année en
        cours, la liste s&apos;ouvre sur le mois d&apos;aujourd&apos;hui et
        les mois déjà passés restent repliés — leur pli affiche toujours son
        nombre de retards.
      </p>
      {/* Deux écrans voisins affichent « en retard » sans compter la même
          chose : ici toutes les familles d'échéances, dans la barre
          latérale les seules vérifications périodiques. Tant que les deux
          nombres cohabitent, on dit lequel est lequel plutôt que de laisser
          l'utilisateur arbitrer. */}
      <p className="m-0">
        Les compteurs du bandeau réunissent toutes les familles — contrôles,
        travaux et papiers.
        {nbAutresEnRetard > 0
          ? ` Le badge « en retard » de la barre latérale ne compte, lui, que les vérifications périodiques : ${etat.enRetard} sur ${totalEnRetard}.`
          : " Le badge « en retard » de la barre latérale ne compte, lui, que les vérifications périodiques."}
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
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
            panique dans les ERP — fonde les périodicités des vérifications ERP
            (électricité, moyens de secours, désenfumage…).
          </p>
        </LegalBadge>
      </div>
    </AideEcran>
  );

  // Un seul point d'entrée pour filtrer : le panneau « Filtres » (types en
  // toutes lettres, domaines, urgence) ; les filtres actifs restent
  // lisibles en chips retirables. La barre vit SOUS la bascule
  // mois/équipement : on choisit d'abord sa lecture, puis on affine — et
  // les filtres règlent ce que les deux lectures montrent.
  const barreOutils = (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <FiltresCalendrier
        baseHref={baseHref}
        famillesDisponibles={famillesPresentes}
        domaines={DOMAINES_P1.map((d) => ({ id: d, label: LABEL_DOMAINE[d] }))}
        filtres={{
          famille: filtreFamille,
          domaine: filtreDomaine,
          urgent: filtreUrgent,
        }}
      />
      <span className="ml-auto">{aide}</span>
    </div>
  );

  return (
    <>
      {/* Plus de bandeau pleine largeur : le ciel devient une carte du
          bento, à hauteur de l'instrument. C'est ce qui distingue cet
          écran du tableau de bord — même bleu, même famille, mais une
          lecture verticale (titre en pile, compteurs en cartouche) là où
          le board déroule une frise horizontale. */}
      {bandeTitre}

      <div className="flex flex-1 flex-col bg-[color:var(--board-card)] px-[var(--board-gutter)] pb-14 pt-7">
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
                  Vos échéances existent, mais aucune ne relève de la famille,
                  du domaine ou de l&apos;urgence sélectionnés.
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
              annee={anneeCourante}
              anneesRegle={anneesRegle}
              /* « Sans date » ne concerne que les contrôles : sous un
                 filtre de famille qui les écarte, le compteur mentirait. */
              sansDate={
                !filtreFamille || filtreFamille === "controle"
                  ? etat.aPlanifier
                  : 0
              }
              moisInitial={moisInitial}
              cleMoisCourant={cleMoisCourant}
              outils={barreOutils}
              parEquipement={
                <VueParEquipement
                  annee={anneeCourante}
                  moisCourant={composantesCiviles(aujourdhui).mois}
                  groupes={groupesEquipement}
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
                    ? l.registre === "enRetard"
                    : l.e.tone === "alerte",
                ).length,
                // Ce que la règle ne place pas : la carte le dit, sans
                // quoi son total et celui de l'instrument se contredisent.
                nbAPlanifier: liste.filter(
                  (l) => l.genre === "verif" && l.registre === "aPlanifier",
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
                          // Deux lectures d'une même ligne (fait +
                          // prochain rendez-vous) peuvent tomber dans le
                          // même mois : la clé porte la lecture.
                          <li key={`${v.id}:${ligne.lecture}`} className={sep}>
                            <LigneEcheance
                              href={`/etablissements/${id}/verifications/${v.id}`}
                              date={ligne.date}
                              famille="controle"
                              titre={v.libelleObligation}
                              meta={
                                `${LABEL_FAMILLE_SINGULIER.controle} · ` +
                                `${v.equipement.libelle} · ` +
                                LABEL_PERIODICITE[v.periodicite] +
                                (o ? ` · ${LABEL_DOMAINE[o.domaine]}` : "")
                              }
                              pastille={
                                // Le rendez-vous suivant d'un cycle soldé
                                // n'hérite pas du badge « Conforme » : sa
                                // pastille dit ce qu'il est — planifié.
                                <BadgeStatut
                                  statut={
                                    ligne.lecture === "prochaine"
                                      ? "planifiee"
                                      : v.statut
                                  }
                                />
                              }
                              registre={ligne.registre}
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
      </div>
    </>
  );
}
