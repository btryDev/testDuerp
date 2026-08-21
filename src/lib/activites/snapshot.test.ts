import { describe, expect, it } from "vitest";
import type { ActiviteNonCouverte } from "@/lib/referentiels/types";
import type { QuestionActivite } from "./reponses";
import {
  activitesDeclareesSnapshot,
  activitesSansReponseSnapshot,
  figerCouverture,
} from "./snapshot";

function activite(id: string): ActiviteNonCouverte {
  return {
    id,
    libelle: `Activité ${id}`,
    question: `Exercez-vous ${id} ?`,
    cequiManque: `ce que le référentiel ne dit pas de ${id}.`,
  };
}

describe("figerCouverture", () => {
  const questions: QuestionActivite[] = [
    { activite: activite("decoupe"), exercee: true },
    { activite: activite("station"), exercee: false },
    { activite: activite("pressing"), exercee: undefined },
  ];

  it("recopie le libellé et le « ce qui manque », sans se contenter de l'id", () => {
    const fige = figerCouverture("commerce", questions);
    expect(fige.activites[0]).toEqual({
      id: "decoupe",
      libelle: "Activité decoupe",
      cequiManque: "ce que le référentiel ne dit pas de decoupe.",
      exercee: true,
    });
  });

  it("transforme l'absence de réponse en `null`, jamais en `false`", () => {
    // `undefined` ne survit pas à JSON.stringify : la clé disparaîtrait du
    // snapshot et une question posée deviendrait indistinguable d'une question
    // jamais posée. `null` la garde visible et muette.
    const fige = figerCouverture("commerce", questions);
    expect(fige.activites.map((a) => a.exercee)).toEqual([true, false, null]);
    expect(JSON.parse(JSON.stringify(fige)).activites).toHaveLength(3);
  });

  it("fige une liste vide quand le secteur ne déclare aucune activité", () => {
    // Fait à part entière : aucune question n'a été posée. Ce n'est pas
    // l'absence du champ, qui elle veut dire « on ne sait pas ».
    expect(figerCouverture("bureau", []).activites).toEqual([]);
  });
});

describe("lecture d'un snapshot", () => {
  const couverture = figerCouverture("commerce", [
    { activite: activite("decoupe"), exercee: true },
    { activite: activite("station"), exercee: false },
    { activite: activite("pressing"), exercee: undefined },
  ]);

  it("ne mentionne que les activités déclarées exercées", () => {
    expect(activitesDeclareesSnapshot(couverture).map((a) => a.id)).toEqual([
      "decoupe",
    ]);
  });

  it("compte les questions restées sans réponse", () => {
    expect(activitesSansReponseSnapshot(couverture).map((a) => a.id)).toEqual([
      "pressing",
    ]);
  });
});
