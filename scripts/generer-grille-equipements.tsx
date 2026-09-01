#!/usr/bin/env tsx
//
// Grille des équipements déclarables dans Rojer, et — pour chacun — le
// sous-tableau des obligations du référentiel qui le citent : périodicité,
// réalisateur, régime d'application, condition éventuelle et **article
// fondateur**. Document de relecture, pas un document remis à un tiers :
// il décrit ce que l'outil calcule, à une version donnée du référentiel.
//
//   npx tsx scripts/generer-grille-equipements.tsx [chemin.pdf]

import { renderToFile } from "@react-pdf/renderer";
import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import path from "node:path";
import {
  obligationsConformite,
  REFERENTIEL_VERSION,
} from "@/lib/referentiels/conformite";
import {
  estPorteeParEquipement,
  type ConditionApplication,
  type Obligation,
} from "@/lib/referentiels/conformite/types";
import {
  CATEGORIES_EQUIPEMENT,
  PERIODICITE_EN_JOURS,
  type CategorieEquipement,
  type TypologieApplication,
} from "@/lib/referentiels/types-communs";
import {
  DESCRIPTION_CATEGORIE,
  LABEL_CATEGORIE_EQUIPEMENT,
} from "@/lib/equipements/labels";
import { LIBELLE_CARACTERISTIQUE } from "@/lib/equipements/caracteristiques";
import { LABEL_FAMILLE_ESP } from "@/lib/equipements/esp";
import type { FamilleEsp } from "@/lib/equipements/esp";
import {
  CATEGORIES_AERATION,
  CATEGORIES_TRI_ETAT,
} from "@/lib/equipements/schema";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  LABEL_REALISATEUR,
} from "@/lib/calendrier/labels";
import { BOARD, stylesCommuns as s } from "@/lib/pdf/styles";

const LABEL_SOURCE: Record<string, string> = {
  CODE_TRAVAIL: "Code du travail",
  CCH: "CCH",
  CODE_ENVIRONNEMENT: "Code de l'environnement",
  ARRETE: "Arrêté",
  DECRET: "Décret",
  INRS: "INRS",
  REGLEMENT_UE: "Règlement (UE)",
};

/**
 * Helvetica — la police de base d'un PDF, celle qu'aucun lecteur n'a besoin
 * d'embarquer — ne porte ni exposants ni indices. Le référentiel écrit
 * « 1ʳᵉ à 4ᵉ catégorie » et « CO₂ » ; sans cette table, le PDF imprimait
 * « 1³l à 4l catégorie », c'est-à-dire un texte faux. On rend donc la forme
 * plate, qui se lit, plutôt qu'une forme savante qui ne s'imprime pas.
 */
const SUBSTITUTIONS: [RegExp, string][] = [
  [/ʳᵉ/g, "re"],
  [/ᵉʳ/g, "er"],
  [/ᵉ/g, "e"],
  [/₀/g, "0"],
  [/₁/g, "1"],
  [/₂/g, "2"],
  [/₃/g, "3"],
  [/₄/g, "4"],
];

function t(s: string): string {
  return SUBSTITUTIONS.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
}

/**
 * Le texte fondateur, cité comme on le citerait à l'écrit. La source n'est
 * préfixée que si la référence ne la porte pas déjà : « Arrêté, Arrêté du
 * 25 juin 1980 » se lisait comme une coquille, et c'en était une.
 */
function texteReference(r: { source: string; reference: string }): string {
  const libelle = LABEL_SOURCE[r.source] ?? r.source;
  const ref = t(r.reference);
  const premierMot = libelle.split(" ")[0].toLowerCase();
  return ref.toLowerCase().startsWith(premierMot) ? ref : `${libelle}, ${ref}`;
}

