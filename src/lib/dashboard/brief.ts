// Construction du « brief » — le bloc éditorial en tête du tableau de bord
// (direction 4a du design Rojer) : une phrase qui dit où on en est, un
// paragraphe qui la justifie, et les deux gestes à faire maintenant.
//
// Tout est dérivé des compteurs réels de l'établissement. Aucune chaîne
// n'est décorative : si un chiffre est à zéro, la clause disparaît plutôt
// que d'être remplacée par du remplissage.
//
// Le module est volontairement structurel (pas d'import de `queries.ts`,
// qui tirerait Prisma) pour rester testable en environnement `node`.

export type CompteursBrief = {
  verifsEnRetard: number;
  verifsAPlanifier: number;
  verifsSous30j: number;
  actionsEnRetard: number;
  actionsOuvertes: number;
  actionsEnCours: number;
};

export type DuerpBrief = {
  existe: boolean;
  estAJour: boolean;
};

export type RecoBrief = {
  kind:
    | "verif_depassee"
    | "action_en_retard"
    | "verif_proche"
    | "action_proche"
    | "duerp_a_jour";
  titre: string;
  href: string;
};

export type EntreeBrief = {
  aujourdhui: Date;
  compteurs: CompteursBrief;
  duerp: DuerpBrief;
  recommandations: RecoBrief[];
  nbRapports: number;
};

export type GesteBrief = {
  /** Sujet, raccourci pour tenir dans la pastille. */
  tag: string;
  /** Libellé complet, pour l'infobulle. */
  tagComplet: string;
  /** Verbe — ce qu'il y a à faire. */
  label: string;
  href: string;
  ton: "neutre" | "alerte";
};

export type Brief = {
  datePill: string;
  titre: string;
  paragraphe: string;
  gestes: GesteBrief[];
};

const UNITES = [
  "Zéro",
  "Une",
  "Deux",
  "Trois",
  "Quatre",
  "Cinq",
  "Six",
  "Sept",
  "Huit",
  "Neuf",
];

/** « Deux » plutôt que « 2 » jusqu'à neuf — registre éditorial du bloc. */
function enLettres(n: number): string {
  return n < UNITES.length ? UNITES[n] : String(n);
}

