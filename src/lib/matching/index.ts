export {
  determineObligationsApplicables,
  evaluerObligation,
  matchTypologie,
  type DetermineOptions,
  type ResultatTypologie,
} from "./engine";
export {
  appliquerPrescriptions,
  PREFIXE_PRESCRIPTION,
  estObligationSurMesure,
  estPeriodicitePlusStricte,
  prescriptionEnVigueur,
  type ResultatPrescriptions,
} from "./prescriptions";
export type {
  EquipementMatching,
  EtablissementMatching,
  ObligationApplicable,
  ObligationSurMesureApplicable,
  PrescriptionIgnoree,
  PrescriptionMatching,
  SurchargePeriodicite,
} from "./types";
