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
      // PE 37 : SEUL article du Livre III fixant une périodicité de visite de
      // commission — cinq ans. Ajouté le 2026-08-26 en rectification d'une
      // affirmation contraire portée le matin même. Fondé, mais sans attribut
      // « locaux à sommeil » pour le déclencher sans sur-appliquer.
      "PE 37",
      "PO 1 § 3 — contrôle biennal des installations techniques",
      "PO 7",
      // PO 12 réimporte PO 7 dans le régime des établissements EXISTANTS
      // (« Les dispositions des articles PE 27 (§ 5) et PO 7 sont
      // applicables »). Ajouté le 2026-08-26 : la relecture a montré que le
      // champ « à construire ou à modifier » de la section 1 ne cantonne pas
      // ces périodicités — PO 8 § 1 fait de même pour PO 1 § 3. Même blocage
      // que PO 7 : aucun équipement porteur.
      "PO 12",
      // `R. 4544-11-1` a quitté cette liste le 2026-08-27 : le porteur salarié
      // de l'ADR-023 la rend encodable, et elle l'est —
      // `elec-salarie-attestation-medicale-voisinage`. Troisième sortie par
      // livraison plutôt que par requalification, après PE 4 et R. 4222-20.
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
    const MUETS = 27;
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
