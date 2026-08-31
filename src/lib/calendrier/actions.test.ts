// Régénération du calendrier — tests de bout en bout de la server action,
// sur une base Prisma simulée en mémoire.
//
// Ce qui est vérifié ici ne peut pas l'être sur la seule fonction pure : c'est
// la **conservation des lignes** au fil des régénérations successives. Les
// cascades (`Action.verificationId`, `RapportVerification.verificationId` en
// `onDelete: Cascade`) sont des comportements de la base ; le test les
// représente par le fait qu'une ligne de vérification porteuse de preuve ne
// disparaît jamais du magasin. Tant que la ligne vit, l'action vit.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { REFERENTIEL_VERSION } from "@/lib/referentiels/conformite";
import type { ObligationApplicable } from "@/lib/matching";
import type { Obligation } from "@/lib/referentiels/conformite/types";
import { porteurDe } from "@/lib/referentiels/conformite/types";

type LigneFausse = {
  id: string;
  etablissementId: string;
  equipementId: string;
  obligationId: string;
  libelleObligation: string;
  periodicite: string;
  realisateurRequis: string[];
  datePrevue: Date;
  dateRealisee: Date | null;
  statut: string;
  nbRapports: number;
  nbActions: number;
};

// `vi.hoisted` : les fabriques de `vi.mock` sont remontées en tête de module,
// elles ne peuvent donc pas capturer une variable déclarée plus bas.
const h = vi.hoisted(() => {
  const db = {
    /** Titres de salariés déclarés (ADR-023). Vide par défaut. */
    titres: [] as unknown[],
    etablissement: null as Record<string, unknown> | null,
    verifications: [] as LigneFausse[],
    obligations: [] as unknown[],
  };
  let seq = 0;

  const verification = {
    findMany: async ({ where }: { where: { etablissementId: string } }) =>
      db.verifications
        .filter((v) => v.etablissementId === where.etablissementId)
        .map((v) => ({
          ...v,
          _count: { rapports: v.nbRapports, actions: v.nbActions },
        })),
    deleteMany: async ({ where }: { where: { id: { in: string[] } } }) => {
      const ids = where.id.in;
      const avant = db.verifications.length;
      db.verifications = db.verifications.filter((v) => !ids.includes(v.id));
      return { count: avant - db.verifications.length };
    },
    createMany: async ({ data }: { data: Record<string, unknown>[] }) => {
      for (const d of data) {
        db.verifications.push({
          id: `v-${++seq}`,
          dateRealisee: null,
          nbRapports: 0,
          nbActions: 0,
          ...d,
        } as LigneFausse);
      }
      return { count: data.length };
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => {
      const v = db.verifications.find((x) => x.id === where.id);
      if (!v) throw new Error(`Ligne ${where.id} introuvable`);
      Object.assign(v, data);
      return v;
    },
  };

  const prisma: Record<string, unknown> = {
    etablissement: {
      findUnique: async () => db.etablissement,
      // La réconciliation estampille l'établissement avec la version du
      // référentiel qu'elle vient d'appliquer, dans la même transaction que
      // le plan : c'est ce qui permet de détecter, au prochain affichage,
      // qu'un calendrier a été généré avec un référentiel antérieur.
      update: async ({ data }: { data: Record<string, unknown> }) => {
        if (db.etablissement) Object.assign(db.etablissement, data);
        return db.etablissement;
      },
    },
    verification,
    // Les titres déclarés (ADR-023). Aucun dans ces scénarios : ils portent
    // tous sur des obligations d'équipement. La table doit exister quand même,
    // `genererCalendrier` la lisant systématiquement — sans elle, l'erreur est
    // un « Cannot read properties of undefined » qui ne nomme rien.
    titreSalarie: {
      findMany: async () => db.titres,
    },
  };
  prisma.$transaction = async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: unknown) => Promise<unknown>)(prisma)
      : Promise.all(arg as Promise<unknown>[]);

  return { db, prisma };
});

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/scope", () => ({
  assertEtablissementOwnership: vi.fn(async () => ({ id: "user-1" })),
}));
// Le matching est mocké : ce test porte sur la conservation des lignes, pas
// sur le référentiel de conformité (qui a ses propres tests).
vi.mock("@/lib/matching", async () => {
  const reel =
    await vi.importActual<typeof import("@/lib/matching")>("@/lib/matching");
  return {
    determineObligationsApplicables: () => h.db.obligations,
    // Le module des prescriptions est pur et testé à part : on garde le vrai.
    appliquerPrescriptions: reel.appliquerPrescriptions,
    // La projection aussi : c'est une recopie de champs, pure et sans effet.
    // La remplacer par un bouchon ferait passer un test là où le vrai code
    // omettrait un critère — c'est exactement le défaut que la projection
    // partagée existe pour empêcher (`matching/projection.ts`).
    projeterEtablissement: reel.projeterEtablissement,
  };
});

