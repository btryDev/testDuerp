import * as XLSX from "xlsx";

/**
 * Parseur de DUERP Excel / CSV.
 *
 * Colonnes attendues (détection flexible, insensible à la casse/accents) :
 *   - Unité de travail (obligatoire)
 *   - Risque (obligatoire)
 *   - Description (optionnel)
 *   - Gravité (1-4) (obligatoire)
 *   - Probabilité (1-4) (obligatoire)
 *   - Maîtrise (1-4) (obligatoire)
 *   - Mesures existantes (optionnel, séparées par | ou ;)
 *
 * On ne fait AUCUN LLM pour mapper : c'est du matching exact de noms de
 * colonnes normalisés (cf. CLAUDE.md « Pas de LLM »). Si une colonne
 * obligatoire n'est pas détectée, on remonte un mapping manuel à l'UI.
 */

export type LigneParsee = {
  ligne: number; // index dans le fichier (1-based, en-tête exclue)
  uniteTravail: string;
  libelleRisque: string;
  description: string | null;
  gravite: number;
  probabilite: number;
  maitrise: number;
  mesuresExistantes: string[];
};

export type ErreurLigne = {
  ligne: number;
  champ: string;
  message: string;
};

export type ResultatParsing = {
  lignes: LigneParsee[];
  erreurs: ErreurLigne[];
  totalLignes: number;
  mappingDetecte: Record<ColonneAttendue, string | null>;
};

export type ColonneAttendue =
  | "uniteTravail"
  | "libelleRisque"
  | "description"
  | "gravite"
  | "probabilite"
  | "maitrise"
  | "mesures";

const ALIASES: Record<ColonneAttendue, readonly string[]> = {
  uniteTravail: [
    "unite de travail",
    "unite",
    "poste",
    "atelier",
    "lieu",
    "zone",
  ],
  libelleRisque: ["risque", "libelle", "libelle du risque", "danger"],
  description: ["description", "detail", "precision", "commentaire"],
  gravite: ["gravite", "severite", "g"],
  probabilite: ["probabilite", "frequence", "occurrence", "p"],
  maitrise: ["maitrise", "niveau de maitrise", "m"],
  mesures: [
    "mesures existantes",
    "mesures",
    "actions existantes",
    "moyens de prevention",
    "moyens",
  ],
};

function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detecterColonnes(
  enTetes: string[],
): Record<ColonneAttendue, string | null> {
  const entries = enTetes.map((e) => ({ original: e, normal: normaliser(e) }));
  const result = {} as Record<ColonneAttendue, string | null>;
  // Passe 1 : match exact. Passe 2 : match par inclusion, mais uniquement
  // pour les alias ≥ 3 caractères (évite que « p » matche « description »).
  for (const col of Object.keys(ALIASES) as ColonneAttendue[]) {
    const aliases = ALIASES[col] as readonly string[];
    let match =
      entries.find((e) => aliases.includes(e.normal)) ??
      entries.find((e) =>
        aliases.some((a) => a.length >= 3 && e.normal.includes(a)),
      );
    result[col] = match?.original ?? null;
  }
  return result;
}

function validerEntier(
  val: unknown,
  min: number,
  max: number,
): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n =
    typeof val === "number" ? val : parseInt(String(val).trim(), 10);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n);
}

