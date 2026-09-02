// Le document d'état de vérification, rendu depuis les données.
//
// Séparé de la mesure pour une seule raison : le document doit pouvoir être
// REGÉNÉRÉ par un test et comparé au fichier commité. Sans ça, « aucun chiffre
// écrit à la main » resterait une intention — quelqu'un corrigerait un compte à
// la main dans le Markdown, et le document rejoindrait la pile de ceux qui se
// périment en silence. Le rendu est donc une fonction pure, à une seule entrée
// variable : la date de génération.
//
// Toute valeur affichée ici passe par une interpolation. Il n'y a pas un seul
// nombre littéral dans la prose de ce fichier, y compris « les N degrés de
// l'échelle » — un barreau ajouté demain changerait la phrase toute seule.

import { REFERENTIEL_VERSION } from "../conformite";
import {
  agreger,
  ANCRAGES,
  DEGRES,
  degre,
  lecturesNonCitees,
  lecturesParDate,
  mesurerReferentiel,
  resumer,
  type Agregat,
  type Ancrage,
  type CodeDegre,
  type ObligationMesuree,
} from "./verification";

const CHEMIN = "docs/etat-verification-referentiel.md";
const COMMANDE = "pnpm verification --ecrire";

/**
 * La ligne que le test neutralise avant de comparer.
 *
 * Elle est seule à bouger d'une génération à l'autre. Tout le reste du document
 * est une fonction des données ; si une autre ligne change sans que les données
 * aient changé, c'est un défaut du rendu, et le test doit le voir.
 */
export const PREFIXE_DATE = "**Généré le** :";

