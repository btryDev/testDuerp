import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LIBELLE_ETAT,
  LIBELLE_ETAT_COURT,
  compteEtat,
  libelleEtatCourtCapitale,
  type RegistreLigne,
} from "./etats";
import { etatCharge, libelleCharge } from "@/lib/batiments/etat-charge";
import { resumerEquipement } from "@/lib/equipements/etat-verifications";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LA GARDE DU VOCABULAIRE D'ÉTAT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * LE DÉFAUT. Le 2026-09-04, quatre écrans à un clic les uns des autres
 * écrivaient le MÊME état de quatre façons — « DÉPASSÉES » au relevé du hero,
 * « à traiter » sur la pastille d'une zone, « EN RETARD » au bandeau du parc,
 * « 5 dépassées » sur la carte d'un appareil. Le module `etats.ts` tenait déjà
 * la COULEUR de chaque état parce que trois tables locales avaient divergé
 * avant ; il ne tenait pas le MOT, et le mot a divergé quatre fois.
 *
 * CE QUE CETTE GARDE TIENT, et qui ne se tient pas tout seul :
 *
 *   1. UN MOT PAR ÉTAT, ET UN SEUL. Deux états qui partagent un mot rendent la
 *      table inutile : le dirigeant lirait le même mot sur deux réalités.
 *   2. LA FORME COURTE EST LE MÊME MOT, ABRÉGÉ. C'est la seule chose qui
 *      empêche `LIBELLE_ETAT_COURT` de devenir le second dictionnaire que la
 *      table existe pour éviter — une pastille étroite a droit à moins de
 *      lettres, pas à un autre mot.
 *   3. LES ÉCRANS PRENNENT LEURS MOTS LÀ. C'est la moitié qui a réellement
 *      lâché : le module de vocabulaire aurait pu exister depuis un an, il
 *      n'aurait rien empêché tant qu'un écran pouvait écrire le sien à côté.
 *
 * POURQUOI LE POINT 3 SE VÉRIFIE SUR LE TEXTE DES FICHIERS. Les deux modules de
 * calcul (`etat-charge`, `etat-verifications`) rendent des chaînes : on les
 * appelle, et l'appel suffit. Les deux autres surfaces rendent du JSX qu'aucun
 * test de ce dépôt ne monte. Le texte du fichier est alors ce qui reste — et il
 * se lit COMMENTAIRES RETIRÉS, sinon la garde compterait ses propres
 * explications et se rassurerait toute seule (c'est arrivé dans ce dépôt : un
 * `grep` qui comptait des commentaires a rendu trois chiffres différents pour
 * la même question).
 */

const ETATS: RegistreLigne[] = [
  "enRetard",
  "proche",
  "lointain",
  "faite",
  "aPlanifier",
];

describe("un mot par état", () => {
  it("aucun mot ne nomme deux états", () => {
    for (const forme of ["un", "plusieurs"] as const) {
      const mots = ETATS.map((e) => LIBELLE_ETAT[e][forme]);
      expect(new Set(mots).size, `forme « ${forme} » : ${mots.join(" / ")}`).toBe(
        ETATS.length,
      );
    }
    const courts = ETATS.map((e) => LIBELLE_ETAT_COURT[e]);
    expect(new Set(courts).size, courts.join(" / ")).toBe(ETATS.length);
  });

  it("la forme courte est le mot long abrégé, jamais un synonyme", () => {
    for (const e of ETATS) {
      // Le point final d'une abréviation ne fait pas partie du mot.
      const court = LIBELLE_ETAT_COURT[e].replace(/\.$/, "");
      expect(
        LIBELLE_ETAT[e].plusieurs.startsWith(court),
        `« ${LIBELLE_ETAT_COURT[e]} » n'abrège pas « ${LIBELLE_ETAT[e].plusieurs} » : ` +
          "c'est un second mot pour le même état, exactement ce que la table " +
          "existe pour empêcher.",
      ).toBe(true);
    }
  });

  it("aucun mot n'est vide, ni ne traîne d'espace", () => {
    for (const e of ETATS) {
      for (const mot of [
        LIBELLE_ETAT[e].un,
        LIBELLE_ETAT[e].plusieurs,
        LIBELLE_ETAT_COURT[e],
      ]) {
        expect(mot.length, e).toBeGreaterThan(0);
        expect(mot, e).toBe(mot.trim());
      }
    }
  });

  it("`compteEtat` accorde, et `libelleEtatCourtCapitale` ne change que la casse", () => {
    expect(compteEtat(1, "enRetard")).toBe("1 dépassée");
    expect(compteEtat(5, "enRetard")).toBe("5 dépassées");
    expect(compteEtat(1, "faite")).toBe("1 faite");
    expect(compteEtat(2, "faite")).toBe("2 faites");

    for (const e of ETATS) {
      expect(libelleEtatCourtCapitale(e).toLowerCase()).toBe(
        LIBELLE_ETAT_COURT[e].toLowerCase(),
      );
    }
    expect(libelleEtatCourtCapitale("enRetard")).toBe("Dépassées");
    expect(libelleEtatCourtCapitale("proche")).toBe("Sous 30 j");
  });
});

