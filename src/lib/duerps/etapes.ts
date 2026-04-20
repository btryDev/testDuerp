import type { Etape } from "@/components/duerps/WizardSteps";

export type EtapeId =
  | "secteur"
  | "unites"
  | "risques"
  | "transverses"
  | "synthese";

export function construireEtapes(
  duerpId: string,
  etapeActuelle: EtapeId,
  progression: {
    secteurOk: boolean;
    unitesOk: boolean;
    risquesOk: boolean;
    transversesOk: boolean;
  },
): Etape[] {
  const atteinte = (id: EtapeId) => {
    if (id === "secteur") return true;
    if (id === "unites") return progression.secteurOk;
    if (id === "risques") return progression.unitesOk;
    // Les étapes suivantes ne requièrent plus que « risques » soit complet :
    // une unité peut légitimement être sans risque (cf. INRS ED 840) si
    // l'évaluation conclut à l'absence de risque significatif — on laisse
    // passer et on affiche simplement un avertissement dans l'UI.
    if (id === "transverses") return progression.unitesOk;
    if (id === "synthese") return progression.transversesOk;
    return false;
  };
  const liste: { id: EtapeId; libelle: string }[] = [
    { id: "secteur", libelle: "Secteur d'activité" },
    { id: "unites", libelle: "Unités de travail" },
    { id: "risques", libelle: "Risques par unité" },
    { id: "transverses", libelle: "Questions transverses" },
    { id: "synthese", libelle: "Synthèse" },
  ];
  // On masque l'étape « Secteur » quand elle a été résolue (auto depuis le NAF
  // ou déjà traversée). Elle reste visible uniquement si elle est l'actuelle.
  const visibles = liste.filter(
    (e) => e.id !== "secteur" || etapeActuelle === "secteur",
  );
  return visibles.map((e) => ({
    id: e.id,
    libelle: e.libelle,
    href: `/duerp/${duerpId}/${e.id}`,
    atteinte: atteinte(e.id),
    actuelle: e.id === etapeActuelle,
  }));
}
