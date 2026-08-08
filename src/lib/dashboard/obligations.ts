// Matrice « Vos documents, en un coup d'œil » — le tableau en pastilles
// du board éditorial (4a).
//
// Règle de conduite, héritée du CLAUDE.md (« l'outil ne dit jamais vous
// êtes conforme ») : chaque cellule est un fait vérifiable sur les données
// de l'établissement, jamais un jugement de conformité. Trois états
// seulement :
//
//   ok   — le fait est établi (le document existe, il est récent…)
//   todo — le fait n'est pas établi ; c'est ce qu'il reste à faire
//   na   — la colonne n'a pas de sens pour cette ligne
//
// `na` existe précisément pour ne pas afficher un rond vert par défaut là
// où l'on ne mesure rien : un tableau tout vert qui ment est pire qu'un
// tableau troué.

export type EtatCellule = "ok" | "todo" | "na";

export const COLONNES_MATRICE = ["En place", "À jour", "Sans retard"] as const;

export type LigneMatrice = {
  id: "duerp" | "registre" | "verifications" | "actions";
  libelle: string;
  href: string;
  cellules: [EtatCellule, EtatCellule, EtatCellule];
};

export type EntreeMatrice = {
  etablissementId: string;
  duerp: { existe: boolean; estAJour: boolean; duerpId: string | null };
  nbRapports: number;
  nbVerifs: number;
  /** Jours écoulés depuis le dernier rapport déposé, null si aucun. */
  jourDernierRapport: number | null;
  compteurs: {
    verifsEnRetard: number;
    verifsAPlanifier: number;
    actionsOuvertes: number;
    actionsEnCours: number;
    actionsEnRetard: number;
    actionsLeveesRecemment: number;
  };
};

/** Un registre alimenté dans l'année est considéré « à jour ». */
export const SEUIL_REGISTRE_JOURS = 365;

function oui(v: boolean): EtatCellule {
  return v ? "ok" : "todo";
}

export function construireMatrice(e: EntreeMatrice): LigneMatrice[] {
  const base = `/etablissements/${e.etablissementId}`;
  const { compteurs: c } = e;
  const totalActions =
    c.actionsOuvertes + c.actionsEnCours + c.actionsLeveesRecemment;

  return [
    {
      id: "duerp",
      libelle: "DUERP",
      href: e.duerp.duerpId ? `/duerp/${e.duerp.duerpId}` : `${base}/duerp`,
      cellules: [
        oui(e.duerp.existe),
        oui(e.duerp.estAJour),
        // Un DUERP n'a pas d'échéances propres : « à jour » couvre déjà
        // la seule notion de retard qui le concerne.
        "na",
      ],
    },
    {
      id: "registre",
      libelle: "Registre de sécurité",
      href: `${base}/registre`,
      cellules: [
        oui(e.nbRapports > 0),
        oui(
          e.jourDernierRapport !== null &&
            e.jourDernierRapport <= SEUIL_REGISTRE_JOURS,
        ),
        "na",
      ],
    },
    {
      id: "verifications",
      libelle: "Vérifications",
      href: `${base}/calendrier`,
      cellules: [
        oui(e.nbVerifs > 0),
        // « À jour » ici = plus rien en attente de programmation.
        oui(e.nbVerifs > 0 && c.verifsAPlanifier === 0),
        oui(e.nbVerifs > 0 && c.verifsEnRetard === 0),
      ],
    },
    {
      id: "actions",
      libelle: "Plan d'actions",
      href: `${base}/actions`,
      cellules: [
        oui(totalActions > 0),
        // Le plan n'a pas de date de péremption propre.
        "na",
        oui(totalActions > 0 && c.actionsEnRetard === 0),
      ],
    },
  ];
}

/** Nombre de faits restant à établir — sert d'accroche sous le tableau. */
export function compterRestes(lignes: LigneMatrice[]): number {
  return lignes.reduce(
    (n, l) => n + l.cellules.filter((c) => c === "todo").length,
    0,
  );
}