/** Le régime auquel l'obligation s'applique, en une ligne lisible. */
function texteTypologie(t: TypologieApplication): string {
  const bouts: string[] = [];
  if (t.travail === true) bouts.push("Travail");
  if (t.erp === true) bouts.push("ERP");
  else if (t.erp && typeof t.erp === "object") {
    const p: string[] = [];
    if (t.erp.categories?.length) p.push(`cat. ${t.erp.categories.join(", ")}`);
    if (t.erp.types?.length) p.push(`type ${t.erp.types.join(", ")}`);
    bouts.push(`ERP${p.length ? ` (${p.join(" ; ")})` : ""}`);
  } else if (t.erp === false) bouts.push("hors ERP");
  if (t.igh === true) bouts.push("IGH");
  else if (t.igh && typeof t.igh === "object")
    bouts.push(`IGH (${t.igh.classes.join(", ")})`);
  if (t.habitation === true) bouts.push("Habitation");
  if (t.effectifMin !== undefined) bouts.push(`effectif ≥ ${t.effectifMin}`);
  if (t.effectifMax !== undefined) bouts.push(`effectif ≤ ${t.effectifMax}`);
  if (t.personnesPresentesMin !== undefined)
    bouts.push(`≥ ${t.personnesPresentesMin} personnes présentes`);
  if (t.champR422734) bouts.push("ou matières R. 4227-22");
  return bouts.length ? bouts.join(" · ") : "Tous régimes";
}

/** La condition portée par une propriété de l'équipement, en clair. */
/**
 * Les deux cases à cocher du formulaire ne figurent pas dans
 * `LIBELLE_CARACTERISTIQUE`, qui ne nomme que les questions à trois états.
 * Sans elles, la colonne « Condition » imprimait `aGroupeElectrogene`.
 */
const LIBELLE_CASE: Record<string, string> = {
  aGroupeElectrogene: "Groupe électrogène de sécurité",
  estLocalPollutionSpecifique: "Local à pollution spécifique",
  nbVehiculesParkingCouvert: "Véhicules en parking couvert",
};

function texteCondition(c: ConditionApplication): string {
  const nom =
    LIBELLE_CARACTERISTIQUE[c.propriete as keyof typeof LIBELLE_CARACTERISTIQUE] ??
    LIBELLE_CASE[c.propriete] ??
    c.propriete;
  switch (c.type) {
    case "equipement_propriete_numerique":
      return `${nom} ${c.operateur} ${c.valeur}`;
    case "equipement_propriete_booleenne":
      return `${nom} = ${c.valeur ? "oui" : "non"}`;
    case "equipement_propriete_non_infirmee":
      return `${nom} : sauf réponse « non »`;
    case "equipement_propriete_infirmee":
      return `${nom} : sauf réponse « oui »`;
    case "equipement_propriete_enum_egale":
      return `${nom} = ${libelleValeurEnum(c.propriete, c.valeur)}`;
    case "equipement_propriete_enum_differente":
      return `${nom} : sauf ${libelleValeurEnum(c.propriete, c.valeur)}`;
  }
}

/**
 * Une valeur d'énumération s'imprime sous le libellé que le dirigeant a vu au
 * formulaire, pas sous sa clé technique : la grille est un document qu'on lui
 * remet.
 */
function libelleValeurEnum(propriete: string, valeur: string): string {
  if (propriete === "familleEsp" && valeur in LABEL_FAMILLE_ESP) {
    return `« ${LABEL_FAMILLE_ESP[valeur as FamilleEsp]} »`;
  }
  return `« ${valeur} »`;
}

function conditionsTexte(o: Obligation): string {
  if (!o.conditions?.length) return "—";
  return o.conditions.map(texteCondition).join(" ; ");
}

/** Les questions du formulaire qui bornent les obligations de la catégorie. */
function questionsCategorie(c: CategorieEquipement): string[] {
  const q: string[] = [];
  if (c === "INSTALLATION_ELECTRIQUE") q.push("Groupe électrogène de sécurité");
  if (CATEGORIES_AERATION.includes(c)) q.push("Local à pollution spécifique");
  for (const { champ, categories } of CATEGORIES_TRI_ETAT) {
    if (categories.includes(c)) q.push(LIBELLE_CARACTERISTIQUE[champ]);
  }
  return q;
}

function obligationsDe(c: CategorieEquipement): Obligation[] {
  // Les obligations portées par l'établissement ne figurent pas dans la
  // grille par catégorie : elles ne se déclenchent sur aucun équipement
  // (ADR-022). La grille dit ce qu'un appareil déclenche, pas ce qui est dû.
  return obligationsConformite
    .filter((o) => estPorteeParEquipement(o) && o.categoriesEquipement.includes(c))
    .sort(
      (a, b) =>
        b.criticite - a.criticite ||
        (PERIODICITE_EN_JOURS[a.periodicite] ?? 1e9) -
          (PERIODICITE_EN_JOURS[b.periodicite] ?? 1e9),
    );
}

// ── Mise en page ───────────────────────────────────────────────────────────

