import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

/**
 * Règles de pré-remplissage du parc d'équipements d'un établissement, sur la
 * base de son code NAF et de sa typologie réglementaire (ADR-004).
 *
 * Le pré-remplissage est **une suggestion** : l'utilisateur peut décocher
 * n'importe quelle catégorie et en ajouter d'autres. On ne crée aucun
 * équipement automatiquement — on propose une liste de cases à cocher qui,
 * une fois validée, crée les `Equipement` correspondants.
 *
 * Sources de la logique métier :
 *   - Code NAF 56.xx (restauration) → cuisine professionnelle → hotte,
 *     appareils de cuisson, VMC, installation électrique, extincteurs.
 *   - Code NAF 47.xx (commerce de détail) → ERP fréquent → extincteurs,
 *     BAES, alarme, installation électrique, ventilation éventuelle.
 *   - Tertiaire / bureau → installation électrique, BAES, alarme, VMC,
 *     éventuels portes automatiques et ascenseurs si bâtiment collectif.
 *   - Typologie ERP → extincteurs, BAES, alarme, SSI systématiques.
 *   - Typologie IGH → SSI, désenfumage, ascenseurs, alarme.
 */

export type Entree = {
  categorie: CategorieEquipement;
  libelle: string;
  raison: string;
};

export type ContexteEtablissement = {
  codeNaf?: string | null;
  estEtablissementTravail: boolean;
  estERP: boolean;
  estIGH: boolean;
  estHabitation: boolean;
};

function normNaf(naf: string | null | undefined): string {
  return (naf ?? "").trim().toUpperCase();
}

function isRestauration(naf: string): boolean {
  return naf.startsWith("56.");
}

function isCommerce(naf: string): boolean {
  return naf.startsWith("47.");
}

function isBureau(naf: string): boolean {
  // On inclut volontairement un spectre large : conseil, comm, services,
  // administration. Liste à affiner à mesure que de nouveaux secteurs
  // rejoignent le MVP.
  return (
    naf.startsWith("62.") || // info/IT
    naf.startsWith("63.") || // services info
    naf.startsWith("69.") || // juridique/compta
    naf.startsWith("70.") || // conseil
    naf.startsWith("71.") || // ingénierie
    naf.startsWith("73.") || // publicité
    naf.startsWith("74.") || // design
    naf.startsWith("82.")    // admin / centres d'appel
  );
}

/**
 * Renvoie la liste des équipements suggérés pour un établissement donné.
 *
 * Le moteur est **pur** (pas d'accès DB) pour rester testable. L'UI de
 * l'étape 4 l'appelle côté serveur au rendu du wizard de déclaration.
 */
