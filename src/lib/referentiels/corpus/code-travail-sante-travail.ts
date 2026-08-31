// Corpus : code du travail — suivi individuel de l'état de santé du travailleur.
//
// Étendue « articles_cites » : la section 2 du chapitre IV court de R. 4624-10
// à R. 4624-45-9 — une quarantaine d'articles, dont les examens de reprise, le
// suivi post-exposition, la fiche d'entreprise, les contestations d'avis. Neuf
// seulement sont lus ici, ceux sur lesquels s'appuient les six obligations
// encodées. Le reste n'est pas dépouillé et ne se déclare pas lu.
//
// CE QUE CE CORPUS A DE PARTICULIER, ET QUI DOIT SE LIRE AVANT DE L'ÉTENDRE.
// C'est le seul corpus du référentiel dont toutes les obligations salarié
// portent `pieceMedicale: true`. Le produit ne détient de ces visites que trois
// choses — qu'elles ont eu lieu, quand, et quand la suivante est due. Jamais
// l'avis d'aptitude, jamais une restriction, jamais un motif, jamais la pièce.
// C'est plus strict que le droit, et c'est un choix produit assumé, motivé dans
// `docs/rgpd.md` § 2.3.
//
// LES PÉRIODICITÉS SONT DES PLAFONDS, PAS DES RENDEZ-VOUS. Le texte écrit « qui
// ne peut excéder cinq ans » (R. 4624-16) et « qui ne peut être supérieure à
// quatre ans » (R. 4624-28) ; dans les deux cas le médecin du travail fixe le
// délai réel, plus court, en fonction de l'âge, de l'état de santé et des
// risques. Les cinq et quatre ans encodés sont donc la borne extérieure — la
// date au-delà de laquelle l'employeur est nécessairement en défaut — et non le
// rythme que le médecin a retenu. Ce n'est pas une périodicité inventée : les
// deux nombres sont écrits dans le Code. Mais un dirigeant qui lirait « échéance
// dans cinq ans » là où son médecin a fixé trois ans serait mal informé, et
// c'est pourquoi chaque obligation le dit dans sa `description`, et pourquoi
// `TitreSalarie.echeanceLe`, déclaré par l'employeur, prime sur tout calcul.
//
// ⚠ LES CINQ ET QUATRE ANS NE SONT PAS DES BORNES UNIVERSELLES, et la première
// rédaction de ce corpus l'a affirmé à tort. Deux articles y dérogent, tous
// deux relevés le 2026-08-31 à la relecture :
//
//  * `R. 4624-17` — pour le travailleur handicapé, celui qui déclare une
//    pension d'invalidité et le travailleur de nuit, la périodicité « n'excède
//    pas une durée de trois ans ». Annoncer cinq ans à ces salariés, c'est se
//    tromper de deux ans, et dans le sens permissif ;
//  * `R. 4451-82` — pour le travailleur exposé aux rayonnements ionisants
//    classé en catégorie A, la visite du suivi renforcé « est renouvelée chaque
//    année » et « la visite intermédiaire n'est pas requise ». Quatre ans au
//    lieu d'un, et une échéance intermédiaire que le droit exclut.
//
// Les deux sont désormais encodés, chacun par sa propre ligne de catalogue.
//
// ⚠ AUCUN des textes propres aux sept expositions du `R. 4624-23 I` n'a été
// ouvert. Une rédaction antérieure affirmait ici qu'« amiante (R. 4412-118) et
// plomb (R. 4412-160) renvoient aux articles R. 4624-22 à R. 4624-28 sans y
// déroger », en se protégeant sur les cinq autres. Les deux assertions étaient
// FAUSSES, et leur prudence de façade les rendait pires : elle donnait à croire
// que ces deux-là avaient été lus.
//
//  * `R. 4412-160` est ABROGÉ — par le décret n° 2026-253 du 8 avril 2026,
//    art. 3, avec effet au 10/04/2026. C'est le décret que ce fichier cite
//    lui-même dans sa `portee` pour la réécriture de `R. 4624-23` : l'article
//    avait été vu mourir et cité vivant dans le même commentaire ;
//  * `R. 4412-118` porte l'ORGANISATION DES VACATIONS en travaux amiante —
//    temps d'habillage, de décontamination, de pause, avec renvoi à
//    `L. 3121-16` et `L. 3121-17`. Rien sur le suivi individuel renforcé.
//
// Les deux ont été relevés à la source le 2026-08-31, après coup. La faute
// d'origine est nommée parce qu'elle se reproduit facilement : ces deux
// articles n'avaient été vus qu'en résumé de moteur de recherche, et « vérifié »
// avait été écrit sans que la page ait été ouverte.
//
// Lecture : `agent_verbatim`, relevés sur Légifrance le 2026-08-31.

