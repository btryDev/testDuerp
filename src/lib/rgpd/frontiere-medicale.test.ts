import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { obligationsConformite } from "@/lib/referentiels/conformite";
import { estPorteeParSalarie } from "@/lib/referentiels/conformite/types";

/**
 * La frontière médicale, tenue par un test plutôt que par une promesse.
 *
 * `docs/rgpd.md` § 2.3, l'ADR-023 § 2 et le commentaire de `pieceMedicale`
 * affirment tous trois la même chose : d'une pièce médicale, l'outil ne
 * conserve que l'existence, la date et l'échéance — **jamais le document**.
 * C'est plus strict que le droit, `R. 4544-11-1` autorisant expressément
 * l'employeur à en garder copie. C'est donc un choix, et un choix ne se
 * défend pas tout seul.
 *
 * Il ne s'est d'ailleurs pas défendu : jusqu'au 2026-08-27, `pieceMedicale`
 * était un drapeau **mort** — déclaré sur le type, posé sur l'obligation, lu
 * nulle part — pendant que le formulaire de dépôt s'affichait sans condition
 * sur toutes les fiches. La garantie ne tenait que parce qu'aucun salarié ne
 * pouvait encore être saisi.
 *
 * Elle est désormais câblée, mais par une expression JSX. Une garantie de RGPD
 * portée par un ternaire ne survit pas au découpage du composant qui la
 * contient — et ce fichier est écrit la veille d'une refonte d'écrans.
 *
 * D'où la forme : lire le SOURCE de tout `src/`, et non le comportement d'une
 * page. Le cas dangereux est celui qui n'existe pas encore.
 *
 * CE QUE CE TEST PROUVE : qu'aucun fichier ne monte une surface de dépôt sur
 * une échéance sans que `pieceMedicale` y soit mentionné.
 * CE QU'IL NE PROUVE PAS : que la garde est correctement branchée. Il force à
 * regarder ; il ne relit pas à votre place.
 */

// Ce fichier vit dans `src/lib/rgpd/`.
const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Les composants par lesquels un fichier peut atterrir en base.
 *
 * La liste est explicite plutôt que devinée : un dépôt s'ajoute rarement et
 * doit être une décision. `type="file"` complète le filet pour un champ écrit
 * à la main sans passer par ces composants.
 */
const SURFACES_DE_DEPOT = [
  "UploadRapportForm",
  "EvidenceDropzone",
  "ImportDuerpWizard",
] as const;

const MOTIF_DEPOT = new RegExp(
  `<(${SURFACES_DE_DEPOT.join("|")})\\b|type=["']file["']`,
);

/**
 * Ce qui rattache un fichier au monde des échéances — donc au monde où une
 * pièce médicale de salarié peut apparaître.
 *
 * Un dépôt sur un prestataire ou un carnet sanitaire ne touche pas une
 * personne suivie : il ne relève pas de cette frontière. Restreindre la règle
 * à ce qui la concerne évite d'obliger des écrans étrangers à citer un drapeau
 * qui n'a aucun sens chez eux — une règle qu'on contourne par formalisme finit
 * par ne plus être lue.
 */
const MOTIF_ECHEANCE = /\b(verification|Verification|salarie|Salarie|titre)\b/;