const { genererCalendrier } = await import("./actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ETAB_ID = "etab-1";

function obligation(id: string, periodicite: Obligation["periodicite"]) {
  return {
    id,
    domaine: "electricite",
    libelle: `Obligation ${id}`,
    referencesLegales: [{ source: "CODE_TRAVAIL", reference: "R. test" }],
    realisateurs: ["personne_qualifiee"],
    criticite: 3,
    periodicite,
    typologies: { travail: true },
    categoriesEquipement: ["INSTALLATION_ELECTRIQUE"],
  } as unknown as Obligation;
}

function applicable(
  o: Obligation,
  equipementIds: string[],
): ObligationApplicable {
  return {
    obligation: o,
    equipementsConcernes: equipementIds.map((id) => ({
      id,
      libelle: `Équipement ${id}`,
      categorie: "INSTALLATION_ELECTRIQUE",
      caracteristiques: null,
    })),
    porteur: porteurDe(o),
    raisons: ["test"],
  } as unknown as ObligationApplicable;
}

function poserEtablissement(equipements: { id: string; actif: boolean }[]) {
  h.db.etablissement = {
    id: ETAB_ID,
    effectifSurSite: 5,
    estEtablissementTravail: true,
    estERP: false,
    estIGH: false,
    estHabitation: false,
    typeErp: null,
    categorieErp: null,
    classeIgh: null,
    personnesPresentesHabituellement: null,
    manipuleMatieresR422722: null,
    prescriptionsParticulieres: [],
    // La server action lit `include: { equipements: { where: { actif: true } } }` :
    // le faux client rend directement la liste filtrée, comme le ferait Prisma.
    equipements: equipements
      .filter((e) => e.actif)
      .map((e) => ({
        id: e.id,
        libelle: `Équipement ${e.id}`,
        categorie: "INSTALLATION_ELECTRIQUE",
        caracteristiques: null,
      })),
  };
}

beforeEach(() => {
  h.db.verifications = [];
  h.db.obligations = [];
  h.db.etablissement = null;
});

// ---------------------------------------------------------------------------
// TESTS
// ---------------------------------------------------------------------------

describe("genererCalendrier — conservation des actions correctives", () => {
  it("une action rattachée à une vérification dépassée survit à la régénération", async () => {
    // Le dirigeant a une vérification électrique dépassée, sur laquelle il a
    // créé une action corrective (responsable + échéance).
    poserEtablissement([{ id: "eq-elec", actif: true }]);
    h.db.obligations = [applicable(obligation("elec", "annuelle"), ["eq-elec"])];
    h.db.verifications = [
      {
        id: "v-elec",
        etablissementId: ETAB_ID,
        equipementId: "eq-elec",
        obligationId: "elec",
        libelleObligation: "Obligation elec",
        periodicite: "annuelle",
        realisateurRequis: ["personne_qualifiee"],
        datePrevue: new Date("2020-01-01T00:00:00Z"),
        dateRealisee: null,
        statut: "depassee",
        nbRapports: 0,
        nbActions: 1, // ← l'action corrective
      },
    ];

    // Le lendemain, il déclare un extincteur : le calendrier est régénéré.
    poserEtablissement([
      { id: "eq-elec", actif: true },
      { id: "eq-ext", actif: true },
    ]);
    h.db.obligations = [
      applicable(obligation("elec", "annuelle"), ["eq-elec"]),
      applicable(obligation("ext", "annuelle"), ["eq-ext"]),
    ];

    const res = await genererCalendrier(ETAB_ID);

    // La ligne porteuse de l'action est toujours là, avec le même identifiant.
    const survivante = h.db.verifications.find((v) => v.id === "v-elec");
    expect(survivante).toBeDefined();
    expect(survivante?.nbActions).toBe(1);
    expect(res.deleted).toBe(0);
    // La nouvelle obligation, elle, a bien été ajoutée.
    expect(res.created).toBe(1);
    expect(h.db.verifications).toHaveLength(2);
  });

  it("ne supprime pas non plus une vérification porteuse d'un rapport", async () => {
    poserEtablissement([{ id: "eq-1", actif: true }]);
    h.db.obligations = []; // l'obligation a été retirée du référentiel
    h.db.verifications = [
      {
        id: "v-1",
        etablissementId: ETAB_ID,
        equipementId: "eq-1",
        obligationId: "retiree",
        libelleObligation: "Vérification annuelle",
        periodicite: "annuelle",
        realisateurRequis: ["personne_qualifiee"],
        datePrevue: new Date("2026-01-01T00:00:00Z"),
        dateRealisee: null,
        statut: "depassee",
        nbRapports: 1,
        nbActions: 0,
      },
    ];

    const res = await genererCalendrier(ETAB_ID);

    expect(res.deleted).toBe(0);
    expect(res.archived).toBe(1);
    expect(h.db.verifications).toHaveLength(1);
    expect(h.db.verifications[0].libelleObligation).toContain(
      "Ne s'applique plus",
    );
  });

  it("supprime en revanche une ligne devenue inutile et sans preuve", async () => {
    poserEtablissement([{ id: "eq-1", actif: true }]);
    h.db.obligations = [];
    h.db.verifications = [
      {
        id: "v-vide",
        etablissementId: ETAB_ID,
        equipementId: "eq-1",
        obligationId: "retiree",
        libelleObligation: "Vérification annuelle",
        periodicite: "annuelle",
        realisateurRequis: ["personne_qualifiee"],
        datePrevue: new Date("2026-01-01T00:00:00Z"),
        dateRealisee: null,
        statut: "a_planifier",
        nbRapports: 0,
        nbActions: 0,
      },
    ];

    const res = await genererCalendrier(ETAB_ID);
    expect(res.deleted).toBe(1);
    expect(h.db.verifications).toHaveLength(0);
  });
});

describe("genererCalendrier — idempotence", () => {
  it("deux régénérations successives laissent exactement le même état", async () => {
    poserEtablissement([
      { id: "eq-1", actif: true },
      { id: "eq-2", actif: true },
    ]);
    h.db.obligations = [
      applicable(obligation("o1", "annuelle"), ["eq-1", "eq-2"]),
      applicable(obligation("o2", "trimestrielle"), ["eq-1"]),
    ];

    const premier = await genererCalendrier(ETAB_ID);
    expect(premier.created).toBe(3);

    const apresPremier = JSON.stringify(h.db.verifications);
    const idsApresPremier = h.db.verifications.map((v) => v.id).sort();

    const second = await genererCalendrier(ETAB_ID);
    expect(second).toEqual({
      created: 0,
      updated: 0,
      deleted: 0,
      archived: 0,
      unchanged: 3,
    });
    expect(JSON.stringify(h.db.verifications)).toBe(apresPremier);

    // Stabilité des identifiants : c'est ce qui garantit que les liens
    // externes (fiche vérification, action corrective) restent valides.
    const troisieme = await genererCalendrier(ETAB_ID);
    expect(troisieme.created).toBe(0);
    expect(h.db.verifications.map((v) => v.id).sort()).toEqual(
      idsApresPremier,
    );
  });
});

describe("genererCalendrier — équipements désactivés", () => {
  it("un équipement désactivé ne génère plus d'obligation", async () => {
    // L'équipement est retiré du parc : il ne figure plus dans les
    // équipements chargés, donc plus dans le matching.
    poserEtablissement([{ id: "eq-1", actif: false }]);
    h.db.obligations = [];

    const res = await genererCalendrier(ETAB_ID);
    expect(res.created).toBe(0);
    expect(h.db.verifications).toHaveLength(0);
  });

  it("l'historique d'un équipement désactivé est conservé, marqué non applicable", async () => {
    poserEtablissement([{ id: "eq-1", actif: false }]);
    h.db.obligations = [];
    h.db.verifications = [
      {
        id: "v-hist",
        etablissementId: ETAB_ID,
        equipementId: "eq-1",
        obligationId: "o1",
        libelleObligation: "Vérification annuelle",
        periodicite: "annuelle",
        realisateurRequis: ["personne_qualifiee"],
        datePrevue: new Date("2026-01-01T00:00:00Z"),
        dateRealisee: new Date("2025-01-01T00:00:00Z"),
        statut: "realisee_conforme",
        nbRapports: 1,
        nbActions: 0,
      },
    ];

    await genererCalendrier(ETAB_ID);
    expect(h.db.verifications).toHaveLength(1);
    expect(h.db.verifications[0].nbRapports).toBe(1);
    expect(h.db.verifications[0].libelleObligation).toContain(
      "Ne s'applique plus",
    );
  });
});

describe("genererCalendrier — estampille de version du référentiel", () => {
  // Le référentiel vit en TypeScript versionné (ADR-003) mais ses effets sont
  // figés en base : chaque ligne porte un libellé et une périodicité copiés au
  // moment de sa génération. Sans estampille, une correction du référentiel
  // n'atteignait les calendriers existants qu'au hasard d'une mutation
  // d'équipement, et une obligation retirée laissait des lignes orphelines
  // invisibles des filtres.
  it("estampille l'établissement avec la version appliquée", async () => {
    poserEtablissement([{ id: "eq-elec", actif: true }]);
    h.db.obligations = [applicable(obligation("elec", "annuelle"), ["eq-elec"])];

    await genererCalendrier(ETAB_ID);

    expect(h.db.etablissement?.referentielVersionCalendrier).toBe(
      REFERENTIEL_VERSION,
    );
  });

  it("ré-estampille même quand le plan ne change rien", async () => {
    // Cas du rattrapage : le contenu est déjà aligné, mais l'établissement
    // porte encore une version antérieure. Si l'estampille n'était écrite que
    // lorsqu'une ligne bouge, il resterait éternellement « désynchronisé » et
    // relancerait une réconciliation à chaque affichage.
    poserEtablissement([{ id: "eq-elec", actif: true }]);
    h.db.obligations = [applicable(obligation("elec", "annuelle"), ["eq-elec"])];
    await genererCalendrier(ETAB_ID);

    h.db.etablissement!.referentielVersionCalendrier = "2000-01-01.1";
    const res = await genererCalendrier(ETAB_ID);

    expect(res.created + res.updated + res.deleted + res.archived).toBe(0);
    expect(h.db.etablissement?.referentielVersionCalendrier).toBe(
      REFERENTIEL_VERSION,
    );
  });
});
