/**
 * État du wizard d'onboarding — partagé entre toutes les étapes.
 * Reste structurellement aligné avec `onboardingSchema` côté serveur,
 * mais tolère les valeurs intermédiaires (string vide, undefined) tant
 * que l'étape correspondante n'a pas été validée.
 */
export type OnboardingState = {
  raisonSociale: string;
  siret: string;

  // Adresse structurée — validée champ par champ côté client, recomposée
  // en chaîne unique au submit pour alimenter Entreprise.adresse /
  // Etablissement.adresse (colonne `adresse` unique en base, ADR-001).
  adresseRue: string;
  adresseCodePostal: string;
  adresseVille: string;

  codeNaf: string;
  effectifSurSite: string; // saisie texte, convertie en number au submit

  // Champ de R. 4227-34 CT (alarme sonore → consigne → exercices) : personnes
  // habituellement présentes, salariés + public ; matières R. 4227-22.
  // Saisie texte ; "" = non renseigné, jamais un défaut.
  personnesPresentesHabituellement: string;
  manipuleMatieresR422722: "" | "oui" | "non";

  // Effectif du public déclaré pour la catégorie ERP (R. 143-19) : total et,
  // si le seuil du type en dépend, sous-sol et étages. Client seulement :
  // sert à la déduction, la catégorie retenue est `categorieErp`.
  effectifPublicTotal: string;
  effectifPublicSousSol: string;
  effectifPublicEtages: string;

  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;

  typeErp: string;
  categorieErp: string;
  classeIgh: string;
  /** Famille au sens de l'arrêté du 31 janvier 1986 — requise si `estHabitation`. */
  familleHabitation: string;
};

export const VALEURS_INITIALES: OnboardingState = {
  raisonSociale: "",
  siret: "",
  adresseRue: "",
  adresseCodePostal: "",
  adresseVille: "",
  codeNaf: "",
  effectifSurSite: "",
  personnesPresentesHabituellement: "",
  manipuleMatieresR422722: "",
  effectifPublicTotal: "",
  effectifPublicSousSol: "",
  effectifPublicEtages: "",
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
  typeErp: "",
  categorieErp: "",
  classeIgh: "",
  familleHabitation: "",
};

export type StepProps = {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  /** Erreurs par champ, renvoyées côté serveur après l'étape finale. */
  errors?: Record<string, string | undefined>;
};
