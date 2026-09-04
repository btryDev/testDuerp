// Qui la page publique du registre d'accessibilité désigne — et c'est
// l'établissement, jamais l'entreprise.
//
// ─────────────────────────────────────────────────────────────────────────────
// LE DÉFAUT QUE CE MODULE EXISTE POUR EMPÊCHER
// ─────────────────────────────────────────────────────────────────────────────
//
// Les deux surfaces publiques du module — la page consultable et l'affiche A4
// qu'on colle à l'entrée — mettaient `entreprise.raisonSociale` en titre et
// `etablissement.raisonDisplay` en sous-titre gris. Relevé à l'écran le
// 2026-09-04, sur le compte de démonstration à deux établissements :
//
//   /accessibilite/le-comptoir-des-halles-600027
//     titre « Le Comptoir des Halles », sous-titre « Le Comptoir des Halles »
//   /accessibilite/le-comptoir-des-halles-quai-nord-600027
//     titre « Le Comptoir des Halles », sous-titre « … — Quai Nord »
//
// En mono-site — la quasi-totalité de la cible — le visiteur lit DEUX FOIS le
// même nom. En multi-site, le QR code collé au 3 quai Nord ouvre une page
// titrée du nom d'un autre lieu, l'adresse réelle en petit gris dessous.
//
// LE SUJET D'UNE PAGE ATTEINTE DEPUIS LA RUE EST L'ÉTABLISSEMENT. C'est lui
// qu'on cherche, c'est devant lui qu'on se tient, et c'est lui que l'arrêté du
// 19 avril 2017 désigne : son article 1er énumère les pièces que « le registre
// public d'accessibilité » contient « pour tous les établissements recevant du
// public », et son article 3 le veut consultable « au principal point d'accueil
// accessible DE L'ÉTABLISSEMENT ». Le registre est celui d'un lieu.
//
// ─────────────────────────────────────────────────────────────────────────────
// POURQUOI L'ENTREPRISE NE DESCEND PAS EN SOUS-TITRE
// ─────────────────────────────────────────────────────────────────────────────
//
// Déplacer la répétition ne la retire pas. En mono-site les deux noms sont le
// même : une seconde ligne n'apprendrait rien et ferait croire à deux entités.
// Et en multi-site le nom du dossier porte presque toujours celui de la maison
// — « Le Comptoir des Halles — Quai Nord » —, donc le répéter dessous
// n'informe pas davantage.
//
// La règle est donc : **l'exploitant n'apparaît que lorsque le titre ne le
// nomme pas déjà.** Un restaurant « Chez Marcel » exploité par la « SARL
// Dupont » le dit ; « Le Comptoir des Halles — Quai Nord » exploité par « Le
// Comptoir des Halles » se tait. Ce n'est pas une économie de place : une ligne
// qui répète la précédente apprend au lecteur à ne plus lire les lignes.
//
// ─────────────────────────────────────────────────────────────────────────────
// ET AUCUN SIRET — CE N'EST PAS UN OUBLI
// ─────────────────────────────────────────────────────────────────────────────
//
// Le pied de page publiait `entreprise.siret`. `Etablissement` n'a pas de
// colonne SIRET : les deux registres publics d'un même compte publiaient donc
// le MÊME numéro, alors qu'un SIRET identifie un établissement — les neuf
// premiers chiffres sont le SIREN commun, les cinq derniers, le NIC, désignent
// le site. Au plus un des deux registres disait vrai.
//
// Il n'y a pas de correction possible par le modèle *ici*, parce qu'il n'y a
// rien à corriger : **l'arrêté du 19 avril 2017 ne demande aucun SIRET.** Son
// article 1er énumère neuf pièces et une attestation de formation, toutes
// documentaires — attestations, calendrier, bilan, dérogations, notice,
// document d'aide, modalités de maintenance. Aucun identifiant d'immatriculation.
// Le verbatim est au corpus (`referentiels/corpus/accessibilite-handicap.ts`,
// `ARRETE_2017_04_19_REGISTRE_ACCESSIBILITE`, lu le 2026-09-03) : la vérification
// se refait sans rouvrir Légifrance.
//
// Le numéro est donc parti, et le champ n'a pas été ajouté à `Etablissement`.
// Une colonne nullable aurait laissé tous les dossiers existants vides — la
// page devant de toute façon savoir se taire —, en échange d'une migration,
// d'un champ de fiche et d'une surface de saisie, pour une donnée que le texte
// ne réclame pas sur ce document. Publier un identifiant faux sur un registre
// que la loi rend public est pire que n'en publier aucun, et l'erreur est
// invisible pour qui la subit : l'exploitant ne scanne pas son propre QR code,
// et le visiteur n'a aucun moyen de savoir.
//
// Le SIREN — les neuf premiers chiffres, eux communs à toute l'entreprise — a
// été envisagé et écarté : il serait vrai, mais l'arrêté ne le demande pas
// davantage, et le SIRET saisi à l'onboarding n'est vérifié par rien (le
// rapprochement SIRENE est hors périmètre). On ne remplace pas un identifiant
// faux par un identifiant dérivé d'une saisie libre.

/** Ce que la surface publique doit connaître de l'établissement, et rien de plus. */
export type EtablissementPublic = {
  raisonDisplay: string;
  adresse: string;
  entreprise: { raisonSociale: string };
};

export type IdentitePublique = {
  /** Le titre de la page et de l'affiche. Toujours l'établissement. */
  titre: string;
  /**
   * L'exploitant, quand il ajoute quelque chose au titre. `null` sinon — et
   * `null` est le cas courant, pas le cas dégradé.
   */
  exploitant: string | null;
  /** L'adresse du lieu, celle où se tient le visiteur. */
  adresse: string;
};

/**
 * Réduit un nom à ce qui permet de dire « c'est le même » : casse, accents,
 * espaces multiples et tirets typographiques ne distinguent rien pour un
 * lecteur. « Le Comptoir des Halles — Quai Nord » et « LE COMPTOIR DES
 * HALLES » se reconnaissent donc l'un dans l'autre.
 */
function normaliser(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’'`]/g, "'")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Ce que les surfaces publiques du registre affichent en tête — dérivé de
 * l'établissement, jamais recopié depuis l'entreprise par la surface.
 *
 * Les deux surfaces passent par ici (`app/accessibilite/[slug]/page.tsx` et
 * `app/api/accessibilite/[slug]/affiche/route.ts`) : c'est ce qui fait qu'une
 * seule décision est prise, à un seul endroit, et que `sujet-public.test.ts`
 * peut vérifier qu'aucune surface n'en prend une autre dans son coin.
 */
export function identitePublique(etab: EtablissementPublic): IdentitePublique {
  const titre = etab.raisonDisplay.trim();
  const exploitant = etab.entreprise.raisonSociale.trim();

  const titreNu = normaliser(titre);
  const exploitantNu = normaliser(exploitant);

  return {
    titre,
    exploitant:
      exploitantNu.length > 0 && !titreNu.includes(exploitantNu)
        ? exploitant
        : null,
    adresse: etab.adresse,
  };
}
