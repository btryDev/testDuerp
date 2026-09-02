// Corpus : articles cités par le référentiel, dépouillés le 26 août 2026.
//
// Étendue « articles_cites » : cette liste ne contient QUE les articles que le
// référentiel cite. Elle ne dit rien de ce que le texte contient par ailleurs,
// et ne peut donc jamais se déclarer complète. C'est un remboursement de dette,
// pas une preuve d'exhaustivité.

import type { Corpus } from "./types";

export const ARRETE_2011_12_14_ECLAIRAGE: Corpus = {
  id: "arrete-2011-12-14-eclairage",
  intitule:
    "Arrêté du 14 décembre 2011 — éclairage de sécurité des lieux de travail",
  url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000025055364/",
  etendue: "articles_cites",
  portee:
    "Pris pour l'application de R. 4227-14 du Code du travail. Fixe les essais mensuel et semestriel de l'éclairage de sécurité.",
  articles: [
    {
      ref: "Arrêté 2011-12-14 art. 1",
      intitule: "Objet de l'arrêté et articulation avec le règlement ERP",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025072663",
      prescrit:
        "Fixe le champ : l'arrêté régit la conception, la mise en œuvre, l'exploitation et la maintenance de l'éclairage de sécurité des établissements de R. 4227-14. Alinéa 2 : dans un ERP, pour les locaux dont la fonction essentielle est de recevoir du public et les dégagements accessibles au public, le règlement de sécurité ERP est SEUL applicable. Alinéa 3 : cantines, restaurants, salles de conférences et de réunions suivent la réglementation ERP lorsqu'elle est plus contraignante — une règle comparative, local par local.",
      citationCle:
        "Le présent arrêté fixe les règles de conception et de mise en œuvre ainsi que les conditions d'exploitation et de maintenance de l'éclairage de sécurité des établissements soumis aux dispositions de l'article R. 4227-14 du code du travail. Dans les établissements recevant du public, pour les locaux dont la fonction essentielle est de recevoir du public et pour les dégagements accessibles au public, les dispositions du règlement de sécurité relatif à de tels établissements sont seules applicables à l'éclairage de sécurité de ces locaux ou dégagements. Dans les établissements comportant des locaux tels que cantines, restaurants, salles de conférences, salles de réunions, l'éclairage de sécurité de ces locaux doit être réalisé conformément à la réglementation relative aux établissements recevant du public lorsque celle-ci s'avère plus contraignante.",
      versionEnVigueur: "2011-12-31",
      // Page de l'article : aucune ligne « Modifié par » ni « Création ».
      // Version d'origine de l'arrêté du 14 décembre 2011, en vigueur depuis le 31/12/2011.
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: [
        "incendie-travail-eclairage-securite-autonomie-semestrielle",
        "incendie-travail-eclairage-securite-essai-mensuel",
      ],
    },
    {
      ref: "Arrêté 2011-12-14 art. 11",
      intitule: "Vérifications périodiques de fonctionnement de l'éclairage de sécurité",
      url: "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025072657",
      prescrit:
        "L'employeur procède, au titre de la maintenance de R. 4226-7 : une fois par mois, au passage en position de fonctionnement et à l'allumage de toutes les lampes, et au contrôle de la commande de mise en repos à distance et de la remise automatique en veille ; une fois tous les six mois, au contrôle de l'autonomie d'au moins une heure. En cas de blocs autonomes SATI conformes à la NF C 71-820 ou équivalente, ces opérations peuvent être automatiques. Le résultat est porté au registre de R. 4226-19, auquel une notice de maintenance est annexée. C'est cet article — pas R. 4227-14 — qui porte les deux périodicités.",
      citationCle:
        "Dans le cadre de la maintenance prescrite à l'article R. 4226-7 du code du travail, l'employeur procède aux vérifications de fonctionnement périodiques suivantes : Une fois par mois : a) Du passage à la position de fonctionnement en cas de défaillance de l'alimentation normale et de l'allumage de toutes les lampes (le fonctionnement doit être strictement limité au temps nécessaire au contrôle visuel) ; b) De l'efficacité de la commande de mise en position de repos à distance et de la remise automatique en position de veille au retour de l'alimentation normale. Une fois tous les six mois, de l'autonomie d'au moins une heure. Dans les établissements comportant des périodes de fermeture, ces opérations doivent être effectuées de telle manière qu'au début de chaque période d'ouverture l'installation d'éclairage ait retrouvé l'autonomie prescrite. Lorsque l'éclairage de sécurité est constitué de blocs autonomes, les opérations précédentes peuvent être effectuées automatiquement par l'utilisation de blocs autonomes comportant un système automatique de test intégré (SATI) conforme à la norme NF C 71-820 ou à toute autre norme ou spécification technique équivalente d'un autre Etat appartenant à l'Espace économique européen. Le résultat des opérations précédentes doit être mentionné sur le registre prévu à l'article R. 4226-19 du code du travail. Une notice descriptive des conditions de maintenance et de fonctionnement doit être annexée au registre précédent. Elle devra comporter les caractéristiques des pièces de rechange.",
      reserve:
        "La norme NF C 71-820 visée par l'alinéa SATI est une norme privée : elle ne fonde rien par elle-même, c'est l'article qui rend l'automatisation possible. L'exception SATI n'est encodée dans aucune condition du référentiel — aucune propriété d'équipement ne porte la question — et une installation entièrement SATI reçoit donc les mêmes échéances mensuelle et semestrielle qu'une installation testée à la main.",
      versionEnVigueur: "2011-12-31",
      // Page de l'article : aucune ligne « Modifié par » ni « Création ».
      // Version d'origine de l'arrêté du 14 décembre 2011, en vigueur depuis le 31/12/2011.
      modifiePar: null,
      luLe: "2026-09-01",
      lecture: "premiere_main",
      statut: "retenu",
      obligations: [
        "incendie-travail-eclairage-securite-autonomie-semestrielle",
        "incendie-travail-eclairage-securite-essai-mensuel",
      ],
    },
  ],
};