describe("les écrans prennent leurs mots dans la table", () => {
  /** Tous les mots que la table autorise, dans leurs trois formes. */
  const MOTS_AUTORISES = new Set(
    ETATS.flatMap((e) => [
      LIBELLE_ETAT[e].un,
      LIBELLE_ETAT[e].plusieurs,
      LIBELLE_ETAT_COURT[e],
    ]),
  );

  it("la pastille d'une zone n'a plus de mot à elle pour le dépassement", () => {
    // « à traiter » était le quatrième mot du même état. Les deux autres
    // libellés de cette pastille restent hors table, et c'est voulu : ce sont
    // des états de ZONE (rien de déclaré / rien de dépassé), pas des états
    // d'échéance. La garde le dit plutôt que de les laisser passer en silence.
    expect(libelleCharge(etatCharge({ nbEquipements: 3, nbEnRetard: 5 }))).toBe(
      LIBELLE_ETAT_COURT.enRetard,
    );
    expect(libelleCharge(etatCharge({ nbEquipements: 3, nbEnRetard: 0 }))).toBe(
      "À jour",
    );
    expect(libelleCharge(etatCharge({ nbEquipements: 0, nbEnRetard: 0 }))).toBe(
      "Sans objet",
    );
  });

  it("chaque signal d'une carte d'appareil porte un mot de la table", () => {
    // Toutes les branches d'un coup, y compris celles qu'un dossier réel ne
    // montre jamais ensemble : c'est la seule façon de savoir qu'aucune n'a
    // gardé son accord recopié.
    const resume = resumerEquipement({
      enRetard: 3,
      prochaine: null,
      derniere: null,
      aPlanifier: 1,
      aVenir: 4,
      proches: 1,
      faites: 2,
      periodicites: [],
    });

    expect(resume.signaux.map((s) => s.cle)).toEqual([
      "enRetard",
      "aPlanifier",
      "proche",
      "lointain",
      "faite",
    ]);
    for (const s of resume.signaux) {
      // Le libellé est « <nombre> <mot de la table> », rien d'autre.
      const mot = s.libelle.replace(/^\d+\s/, "");
      expect(MOTS_AUTORISES.has(mot), `« ${s.libelle} »`).toBe(true);
      expect(s.libelle.startsWith(`${s.nb} `), s.libelle).toBe(true);
    }

    // Et le singulier, qui est l'autre moitié de l'accord.
    const seul = resumerEquipement({
      enRetard: 1,
      prochaine: null,
      derniere: null,
      aPlanifier: 0,
      aVenir: 0,
      proches: 0,
      faites: 1,
      periodicites: [],
    });
    expect(seul.signaux.map((s) => s.libelle)).toEqual(["1 dépassée", "1 faite"]);
  });
});

/**
 * Le texte d'un fichier, ses commentaires retirés.
 *
 * Les blocs d'abord, les lignes ensuite — et jamais un `//` précédé de `:`,
 * qui est un schéma d'URL et non un commentaire.
 */
function codeSansCommentaires(chemin: string): string {
  return readFileSync(join(process.cwd(), chemin), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

/**
 * Les mots que ces écrans ont écrits à la main pour l'état `enRetard`, et qui
 * ne doivent plus y reparaître. Ce sont les synonymes REFUSÉS, pas le mot
 * retenu : « dépassée » a le droit d'apparaître, mais seulement parce qu'il
 * arrive par la table — d'où le second test, qui exige l'import.
 */
const SYNONYMES_REFUSES = ["à traiter", "en retard", "En retard", "EN RETARD"];

describe("aucun écran ne rouvre un second vocabulaire", () => {
  const SURFACES = [
    "src/lib/batiments/etat-charge.ts",
    "src/lib/equipements/etat-verifications.ts",
    "src/components/equipements/BandeauParc.tsx",
    "src/components/equipements/VitrineEquipement.tsx",
  ];

  it.each(SURFACES)("%s n'écrit aucun synonyme du dépassement", (fichier) => {
    const code = codeSansCommentaires(fichier);
    for (const mot of SYNONYMES_REFUSES) {
      expect(
        code.includes(mot),
        `${fichier} écrit « ${mot} » hors commentaire. Le mot de cet état vit ` +
          "dans `LIBELLE_ETAT` (lib/calendrier/etats) : un écran qui le " +
          "réécrit rouvre la divergence du 2026-09-04.",
      ).toBe(false);
    }
  });

  it("le relevé du tableau de bord nomme ses deux états par la table", () => {
    // `board.tsx` porte une dizaine de widgets, dont plusieurs ont leur propre
    // vocabulaire légitime : on ne balaie pas le fichier, on vérifie les deux
    // relevés du hero, qui sont ce qui a divergé. Ils sont écrits en JSX, que
    // ce dépôt ne monte dans aucun test — le texte du fichier est ce qui reste.
    const code = codeSansCommentaires(
      "src/components/dashboard/widgets/impl/board.tsx",
    );
    expect(code).toContain("libelle={LIBELLE_ETAT_COURT.enRetard}");
    expect(code).toContain("libelle={LIBELLE_ETAT_COURT.proche}");
    expect(code, "le relevé écrivait « Dépassées » à la main").not.toContain(
      'libelle="Dépassées"',
    );
    expect(code, "le relevé écrivait « Sous 30 j » à la main").not.toContain(
      'libelle="Sous 30 j"',
    );
  });
});
