"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { repondreActivite } from "@/lib/activites/actions";

/**
 * Une question d'activité hors couverture, et son couple Oui / Non (ADR-020).
 *
 * Le traitement de l'absence de réponse est repris tel quel de
 * `QuestionTransverseRow` : tant que rien n'a été répondu, **aucun** des deux
 * boutons n'est mis en avant. Mettre « Non » en évidence par défaut afficherait
 * une réponse que personne n'a donnée, sur un document à valeur légale — la
 * différence avec les transverses, c'est qu'ici le « non » est bel et bien
 * persistable (`exercee === false`), donc l'écran distingue trois états là où
 * les transverses n'en distinguent que deux.
 *
 * Répondre « oui » ne bloque rien et n'ajoute aucun risque : c'est une
 * déclaration de périmètre, pas une étape d'évaluation. C'est aussi pourquoi
 * la conséquence est affichée en clair sous la question — ce que le document
 * ne traitera pas est la seule chose que le dirigeant a besoin de savoir pour
 * décider de créer, ou non, une unité de travail à la main.
 */
type Props = {
  duerpId: string;
  activiteId: string;
  question: string;
  aide?: string;
  cequiManque: string;
  /** `undefined` = pas de réponse. Ne jamais replier sur `false`. */
  exercee: boolean | undefined;
};

export function QuestionActiviteRow({
  duerpId,
  activiteId,
  question,
  aide,
  cequiManque,
  exercee,
}: Props) {
  const [pending, startTransition] = useTransition();

  const repondre = (valeur: boolean) => {
    if (valeur === exercee) return;
    startTransition(async () => {
      await repondreActivite(duerpId, activiteId, valeur);
    });
  };

  return (
    <li className="rounded-lg border bg-card p-4">
      <p className="font-medium">{question}</p>
      {aide && (
        <p className="mt-1 text-xs text-muted-foreground">{aide}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          variant={exercee === true ? "default" : "outline"}
          disabled={pending}
          onClick={() => repondre(true)}
        >
          Oui
        </Button>
        <Button
          size="sm"
          variant={exercee === false ? "default" : "outline"}
          disabled={pending}
          onClick={() => repondre(false)}
        >
          Non
        </Button>
        {exercee === undefined && (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            Sans réponse
          </span>
        )}
      </div>

      {exercee === true && (
        <div className="mt-3 max-w-prose border-l-2 border-dashed border-rule pl-3">
          <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
            Ce que le référentiel de votre secteur ne propose pas pour cette
            activité&nbsp;: {cequiManque}
          </p>
          <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted-foreground">
            L&apos;inventaire reste à votre main — créez au besoin une unité de
            travail dédiée à l&apos;étape suivante. Le DUERP généré porte la
            mention de cette déclaration.
          </p>
        </div>
      )}
    </li>
  );
}