function cellule(v: string | number | null | boolean): string {
  if (v === true) return "✓";
  if (v === false || v === null || v === "") return "—";
  return String(v).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function tableau(
  entetes: readonly string[],
  lignes: readonly (readonly (string | number | null | boolean)[])[],
): string {
  return [
    `| ${entetes.join(" | ")} |`,
    `| ${entetes.map(() => "---").join(" | ")} |`,
    ...lignes.map((l) => `| ${l.map(cellule).join(" | ")} |`),
  ].join("\n");
}

/** Une part, arrondie à l'entier — jamais saisie, toujours calculée. */
function part(n: number, total: number): string {
  return total === 0 ? "—" : `${Math.round((n / total) * 100)} %`;
}

function accord(n: number, singulier: string, pluriel: string): string {
  return n > 1 ? pluriel : singulier;
}

/** Le degré, tel qu'il se lit dans une colonne : « 5 · première main ». */
function bref(code: CodeDegre): string {
  const d = degre(code);
  return `${d.rang} · ${d.court}`;
}

const ANCRAGE_COURT: Record<Ancrage, string> = {
  ancre: "ancrée",
  divergent: "divergente",
  jamais_constate: "jamais constatée",
};

// -----------------------------------------------------------------------------

function enTete(genereLe: string): string {
  return [
    "# État de vérification du référentiel",
    "",
    "<!-- Document GÉNÉRÉ. Ne l'éditez pas à la main : la prochaine génération",
    "     écraserait la correction, et un test compare déjà ce fichier au rendu",
    `     du script. Pour le mettre à jour : ${COMMANDE} -->`,
    "",
    `${PREFIXE_DATE} ${genereLe}`,
    `**Référentiel** : \`${REFERENTIEL_VERSION}\``,
    `**Régénérer** : \`${COMMANDE}\``,
    "",
    "Ce document répond à une question, et à une seule : **de quoi le",
    "référentiel peut-il dire qu'il l'a lu ?** Il ne rend aucun verdict sur le",
    "droit. Il rapproche ce que les obligations citent de ce que le corpus",
    "déclare avoir dépouillé, et compte.",
    "",
    "Il existe parce que la réponse était introuvable. Elle vivait dans les",
    "champs de deux modules, dans des messages de commit et dans un compte rendu",
    "de nuit que personne ne rouvrait — assez pour croire tour à tour, le même",
    "jour, qu'aucune relecture n'avait eu lieu puis que tout avait été vérifié.",
    "Les deux étaient faux. Le document ne se rédige pas : il se régénère.",
  ].join("\n");
}

function bornes(): string {
  return [
    "## Ce que ce document ne dit pas",
    "",
    "- **Si une périodicité est juste.** Ce n'est pas mesurable mécaniquement.",
    "  Un article lu en première main, verbatim relevé, peut fonder un rythme",
    "  faux ; ce document le classera au degré le plus solide, et il aura raison",
    "  de le faire : il mesure la trace de lecture, pas la lecture.",
    "- **Si le champ d'application retenu est le bon.** Un article plus large que",
    "  ce qu'on en a tiré se lit ici comme n'importe quel autre.",
    "- **Si le bon article est cité.** Un fondement approximatif — citer",
    "  l'article qui parle du sujet plutôt que celui qui prescrit — est",
    "  indétectable d'ici.",
    "",
    "Ces trois questions supposent d'ouvrir le texte. Ce document dit seulement",
    "qui l'a fait, quand, et ce qu'il en reste d'écrit.",
    "",
    "Les contrôles de cohérence qui, eux, sont mécaniques — périodicité sans",
    "texte porteur, lien rompu entre un article et l'obligation qu'il fonde,",
    "divergence de version — sont tenus par `pnpm relecture`, qui déplie chaque",
    "référence en une ligne. Ce document-ci ne les redit pas.",
  ].join("\n");
}

function echelle(): string {
  const l: string[] = [];
  l.push(`## 1. L'échelle, et pourquoi elle a ${DEGRES.length} barreaux`);
  l.push("");
  l.push(
    "Le degré d'une référence répond à « qu'est-ce que le dépôt prouve qu'on a",
  );
  l.push(
    "lu de ce texte ? ». Chaque barreau correspond à une combinaison de champs",
  );
  l.push("réellement distinguable dans les types du corpus.");
  l.push("");
  l.push(
    tableau(
      ["rang", "degré", "ce que le dépôt permet d'affirmer", "pourquoi ce barreau est à part"],
      DEGRES.map((d) => [d.rang, `**${d.titre}**`, d.affirme, d.pourquoiDistinct]),
    ),
  );
  l.push("");
  l.push(
    "**Un second axe, tenu à part.** `ReferenceLegale.versionConstatee` (porté",
  );
  l.push(
    "par l'obligation) et `ArticleDepouille.luLe` / `.lecture` / `.citationCle`",
  );
  l.push(
    "(portés par l'article de corpus) ne disent pas la même chose : le premier",
  );
  l.push(
    "est l'ancre de veille — la version contre laquelle l'obligation est calée,",
  );
  l.push(
    "celle qui permettra de voir que le texte a bougé — les seconds sont la trace",
  );
  l.push(
    "de lecture. Une référence peut être lue à la source avec verbatim sans",
  );
  l.push(
    "porter d'ancre, et l'inverse existe. Les fondre en une note unique",
  );
  l.push("effacerait celle des deux qui manque.");
  l.push("");
  l.push(
    tableau(
      ["ancrage", "ce qu'il dit"],
      ANCRAGES.map((a) => [`**${ANCRAGE_COURT[a.code]}**`, a.titre]),
    ),
  );
  l.push("");
  l.push(
    "**Le degré d'une obligation est celui de sa référence la plus faible**, et",
  );
  l.push(
    "non celui de son fondement. Le Code du travail renvoie presque toujours la",
  );
  l.push(
    "périodicité à un arrêté, et cet arrêté est une référence de contexte : ne",
  );
  l.push(
    "mesurer que le fondement déclarerait vérifiée une obligation dont le chiffre",
  );
  l.push("repose sur un texte que personne n'a ouvert.");
  return l.join("\n");
}

function ouEnEstOn(mesures: readonly ObligationMesuree[]): string {
  const tout = resumer("tout", mesures);
  const fondements = new Map<CodeDegre, number>();
  for (const m of mesures) {
    fondements.set(m.degreFondement, (fondements.get(m.degreFondement) ?? 0) + 1);
  }
  const affaibliesParLeContexte = mesures.filter(
    (m) => degre(m.degrePlancher).rang < degre(m.degreFondement).rang,
  );
  const solides = mesures.filter((m) => degre(m.degrePlancher).rang >= 4);
  const sansVerbatim = tout.obligationsParDegre.lu_sans_verbatim;

  const l: string[] = [];
  l.push("## 2. Où en est-on");
  l.push("");
  l.push(
    `**${tout.obligations} obligations**, **${tout.references} références** — ` +
      `${mesures.filter((m) => m.references.length > 1).length} obligations en ` +
      `citent plus d'une.`,
  );
  l.push("");
  l.push(
    tableau(
      [
        "degré",
        "obligations (au plancher)",
        "part",
        "dont fondements",
        "références",
        "part",
      ],
      DEGRES.map((d) => [
        `${d.rang} · ${d.titre}`,
        tout.obligationsParDegre[d.code],
        part(tout.obligationsParDegre[d.code], tout.obligations),
        fondements.get(d.code) ?? 0,
        tout.referencesParDegre[d.code],
        part(tout.referencesParDegre[d.code], tout.references),
      ]),
    ),
  );
  l.push("");
  l.push(
    `**${solides.length} obligations sur ${tout.obligations} (${part(solides.length, tout.obligations)})** ` +
      `reposent, jusqu'à leur dernière référence de contexte, sur des textes lus ` +
      `à la source avec verbatim relevé.`,
  );
  l.push("");
  l.push(
    `**${sansVerbatim} obligations (${part(sansVerbatim, tout.obligations)})** ` +
      `citent au moins un texte ouvert et daté dont rien n'a été relevé. Ce n'est ` +
      `pas une lecture à refaire : c'est une lecture qu'on ne peut ni contrôler ` +
      `ni contredire sans rouvrir Légifrance.`,
  );
  l.push("");
  l.push(
    `**${affaibliesParLeContexte.length} ${accord(affaibliesParLeContexte.length, "obligation est mieux vérifiée sur son fondement que sur l'ensemble de ses références", "obligations sont mieux vérifiées sur leur fondement que sur l'ensemble de leurs références")}** — ` +
      `leur point faible est une référence de contexte, celle que le dossier de ` +
      `relecture replie dans un « + N réf. »` +
      (affaibliesParLeContexte.length === 0
        ? "."
        : ` : ${affaibliesParLeContexte.map((m) => `\`${m.id}\``).join(", ")}.`),
  );
  const bas = DEGRES.filter((d) => d.rang <= 1);
  const totalBas = bas.reduce(
    (n, d) => n + tout.referencesParDegre[d.code],
    0,
  );
  l.push("");
  l.push(
    totalBas === 0
      ? `**Aucune référence n'est au bas de l'échelle** : les ${bas.length} degrés ` +
          `${bas.map((d) => `« ${d.titre} »`).join(" et ")} sont vides. Toute ` +
          `référence du référentiel porte une clé d'article, cette clé est connue ` +
          `d'un corpus, et cet article porte une date et un moyen de lecture. ` +
          `Ces degrés restent dans l'échelle parce que leur disparition ne se ` +
          `verrait pas si l'échelle ne les nommait plus.`
      : `**${totalBas} ${accord(totalBas, "référence est", "références sont")} au bas de l'échelle** : ` +
          `citée${accord(totalBas, "", "s")} sans avoir été ouverte${accord(totalBas, "", "s")}.`,
  );
  return l.join("\n");
}

