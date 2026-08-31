/**
 * Les phrases de l'écran qui s'accordent en nombre, sorties du JSX.
 *
 * **Elles y étaient assemblées, et une s'est cassée.** Le contrôle visuel du
 * 2026-08-31 a lu « Elles n'entrepas dans le compte » : un ternaire qui rendait
 * la moitié d'une locution — `{n === 1 ? "Elle n'entre" : "Elles n'entrent"} pas`
 * — et l'espace qui séparait les deux moitiés a disparu au rendu.
 *
 * **Le défaut n'est pas l'espace, c'est la coupure.** Couper « n'entre pas » au
 * milieu confie la cohésion d'une locution à une règle de mise en page, et
 * personne ne relit une phrase qui n'existe nulle part en entier — ni un humain,
 * qui ne voit que des fragments dans le source, ni un test, qui ne peut pas
 * lire du JSX. C'est la famille de défauts que la journée a traquée : du texte
 * assemblé que personne ne relit.
 *
 * Ici chaque fonction rend **une phrase complète**. Elle se lit dans le source,
 * elle se teste, et toutes ses branches s'exercent — y compris celles qu'un
 * dossier ne montre jamais.
 */

/** Ce qu'il reste à passer en revue, ou rien. */
export function phraseRestantes(restantes: number): string | null {
  if (restantes <= 0) return null;
  const tete =
    restantes === 1
      ? "Une ligne reste à passer en revue."
      : `${restantes} lignes restent à passer en revue.`;
  return `${tete} Une ligne non cochée n'est pas un manquement constaté : c'est une question à laquelle vous n'avez pas encore répondu.`;
}

/**
 * Ce que le second verbe recouvre, et pourquoi il ne compte pas.
 *
 * Rendue **à côté des lignes concernées** et non en pied de page : le contrôle
 * visuel a montré qu'une explication placée après la liste arrive une fois que
 * tout est déjà coché — le relecteur a coché douze lignes en sept secondes sans
 * en lire une seule.
 */
export function phraseFaitsDates(
  faitsDates: number,
  renseignes: number,
): string | null {
  if (faitsDates <= 0) return null;

  const quoi =
    faitsDates === 1
      ? "Le texte fait revenir cette obligation, sans dire à quel rythme."
      : `Les textes font revenir ces ${faitsDates} obligations, sans dire à quel rythme.`;

  const consequence =
    faitsDates === 1
      ? "Elle se date donc — « fait le » — au lieu de se déclarer en place, et elle n'entre pas dans le compte de l'en-tête, qui ne parle que d'états."
      : "Elles se datent donc — « fait le » — au lieu de se déclarer en place, et elles n'entrent pas dans le compte de l'en-tête, qui ne parle que d'états.";

  const etat =
    renseignes === 0
      ? faitsDates === 1
        ? "Elle ne porte pas encore de date."
        : "Aucune ne porte encore de date."
      : renseignes === faitsDates
        ? faitsDates === 1
          ? "Elle porte une date."
          : "Toutes portent une date."
        : `${renseignes} sur ${faitsDates} portent une date.`;

  return `${quoi} ${consequence} ${etat}`;
}

/**
 * Le compte de l'en-tête, écrit en toutes lettres sous le chiffre.
 *
 * « déclarés en place **par vous** », jamais « conformes » : le produit assiste,
 * il ne certifie pas (`CLAUDE.md`, règle 8).
 */
export function phraseCompteur(enPlace: number, total: number): string {
  if (total === 0) return "aucun état à déclarer sur ce dossier";
  if (enPlace === 0) return "déclarés en place par vous";
  if (enPlace === total) return "tous déclarés en place par vous";
  return "déclarés en place par vous";
}

/**
 * Ce qu'une ligne déclarée affiche, verbe et date d'un seul tenant.
 *
 * **Trouvée par la garde du 2026-08-31, pas par une relecture.** `LigneEtat`
 * rendait `{verbe} {formaterDateFr(date)}` où `verbe` sortait d'un ternaire —
 * exactement le montage qui avait produit « Elles n'entrepas » quelques lignes
 * plus bas. Le défaut ne s'était pas encore vu ; il attendait son tour.
 */
export function phraseDeclaration(
  mode: "etat" | "fait",
  dateFormatee: string,
): string {
  if (mode === "etat") return `Déclaré en place le ${dateFormatee}`;
  return `Fait le ${dateFormatee}`;
}

/** Le libellé du bouton, quand la ligne n'est pas encore déclarée. */
export function libelleGeste(mode: "etat" | "fait"): string {
  if (mode === "etat") return "Déclarer en place";
  return "Marquer comme fait";
}

/** Le libellé du bouton, quand elle l'est. Défaire n'a qu'un mot. */
export function libelleRetour(): string {
  return "Revenir dessus";
}
