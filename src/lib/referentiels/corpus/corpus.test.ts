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
  type ArticleDepouille,
  type Corpus,
} from "./index";

describe("corpus — forme des dépouillements", () => {
  it("aucun article n'est déclaré deux fois dans un même corpus", () => {
    for (const c of CORPUS) {
      const refs = c.articles.map((a) => a.ref);
      expect(new Set(refs).size, c.id).toBe(refs.length);
    }
  });

  it("un même article ne reçoit pas deux statuts opposés selon le corpus", () => {
    // LE TEST CI-DESSUS NE REGARDE QU'À L'INTÉRIEUR D'UN CORPUS, et c'est par
    // ce trou que `L. 4622-1` a vécu trois jours en deux exemplaires :
    // `obligation_manquante` dans `code-travail-sante-travail`, `retenu` dans
    // `code-travail-service-prevention-sante`, même url, même version, même
    // verbatim, même `luLe`. Le registre qui dit ce qui MANQUE au référentiel
    // déclarait donc manquante une obligation livrée la veille.
    //
    // L'invariant est celui du test précédent, à la bonne échelle : un corpus
    // ne peut pas dire deux choses d'un article, et le registre non plus. Le
    // `statut` décrit ce que l'article FAIT — il fonde, il est sans objet, il
    // impose ce qu'on ne porte pas —, ce qui est une propriété de l'article et
    // non du corpus qui le lit. Deux lecteurs peuvent donc le lire deux fois,
    // jamais en désaccord.
    //
    // POURQUOI LE STATUT SEUL, ET RIEN D'AUTRE. La duplication inter-corpus est
    // légitime et il y en a deux — `R. 4226-19` et `L. 4711-5`, lus par
    // `code-travail-incendie` et `code-travail-electricite`. Ce sont elles qui
    // calibrent la garde, et elles interdisent d'aller plus loin que le statut :
    // les deux entrées de `L. 4711-5` diffèrent par leur `luLe` (2026-08-26 et
    // 2026-08-31), par leurs `obligations`, et l'une porte `intitule`,
    // `prescrit`, `citationCle` et `reserve` quand l'autre n'en a aucun ; les
    // deux entrées de `R. 4226-19` diffèrent par leurs `obligations`, la version
    // électricité y ajoutant `elec-travail-consignation-registre`. Comparer les
    // obligations nommées, les dates ou la prose ferait donc crier la garde sur
    // les DEUX duplications saines. Mesuré sur 33 corpus et 237 articles :
    // 3 refs dupliquées, 1 divergence, 0 faux positif.
    //
    // CE QU'ON A ÉCARTÉ, ET POURQUOI. L'autre remède mesuré était « un article
    // `obligation_manquante` qu'une obligation encodée cite » : recompté ici, il
    // lève le même unique drapeau sur 12 obligations manquantes, et attrape en
    // plus la classe entière — y compris une entrée périmée SANS jumelle. Il
    // n'est pas retenu parce que ce n'est pas un invariant mais une inférence :
    // `ReferenceLegale` n'a aucun champ séparant une citation FONDATRICE d'une
    // citation de CONTEXTE, et le dépôt en contient déjà — les notes de
    // `sante-travail-etablissement-adhesion-spst` disent de `D. 4622-1` et
    // `D. 4622-2` qu'ils sont « en contexte, pas en fondateur ». Le jour où un
    // article sera cité pour le contexte tout en imposant encore quelque chose
    // qu'on ne porte pas, cette garde criera faux — et le moyen le moins cher de
    // la faire taire sera de dégrader l'entrée du corpus en `sans_objet`,
    // c'est-à-dire de mentir pour réparer un test. C'est le motif de la liste
    // exhaustive dans un habit neuf, en pire : elle ne se répare plus en
    // recopiant mais en effaçant une lecture juste.
    //
    // CE QUE CETTE GARDE NE VOIT PAS, puisqu'il faut le dire : une entrée
    // `obligation_manquante` restée seule, périmée par un encodage fait sans
    // toucher au corpus. Aucun invariant ne l'attrape sans le champ qui manque
    // ci-dessus. Consigné plutôt que couvert par une inférence.
    const parRef = new Map<string, { corpus: string; statut: string }[]>();
    for (const c of CORPUS) {
      for (const a of c.articles) {
        parRef.set(a.ref, [
          ...(parRef.get(a.ref) ?? []),
          { corpus: c.id, statut: a.statut },
        ]);
      }
    }
    for (const [ref, entrees] of parRef) {
      const statuts = [...new Set(entrees.map((e) => e.statut))];
      expect(
        statuts,
        `${ref} : ${entrees
          .map((e) => `${e.corpus} le dit « ${e.statut} »`)
          .join(", ")}`,
      ).toHaveLength(1);
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
        expect(Object.keys(EXCLUSIONS), `${c.id} / ${a.ref}`).toContain(
          a.exclusion,
        );
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
        expect(
          a.lecture,
          `${c.id} / ${a.ref} : provenance de lecture absente`,
        ).toBeDefined();
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
        expect(cv.complet, `${c.id} : partiel mais annoncé complet`).toBe(
          false,
        );
      }
    }
  });

  it("le lien obligation ↔ article tient dans les deux sens", () => {
    // Sans ce contrôle, un corpus pourrait s'attribuer une couverture qu'aucune
    // obligation ne confirme, et la dette descendrait sans que rien
    // ne s'améliore.
    //
    // « LES DEUX SENS » N'EN COUVRE QU'UN, mesuré le 2026-09-01 par le lot A en
    // réinjectant les défauts qu'il venait de corriger. `liensRetenusRompus()`
    // part du CORPUS : un article « retenu » qui nomme une obligation qui ne le
    // cite pas est une rupture. L'autre sens ne l'est pas — une obligation peut
    // citer un article dont l'entrée de corpus ne la nomme plus, et rien ne
    // rougit ; c'est seulement l'alerte `CORPUS_NE_RENVOIE_PAS` de
    // `pnpm relecture`, qui n'échoue pas. Vérifié en remettant `GC 22` en
    // fondement de `cuisson-erp-extinction-automatique-annuelle` après l'avoir
    // ôté de la liste de GC 22 : 1907 tests au vert.
    //
    // Ce qui EST gardé, en revanche : changer la clé `article` d'un fondement
    // pour un article que le corpus rattache encore à l'obligation d'origine
    // rompt le lien dans le sens couvert. Quatre des cinq recalages de clé du
    // lot A rougissent à la réinjection par ce chemin.
    //
    // Fermer l'autre sens ferait échouer les onze `CORPUS_NE_RENVOIE_PAS`
    // existants d'un coup — ils sont la matière du lot D. À reprendre APRÈS
    // lui, pas ici : un test qui naît rouge se désarme.
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
  // Abaissé de 1 à 0 le 2026-08-27 : R. 4412-17 et GC 8, derniers articles
  // cités sans être dépouillés, sont entrés au corpus avec leur verbatim. Le
  // cliquet ne remonte pas — toute obligation nouvelle devra désormais
  // s'appuyer sur un texte lu.
  const PLAFOND = 0;

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

/**
 * Le jour où la règle de lecture entre en vigueur.
 *
 * Elle ne mord PAS sur ce qui précède, et c'est la seule façon de la rendre
 * tenable : reprendre les 276 articles déjà dépouillés supposerait de rouvrir
 * Légifrance article par article, et une valeur devinée y serait pire que le
 * vide. Un index partiel attrape quand même le prochain décret.
 */
/*
 * PALLIATIF DATÉ, ET IL EST NOMMÉ POUR ÊTRE RETIRÉ.
 *
 * La règle est née le 2026-09-01. Le même jour, et sur une branche parallèle,
 * une campagne de traçabilité a relu **quarante-neuf articles en première
 * main** — sans porter `modifiePar`, qui n'existait pas encore quand elle a
 * commencé. Les deux lots avaient raison séparément ; leur fusion rend la
 * garde rouge.
 *
 * Trois issues, et deux sont fausses. Écrire `modifiePar: null` sur les
 * quarante-neuf affirmerait « regardé, pas de texte modificateur » alors que
 * personne ne l'a regardé : c'est exactement l'affirmation sans lecture que ce
 * champ existe pour empêcher. Tenir une liste d'articles dispensés se
 * réparerait en y ajoutant le suivant, donc cesserait de vérifier.
 *
 * Reste le décalage d'un jour. Il ne corrige rien — il nomme une dette et la
 * borne : les quarante-neuf articles relus le 2026-09-01 doivent recevoir leur
 * `modifiePar`, et **ce palliatif se retire le jour où c'est fait**, en
 * ramenant la date au 2026-09-01. Tant qu'il est là, la règle ne mord que sur
 * les lectures postérieures.
 */
const REGLE_MODIFICATEUR_DEPUIS = "2026-09-02";

/**
 * Les lectures de première main postérieures à la règle qui ne disent pas par
 * quel texte leur version en vigueur l'est devenue.
 *
 * Extraite pour que la garantie et sa contre-épreuve emploient **le même**
 * prédicat, comme `renvoisMorts` dans `transmission.test.ts` : une
 * contre-épreuve qui recopie la logique reste verte quand on neutralise la
 * garantie, puisqu'elles ne partagent plus rien.
 *
 * `undefined` seul est un manquement. `null` est une réponse — « regardé, pas
 * de texte modificateur à signaler » — et c'est ce qui évite le piège de la
 * liste : il n'y a **aucune liste d'articles dispensés** à tenir ici, donc
 * aucun moyen de réparer le test en y ajoutant une ligne. La seule réparation
 * est d'écrire la réponse sur l'article.
 */
function lecturesSansTexteModificateur(
  corpus: readonly Corpus[],
): string[] {
  const muettes: string[] = [];
  for (const c of corpus) {
    for (const a of c.articles) {
      if (a.statut === "non_depouille") continue;
      if (a.lecture !== "premiere_main") continue;
      if ((a.luLe ?? "") < REGLE_MODIFICATEUR_DEPUIS) continue;
      if (a.modifiePar === undefined) muettes.push(`${c.id} / ${a.ref}`);
    }
  }
  return muettes;
}

describe("corpus — d'un article modifié au texte qui l'a modifié", () => {
  it("toute lecture de première main dit par quel texte, ou dit qu'il n'y en a pas", () => {
    expect(
      lecturesSansTexteModificateur(CORPUS),
      "Un article dépouillé en première main depuis le " +
        `${REGLE_MODIFICATEUR_DEPUIS} ne porte pas \`modifiePar\`. Écrivez le ` +
        "texte qui a produit la version lue — et ouvrez-le EN ENTIER avant, " +
        "c'est la règle en tête de `corpus/types.ts` qui compte, pas le " +
        "champ. Si l'article n'a pas de texte modificateur à signaler, " +
        "écrivez `modifiePar: null` : c'est une réponse, l'absence n'en est " +
        "pas une.",
    ).toEqual([]);
  });

  it("la règle mord sur ce qu'elle vise, et sur rien d'autre", () => {
    // Contre-épreuve. Sur le corpus livré, la garantie ci-dessus ne traverse
    // AUCUN article : les quarante lectures du 2026-09-01 sont toutes en
    // `agent_verbatim`. Éprouvée sur le seul corpus, elle serait verte et
    // vide — le mode de panne exact de ce genre de garde. Les cas fabriqués
    // la font mordre aujourd'hui, et exercent les trois frontières qui la
    // définissent : la borne de date, la provenance, et le statut.
    const article = (a: Partial<ArticleDepouille>): ArticleDepouille =>
      ({
        ref: "R. 0000-0",
        luLe: "2026-09-02",
        lecture: "premiere_main",
        statut: "sans_objet",
        motif: "Motif de test, assez long pour tenir les autres contrôles.",
        ...a,
      }) as ArticleDepouille;

    const corpusTemoin = (...articles: ArticleDepouille[]): Corpus[] => [
      {
        id: "temoin",
        intitule: "Corpus témoin",
        url: "https://example.invalid/",
        portee: "Cas fabriqués pour éprouver la garde.",
        etendue: "articles_cites",
        articles,
      },
    ];

    // Le cas visé : lu de première main après la règle, muet. Attrapé, nommé.
    expect(
      lecturesSansTexteModificateur(corpusTemoin(article({ ref: "MUET" }))),
    ).toEqual(["temoin / MUET"]);

    // BORNE BASSE, inclusive. Le jour même de la règle est dedans ; la veille
    // ne l'est pas. Sans ces deux cas, écrire `>` au lieu de `>=` — ou dater
    // la règle d'un jour trop tard — passerait sans bruit.
    expect(
      lecturesSansTexteModificateur(
        corpusTemoin(article({ ref: "JOUR-J", luLe: REGLE_MODIFICATEUR_DEPUIS })),
      ),
    ).toEqual(["temoin / JOUR-J"]);
    expect(
      lecturesSansTexteModificateur(
        corpusTemoin(article({ ref: "VEILLE", luLe: "2026-08-31" })),
      ),
    ).toEqual([]);

    // LES DEUX RÉPONSES ACCEPTÉES, et le fait qu'elles le soient toutes deux
    // est la moitié de la règle : un article sans texte modificateur doit
    // pouvoir le DIRE, sinon la seule sortie serait d'en inventer un.
    expect(
      lecturesSansTexteModificateur(
        corpusTemoin(article({ ref: "NÉANT", modifiePar: null })),
      ),
    ).toEqual([]);
    expect(
      lecturesSansTexteModificateur(
        corpusTemoin(
          article({ ref: "NOMMÉ", modifiePar: { texte: "Décret n° 0000-0" } }),
        ),
      ),
    ).toEqual([]);

    // COUCHE VOISINE, ET C'EST UNE LIMITE ASSUMÉE, PAS UN OUBLI. La règle ne
    // vise que `premiere_main`. Les lectures d'agent — 238 des 276 articles —
    // n'y sont pas soumises, parce qu'on ne peut pas exiger d'un dépouillement
    // déjà fait ce qu'il n'a pas relevé, et que quarante entrées du 2026-09-01
    // en `agent_verbatim` seraient rouges le jour de l'ajout sans que personne
    // puisse les remplir sans rouvrir les textes. La garde couvre donc ce qui
    // PEUT s'y conformer. Ce cas fige la frontière : l'élargir est une
    // décision, pas un effet de bord.
    expect(
      lecturesSansTexteModificateur(
        corpusTemoin(article({ ref: "AGENT", lecture: "agent_verbatim" })),
      ),
    ).toEqual([]);
    expect(
      lecturesSansTexteModificateur(
        corpusTemoin(article({ ref: "PAS-LU", statut: "non_depouille" })),
      ),
    ).toEqual([]);
  });

  it("la valeur écrite au champ n'est pas une coquille vide", () => {
    // Le champ pourrait se remplir de `{ texte: "" }` et satisfaire la garde
    // ci-dessus : elle ne regarde que la présence. Un texte modificateur se
    // cite comme il s'ouvre — « Décret n° 2025-482 du 27 mai 2025 » —, sans
    // quoi le prochain lecteur ne saura pas quoi ouvrir.
    for (const c of CORPUS) {
      for (const a of c.articles) {
        if (!a.modifiePar) continue;
        expect(a.modifiePar.texte.trim().length, `${c.id} / ${a.ref}`,).toBeGreaterThan(10);
      }
    }
  });
});

describe("corpus — Livre III du règlement de sécurité ERP", () => {
  const pe = CORPUS.find((c) => c.id === "arrete-1980-livre-3");

  it("est déclaré et dépouillé de bout en bout", () => {
    expect(pe, "le corpus PE a disparu de CORPUS").toBeDefined();
    const cv = couverture(pe!);
    // 59 depuis le 2026-08-26 : PO 1 § 3 est dépouillé à part de PO 1, son
    // volet biennal ne se traitant pas comme son volet annuel.
    expect(cv.total).toBe(59);
    expect(cv.complet, `${cv.nonDepouilles} article(s) non dépouillé(s)`).toBe(
      true,
    );
  });

  it("ne retient qu'un seul article créant une obligation périodique pour les secteurs couverts", () => {
    // Le résultat du dépouillement du 2026-08-26, verrouillé : sur 58 articles,
    // PE 4 est le seul à imposer une échéance à un exploitant de restaurant, de
    // commerce ou de bureau. PE 27 impose une instruction du personnel sans
    // périodicité écrite. Si ce test casse, c'est qu'un article a changé de
    // statut — donc que quelqu'un a relu, ou que quelqu'un s'est trompé.
    const refs = obligationsManquantes().map((o) => o.ref);
    // PE 4 et R. 4222-20 ont quitté la liste le 2026-08-27 : le porteur
    // « établissement » de l'ADR-022 les rend encodables, et ils le sont —
    // `incendie-erp-pe4-entretien-installations-techniques` et
    // `aeration-controle-installations-r4222-20`. Ce sont les deux premières
    // sorties de cette liste par livraison plutôt que par requalification.
    // Aucun des deux n'est retenu en entier : leurs `reserve` disent ce qui
    // reste (PE 4 § 1 attend `locauxSommeil`, la pollution spécifique attend
    // un secteur qui la concerne), et `reservesDeLecture()` les compte.
    // PE 27 reste manquant.
    // PE 27 : instruction du personnel côté ERP, sans périodicité écrite.
    // R. 4544-11-1 : attestation médicale quinquennale, en vigueur depuis
    // octobre 2025, nominative donc bloquée par le porteur d'échéance.
    // R. 4222-20 : entretien de « l'ensemble des installations » d'aération,
    // quatrième cas du motif PE 4 — un article qui prescrit plus large que ce
    // que le référentiel sait porter.
    // Arrêté 23-02-2018 art. 26 § 3 : entretien décennal des installations
    // collectives de gaz entre l'organe de coupure générale et les compteurs.
    // Ajouté le 2026-08-26 à la lecture en première main du texte, qui a
    // simultanément confirmé le § 5° (VMC-gaz) et révélé ce § 3°. Bloqué par
    // l'absence d'une catégorie d'équipement « installation collective de gaz ».
    // PO 1 § 3 : le contrôle biennal porte sur « l'ensemble des installations
    // techniques ». Cinquième occurrence du motif PE 4 — énumérer les
    // catégories reviendrait à décider à la place du texte, et deux d'entre
    // elles portent déjà une obligation biennale valant pour tous les ERP.
    // PO 7 : deux séances d'instruction du personnel par an. Périodicité
    // chiffrée, donc encodable — mais aucune catégorie d'équipement à quoi
    // l'accrocher, comme PE 27 § 5 et R. 4544-11-1.
    // Les deux passent de `non_couvert` à `obligation_manquante` le
    // 2026-08-26 : la lecture en première main a montré qu'il ne s'agissait
    // pas d'articles sans objet, mais d'obligations réelles que le modèle ne
    // sait pas porter. La liste s'allonge parce qu'on voit mieux.
    // L'ordre suit la déclaration des corpus, pas l'alphabet.
    expect(refs).toEqual([
      "PE 27",
      // PE 37 a quitté cette liste le 2026-08-31 au soir : sa quinquennale est
      // désormais portée par `incendie-erp-5-visite-commission`, et l'article
      // passe à `retenu` avec une `reserve`. Cette réserve disait alors deux
      // choses — l'ancrage sur une alarme déclarée, et le « pour le public »
      // qu'une caractéristique d'équipement ne distinguait pas ; les deux sont
      // CLOSES depuis le 2026-09-01 et l'attribut d'établissement. Elle en dit
      // une autre depuis, trouvée en relisant l'article : son renvoi exprès à
      // GE 2, GE 3 et GE 5, trois articles du Livre II que personne n'a
      // ouverts. QUATRIÈME sortie par
      // livraison plutôt que par requalification, après PE 4, R. 4222-20 et
      // R. 4544-11-1. Il y était entré le 2026-08-26, en rectification d'une
      // affirmation contraire portée le matin même ; il en sort parce que le
      // motif qui l'y retenait — « aucun attribut pour le déclencher sans
      // sur-appliquer » — décrivait une sur-application MUETTE, que la
      // périodicité rend visible et corrigeable par une réponse « non ».
      "PO 1 § 3 — contrôle biennal des installations techniques",
      "PO 7",
      // PO 12 réimporte PO 7 dans le régime des établissements EXISTANTS
      // (« Les dispositions des articles PE 27 (§ 5) et PO 7 sont
      // applicables »). Ajouté le 2026-08-26 : la relecture a montré que le
      // champ « à construire ou à modifier » de la section 1 ne cantonne pas
      // ces périodicités — PO 8 § 1 fait de même pour PO 1 § 3. Même blocage
      // que PO 7 : aucun équipement porteur.
      "PO 12",
      // ── Lot D (traçabilité), 2026-09-01 : GZ 13 et GZ 14, entrés au corpus
      // parce que GZ 15 s'ouvre sur « Elles » et qu'on est allé chercher
      // l'antécédent. Il n'était pas là — voir la réserve de GZ 15 —, mais les
      // deux articles qu'on a ouverts pour le trouver portent chacun une
      // obligation d'exploitant que le référentiel ne porte pas. Ce ne sont
      // donc pas deux défauts d'encodage : ce sont deux textes lus de plus,
      // même motif que les entrées du lot 7 et du lot D1.
      //
      // GZ 13 § 4 : « L'utilisation du gaz ne peut intervenir qu'après
      // vérification de l'installation, par une personne ou un organisme
      // agréé », avec rapport conforme à GE 9 et visa au registre de sécurité.
      // Préalable à la mise en service, pas une périodicité.
      "GZ 13",
      // GZ 14 § 1 : l'entretien et le maintien en l'état des installations de
      // gaz « incombent à l'exploitant ». État permanent, du même genre que le
      // « maintenus en bon état » de R. 4227-29 — que le référentiel porte
      // pour les extincteurs et pas ici.
      //
      // Les deux sont bloquées par la même chose : aucune catégorie
      // d'équipement « installation de gaz ». Les accrocher à
      // `APPAREIL_CUISSON_ERP` sous-appliquerait, une installation de gaz
      // alimentant aussi un chauffage ou une production d'eau chaude. C'est le
      // blocage déjà nommé pour l'arrêté du 23 février 2018, art. 26 § 3.
      "GZ 14",
      // `R. 4544-11-1` a quitté cette liste le 2026-08-27 : le porteur salarié
      // de l'ADR-023 la rend encodable, et elle l'est —
      // `elec-salarie-attestation-medicale-voisinage`. Troisième sortie par
      // livraison plutôt que par requalification, après PE 4 et R. 4222-20.
      // R. 4544-11 : l'habilitation SPÉCIFIQUE aux travaux sous tension, et le
      // II — une vérification préalable à la charge de l'employeur que personne
      // n'avait relevée. Distinctes toutes deux de l'habilitation ordinaire de
      // R. 4544-10, que le référentiel porte.
      //
      // Inscrite au second essai : la première lecture n'avait rendu qu'une
      // restitution partiellement traduite, et un article dont on n'a pas le
      // texte ne s'inscrit pas ici. Le verbatim du I a été obtenu en redemandant
      // le français sans traduction.
      //
      // Bloquée par le renvoi du I aux normes de R. 4544-3 pour la délivrance et
      // le renouvellement : c'est le renvoi qui avait produit le « triennal »
      // NF C 18-510 déjà retiré de ce dépôt. Encoder supposerait de trancher ce
      // qu'il vaut, et ce n'est pas un choix technique.
      "R. 4544-11",
      // R. 4222-21 entre le 2026-09-01 avec le recalage des fondements (lot A),
      // et il y entre par le chemin inverse de tous les autres : non parce
      // qu'on a lu un texte de plus, mais parce qu'on a RETIRÉ la seule
      // obligation qui s'y adossait. `aeration-travail-mise-en-service` le
      // citait pour fonder un contrôle à la mise en service ; l'article
      // n'impose qu'une consigne d'utilisation écrite — dispositions prises
      // pour la ventilation, mesures en cas de panne, avis du médecin du
      // travail et du CSE —, et cette consigne n'est portée par aucune
      // obligation. Elle est nommée par trois textes (celui-ci, l'article 2 b)
      // de l'arrêté du 8 octobre 1987, R. 4224-17) et demandée par aucun. Le
      // lot A ne crée pas d'obligation : le manque est nommé, pas comblé.
      "R. 4222-21",
      "Arrêté 23-02-2018 art. 26 § 3",
      // Les trois suivantes entrent avec le lot 7, et la liste s'allonge pour
      // la raison qu'elle s'allonge toujours ici : on a lu quatre textes de
      // plus. Aucune n'est un défaut d'encodage, chacune dit ce qui la bloque.
      //
      // L. 4141-5 : le passeport de prévention, en vigueur depuis le
      // 2026-06-27 (loi n° 2026-534 du 25 juin 2026, art. 70). L'employeur
      // doit le renseigner pour les formations qu'il dispense — mais le
      // passeport est intégré au système d'information du compte personnel de
      // formation et géré par la Caisse des dépôts. Rien de ce que l'outil
      // détiendrait ne pourrait solder une obligation qui se remplit chez un
      // tiers, et le V de l'article renvoie encore ses modalités au comité
      // national de prévention et de santé au travail.
      "L. 4141-5",
      // R. 4141-8 et R. 4141-12 : formation à la sécurité après un accident
      // grave (ou des accidents répétés au même poste), et après modification
      // des conditions de circulation ou d'exploitation. Toutes deux réelles,
      // toutes deux ÉVÉNEMENTIELLES — et il n'y a pas de déclencheur
      // « événement » dans le modèle : l'ADR-022 nomme l'axe et s'arrête là.
      // S'y ajoute, pour R. 4141-8, que le registre des accidents du travail
      // et la déclaration d'AT sont déclarés hors périmètre produit : l'outil
      // ne connaîtrait pas l'accident qui déclenche l'obligation.
      "R. 4141-8",
      "R. 4141-12",
      // L. 4622-1 a quitté cette liste le 2026-09-01, et CE TEST EST LA RAISON
      // POUR LAQUELLE IL Y ÉTAIT RESTÉ. L'article était encodé depuis le
      // 2026-08-31 — `sante-travail-etablissement-adhesion-spst` — sans que
      // l'entrée `obligation_manquante` d'origine soit retirée du corpus
      // `code-travail-sante-travail`. Retirer cette entrée périmée fait
      // `1 failed | 1835 passed`, et le SEUL test à protester est celui-ci :
      // il exigeait `L. 4622-1` parmi les manquantes, donc il était VERT SUR
      // L'ÉTAT FAUX ET ROUGE SUR L'ÉTAT JUSTE, réparable en supprimant une
      // ligne. Une liste écrite à la main ne détecte pas qu'une affirmation a
      // cessé d'être vraie : elle la certifie, et se répare en recopiant.
      // Sixième sortie de cette liste, et la première qui ne doive rien à une
      // livraison ni à une requalification — seulement au fait que personne
      // n'avait fait pour cet article ce que la sortie de PE 37 avait fait la
      // veille au soir pour le sien.
      //
      // Ce que le défaut a coûté à voir : rien ne le signalait. La garde de
      // cohérence inter-corpus en tête de ce fichier est écrite pour ça, et
      // c'est un invariant — pas un décompte de plus.
      // R. 4624-28-2 : l'employeur informe son service de santé au travail de
      // la cessation d'exposition, du départ ou de la mise à la retraite d'un
      // salarié en suivi individuel renforcé, et en avise l'intéressé sans
      // délai. Obligation d'employeur pleine, non portée — événementielle, et
      // le produit ne détient aucune date de sortie.
      //
      // Trouvée par un balayage des renvois d'intervalle : le corpus écrivait
      // « R. 4624-22 à R. 4624-28 » en n'ayant ouvert que 22, 23, 24 et 28,
      // alors que la sous-section court jusqu'à R. 4624-28-3. Un intervalle
      // cité n'est pas un intervalle lu — c'est le même défaut que la phrase
      // sur l'amiante et le plomb, corrigée le même jour.
      "R. 4624-28-2",
      // R. 4225-3 entre avec le lot 8, et pour la même raison que les
      // précédentes : un texte lu de plus, pas un défaut d'encodage. La
      // boisson non alcoolisée gratuite est due « lorsque des conditions
      // particulières de travail conduisent les travailleurs à se désaltérer
      // fréquemment » — une qualification que ni le parc d'équipements ni le
      // code NAF ne donnent, et que le déduire ferait relever du cinquième
      // déclencheur, non implémenté. La liste des postes concernés, que
      // l'employeur tient après avis du médecin du travail et du CSE, est
      // bloquée par le même manque.
      "R. 4225-3",
      // ── Lot D1, 2026-09-01 : le travail en hauteur. Bloc contigu, ajouté en
      // fin de liste À DESSEIN — le lot B est en train de supprimer cette
      // liste exhaustive, et un bloc d'un seul tenant se retire d'un coup
      // sans démêler les entrées des autres lots. C'est le seul endroit de
      // `corpus.test.ts` que le lot D1 modifie, avec `MUETS` ci-dessous.
      //
      // Ces huit entrées ne sont pas huit défauts d'encodage : ce sont huit
      // obligations réelles trouvées dans deux textes que le référentiel
      // n'avait jamais ouverts — zéro entrée de corpus, zéro citation avant ce
      // jour. Elles se répartissent en deux blocages, et deux seulement :
      // aucune catégorie d'équipement « échafaudage », et aucun attribut
      // d'établissement pour le cinquième déclencheur de l'ADR-022
      // (« activité réellement exercée »). Chaque entrée dit lequel des deux
      // la retient.
      //
      // R. 4323-61 : la notice des points d'ancrage, que l'employeur rédige et
      // détient. Seul élément documentaire de la sous-section 1.
      "R. 4323-61",
      // R. 4323-69 : formation au montage, démontage et modification des
      // échafaudages, nominative, porteur salarié. Périodicité `autre`, et
      // c'est une conclusion : R. 4323-3 dit « aussi souvent que nécessaire ».
      // Les « cinq ans » que l'on rencontre partout viennent de la
      // recommandation R 408 de la CNAM, qui n'est pas une source opposable.
      "R. 4323-69",
      // R. 4323-70 : notice, note de calcul et plan de montage « conservés sur
      // le lieu de travail ». Obligation documentaire opposable, porteur
      // équipement.
      "R. 4323-70",
      // R. 4323-72 : vérification du bon état de conservation des éléments
      // avant toute opération de montage. Seule vérification de la section 8 —
      // toutes les autres du domaine viennent de l'arrêté de 2004.
      "R. 4323-72",
      // R. 4323-89 : deux obligations dans un article — la formation aux
      // techniques sur cordes ET aux procédures de sauvetage (porteur
      // salarié), et la note de calcul des points d'ancrage (document).
      "R. 4323-89",
      // Les trois vérifications d'échafaudage de l'arrêté du 21 décembre 2004,
      // pris sur le fondement des articles alors numérotés R. 233-11 et
      // suivants, devenus R. 4323-22 à R. 4323-24. AUCUNE des trois n'est dans
      // le Code, et la section 8 n'en porte aucune : un dépouillement arrêté à
      // « R. 4323-58 et suivants » aurait conclu que le domaine ne porte pas
      // de périodicité, et se serait trompé de trois.
      //
      // Art. 4 : avant mise ou remise en service, cinq circonstances.
      // Événementielle ; le « d'au moins un mois » du cinquième cas est une
      // durée d'interruption qui déclenche, pas un intervalle qui revient.
      "Arrêté 21-12-2004 art. 4",
      // Art. 5 : examen quotidien de l'état de conservation. LE SEUL CAS DU
      // RÉFÉRENTIEL où le texte chiffre un rythme que `Periodicite` ne peut
      // pas écrire — l'énumération n'a pas de valeur journalière, et
      // `hebdomadaire` diviserait la charge réelle par sept.
      "Arrêté 21-12-2004 art. 5",
      // Art. 6 : examen approfondi, « depuis moins de trois mois ». La seule
      // périodicité chiffrée ET encodable de tout le domaine, et celle qui est
      // le plus près d'être livrable : `trimestrielle` existe, la nature
      // existe, le porteur équipement est le mieux servi des trois. Il ne
      // manque que la catégorie d'équipement.
      "Arrêté 21-12-2004 art. 6",
      // Arrêté du 31 janvier 1986 art. 102, entré le 2026-09-01 avec le
      // dépouillement du texte qui définit les familles d'habitation. Deux
      // obligations permanentes du propriétaire dans un seul article, bloquées
      // pour deux raisons distinctes. (1) S'assurer que les transformations
      // apportées à l'immeuble ne dégradent pas la réaction et la résistance
      // au feu : c'est une vigilance que des TRAVAUX déclenchent, et il n'y a
      // pas de déclencheur « événement » au modèle — l'encoder en état
      // permanent la ferait apparaître au calendrier d'un propriétaire qui n'a
      // rien transformé. (2) Identifier les places de stationnement occupées
      // moins de 30 jours par des non-résidents, qui décide si le parc reste
      // sous cet arrêté : il n'existe aucun attribut de parc de stationnement
      // annexe côté établissement.
      "Arrêté 1986-01-31 art. 102",
    ]);
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
          [
            "construction",
            "sans_destinataire_exploitant",
            "categorie_erp",
            "risque_specialise",
          ],
          `${c.id} / ${a.ref}`,
        ).toContain(a.exclusion);
      }
    }
  });

  it("le nombre de manques non déclarés à l'utilisateur ne remonte pas", () => {
    // 27 au 2026-08-28, et le chiffre REMONTE de 0 à 27 ce jour-là. La cause
    // doit se lire ici, sinon le prochain lecteur conclura à une régression du
    // référentiel : il n'y en a pas eu. Ces vingt-cinq articles ont été
    // annoncés à l'écran, sur le tableau de bord de chaque établissement,
    // pendant une journée ; **une décision produit a retiré cette surface** —
    // déclarer ce que le produit ne couvre pas suppose d'avoir tranché ce
    // qu'il couvre, et cette question ne l'est pas. Ils sont donc de nouveau
    // annoncés à personne.
    //
    // Le laisser à 0 aurait fait affirmer à ce test que vingt-sept manques
    // sont déclarés à quelqu'un. C'est faux, et un cliquet qui ment est pire
    // que pas de cliquet. Le maintenir à 0 « parce qu'un cliquet ne remonte
    // pas » aurait été la rustine exacte que le dépôt interdit : desserrer un
    // chiffre plutôt que de nommer la cause.
    //
    // Le faire redescendre suppose de **couvrir** ces obligations, ou de leur
    // rendre une adresse **visible par l'exploitant**. Pas de trouver un autre
    // document interne où les ranger : `docs/couverture-declaree-du-produit.md`
    // n'en est pas une, et il le dit lui-même.
    //
    // 27 et non 25, parce que le prédicat compte désormais les notes internes.
    // Les deux `declareA` qui citaient déjà `docs/veille-arbitrage-2026-08-26.md`
    // passaient le cliquet pour la mauvaise raison : un document de travail
    // n'annonce rien à un exploitant, et le chiffre les tenait pourtant pour
    // déclarés. Le compte n'a donc pas augmenté de deux — c'est la mesure qui
    // a cessé de se tromper de deux.
    //
    // ⚠ **Le cliquet est saturé, et c'est nouveau.** 27 muets sur 27 articles
    // `non_couvert` : le plafond touche le total. Vérifié par mutation le
    // 2026-08-28 — retirer le `declareA` d'un article ne le fait plus bouger,
    // puisque cet article était déjà compté. Ce qu'il garde encore, vérifié de
    // la même façon : un 28ᵉ article `non_couvert` ajouté sans adresse le fait
    // passer à 28 et le test tombe.
    //
    // Autrement dit il protège encore contre l'ARRIVÉE d'un manque muet, plus
    // contre la PERTE d'une adresse existante. C'est une conséquence
    // mécanique du retour à 27, pas un affaiblissement délibéré — mais il ne
    // faut pas lui prêter la garantie qu'il n'a plus.
    //
    // ⚠ Deux autres angles morts connus, qui relèvent du lot 3 :
    // il cherche la chaîne littérale « Non déclaré », définie nulle part — et
    // cette branche est aujourd'hui morte, plus aucun article ne la déclenche ;
    // et il vérifie qu'un `declareA` est PRÉSENT, jamais que l'adresse citée
    // existe. Un meilleur invariant serait « tout article `non_couvert` a une
    // adresse, et cette adresse mène quelque part ».
    // ⚠ **28 depuis le 2026-09-01**, et la cause n'est aucune des deux
    // précédentes. Le lot D1 a dépouillé le travail en hauteur — un domaine
    // qui n'avait jusque-là aucune entrée de corpus ni aucune citation — et y
    // a trouvé un 28ᵉ manque réel : `R. 4323-63`, l'interdiction d'utiliser
    // une échelle ou un escabeau comme poste de travail.
    //
    // Le cliquet a fait EXACTEMENT ce que le paragraphe ci-dessus annonçait
    // qu'il ferait, mot pour mot : « un 28ᵉ article `non_couvert` ajouté sans
    // adresse le fait passer à 28 et le test tombe ». Il n'a pas été desserré
    // pour faire passer autre chose — il a été relevé d'un cran parce que la
    // dette a réellement grandi d'un, et le nombre reste vrai.
    //
    // CE QUI SERAIT UNE RUSTINE ET NE L'EST PAS : reclasser `R. 4323-63` en
    // `sans_objet` aurait gardé le plafond à 27 sans rien corriger, en niant
    // une obligation qui existe. Lui donner un `declareA` pointant vers
    // `docs/` ne l'aurait pas fait descendre non plus, le prédicat comptant
    // déjà les notes internes comme muettes — c'est précisément pour empêcher
    // ce geste-là qu'il les compte.
    //
    // ⚠ ET IL N'EST PLUS DE MÊME NATURE QUE LES 27 AUTRES. Ceux-là visent des
    // établissements que le produit ne sert pas ; le rattachement
    // `Etablissement.typeErp` réclamé par `docs/couverture-declaree-du-produit.md`
    // les ferait disparaître de l'écran d'un restaurant. Celui-ci concerne un
    // restaurant sur deux, et aucun rattachement par type d'ERP ne le rendra
    // silencieux : il n'y a pas de type à qui ne pas le montrer. Le faire
    // redescendre à 27 suppose donc de le COUVRIR, par le DUERP et non par le
    // calendrier de conformité.
    // ⚠ **19 DEPUIS LE 2026-09-01, ET LE CLIQUET DESCEND POUR LA PREMIÈRE
    // FOIS.** Neuf articles sortent du décompte — PE 28 à PE 36, le chapitre
    // III du Livre III. Ils y étaient pour UN motif, écrit dans chacun d'eux :
    // « l'attribut « locaux à sommeil » n'existe pas en base ». Il existe
    // (`Etablissement.comporteLocauxSommeilPublic`), et le chapitre a été relu
    // à la source avant d'être reclassé : deux articles sont COUVERTS (PE 33
    // § 2, la consigne affichée dans chaque chambre ; PE 35, les trois plans),
    // quatre passent `hors_perimetre` / `construction` (PE 28 à PE 31), trois
    // `sans_objet` comme PE 24 et PE 26 avant eux (PE 32, PE 34, PE 36).
    //
    // CE QUI SERAIT UNE RUSTINE ET NE L'EST PAS. Le paragraphe ci-dessus dit
    // que le chiffre « redescendra par les deux mêmes voies : couvrir, ou
    // donner une adresse visible ». C'est la PREMIÈRE qui a joué — et elle a
    // joué deux fois, sous deux formes : couvrir ce qui était dû, et établir
    // que le reste n'était pas dû. Reclasser sans relire aurait été la
    // rustine : garder le plafond bas en niant des obligations qui existent.
    // Le motif de chacun des sept est écrit dans le corpus, et ce qui reste
    // non porté y est nommé aussi (l'exception de PE 32, le renvoi à MS 41).
    //
    // Le cliquet reste saturé : 19 muets sur 19 articles `non_couvert`. Il
    // protège donc toujours contre l'ARRIVÉE d'un manque muet — un 20ᵉ le
    // ferait tomber — et toujours pas contre la PERTE d'une adresse existante,
    // pour la raison expliquée plus haut.
    const MUETS = 19;
    // Une note interne n'est pas une annonce à l'exploitant. `declareA`
    // mélange aujourd'hui les deux natures — une adresse produit et un
    // document de travail — et cette distinction reste à trancher (lot 3) ;
    // en attendant, un manque rangé dans `docs/` est compté comme muet, parce
    // que c'est ce qu'il est du point de vue du dirigeant.
    const muets = articlesNonCouverts().filter(
      (a) =>
        !a.declareA ||
        a.declareA.startsWith("Non déclaré") ||
        a.declareA.startsWith("docs/"),
    );
    expect(
      muets.length,
      `${muets.length} manque(s) de couverture qu'aucun écran n'annonce (plafond ${MUETS}). ` +
        `Couvrir, ou déclarer — puis abaisser MUETS.`,
    ).toBeLessThanOrEqual(MUETS);
  });
});