function veille(mesures: readonly ObligationMesuree[]): string {
  const tout = resumer("tout", mesures);
  const sansAucuneAncre = mesures.filter((m) =>
    m.references.every((r) => r.ancrage === "jamais_constate"),
  );
  const divergentes = mesures.filter((m) =>
    m.references.some((r) => r.ancrage === "divergent"),
  );

  const l: string[] = [];
  l.push("## 3. L'ancre de veille");
  l.push("");
  l.push(
    tableau(
      ["ancrage", "références", "part"],
      ANCRAGES.map((a) => [
        ANCRAGE_COURT[a.code],
        tout.referencesParAncrage[a.code],
        part(tout.referencesParAncrage[a.code], tout.references),
      ]),
    ),
  );
  l.push("");
  l.push(
    `**${sansAucuneAncre.length} obligations sur ${tout.obligations} ` +
      `(${part(sansAucuneAncre.length, tout.obligations)}) ne portent aucune ` +
      `version constatée, sur aucune de leurs références.** Le jour où l'un de ` +
      `leurs textes est modifié, rien dans le dépôt ne pourra le signaler : ` +
      `l'absence de repère se lit comme « à vérifier », jamais comme « à jour ».`,
  );
  l.push("");
  l.push(
    divergentes.length === 0
      ? "**Aucune divergence** entre la version qu'une obligation déclare avoir " +
          "constatée et celle que le corpus déclare avoir lue. Les deux moitiés " +
          "du dépôt disent la même chose partout où elles parlent toutes les deux."
      : `**${divergentes.length} ${accord(divergentes.length, "obligation déclare", "obligations déclarent")} une version que ` +
          `le corpus contredit** : ` +
          `${divergentes.map((m) => `\`${m.id}\``).join(", ")}. À trancher, pas à relire.`,
  );
  return l.join("\n");
}

function tableauAgregats(titre: string, agregats: readonly Agregat[]): string {
  const l: string[] = [];
  l.push(titre);
  l.push("");
  l.push(
    tableau(
      [
        "",
        "obl.",
        "réf.",
        ...DEGRES.map((d) => String(d.rang)),
        "vérifiées à la source",
        "sans ancre",
        "lu entre",
      ],
      agregats.map((a) => {
        const solides =
          a.obligationsParDegre.premiere_main + a.obligationsParDegre.agent_verbatim;
        return [
          `\`${a.cle}\``,
          a.obligations,
          a.references,
          ...DEGRES.map((d) =>
            a.obligationsParDegre[d.code] === 0
              ? "·"
              : String(a.obligationsParDegre[d.code]),
          ),
          `${solides} / ${a.obligations} — ${part(solides, a.obligations)}`,
          `${a.referencesParAncrage.jamais_constate} / ${a.references}`,
          a.luLeDepuis === a.luLeJusqua
            ? (a.luLeDepuis ?? "—")
            : `${a.luLeDepuis} → ${a.luLeJusqua}`,
        ];
      }),
    ),
  );
  l.push("");
  l.push(
    `Colonnes numérotées : le nombre d'obligations à chaque rang de l'échelle, ` +
      `mesuré au plancher — ${DEGRES.map((d) => `**${d.rang}** ${d.court}`).join(", ")}.`,
  );
  return l.join("\n");
}

