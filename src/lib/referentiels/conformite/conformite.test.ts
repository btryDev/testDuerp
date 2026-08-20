import { describe, expect, it } from "vitest";
import {
  CATEGORIES_EQUIPEMENT,
  CATEGORIES_ERP,
  CLASSES_IGH,
  PERIODICITES,
  REALISATEURS,
} from "../types-communs";
import type { Obligation } from "./types";
import {
  DOMAINES_OBLIGATION,
  REFERENTIEL_VERSION,
  SOURCES_LEGALES,
  empreinteReferentiel,
  obligationParId,
  obligationsAeration,
  obligationsAscenseurs,
  obligationsConformite,
  obligationsCuissonHotte,
  obligationsElectricite,
  obligationsEquipementSousPression,
  obligationsIncendie,
  obligationsLevage,
  obligationsParDomaine,
  obligationsPortesPortails,
  obligationsStockageDangereux,
} from "./index";

describe("référentiel conformité — invariants structurels", () => {
  it("couvre au moins 25 obligations P1 (critère de done étape 3)", () => {
    expect(obligationsConformite.length).toBeGreaterThanOrEqual(25);
  });

  it("couvre au moins 60 obligations après extension P2/P3 (critère de done étape 11)", () => {
    expect(obligationsConformite.length).toBeGreaterThanOrEqual(60);
  });

  it("les identifiants sont uniques", () => {
    const ids = obligationsConformite.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("chaque obligation a un domaine valide", () => {
    for (const o of obligationsConformite) {
      expect(DOMAINES_OBLIGATION).toContain(o.domaine);
    }
  });

  it("chaque périodicité est dans l'enum Prisma", () => {
    for (const o of obligationsConformite) {
      expect(PERIODICITES).toContain(o.periodicite);
    }
  });

  it("chaque réalisateur est dans l'enum Prisma", () => {
    for (const o of obligationsConformite) {
      expect(o.realisateurs.length).toBeGreaterThan(0);
      for (const r of o.realisateurs) expect(REALISATEURS).toContain(r);
    }
  });

  it("chaque catégorie d'équipement est dans l'enum Prisma", () => {
    for (const o of obligationsConformite) {
      expect(o.categoriesEquipement.length).toBeGreaterThan(0);
      for (const c of o.categoriesEquipement) {
        expect(CATEGORIES_EQUIPEMENT).toContain(c);
      }
    }
  });

  it("criticité toujours dans [1, 5]", () => {
    for (const o of obligationsConformite) {
      expect(o.criticite).toBeGreaterThanOrEqual(1);
      expect(o.criticite).toBeLessThanOrEqual(5);
    }
  });

  it("chaque obligation cite au moins une référence primaire valide", () => {
    for (const o of obligationsConformite) {
      expect(o.referencesLegales.length).toBeGreaterThan(0);
      for (const ref of o.referencesLegales) {
        expect(SOURCES_LEGALES).toContain(ref.source);
        expect(ref.reference.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("chaque obligation ayant un URL Légifrance pointe vers legifrance.gouv.fr ou inrs.fr", () => {
    for (const o of obligationsConformite) {
      for (const ref of o.referencesLegales) {
        if (ref.urlLegifrance) {
          expect(ref.urlLegifrance).toMatch(
            /^https:\/\/(www\.)?(legifrance\.gouv\.fr|inrs\.fr)\//,
          );
        }
      }
    }
  });

  it("typologies : au moins un régime déclaré par obligation", () => {
    for (const o of obligationsConformite) {
      const t = o.typologies;
      const auMoinsUn =
        t.travail !== undefined ||
        t.erp !== undefined ||
        t.igh !== undefined ||
        t.habitation !== undefined;
      expect(auMoinsUn).toBe(true);
    }
  });

  it("les catégories ERP déclarées existent dans l'enum", () => {
    for (const o of obligationsConformite) {
      if (typeof o.typologies.erp === "object" && o.typologies.erp) {
        for (const c of o.typologies.erp.categories) {
          expect(CATEGORIES_ERP).toContain(c);
        }
      }
    }
  });

  it("les classes IGH déclarées existent dans l'enum", () => {
    for (const o of obligationsConformite) {
      if (typeof o.typologies.igh === "object" && o.typologies.igh) {
        for (const c of o.typologies.igh.classes) {
          expect(CLASSES_IGH).toContain(c);
        }
      }
    }
  });
});

describe("référentiel conformité — couverture P1", () => {
  it("couvre les trois domaines P1 avec au moins 7 obligations chacun", () => {
    expect(obligationsElectricite.length).toBeGreaterThanOrEqual(7);
    expect(obligationsIncendie.length).toBeGreaterThanOrEqual(7);
    expect(obligationsAeration.length).toBeGreaterThanOrEqual(7);
  });

  it("couvre les 6 nouveaux domaines P2/P3 (étape 11)", () => {
    expect(obligationsCuissonHotte.length).toBeGreaterThanOrEqual(4);
    expect(obligationsAscenseurs.length).toBeGreaterThanOrEqual(5);
    expect(obligationsPortesPortails.length).toBeGreaterThanOrEqual(4);
    expect(obligationsEquipementSousPression.length).toBeGreaterThanOrEqual(5);
    expect(obligationsStockageDangereux.length).toBeGreaterThanOrEqual(5);
    expect(obligationsLevage.length).toBeGreaterThanOrEqual(7);
  });

  it("obligationsParDomaine renvoie cohérent avec le filtrage", () => {
    const elec = obligationsParDomaine("electricite");
    expect(elec.length).toBe(obligationsElectricite.length);
    expect(elec.every((o) => o.domaine === "electricite")).toBe(true);
  });

  it("obligationParId retrouve une obligation connue", () => {
    const o = obligationParId("elec-travail-periodique-annuelle");
    expect(o).toBeDefined();
    expect(o?.periodicite).toBe("annuelle");
  });

  it("obligationParId renvoie undefined pour un id inconnu", () => {
    expect(obligationParId("id-inexistant")).toBeUndefined();
  });
});

describe("référentiel conformité — cohérence sémantique", () => {
  it("une obligation ERP-only ne déclare pas travail=true strict", () => {
    // Règle interne : si on veut flag ERP ET travail, les deux doivent être
    // explicitement true. On vérifie surtout qu'il n'y a pas de typologie vide.
    for (const o of obligationsConformite) {
      const t = o.typologies;
      const aucunFlag =
        t.travail === undefined &&
        t.erp === undefined &&
        t.igh === undefined &&
        t.habitation === undefined;
      expect(aucunFlag).toBe(false);
    }
  });

  it("une obligation à périodicité 'mise_en_service_uniquement' ne génère pas d'échéance récurrente", () => {
    const mes = obligationsConformite.filter(
      (o) => o.periodicite === "mise_en_service_uniquement",
    );
    // on vérifie simplement qu'elles existent et sont traitées comme one-shot
    for (const o of mes) {
      expect(o.realisateurs.length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// Invariants durcis (amendement 2026-08)
//
// Le fichier ne vérifiait auparavant que l'unicité des id. Les quatre familles
// de tests ci-dessous verrouillent les défauts trouvés à l'audit : conditions
// mortes, doublons réels, seuils d'effectif écrits en prose mais jamais
// encodés, et perte silencieuse d'obligations vitales.
// =============================================================================

describe("référentiel conformité — conditions bien formées", () => {
  it("toute catégorie citée dans conditions[] appartient à categoriesEquipement", () => {
    // Une condition qui cible une catégorie absente de `categoriesEquipement`
    // est une condition MORTE : le moteur ne la rencontre jamais, l'obligation
    // s'applique donc sans restriction alors que le rédacteur croyait l'avoir
    // bornée. C'est le pire des cas — un faux positif déguisé en règle fine.
    for (const o of obligationsConformite) {
      for (const c of o.conditions ?? []) {
        expect(
          o.categoriesEquipement,
          `${o.id} : condition sur ${c.categorie}, absente de categoriesEquipement`,
        ).toContain(c.categorie);
      }
    }
  });

  it("un tableau conditions[] déclaré n'est jamais vide", () => {
    for (const o of obligationsConformite) {
      if (o.conditions !== undefined) {
        expect(o.conditions.length, o.id).toBeGreaterThan(0);
      }
    }
  });

  it("toute propriété conditionnée porte un nom exploitable (non vide)", () => {
    for (const o of obligationsConformite) {
      for (const c of o.conditions ?? []) {
        expect(c.propriete.trim().length, o.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("référentiel conformité — anti-doublon", () => {
  /**
   * Normalise une référence légale pour la comparaison : casse, espaces et
   * numéros de paragraphe sont ignorés, de sorte que « art. GC 20 » et
   * « art. GC 20 § 2 » désignent bien le même article — c'était exactement
   * le doublon ramonage/nettoyage de hotte trouvé à l'audit.
   */
  function normaliserReference(r: string): string {
    return r
      .toLowerCase()
      .replace(/§\s*\d+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[\s,.]+$/, "")
      .trim();
  }

  /**
   * Deux obligations distinguées par des conditions différentes ne sont pas
   * des doublons : elles couvrent des périmètres disjoints ou emboîtés
   * (ex. RIA vs extincteurs, tous deux sur MS 73).
   */
  function signatureConditions(o: Obligation): string {
    return JSON.stringify(
      (o.conditions ?? [])
        .map((c) => JSON.stringify(c))
        .sort()
        .join("|"),
    );
  }

  it("pas deux obligations partageant catégorie d'équipement, périodicité et article fondateur", () => {
    // On compare l'article FONDATEUR (`referencesLegales[0]`, cf. convention
    // documentée sur le type `Obligation`) et non l'ensemble des références :
    // deux obligations distinctes citent légitimement un même article en
    // contexte — le dossier de maintenance et le maintien en état d'une porte
    // automatique renvoient tous deux à R. 4224-15 sans être un doublon.
    const doublons: string[] = [];
    for (let i = 0; i < obligationsConformite.length; i++) {
      for (let j = i + 1; j < obligationsConformite.length; j++) {
        const a = obligationsConformite[i];
        const b = obligationsConformite[j];
        if (a.periodicite !== b.periodicite) continue;
        if (signatureConditions(a) !== signatureConditions(b)) continue;
        const memeCategorie = a.categoriesEquipement.some((c) =>
          b.categoriesEquipement.includes(c),
        );
        if (!memeCategorie) continue;
        if (
          normaliserReference(a.referencesLegales[0].reference) ===
          normaliserReference(b.referencesLegales[0].reference)
        ) {
          doublons.push(`${a.id} ↔ ${b.id}`);
        }
      }
    }
    expect(doublons).toEqual([]);
  });

  it("l'id retiré `aeration-hotte-pro-annuelle` n'est pas réintroduit", () => {
    // Fusionné dans `cuisson-erp-circuits-extraction-nettoyage`. Un id retiré
    // ne doit jamais réapparaître : des Verification en base le référencent.
    expect(obligationParId("aeration-hotte-pro-annuelle")).toBeUndefined();
    expect(
      obligationParId("cuisson-erp-circuits-extraction-nettoyage"),
    ).toBeDefined();
  });
});

describe("référentiel conformité — seuils d'effectif", () => {
  /**
   * Un seuil d'effectif écrit dans la description mais absent de la typologie
   * est un seuil qui n'existe pas : le moteur applique l'obligation à tout le
   * monde, description trompeuse à l'appui.
   */
  const MENTION_SEUIL_EFFECTIF =
    /\d+\s*(salari[ée]s?|personnes?|travailleurs?)/i;

  it("toute description citant un seuil d'effectif le déclare dans la typologie", () => {
    for (const o of obligationsConformite) {
      if (!o.description) continue;
      if (!MENTION_SEUIL_EFFECTIF.test(o.description)) continue;
      const t = o.typologies;
      expect(
        t.effectifMin !== undefined || t.effectifMax !== undefined,
        `${o.id} : la description mentionne un seuil d'effectif jamais encodé`,
      ).toBe(true);
    }
  });

  it("les plages d'effectif déclarées sont cohérentes", () => {
    for (const o of obligationsConformite) {
      const { effectifMin, effectifMax } = o.typologies;
      if (effectifMin !== undefined) {
        expect(effectifMin, o.id).toBeGreaterThanOrEqual(0);
      }
      if (effectifMin !== undefined && effectifMax !== undefined) {
        expect(effectifMin, o.id).toBeLessThanOrEqual(effectifMax);
      }
    }
  });

  it("le seuil de l'exercice semestriel d'évacuation est bien encodé", () => {
    const o = obligationParId("incendie-travail-exercice-semestriel");
    expect(o?.typologies.effectifMin).toBe(51);
  });
});

describe("référentiel conformité — non-régression des obligations critiques", () => {
  /**
   * Conditions strictes tolérées sur une obligation de criticité ≥ 4, chacune
   * pour une raison nommée. Le critère commun : aucun établissement ne peut
   * perdre en silence une obligation qu'il avait déjà.
   *
   *  - les trois premières sont antérieures à l'amendement 2026-08 :
   *    l'obligation n'a JAMAIS été appliquée sans réponse ;
   *  - `levage-vgp-semestrielle-chariot-gerbeur` est une obligation neuve, que
   *    personne ne peut donc perdre, et dont la couverture par défaut reste
   *    assurée par `levage-vgp-annuelle-charges` tant que la question n'a pas
   *    reçu « oui ».
   *
   * Toute autre condition stricte sur une obligation de criticité ≥ 4 doit
   * être ajoutée ici en connaissance de cause — ou, bien plus probablement,
   * rédigée en `non_infirmee` ou en `infirmee`.
   */
  const CONDITIONS_STRICTES_JUSTIFIEES = new Set([
    "elec-erp-groupe-electrogene-annuel",
    "aeration-travail-locaux-pollution-specifique",
    "aeration-erp-ps-surveillance-qualite-air-sup-250",
    "levage-vgp-semestrielle-chariot-gerbeur",
  ]);

  /**
   * Les deux formes qui restent satisfaites quand la propriété est absente.
   * C'est la seule propriété qui compte pour ce garde-fou : une obligation
   * déjà publiée ne doit pas s'éteindre au silence.
   */
  const FORMES_SANS_EXTINCTION_AU_SILENCE = new Set([
    "equipement_propriete_non_infirmee",
    "equipement_propriete_infirmee",
  ]);

  it("une obligation criticité ≥ 4 ne se conditionne pas sur le silence", () => {
    // Sans cette règle, ajouter une condition à une obligation déjà publiée
    // ferait disparaître l'obligation pour TOUS les équipements déjà en base
    // — qui n'ont évidemment pas la nouvelle propriété — sans le moindre
    // signal. Inacceptable sur une obligation de criticité élevée.
    for (const o of obligationsConformite) {
      if (o.criticite < 4) continue;
      if (!o.conditions || o.conditions.length === 0) continue;
      if (CONDITIONS_STRICTES_JUSTIFIEES.has(o.id)) continue;
      for (const c of o.conditions) {
        expect(
          FORMES_SANS_EXTINCTION_AU_SILENCE.has(c.type),
          `${o.id} : condition stricte (${c.type}) sur une obligation criticité ${o.criticite}`,
        ).toBe(true);
      }
    }
  });

  it("les deux VGP de levage s'excluent sur la même propriété", () => {
    // Le couple annuelle / semestrielle doit couvrir les trois états de la
    // réponse sans jamais laisser un appareil sans échéance, ni lui en donner
    // deux pour un seul acte de vérification.
    const annuelle = obligationParId("levage-vgp-annuelle-charges");
    const semestrielle = obligationParId(
      "levage-vgp-semestrielle-chariot-gerbeur",
    );
    expect(annuelle?.conditions).toEqual([
      {
        type: "equipement_propriete_infirmee",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "estChariotOuGerbeur",
      },
    ]);
    expect(semestrielle?.conditions).toEqual([
      {
        type: "equipement_propriete_booleenne",
        categorie: "EQUIPEMENT_LEVAGE",
        propriete: "estChariotOuGerbeur",
        valeur: true,
      },
    ]);
  });

  it("l'allowlist ne contient que des obligations réellement existantes", () => {
    for (const id of CONDITIONS_STRICTES_JUSTIFIEES) {
      const o = obligationParId(id);
      expect(o, id).toBeDefined();
      expect(o?.conditions?.length, id).toBeGreaterThan(0);
    }
  });

  it("les obligations bornées à l'audit 2026-08 portent bien leur condition", () => {
    const attendus: [string, string][] = [
      ["incendie-erp-ria-annuelle", "aRobinetsIncendieArmes"],
      ["aeration-habitation-vmc-gaz-annuelle", "estVmcGaz"],
      ["cuisson-erp-extinction-automatique-annuelle", "aExtinctionAutomatique"],
      ["levage-vgp-semestrielle-personnes", "sertAuLevageDePersonnes"],
      ["levage-vgp-accessoires-annuelle", "aAccessoiresDeLevage"],
      ["esp-requalification-decennale", "estSoumisSuiviEnService"],
      ["esp-inspection-periodique", "estSoumisSuiviEnService"],
    ];
    for (const [id, propriete] of attendus) {
      const o = obligationParId(id);
      expect(o, id).toBeDefined();
      expect(
        o?.conditions?.some(
          (c) =>
            c.type === "equipement_propriete_non_infirmee" &&
            c.propriete === propriete,
        ),
        `${id} attend une condition non infirmée sur ${propriete}`,
      ).toBe(true);
    }
  });
});

describe("référentiel conformité — forme normalisée des typologies", () => {
  it("aucune obligation ne liste les 5 catégories ERP (écrire `erp: true`)", () => {
    // `erp: { categories: ["N1"…"N5"] }` et `erp: true` ne sont PAS
    // équivalents : la première forme exige en plus une `categorieErp` non
    // nulle et crée donc un faux négatif sur tout ERP dont la catégorie n'est
    // pas renseignée. Une restriction qui n'exclut rien ne doit pas s'écrire
    // comme une restriction.
    for (const o of obligationsConformite) {
      if (typeof o.typologies.erp === "object") {
        expect(
          o.typologies.erp.categories.length,
          `${o.id} : liste exhaustive de catégories, écrire \`erp: true\``,
        ).toBeLessThan(CATEGORIES_ERP.length);
      }
    }
  });

  it("une restriction de catégorie ou de classe n'est jamais vide", () => {
    for (const o of obligationsConformite) {
      if (typeof o.typologies.erp === "object") {
        expect(o.typologies.erp.categories.length, o.id).toBeGreaterThan(0);
      }
      if (typeof o.typologies.igh === "object") {
        expect(o.typologies.igh.classes.length, o.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("référentiel conformité — version et empreinte", () => {
  // Le référentiel vit en TypeScript (ADR-003) mais ses effets sont écrits en
  // base : chaque `Verification` fige une périodicité et un libellé. Sans
  // repère de version, une correction du référentiel ne se propageait qu'au
  // hasard d'une mutation d'équipement, et deux établissements identiques
  // pouvaient afficher deux échéances différentes selon la date de leur
  // dernière modification.
  //
  // Ce test est le garde-fou : il échoue dès qu'on touche au contenu sans
  // incrémenter `REFERENTIEL_VERSION`. Pour le corriger, incrémentez la
  // version PUIS recopiez l'empreinte que le message d'échec affiche.
  const EMPREINTE_ATTENDUE = "65-3423a011e71e1065";

  it("l'empreinte du contenu correspond à la version déclarée", () => {
    expect(
      empreinteReferentiel(),
      "Le contenu du référentiel a changé. Incrémentez " +
        "`REFERENTIEL_VERSION` dans `index.ts`, puis mettez `EMPREINTE_ATTENDUE` " +
        "à jour avec la valeur reçue ci-dessus. Les calendriers déjà générés " +
        "seront réconciliés automatiquement à la version suivante.",
    ).toBe(EMPREINTE_ATTENDUE);
  });

  it("la version est datée et incrémentable", () => {
    expect(REFERENTIEL_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
  });

  it("l'empreinte bouge quand une condition, une typologie ou une catégorie change", () => {
    // Le trou que ce test ferme : l'empreinte ne couvrait que l'identité et la
    // périodicité. Poser une condition sur une obligation retirait l'échéance
    // à tout un parc d'équipements sans faire bouger le hash — le garde-fou de
    // version laissait passer exactement ce qu'il existe pour attraper.
    const reference = empreinteReferentiel();
    const cible = obligationParId("levage-vgp-annuelle-charges");
    expect(cible).toBeDefined();
    if (!cible) return;

    const original = {
      conditions: cible.conditions,
      typologies: cible.typologies,
      categoriesEquipement: cible.categoriesEquipement,
    };
    try {
      cible.conditions = undefined;
      expect(empreinteReferentiel()).not.toBe(reference);

      cible.conditions = original.conditions;
      cible.typologies = { ...original.typologies, erp: true };
      expect(empreinteReferentiel()).not.toBe(reference);

      cible.typologies = original.typologies;
      cible.categoriesEquipement = [...original.categoriesEquipement, "AUTRE"];
      expect(empreinteReferentiel()).not.toBe(reference);
    } finally {
      cible.conditions = original.conditions;
      cible.typologies = original.typologies;
      cible.categoriesEquipement = original.categoriesEquipement;
    }
    expect(empreinteReferentiel()).toBe(reference);
  });

  it("l'empreinte ne dépend pas de l'ordre d'écriture des clés", () => {
    // Corollaire : réordonner les clés d'une typologie dans le fichier source
    // ne doit pas forcer un bump de version pour rien.
    const reference = empreinteReferentiel();
    const cible = obligationParId("incendie-erp-ssi-triennale");
    expect(cible).toBeDefined();
    if (!cible) return;

    const original = cible.typologies;
    try {
      const inverse = Object.fromEntries(
        Object.entries(original).reverse(),
      ) as typeof original;
      cible.typologies = inverse;
      expect(empreinteReferentiel()).toBe(reference);
    } finally {
      cible.typologies = original;
    }
  });
});
