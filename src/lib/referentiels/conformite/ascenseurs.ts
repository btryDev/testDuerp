/**
 * Obligations réglementaires — Ascenseurs (P2).
 *
 * Sources primaires :
 *   - Code de la construction et de l'habitation (CCH), articles R. 134-1
 *     à R. 134-13 (décret 2021-872) : R. 134-1 à 5 objectifs et dispositifs
 *     de sécurité, R. 134-6 à 10 entretien, R. 134-11 à 13 contrôle
 *     technique quinquennal.
 *   - Arrêté du 18 novembre 2004 modifié relatif à l'entretien des
 *     installations d'ascenseurs (visite toutes les six semaines, opérations
 *     semestrielles et annuelles en annexe).
 *   - Arrêté du 7 août 2012 relatif aux contrôles techniques (abroge
 *     l'arrêté du 18 novembre 2004 relatif aux contrôles techniques).
 *
 * Audit des sources 2026-08-25 : l'« arrêté du 13 août 2008 » cité
 * auparavant n'existe pas.
 *
 * Le champ d'application vise tout immeuble disposant d'un ascenseur au
 * sens du CCH (installations fixes desservant des niveaux définis,
 * équipées d'une cabine). Le flag `categoriesEquipement: ["ASCENSEUR"]`
 * assure que seule la déclaration explicite d'un ascenseur déclenche
 * ces obligations.
 *
 * Amendement 2026-08-25 — régime `habitation` ajouté aux six obligations.
 * Elles déclaraient `{ travail, erp, igh }` sans `habitation`, en
 * contradiction avec le paragraphe précédent et avec les textes relus ce
 * jour sur Légifrance : L. 134-1 (« applicables aux ascenseurs […] destinés à
 * desservir de manière permanente les bâtiments », sans exclusion par
 * destination du bâtiment), L. 134-3 (« Les ascenseurs font l'objet d'un
 * entretien ») et R. 134-11 (« Le propriétaire d'un ascenseur est tenu de
 * faire réaliser tous les cinq ans un contrôle technique »). Le seul texte
 * qui distingue les établissements employeurs est L. 134-4, dernier alinéa,
 * qui n'ajoute qu'un régime documentaire (registre L. 4711 CT) sans
 * restreindre l'obligation. Un immeuble d'habitation sans salarié, non-ERP,
 * non-IGH, équipé d'un ascenseur, reçoit donc désormais les six lignes.
 *
 * Même relecture : R. 134-6 (version en vigueur au 01/04/2026, décret
 * 2026-166) place l'examen **semestriel** sur le bon état des câbles, la
 * vérification **annuelle** sur les parachutes, et la vérification des
 * moyens d'alerte **toutes les six semaines**. Les libellés et descriptions
 * ci-dessous ont été réalignés sur ce texte.
 *   https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/
 */

import type { Obligation } from "./types";

