import { describe, expect, it } from "vitest";
import { obligationsConformite } from "../conformite";
import {
  CORPUS,
  couverture,
  EXCLUSIONS,
  liensRetenusRompus,
  articlesNonCouverts,
  obligationsManquantes,
  obligationsSurTextesNonDepouilles,
  referencesSansCle,
} from "./index";

describe("corpus — forme des dépouillements", () => {
  it("aucun article n'est déclaré deux fois dans un même corpus", () => {
    for (const c of CORPUS) {
      const refs = c.articles.map((a) => a.ref);
      expect(new Set(refs).size, c.id).toBe(refs.length);
    }
  });

  it("un article retenu désigne des obligations qui existent", () => {
    const connues = new Set(obligationsConformite.map((o) => o.id));
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (a.statut !== "retenu") continue;
        for (const id of a.obligations) {
          // Un lien vers une obligation disparue est pire qu'aucun lien : il
          // fait croire que l'article est couvert alors qu'il ne l'est plus.
          expect(connues.has(id), `${c.id} / ${a.ref} → ${id}`).toBe(true);
        }
      }
    }
  });

  it("un article écarté cite une exclusion déclarée du périmètre", () => {
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (a.statut !== "hors_perimetre") continue;
        expect(
          Object.keys(EXCLUSIONS),
          `${c.id} / ${a.ref}`,
        ).toContain(a.exclusion);
      }
    }
  });

  it("un article sans objet dit pourquoi", () => {
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (a.statut !== "sans_objet") continue;
        // « Sans objet » sans motif est une case cochée, pas une lecture.
        expect(a.motif.length, `${c.id} / ${a.ref}`).toBeGreaterThan(20);
      }
    }
  });

  it("un article dépouillé porte la date ET la provenance de sa lecture", () => {
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (a.statut === "non_depouille") continue;
        expect(a.luLe, `${c.id} / ${a.ref}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Sans provenance, une lecture indirecte et une lecture à la source se
        // ressemblent une fois écrites — et seule la seconde peut fonder une
        // entrée du référentiel.
        expect(a.lecture, `${c.id} / ${a.ref} : provenance de lecture absente`)
          .toBeDefined();
      }
    }
  });

  it("aucune entrée ne se fonde sur une lecture indirecte", () => {
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (a.statut !== "retenu") continue;
        // Deux reproductions consolidées concordantes peuvent dériver du même
        // relevé, et aucune ne porte la date de version faisant foi.
        expect(
          a.lecture,
          `${c.id} / ${a.ref} : un article « retenu » ne peut pas reposer sur une lecture indirecte`,
        ).not.toBe("indirect");
      }
    }
  });

  it("un corpus partiel ne se déclare jamais complet", () => {
    for (const c of CORPUS) {
      const cv = couverture(c);
      if (c.etendue === "articles_cites") {
        expect(cv.complet, `${c.id} : partiel mais annoncé complet`).toBe(false);
      }
    }
  });

  it("le lien obligation ↔ article tient dans les deux sens", () => {
    // Sans ce contrôle, un corpus pourrait s'attribuer une couverture qu'aucune
    // obligation ne confirme, et la dette descendrait sans que rien
    // ne s'améliore.
    expect(liensRetenusRompus()).toEqual([]);
  });

  it("la couverture ne se déclare complète que si tout est lu", () => {
    for (const c of CORPUS) {
      const cv = couverture(c);
      // « Complet » exige les deux : tout lu ET liste exhaustive du texte.
      expect(cv.complet, c.id).toBe(
        c.etendue === "integral" && cv.nonDepouilles === 0,
      );
      // Somme exhaustive : tout article a exactement un statut. Un statut
      // ajouté au type et oublié ici ferait diverger la somme du total — ce
      // qui est arrivé lors de l'ajout d'`obligation_manquante`.
      expect(
        cv.retenus +
          cv.sansObjet +
          cv.horsPerimetre +
          cv.nonCouverts +
          cv.obligationsManquantes +
          cv.nonDepouilles,
        `${c.id} : la somme des statuts ne fait pas le total — un statut manque au compte`,
      ).toBe(cv.total);
    }
  });
});

describe("corpus — la dette de lecture, mesurée et décroissante", () => {
  // Le nombre d'obligations qui s'appuient sur au moins un texte qu'aucun
  // corpus ne déclare avoir lu. Ce chiffre ne doit JAMAIS augmenter : ajouter
  // une obligation fondée sur un texte non dépouillé, c'est creuser l'angle
  // mort qu'on est en train de combler.
  //
  // Il descend à mesure que les corpus sont dépouillés. Quand il atteint 0,
  // le référentiel peut dire — et prouver — qu'il ne repose que sur des textes
  // lus de bout en bout.
  // 1 : `aeration-habitation-vmc-gaz-annuelle`, dont l'unique référence est
  // l'arrêté du 23 février 2018, délibérément laissé non dépouillé — sa
  // lecture s'interrompt avant le titre qui traite du contrôle, et
  // l'obligation est de criticité 5. Le déclarer lu serait le pire service à
  // lui rendre.
  const PLAFOND = 1;

  // Le nombre de références qui ne portent même pas de clé d'article, donc
  // rattachables à aucun corpus. Complément indispensable du plafond : sans
  // lui, « 0 article cité non dépouillé » se lirait comme « tout est lu ».
  // Zéro, et le cliquet le verrouille : toute nouvelle référence devra porter
  // sa clé d'article dès son écriture. C'est ce qui garantit qu'un texte cité
  // pourra toujours être rattaché à un corpus — donc vérifié.
  const PLAFOND_SANS_CLE = 0;

  it("ne dépasse pas le plafond, et le plafond ne remonte pas", () => {
    const restantes = obligationsSurTextesNonDepouilles();
    expect(
      restantes.length,
      `${restantes.length} obligation(s) s'appuient sur un texte non dépouillé ` +
        `(plafond ${PLAFOND}). Si ce nombre a BAISSÉ, abaisser PLAFOND d'autant : ` +
        `c'est un cliquet, il ne remonte pas. S'il a AUGMENTÉ, une obligation a ` +
        `été ajoutée sur un texte que personne n'a lu — dépouiller le corpus ` +
        `avant de l'encoder.`,
    ).toBeLessThanOrEqual(PLAFOND);
  });

  it("le nombre de références sans clé ne remonte pas non plus", () => {
    const sans = referencesSansCle();
    expect(
      sans.length,
      `${sans.length} référence(s) sans clé d'article (plafond ${PLAFOND_SANS_CLE}). ` +
        `Une référence sans clé n'est rattachable à aucun corpus. Renseigner ` +
        `\`article\` puis abaisser PLAFOND_SANS_CLE.`,
    ).toBeLessThanOrEqual(PLAFOND_SANS_CLE);
  });

  it("le plafond colle à la réalité : il ne reste pas gonflé", () => {
    const restantes = obligationsSurTextesNonDepouilles();
    // Un plafond très au-dessus du réel ne protège plus de rien. On le garde
    // serré : au plus deux obligations de marge.
    expect(
      PLAFOND - restantes.length,
      `PLAFOND (${PLAFOND}) est trop haut : il n'en reste que ${restantes.length}. ` +
        `Abaisser PLAFOND à ${restantes.length}.`,
    ).toBeLessThanOrEqual(2);
  });
});