function parDomaine(mesures: readonly ObligationMesuree[]): string {
  const agregats = agreger(mesures, (m) => m.domaine);
  const solide = (a: Agregat) =>
    a.obligationsParDegre.premiere_main + a.obligationsParDegre.agent_verbatim;
  const entiers = agregats.filter((a) => solide(a) === a.obligations);
  const aucun = agregats.filter((a) => solide(a) === 0);

  const l: string[] = [];
  l.push(tableauAgregats("## 4. Par domaine", agregats));
  l.push("");
  l.push(
    entiers.length === 0
      ? "Aucun domaine n'a toutes ses obligations adossées à des textes lus à la source avec verbatim relevé."
      : `**${entiers.length} ${accord(entiers.length, "domaine a toutes ses obligations adossées", "domaines ont toutes leurs obligations adossées")} à des textes ` +
          `lus à la source avec verbatim relevé** : ${entiers.map((a) => `\`${a.cle}\` (${a.obligations})`).join(", ")}.`,
  );
  l.push("");
  l.push(
    aucun.length === 0
      ? "Aucun domaine n'est entièrement dépourvu de verbatim."
      : `**${aucun.length} ${accord(aucun.length, "domaine n'en a aucune", "domaines n'en ont aucune")} : ` +
          `${aucun.map((a) => `\`${a.cle}\` (${a.obligations})`).join(", ")}.** ` +
          `Chacune de leurs obligations cite au moins un texte ouvert et daté dont ` +
          `rien n'a été relevé. Le travail qu'ils appellent n'est pas de relire — ` +
          `les textes ont été ouverts — mais d'en recopier la phrase décisive, ` +
          `pour qu'un relecteur puisse contredire l'encodage sans rouvrir ` +
          `Légifrance.`,
  );
  return l.join("\n");
}