function formaterDate(d: Date): string {
  const s = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Verbe d'action associé à chaque type de recommandation. */
const VERBE: Record<RecoBrief["kind"], string> = {
  verif_depassee: "Programmer l'intervention",
  action_en_retard: "Replanifier",
  verif_proche: "Planifier",
  action_proche: "Suivre l'action",
  duerp_a_jour: "Mettre à jour",
};

const TONS_ALERTE: ReadonlySet<RecoBrief["kind"]> = new Set([
  "verif_depassee",
  "action_en_retard",
]);

/** Longueur au-delà de laquelle la pastille déborde la colonne du brief. */
export const LONGUEUR_TAG_MAX = 32;

/**
 * Réduit un libellé d'obligation à un sujet de pastille.
 *
 * Les libellés réglementaires sont des phrases entières — « Habilitation
 * électrique du personnel opérant sur ou à proximité d'installations
 * électriques ». Tel quel, le tag mange toute la largeur du hero. On retire
 * les préfixes de périodicité, on coupe à la première ponctuation forte,
 * puis on tronque proprement sur un mot.
 */
export function raccourcirTag(libelle: string): string {
  let t = libelle
    .replace(
      /^V[ée]rification\s+(p[ée]riodique\s+)?(annuelle|semestrielle|trimestrielle|mensuelle|hebdomadaire|biennale|triennale|quinquennale|d[ée]cennale)?\s*(de\s+la\s+|de\s+l['’]\s*|des\s+|de\s+|du\s+|d['’]\s*)?/i,
      "",
    )
    .replace(/^Entretien\s+(annuel|semestriel|trimestriel)?\s*(de\s+la\s+|de\s+l['’]\s*|des\s+|de\s+|du\s+)?/i, "")
    .replace(/^Maintien\s+en\s+bon\s+[ée]tat\s+/i, "")
    .replace(/^Exercice\s+(d['’]\s*)?/i, "")
    .trim();

  // Première proposition seulement : ce qui suit « du personnel opérant
  // sur… » est de la précision juridique, pas un sujet.
  t = t.split(/\s+(?:du personnel|des personnels|opérant|situé|destiné)\b/i)[0];
  t = t.split(/[,(]/)[0].trim();

  if (t.length > LONGUEUR_TAG_MAX) {
    const coupe = t.slice(0, LONGUEUR_TAG_MAX);
    const espace = coupe.lastIndexOf(" ");
    t = (espace > 12 ? coupe.slice(0, espace) : coupe).trim() + "…";
  }

  return t.charAt(0).toUpperCase() + t.slice(1);
}

function construireTitre(c: CompteursBrief): string {
  const urgent = c.verifsEnRetard + c.actionsEnRetard;
  if (urgent > 0) {
    return `${enLettres(urgent)} ${urgent > 1 ? "échéances" : "échéance"} à traiter cette semaine`;
  }
  if (c.verifsSous30j > 0) {
    return `${enLettres(c.verifsSous30j)} ${
      c.verifsSous30j > 1 ? "échéances" : "échéance"
    } dans les trente jours`;
  }
  if (c.verifsAPlanifier > 0) {
    return `${enLettres(c.verifsAPlanifier)} ${
      c.verifsAPlanifier > 1 ? "vérifications" : "vérification"
    } restent à planifier`;
  }
  return "Rien ne presse cette semaine";
}

function construireParagraphe(e: EntreeBrief): string {
  const { compteurs: c, duerp } = e;

  const acquis: string[] = [];
  if (duerp.estAJour) acquis.push("votre DUERP est à jour");
  if (e.nbRapports > 0) {
    acquis.push(
      `le registre compte ${e.nbRapports} rapport${e.nbRapports > 1 ? "s" : ""}`,
    );
  }

  const restes: string[] = [];
  if (c.verifsEnRetard > 0) {
    restes.push(
      `${c.verifsEnRetard} vérification${c.verifsEnRetard > 1 ? "s" : ""} dépassée${c.verifsEnRetard > 1 ? "s" : ""}`,
    );
  }
  if (c.verifsAPlanifier > 0) {
    restes.push(
      `${c.verifsAPlanifier} vérification${c.verifsAPlanifier > 1 ? "s" : ""} à programmer`,
    );
  }
  if (c.actionsEnRetard > 0) {
    restes.push(
      `${c.actionsEnRetard} action${c.actionsEnRetard > 1 ? "s" : ""} dont la date est passée`,
    );
  }

  const phrases: string[] = [];

  if (!duerp.existe) {
    phrases.push("Votre DUERP n'est pas encore ouvert.");
  } else if (!duerp.estAJour) {
    phrases.push("Votre DUERP a plus de douze mois.");
  }

  if (acquis.length > 0) {
    const t = acquis.join(" et ");
    phrases.push(t.charAt(0).toUpperCase() + t.slice(1) + ".");
  }

  if (restes.length > 0) {
    phrases.push(`Il reste ${enumerer(restes)}.`);
  } else if (e.duerp.existe) {
    // Dire explicitement que rien ne traîne : sur un dossier sain, le
    // silence se lit comme un oubli de l'outil plutôt que comme une
    // bonne nouvelle.
    phrases.push("Rien n'est en retard sur votre dossier.");
  }

  return phrases.join(" ");
}

/** « a, b et c » — énumération française. */
function enumerer(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

export function construireBrief(e: EntreeBrief): Brief {
  const gestes: GesteBrief[] = e.recommandations.slice(0, 2).map((r) => ({
    tag: raccourcirTag(r.titre),
    tagComplet: r.titre,
    label: VERBE[r.kind],
    href: r.href,
    ton: TONS_ALERTE.has(r.kind) ? "alerte" : "neutre",
  }));

  return {
    datePill: formaterDate(e.aujourdhui),
    titre: construireTitre(e.compteurs),
    paragraphe: construireParagraphe(e),
    gestes,
  };
}