export function suggererEquipements(ctx: ContexteEtablissement): Entree[] {
  const naf = normNaf(ctx.codeNaf);
  const set = new Map<string, Entree>();

  const ajoute = (e: Entree) => {
    // Déduplication par catégorie : une suggestion par catégorie dans l'UI.
    // Plusieurs règles peuvent proposer la même catégorie — on garde la
    // première rencontrée (ordre de priorité : base → ERP → IGH → travail →
    // sectoriel → habitation).
    if (!set.has(e.categorie)) set.set(e.categorie, e);
  };

  // ---------------------------------------------------------------------------
  // Règles de base — quasi universelles dès qu'il y a un bâtiment
  // ---------------------------------------------------------------------------
  if (ctx.estEtablissementTravail || ctx.estERP || ctx.estIGH) {
    ajoute({
      categorie: "INSTALLATION_ELECTRIQUE",
      libelle: "Installation électrique principale",
      raison:
        "Vérification périodique annuelle (R. 4226-16 CT) et/ou annuelle/quinquennale selon régime ERP.",
    });
  }

  // ---------------------------------------------------------------------------
  // Typologie ERP → moyens de secours de base
  // ---------------------------------------------------------------------------
  if (ctx.estERP) {
    ajoute({
      categorie: "EXTINCTEUR",
      libelle: "Extincteurs portatifs",
      raison:
        "Vérification annuelle (arrêté 25 juin 1980, art. MS 38 § 2 et MS 73).",
    });
    ajoute({
      categorie: "BAES",
      libelle: "Éclairage de sécurité (BAES)",
      raison:
        "Vérification annuelle (arrêté 25 juin 1980, art. EC 14 et EC 15).",
    });
    ajoute({
      categorie: "ALARME_INCENDIE",
      libelle: "Système de sécurité incendie (SSI / alarme)",
      raison:
        "Vérification annuelle (arrêté 25 juin 1980, art. MS 73 § 1).",
    });
  }

  // ---------------------------------------------------------------------------
  // Typologie IGH → moyens renforcés
  // ---------------------------------------------------------------------------
  if (ctx.estIGH) {
    ajoute({
      categorie: "DESENFUMAGE",
      libelle: "Désenfumage mécanique",
      raison:
        "Arrêté 30 décembre 2011 (IGH) — vérification annuelle (GH 60 s.).",
    });
    ajoute({
      categorie: "ASCENSEUR",
      libelle: "Ascenseur(s)",
      raison: "Équipement quasi systématique en IGH (CCH R. 134).",
    });
  }

  // ---------------------------------------------------------------------------
  // Travail (hors spécialisation) → aération obligatoire dans la plupart des
  // locaux de travail (R. 4222-20 et arrêté 8 octobre 1987).
  // ---------------------------------------------------------------------------
  if (ctx.estEtablissementTravail) {
    ajoute({
      categorie: "VMC",
      libelle: "Ventilation des locaux de travail",
      raison:
        "Contrôle périodique annuel (R. 4222-20 CT, arrêté 8 octobre 1987).",
    });
    ajoute({
      categorie: "EXTINCTEUR",
      libelle: "Extincteurs de l'établissement",
      raison:
        "Moyens de lutte obligatoires (R. 4227-28 CT), vérification annuelle.",
    });
  }

  // ---------------------------------------------------------------------------
  // Règles sectorielles (NAF)
  // ---------------------------------------------------------------------------
  if (isRestauration(naf)) {
    ajoute({
      categorie: "HOTTE_PRO",
      libelle: "Hotte d'extraction cuisine",
      raison:
        "Ramonage et vérification annuelle (arrêté 25 juin 1980, art. GC 20).",
    });
    ajoute({
      categorie: "APPAREIL_CUISSON_ERP",
      libelle: "Appareils de cuisson professionnels",
      raison: "Section GC du règlement ERP — à vérifier annuellement.",
    });
  }

  if (isCommerce(naf)) {
    // Les commerces de détail ont en général une installation frigorifique
    // et un système de sécurité incendie. On limite la suggestion aux
    // catégories couvertes par le MVP V2.
    ajoute({
      categorie: "BAES",
      libelle: "Éclairage de sécurité (BAES)",
      raison:
        "La plupart des commerces sont ERP — éclairage de sécurité vérifié annuellement.",
    });
  }

  if (isBureau(naf)) {
    ajoute({
      categorie: "BAES",
      libelle: "Éclairage de sécurité (BAES)",
      raison:
        "Bâtiment tertiaire — vérification annuelle des blocs de sécurité.",
    });
    ajoute({
      categorie: "ALARME_INCENDIE",
      libelle: "Alarme incendie",
      raison:
        "Obligatoire dès que l'établissement emploie ≥ 50 salariés ou manipule des matières inflammables (R. 4227-29).",
    });
  }

  // ---------------------------------------------------------------------------
  // Habitation
  // ---------------------------------------------------------------------------
  if (ctx.estHabitation) {
    ajoute({
      categorie: "VMC",
      libelle: "VMC de l'immeuble d'habitation",
      raison:
        "Si VMC-Gaz : entretien annuel obligatoire (arrêté 25 avril 1985).",
    });
  }

  return [...set.values()];
}