function parPorteur(mesures: readonly ObligationMesuree[]): string {
  return tableauAgregats("## 5. Par porteur", agreger(mesures, (m) => m.porteur));
}

function quandOnALu(mesures: readonly ObligationMesuree[]): string {
  const dates = lecturesParDate(mesures);
  const tout = resumer("tout", mesures);
  const datees = dates.reduce((n, d) => n + d.references, 0);

  const l: string[] = [];
  l.push("## 6. Quand ces textes ont été lus");
  l.push("");
  l.push(
    tableau(
      ["date de lecture", "références", "part", "obligations concernées"],
      dates.map((d) => [
        d.date,
        d.references,
        part(d.references, tout.references),
        d.obligations,
      ]),
    ),
  );
  l.push("");
  l.push(
    `${datees} des ${tout.references} références portent une date de lecture, ` +
      `toutes comprises entre ${dates[0]?.date ?? "—"} et ` +
      `${dates[dates.length - 1]?.date ?? "—"}.`,
  );
  l.push("");
  l.push(
    "Ces dates ne sont pas un âge : elles disent quand quelqu'un a ouvert le",
    "texte, pas depuis quand la version lue est en vigueur. Une lecture d'hier",
    "sur une version de 2008 est parfaitement à jour. C'est l'ancre de veille du",
    "§ 3, pas cette colonne, qui dira qu'un texte a bougé.",
  );
  return l.join("\n");
}

function luMaisPasCite(): string {
  const orphelins = lecturesNonCitees();
  const articles = orphelins.reduce((n, c) => n + c.articles, 0);
  const entiers = orphelins.filter((c) => c.articles === c.total);

  const l: string[] = [];
  l.push("## 7. Ce qui est lu et que personne ne cite");
  l.push("");
  l.push(
    "Une référence n'existe que si une obligation la cite. Un texte dépouillé",
    "que rien ne cite n'apparaît donc dans aucun degré ci-dessus — et le prendre",
    "pour du travail restant est exactement l'erreur qui a failli faire relancer",
    "une relecture déjà faite.",
  );
  l.push("");
  l.push(
    `**${articles} articles dépouillés ne sont cités par aucune obligation**, ` +
      `répartis sur ${orphelins.length} corpus.`,
  );
  l.push("");
  l.push(
    tableau(
      ["corpus", "articles non cités", "sur", "lus"],
      orphelins.map((c) => [
        `\`${c.corpus}\``,
        c.articles,
        c.total,
        c.luLeDepuis === c.luLeJusqua
          ? (c.luLeDepuis ?? "—")
          : `${c.luLeDepuis} → ${c.luLeJusqua}`,
      ]),
    ),
  );
  l.push("");
  l.push(
    entiers.length === 0
      ? `Aucun corpus n'est intégralement non cité.`
      : `**${entiers.length} ${accord(entiers.length, "corpus n'est cité nulle part", "corpus ne sont cités nulle part")}** — ` +
          `${entiers.map((c) => `\`${c.corpus}\` (${c.total} articles, lus ${c.luLeDepuis === c.luLeJusqua ? c.luLeDepuis : `${c.luLeDepuis} → ${c.luLeJusqua}`})`).join(", ")}. ` +
          `Le dépouillement est fait, aucune obligation ne s'y branche encore.`,
  );
  l.push("");
  l.push(
    `Le total du corpus, les articles jamais lus et ceux qui imposent une ` +
      `obligation que le référentiel ne porte pas sont tenus par ` +
      `\`pnpm relecture\`, qui les compte à la maille du corpus.`,
  );
  return l.join("\n");
}