export const obligationsAscenseurs: Obligation[] = [
  {
    id: "ascenseur-visite-six-semaines",
    domaine: "ascenseur",
    libelle: "Visite de l'ascenseur toutes les six semaines",
    description:
      "À intervalle maximum de six semaines, l'entreprise d'entretien vérifie la cabine, les verrouillages et contacts de fermeture des baies palières et de la porte de cabine, le dispositif limitant les possibilités d'actes de vandalisme, l'efficacité du dispositif de réouverture des portes, la précision d'arrêt et de nivelage au palier, les dispositifs de moyens d'alerte et de communication avec le service d'intervention, les commandes et indicateurs aux paliers, ainsi que le niveau et l'absence de fuites de la cuve hydraulique. C'est la visite qui vérifie qu'une porte palière ne peut pas s'ouvrir sur une gaine vide, et qu'une personne bloquée en cabine peut joindre quelqu'un.",
    referencesLegales: [
      {
        source: "CCH",
        reference:
          "CCH, art. R. 134-6 (prestations minimales du contrat d'entretien)",
        article: "CCH R. 134-6",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
      {
        source: "ARRETE",
        reference:
          "Arrêté du 18 novembre 2004 (entretien), annexe — colonne « intervalle maximum de six semaines »",
        article: "Arrêté 2004-11-18",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
        note: "Colonne « INTERVALLE maximum de six semaines » du tableau annexé, neuf lignes cochées. Relevé sur capture d'écran le 2026-08-26 : la conversion du tableau en texte perd la position des croix et l'avait rendu illisible à quatre reprises.",
        versionConstatee: "2026-04-01",
      },
    ],
    periodicite: "six_semaines",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Créée le 2026-08-26. La visite de base de l'ascenseur ne produisait AUCUNE échéance : `ascenseur-entretien-contrat` la mentionnait en prose et vaut `periodicite: \"autre\"`, avec une note qui la disait « à la charge de l'entreprise d'entretien, hors scope du générateur MVP ». C'était un raisonnement en cible, pas une lecture du texte : le propriétaire reste tenu de faire exécuter ces prestations, et le registre doit en porter la trace.\n\nL'énumération ne descendait pas à quarante-deux jours. La valeur `six_semaines` a été ajoutée à l'énumération et à l'enum Postgres pour cela — six semaines n'est pas un mois et demi, le texte compte en semaines et la conversion est exacte.\n\nRéalisateur `personne_qualifiee` : R. 134-6 impose que l'entretien soit exécuté par une entreprise spécialisée, l'exploitant ne peut pas s'en charger lui-même.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",
  },
  {
    id: "ascenseur-entretien-contrat",
    domaine: "ascenseur",
    libelle: "Contrat d'entretien avec prestations minimales (ascenseur)",
    description:
      "Le propriétaire fait exécuter l'entretien de l'ascenseur par une entreprise spécialisée dans le cadre d'un contrat écrit. Le contrat définit les prestations minimales fixées par R. 134-6 : une visite toutes les six semaines, la vérification toutes les six semaines des serrures de portes palières et des moyens d'alerte et de communication avec un service d'intervention, l'examen semestriel du bon état des câbles, la vérification annuelle des parachutes et le nettoyage annuel de la cuvette et du toit de cabine.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-6 et R. 134-7 (ex R. 125-2 et R. 125-2-1)",
        article: "CCH R. 134-6",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004 relatif à l'entretien des installations d'ascenseurs, art. 2 et annexe",
        article: "Arrêté 2004-11-18",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
        versionConstatee: "2026-04-01",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "contrat d'entretien",
    realisateurs: ["exploitant"],
    criticite: 4,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Obligation permanente contractuelle — pas d'échéance propre dans le calendrier. Les visites concrètes toutes les six semaines sont désormais portées par `ascenseur-visite-six-semaines` (créée le 2026-08-26) : elles étaient jusque-là déclarées « hors scope du générateur MVP », ce qui était une décision de périmètre et non une lecture du texte.\n\nNATURE : ÉTAT PERMANENT, `pieceAttendue: \"contrat d'entretien\"` (ADR-026). R. 134-6 exige un CONTRAT ÉCRIT : l'écrit est l'obligation. Les visites qu'il définit ont leurs propres lignes, récurrentes, et ne se confondent pas avec celle-ci.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",
  },
  {
    id: "ascenseur-examen-semestriel-secours",
    domaine: "ascenseur",
    libelle: "Examen semestriel du bon état des câbles (ascenseur)",
    description:
      "Au moins une fois tous les six mois, l'entreprise d'entretien examine le bon état des câbles ou chaînes de suspension et de leurs extrémités, du frein, et du dispositif antidérive. Ce sont les trois seules lignes que l'annexe de l'arrêté du 18 novembre 2004 range en fréquence minimale semestrielle. Les moyens d'alerte et de communication avec le service d'intervention sont, eux, vérifiés à chaque visite, soit toutes les six semaines.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-6 (examen semestriel du bon état des câbles)",
        article: "CCH R. 134-6",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004 (entretien), annexe — opérations semestrielles",
        article: "Arrêté 2004-11-18",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
        versionConstatee: "2026-04-01",
      },
    ],
    periodicite: "semestrielle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Amendement 2026-08-25 : l'obligation s'intitulait « examen semestriel du dispositif de secours », périodicité qu'aucun texte relu ne fonde — R. 134-6 vérifie les moyens d'alerte toutes les six semaines et réserve le semestriel au bon état des câbles. L'identifiant est conservé (jamais réutilisé, et les Verification existantes y sont rattachées) ; libellé, description et référence fondatrice ont été réalignés sur R. 134-6.\n\nAmendement 2026-08-26, tableau de l'annexe lu à la source. La colonne « fréquence minimale semestrielle » ne comporte que TROIS lignes : câbles ou chaînes de suspension et leurs extrémités, frein, dispositif antidérive. Le frein et l'antidérive manquaient — le frein est ce qui retient la cabine, l'antidérive ce qui l'empêche de descendre seule en hydraulique. Ajoutés.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",
  },
  {
    id: "ascenseur-examen-annuel-securite",
    domaine: "ascenseur",
    libelle: "Examen annuel des dispositifs de sécurité (ascenseur)",
    description:
      "Au moins une fois par an, l'entreprise d'entretien vérifie le parachute et tout autre dispositif antichute — y compris le moyen de protection contre les mouvements incontrôlés de la cabine en montée, la soupape de rupture ou le réducteur de débit des ascenseurs hydrauliques —, les limiteurs de vitesse de cabine et de contrepoids et leur poulie de tension, la poulie de traction, les dispositifs hors course de sécurité, la pompe à main ou soupape de descente à commande manuelle, ainsi que la propreté et l'éclairage de la cuvette, du toit de cabine et du local des machines. Les câbles de suspension et les serrures de portes palières ne relèvent pas de cette échéance : les premiers sont semestriels, les secondes sont vérifiées toutes les six semaines.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004 (entretien), annexe — opérations annuelles",
        article: "Arrêté 2004-11-18",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
        versionConstatee: "2026-04-01",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 134-6 (vérification annuelle des parachutes)",
        article: "CCH R. 134-6",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
    ],
    periodicite: "annuelle",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "CORRIGÉ LE 2026-08-26, tableau de l'annexe lu à la source. La description rangeait « les câbles ou chaînes de suspension et leurs extrémités » dans l'ANNUEL. Le tableau les coche en SEMESTRIEL — et `ascenseur-examen-semestriel-secours` les portait déjà correctement. Le référentiel se contredisait donc lui-même sur la même ligne du même tableau, et la lecture la plus lâche des deux aurait pu l'emporter.\n\nQuatre lignes de la colonne annuelle manquaient par ailleurs : propreté et éclairage de la cuvette, du toit de cabine et du local des machines ; poulie de traction ; dispositifs hors course de sécurité ; pompe à main ou soupape de descente à commande manuelle. La colonne en compte six au total, toutes désormais nommées.\n\nVersion constatée : celle du 1er avril 2026, issue de l'arrêté du 4 mars 2026.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",

  },
  {
    id: "ascenseur-controle-technique-quinquennal",
    domaine: "ascenseur",
    libelle: "Contrôle technique quinquennal (ascenseur)",
    description:
      "Tous les cinq ans, le propriétaire fait réaliser un contrôle technique de l'ascenseur (R. 134-11) par un contrôleur technique agréé, un organisme habilité ou une personne certifiée (R. 134-12). Le rapport, remis au propriétaire dans le mois suivant la fin de l'intervention, est transmis par lui à l'entreprise d'entretien (R. 134-13) ; toute personne disposant d'un titre d'occupation dans l'immeuble peut en obtenir communication (L. 134-4).",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-11 à R. 134-13 (ex R. 125-2-4 et s.)",
        article: "CCH R. 134-11",
        url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818747/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 7 août 2012 relatif aux contrôles techniques à réaliser dans les installations d'ascenseurs",
        article: "Arrêté 2012-08-07",
        url:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000026286347",
      },
    ],
    periodicite: "quinquennale",
    nature: "echeance_recurrente",
    pieceAttendue: null,
    realisateurs: ["bureau_controle", "personne_qualifiee"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait un « arrêté du 13 août 2008 » introuvable. Le texte en vigueur est l'arrêté du 7 août 2012, qui abroge l'arrêté du 18 novembre 2004 relatif aux contrôles techniques.\n\nAmendement 2026-08-25 : R. 134-12 (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818749/) énumère les contrôleurs admis — contrôleur technique agréé au sens de L. 125-1, organisme habilité d'un État de l'UE/EEE, personne morale à salariés certifiés, personne physique certifiée. Aucune notion d'« organisme accrédité » : `organisme_accredite` est remplacé par `bureau_controle` (contrôleur technique agréé), `personne_qualifiee` couvrant les personnes certifiées.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",
  },
  {
    id: "ascenseur-carnet-entretien",
    domaine: "ascenseur",
    libelle: "Tenue du carnet d'entretien de l'ascenseur",
    description:
      "Un carnet d'entretien est tenu à jour — par l'entreprise dans le régime du contrat d'entretien (R. 134-7 III), par le propriétaire lui-même s'il assure l'entretien par ses propres moyens (R. 134-10). L'entreprise remet en outre au propriétaire un rapport annuel d'activité où figurent les interventions d'entretien, les incidents, les visites et contrôles réalisés. Le carnet est conservé pendant toute la durée de vie de l'ascenseur.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-7 et R. 134-10 (carnet d'entretien)",
        article: "CCH R. 134-10",
        url:
          "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000043818735/",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: "carnet d'entretien",
    realisateurs: ["exploitant"],
    criticite: 3,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes: "NATURE : ÉTAT PERMANENT, `pieceAttendue: \"carnet d'entretien\"` (ADR-026). R. 134-7 III et R. 134-10 imposent la tenue du carnet lui-même, conservé toute la vie de l'appareil.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",
  },
  {
    id: "ascenseur-telealarme-liaison",
    domaine: "ascenseur",
    libelle: "Liaison permanente avec un service d'intervention (téléalarme ascenseur)",
    description:
      "L'ascenseur doit être équipé d'un dispositif permettant à une personne enfermée dans la cabine de donner l'alerte et de recevoir une réponse d'un service d'intervention disponible en permanence (24 h/24, 7 j/7).",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-1 à R. 134-5 (dispositifs de sécurité, dont demande de secours)",
        article: "CCH R. 134-1",
        url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043818721/",
      },
    ],
    periodicite: "autre",
    nature: "etat_permanent",
    pieceAttendue: null,
    realisateurs: ["exploitant"],
    criticite: 5,
    transmet: [],
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Obligation permanente de moyens (contrat d'astreinte), non planifiée dans le calendrier.\n\nAmendement 2026-08-25 : R. 134-6 (version au 01/04/2026, décret 2026-166) impose la vérification des moyens d'alerte et de communication à chaque visite (six semaines) et un volet sur l'obsolescence des réseaux RTC/3G ; R. 134-11 a) vise la compatibilité de ces moyens avec les autres réseaux. Non modélisé comme échéance propre : couvert par le contrat d'entretien.\n\nNATURE : ÉTAT PERMANENT (ADR-026). Un dispositif d'alerte disponible 24 h/24 : l'état est l'obligation, il n'y a aucun acte à refaire à date. `pieceAttendue` est nulle — le texte exige un dispositif, pas un écrit.\n\nFAMILLE D'HABITATION — EXAMINÉE LE 2026-09-01, AUCUNE RESTRICTION POSÉE. L'arrêté du 31 janvier 1986, qui définit les familles, a été dépouillé ce jour (`corpus/arrete-1986-habitation.ts`). Son SEUL article traitant des ascenseurs est le 97, et il ne prescrit que des degrés coupe-feu de parois de cages par famille, plus un dispositif d'appel prioritaire des pompiers en 4ᵉ famille : des règles de construction, dont aucune ne conditionne l'entretien, la visite ni le contrôle technique. Le régime de cette ligne vient du CCH, et L. 134-1, relu le même jour, énumère huit exclusions de champ — installations à câbles, ascenseurs militaires, puits de mine, machinerie de théâtre, moyens de transport, accès au poste de travail d'une machine, ascenseurs de chantier, appareils à 0,15 m/s au plus — dont AUCUNE ne vise les maisons individuelles. Poser `habitation: { familles }` ici serait une restriction inventée : la typologie reste inchangée.",
  },
];
