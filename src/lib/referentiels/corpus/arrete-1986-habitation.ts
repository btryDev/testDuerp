// Corpus : arrêté du 31 janvier 1986 — protection contre l'incendie des
// bâtiments d'habitation.
//
// C'est le texte qui DÉFINIT les familles d'habitation, et il n'avait jamais
// été ouvert dans ce dépôt : zéro occurrence avant le 2026-09-01. L'enum
// `FamilleHabitation` (`PREMIERE`, `DEUXIEME`, `TROISIEME_A`, `TROISIEME_B`,
// `QUATRIEME`) a été posée le même jour d'après lui, sans que personne l'ait
// lu — la découpe est vérifiée ici, article 3 au verbatim, et elle est juste.
//
// ---------------------------------------------------------------------------
// CE QUE LA LECTURE ÉTABLIT, ET QUI N'ÉTAIT PAS ATTENDU
// ---------------------------------------------------------------------------
//
// Le lot cherchait des obligations périodiques conditionnées par la famille.
// **Il n'y en a aucune.** Les familles gouvernent la CONSTRUCTION — degré
// coupe-feu des parois de cages d'ascenseurs (art. 97), présence d'une colonne
// sèche (art. 98), dispositif d'appel prioritaire des pompiers en 4ᵉ famille
// (art. 97 in fine). La seule obligation périodique du texte est l'article
// 101, et il ne mentionne aucune famille : il vise « le propriétaire » de tout
// bâtiment entrant dans le champ de l'article 1er, c'est-à-dire les quatre
// familles.
//
// La famille atteint donc l'entretien de manière INDIRECTE : elle décide de ce
// que le bâtiment CONTIENT, et l'article 101 fait vérifier ce qui est là. Une
// colonne sèche ne se vérifie pas dans une maison de 1ʳᵉ famille parce qu'il
// n'y en a pas — pas parce qu'une règle en dispenserait la 1ʳᵉ famille. Écrire
// `habitation: { familles: ["TROISIEME_B", "QUATRIEME"] }` sur une vérification
// annuelle reviendrait à encoder cette conséquence comme si c'était la règle,
// et à faire dire au texte ce qu'il ne dit pas.
//
// ---------------------------------------------------------------------------
// PROVENANCE DE LA LECTURE — À LIRE AVANT DE S'APPUYER DESSUS
// ---------------------------------------------------------------------------
//
// Toutes les entrées sont en `agent_verbatim`, aucune en `premiere_main` : le
// relevé a été fait par un agent sur legifrance.gouv.fr, article par article,
// et non par la personne qui l'encode.
//
// La distinction n'est pas formelle ici, elle a mordu. La page consolidée du
// texte entier, interrogée sur les articles 97 à 104, a rendu pour l'article
// 100 un contenu FABRIQUÉ — « le propriétaire doit veiller à la conformité du
// bâtiment » — alors que l'article 100 traite de l'affichage des consignes et
// des plans d'intervention. Le même passage attribuait à l'article 102 une
// périodicité annuelle qu'il ne porte pas. Rien n'a été retenu de cette
// lecture-là.
//
// Ce qui est encodé ci-dessous vient exclusivement des pages d'article
// individuelles, chacune vérifiée sur trois points : elle annonce elle-même
// son numéro d'article, elle nomme le texte dont elle relève, et son contenu
// est court assez pour être rendu mot pour mot. L'article 101, qui porte
// l'essentiel, a été relu sur une seconde URL distincte (la vue datée) : les
// deux relevés sont identiques.
//
// Les entrées se recoupent en outre entre elles, ce qui est le seul contrôle
// interne disponible : l'article 103 renvoie aux « vérifications visées à
// l'article 101 », l'article 101 cite les colonnes sèches que l'article 98
// impose, et la distance de dix mètres de l'article 3 est exactement la
// modification que l'arrêté du 19 juin 2015 déclare y avoir portée.

import type { Corpus } from "./types";

const URL_TEXTE =
  "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000474032/";

/** Le modificateur des articles 98, 100 et 103, ouvert en entier (voir `portee`). */
const ARRETE_2015_06_19 = {
  texte: "Arrêté du 19 juin 2015 modifiant l'arrêté du 31 janvier 1986",
  url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000030769405",
};

