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
    obligations: ["stockage-dangereux-retention", "stockage-dangereux-verification-etancheite"],
  },
  {
    ref: "R. 4412-38",
    versionEnVigueur: "2018-01-01",
    luLe: "2026-08-26",
    lecture: "agent_verbatim",
    statut: "retenu",
    obligations: ["stockage-dangereux-fiches-donnees", "stockage-dangereux-formation-personnel"],
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
    luLe: "2026-08-26",
    lecture: "premiere_main",
    statut: "obligation_manquante",
    motif:
      "Verbatim relevé en première main le 2026-08-26 : « L'employeur maintient L'ENSEMBLE DES INSTALLATIONS MENTIONNÉES AU PRÉSENT CHAPITRE en bon état de fonctionnement et en assure régulièrement le contrôle. » Le présent chapitre est le chapitre II « Aération, assainissement », articles R. 4222-1 à R. 4222-26 — donc toute installation d'aération d'un lieu de travail, sans distinction de catégorie. Le référentiel l'accroche à trois catégories d'équipement seulement (VMC, CTA, stockage de matières dangereuses) via 3 obligations. Un établissement dont la ventilation n'est déclarée sous aucune de ces trois ne reçoit AUCUNE ligne, alors que l'article la couvre. Même mécanisme que PE 4 § 2 — une obligation portée par l'établissement, décomposée en fragments accrochés à des équipements — mais celui-ci est dans le périmètre, il vise tout employeur.",
    bloquePar:
      "Porteur d'échéance : l'obligation naît du chapitre entier, pas d'un équipement. `categoriesEquipement` est requis et `Verification.equipementId` n'est pas nullable.",
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
