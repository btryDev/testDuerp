// Corpus : l'arrêté du 19 mars 1993, et le seul travail par point chaud que le
// droit nomme.
//
// `code-travail-plan-prevention.ts` disait, depuis le 2026-09-02, que « l'arrêté
// du 19 mars 1993 en compte vingt et un » — sans porter le texte. Le lot du
// 2026-09-03 l'a ouvert, pour une raison qui ne concernait pas le plan de
// prévention : `NatureTravauxPointChaud` (onze valeurs, module `PermisFeu`)
// était réputée transcrire la brochure INRS ED 6030, et il fallait établir si
// le DROIT nomme quelque part des travaux par point chaud.
//
// **Il le fait une fois, et une seule : au 21° de l'article 1er.** « Travaux de
// soudage oxyacétylénique exigeant le recours à un permis de feu. » C'est la
// seule occurrence de « permis de feu » de l'article, et le seul procédé de
// point chaud qu'un texte opposable désigne nommément.
//
// **Et il le fait pour autre chose.** Le 21° ne dit pas « voici les travaux par
// point chaud » : il dit qu'un plan de prévention doit être ÉCRIT quand
// l'opération d'une entreprise extérieure comporte ce travail-là. Il ne fonde
// pas le permis de feu, il le suppose. En tirer une nomenclature serait
// exactement l'erreur que le dépouillement existe pour empêcher.
//
// Ce que ce relevé permet, et c'est tout ce qu'on lui demande : que
// `nature-travaux-point-chaud.test.ts` dérive du TEXTE la **borne basse** de la
// liste — le procédé que le droit nomme doit rester déclarable — sans prétendre
// que le texte en fixe la borne haute.
//
// Lecture : `agent_verbatim`, Légifrance le 2026-09-03. L'article a été lu deux
// fois : une première lecture avait rendu les points 5 à 12 sous forme de
// résumés entre parenthèses, ce qui n'est pas un verbatim ; la seconde,
// explicitement requise en texte brut, est celle qui est ici.

import type { Corpus } from "./types";

