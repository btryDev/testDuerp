/**
 * État du wizard d'onboarding — partagé entre toutes les étapes.
 * Reste structurellement aligné avec `onboardingSchema` côté serveur,
 * mais tolère les valeurs intermédiaires (string vide, undefined) tant
 * que l'étape correspondante n'a pas été validée.
 */
export type OnboardingState = {
  raisonSociale: string;
  siret: string;

  raisonDisplay: string;
  adresse: string;
  codeNaf: string;
  effectifSurSite: string; // saisie texte, convertie en number au submit

  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;

  typeErp: string;
  categorieErp: string;
  classeIgh: string;
};

export const VALEURS_INITIALES: OnboardingState = {
  raisonSociale: "",
  siret: "",
  raisonDisplay: "",
  adresse: "",
  codeNaf: "",
  effectifSurSite: "",
  estEtablissementTravail: true,
  estERP: false,
  estIGH: false,
  estHabitation: false,
  typeErp: "",
  categorieErp: "",
  classeIgh: "",
};

export type StepProps = {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  /** Erreurs par champ, renvoyées côté serveur après l'étape finale. */
  errors?: Record<string, string | undefined>;
};
