// Enchaîner les fiches à remplir, sans imposer un parcours.
//
// Remplir un registre pour la première fois, c'est quinze fiches d'affilée :
// revenir à la liste entre chacune est un aller-retour de trop. Mais ajouter
// une ligne au journal des événements six mois plus tard, c'est une fiche et
// une seule — et un parcours obligatoire serait alors une prison.
//
// D'où ce pied de fiche plutôt qu'un assistant : on enchaîne quand on veut
// enchaîner, on entre par une seule fiche quand c'est tout ce qu'on a à
// faire. Le lien ne pointe que vers des fiches **à remplir** : proposer
// « suivante » vers une fiche déjà pleine ferait tourner en rond.

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type FicheVoisine = { titre: string; href: string };

export function NavigationFiches({
  suivante,
  restantes,
  hrefListe,
}: {
  /** La prochaine fiche qui attend des réponses, s'il en reste une. */
  suivante?: FicheVoisine | null;
  /**
   * Combien de fiches attendent encore des réponses, **celle-ci comprise**.
   * C'est ce qui permet de distinguer « il n'y a plus rien à remplir » de
   * « il ne reste que celle que vous lisez » — deux situations qu'une seule
   * phrase confondait.
   */
  restantes?: number;
  /** Le retour à la liste — la sortie, toujours offerte. */
  hrefListe: string;
}) {
  if (!suivante) {
    // Aucune autre fiche n'attend. Reste à savoir si celle qu'on lit attend
    // encore : dire « c'était la dernière » à quelqu'un qui regarde une fiche
    // vide était faux, et c'est justement la phrase que ce pied existe pour
    // dire juste.
    const celleCiAttendEncore = typeof restantes === "number" && restantes > 0;
    return (
      <p className="m-0 text-[13px] leading-[1.6] text-[color:var(--board-slate-mid)]">
        {celleCiAttendEncore
          ? "Aucune autre fiche n'attend de réponses — celle-ci est la dernière."
          : "Toutes les fiches que l'application recueille sont renseignées."}{" "}
        <Link
          href={hrefListe}
          className="font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
        >
          Revenir au registre
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <p className="m-0 text-[12.5px] text-[color:var(--board-slate-mid)]">
        {typeof restantes === "number" && restantes > 0
          ? restantes > 1
            ? `${restantes} fiches attendent encore des réponses.`
            : "1 fiche attend encore des réponses."
          : null}
      </p>
      <Link
        href={suivante.href}
        className="group inline-flex items-center gap-2 text-[13px] font-semibold text-[color:var(--board-ink)]"
      >
        <span className="text-[color:var(--board-slate-mid)]">Suivante :</span>
        <span className="underline decoration-[color:var(--board-slate)] decoration-1 underline-offset-4 group-hover:decoration-[color:var(--board-ink)]">
          {suivante.titre}
        </span>
        <ChevronRight
          aria-hidden
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