/** Le modificateur des articles 1er et 102. */
const ARRETE_2020_12_07 = {
  texte: "Arrêté du 7 décembre 2020 - art. 1",
  url: URL_TEXTE,
};

export const ARRETE_1986_HABITATION: Corpus = {
  id: "arrete-1986-habitation",
  intitule:
    "Arrêté du 31 janvier 1986 — protection contre l'incendie des bâtiments d'habitation",
  url: URL_TEXTE,
  etendue: "articles_cites",
  portee:
    "109 articles et 5 annexes. Le TITRE VIII « Obligations des propriétaires » (art. 100 à 104) est lu en entier : c'est le seul titre qui s'adresse à l'exploitant, et il porte l'unique obligation périodique du texte (art. 101, vérification annuelle). Sont lus en outre l'article 1er (champ d'application), l'article 3 (classement en familles, qui fonde l'enum `FamilleHabitation`) et les articles 97 à 99 du titre VII. NE SONT PAS LUS : les titres II à VI (art. 5 à 96 — structures, dégagements, conduits et gaines, logements-foyers, parcs de stationnement) ni les annexes. Ce sont des prescriptions de construction, mais cela reste une PRÉSOMPTION tant qu'elles ne sont pas ouvertes : le titre V (logements-foyers) et le titre VI (parcs) peuvent porter des règles d'exploitation qu'aucune entrée ci-dessous n'écarte. Les textes modificateurs du 19 juin 2015 et du 7 août 2019 ont en revanche été ouverts pour lister ce qu'ils touchent d'autre — voir les entrées des articles 98, 100, 102 et 103.",
  articles: [
    {
      ref: "Arrêté 1986-01-31 art. 1",
      intitule: "Champ d'application",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042744547",
      versionEnVigueur: "2020-12-25",
      modifiePar: ARRETE_2020_12_07,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "sans_objet",
      citationCle:
        "Les dispositions du présent arrêté s'appliquent : - aux bâtiments d'habitation y compris les logements-foyers dont le plancher bas du logement le plus haut est situé au plus à 50 mètres au-dessus du sol utilement accessible aux engins des services de secours et de lutte contre l'incendie ; - aux parcs de stationnement couverts annexes des bâtiments ci-dessus, ayant une surface de plus de 100 mètres carrés […]",
      motif:
        "Article de champ d'application : il ne prescrit rien à personne. Il est dépouillé parce qu'il BORNE tout ce qui suit, et que la borne compte pour le produit : au-delà de 50 mètres, le bâtiment relève des immeubles de grande hauteur (art. R. 122-1 et s. du CCH) et non de cet arrêté. Autrement dit, les quatre familles couvrent exactement le champ de ce texte, et il n'existe pas de cinquième famille — un immeuble d'habitation qui dépasse 50 mètres change de régime, il ne change pas de famille. C'est ce qui rend l'enum `FamilleHabitation` fermée, et non arbitrairement tronquée.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 3",
      intitule: "Classement des bâtiments d'habitation en familles",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828431",
      versionEnVigueur: "2020-01-01",
      modifiePar: {
        texte: "Arrêté du 7 août 2019 - art. 2",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000038906964/",
      },
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "sans_objet",
      citationCle:
        "Les bâtiments d'habitation sont classés comme suit du point de vue de la sécurité-incendie : 1° Première famille : habitations individuelles isolées ou jumelées à un étage sur rez-de-chaussée, au plus ; habitations individuelles à rez-de-chaussée groupées en bande […] 2° Deuxième famille : […] habitations collectives comportant au plus trois étages sur rez-de-chaussée. 3° Troisième famille : habitations dont le plancher bas du logement le plus haut est situé à vingt-huit mètres au plus […] Troisième famille A : […] comporter au plus sept étages sur rez-de-chaussée ; comporter des circulations horizontales telles que la distance entre la porte palière de logement la plus éloignée et l'accès à l'escalier soit au plus égale à dix mètres ; être implantées de telle sorte qu'au rez-de-chaussée les accès aux escaliers soient atteints par la voie échelles […] Troisième famille B : habitations ne satisfaisant pas à l'une des conditions précédentes. 4° Quatrième famille : habitations dont le plancher bas du niveau le plus haut est situé à cinquante mètres au plus […] et qui ne relèvent pas des trois autres familles d'habitation.",
      motif:
        "Article de définition : il classe, il ne prescrit pas. Dépouillé parce qu'il FONDE l'enum `FamilleHabitation`, posée le 2026-09-01 avant que ce texte n'ait été ouvert. VÉRIFICATION FAITE, ET LA DÉCOUPE EST JUSTE : cinq valeurs, dans cet ordre, et la troisième famille se subdivise bien en A et B au sein d'un même seuil de 28 mètres — ce qui explique pourquoi l'enum porte `TROISIEME_A` et `TROISIEME_B` plutôt qu'une `TROISIEME` unique. La 3ᵉ A est définie par TROIS conditions cumulatives (au plus sept étages, dix mètres de circulation horizontale au plus, accès aux escaliers atteints par la voie échelles) et la 3ᵉ B est son complément : une habitation qui manque une seule des trois bascule en B. À NOTER pour qui remplira le champ : l'article prévoit que le maire d'une commune dotée d'échelles aériennes suffisantes PEUT décider qu'un bâtiment de 3ᵉ famille B soit soumis aux seules prescriptions de la 3ᵉ famille A. La famille déclarée peut donc diverger de la famille calculée sur la géométrie, et c'est le texte qui l'autorise, pas une erreur de saisie.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 97",
      intitule: "Ascenseurs — isolement et dispositif prioritaire pompiers",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828535",
      versionEnVigueur: "1986-03-05",
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "hors_perimetre",
      exclusion: "construction",
      citationCle:
        "Les ascenseurs ne sont pas considérés comme des moyens d'évacuation […] Les parois des cages d'ascenseurs doivent être : coupe-feu de degré une demi-heure pour les bâtiments de deuxième famille ; coupe-feu de degré une heure pour les bâtiments de troisième famille A ; coupe-feu de degré une heure pour les bâtiments de troisième famille B et de quatrième famille. […] Dans les habitations de la quatrième famille, les ascenseurs doivent comporter un dispositif d'appel et de commande prioritaire d'une cabine au moins par batterie, destiné à mettre ces appareils à la disposition des sapeurs-pompiers dès leur arrivée sur les lieux. Ce dispositif doit être conforme à la norme en vigueur et asservi à la détection ; la cabine ne doit pas pouvoir s'arrêter au niveau sinistré.",
      motif:
        "C'EST L'ARTICLE QUE LE LOT EST VENU CHERCHER, ET IL NE DONNE PAS CE QU'ON EN ATTENDAIT. Le seul article de l'arrêté qui parle d'ascenseurs et de familles ne prescrit que des degrés coupe-feu de parois et un équipement de cabine : rien qui pèse sur l'exploitant à date, rien qui conditionne l'entretien ou le contrôle technique. Il ne fonde donc AUCUNE restriction de famille sur les sept obligations d'ascenseur du référentiel, qui viennent du CCH et non de ce texte. Le dispositif d'appel prioritaire de la 4ᵉ famille est en revanche une « installation fonctionnant automatiquement » au sens de l'article 101, et il entre à ce titre dans la vérification annuelle — par la voie de sa présence, pas par une règle de famille.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 98",
      intitule: "Colonnes sèches",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828536",
      versionEnVigueur: "2015-10-01",
      modifiePar: ARRETE_2015_06_19,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "hors_perimetre",
      exclusion: "construction",
      citationCle:
        "Les habitations de la troisième famille B et de la quatrième famille doivent comporter une colonne sèche de 65 millimètres par escalier. […] Toutefois, elle n'est pas obligatoire dans les bâtiments collectifs d'habitation de la troisième famille B comportant au plus sept étages sur rez-de-chaussée et implantés de telle sorte qu'au rez-de-chaussée les accès au(x) hall(s) d'entrée soient atteints par la voie échelles définies à l'article 4 ci-avant.",
      motif:
        "Règle d'équipement du bâtiment, à la charge du constructeur : elle dit ce que l'immeuble DOIT COMPORTER, pas ce que le propriétaire doit refaire à date. C'est néanmoins l'article qui explique pourquoi la vérification annuelle de l'article 101 ne se restreint PAS par famille, alors qu'un de ses objets — les colonnes sèches — n'existe que dans deux familles. La présence de la colonne sèche ne se déduit pas de la famille : une 3ᵉ famille B d'au plus sept étages desservie par une voie échelles en est dispensée. Une condition `familles: [TROISIEME_B, QUATRIEME]` posée sur la vérification serait donc juste comme borne haute et fausse comme règle, et elle ferait croire au lecteur que le texte dispense les autres familles d'une vérification qu'il leur impose bel et bien sur leurs propres installations.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 99",
      intitule: "Séparation des circulations piétonnes et automobiles",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828537",
      versionEnVigueur: "1986-03-05",
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "hors_perimetre",
      exclusion: "construction",
      citationCle:
        "Les aires réservées à la circulation des piétons entre la voirie générale et les accès principaux aux immeubles doivent être nettement distinctes de celles réservées à la circulation automobile.",
      motif:
        "Règle d'aménagement des abords, adressée à qui conçoit l'implantation. Aucune échéance, aucun acte à refaire, aucune pièce à tenir. Dépouillé pour clore le titre VII et ne pas laisser croire qu'un article y a été sauté.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 100",
      intitule: "Affichage des consignes et des plans d'intervention",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828538",
      versionEnVigueur: "2015-10-01",
      modifiePar: ARRETE_2015_06_19,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["habitation-consignes-plans-intervention"],
      citationCle:
        "Le propriétaire ou, le cas échéant, la personne responsable désignée par ses soins, est tenu d'afficher dans les halls d'entrée, près des accès aux escaliers et aux ascenseurs : les consignes à respecter en cas d'incendie ; les plans de sous-sols et du rez-de-chaussée. Les consignes particulières à chaque type d'immeuble à respecter en cas d'incendie doivent être également affichées dans les parcs de stationnement, s'il en existe, à proximité des accès aux escaliers et aux ascenseurs. A minima, les éléments suivants figurent sur les plans d'intervention : - l'emplacement des cloisonnements principaux et des cheminements des sous-sols ; - l'indication des dégagements, voies intérieures ou cours permettant d'atteindre l'extérieur du bâtiment ; - l'emplacement des ascenseurs et monte-charge, avec leurs accès ; - l'emplacement des locaux poubelles et réceptacles s'il existe un vide-ordures ; - l'emplacement des moyens de secours, notamment les prises de colonnes sèches et les commandes de désenfumage.",
      prescrit:
        "Affichage permanent, à la charge du propriétaire, dans les halls et près des accès aux escaliers et ascenseurs. Aucune famille n'est mentionnée : l'obligation vise les quatre. La liste des cinq éléments du plan d'intervention vient de l'arrêté du 19 juin 2015 et ne s'impose, aux termes de son article d'application, qu'aux bâtiments dont le permis de construire a été déposé après le 1er octobre 2015 ; l'affichage des consignes, lui, est d'origine et ne connaît pas cette borne.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 101",
      intitule:
        "Vérification annuelle des installations de sécurité et registre",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828539",
      versionEnVigueur: "1986-03-05",
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "habitation-verification-annuelle-installations-securite",
        "habitation-registre-securite",
      ],
      citationCle:
        "Le propriétaire ou, le cas échéant, la personne responsable désignée par ses soins, est tenu de faire effectuer, au moins une fois par an, les vérifications des installations de détection, de désenfumage, de ventilation, ainsi que de toutes les installations fonctionnant automatiquement et des colonnes sèches. Il doit s'assurer, en particulier, du bon fonctionnement des portes coupe-feu, des ferme-portes ainsi que des dispositifs de manoeuvre des ouvertures en partie haute des escaliers. Il doit également assurer l'entretien de toutes les installations concourant à la sécurité et doit pouvoir le justifier par la tenue d'un registre de sécurité.",
      prescrit:
        "L'UNIQUE OBLIGATION PÉRIODIQUE DU TEXTE, et elle ne porte AUCUNE condition de famille — ni ici, ni par renvoi. Elle vise « le propriétaire » de tout bâtiment entrant dans le champ de l'article 1er. Rythme écrit noir sur blanc : « au moins une fois par an ». L'article porte deux obligations distinctes et le référentiel les sépare : la vérification annuelle (un acte à refaire) et le registre de sécurité (un écrit à tenir), qui n'ont ni la même périodicité ni la même nature. Relu une seconde fois sur une URL distincte avant encodage : les deux relevés sont identiques, mot pour mot.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 102",
      intitule:
        "Transformations de l'immeuble et places de stationnement des non-résidents",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828540",
      versionEnVigueur: "2020-12-25",
      modifiePar: ARRETE_2020_12_07,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "obligation_manquante",
      citationCle:
        "Le propriétaire doit s'assurer que les transformations apportées aux immeubles en ce qui concerne l'affectation des locaux, les matériaux constitutifs des revêtements des couvertures ou des façades, les revêtements de sols et des parois des circulations communes, des celliers ainsi que des parcs, la constitution de ces parois ne soient pas de nature à diminuer les caractéristiques de réaction et de résistance au feu exigées pour ces divers éléments par le présent arrêté. Le propriétaire est tenu de s'assurer du respect des dispositions de l'article 1er, en identifiant les places de stationnement utilisées effectivement par des personnes non résidentes du bâtiment d'habitation pour une durée inférieure à 30 jours consécutifs.",
      motif:
        "Deux obligations permanentes du propriétaire que le référentiel ne porte pas. (1) Vérifier que les transformations apportées à l'immeuble ne dégradent pas la réaction et la résistance au feu : c'est une vigilance déclenchée par un événement — des travaux — et le modèle n'a pas de déclencheur « événement » (voir le registre des déclencheurs, `.claude/CLAUDE.md`). L'encoder en `etat_permanent` la ferait apparaître au calendrier d'un propriétaire qui n'a rien transformé, et l'y laisserait indéfiniment. (2) Identifier les places de stationnement occupées moins de 30 jours consécutifs par des non-résidents : c'est le pendant de la dérogation posée à l'article 1er, et son enjeu est de savoir si le parc reste sous cet arrêté ou bascule sous le régime ERP. L'encoder suppose de connaître l'existence et l'usage d'un parc de stationnement annexe, attribut d'établissement qui n'existe pas au modèle.",
      bloquePar:
        "Aucun déclencheur « événement » au modèle pour le premier alinéa ; aucun attribut de parc de stationnement annexe pour le second.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 103",
      intitule: "Qualité du vérificateur et contenu du registre",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828541",
      versionEnVigueur: "2015-10-01",
      modifiePar: ARRETE_2015_06_19,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: [
        "habitation-verification-annuelle-installations-securite",
        "habitation-registre-securite",
      ],
      citationCle:
        "Les vérifications visées à l'article 101 ci-avant doivent être effectuées par des organismes ou techniciens compétents, choisis par le propriétaire. Le registre défini à l'article R. 111-13 du code de la construction et de l'habitation comprend a minima : - les rapports des vérifications exigées à l'article 101 du présent arrêté ; - les rapports d'intervention d'entretien ; - les opérations de maintenance. Conformément à l'article 11 de l'arrêté du 19 juin 2015, les présentes dispositions sont applicables à tous les bâtiments dont la date de dépôt de la demande de permis de construire est postérieure au 1er octobre 2015.",
      prescrit:
        "Article de qualification, et il tranche le `realisateurs` de la vérification annuelle : « organismes ou techniciens COMPÉTENTS, choisis par le propriétaire ». Ni agrément, ni accréditation, ni certification — la différence avec le contrôle technique quinquennal des ascenseurs (R. 134-12 CCH) est nette et volontaire. Il donne aussi le contenu minimal du registre. La borne du 1er octobre 2015 porte sur les dispositions AJOUTÉES par l'arrêté du 19 juin 2015, c'est-à-dire la liste du contenu du registre ; ni la vérification annuelle de l'article 101 ni l'existence du registre n'en dépendent.",
    },
    {
      ref: "Arrêté 1986-01-31 art. 104",
      intitule: "Présentation des justifications aux agents assermentés",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006828542",
      versionEnVigueur: "1986-03-05",
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "agent_verbatim",
      statut: "retenu",
      obligations: ["habitation-registre-securite"],
      citationCle:
        "Le propriétaire est tenu de présenter toutes les justifications utiles concernant l'entretien et la vérification des installations sur demande des agents assermentés et commissionnés à cet effet.",
      prescrit:
        "Clôt le titre VIII et donne au registre sa raison d'être opposable : ce que le propriétaire doit pouvoir présenter, et à qui. Aucune périodicité, aucune famille. Rattaché à l'obligation de registre plutôt qu'à une ligne propre — une obligation « présenter sur demande » n'a ni date ni acte à planifier, et n'aurait rien ajouté au calendrier qu'un registre tenu ne dise déjà.",
    },
  ],
};