describe("corpus — Livre III du règlement de sécurité ERP", () => {
  const pe = CORPUS.find((c) => c.id === "arrete-1980-livre-3");

  it("est déclaré et dépouillé de bout en bout", () => {
    expect(pe, "le corpus PE a disparu de CORPUS").toBeDefined();
    const cv = couverture(pe!);
    expect(cv.total).toBe(58);
    expect(cv.complet, `${cv.nonDepouilles} article(s) non dépouillé(s)`).toBe(true);
  });

  it("ne retient qu'un seul article créant une obligation périodique pour les secteurs couverts", () => {
    // Le résultat du dépouillement du 2026-08-26, verrouillé : sur 58 articles,
    // PE 4 est le seul à imposer une échéance à un exploitant de restaurant, de
    // commerce ou de bureau. PE 27 impose une instruction du personnel sans
    // périodicité écrite. Si ce test casse, c'est qu'un article a changé de
    // statut — donc que quelqu'un a relu, ou que quelqu'un s'est trompé.
    const refs = obligationsManquantes().map((o) => o.ref);
    // PE 4 a quitté la liste : le référentiel le cite désormais (domaine
    // électricité), il est donc « retenu ». PE 27 reste manquant.
    // PE 27 : instruction du personnel côté ERP, sans périodicité écrite.
    // R. 4544-11-1 : attestation médicale quinquennale, en vigueur depuis
    // octobre 2025, nominative donc bloquée par le porteur d'échéance.
    expect(refs).toEqual(["PE 27", "R. 4544-11-1"]);
  });

  it("chaque obligation manquante dit ce qui empêche de l'encoder ou pourquoi elle manque", () => {
    for (const o of obligationsManquantes()) {
      expect(o.motif.length, o.ref).toBeGreaterThan(80);
    }
  });
});

describe("corpus — ce qu'on ne couvre pas, et où on le dit", () => {
  // Le principe : couvrir le maximum de ce qui est possible, et sinon le dire
  // clairement. Ces tests portent la seconde moitié — celle qu'on oublie.

  it("chaque manque de couverture dit ce qu'il laisse de côté", () => {
    for (const a of articlesNonCouverts()) {
      // Un motif court est une case cochée. Le lecteur doit pouvoir juger de
      // ce qu'il perd sans rouvrir le texte.
      expect(a.motif.length, `${a.corpus} / ${a.ref}`).toBeGreaterThan(120);
    }
  });

  it("un manque de couverture n'est jamais rangé parmi les exclusions", () => {
    // Une exclusion dit « aucune obligation n'en découle ». Y ranger un choix
    // de couverture fait disparaître une dette du décompte : elle cesse d'être
    // un manque pour devenir une non-question. C'est la faute que ce statut
    // sépare.
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (a.statut !== "hors_perimetre") continue;
        expect(
          ["construction", "sans_destinataire_exploitant", "categorie_erp", "risque_specialise"],
          `${c.id} / ${a.ref}`,
        ).toContain(a.exclusion);
      }
    }
  });

  it("le nombre de manques non déclarés à l'utilisateur ne remonte pas", () => {
    // 31 aujourd'hui : rien dans l'application n'annonce à un exploitant
    // hôtelier, ou à un établissement à locaux à sommeil, que des obligations
    // qui le visent ne sont pas portées. Ce chiffre doit descendre — soit en
    // couvrant, soit en déclarant.
    const MUETS = 31;
    const muets = articlesNonCouverts().filter((a) => !a.declareA || a.declareA.startsWith("Non déclaré"));
    expect(
      muets.length,
      `${muets.length} manque(s) de couverture qu'aucun écran n'annonce (plafond ${MUETS}). ` +
        `Couvrir, ou déclarer — puis abaisser MUETS.`,
    ).toBeLessThanOrEqual(MUETS);
  });
});
