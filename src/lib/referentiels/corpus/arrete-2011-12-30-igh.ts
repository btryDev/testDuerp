// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.
//
// ---------------------------------------------------------------------------
// AMENDEMENT DU 2026-09-03 — LA QUESTION POSÉE ÉTAIT « LA CLASSE SERT-ELLE ? »
// ---------------------------------------------------------------------------
//
// L'onboarding exigeait, de tout établissement déclaré IGH, la CLASSE de son
// immeuble (GHA, GHO, GHR, GHS, GHU, GHW1, GHW2, GHZ, GHTC, ITGH). Mesuré en
// appelant le moteur : les dix valeurs et `null` rendaient exactement le même
// jeu d'obligations. La question de ce lot était donc : le titre III, qui
// organise des chapitres PAR CLASSE, impose-t-il à l'EMPLOYEUR OCCUPANT des
// obligations qui diffèrent selon la classe ?
//
// **LA RÉPONSE EST NON, ET LE DESTINATAIRE EST TOUT LE SUJET.** Les quatre
// entrées ajoutées ci-dessous l'établissent article par article :
//
//   GH 5    — les vérifications techniques périodiques : « LES PROPRIÉTAIRES
//             font effectuer… ». Aucune de ses périodicités ne varie par
//             classe (entrée d'origine, complétée).
//   GH 4 §3 — la SEULE périodicité indexée sur la classe de tout l'arrêté, et
//             son sujet est « LA COMMISSION DE SÉCURITÉ visite l'immeuble ».
//             C'est un acte de l'administration, rien à porter au calendrier
//             d'un exploitant.
//   GH W 5  — la seule obligation d'un chapitre de classe qui pèse vraiment
//             sur l'occupant (§ 2, service local de sécurité). Elle ne
//             distingue PAS GH W1 de GH W2 : la distinction du § 1 porte sur
//             le service CENTRAL, à la charge du propriétaire.
//   GH 66   — et c'est lui qui clôt le sujet : le classement retient « l'usage
//             principal de l'immeuble », et dans une tour mixte « les
//             dispositions particulières à chaque classe d'immeuble [
//             s'appliquent] dans chacune des parties concernées ». La classe
//             DÉCLARÉE de la tour ne détermine donc pas le régime du plateau
//             qu'on y occupe — un plateau de bureaux relève des dispositions
//             GH W même dans une tour classée GH U. Demander la classe au
//             dirigeant ne renseigne pas sur ses obligations, et peut le
//             tromper.
//
// La question a donc été retirée de l'onboarding et de la fiche. La colonne
// `Etablissement.classeIgh` et l'énumération restent en base : leur sort est
// une migration destructive, décidée à part (`docs/chantiers-ouverts.md`
// § 9 bis).
//
// **CE QUE LA LECTURE A TROUVÉ EN CHEMIN, ET QUI VAUT PLUS QUE LA QUESTION
// D'ORIGINE : GH 61 § 5.** Une vérification QUINQUENNALE, par organisme agréé,
// que le texte met à la charge des OCCUPANTS — donc de l'employeur locataire
// de bureaux, l'utilisateur même du produit. Elle ne dépend d'aucune classe.
// Le corpus la connaissait déjà de loin, par le renvoi de GH 5 § 3.1.4, et en
// donnait une raison de non-encodage QUI EST FAUSSE (« faute de porteur : la
// charge calorifique n'a pas de catégorie d'équipement »). Elle n'a pas besoin
// d'équipement : son porteur est l'établissement, et ce porteur existe depuis
// l'ADR-022. Voir l'entrée GH 61.
//
// PROVENANCE. Les entrées du 2026-09-03 sont en `agent_verbatim` et chacune a
// été lue DEUX FOIS, par deux passages indépendants, avec verbatim identique :
// une première lecture de balayage, puis une seconde lecture ciblée demandant
// la reproduction mot pour mot du paragraphe décisif. Le mode de défaillance
// rencontré n'a pas été le 403 mais la PARAPHRASE : la page rend bien le
// texte, et le lecteur automatique en rend parfois un résumé — GH 61 § 5 a
// été rendu tronqué de sa seconde phrase (celle qui porte les cinq ans) au
// premier appel, et complet au second. Un paragraphe obtenu une seule fois ne
// vaut rien sur ce texte.

import type { Corpus } from "./types";

const URL_TEXTE =
  "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025167121/";

