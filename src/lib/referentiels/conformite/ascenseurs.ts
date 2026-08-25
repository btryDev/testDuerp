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
    id: "ascenseur-entretien-contrat",
    domaine: "ascenseur",
    libelle: "Contrat d'entretien avec prestations minimales (ascenseur)",
    description:
      "Le propriétaire fait exécuter l'entretien de l'ascenseur par une entreprise spécialisée dans le cadre d'un contrat écrit. Le contrat définit les prestations minimales fixées par R. 134-6 : une visite toutes les six semaines, la vérification toutes les six semaines des serrures de portes palières et des moyens d'alerte et de communication avec un service d'intervention, l'examen semestriel du bon état des câbles, la vérification annuelle des parachutes et le nettoyage annuel de la cuvette et du toit de cabine.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-6 et R. 134-7 (ex R. 125-2 et R. 125-2-1)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004 relatif à l'entretien des installations d'ascenseurs, art. 2 et annexe",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 4,
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Obligation permanente contractuelle — pas d'échéance propre dans le calendrier. Les visites concrètes (toutes les 6 semaines) sont à la charge de l'entreprise d'entretien, hors scope du générateur MVP.",
  },
  {
    id: "ascenseur-examen-semestriel-secours",
    domaine: "ascenseur",
    libelle: "Examen semestriel du bon état des câbles (ascenseur)",
    description:
      "L'entreprise d'entretien procède, au moins une fois tous les six mois, à l'examen du bon état des câbles de l'ascenseur (R. 134-6). Les moyens d'alerte et de communication avec le service d'intervention sont, eux, vérifiés à chaque visite, soit toutes les six semaines.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-6 (examen semestriel du bon état des câbles)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004 (entretien), annexe — opérations semestrielles",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
      },
    ],
    periodicite: "semestrielle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Amendement 2026-08-25 : l'obligation s'intitulait « examen semestriel du dispositif de secours », périodicité qu'aucun texte relu ne fonde — R. 134-6 vérifie les moyens d'alerte toutes les six semaines et réserve le semestriel au bon état des câbles. L'identifiant est conservé (jamais réutilisé, et les Verification existantes y sont rattachées) ; libellé, description et référence fondatrice ont été réalignés sur R. 134-6.",
  },
  {
    id: "ascenseur-examen-annuel-securite",
    domaine: "ascenseur",
    libelle: "Examen annuel des dispositifs de sécurité (ascenseur)",
    description:
      "Vérification annuelle par l'entreprise d'entretien des parachutes (R. 134-6) et, selon l'annexe de l'arrêté du 18 novembre 2004, des limiteurs de vitesse de cabine et de contrepoids, de leur poulie de tension et des câbles ou chaînes de suspension et de leurs extrémités. Les serrures de portes palières relèvent de la vérification toutes les six semaines.",
    referencesLegales: [
      {
        source: "ARRETE",
        reference: "Arrêté du 18 novembre 2004 (entretien), annexe — opérations annuelles",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000254219",
      },
      {
        source: "CCH",
        reference: "CCH, art. R. 134-6 (vérification annuelle des parachutes)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818737/",
      },
    ],
    periodicite: "annuelle",
    realisateurs: ["personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
  },
  {
    id: "ascenseur-controle-technique-quinquennal",
    domaine: "ascenseur",
    libelle: "Contrôle technique quinquennal (ascenseur)",
    description:
      "Tous les cinq ans, le propriétaire fait réaliser un contrôle technique de l'ascenseur (R. 134-11) par un contrôleur technique agréé, un organisme habilité ou une personne certifiée (R. 134-12). Le rapport, remis au propriétaire dans les trente jours, est transmis par lui à l'entreprise d'entretien (R. 134-13) ; toute personne disposant d'un titre d'occupation dans l'immeuble peut en obtenir communication (L. 134-4).",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-11 à R. 134-13 (ex R. 125-2-4 et s.)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818747/",
      },
      {
        source: "ARRETE",
        reference: "Arrêté du 7 août 2012 relatif aux contrôles techniques à réaliser dans les installations d'ascenseurs",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000026286347",
      },
    ],
    periodicite: "quinquennale",
    realisateurs: ["bureau_controle", "personne_qualifiee"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Corrigé à l'audit 2026-08 : l'ancienne version citait un « arrêté du 13 août 2008 » introuvable. Le texte en vigueur est l'arrêté du 7 août 2012, qui abroge l'arrêté du 18 novembre 2004 relatif aux contrôles techniques.\n\nAmendement 2026-08-25 : R. 134-12 (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043818749/) énumère les contrôleurs admis — contrôleur technique agréé au sens de L. 125-1, organisme habilité d'un État de l'UE/EEE, personne morale à salariés certifiés, personne physique certifiée. Aucune notion d'« organisme accrédité » : `organisme_accredite` est remplacé par `bureau_controle` (contrôleur technique agréé), `personne_qualifiee` couvrant les personnes certifiées.",
  },
  {
    id: "ascenseur-carnet-entretien",
    domaine: "ascenseur",
    libelle: "Tenue du carnet d'entretien de l'ascenseur",
    description:
      "Le propriétaire tient à jour un carnet d'entretien où figurent les interventions d'entretien, les incidents, les visites et contrôles réalisés. Le carnet est conservé pendant toute la durée de vie de l'ascenseur.",
    referencesLegales: [
      {
        source: "CCH",
        reference: "CCH, art. R. 134-7 et R. 134-10 (carnet d'entretien)",
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/id/LEGISCTA000043818735/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 3,
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
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
        urlLegifrance:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000043818721/",
      },
    ],
    periodicite: "autre",
    realisateurs: ["exploitant"],
    criticite: 5,
    typologies: { travail: true, erp: true, igh: true, habitation: true },
    categoriesEquipement: ["ASCENSEUR"],
    notesInternes:
      "Obligation permanente de moyens (contrat d'astreinte), non planifiée dans le calendrier.\n\nAmendement 2026-08-25 : R. 134-6 (version au 01/04/2026, décret 2026-166) impose la vérification des moyens d'alerte et de communication à chaque visite (six semaines) et un volet sur l'obsolescence des réseaux RTC/3G ; R. 134-11 a) vise la compatibilité de ces moyens avec les autres réseaux. Non modélisé comme échéance propre : couvert par le contrat d'entretien.",
  },
];