const C = {
  obligation: "27%",
  periodicite: "10%",
  realisateur: "13%",
  regime: "16%",
  condition: "14%",
  reference: "20%",
} as const;

const cell = { paddingRight: 6 } as const;

/**
 * `stylesCommuns.page` porte `lineHeight: 1.4`. Dans cette version de
 * @react-pdf, un `lineHeight` posé sur la Page fait disparaître tout élément
 * `fixed` en position absolue : le pied de page — donc la pagination —
 * n'était tout simplement pas imprimé. On reprend le style de page sans lui.
 * (Le défaut vaut aussi pour les documents de l'application, cf. note remise
 * avec ce PDF.)
 */
const stylePage = { ...s.page, lineHeight: undefined } as const;

function EnTeteTableau() {
  return (
    <View style={s.thead}>
      <Text style={[s.th, cell, { width: C.obligation }]}>Obligation</Text>
      <Text style={[s.th, cell, { width: C.periodicite }]}>Échéance</Text>
      <Text style={[s.th, cell, { width: C.realisateur }]}>Par qui</Text>
      <Text style={[s.th, cell, { width: C.regime }]}>Régime visé</Text>
      <Text style={[s.th, cell, { width: C.condition }]}>Condition</Text>
      <Text style={[s.th, cell, { width: C.reference }]}>
        Texte fondateur
      </Text>
    </View>
  );
}

function LigneObligation({ o }: { o: Obligation }) {
  const [fondatrice, ...autres] = o.referencesLegales;
  const refTexte = texteReference(fondatrice);
  return (
    <View style={s.row} wrap={false}>
      <View style={[cell, { width: C.obligation }]}>
        <Text style={s.td}>{t(o.libelle)}</Text>
        <Text style={[s.small, { marginTop: 1 }]}>
          criticité {o.criticite}/5 · {LABEL_DOMAINE[o.domaine]}
        </Text>
      </View>
      <Text style={[s.td, cell, { width: C.periodicite }]}>
        {LABEL_PERIODICITE[o.periodicite]}
      </Text>
      <Text style={[s.td, cell, { width: C.realisateur }]}>
        {o.realisateurs.map((r) => LABEL_REALISATEUR[r]).join(" ou ")}
      </Text>
      <Text style={[s.td, cell, { width: C.regime }]}>
        {texteTypologie(o.typologies)}
      </Text>
      <Text style={[s.td, cell, { width: C.condition }]}>
        {conditionsTexte(o)}
      </Text>
      <View style={[cell, { width: C.reference }]}>
        {fondatrice.url ? (
          <Link src={fondatrice.url} style={[s.td, { color: BOARD.encre }]}>
            {refTexte}
          </Link>
        ) : (
          <Text style={s.td}>{refTexte}</Text>
        )}
        {autres.length > 0 && (
          <Text style={[s.small, { marginTop: 1 }]}>
            aussi : {autres.map((r) => t(r.reference)).join(" ; ")}
          </Text>
        )}
      </View>
    </View>
  );
}

function PiedDePage() {
  return (
    <Text
      style={s.footer}
      fixed
      render={({ pageNumber, totalPages }) =>
        `Rojer — grille des équipements · référentiel ${REFERENTIEL_VERSION} · page ${pageNumber}/${totalPages}`
      }
    />
  );
}