function splitMesures(val: unknown): string[] {
  if (val === null || val === undefined || val === "") return [];
  return String(val)
    .split(/[|;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse un buffer (ou Uint8Array) Excel ou CSV.
 * Pour CSV : le type MIME `text/csv` est passé en tant que fichier Excel
 * via XLSX — la lib gère les deux uniformément.
 */
export function parserFichierDuerp(
  buffer: ArrayBuffer | Buffer | Uint8Array,
  mappingUtilisateur?: Partial<Record<ColonneAttendue, string>>,
): ResultatParsing {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    return {
      lignes: [],
      erreurs: [{ ligne: 0, champ: "fichier", message: "Fichier vide" }],
      totalLignes: 0,
      mappingDetecte: {} as Record<ColonneAttendue, string | null>,
    };
  }
  const sheet = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false, // string-ify les nombres pour traitement uniforme
  });

  if (rows.length === 0) {
    return {
      lignes: [],
      erreurs: [
        { ligne: 0, champ: "fichier", message: "Aucune ligne de données" },
      ],
      totalLignes: 0,
      mappingDetecte: {} as Record<ColonneAttendue, string | null>,
    };
  }

  const enTetes = Object.keys(rows[0] ?? {});
  const auto = detecterColonnes(enTetes);
  const mapping: Record<ColonneAttendue, string | null> = {
    ...auto,
    ...Object.fromEntries(
      Object.entries(mappingUtilisateur ?? {}).filter(([, v]) => v != null),
    ),
  };

  const lignes: LigneParsee[] = [];
  const erreurs: ErreurLigne[] = [];

  rows.forEach((row, idx) => {
    const numLigne = idx + 2; // en-tête = ligne 1
    const ut = mapping.uniteTravail ? row[mapping.uniteTravail] : null;
    const risque = mapping.libelleRisque ? row[mapping.libelleRisque] : null;

    const uniteStr = ut ? String(ut).trim() : "";
    const risqueStr = risque ? String(risque).trim() : "";

    // Ligne entièrement vide → on skippe sans erreur
    if (!uniteStr && !risqueStr) return;

    let skip = false;
    if (!uniteStr) {
      erreurs.push({
        ligne: numLigne,
        champ: "uniteTravail",
        message: "Unité de travail manquante",
      });
      skip = true;
    }
    if (!risqueStr) {
      erreurs.push({
        ligne: numLigne,
        champ: "libelleRisque",
        message: "Libellé du risque manquant",
      });
      skip = true;
    }

    const g = mapping.gravite
      ? validerEntier(row[mapping.gravite], 1, 4)
      : null;
    const p = mapping.probabilite
      ? validerEntier(row[mapping.probabilite], 1, 4)
      : null;
    const m = mapping.maitrise
      ? validerEntier(row[mapping.maitrise], 1, 4)
      : null;

    if (g === null) {
      erreurs.push({
        ligne: numLigne,
        champ: "gravite",
        message: "Gravité attendue : entier entre 1 et 4",
      });
      skip = true;
    }
    if (p === null) {
      erreurs.push({
        ligne: numLigne,
        champ: "probabilite",
        message: "Probabilité attendue : entier entre 1 et 4",
      });
      skip = true;
    }
    if (m === null) {
      erreurs.push({
        ligne: numLigne,
        champ: "maitrise",
        message: "Maîtrise attendue : entier entre 1 et 4",
      });
      skip = true;
    }

    if (skip) return;

    const desc = mapping.description ? row[mapping.description] : null;
    const mesures = mapping.mesures ? splitMesures(row[mapping.mesures]) : [];

    lignes.push({
      ligne: numLigne,
      uniteTravail: uniteStr,
      libelleRisque: risqueStr,
      description: desc ? String(desc).trim() || null : null,
      gravite: g as number,
      probabilite: p as number,
      maitrise: m as number,
      mesuresExistantes: mesures,
    });
  });

  return {
    lignes,
    erreurs,
    totalLignes: rows.length,
    mappingDetecte: mapping,
  };
}

/**
 * Agrège une liste de lignes parsées en un plan d'import : on regroupe les
 * risques par unité de travail, en dédupliquant l'unité par nom normalisé.
 */
export type PlanImport = {
  unites: Array<{
    nom: string;
    risques: LigneParsee[];
  }>;
  nbRisques: number;
  nbMesures: number;
};

export function planifierImport(lignes: LigneParsee[]): PlanImport {
  const mapUnites = new Map<string, { nom: string; risques: LigneParsee[] }>();
  for (const l of lignes) {
    const cle = normaliser(l.uniteTravail);
    const existing = mapUnites.get(cle);
    if (existing) {
      existing.risques.push(l);
    } else {
      mapUnites.set(cle, { nom: l.uniteTravail, risques: [l] });
    }
  }
  const unites = Array.from(mapUnites.values());
  return {
    unites,
    nbRisques: lignes.length,
    nbMesures: lignes.reduce((a, l) => a + l.mesuresExistantes.length, 0),
  };
}
