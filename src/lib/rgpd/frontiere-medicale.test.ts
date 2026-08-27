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