import type { Corpus } from "./types";

export const CODE_TRAVAIL_SANTE_TRAVAIL: Corpus = {
  id: "code-travail-sante-travail",
  intitule:
    "Code du travail — suivi individuel de l'état de santé du travailleur",
  url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493140/",
  etendue: "articles_cites",
  portee:
    "Un article du titre II du livre VI — `L. 4622-1`, qui met à la charge de l'employeur l'organisation d'un service de prévention et de santé au travail, socle de tout ce qui suit et seul article de ce titre à avoir été lu. Puis des extraits de la section 2 du chapitre IV : visite d'information et de prévention, sa périodicité et ses modalités adaptées (R. 4624-10, R. 4624-16 à R. 4624-18), suivi individuel renforcé — champ, liste des postes à risques particuliers, examen d'aptitude et périodicité (R. 4624-22 à R. 4624-24, R. 4624-27, R. 4624-28), et les trois articles de la surveillance post-exposition qui prolongent la sous-section jusqu'à R. 4624-28-3. S'y ajoute R. 4451-82, hors de cette section : il déroge à la périodicité du suivi renforcé pour les travailleurs exposés aux rayonnements ionisants classés en catégorie A, et il n'a de sens que lu avec R. 4624-28. ATTENTION : R. 4624-23 a été réécrit au 10 avril 2026 par le décret n° 2026-253 du 8 avril 2026 — c'est l'article le plus récemment modifié de tout le référentiel.",
  articles: [
    {
      ref: "L. 4622-1",
      intitule:
        "Obligation pour l'employeur d'organiser un service de prévention et de santé au travail",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893834",
      versionEnVigueur: "2022-03-31",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "L'employeur organise un service de prévention et de santé au travail.",
      citationCle:
        "Les employeurs relevant du présent titre organisent des services de prévention et de santé au travail.",
      statut: "obligation_manquante",
      motif:
        "Une phrase, et c'est le socle de tout ce corpus : sans service de prévention et de santé au travail, ni la visite d'information et de prévention ni le suivi individuel renforcé ne peuvent avoir lieu. Le référentiel porte les visites et ne porte pas le service qui les rend possibles.\n\nATTENTION AU VERBE. Le texte dit « ORGANISENT », pas « adhèrent ». L'adhésion à un service interentreprises est une modalité de cette obligation — celle que retiennent la quasi-totalité des TPE — et non l'obligation elle-même : un employeur peut aussi organiser un service autonome. Écrire « l'adhésion est une obligation » resserrerait le texte, et c'est l'erreur qu'une première rédaction du commentaire de `prestataires/domaines.ts` a commise.",
      bloquePar:
        "L'obligation est un état permanent sans échéance ni pièce datable : le modèle la porterait (porteur établissement, périodicité `autre`), mais rien dans le produit ne permettrait de la solder — l'annuaire des prestataires dit qu'un service est déclaré, pas qu'il en existe un. Surtout, le titre II du livre VI n'est dépouillé par aucun corpus : cet article est le SEUL qui en ait été lu, et encoder une obligation sur un titre dont on n'a lu qu'une phrase reviendrait à faire ce que le cliquet de `corpus.test.ts` interdit, à l'échelle du texte plutôt que de l'article.",
    },
    {
      ref: "R. 4624-10",
      intitule: "Visite d'information et de prévention initiale",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769085",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Tout travailleur bénéficie d'une visite d'information et de prévention dans un délai qui n'excède pas trois mois à compter de la prise effective du poste.",
      citationCle:
        "Tout travailleur bénéficie d'une visite d'information et de prévention, réalisée par l'un des professionnels de santé mentionnés au premier alinéa de l'article L. 4624-1 dans un délai qui n'excède pas trois mois à compter de la prise effective du poste de travail.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-vip"],
      reserve:
        "Le délai de trois mois court depuis la prise effective du poste, pas depuis la visite précédente : ce n'est pas une périodicité, et le modèle ne l'exprime pas. `Periodicite` décrit une récurrence, et `TitreSalarie.delivreLe` porte la date de la visite reçue, pas celle de l'embauche. Le délai est rappelé dans la description de l'obligation ; il n'est pas calculé.",
    },
    {
      ref: "R. 4624-16",
      intitule: "Périodicité du renouvellement de la visite d'information",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769063",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le renouvellement de la visite d'information et de prévention intervient selon une périodicité qui ne peut excéder cinq ans, fixée par le médecin du travail au regard des conditions de travail, de l'âge, de l'état de santé et des risques.",
      citationCle:
        "Le travailleur bénéficie d'un renouvellement de la visite d'information et de prévention initiale, réalisée par un professionnel de santé mentionné au premier alinéa de l'article L. 4624-1, selon une périodicité qui ne peut excéder cinq ans. Ce délai, qui prend en compte les conditions de travail, l'âge et l'état de santé du salarié, ainsi que les risques auxquels il est exposé, est fixé par le médecin du travail dans le cadre du protocole mentionné à l'article L. 4624-1.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-vip"],
    },
    {
      ref: "R. 4624-17",
      intitule:
        "Modalités de suivi adaptées — périodicité qui n'excède pas trois ans",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769059",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le travailleur dont l'état de santé, l'âge, les conditions de travail ou les risques le nécessitent — notamment le travailleur handicapé, celui qui déclare être titulaire d'une pension d'invalidité et le travailleur de nuit — bénéficie de modalités de suivi adaptées, selon une périodicité qui n'excède pas trois ans.",
      citationCle:
        "Tout travailleur dont l'état de santé, l'âge, les conditions de travail ou les risques professionnels auxquels il est exposé le nécessitent, notamment les travailleurs handicapés, les travailleurs qui déclarent être titulaires d'une pension d'invalidité et les travailleurs de nuit mentionnés à l'article L. 3122-5, bénéficie, à l'issue de la visite d'information et de prévention, de modalités de suivi adaptées déterminées dans le cadre du protocole écrit prévu au troisième alinéa de l'article L. 4624-1, selon une périodicité qui n'excède pas une durée de trois ans.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-vip-adaptee"],
      reserve:
        "Le produit ne DÉCLENCHE pas cette modalité : rien dans le modèle ne dit qu'un salarié est handicapé, titulaire d'une pension d'invalidité ou travailleur de nuit, et il ne faut surtout pas le déduire — ce serait une donnée sensible dérivée, exactement ce que `docs/rgpd.md` interdit. Le questionnaire DUERP pose bien une question sur le travail de nuit (`q-travail-nuit`), mais elle porte sur l'ORGANISATION de l'établissement, pas sur des personnes nommées. L'employeur déclare le titre pour qui il sait concerné ; l'outil fournit la ligne de catalogue et le rythme.",
    },
    {
      ref: "R. 4624-18",
      intitule:
        "Visite préalable à l'affectation — travailleurs de nuit et mineurs",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769047",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le travailleur de nuit et le travailleur de moins de dix-huit ans bénéficient d'une visite d'information et de prévention PRÉALABLEMENT à leur affectation sur le poste, et non dans les trois mois qui suivent.",
      citationCle:
        "Tout travailleur de nuit mentionné à l'article L. 3122-5 et tout travailleur âgé de moins de dix-huit ans bénéficie d'une visite d'information et de prévention réalisée par un professionnel de santé mentionné au premier alinéa de l'article L. 4624-1 préalablement à son affectation sur le poste.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-vip-adaptee"],
      reserve:
        "L'article renverse le calendrier d'entrée de R. 4624-10 : la visite est due AVANT l'affectation, quand le régime général l'admet dans les trois mois qui suivent. Ce renversement n'est pas calculé — le modèle ne porte pas la date d'affectation, et `Periodicite` décrit une récurrence, pas un délai à compter d'un fait d'emploi. Il est écrit dans la description de l'obligation. À noter aussi : le travailleur de moins de dix-huit ans n'est PAS dans la liste de R. 4624-17, donc il relève du rythme général de cinq ans tout en ayant cette visite d'entrée anticipée. Les deux articles ne se recouvrent qu'en partie.",
    },
    {
      ref: "R. 4451-82",
      intitule:
        "Rayonnements ionisants — dérogation à la périodicité du suivi renforcé (catégorie A)",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037024438",
      versionEnVigueur: "2018-07-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Pour un travailleur classé en catégorie A, la visite médicale du suivi individuel renforcé est renouvelée chaque année, et la visite intermédiaire n'est pas requise.",
      citationCle:
        "Le suivi individuel renforcé des travailleurs classés au sens de l'article R. 4451-57 ou des travailleurs faisant l'objet d'un suivi individuel de l'exposition au radon prévu à l'article R. 4451-65 est assuré dans les conditions prévues aux articles R. 4624-22 à R. 4624-28. Pour un travailleur classé en catégorie A, la visite médicale mentionnée à l'article R. 4624-28 est renouvelée chaque année. La visite intermédiaire mentionnée au même article n'est pas requise.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-sir-categorie-a"],
      reserve:
        "L'article déroge DEUX FOIS à R. 4624-28 : la périodicité passe de quatre ans à un an, et la visite intermédiaire biennale disparaît. Le second point compte autant que le premier — déclarer une visite intermédiaire à un travailleur de catégorie A inscrirait au calendrier une échéance que le droit exclut expressément. La classification en catégorie A (R. 4451-57) n'est pas dérivée : l'employeur déclare le titre.",
    },
    {
      ref: "R. 4624-22",
      intitule: "Champ du suivi individuel renforcé",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769092",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Tout travailleur affecté à un poste présentant des risques particuliers au sens de R. 4624-23 bénéficie d'un suivi individuel renforcé de son état de santé.",
      citationCle:
        "Tout travailleur affecté à un poste présentant des risques particuliers pour sa santé ou sa sécurité ou pour celles de ses collègues ou des tiers évoluant dans l'environnement immédiat de travail défini à l'article R. 4624-23 bénéficie d'un suivi individuel renforcé de son état de santé selon des modalités définies par la présente sous-section.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-sir"],
    },
    {
      ref: "R. 4624-23",
      intitule: "Postes présentant des risques particuliers",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483826",
      versionEnVigueur: "2026-04-10",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le I fixe la liste des expositions ouvrant un suivi individuel renforcé ; le III met à la charge de l'employeur une liste complémentaire de postes, motivée par écrit, transmise au service de prévention et de santé au travail et mise à jour tous les ans.",
      citationCle:
        "S'il le juge nécessaire, l'employeur complète la liste des postes entrant dans les catégories mentionnées au I. par des postes présentant des risques particuliers […] après avis du ou des médecins concernés et du comité social et économique s'il existe, en cohérence avec l'évaluation des risques prévue à l'article L. 4121-3 et, le cas échéant, la fiche d'entreprise prévue à l'article R. 4624-46. Cette liste est transmise au service de prévention et de santé au travail, tenue à disposition du directeur régional des entreprises, de la concurrence, de la consommation, du travail et de l'emploi et des services de prévention des organismes de sécurité sociale et mise à jour tous les ans. L'employeur motive par écrit l'inscription de tout poste sur cette liste.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-liste-postes-risques"],
      reserve:
        "Le I — amiante, plomb, agents CMR, agents biologiques des groupes 3 et 4, rayonnements ionisants, risque hyperbare, chute de hauteur au montage d'échafaudages — n'est pas encodé comme déclencheur, et ne peut pas l'être : rien dans le modèle ne dit à quoi un salarié est exposé, et le déduire serait le cinquième déclencheur (activité réellement exercée), non implémenté. Le II — tout poste dont l'affectation est conditionnée à un examen d'aptitude spécifique prévu par le Code — reste également hors du calcul. Le IV, qui fait consulter le Conseil d'orientation des conditions de travail tous les trois ans sur la mise à jour de la liste du I, ne concerne pas l'employeur.",
    },
    {
      ref: "R. 4624-24",
      intitule: "Examen médical d'aptitude préalable à l'affectation",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769104",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le suivi individuel renforcé comprend un examen médical d'aptitude, qui se substitue à la visite d'information et de prévention et qui est effectué par le médecin du travail préalablement à l'affectation sur le poste.",
      citationCle:
        "Le suivi individuel renforcé comprend un examen médical d'aptitude, qui se substitue à la visite d'information et de prévention prévue à l'article R. 4624-10. Il est effectué par le médecin du travail préalablement à l'affectation sur le poste.",
      statut: "retenu",
      obligations: ["sante-travail-salarie-sir"],
      reserve:
        "Les cinq finalités énumérées par l'article — vérifier l'aptitude au poste, rechercher une affection dangereuse pour les autres, proposer des adaptations, informer et sensibiliser le travailleur — décrivent le contenu médical de l'examen. Rien n'en est encodé, et rien ne doit l'être : c'est exactement ce que `docs/rgpd.md` § 2.3 exclut du produit. Le référentiel retient de cet article qu'un examen est dû avant l'affectation, et qu'il se substitue à la VIP.",
    },
    {
      ref: "R. 4624-27",
      intitule:
        "Dispense d'examen d'aptitude — visite dans les deux ans précédant l'embauche",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769096",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "L'examen d'aptitude préalable n'est pas requis lorsque le travailleur en a bénéficié dans les deux ans précédant son embauche, sous trois conditions cumulatives : emploi identique présentant des risques d'exposition équivalents, dernier avis d'aptitude en possession du médecin du travail, et aucune mesure de L. 4624-3 ni avis d'inaptitude de L. 4624-4 dans les deux ans.",
      citationCle:
        "Lorsque le travailleur a bénéficié d'une visite médicale d'aptitude dans les deux ans précédant son embauche, l'organisation d'un nouvel examen médical d'aptitude n'est pas requise dès lors que l'ensemble des conditions suivantes sont réunies",
      statut: "retenu",
      obligations: ["sante-travail-salarie-sir"],
      reserve:
        "La dispense n'est pas calculée, et c'est un FAUX POSITIF assumé : l'obligation fait naître l'examen préalable sans jamais dire que le droit en dispense sous condition. Les trois conditions supposent des faits que l'outil ne détient pas — la nature de l'emploi précédent, ce que le médecin du travail a en sa possession, et l'historique des avis d'aptitude, qui est précisément ce que `docs/rgpd.md` § 2.3 lui interdit de connaître. La dispense est rappelée dans la description de l'obligation ; elle ne s'applique jamais toute seule.\n\nCet article a été trouvé par un balayage des renvois d'intervalle : le corpus écrivait « R. 4624-22 à R. 4624-28 » en n'ayant ouvert que 22, 23, 24 et 28. Un intervalle cité n'est pas un intervalle lu.",
    },
    {
      ref: "R. 4624-28-1",
      intitule:
        "Visite de fin de carrière — catégories de travailleurs concernées",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043927893",
      versionEnVigueur: "2022-03-31",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "La visite médicale de L. 4624-2-1 est organisée pour les travailleurs bénéficiant ou ayant bénéficié d'un suivi individuel renforcé, et pour ceux qui ont été exposés aux risques du I de R. 4624-23 avant la mise en œuvre de ce dispositif.",
      citationCle:
        "La visite médicale prévue à l'article L. 4624-2-1 est organisée pour les catégories de travailleurs suivantes : 1° Les travailleurs bénéficiant ou ayant bénéficié d'un suivi individuel renforcé de leur état de santé prévu à l'article L. 4624-2 ; 2° Les travailleurs ayant été exposés à un ou plusieurs des risques mentionnés au I de l'article R. 4624-23 antérieurement à la mise en œuvre du dispositif de suivi individuel renforcé.",
      statut: "sans_objet",
      motif:
        "L'article désigne les bénéficiaires d'une visite que le service de prévention et de santé au travail organise ; il ne met aucun acte à la charge de l'employeur, dont l'obligation est portée par R. 4624-28-2. Il se lit comme la définition du champ de cette obligation-là, et non comme une obligation propre.",
    },
    {
      ref: "R. 4624-28-2",
      intitule:
        "Information du service de santé au travail à la cessation d'exposition ou au départ",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043927913",
      versionEnVigueur: "2022-04-28",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "L'employeur informe son service de prévention et de santé au travail, dès qu'il en a connaissance, de la cessation d'exposition d'un travailleur à des risques particuliers, de son départ ou de sa mise à la retraite ; il en avise le travailleur sans délai.",
      citationCle:
        "Pour l'organisation de la visite prévue à l'article L. 4624-2-1, l'employeur informe son service de prévention et de santé au travail, dès qu'il en a connaissance, de la cessation de l'exposition d'un des travailleurs de l'entreprise à des risques particuliers pour sa santé ou sa sécurité justifiant un suivi individuel renforcé, de son départ ou de sa mise à la retraite. Il avise sans délai le travailleur concerné de la transmission de cette information.",
      statut: "obligation_manquante",
      motif:
        "Obligation d'employeur pleine et entière, et le référentiel ne la porte pas : informer le service de santé au travail à la cessation d'exposition, au départ ou à la mise à la retraite d'un salarié en suivi individuel renforcé, puis en aviser sans délai l'intéressé. Elle prolonge exactement les obligations que ce lot encode — elle vise les mêmes salariés, ceux du SIR — et elle intervient au moment où l'outil cesse de les suivre.",
      bloquePar:
        "Obligation ÉVÉNEMENTIELLE : son fait générateur est un départ, une mise à la retraite ou une fin d'exposition. Le modèle n'a pas de déclencheur « événement » (ADR-022, axe nommé sans mécanisme), et le produit ne détient aucune date de sortie — `Salarie` porte un drapeau `actif`, pas un motif ni une date de départ. Le second alinéa ouvre en outre au travailleur un délai de six mois après la cessation d'exposition pour demander la visite lui-même, délai que rien ne pourrait décompter ici.",
    },
    {
      ref: "R. 4624-28-3",
      statut: "non_depouille",
    },
    {
      ref: "R. 4624-28",
      intitule: "Périodicité du suivi individuel renforcé",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033769094",
      versionEnVigueur: "2017-01-01",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le renouvellement est effectué par le médecin du travail selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans ; une visite intermédiaire est effectuée par un professionnel de santé au plus tard deux ans après la visite avec le médecin du travail.",
      citationCle:
        "Tout travailleur affecté à un poste présentant des risques particuliers […] bénéficie, à l'issue de l'examen médical d'embauche, d'un renouvellement de cette visite, effectuée par le médecin du travail selon une périodicité qu'il détermine et qui ne peut être supérieure à quatre ans. Une visite intermédiaire est effectuée par un professionnel de santé mentionné au premier alinéa de l'article L. 4624-1 au plus tard deux ans après la visite avec le médecin du travail.",
      statut: "retenu",
      obligations: [
        "sante-travail-salarie-sir",
        "sante-travail-salarie-sir-visite-intermediaire",
      ],
    },
    // -------------------------------------------------------------------------
    // Section 3 « Documents et rapports » — la fiche d'entreprise (lot 8)
    //
    // L'en-tête de ce corpus annonçait la fiche d'entreprise parmi les articles
    // NON lus de la quarantaine que compte le chapitre IV. Elle l'est désormais,
    // et les deux articles qui la portent entrent ici plutôt que dans un corpus
    // séparé : c'est le même chapitre, le même service, le même dossier.
    // -------------------------------------------------------------------------
    {
      ref: "R. 4624-46",
      intitule: "Établissement et mise à jour de la fiche d'entreprise",
      url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045677119",
      versionEnVigueur: "2022-04-28",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Le médecin du travail ou, dans les services interentreprises, l'équipe pluridisciplinaire établit et met à jour, pour chaque entreprise ou établissement, une fiche portant les risques professionnels et les effectifs de salariés qui y sont exposés.",
      citationCle:
        "Pour chaque entreprise ou établissement, le médecin du travail ou, dans les services de prévention et de santé au travail interentreprises, l'équipe pluridisciplinaire établit et met à jour une fiche d'entreprise ou d'établissement sur laquelle figurent, notamment, les risques professionnels et les effectifs de salariés qui y sont exposés.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-fiche-entreprise"],
      reserve:
        "« ÉTABLIT ET MET À JOUR », SANS AUCUN RYTHME. C'était le piège de cet article : on lit couramment que la fiche se met à jour tous les quatre ans, ou à chaque changement notable. Ni l'un ni l'autre n'est écrit. L'obligation porte `periodicite: \"autre\"`. Les articles R. 4624-48 à R. 4624-50 — transmission à l'employeur, présentation au CSE, accès de l'inspection, modèle fixé par arrêté — n'ont PAS été ouverts sur Légifrance : ils sont connus par le sommaire de la sous-section, ce qui ne vaut pas lecture.",
    },
    {
      ref: "R. 4624-47",
      intitule: "Délai d'établissement pour les entreprises adhérentes",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000018493214/",
      versionEnVigueur: "2022-04-28",
      luLe: "2026-08-31",
      lecture: "agent_verbatim",
      prescrit:
        "Pour les entreprises adhérentes à un service de prévention et de santé au travail interentreprises, la fiche d'entreprise est établie dans l'année qui suit l'adhésion.",
      citationCle:
        "Pour les entreprises adhérentes à un service de prévention et de santé au travail interentreprises, la fiche d'entreprise est établie dans l'année qui suit l'adhésion de l'entreprise ou de l'établissement à ce service.",
      statut: "retenu",
      obligations: ["sante-travail-etablissement-fiche-entreprise"],
      reserve:
        "UNE ANNÉE EST UN DÉLAI, PAS UNE PÉRIODICITÉ : c'est un point de départ unique, pas un rythme de renouvellement. Le produit ne porte pas la date d'adhésion au service, donc ce délai n'engendre aucune ligne de calendrier ; il est rappelé dans la description de l'obligation. Aucune transmission `attribut_absent` n'est déclarée : l'attribut manquant ne conditionne pas l'applicabilité, seulement la date d'exigibilité.",
    },
  ],
};