function detailParObligation(mesures: readonly ObligationMesuree[]): string {
  return [
    `## 8. Les ${mesures.length} obligations`,
    "",
    tableau(
      [
        "obligation",
        "domaine",
        "porteur",
        "réf.",
        "fondement",
        "plancher",
        "sans ancre",
        "lu",
      ],
      [...mesures]
        .sort(
          (a, b) =>
            degre(a.degrePlancher).rang - degre(b.degrePlancher).rang ||
            a.domaine.localeCompare(b.domaine, "fr") ||
            a.id.localeCompare(b.id, "fr"),
        )
        .map((m) => [
          `\`${m.id}\``,
          m.domaine,
          m.porteur,
          m.references.length,
          bref(m.degreFondement),
          bref(m.degrePlancher),
          `${m.references.filter((r) => r.ancrage === "jamais_constate").length} / ${m.references.length}`,
          m.luLeDepuis === m.luLeJusqua
            ? (m.luLeDepuis ?? "—")
            : `${m.luLeDepuis} → ${m.luLeJusqua}`,
        ]),
    ),
    "",
    "Trié du plus faible au plus solide : la première ligne est celle qui",
    "demande le plus de travail.",
  ].join("\n");
}

function detailParReference(mesures: readonly ObligationMesuree[]): string {
  const lignes = mesures.flatMap((m) => m.references);
  return [
    `## 9. Les ${lignes.length} références, une par une`,
    "",
    "`prescrit` et `verbatim` sont les deux champs du corpus qui rendent une",
    "lecture relisible : ce que l'article impose, en une phrase, et la phrase",
    "décisive recopiée. Une ligne sans verbatim est une lecture qu'il faut",
    "refaire pour la contredire.",
    "",
    tableau(
      [
        "obligation",
        "rang",
        "référence",
        "article",
        "corpus",
        "statut",
        "lu le",
        "moyen",
        "prescrit",
        "verbatim",
        "version au corpus",
        "version constatée",
        "degré",
        "ancrage",
      ],
      lignes.map((r) => [
        `\`${r.obligation}\``,
        r.position === 0 ? "fondement" : `contexte ${r.position}`,
        r.reference,
        r.article,
        r.corpus,
        r.statutCorpus,
        r.luLe,
        r.lecture,
        r.aPrescrit,
        r.aCitationCle,
        r.versionEnVigueur,
        r.versionConstatee,
        bref(r.degre),
        ANCRAGE_COURT[r.ancrage],
      ]),
    ),
  ].join("\n");
}

// -----------------------------------------------------------------------------

/**
 * Le document entier. Seul `genereLe` varie d'un appel à l'autre ; tout le
 * reste est une fonction des données du dépôt.
 */
export function rendreEtatVerification(genereLe: string): string {
  const mesures = mesurerReferentiel();
  return (
    [
      enTete(genereLe),
      bornes(),
      echelle(),
      ouEnEstOn(mesures),
      veille(mesures),
      parDomaine(mesures),
      parPorteur(mesures),
      quandOnALu(mesures),
      luMaisPasCite(),
      detailParObligation(mesures),
      detailParReference(mesures),
    ].join("\n\n---\n\n") + "\n"
  );
}

export const CHEMIN_DOCUMENT = CHEMIN;
