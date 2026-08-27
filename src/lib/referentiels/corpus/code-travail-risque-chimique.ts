// Corpus : code du travail — agents chimiques dangereux et équipements de travail.
//
// Étendue « articles_cites » : seuls les articles que le référentiel cite.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_RISQUE_CHIMIQUE: Corpus = {
  id: "code-travail-risque-chimique",
  intitule:
    "Code du travail — agents chimiques dangereux et équipements de travail",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018530931/",
  etendue: "articles_cites",
  portee:
    "Prévention du risque chimique (R. 4412-11 et s.), information et formation (R. 4412-38, R. 4412-87), aération (R. 4222-20), et formation à l'utilisation des équipements de travail (R. 4323-1 et s.).",
  articles: [
    {
      ref: "R. 4222-21",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["aeration-travail-mise-en-service"],
    },
    {
      ref: "R. 4412-11",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "stockage-dangereux-retention",
        "stockage-dangereux-verification-etancheite",
      ],
    },
    {
      ref: "R. 4412-38",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "stockage-dangereux-fiches-donnees",
        "stockage-dangereux-formation-personnel",
      ],
    },
    {
      ref: "R. 4412-87",
      versionEnVigueur: "2018-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["stockage-dangereux-formation-personnel"],
    },
    {
      ref: "R. 4222-20",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-27",
      lecture: "premiere_main",
      citationCle:
        "L'employeur maintient l'ensemble des installations mentionnées au présent chapitre en bon état de fonctionnement et en assure régulièrement le contrôle.",
      statut: "retenu",
      obligations: [
        // L'obligation portée par l'établissement (ADR-022) : l'article pris
        // pour ce qu'il dit, l'ensemble des installations du chapitre.
        "aeration-controle-installations-r4222-20",
        // Deux autres obligations citent aussi R. 4222-20, et elles restent
        // parce qu'elles ne sont PAS des fragments : la mise en service est
        // un acte distinct (une seule fois, dans le mois qui suit), et le
        // volet stockage relève de l'article 4 de l'arrêté du 8 octobre 1987
        // — les locaux à pollution spécifique, autre régime.
        //
        // Un troisième, `aeration-travail-entretien-annuel`, a été RETIRÉ le
        // 2026-08-27 : même acte, même rythme, même arrêté que l'obligation
        // qui porte l'article entier (ADR-022).
        "aeration-travail-mise-en-service",
        "stockage-dangereux-ventilation-locaux",
      ],
      reserve:
        "L'article ne fixe aucun rythme : il dit « régulièrement ». Le rythme encodé (annuel) vient de la chaîne R. 4222-22 → arrêté du 8 octobre 1987, art. 3, « au minimum une fois par an » en local à pollution non spécifique — le cas des trois secteurs cibles. L'article 4 du même arrêté vise les locaux à pollution spécifique : même rythme annuel, plus un contrôle semestriel réservé aux installations avec recyclage. Ce semestriel N'EST PORTÉ NULLE PART — une première rédaction de cette réserve le disait « porté ailleurs » en citant un identifiant inventé, corrigé le 2026-08-27. Il est décrit dans `aeration-travail-locaux-pollution-specifique` sans y être planifié, faute d'une propriété d'équipement « recyclage » : c'est un manque réel, antérieur au chantier du porteur. Si un secteur à pollution spécifique entrait au périmètre, le porteur établissement ne suffirait plus à lui seul.",
    },
    {
      ref: "R. 4222-22",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-27",
      lecture: "premiere_main",
      citationCle:
        "Des arrêtés conjoints des ministres chargés du travail et de l'agriculture fixent : 1° Les méthodes de mesure de concentration, de débit, d'efficacité de captage, de filtration et d'épuration ; 2° La nature et la fréquence du contrôle des installations mentionnées au présent chapitre.",
      statut: "sans_objet",
      motif:
        "Renvoi pur : l'article n'impose rien à l'employeur, il habilite les ministres à fixer par arrêté les méthodes de mesure et la fréquence des contrôles. Il est dépouillé parce qu'il est le maillon qui donne son rythme à R. 4222-20 — lequel dit « régulièrement » sans chiffre. La fréquence vient de l'arrêté du 8 octobre 1987 pris sur ce fondement, dont l'article 3 impose « au minimum une fois par an » en local à pollution non spécifique. Sans ce maillon relevé, la périodicité annuelle de `aeration-controle-installations-r4222-20` serait une déduction non sourcée.",
    },
    {
      ref: "R. 4323-1",
      versionEnVigueur: "2009-12-29",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["esp-personnel-formation"],
    },
    {
      ref: "R. 4412-17",
      intitule:
        "Protection contre les dangers des propriétés chimiques et physico-chimiques",
      versionEnVigueur: "2008-05-01",
      luLe: "2026-08-27",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: [
        "stockage-dangereux-retention",
        "stockage-dangereux-verification-etancheite",
      ],
      citationCle:
        "« Ces mesures portent, notamment, sur le stockage, la manutention et l'isolement des agents chimiques incompatibles. A cet effet, l'employeur prend les mesures appropriées pour empêcher : […] 2° Les risques de débordement ou d'éclaboussures, ainsi que de déversement par rupture des parois des cuves, bassins, réservoirs et récipients de toute nature contenant des produits susceptibles de provoquer des brûlures d'origine thermique ou chimique. »",
      prescrit:
        "Seul article du Code du travail visant la rupture de parois d'un récipient de stockage. Le mot « rétention » n'apparaît NULLE PART dans le chapitre — il n'existe d'ailleurs pas de section « stockage » : la structure va du champ d'application à l'évaluation, puis aux mesures de prévention. R. 4412-17 est ce qui existe de plus proche, et il suffit. Ajouté le 2026-08-27 après qu'un arbitrage eut établi que R. 4412-11, seul cité jusque-là, ne porte ni « rétention » ni « étanchéité » — son 2° ne fonde que « des procédures d'entretien régulières ».",
    },
  ],
};