/** Les fichiers qui montent un dépôt sans relever de la frontière. */
const DEROGATIONS: { fichier: string; raison: string }[] = [
  {
    fichier: "components/ui-kit/EvidenceDropzone.tsx",
    raison:
      "C'est la primitive de dépôt elle-même, pas un montage : elle ne connaît ni échéance, ni obligation, ni personne. La garde se pose chez ceux qui l'emploient, et c'est précisément ce que ce test vérifie.",
  },
  {
    fichier: "components/rapports/UploadRapportForm.tsx",
    raison:
      "Le formulaire lui-même, pour la même raison. Il reçoit une action liée et ne sait rien de ce à quoi la pièce se rattache.",
  },
  {
    fichier: "components/prestataires/FormulairePrestataire.tsx",
    raison:
      "Les pièces d'un prestataire — URSSAF, RC Pro, Kbis — concernent une personne morale et ne peuvent structurellement pas être médicales. Aucun chemin ne relie un prestataire à un salarié suivi.",
  },
  {
    fichier: "components/carnet-sanitaire/AjoutAnalyseForm.tsx",
    raison:
      "Une analyse légionelles porte sur un réseau d'eau, pas sur une personne. Le mot « analyse » est trompeur : c'est un prélèvement d'installation, jamais un examen médical.",
  },
  {
    fichier: "app/etablissements/[id]/duerp/import/page.tsx",
    raison:
      "L'écran qui monte l'assistant d'import. Un DUERP importé décrit des risques par unité de travail — des postes, pas des personnes (INRS ED 840). Le mot « vérification » y désigne le contrôle du fichier déposé, pas une échéance de salarié.",
  },
  {
    fichier: "components/duerps/ImportDuerpWizard.tsx",
    raison:
      "L'import d'un DUERP existant traite des risques par unité de travail, agrégés et non nominatifs (INRS ED 840, cf. docs/rgpd.md § 2.6).",
  },
];

function fichiersSource(dir: string, acc: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    if (nom === "node_modules" || nom === ".next") continue;
    const chemin = join(dir, nom);
    if (statSync(chemin).isDirectory()) fichiersSource(chemin, acc);
    else if (/\.tsx?$/.test(nom) && !/\.test\.tsx?$/.test(nom)) acc.push(chemin);
  }
  return acc;
}

/**
 * Le détecteur, isolé pour être testable sur une chaîne.
 *
 * Un test de garde qui ne se teste pas lui-même est une décoration : il passe
 * au vert que la règle soit respectée ou qu'il regarde au mauvais endroit.
 * Celui-ci se vérifie plus bas sur des sources fabriquées.
 */
export function depotNonGarde(source: string): boolean {
  if (!MOTIF_DEPOT.test(source)) return false;
  if (!MOTIF_ECHEANCE.test(source)) return false;
  return !source.includes("pieceMedicale");
}

/**
 * Le module du salarié, désigné par son EMPLACEMENT et non par son contenu.
 *
 * Le contenu ne peut pas servir ici, et c'est ce que la première tentative a
 * appris : `verifications/[verificationId]/page.tsx` nomme le salarié — il
 * peut être porteur de l'échéance — tout en montant légitimement le dépôt d'un
 * rapport de vérification. Une règle fondée sur le mot l'aurait interdit à
 * tort, et une règle qu'on doit excepter à tort finit exceptée partout.
 *
 * Le chemin, lui, dit sans ambiguïté de quel monde on parle.
 */
const CHEMINS_DU_SALARIE = [
  /^lib\/salaries\//,
  /^components\/salaries\//,
  /^app\/etablissements\/\[id\]\/equipe\//,
  /^app\/api\/etablissements\/\[id\]\/equipe\//,
];

/**
 * La règle forte, et celle qui manquait.
 *
 * `depotNonGarde` demande que `pieceMedicale` soit **mentionné** dans le
 * fichier. C'est ce qu'il annonce — « il force à regarder, il ne relit pas à
 * votre place » — et c'est insuffisant là où ça compte : un écran de salarié
 * qui nomme `pieceMedicale` pour afficher son encart d'avertissement satisfait
 * la règle **tout en montant un dépôt juste à côté**.
 *
 * Éprouvé le 2026-08-27 en injectant un `EvidenceDropzone` dans
 * `FormulaireTitre.tsx` : le test est resté vert, alors que trois documents et
 * un message de commit affirmaient qu'il tomberait. La garantie était donc
 * fausse, et c'est le fait de l'avoir cassée exprès qui l'a montré.
 *
 * Dans le module du salarié, la règle n'a pas besoin d'être conditionnelle :
 * il n'y a **rien** à déposer. Ni pièce médicale, ni certificat, ni scan de
 * carte. L'outil enregistre qu'un titre existe et ses dates, un point. Une
 * interdiction franche se vérifie, là où une obligation de mention se
 * contourne sans le vouloir.
 */