export const ARRETE_1993_03_19_TRAVAUX_DANGEREUX: Corpus = {
  id: "arrete-1993-03-19-travaux-dangereux",
  intitule:
    "Arrêté du 19 mars 1993 fixant la liste des travaux dangereux pour lesquels il est établi par écrit un plan de prévention",
  url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006081091/",
  etendue: "articles_cites",
  portee:
    "Le seul article de fond : l'article 1er, qui énumère les vingt et un travaux dangereux auxquels le 2° de R. 4512-7 renvoie. Les articles 2 et 3 (abrogation de l'arrêté précédent, exécution) ne sont pas relevés. L'intitulé d'origine vise « l'article R. 237-8 » ; Légifrance publie la version consolidée, où le décret n° 2008-244 du 7 mars 2008 a substitué la numérotation nouvelle jusque dans le titre.",
  articles: [
    {
      ref: "Arrêté 1993-03-19 art. 1er",
      intitule: "Liste des vingt et un travaux dangereux",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000029720328",
      versionEnVigueur: "2008-05-01",
      modifiePar: {
        texte:
          "Décret n° 2008-244 du 7 mars 2008 (recodification de la quatrième partie ; substitution de la numérotation nouvelle jusque dans l'intitulé de l'arrêté)",
      },
      luLe: "2026-09-03",
      lecture: "agent_verbatim",
      prescrit:
        "Énumère les vingt et un travaux dangereux qui rendent l'écrit obligatoire pour le plan de prévention, quelle que soit la durée de l'opération (R. 4512-7, 2°). Le 21° est la seule mention du permis de feu dans un texte opposable.",
      citationCle:
        "Un plan de prévention est établi par écrit dans les conditions prévues au deuxième alinéa de l'article R. 4512-7 du code du travail pour les travaux dangereux ci-après énumérés : 1. Travaux exposant à des rayonnements ionisants. 2. Travaux exposant à des substances et préparations explosives, comburantes, extrêmement inflammables, facilement inflammables, très toxiques, toxiques, nocives, cancérogènes, mutagènes, toxiques vis-à-vis de la reproduction, au sens des articles R. 4411-2 à R4411-6 du code du travail. 3. Travaux exposant à des agents biologiques pathogènes. 4. Travaux effectués sur une installation classée faisant l'objet d'un plan d'opération interne en application de l'article 17 du décret n° 77-1133 du 21 septembre 1977 modifié. 5. Travaux de maintenance sur les équipements de travail, autres que les appareils et accessoires de levage, qui doivent faire l'objet des vérifications périodiques prévues aux articles R4323-23 à R4323-27, R4535-7 et R4721-11 du code du travail, ainsi que les équipements suivants : -véhicules à benne basculante ou cabine basculante ; -machines à cylindre ; -machines présentant les risques définis aux articles R4324-18 à R4324-20 du code du travail. 6. Travaux de transformation au sens de la norme NF P 82-212 sur les ascenseurs, monte-charge, escaliers mécaniques, trottoirs roulants et installations de parcage automatique de voitures. 7. Travaux de maintenance sur installations à très haute ou très basse température. 8. Travaux comportant le recours à des ponts roulants ou des grues ou transtockeurs. 9. Travaux comportant le recours aux treuils et appareils assimilés mus à la main, installés temporairement au-dessus d'une zone de travail ou de circulation. 10. Travaux exposant au contact avec des pièces nues sous tension supérieure à la T. B. T. 11. Travaux nécessitant l'utilisation d'équipements de travail auxquels est applicable l'article R. 4323-17 du code du travail. 12. Travaux du bâtiment et des travaux publics exposant les travailleurs à des risques de chute de hauteur de plus de 3 mètres, au sens de l'article 5 du décret n° 65-48 du 8 janvier 1965. 13. Travaux exposant à un niveau d'exposition sonore quotidienne supérieure à 90 dB (A) ou à un niveau de pression acoustique de crête supérieure à 140 dB. 14. Travaux exposant à des risques de noyade. 15. Travaux exposant à un risque d'ensevelissement. 16. Travaux de montage, démontage d'éléments préfabriqués lourds, visés à l'article R. 4534-103 du code du travail. 17. Travaux de démolition. 18. Travaux dans ou sur des cuves et accumulateurs de matière ou en atmosphère confinée. 19. Travaux en milieu hyperbare. 20. Travaux nécessitant l'utilisation d'un appareil à laser d'une classe supérieure à la classe 3 A selon la norme NF EN 60825 ; 21. Travaux de soudage oxyacétylénique exigeant le recours à un permis de feu.",
      statut: "sans_objet",
      motif:
        "Le plan de prévention n'est pas dans le référentiel d'obligations : il est porté par le module `PlanPrevention`, décision inscrite au domaine `co_activite` de `conformite/types.ts`. Il n'y a donc aucune `Obligation` à nommer, et rien à porter au calendrier — l'écrit naît d'une opération, pas d'une échéance. Même classement que les onze articles du chapitre R. 4512 servis par ce module.\n\nCE QUE L'ARTICLE APPORTE AU MODULE `PermisFeu`, ET CE QU'IL NE LUI APPORTE PAS. Son 21° est la SEULE désignation, dans un texte opposable, d'un travail par point chaud : « Travaux de soudage oxyacétylénique exigeant le recours à un permis de feu ». Aucun des vingt autres points ne nomme le soudage à l'arc, la découpe plasma, le brasage, le meulage ni le tronçonnage — le 5° et le 11° visent des équipements, pas des procédés thermiques.\n\nCe 21° ne fonde pas le permis de feu : il le SUPPOSE, comme critère d'un écrit dû au titre du plan de prévention. Le permis de feu lui-même n'a aucun fondement réglementaire nommé — c'est une pratique décrite par l'INRS (ED 6030, voir `inrs-documentaire.ts`) et exigée par les assureurs (règle APSAD R43), et l'ADR-032 interdit de faire d'une demande d'assureur du droit. La liste `NatureTravauxPointChaud` est donc une convention de produit dont ce 21° est la seule borne basse de droit.",
    },
  ],
};
