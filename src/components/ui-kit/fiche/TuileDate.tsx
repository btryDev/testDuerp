// La tuile-date, reprise de la ligne du calendrier.
//
// C'est le point de couture entre la liste et la fiche : on clique une
// ligne dont la date est rose, on ouvre une fiche dont la date est le
// même rose, au même endroit de l'écran, en plus grand. Sans cet objet,
// la fiche s'ouvrait sur un titre nu et l'utilisateur devait relire pour
// retrouver ce qu'il venait de cliquer.
//
// La couleur dit l'ÉTAT et rien d'autre — les jetons viennent de
// `lib/calendrier/etats`, pas d'une quatrième table locale. Le fuseau est
// épinglé (ADR-011) : lues avec `getDate()` sur un serveur en UTC, les
// échéances stockées à minuit reculaient d'un jour.

import { CHAMP_ETAT, ENCRE_ETAT, type RegistreLigne } from "@/lib/calendrier/etats";
import { FUSEAU_REFERENCE } from "@/lib/dates";

const FMT_JOUR = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_REFERENCE,
  day: "2-digit",
});
const FMT_MOIS = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_REFERENCE,
  month: "short",
});

/** Deux échelles : celle de la liste, et celle de la tête de fiche. */
const ECHELLE = {
  liste: { cote: 50, rayon: 17, chiffre: 18, label: 9, ecart: 4 },
  fiche: { cote: 84, rayon: 28, chiffre: 30, label: 11, ecart: 6 },
} as const;

export function TuileDate({
  date,
  etat,
  taille = "liste",
}: {
  date: Date;
  etat: RegistreLigne;
  taille?: keyof typeof ECHELLE;
}) {
  const e = ECHELLE[taille];
  return (
    <span
      className="flex flex-none flex-col items-center justify-center"
      style={{
        width: e.cote,
        height: e.cote,
        borderRadius: e.rayon,
        background: CHAMP_ETAT[etat],
      }}
    >
      <span
        className="board-titre leading-none tabular-nums"
        style={{ fontSize: e.chiffre }}
      >
        {FMT_JOUR.format(date)}
      </span>
      <span
        className="font-mono font-semibold uppercase tracking-[0.1em]"
        style={{
          marginTop: e.ecart,
          fontSize: e.label,
          color: ENCRE_ETAT[etat],
        }}
      >
        {FMT_MOIS.format(date)}
      </span>
    </span>
  );
}
