import { renderToBuffer } from "@react-pdf/renderer";
import JSZip from "jszip";
import { NextResponse } from "next/server";
import { requireEtablissement } from "@/lib/auth/scope";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { publicAppUrl } from "@/lib/email";
import {
  MOIS_FENETRE_HISTORIQUE,
  ajouterMois,
  cleJourCivil,
  debutDuJour,
  formaterDateFr,
  formaterDateHeureFr,
} from "@/lib/dates";
import {
  construireDossierConformiteData,
  construirePlanActionsData,
  construireRegistreData,
} from "@/lib/pdf/builders";
import { DossierConformiteDocument } from "@/lib/pdf/DossierConformiteDocument";
import { DuerpDocument } from "@/lib/pdf/DuerpDocument";
import { PlanActionsDocument } from "@/lib/pdf/PlanActionsDocument";
import { RegistreDocument } from "@/lib/pdf/RegistreDocument";
import { slugifyFilename } from "@/lib/pdf/styles";
import type { DuerpSnapshot } from "@/lib/versions/snapshot";

/**
 * Assemble en un ZIP **tous** les documents qu'un inspecteur, un assureur,
 * un bailleur ou un acquéreur pourrait demander à voir. C'est le livrable
 * « panic button » du dirigeant : 1 clic, 1 ZIP, dossier présentable.
 *
 * Contenu :
 *   00_README.txt                — sommaire, checklist pré-contrôle, astuces
 *   01_Dossier_conformite.pdf    — synthèse globale signée (existant)
 *   02_DUERP.pdf                 — dernière version figée si présente
 *   03_Registre_securite.pdf     — rapports de vérif + signatures (existant)
 *   04_Plan_actions.pdf          — écarts ouverts priorisés (existant)
 *   05_Accessibilite_URL.txt     — URL publique du registre (si publié)
 *   Prestataires/                — attestations URSSAF, RC Pro, Kbis
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { etablissement } = await requireEtablissement(id);

  const zip = new JSZip();
  // Horloge lue une seule fois : toutes les fenêtres et toutes les dates
  // imprimées dans le dossier décrivent le même instant.
  const maintenant = new Date();
  const dateNow = formaterDateFr(maintenant);

  // ── 01 Dossier de conformité ────────────────────────────────────────
  try {
    const data = await construireDossierConformiteData(id);
    if (data) {
      const buf = await renderToBuffer(DossierConformiteDocument({ data }));
      zip.file("01_Dossier_conformite.pdf", new Uint8Array(buf));
    }
  } catch {
    // On continue même si une brique échoue.
  }

  // ── 02 DUERP (dernière version figée) ───────────────────────────────
  //
  // Le PDF est **rendu à la volée depuis le snapshot** de la dernière
  // version, pas relu depuis un fichier stocké. Trois raisons :
  //   - le rendu depuis le snapshot est déterministe : la même version
  //     produit toujours le même document, c'est ce qui fait sa valeur de
  //     preuve (conservation 40 ans) ;
  //   - il ne dépend d'aucun stockage de fichier, donc le DUERP est
  //     toujours présent dans le dossier remis à l'inspecteur ;
  //   - c'est exactement le chemin de `/duerp/[id]/versions/[numero]/pdf`,
  //     donc le fichier du ZIP est bit à bit celui que l'écran propose.
  //
  // Auparavant le ZIP cherchait `DuerpVersion.pdfUrl`, colonne qu'aucun
  // code n'écrit : la branche était toujours fausse et le 02_DUERP.pdf
  // annoncé par le README manquait systématiquement.
  //
  // L'ownership a déjà été vérifié par requireEtablissement en haut ; la
  // requête reste néanmoins bornée par `duerp.etablissementId`.
  let duerpNumeroVersion: number | null = null;
  try {
    const versions = await prisma.duerpVersion.findMany({
      where: { duerp: { etablissementId: id } },
      orderBy: { numero: "desc" },
      select: { numero: true, snapshot: true, motif: true, createdAt: true },
    });
    const versionCourante = versions[0] ?? null;
    if (versionCourante) {
      // L'historique imprimé en fin de document liste toutes les versions
      // du DUERP — la traçabilité exigée par l'art. R. 4121-2.
      const historique = versions.map((v) => ({
        numero: v.numero,
        genereLe: v.createdAt.toISOString(),
        motif: v.motif,
      }));
      const buf = await renderToBuffer(
        DuerpDocument({
          snapshot: versionCourante.snapshot as unknown as DuerpSnapshot,
          historique,
        }),
      );
      zip.file(`02_DUERP_v${versionCourante.numero}.pdf`, new Uint8Array(buf));
      duerpNumeroVersion = versionCourante.numero;
    }
  } catch {
    // On continue même si une brique échoue : le README dira que le DUERP
    // n'est pas inclus plutôt que de faire échouer tout le dossier.
  }

  // ── 03 Registre de sécurité ─────────────────────────────────────────
  try {
    const data = await construireRegistreData(id);
    if (data) {
      const buf = await renderToBuffer(RegistreDocument({ data }));
      zip.file("03_Registre_securite.pdf", new Uint8Array(buf));
    }
  } catch {
    /* noop */
  }

  // ── 04 Plan d'actions ───────────────────────────────────────────────
  try {
    const data = await construirePlanActionsData(id);
    if (data) {
      const buf = await renderToBuffer(PlanActionsDocument({ data }));
      zip.file("04_Plan_actions.pdf", new Uint8Array(buf));
    }
  } catch {
    /* noop */
  }

  // ── 05 Accessibilité (URL publique + QR si publié) ──────────────────
  const registreAccess = await prisma.registreAccessibilite.findUnique({
    where: { etablissementId: id },
    select: { slugPublic: true, publie: true },
  });
  if (registreAccess?.publie) {
    const url = `${publicAppUrl()}/accessibilite/${registreAccess.slugPublic}`;
    zip.file(
      "05_Accessibilite_URL.txt",
      `Registre d'accessibilité publique\n` +
        `Arrêté du 19 avril 2017 (art. D111-19-33 CCH)\n\n` +
        `URL consultable par le public : ${url}\n\n` +
        `Affiche A4 imprimable avec QR code : ${publicAppUrl()}/api/accessibilite/${registreAccess.slugPublic}/affiche\n`,
    );
  }

  // ── Prestataires : attestations URSSAF, RC Pro, Kbis ────────────────
  const prestataires = await prisma.prestataire.findMany({
    where: { etablissementId: id },
    orderBy: { raisonSociale: "asc" },
  });
  if (prestataires.length > 0) {
    const dossierPrestataires = zip.folder("Prestataires") ?? zip;
    const storage = getStorage();
    for (const p of prestataires) {
      const safeDir = p.raisonSociale.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
      const sousDossier = dossierPrestataires.folder(safeDir) ?? dossierPrestataires;
      for (const [cle, nom] of [
        [p.attestationUrssafCle, p.attestationUrssafNom ?? "URSSAF.pdf"],
        [p.assuranceRcProCle, p.assuranceRcProNom ?? "RC_Pro.pdf"],
        [p.kbisCle, p.kbisNom ?? "Kbis.pdf"],
      ] as const) {
        if (!cle) continue;
        try {
          const buf = await storage.get(cle);
          sousDossier.file(nom, new Uint8Array(buf));
        } catch {
          /* fichier manquant, on ignore */
        }
      }
    }
  }

  // ── 06 Permis de feu (12 derniers mois) ─────────────────────────────
  // Fenêtre en **mois calendaires** : `Date.now() - 365 jours` glisse d'un
  // jour à chaque année bissextile et d'une heure à chaque changement
  // d'heure — un permis du 12 août de l'an dernier disparaissait du dossier
  // le 12 août suivant, alors qu'il a bien moins de douze mois.
  // La borne est ramenée à minuit (heure de Paris) : les dates de début de
  // permis et de plan sont des dates civiles, une borne qui garderait
  // l'heure courante ferait disparaître du dossier, l'après-midi, une pièce
  // encore présente le matin.
  const ilYaUnAn = debutDuJour(ajouterMois(maintenant, -MOIS_FENETRE_HISTORIQUE));
  const permisFeuList = await prisma.permisFeu.findMany({
    where: {
      etablissementId: id,
      dateDebut: { gte: ilYaUnAn },
      statut: { notIn: ["brouillon", "annule"] },
    },
    orderBy: { numero: "desc" },
  });
  if (permisFeuList.length > 0) {
    const txt = [
      `PERMIS DE FEU — 12 derniers mois (${permisFeuList.length})`,
      `Recommandation INRS ED 6030, exigence assurance APSAD R43.`,
      "",
      "────────────────────────────────────────────────────────────",
      ...permisFeuList.flatMap((p) => [
        `PF-${String(p.numero).padStart(3, "0")} · ${p.statut.toUpperCase()}`,
        `  Prestataire : ${p.prestataireRaison} (${p.prestataireContact})`,
        `  Lieu : ${p.lieu}`,
        `  Période : ${formaterDateHeureFr(p.dateDebut)} → ${formaterDateHeureFr(p.dateFin)}`,
        `  Surveillance : ${Math.round(p.dureeSurveillanceMinutes / 60)}h`,
        `  Travaux : ${p.naturesTravaux.join(", ")}`,
        `  Description : ${p.descriptionTravaux}`,
        `  Mesures validées : ${p.mesuresValidees.length}`,
        "",
      ]),
    ].join("\n");
    zip.file("06_Permis_de_feu.txt", txt);
  }

  // ── 07 Plans de prévention (actifs 12 derniers mois) ────────────────
  const plansList = await prisma.planPrevention.findMany({
    where: {
      etablissementId: id,
      dateDebut: { gte: ilYaUnAn },
      statut: { notIn: ["brouillon", "annule"] },
    },
    include: { lignes: { orderBy: { ordre: "asc" } } },
    orderBy: { numero: "desc" },
  });
  if (plansList.length > 0) {
    const txt = [
      `PLANS DE PRÉVENTION — 12 derniers mois (${plansList.length})`,
      `Art. R4512-6 à R4512-12 CT (décret 92-158).`,
      "",
      "────────────────────────────────────────────────────────────",
      ...plansList.flatMap((p) => [
        `PP-${String(p.numero).padStart(3, "0")} · ${p.statut.toUpperCase()}`,
        `  Entreprise extérieure : ${p.entrepriseExterieureRaison}`,
        `  Chef EE : ${p.efChefNom} (${p.efChefEmail})`,
        `  Effectif EE : ${p.efEffectifIntervenant}`,
        `  Chef EU : ${p.euChefNom}${p.euChefFonction ? ` (${p.euChefFonction})` : ""}`,
        `  Période : ${formaterDateFr(p.dateDebut)} → ${formaterDateFr(p.dateFin)}${p.dureeHeuresEstimee ? ` · ${p.dureeHeuresEstimee} h` : ""}`,
        `  Lieux : ${p.lieux}`,
        `  Travaux dangereux : ${p.travauxDangereux ? "OUI" : "non"}`,
        p.inspectionDate
          ? `  Inspection commune : ${formaterDateFr(p.inspectionDate)}`
          : `  Inspection commune : NON RÉALISÉE`,
        `  Risques identifiés (${p.lignes.length}) :`,
        ...p.lignes.map(
          (l, i) =>
            `    ${i + 1}. ${l.risque}\n` +
            `       → EU : ${l.mesureEntrepriseUtilisatrice ?? "—"}\n` +
            `       → EE : ${l.mesureEntrepriseExterieure ?? "—"}`,
        ),
        "",
      ]),
    ].join("\n");
    zip.file("07_Plans_de_prevention.txt", txt);
  }

  // ── 08 Carnet sanitaire (résumé) ─────────────────────────────────────
  const carnetSan = await prisma.carnetSanitaire.findUnique({
    where: { etablissementId: id },
    include: {
      pointsReleve: {
        where: { actif: true },
        include: {
          releves: {
            orderBy: { dateReleve: "desc" },
            take: 10,
          },
        },
      },
      analyses: { orderBy: { dateAnalyse: "desc" }, take: 5 },
    },
  });
  if (carnetSan && (carnetSan.pointsReleve.length > 0 || carnetSan.analyses.length > 0)) {
    const txt = [
      `CARNET SANITAIRE EAU`,
      `Arrêté du 1er février 2010 · art. R1321-23 CSP.`,
      "",
      `Points de relevé actifs : ${carnetSan.pointsReleve.length}`,
      "────────────────────────────────────────────────────────────",
      ...carnetSan.pointsReleve.flatMap((pt) => [
        `${pt.nom}${pt.localisation ? ` — ${pt.localisation}` : ""}`,
        `  Type : ${pt.typeReseau} · seuil ${pt.typeReseau === "EFS" ? "max" : "min"} ${pt.seuilMinCelsius}°C`,
        `  10 derniers relevés :`,
        ...pt.releves.map(
          (r) =>
            `    ${formaterDateFr(r.dateReleve)} · ${r.temperatureCelsius.toFixed(1)}°C · ${r.conforme ? "CONFORME" : "NON CONFORME"}${r.operateur ? ` (${r.operateur})` : ""}`,
        ),
        "",
      ]),
      "",
      `Analyses légionelles récentes (${carnetSan.analyses.length}) :`,
      "────────────────────────────────────────────────────────────",
      ...carnetSan.analyses.flatMap((a) => [
        `  ${formaterDateFr(a.dateAnalyse)} · ${a.valeurUfcParL ?? "—"} UFC/L · ${a.conforme ? "CONFORME (<1000 UFC/L)" : "ACTION REQUISE"}${a.laboratoire ? ` · ${a.laboratoire}` : ""}`,
        a.commentaire ? `    ${a.commentaire}` : "",
      ]),
      "",
    ]
      .filter((l) => l !== "")
      .join("\n");
    zip.file("08_Carnet_sanitaire.txt", txt);
  }

  // ── 09 Interventions ouvertes ───────────────────────────────────────
  const ticketsOuverts = await prisma.intervention.findMany({
    where: {
      etablissementId: id,
      statut: { notIn: ["fait", "annule"] },
    },
    orderBy: [{ priorite: "desc" }, { echeance: "asc" }],
  });
  if (ticketsOuverts.length > 0) {
    const txt = [
      `INTERVENTIONS EN COURS (${ticketsOuverts.length})`,
      `Art. R4224-17 CT — maintien en état de conformité.`,
      "",
      "────────────────────────────────────────────────────────────",
      ...ticketsOuverts.flatMap((it) => [
        `#${String(it.numero).padStart(3, "0")} [${it.priorite.toUpperCase()}] ${it.titre}`,
        `  Statut : ${it.statut}`,
        it.localisation ? `  Lieu : ${it.localisation}` : "",
        it.assigneA ? `  Assigné à : ${it.assigneA}` : "",
        it.echeance
          ? `  Échéance : ${formaterDateFr(it.echeance)}`
          : "",
        it.description ? `  Description : ${it.description}` : "",
        `  Créé le ${formaterDateFr(it.createdAt)}`,
        "",
      ]),
    ]
      .filter((l) => l !== "")
      .join("\n");
    zip.file("09_Interventions_en_cours.txt", txt);
  }

  // ── 00 README ───────────────────────────────────────────────────────
  const readme = genererReadme({
    raisonSociale: etablissement.entreprise.raisonSociale,
    etablissement: etablissement.raisonDisplay,
    adresse: etablissement.adresse,
    dateNow,
    duerpNumeroVersion,
    aDuerpPdf: duerpNumeroVersion !== null,
    aRegistreAccessibilite: Boolean(registreAccess?.publie),
    nbPrestataires: prestataires.length,
    nbPermisFeu: permisFeuList.length,
    nbPlansPrevention: plansList.length,
    aCarnetSanitaire: Boolean(
      carnetSan && (carnetSan.pointsReleve.length > 0 || carnetSan.analyses.length > 0),
    ),
    nbInterventionsOuvertes: ticketsOuverts.length,
  });
  zip.file("00_README.txt", readme);

  // ── Génération ──────────────────────────────────────────────────────
  const buffer = await zip.generateAsync({ type: "uint8array" });
  const filename = `Dossier_controle_${slugifyFilename(etablissement.raisonDisplay)}_${cleJourCivil(maintenant)}.zip`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function genererReadme(args: {
  raisonSociale: string;
  etablissement: string;
  adresse: string;
  dateNow: string;
  duerpNumeroVersion: number | null;
  aDuerpPdf: boolean;
  aRegistreAccessibilite: boolean;
  nbPrestataires: number;
  nbPermisFeu: number;
  nbPlansPrevention: number;
  aCarnetSanitaire: boolean;
  nbInterventionsOuvertes: number;
}): string {
  const lignes: string[] = [];
  lignes.push(
    `DOSSIER DE CONFORMITÉ — ${args.raisonSociale}`,
    `Établissement : ${args.etablissement}`,
    `Adresse : ${args.adresse}`,
    `Généré le : ${args.dateNow}`,
    "",
    "────────────────────────────────────────────────────────────",
    " CONTENU DU DOSSIER",
    "────────────────────────────────────────────────────────────",
    "",
    " 01_Dossier_conformite.pdf     Synthèse globale (à présenter en premier)",
    args.aDuerpPdf
      ? ` 02_DUERP_v${args.duerpNumeroVersion}.pdf           Document unique d'évaluation des risques`
      : " 02_DUERP.pdf                  Non inclus (aucune version validée)",
    " 03_Registre_securite.pdf      Rapports de vérifications périodiques",
    " 04_Plan_actions.pdf           Écarts ouverts priorisés",
    args.aRegistreAccessibilite
      ? " 05_Accessibilite_URL.txt      URL publique du registre d'accessibilité"
      : " 05_Accessibilite_URL.txt      Non inclus (registre non publié)",
    args.nbPermisFeu > 0
      ? ` 06_Permis_de_feu.txt          ${args.nbPermisFeu} permis sur 12 mois (INRS ED 6030)`
      : " 06_Permis_de_feu.txt          Aucun permis émis sur 12 mois",
    args.nbPlansPrevention > 0
      ? ` 07_Plans_de_prevention.txt    ${args.nbPlansPrevention} plan(s) (art. R4512-6 CT)`
      : " 07_Plans_de_prevention.txt    Aucun plan actif",
    args.aCarnetSanitaire
      ? " 08_Carnet_sanitaire.txt       Relevés ECS + analyses légionelles (arrêté 01-02-2010)"
      : " 08_Carnet_sanitaire.txt       Non configuré",
    args.nbInterventionsOuvertes > 0
      ? ` 09_Interventions_en_cours.txt ${args.nbInterventionsOuvertes} ticket(s) ouvert(s)`
      : " 09_Interventions_en_cours.txt Aucun ticket ouvert",
    args.nbPrestataires > 0
      ? ` Prestataires/                 Attestations URSSAF, RC Pro, Kbis (${args.nbPrestataires})`
      : " Prestataires/                 Aucun prestataire déclaré",
    "",
    "────────────────────────────────────────────────────────────",
    " CHECKLIST AVANT LE CONTRÔLE",
    "────────────────────────────────────────────────────────────",
    "",
    " [ ] Dossier de conformité lu en entier (10 min)",
    " [ ] DUERP à jour depuis moins de 12 mois",
    " [ ] Tous les rapports de vérification 12 derniers mois présents",
    " [ ] Plan d'actions : tous écarts majeurs ont une date d'échéance",
    " [ ] Attestations URSSAF prestataires < 6 mois",
    " [ ] Registre d'accessibilité affiché (ERP) — QR code en entrée",
    " [ ] Formation sécurité du personnel à jour",
    " [ ] Permis de feu signés avant tout travail par point chaud",
    " [ ] Plans de prévention signés avant toute intervention EE > 400h",
    " [ ] Carnet sanitaire renseigné (si ECS) — relevés hebdo",
    " [ ] Tickets ouverts ont un responsable et une échéance",
    "",
    "────────────────────────────────────────────────────────────",
    " CADRE LÉGAL DES OBLIGATIONS",
    "────────────────────────────────────────────────────────────",
    "",
    " DUERP :                    art. R4121-1 à R4121-4 Code du travail",
    " Vérifications :            art. R4226-16 et s. Code du travail",
    " Registre de sécurité :     art. L4711-5 Code du travail",
    " Accessibilité ERP :        arrêté 19-04-2017 · art. D111-19-33 CCH",
    " Vigilance donneur d'ordre : art. L8222-1 Code du travail",
    " Permis de feu :            INRS ED 6030 · art. R4224-17 CT · APSAD R43",
    " Plan de prévention :       art. R4512-6 à R4512-12 CT (décret 92-158)",
    " Carnet sanitaire eau :     arrêté 01-02-2010 · art. R1321-23 CSP",
    " Maintien en conformité :   art. R4224-17 Code du travail",
    "",
    "────────────────────────────────────────────────────────────",
    "",
    "Document généré automatiquement par Rojer.",
    "Ne remplace pas un conseil juridique. Responsabilité finale : employeur.",
    "",
  );
  return lignes.join("\n");
}
