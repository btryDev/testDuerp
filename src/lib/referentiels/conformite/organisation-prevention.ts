/**
 * Domaine « organisation de la prévention » — `L. 4644-1`, `L. 2311-2`,
 * `L. 1311-2` / `L. 1321-1`.
 *
 * QUI S'OCCUPE DE LA PRÉVENTION, ET SOUS QUELLES INSTANCES. Trois obligations
 * qui ne parlent ni d'un équipement ni d'un local : elles disent que
 * l'employeur désigne quelqu'un, qu'à partir d'un certain effectif il existe un
 * comité, et qu'à partir d'un autre il existe un règlement écrit.
 *
 * AUCUNE DES TROIS N'A DE PÉRIODICITÉ, et aucun des textes n'en écrit une.
 * Ce sont des états à constituer puis à maintenir — `periodicite: "autre"`,
 * suivant le précédent de l'habilitation électrique, passée de `triennale` à
 * `autre` le jour où quelqu'un a ouvert le texte et constaté qu'il ne disait
 * aucune durée.
 *
 * DEUX SEUILS D'EFFECTIF, ÉCRITS AVEC LE MÉCANISME QUI EXISTAIT DÉJÀ.
 * `TypologieApplication.effectifMin` porte les seuils depuis l'ADR-004 et le
 * moteur les évalue en ET (`matching/engine.ts`). Il n'a pas fallu de sixième
 * déclencheur « événement » ni de nouveau type de `ConditionApplication` :
 * `conditions` porte des propriétés d'ÉQUIPEMENT et reste `never` sur le
 * porteur établissement, ce qui est cohérent — un effectif n'est pas une
 * propriété d'équipement.
 *
 * CE QUE LE PRODUIT NE SAIT PAS, ET QUI EST ÉCRIT PLUTÔT QUE SIMULÉ.
 * `L. 2311-2` et `L. 1311-2` datent tous deux leur obligation par une durée —
 * douze mois consécutifs au-dessus de onze salariés pour le CSE, douze mois à
 * compter du franchissement de cinquante pour le règlement intérieur. Le
 * produit ne connaît que l'effectif COURANT : il n'historise pas les
 * variations. La ligne apparaît donc au franchissement constaté, et non à
 * l'échéance des douze mois. C'est une avance, jamais un retard, et le dire
 * vaut mieux que de fabriquer une date d'entrée en obligation depuis un
 * historique qui n'existe pas.
 */

import type { Obligation } from "./types";