function GrilleDocument({ genereLe }: { genereLe: string }) {
  const lignes = CATEGORIES_EQUIPEMENT.map((c) => ({
    categorie: c,
    obligations: obligationsDe(c),
  }));
  const total = obligationsConformite.length;

  return (
    <Document
      title="Rojer — grille des équipements déclarables"
      author="Rojer"
    >
      {/* Récapitulatif */}
      <Page size="A4" orientation="landscape" style={stylePage}>
        <Text style={{ fontSize: 10, color: BOARD.ardoiseMoyenne }}>
          Rojer — référentiel de conformité {REFERENTIEL_VERSION}
        </Text>
        <Text style={[s.h1, { marginTop: 4 }]}>
          Grille des équipements déclarables
        </Text>
        <Text style={{ fontSize: 10, color: BOARD.ardoiseMoyenne }}>
          {CATEGORIES_EQUIPEMENT.length} catégories · {total} obligations au
          référentiel · document généré le {genereLe}
        </Text>

        <View style={s.mentionsLegalesBloc}>
          <Text>
            Ce document décrit ce que l&apos;outil calcule : les catégories
            d&apos;équipement qu&apos;un établissement peut déclarer, et les
            obligations du référentiel qui citent chacune d&apos;elles. Une
            obligation n&apos;apparaît au calendrier d&apos;un établissement
            que si son régime (colonne « Régime visé ») et ses conditions
            (colonne « Condition ») sont satisfaits — la présence d&apos;une
            ligne ici ne signifie donc pas qu&apos;elle s&apos;applique partout.
            Le périmètre du référentiel n&apos;est pas celui du droit :
            l&apos;absence d&apos;une obligation n&apos;emporte aucune
            conclusion. Rojer calcule, il n&apos;avise pas.
          </Text>
        </View>

        <Text style={s.h2}>Récapitulatif par catégorie</Text>
        <View style={s.thead}>
          <Text style={[s.th, cell, { width: "22%" }]}>Catégorie</Text>
          <Text style={[s.th, cell, { width: "30%" }]}>Ce qu&apos;elle couvre</Text>
          <Text style={[s.th, cell, { width: "8%" }]}>Obligations</Text>
          <Text style={[s.th, cell, { width: "18%" }]}>Échéances</Text>
          <Text style={[s.th, cell, { width: "22%" }]}>
            Questions qui bornent
          </Text>
        </View>
        {lignes.map(({ categorie, obligations }) => {
          const rythmes = [
            ...new Set(obligations.map((o) => LABEL_PERIODICITE[o.periodicite])),
          ];
          const questions = questionsCategorie(categorie);
          return (
            <View key={categorie} style={s.row} wrap={false}>
              <Text
                style={[
                  s.td,
                  cell,
                  { width: "22%", fontFamily: "Helvetica-Bold" },
                ]}
              >
                {LABEL_CATEGORIE_EQUIPEMENT[categorie]}
              </Text>
              <Text style={[s.small, cell, { width: "30%" }]}>
                {t(DESCRIPTION_CATEGORIE[categorie] ?? "—")}
              </Text>
              <Text style={[s.td, cell, { width: "8%" }]}>
                {obligations.length || "aucune"}
              </Text>
              <Text style={[s.td, cell, { width: "18%" }]}>
                {rythmes.length ? rythmes.join(", ") : "—"}
              </Text>
              <Text style={[s.small, cell, { width: "22%" }]}>
                {questions.length ? questions.join(" · ") : "—"}
              </Text>
            </View>
          );
        })}
        <PiedDePage />
      </Page>

      {/* Un sous-tableau par catégorie, une page par catégorie */}
      {lignes.map(({ categorie, obligations }) => (
        <Page
          key={categorie}
          size="A4"
          orientation="landscape"
          style={stylePage}
        >
          <Text style={{ fontSize: 9, color: BOARD.ardoiseMoyenne }}>
            Équipement déclarable
          </Text>
          <Text style={[s.h1, { fontSize: 16, marginTop: 2, marginBottom: 4 }]}>
            {LABEL_CATEGORIE_EQUIPEMENT[categorie]}
          </Text>
          {DESCRIPTION_CATEGORIE[categorie] && (
            <Text style={s.small}>
              {t(DESCRIPTION_CATEGORIE[categorie]!)}
            </Text>
          )}
          {questionsCategorie(categorie).length > 0 && (
            <Text style={[s.small, { marginTop: 4 }]}>
              Questions posées à la déclaration :{" "}
              {questionsCategorie(categorie).join(" · ")}
            </Text>
          )}

          {obligations.length === 0 ? (
            <Text style={[s.td, { marginTop: 12 }]}>
              Aucune obligation du référentiel ne cite cette catégorie :
              l&apos;outil ne produit aucune échéance pour un équipement rangé
              ici. Cela ne dit rien du droit applicable à l&apos;appareil.
            </Text>
          ) : (
            <EnTeteTableau />
          )}
          {obligations.map((o) => (
            <LigneObligation key={o.id} o={o} />
          ))}
          <PiedDePage />
        </Page>
      ))}
    </Document>
  );
}

const sortie =
  process.argv[2] ??
  path.resolve(process.cwd(), "..", "Rojer-grille-equipements.pdf");

const genereLe = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeZone: "Europe/Paris",
}).format(new Date());

renderToFile(<GrilleDocument genereLe={genereLe} />, sortie).then(
  () => console.log(`PDF écrit : ${sortie}`),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