export const ARRETE_2011_12_30_IGH: Corpus = {
  id: "arrete-2011-12-30-igh",
  intitule: "Arrêté du 30 décembre 2011 — règlement de sécurité des IGH",
  url: URL_TEXTE,
  etendue: "articles_cites",
  portee:
    "Régime IGH. Le référentiel porte deux obligations qui le citent (`elec-igh-annuelle`, `incendie-igh-moyens-secours-annuelle`), toutes deux fondées sur GH 5. Cinq articles sont dépouillés : GH 4, GH 5, GH 61, GH 66 et GH W 5. NE SONT PAS LUS : le chapitre Construction du titre Ier (GH 6 à GH 56), le reste du chapitre III des obligations des propriétaires et des occupants (GH 57 à GH 60, GH 62 à GH 65), et les huit autres chapitres de classe du titre III. La lecture du 2026-09-03 a balayé les chapitres de classe à la recherche d'obligations périodiques nommant un débiteur, et n'en a retenu qu'une (GH W 5 § 2) : c'est un balayage filtré, pas un dépouillement, et il peut avoir laissé passer un faux négatif.",
  articles: [
    {
      ref: "GH 4",
      intitule:
        "Contrôles et visites périodiques de la commission de sécurité",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025169254/",
      versionEnVigueur: "2012-04-01",
      modifiePar: null,
      luLe: "2026-09-03",
      lecture: "agent_verbatim",
      statut: "hors_perimetre",
      exclusion: "sans_destinataire_exploitant",
      citationCle:
        "En application des articles R. 122-23 et R. 122-28 du code de la construction et de l'habitation, la commission de sécurité visite l'immeuble selon la fréquence fixée ci-dessous : GH A : 3 ans ; GH O : 3 ans ; GH R : 5 ans ; GH S : 5 ans ; GHTC : 5 ans ; GH U : 2 ans ; GH W : 5 ans ; GH Z : 3 ans ; ITGH : 3 ans. Pour les immeubles abritant plusieurs classes d'activités, la périodicité applicable est celle qui correspond à la classe d'activité pour laquelle cette périodicité est la plus rapprochée. La fréquence de ces contrôles peut être modifiée, s'il est jugé nécessaire, par arrêté du maire ou du préfet, après avis de la commission de sécurité.",
      motif:
        "C'EST LA SEULE PÉRIODICITÉ INDEXÉE SUR LA CLASSE DE TOUT L'ARRÊTÉ, et son sujet est « la commission de sécurité », qui VISITE. L'acte est celui de l'administration : aucun propriétaire, exploitant ni occupant n'en est le débiteur, et il n'y a rien à inscrire au calendrier d'un exploitant — le parallèle exact est PE 37 en ERP de 5ᵉ catégorie, à ceci près que PE 37 est encodé parce que la visite s'y trace au registre de l'établissement. Deux détails de ce paragraphe achèvent de disqualifier la question de la classe pour notre usage : « GH W » y figure sur UNE seule ligne, sans distinguer GH W1 de GH W2 — les deux seules valeurs de bureaux que le modèle offre —, et dans un immeuble mixte c'est la périodicité la plus rapprochée qui l'emporte, non celle de la classe déclarée.",
    },
    {
      ref: "GH 5",
      versionEnVigueur: "2026-01-01",
      luLe: "2026-08-26",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["incendie-igh-moyens-secours-annuelle"],
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000052234026/",
      prescrit:
        "TROIS RYTHMES SUR QUATRE NON PORTÉS, relevés le 2026-08-27. « 3.1.1. Tous les six mois » (ascenseurs équipés de dispositifs d'appel prioritaire), « 3.1.3. Tous les deux ans » (paratonnerres), « 3.1.4. Tous les cinq ans » (évaluation de la charge calorifique de GH 61). Seul l'annuel est encodé. Faute de porteur : l'appel prioritaire est une propriété d'ascenseur absente du modèle, et les paratonnerres n'ont pas de catégorie d'équipement. La règle des « 20 % par an » sur les ouvrants de désenfumage n'est PAS un cinquième rythme : c'est un bouclage interne à l'annuel, à couvrir en cinq ans.\n\nCORRECTION DU 2026-09-03 — LA RAISON DONNÉE POUR LA QUINQUENNALE ÉTAIT FAUSSE. La phrase ci-dessus rangeait la charge calorifique avec les paratonnerres, « faute de catégorie d'équipement ». Elle n'en a pas besoin. GH 61 § 5, ouvert ce jour, met le rapport de vérification à la charge des OCCUPANTS des locaux autres que d'habitation : le porteur est l'ÉTABLISSEMENT, et ce porteur existe depuis l'ADR-022. Rien au modèle ne bloque plus cette ligne. Le renvoi de GH 5 restait juste, c'est le motif qui ne l'était pas — et un motif faux fait plus de mal qu'un manque nu, parce qu'il clôt la question. Voir l'entrée GH 61.\n\nSUR LE DESTINATAIRE, relu le 2026-09-03 : l'article s'ouvre par « Les propriétaires font effectuer […] des vérifications techniques par des organismes visés à l'article R. 122-16 du code de la construction et de l'habitation », et ne contient aucune occurrence d'« occupant », « locataire » ni « employeur ». Aucune de ses périodicités ne varie selon la classe de l'immeuble.",
      reserve:
        "Trois des quatre rythmes de GH 5 ne sont pas portés (six mois, deux ans, cinq ans), et le motif du troisième vient d'être corrigé : la quinquennale de la charge calorifique n'attend aucun attribut, seulement d'être encodée. Le corps de l'article n'a pas été relu au mot près le 2026-09-03 — seules sa phrase d'attaque et l'absence de modulation par classe l'ont été.",
    },
    {
      ref: "GH 61",
      intitule: "Limitation de la charge calorifique surfacique",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025170361/",
      versionEnVigueur: "2012-04-01",
      modifiePar: null,
      luLe: "2026-09-03",
      lecture: "agent_verbatim",
      statut: "obligation_manquante",
      citationCle:
        "§ 5. Dans les locaux autres que les locaux d'habitation, les occupants sont tenus de faire établir, par un organisme agréé, un rapport de vérification de conformité de la charge calorifique. Ce rapport est établi dans l'année qui suit l'installation dans les lieux ou toute modification importante de l'aménagement, puis périodiquement tous les cinq ans.\n§ 7. Les locataires autres que ceux occupant des locaux d'habitation doivent pouvoir justifier au propriétaire ou au mandataire de sécurité que les locaux qu'ils occupent ne dépassent pas les charges calorifiques autorisées.",
      motif:
        "LA TROUVAILLE DU LOT, ET ELLE NE VIENT PAS DE LA QUESTION QU'IL POSAIT. Le lot cherchait des obligations qui DIFFÈRENT SELON LA CLASSE ; il en a trouvé une qui n'en dépend d'aucune, et qui vise directement l'utilisateur du produit. GH 61 § 5 est une échéance récurrente quinquennale — « puis périodiquement tous les cinq ans » —, réalisée par un ORGANISME AGRÉÉ, et son débiteur est « les occupants » des locaux autres que d'habitation. C'est l'employeur locataire de bureaux dans une tour, c'est-à-dire exactement le cas que l'ADR-031 déclare servir : « un employeur locataire d'une tour relève du Code du travail, que le produit sert entièrement ». Le § 7 en est le corollaire documentaire — le locataire doit pouvoir JUSTIFIER au propriétaire ou au mandataire de sécurité.\n\nLE PREMIER DÉLAI N'EST PAS UNE PÉRIODICITÉ, et il faut le lire pour ne pas se tromper de ligne : « dans l'année qui suit l'installation dans les lieux ou toute modification importante de l'aménagement » est un déclencheur d'ÉVÉNEMENT — emménagement, réaménagement — que le modèle ne porte pas (il n'existe pas de sixième déclencheur « événement », ADR-022). Ce qui est encodable sans rien inventer est le second membre : la quinquennale.\n\nCE QUE ÇA DONNERAIT, écrit ici pour que le prochain lot n'ait pas à le retrouver : porteur `etablissement`, `periodicite: \"quinquennale\"`, `nature: \"echeance_recurrente\"`, `realisateurs: [\"organisme_agree\"]` sur le mot du texte, `typologies: { igh: true }` SANS restriction de classe, et une réserve nommant le déclencheur d'événement non porté. La condition « locaux autres que d'habitation » est satisfaite par construction pour un établissement de travail ou un ERP.",
      bloquePar:
        "RIEN AU MODÈLE — et c'est ce qui distingue cette entrée des autres manques du corpus. Le porteur établissement existe (ADR-022), la périodicité quinquennale existe, `organisme_agree` existe, `typologies.igh` existe. Ce qui a manqué est le PÉRIMÈTRE DU LOT : celui du 2026-09-03 devait trancher si la CLASSE d'IGH sert à quelque chose, pas encoder une obligation nouvelle, et une obligation ne s'encode pas en effet de bord d'une question à laquelle elle ne répond pas. Elle attend un lot d'une heure. Ne pas la confondre avec le manque voisin de GH 5 sur les paratonnerres, qui, lui, attend une catégorie d'équipement.",
    },
    {
      ref: "GH 66",
      intitule: "Immeuble abritant des classes d'activités différentes",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025170411/",
      versionEnVigueur: "2012-04-01",
      modifiePar: null,
      luLe: "2026-09-03",
      lecture: "agent_verbatim",
      statut: "sans_objet",
      citationCle:
        "Le classement d'un immeuble abritant des classes d'activités différentes est effectué en retenant l'usage principal de l'immeuble. Le ou les autre(s) usages sont précisés. Dans ce cas, les dispositions générales s'appliquent ainsi que les dispositions particulières à chaque classe d'immeuble dans chacune des parties concernées. L'application coordonnée de ces dispositions fait l'objet d'un document soumis à l'avis de la commission de sécurité.",
      motif:
        "Article de classement : il ne prescrit rien à un exploitant. Il est dépouillé parce qu'il TRANCHE la question de ce lot, et qu'il la tranche dans l'autre sens que l'intuition. Le classement d'une tour mixte retient « l'usage principal de l'immeuble » — c'est cette valeur-là, et pas une autre, qu'un dirigeant lirait sur son dossier et recopierait dans le formulaire. Or « les dispositions particulières à chaque classe d'immeuble [s'appliquent] dans chacune des parties concernées » : le plateau de bureaux d'une tour classée GH U relève des dispositions GH W, et son occupant ne le saurait pas en déclarant GH U. La classe déclarée de l'immeuble n'est donc pas seulement inutile pour déterminer les obligations de l'occupant — elle est le mauvais objet. C'est la raison la plus forte de ne pas poser la question, et elle survit même si un chapitre de classe imposait un jour quelque chose à l'occupant.",
    },
    {
      ref: "GH W 5",
      intitule:
        "Service de sécurité incendie des immeubles de classe GH W1 ou GH W2",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000033336961/",
      versionEnVigueur: "2017-01-01",
      modifiePar: {
        texte:
          "Arrêté du 7 novembre 2016 modifiant l'arrêté du 30 décembre 2011",
        url: URL_TEXTE,
      },
      luLe: "2026-09-03",
      lecture: "agent_verbatim",
      statut: "non_couvert",
      citationCle:
        "§ 2. Les occupants de chaque compartiment sont tenus de participer au service local de sécurité. Il est composé d'un chef de compartiment et d'agents désignés parmi le personnel permanent de chaque entreprise au prorata de son effectif. Le nombre d'occupants ainsi désignés est égal au vingt-cinquième au moins des occupants du compartiment, avec un minimum de six.\n§ 3 (extrait). Le service central de sécurité incendie et d'assistance à personnes organise des exercices d'évacuation périodiques dans les conditions prévues à l'article GH 60 § 2 et les occupants sont tenus d'y participer.",
      motif:
        "LA SEULE OBLIGATION D'UN CHAPITRE DE CLASSE QUI PÈSE VRAIMENT SUR L'EMPLOYEUR OCCUPANT, et c'est pour cela qu'elle est dépouillée : c'était le meilleur candidat à une restriction `igh: { classes: [...] }`, et il ne tient pas. Trois raisons, dans l'ordre où elles mordent.\n\n(1) ELLE NE DISTINGUE PAS GH W1 DE GH W2. Le § 1 les distingue bien — un chef d'équipe pour GH W1, trois agents en permanence pour GH W2 — mais il compose le service CENTRAL, « sous la direction du chef de sécurité incendie de l'immeuble », c'est-à-dire du côté du propriétaire. Le § 2, celui de l'occupant, ne mentionne aucune des deux. Or GH W1 et GH W2 sont précisément les deux valeurs que le modèle offre : la question posée au dirigeant ne pourrait donc jamais moduler cette ligne.\n\n(2) GH 66 EN FAIT LE MAUVAIS ANCRAGE. Le déclencheur réel est d'occuper un COMPARTIMENT DE BUREAUX dans un IGH, ce que le produit sait déjà par la typologie de l'établissement ; la classe DÉCLARÉE de la tour, elle, peut être GH U ou GH Z pour ce même plateau.\n\n(3) LE PRODUIT NE LA COUVRE PAS, ET LE DIT. `non_couvert` et non `obligation_manquante` : l'obligation existe et vise un établissement que le produit sert, mais le service de sécurité incendie des IGH est déclaré hors couverture sur la page « Ce que Rojer ne couvre pas ». C'est aussi un ÉTAT PERMANENT — désigner des agents parmi son personnel permanent — et non une échéance ; la participation aux exercices du § 3 est portée par le service central, donc par le propriétaire, l'occupant n'étant tenu que d'y participer.",
      declareA:
        "Page « Ce que Rojer ne couvre pas » (`src/lib/perimetre/couverture.ts`, axe `igh`) : « Le règlement de sécurité des IGH impose bien davantage que ce que cet outil en connaît : de son article GH 5, l'outil porte les vérifications annuelles, et rien du reste — le service de sécurité permanent, les dispositions propres à la classe de l'immeuble. »",
    },
  ],
};