export const obligationsOrganisationPrevention: Obligation[] = [
  {
    id: "prevention-etablissement-salarie-designe",
    domaine: "organisation_prevention",
    libelle: "Salarié désigné compétent en protection et prévention",
    description:
      "L'employeur désigne un ou plusieurs salariés compétents pour s'occuper des activités de protection et de prévention des risques professionnels de l'entreprise. Cette désignation s'impose dès le premier salarié, sans condition d'effectif ni de secteur. Le ou les salariés désignés bénéficient d'une formation en matière de santé au travail, dans les conditions prévues pour la formation des membres du comité social et économique. À défaut de compétences internes, l'employeur peut faire appel à un intervenant en prévention des risques professionnels — mais l'obligation reste de désigner.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 4644-1 I (l'employeur désigne un ou plusieurs salariés compétents pour s'occuper des activités de protection et de prévention)",
        article: "L. 4644-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893856",
        versionConstatee: "2022-03-31",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "R. 4644-1 (les personnes désignées le sont après avis du comité social et économique s'il existe, et disposent du temps nécessaire et des moyens requis)",
        article: "R. 4644-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483822",
        versionConstatee: "2018-01-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true },
    porteur: "etablissement",
    transmet: [
      {
        vers: "salarie_designe",
        titre: "formation-securite-salarie-designe-competent",
        motif:
          "L'alinéa 2 du même I fait bénéficier le ou les salariés désignés d'une formation en matière de santé au travail. Le produit ne peut pas savoir qui l'employeur a désigné ; l'employeur le déclare, et le catalogue porte le titre correspondant.",
      },
    ],
    notesInternes:
      "DEUX ACTES DANS UN SEUL ARTICLE, ET UN SEUL EST ENCODÉ ICI. L. 4644-1 I écrit d'abord « l'employeur désigne », puis « le ou les salariés ainsi désignés bénéficient d'une formation ». La désignation est un acte de l'employeur portant sur l'établissement : porteur `etablissement`, une seule ligne, due même si aucun équipement n'est déclaré. La formation, elle, est nominative — elle produit une attestation au nom d'une personne — et relève du porteur salarié.\n\nDEUX OBLIGATIONS, ET LA PREMIÈRE RÉDACTION DE CE LOT N'EN FAISAIT QU'UNE. J'avais d'abord fait porter la formation du désigné par la ligne de catalogue du CSE, au motif que L. 4644-1 renvoie « aux conditions prévues aux articles L. 2315-16 à L. 2315-18 ». La relecture des TROIS articles du renvoi — deux n'avaient pas été ouverts — a montré que ce sont deux actes sous un même régime, et non un seul acte : l'argument complet est dans les notes de `formation-securite-salarie-designe-competent`. Le point décisif est que L. 2315-17 écrit son renouvellement en termes de « représentants » ayant « exercé leur mandat », ce qu'un salarié DÉSIGNÉ n'est ni ne fait. La formation du désigné a donc sa propre ligne, sans condition d'effectif, et la liaison se fait par une `Transmission` — l'usage prévu par l'ADR-024 : nommer ce que l'obligation implique ailleurs, sans le dériver.\n\nCETTE LIGNE ET CELLE DE LA FORMATION PARTAGENT L'ARTICLE FONDATEUR L. 4644-1 — l'alinéa 1 pour la désignation, l'alinéa 2 pour la formation. Le test anti-doublon ne compare que l'article ; la paire est déclarée dans `PAIRES_DECLAREES` avec sa raison.\n\nVERBATIM RELEVÉ SUR LÉGIFRANCE LE 2026-08-31, version en vigueur depuis le 2022-03-31 : « I.-L'employeur désigne un ou plusieurs salariés compétents pour s'occuper des activités de protection et de prévention des risques professionnels de l'entreprise. »\n\nAUCUNE PÉRIODICITÉ. Le texte ne dit ni quand désigner, ni pour combien de temps, ni à quel rythme redésigner. `periodicite: \"autre\"` : un état à constituer et à maintenir.\n\n« À DÉFAUT » N'EST PAS UNE ALTERNATIVE OFFERTE. Les alinéas suivants ouvrent le recours à un intervenant extérieur (IPRP, service de prévention de la caisse, OPPBTP, ANACT) « à défaut, si les compétences dans l'entreprise ne permettent pas d'organiser ces activités ». C'est un second choix conditionné, pas une option équivalente. C'est pourquoi le domaine porte `aucun_tiers_attendu` dans `DOMAINES_PRESTATAIRE_ATTENDUS` : l'obligation est de désigner en interne, et prétendre qu'un prestataire est attendu inverserait l'ordre du texte.\n\nCriticité 3 : le manquement est réel et sanctionnable, mais il n'expose pas directement à un dommage corporel.",
  },

  {
    id: "prevention-etablissement-cse",
    domaine: "organisation_prevention",
    libelle: "Mise en place du comité social et économique (11 salariés)",
    description:
      "Un comité social et économique est mis en place dans les entreprises d'au moins onze salariés. Sa mise en place n'est obligatoire que si l'effectif d'au moins onze salariés est atteint pendant douze mois consécutifs. Les modalités de calcul de l'effectif sont celles des articles L. 1111-2 et L. 1251-54 du code du travail.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 2311-2 (CSE dans les entreprises d'au moins onze salariés, si l'effectif est atteint pendant douze mois consécutifs)",
        article: "L. 2311-2",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035609353",
        versionConstatee: "2018-01-01",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true, effectifMin: 11 },
    porteur: "etablissement",
    transmet: [
      {
        vers: "salarie_designe",
        titre: "formation-securite-salarie-cse-sst",
        motif:
          "L. 2315-18 fait bénéficier chaque membre de la délégation du personnel d'une formation en santé, sécurité et conditions de travail — cinq jours au premier mandat, trois au renouvellement. Le produit ne sait pas qui a été élu ; l'employeur le déclare.",
      },
    ],
    notesInternes:
      "LE SEUIL S'ÉCRIT AVEC LE MÉCANISME QUI EXISTAIT, ET C'ÉTAIT LA QUESTION DU BRIEF. `TypologieApplication.effectifMin` est en place depuis l'ADR-004 et `matching/engine.ts` l'évalue en ET avec le reste. Aucun sixième déclencheur « événement » n'a été créé, aucun nouveau type de `ConditionApplication` non plus — `conditions` porte des propriétés d'ÉQUIPEMENT et vaut `never` sur le porteur établissement, ce qui est cohérent : un effectif n'est pas une propriété d'équipement.\n\nLES DOUZE MOIS CONSÉCUTIFS NE SONT PAS SIMULÉS, ET C'EST DÉLIBÉRÉ. Le texte est en deux temps : le CSE est mis en place « dans les entreprises d'au moins onze salariés », et cette mise en place « n'est obligatoire que si l'effectif d'au moins onze salariés est atteint pendant douze mois consécutifs ». Le second alinéa DATE l'obligation, il ne la fait pas naître — c'est exactement ce qu'écrit `.claude/CLAUDE.md` sur l'absence de déclencheur événementiel. Or le modèle ne porte que l'effectif courant (`Etablissement.effectifSurSite`) : il n'historise aucune variation, donc rien ne permet de calculer la date d'expiration des douze mois. La ligne apparaît au franchissement constaté. C'est une avance sur l'échéance légale, jamais un retard ; l'inverse — attendre douze mois depuis une date qu'on ne connaît pas — aurait fabriqué une échéance depuis un historique inexistant.\n\n« ENTREPRISES », PAS « ÉTABLISSEMENTS ». L. 2311-2 compte l'effectif de l'ENTREPRISE. Le produit raisonne par établissement, et `effectifMin` est évalué sur `effectifSurSite`. Pour une TPE mono-établissement — la cible du produit — les deux coïncident. Pour une entreprise multi-établissements, un dirigeant dont chaque site compte moins de onze personnes mais dont l'entreprise en compte quinze ne verrait pas la ligne : c'est un faux négatif connu, il tient au fait que le seuil du texte ne se lit pas à la maille où le moteur l'évalue, et le corriger supposerait un effectif d'entreprise agrégé que le modèle ne porte pas. Signalé, non comblé.\n\nÀ NE PAS CONFONDRE avec le CSE d'établissement de L. 2313-1 et s., qui suppose une entreprise d'au moins cinquante salariés à établissements distincts — hors de la cible.\n\nCriticité 3 : le défaut de mise en place est un délit d'entrave, mais il n'expose pas directement à un dommage corporel.",
  },

  {
    id: "prevention-etablissement-reglement-interieur",
    domaine: "organisation_prevention",
    libelle: "Règlement intérieur — volet santé et sécurité (50 salariés)",
    description:
      "L'établissement d'un règlement intérieur est obligatoire dans les entreprises ou établissements employant au moins cinquante salariés. L'obligation s'applique au terme d'un délai de douze mois à compter de la date à laquelle le seuil a été atteint. Le règlement intérieur fixe exclusivement les mesures d'application de la réglementation en matière de santé et de sécurité, les conditions dans lesquelles les salariés peuvent être appelés à participer au rétablissement de conditions de travail protectrices, et les règles générales et permanentes de discipline.",
    referencesLegales: [
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 1321-1 1° (le règlement intérieur fixe les mesures d'application de la réglementation en matière de santé et de sécurité)",
        article: "L. 1321-1",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901432",
        versionConstatee: "2008-05-01",
      },
      {
        source: "CODE_TRAVAIL",
        reference:
          "L. 1311-2 (obligation d'établir un règlement intérieur à partir de cinquante salariés, au terme d'un délai de douze mois)",
        article: "L. 1311-2",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038610176",
        versionConstatee: "2020-01-01",
        note: "Référence de contexte : elle porte le seuil, pas le contenu santé-sécurité.",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 2,
    typologies: { travail: true, effectifMin: 50 },
    porteur: "etablissement",
    transmet: [],
    notesInternes:
      "L'ARTICLE FONDATEUR EST L. 1321-1, PAS L. 1311-2, ET L'ORDRE COMPTE. Le brief citait `L. 1311-2` seul. Ouvert sur Légifrance, cet article dit QUAND un règlement intérieur est dû (cinquante salariés, plus douze mois) mais ne dit rien de son contenu. Ce qui fait entrer le règlement intérieur dans le périmètre de Rojer — qui ne couvre que la santé-sécurité — c'est L. 1321-1 1° : « Le règlement intérieur est un document écrit par lequel l'employeur fixe exclusivement : 1° Les mesures d'application de la réglementation en matière de santé et de sécurité dans l'entreprise ou l'établissement, notamment les instructions prévues à l'article L. 4122-1 ». Verbatim relevé le 2026-08-31, version en vigueur depuis le 2008-05-01.\n\nLa convention d'ordre de `referencesLegales` veut que l'index 0 soit l'article qu'on citerait seul devant un inspecteur pour fonder l'obligation TELLE QUE LE PRODUIT LA PORTE. C'est L. 1321-1. L. 1311-2 suit, en contexte, parce qu'il porte le seuil. Le test anti-doublon compare le fondateur : mettre L. 1311-2 en tête aurait fait porter à l'obligation un article dont le contenu est étranger au périmètre.\n\nCE QUE LE PRODUIT NE COUVRE PAS DE CET ARTICLE : le 3° de L. 1321-1 — discipline et échelle des sanctions — est du droit du travail non-SST, hors périmètre déclaré. L'obligation encodée porte le volet santé-sécurité, et son libellé le dit.\n\nLES DOUZE MOIS, MÊME TRAITEMENT QUE LE CSE. L. 1311-2 alinéa 2 : l'obligation « s'applique au terme d'un délai de douze mois à compter de la date à laquelle le seuil de cinquante salariés a été atteint ». Le produit ne connaît pas cette date. La ligne apparaît au franchissement constaté — en avance sur l'échéance légale, jamais en retard.\n\nCriticité 2 : le manquement est formel. Un règlement intérieur absent n'expose personne directement ; il prive en revanche l'employeur du support par lequel ses consignes de sécurité deviennent opposables.",
  },
];
