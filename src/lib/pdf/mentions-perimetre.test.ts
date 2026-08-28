import { describe, expect, it } from "vitest";
import type { CouvertureEtablissement } from "@/lib/perimetre/couverture";
import { blocsPerimetre, chapeauPerimetre } from "./mentions-perimetre";

const vide: CouvertureEtablissement = { manques: [], indeterminations: [] };

const charge: CouvertureEtablissement = {
  manques: [
    {
      axe: "categorie_erp",
      motif: "Cet établissement relève de la 2ᵉ catégorie.",
      consequence: "Le livre II s'applique en entier.",
    },
    {
      axe: "domaine_equipement",
      motif: "27 équipements de votre inventaire ne déclenchent aucune obligation.",
      consequence: "Le détail se lit sur la page Équipements.",
    },
  ],
  indeterminations: [
    {
      axe: "categorie_erp",
      motif: "La catégorie n'est pas renseignée.",
      quoiFaire: "Elle figure sur votre arrêté d'ouverture.",
    },
  ],
};

describe("mentions de périmètre du dossier de conformité", () => {
  it("n'écrit rien quand rien n'est à signaler — pas même une mention rassurante", () => {
    // Écrire « ce dossier couvre tout » serait une affirmation que rien ne
    // fonde : le référentiel a un périmètre, le droit n'en a pas.
    expect(chapeauPerimetre(vide)).toBeNull();
    expect(blocsPerimetre(vide)).toEqual([]);
  });

  it("écrit un chapeau dès qu'il y a une seule question ouverte", () => {
    // Une indétermination compte : c'est le cas où le document est incomplet
    // sans qu'on sache de combien, et c'est celui qu'un silence effacerait.
    const c: CouvertureEtablissement = {
      manques: [],
      indeterminations: charge.indeterminations,
    };
    expect(chapeauPerimetre(c)).not.toBeNull();
    expect(blocsPerimetre(c)).toHaveLength(1);
  });

  it("rend un bloc par axe, les faits établis avant les questions ouvertes", () => {
    expect(blocsPerimetre(charge).map((b) => b.titre)).toEqual([
      "Cet établissement relève de la 2ᵉ catégorie.",
      "27 équipements de votre inventaire ne déclenchent aucune obligation.",
      "La catégorie n'est pas renseignée.",
    ]);
  });

  it("ne rend qu'un titre et un corps par bloc — rien d'autre ne passe", () => {
    // Le contrat de sortie est fermé à deux champs. Il l'était déjà quand un
    // axe portait une liste d'articles que le PDF ne devait pas imprimer :
    // vingt-sept motifs de dépouillement rédigés pour un relecteur interne
    // auraient fait passer une note de travail pour une pièce du dossier.
    // L'axe est parti, la fermeture reste — c'est elle qui tenait.
    for (const b of blocsPerimetre(charge)) {
      expect(Object.keys(b).sort()).toEqual(["corps", "titre"]);
    }
  });

  it("ne conclut jamais sur le droit", () => {
    const textes = [
      chapeauPerimetre(charge) ?? "",
      ...blocsPerimetre(charge).flatMap((b) => [b.titre, b.corps]),
    ];
    for (const t of textes) {
      expect(t).not.toMatch(/en infraction|est conforme|non conforme/i);
    }
  });

  it("dit qu'une obligation non traitée reste due", () => {
    // Sans cette phrase, « ce dossier ne traite pas X » se lit « X ne vous
    // concerne pas » — l'inverse exact de ce qu'on veut dire.
    expect(chapeauPerimetre(charge)).toContain("reste due si un texte l'impose");
  });
});