export function depotDansLeModuleSalarie(
  cheminRelatif: string,
  source: string,
): boolean {
  if (!CHEMINS_DU_SALARIE.some((r) => r.test(cheminRelatif))) return false;
  return MOTIF_DEPOT.test(source);
}

describe("frontière médicale — aucun dépôt de pièce sur une échéance sans garde", () => {
  it("le détecteur repère un montage non gardé", () => {
    // Sans cette vérification, on ne saurait jamais si le test regarde au bon
    // endroit. Le cas est fabriqué exprès : un dépôt, dans un fichier qui parle
    // d'échéances, sans mention de la garde.
    expect(
      depotNonGarde(`
        export function FicheVerification({ verification }) {
          return <UploadRapportForm action={deposer} />;
        }
      `),
    ).toBe(true);
  });

  it("le détecteur accepte le même montage une fois gardé", () => {
    expect(
      depotNonGarde(`
        export function FicheVerification({ verification, obligation }) {
          const pieceMedicale = obligation?.pieceMedicale === true;
          return pieceMedicale ? <p>Rien à déposer.</p> : <UploadRapportForm action={deposer} />;
        }
      `),
    ).toBe(false);
  });

  it("le détecteur ignore un dépôt étranger aux échéances", () => {
    // Un dépôt de pièce sur une personne morale ne relève pas de la frontière.
    expect(
      depotNonGarde(`
        export function FormulairePrestataire() {
          return <EvidenceDropzone name="attestationUrssaf" />;
        }
      `),
    ).toBe(false);
  });

  it("le détecteur voit un champ de fichier écrit à la main", () => {
    // La liste des composants ne suffit pas : quelqu'un peut écrire l'input
    // directement, et la garantie ne doit pas dépendre du choix d'un import.
    expect(
      depotNonGarde(`
        export function FicheSalarie({ titre }) {
          return <input type="file" name="attestation" />;
        }
      `),
    ).toBe(true);
  });

  it("aucun fichier de src/ ne monte un dépôt non gardé", () => {
    const fautifs: string[] = [];

    for (const chemin of fichiersSource(join(RACINE, "src"))) {
      const rel = relative(RACINE, chemin).replace(/^src\//, "");
      if (DEROGATIONS.some((d) => d.fichier === rel)) continue;
      if (depotNonGarde(readFileSync(chemin, "utf8"))) fautifs.push(rel);
    }

    expect(
      fautifs,
      "Ce fichier monte un formulaire de dépôt de pièce sur une échéance sans que `pieceMedicale` y apparaisse. D'une pièce médicale, l'outil ne conserve que l'existence, la date et l'échéance — jamais le document (docs/rgpd.md § 2.3, ADR-023 § 2). Gardez le montage, ou ajoutez le fichier à `DEROGATIONS` en disant pourquoi aucune pièce médicale ne peut y passer.",
    ).toEqual([]);
  });

  it("le détecteur fort mord là où le premier laissait passer", () => {
    // Le cas réel, reproduit : un écran de salarié qui nomme `pieceMedicale`
    // pour son encart d'avertissement ET monte un dépôt. `depotNonGarde` le
    // laisse passer — c'est sa limite, annoncée. Le détecteur par chemin le
    // refuse.
    const source = `
      export function FormulaireTitre({ titre }: { titre: { pieceMedicale: boolean } }) {
        return (
          <form>
            {titre.pieceMedicale && <p>Ne déposez pas le document.</p>}
            <EvidenceDropzone name="attestation" />
          </form>
        );
      }
    `;
    expect(depotNonGarde(source)).toBe(false);
    expect(
      depotDansLeModuleSalarie("components/salaries/FormulaireTitre.tsx", source),
    ).toBe(true);
  });

  it("le détecteur fort laisse déposer un rapport de vérification", () => {
    // Une fiche de vérification nomme le salarié — il peut être porteur de
    // l'échéance — et monte légitimement le dépôt du rapport. La règle ne doit
    // pas l'atteindre, sans quoi il faudrait l'excepter, et une règle qu'on
    // excepte à tort finit exceptée partout.
    expect(
      depotDansLeModuleSalarie(
        "app/etablissements/[id]/verifications/[verificationId]/page.tsx",
        `<UploadRapportForm action={deposer} /> {verification.salarie?.nom}`,
      ),
    ).toBe(false);
  });

  it("aucun fichier du module salarié ne monte de dépôt", () => {
    const fautifs: string[] = [];

    for (const chemin of fichiersSource(join(RACINE, "src"))) {
      const rel = relative(RACINE, chemin).replace(/^src\//, "");
      if (depotDansLeModuleSalarie(rel, readFileSync(chemin, "utf8"))) {
        fautifs.push(rel);
      }
    }

    expect(
      fautifs,
      "Ce fichier monte une surface de dépôt de fichier dans le module du salarié. L'outil n'enregistre d'un titre que son existence et ses dates — jamais le document, médical ou non (docs/rgpd.md § 2.3, ADR-023 § 2). Il n'y a pas de dérogation à demander ici : retirez le dépôt.",
    ).toEqual([]);
  });

  it("chaque dérogation dit pourquoi, et son fichier existe", () => {
    // Une dérogation dont le fichier a disparu est une permission qui traîne,
    // et qui couvrira un jour un fichier neuf portant le même nom.
    for (const { fichier, raison } of DEROGATIONS) {
      expect(() => statSync(join(RACINE, "src", fichier)), fichier).not.toThrow();
      expect(raison.length, fichier).toBeGreaterThan(80);
    }
  });
});

describe("frontière médicale — le drapeau est une décision, pas un défaut", () => {
  /**
   * Ce que ce bloc NE fait pas, et pourquoi.
   *
   * Une première rédaction cherchait les mots « médical », « aptitude »,
   * « contre-indication » dans le libellé des obligations salarié pour deviner
   * lesquelles auraient dû porter le drapeau. C'était réintroduire exactement
   * l'inférence que ce référentiel refuse partout ailleurs — deviner d'après un
   * texte au lieu de faire trancher quelqu'un. Le brief l'a relevé, à raison.
   *
   * La garantie est désormais portée par le TYPE : `pieceMedicale` est requis
   * sur `ObligationPorteeParSalarie`. Une obligation salarié qui l'oublie ne
   * compile pas. C'est plus fort qu'un test, parce qu'aucune suite n'a besoin
   * de tourner pour que la faute soit visible.
   *
   * Restent deux choses qu'un compilateur ne dit pas, et que voici.
   */

  it("chaque obligation salarié a tranché, et la liste est lisible", () => {
    // Le test n'exige aucune valeur : il expose la décision prise pour chacune,
    // pour qu'une relecture porte sur une liste courte plutôt que sur un
    // fichier de référentiel. Quand les dix-huit autres arriveront, c'est ici
    // qu'on verra d'un coup d'œil qui a été qualifié de médical et qui non.
    const decisions = obligationsConformite
      .filter(estPorteeParSalarie)
      .map((o) => `${o.id} → pieceMedicale: ${o.pieceMedicale}`)
      .sort();

    expect(decisions).toEqual([
      "elec-salarie-attestation-medicale-voisinage → pieceMedicale: true",
    ]);
  });

  it("le drapeau ne se pose que sur un porteur salarié", () => {
    // Le type le garantit déjà — `pieceMedicale` n'existe que sur cette
    // variante. Ce test le fige : si la variante changeait, un drapeau posé sur
    // une obligation d'équipement ne serait lu par personne, et la garde
    // retomberait en silence.
    const horsSujet = obligationsConformite
      .filter((o) => !estPorteeParSalarie(o))
      .filter((o) => "pieceMedicale" in o)
      .map((o) => o.id);

    expect(horsSujet).toEqual([]);
  });

  it("aucun modèle ne stocke le fichier d'une pièce de salarié", () => {
    // La meilleure des trois protections, parce qu'elle ne dépend d'aucune
    // vigilance : `TitreSalarie` n'a AUCUN champ de stockage, par construction
    // (ADR-023 § 2). Il porte l'existence, les dates et une note.
    //
    // Ce test lit le schéma Prisma pour que personne n'ajoute ce champ plus
    // tard en croyant combler un manque. Un `fichierCle` sur `TitreSalarie`
    // ferait tomber la garantie sans qu'aucun écran ne change.
    const schema = readFileSync(join(RACINE, "prisma", "schema.prisma"), "utf8");
    const modele = schema.match(/model TitreSalarie \{[^}]*\}/);
    expect(modele, "Le modèle `TitreSalarie` a disparu du schéma.").not.toBeNull();

    expect(
      /\b(cle|fichier|storage|url|piece|document|upload)\w*\s+String/i.test(
        modele![0],
      ),
      "`TitreSalarie` porte un champ qui ressemble à du stockage de fichier. D'une pièce médicale, l'outil ne conserve que l'existence, la date et l'échéance — jamais le document (docs/rgpd.md § 2.3, ADR-023 § 2). Si le besoin est réel, il rouvre la décision : il ne se comble pas par un champ.",
    ).toBe(false);
  });
});

describe("le nom d'un salarié ne sort pas du produit", () => {
  /**
   * Deux surfaces sortent du périmètre : le serveur MCP, qui alimente
   * l'assistant que l'utilisateur branche, et les documents imprimés remis à
   * un tiers (registre, dossier de conformité, export contrôle).
   *
   * Les deux ont fui, le même jour, pour la même raison : `libellePorteur` a
   * été écrit pour corriger un vrai défaut d'affichage — sept écrans disaient
   * « Tout l'établissement » sur la ligne d'une personne — et la correction,
   * juste dans le produit, a été appliquée telle quelle en sortie.
   *
   * Ce test tient la frontière par le SOURCE, comme celui de la frontière
   * médicale : le cas dangereux est celui qui n'existe pas encore.
   */
  /**
   * Les surfaces qui sortent du produit, désignées par leur EMPLACEMENT.
   *
   * La première version était une liste de trois fichiers en dur. Elle ratait
   * `api/etablissements/[id]/controle-zip/route.ts`, qui écrit trois fichiers
   * texte en clair hors des constructeurs de PDF — et une quatrième surface
   * n'y serait jamais entrée toute seule. Une liste que personne ne met à jour
   * n'est pas une garde, c'est une photographie.
   *
   * `app/api/` est ratissé LARGE, délibérément : mieux vaut inclure une route
   * qui n'en avait pas besoin et la déroger en disant pourquoi, que d'oublier
   * celle qui comptait. Les dérogations sont plus bas, et elles portent leur
   * raison.
   */
  const CHEMINS_SORTANTS = [
    /^lib\/mcp\//,
    /^lib\/pdf\//,
    /^app\/api\//,
    /^scripts\/mcp-server\.ts$/,
  ];

  /**
   * Les surfaces que la règle attrape et qui doivent pourtant nommer une
   * personne. **Il n'y en a qu'une, et sortir le nom EST sa raison d'être.**
   *
   * La règle posait `app/api/` comme « ce qui sort vers un tiers ». C'est faux
   * pour au moins une route : l'extraction de l'article 15 du RGPD s'adresse à
   * l'employeur, responsable de traitement, à propos de ses propres données —
   * pas à un tiers. Elle ne passait jusqu'ici que par accident : la fuite s'y
   * épelle `donnees.identite.prenom` et non `.salarie.nom`, et aucun des deux
   * motifs ne la voyait. Le jour où quelqu'un réécrit cet export en ligne, la
   * règle tombe sur une sortie parfaitement légitime — et la réparation
   * naturelle est d'excepter en silence, ce que le commentaire de
   * `CHEMINS_DU_SALARIE` décrit précisément comme à éviter.
   *
   * Mieux vaut donc l'excepter maintenant, en écrivant pourquoi.
   */
  const DEROGATIONS_SORTANTES: { fichier: string; raison: string }[] = [
    {
      fichier: "app/api/etablissements/[id]/equipe/[salarieId]/donnees/route.ts",
      raison:
        "C'est l'extraction de l'article 15 du RGPD — le droit d'accès de la personne suivie. Elle s'adresse à l'employeur, responsable de traitement, à propos d'une personne de son propre effectif : rendre le nom EST sa fonction, et un export anonyme ne répondrait à aucune demande. La portée de tenancy est vérifiée deux fois (`requireEtablissement`, puis `where` sur les deux clés) et la réponse porte `Cache-Control: no-store`.",
    },
  ];

  function surfacesSortantes(): { abs: string; rel: string }[] {
    // `scripts/` en plus de `src/` : le point d'entrée stdio du serveur MCP y
    // vit, et la règle prétendait le couvrir alors qu'aucun chemin produit ne
    // pouvait commencer par `scripts/` — le motif était mort depuis sa
    // naissance, dans le commit même qui remplaçait une liste en dur au motif
    // qu'« une liste que personne ne met à jour n'est pas une garde ».
    const fichiers = [
      ...fichiersSource(join(RACINE, "src")),
      ...fichiersSource(join(RACINE, "scripts")),
    ].map((abs) => ({
      abs,
      // Nom d'affichage : `src/` retiré, `scripts/` conservé — c'est ce que
      // portent `CHEMINS_SORTANTS` et les dérogations.
      rel: relative(RACINE, abs).replace(/^src\//, ""),
    }));
    const derogees = new Set(DEROGATIONS_SORTANTES.map((d) => d.fichier));
    return fichiers.filter(
      ({ rel }) =>
        CHEMINS_SORTANTS.some((r) => r.test(rel)) && !derogees.has(rel),
    );
  }

  it("les surfaces sortantes n'emploient pas le libellé nominatif", () => {
    const fautives: string[] = [];
    for (const { abs, rel } of surfacesSortantes()) {
      const source = readFileSync(abs, "utf8");
      // `libellePorteurSansNom` contient `libellePorteur` : on cherche donc
      // l'appel nominatif seul, pas la sous-chaîne.
      if (/\blibellePorteur\s*\(/.test(source)) fautives.push(rel);
      // Et la construction à la main, que ni l'un ni l'autre motif n'attrape.
      if (/\.salarie[?]?\.(nom|prenom)\b/.test(source)) fautives.push(rel);
    }

    expect(
      fautives,
      "Cette surface sort du produit — serveur MCP ou document remis à un tiers — et emploie `libellePorteur`, qui nomme la personne. Utilisez `libellePorteurSansNom` : savoir qu'une attestation expire ne demande pas de savoir de qui (docs/rgpd.md § 6).",
    ).toEqual([]);
  });

  it("le point d'entrée du serveur MCP est réellement balayé", () => {
    // La règle annonçait couvrir `scripts/mcp-server.ts` par un motif qui ne
    // pouvait rien matcher : le balayage ne parcourait que `src/` et retirait
    // ce préfixe, donc aucun chemin produit ne commençait par `scripts/`. Le
    // motif était mort depuis sa naissance, et donnait l'assurance ÉCRITE que
    // le point d'entrée stdio du MCP était surveillé.
    //
    // Une garde dont la couverture annoncée dépasse la couverture réelle est
    // pire qu'une garde absente : elle dispense de vigilance.
    const balayes = surfacesSortantes().map((f) => f.rel);
    expect(balayes).toContain("scripts/mcp-server.ts");
  });

  it("chaque dérogation sortante dit pourquoi, et son fichier existe", () => {
    // Même exigence que les dérogations de la frontière médicale : une
    // dérogation dont le fichier a disparu est une permission qui traîne, et
    // qui couvrira un jour un fichier neuf portant le même nom.
    for (const { fichier, raison } of DEROGATIONS_SORTANTES) {
      // Le préfixe suit la convention de `rel` : `src/` retiré, `scripts/`
      // conservé. Coder `join(RACINE, "src", fichier)` en dur ferait échouer à
      // tort une future dérogation sous `scripts/` — le répertoire que le
      // balayage vient justement d'apprendre à parcourir.
      const abs = fichier.startsWith("scripts/")
        ? join(RACINE, fichier)
        : join(RACINE, "src", fichier);
      expect(() => statSync(abs), fichier).not.toThrow();
      expect(raison.length, fichier).toBeGreaterThan(120);
    }
  });

  it("la seule dérogation est l'extraction de l'article 15", () => {
    // Le fond de l'affaire : `app/api/` est ratissé large parce qu'on ne sait
    // pas d'avance quelle route produira un document pour un tiers. Une seule
    // y échappe, et c'est celle dont sortir le nom EST la fonction. Si une
    // seconde apparaît, ce test tombe — et c'est le bon moment pour se
    // demander si la règle n'est pas en train de se vider.
    expect(DEROGATIONS_SORTANTES.map((d) => d.fichier)).toEqual([
      "app/api/etablissements/[id]/equipe/[salarieId]/donnees/route.ts",
    ]);
  });

  it("aucune surface sortante ne sélectionne le nom d'un salarié", () => {
    const fautives: string[] = [];
    for (const { abs, rel } of surfacesSortantes()) {
      const source = readFileSync(abs, "utf8");
      if (/salarie:\s*\{\s*select/.test(source)) fautives.push(rel);
    }

    expect(
      fautives,
      "Cette surface sortante sélectionne des champs de `Salarie`. Sélectionnez `salarieId` seul : il dit qu'un porteur existe sans nommer la personne.",
    ).toEqual([]);
  });
});

/**
 * Retire commentaires de bloc et de ligne, pour qu'un motif cherchant une
 * lecture ne morde pas l'explication de son absence.
 *
 * Le garde `[^:]` évite de couper une URL sur son `//`.
 */
export function sansCommentaires(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

describe("les noms saisis en texte libre ne partent ni vers un assistant ni vers un tiers", () => {
  /**
   * Deux champs de texte libre où l'utilisateur écrit le nom d'une personne :
   * `Action.responsable` (qui pilote une action corrective) et
   * `ReleveTemperature.operateur` (qui a fait le relevé d'eau chaude).
   *
   * Ils ne relèvent pas de la frontière médicale, et pas non plus du nom du
   * salarié : personne ne les dérive d'un modèle, c'est l'employeur qui les
   * tape. Mais ils sortaient par les deux mêmes portes, et la décision du
   * 2026-08-28 ne les traite pas pareil — parce que les destinataires
   * diffèrent :
   *
   * — `responsable` reste dans les documents que l'employeur remet lui-même
   *   (PDF du plan d'actions, dossier de conformité, DUERP) : un plan
   *   d'actions sans porteur nommé perd sa fonction. Il sort du **MCP**, seule
   *   surface qui parte vers un tiers que l'utilisateur ne maîtrise pas —
   *   l'assistant qu'il branche. Un nom lu là part vers un LLM par défaut,
   *   contre le principe fondateur « zéro IA sur le contenu utilisateur ».
   *
   * — `operateur` sort de l'**export ZIP**, remis « à un inspecteur, un
   *   assureur, un bailleur ou un acquéreur ». Aucun texte ne l'exige :
   *   l'article 3 de l'arrêté du 1er février 2010 demande de consigner « les
   *   modalités et les résultats » dans un fichier sanitaire tenu à
   *   disposition de l'ARS. `D. 4711-2` ne vise que la santé-sécurité AU
   *   TRAVAIL et ne couvre ni l'un ni l'autre (docs/rgpd.md § 2.4).
   *
   * La règle porte sur la LECTURE du champ, pas sur son affichage : ce qui
   * n'est pas lu ne peut pas ressortir par une colonne ajoutée plus tard.
   */

  // Les commentaires sont retirés avant de chercher (`sansCommentaires`).
  // Sans ça, la règle mordrait les commentaires qui expliquent pourquoi le
  // champ n'est PAS lu — et il y en a un dans chacun des deux fichiers
  // qu'elle surveille. Le motif serait rouge en permanence, et la réparation
  // naturelle serait de l'affaiblir jusqu'à ce qu'il ne morde plus rien.
  /** Lire le champ : le déréférencer, ou le demander à Prisma. */
  function litChampNominatif(source: string, champ: string): boolean {
    const code = sansCommentaires(source);
    return new RegExp(`\\.${champ}\\b|\\b${champ}:\\s*true\\b`).test(code);
  }

  const CHAMPS_LIBRES: {
    champ: string;
    chemins: RegExp[];
    message: string;
  }[] = [
    {
      champ: "responsable",
      chemins: [/^lib\/mcp\//, /^scripts\/mcp-server\.ts$/],
      message:
        "Le serveur MCP lit `Action.responsable`. Ce champ porte le nom d'une " +
        "personne et le MCP alimente un assistant tiers : ne le sélectionnez pas " +
        "(docs/rgpd.md § 2.5). Il reste rendu dans les PDF que l'employeur remet.",
    },
    {
      champ: "operateur",
      chemins: [/^app\/api\//],
      message:
        "Une route d'API lit `ReleveTemperature.operateur`. Ce champ porte le nom " +
        "de qui a fait le relevé, et l'export part vers un tiers. Aucun texte ne " +
        "l'exige (docs/rgpd.md § 2.5) : sélectionnez la date, la température et la " +
        "conformité.",
    },
  ];

  it("le détecteur voit une lecture, et ignore un commentaire qui la nomme", () => {
    // Le cas fabriqué est celui des deux fichiers réels : un commentaire qui
    // explique la retenue, et pas de lecture.
    expect(litChampNominatif("const x = a.responsable;", "responsable")).toBe(true);
    expect(litChampNominatif("select: { responsable: true }", "responsable")).toBe(true);
    expect(
      litChampNominatif(
        "// `Action.responsable` n'est PAS sélectionné, et c'est délibéré.\nconst x = 1;",
        "responsable",
      ),
    ).toBe(false);
    expect(
      litChampNominatif(
        "/* On ne lit pas a.responsable ici. */\nconst x = 1;",
        "responsable",
      ),
    ).toBe(false);
    // Une URL n'est pas un commentaire de ligne.
    expect(
      litChampNominatif('const u = "https://x/y"; const v = a.operateur;', "operateur"),
    ).toBe(true);
  });

  it("aucune surface interdite ne lit ces champs", () => {
    const fautifs: string[] = [];
    const fichiers = [
      ...fichiersSource(join(RACINE, "src")),
      ...fichiersSource(join(RACINE, "scripts")),
    ].map((abs) => ({ abs, rel: relative(RACINE, abs).replace(/^src\//, "") }));

    for (const { champ, chemins, message } of CHAMPS_LIBRES) {
      for (const { abs, rel } of fichiers) {
        if (!chemins.some((r) => r.test(rel))) continue;
        if (litChampNominatif(readFileSync(abs, "utf8"), champ)) {
          fautifs.push(`${rel} → ${champ} — ${message}`);
        }
      }
    }

    expect(fautifs).toEqual([]);
  });

  it("les chemins surveillés désignent des fichiers qui existent", () => {
    // Un motif de chemin qui ne matche rien est une garde morte : elle donne
    // l'assurance écrite d'une surveillance qui ne s'exerce sur rien. C'est
    // exactement le défaut corrigé plus haut sur `scripts/mcp-server.ts`.
    const rels = [
      ...fichiersSource(join(RACINE, "src")),
      ...fichiersSource(join(RACINE, "scripts")),
    ].map((abs) => relative(RACINE, abs).replace(/^src\//, ""));

    for (const { champ, chemins } of CHAMPS_LIBRES) {
      for (const motif of chemins) {
        expect(
          rels.some((r) => motif.test(r)),
          `${champ} : le motif ${motif} ne désigne aucun fichier`,
        ).toBe(true);
      }
    }
  });
});
