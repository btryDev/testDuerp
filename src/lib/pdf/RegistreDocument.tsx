import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LABEL_RESULTAT } from "@/lib/rapports/schema";
import { LABEL_DOMAINE } from "@/lib/calendrier/labels";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";
import type { ResultatVerification, StatutVerification } from "@prisma/client";
import {
  COULEURS,
  MARQUE,
  formatDateCourte,
  formatDateLongue,
  stylesCommuns as s,
} from "./styles";

export type LigneRapport = {
  id: string;
  dateRapport: Date;
  resultat: ResultatVerification;
  organismeVerif: string | null;
  libelleObligation: string;
  equipementLibelle: string;
  domaine: DomaineObligation | null;
  fichierNomOriginal: string;
  commentaires: string | null;
};

export type LigneVerif = {
  id: string;
  libelleObligation: string;
  equipementLibelle: string;
  datePrevue: Date;
  statut: StatutVerification;
  domaine: DomaineObligation | null;
};

/**
 * Une fiche du registre, mise à plat pour l'impression.
 *
 * Une seule forme de contenu est remplie à la fois — c'est la forme de la
 * fiche qui décide. Aucune n'est remplie quand rien ne la recueille : la
 * fiche s'imprime quand même, avec son état, parce qu'une fiche due absente
 * du document ferait croire le registre complet.
 */
export type FichePdf = {
  id: string;
  titre: string;
  attendu: string;
  raisons: string[];
  /** L'état de remplissage, dans les mots de l'écran. */
  etat: string;
  ton: "faite" | "renvoi" | "attente" | "muet";
  /**
   * La date de tenue de la fiche — le « Date ou mise à jour : le … » que
   * chaque feuille du registre imprimé porte en pied. `null` pour les fiches
   * qu'un autre écran alimente : leur fraîcheur n'est pas celle d'une saisie,
   * et imprimer une date inventée serait pire que n'en imprimer aucune.
   */
  misAJourLe: Date | null;
  /** Forme « établissement » ou « formulaire » : des questions et réponses. */
  champs?: { libelle: string; valeur: string }[];
  /** Forme « journal » : des lignes empilées. */
  colonnes?: string[];
  lignes?: string[][];
  /** Fiche tenue par un autre écran : ce qu'il porte, et lequel. */
  source?: string;
  tenues?: { titre: string; meta: string }[];
};

export type PartiePdf = {
  id: string;
  titre: string;
  fiches: FichePdf[];
};

export type BilanPdf = {
  dues: number;
  outillees: number;
  faites: number;
  aRemplir: number;
  tenuesAilleurs: number;
  nonOutillees: number;
};

export type RegistreData = {
  entreprise: string;
  etablissement: string;
  adresse: string;
  genereLe: Date;
  /** Les fiches dues, dans l'ordre du document. */
  parties: PartiePdf[];
  bilan: BilanPdf;
  rapports: LigneRapport[];
  verifsEnAttente: LigneVerif[];
};

const LIBELLE_STATUT_VERIF: Record<StatutVerification, string> = {
  a_planifier: "À planifier",
  planifiee: "Planifiée",
  depassee: "Dépassée",
  realisee_conforme: "Conforme",
  realisee_observations: "Observations",
  realisee_ecart_majeur: "Écart majeur",
};


// Mise en page propre au registre.
//
// Le document ne cherche pas une identité à lui : il reprend celle du
// registre imprimé qu'il remplace — une page de garde, un sommaire, puis des
// feuilles, chacune titrée et datée. C'est le vocabulaire que connaît la
// personne qui l'ouvrira, souvent un contrôleur, et le seul qui lui permette
// de retrouver une pièce sans lire le tout.
const sr = StyleSheet.create({
  // Le filet vert sous la marque : le seul geste de couleur de la couverture
  // du registre imprimé, et sa signature. Il se retrouve sous le sur-titre de
  // chaque feuille.
  gardeFilet: { borderTopWidth: 2.5, borderTopColor: MARQUE.vert, width: 62 },
  gardeTitre: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
    marginTop: 18,
    color: MARQUE.marine,
  },
  gardeLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    color: MARQUE.ardoise,
    marginBottom: 3,
  },
  gardeValeur: { fontSize: 12, marginBottom: 16, color: MARQUE.marine },

  // En-tête de partie : le numéro porte le repère, le titre porte le sens.
  partieTete: {
    flexDirection: "row",
    alignItems: "baseline",
    borderBottomWidth: 1.5,
    borderBottomColor: MARQUE.marine,
    paddingBottom: 5,
    marginTop: 22,
    marginBottom: 2,
  },
  partieNum: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    width: 42,
    color: MARQUE.marine,
  },
  // Le vert du modèle ne porte jamais de texte de structure : il ponctue.
  // Un numéro de partie en vert se lisait délavé à côté du titre marine.
  partieAccent: {
    borderTopWidth: 2.5,
    borderTopColor: MARQUE.vert,
    width: 26,
    marginTop: 22,
  },
  partieTitre: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: MARQUE.marine,
  },

  ficheTete: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 0.5,
    borderBottomColor: MARQUE.filet,
    paddingBottom: 3,
  },
  ficheTitre: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: MARQUE.marine,
  },
  // La bande d'en-tête de tableau du registre imprimé : aplat marine, texte
  // blanc. C'est ce qui fait lire une grille comme une grille — un simple
  // filet sous les intitulés ne s'attrape pas d'un coup d'œil sur une page
  // qui en compte plusieurs.
  bandeTete: {
    flexDirection: "row",
    backgroundColor: MARQUE.marine,
    paddingVertical: 4,
    paddingHorizontal: 5,
    marginTop: 6,
  },
  bandeTh: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#fff",
  },
  ligneTableau: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: MARQUE.filet,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
  },
  // Le pied de feuille du registre imprimé, qui date la tenue de la fiche.
  fichePied: {
    marginTop: 5,
    fontSize: 7.5,
    color: COULEURS.texteSecondaire,
    textAlign: "right",
  },
  cle: { fontSize: 9, color: MARQUE.ardoise, width: "42%" },
  valeur: { fontSize: 9, width: "58%", color: MARQUE.marine },

  sommaireCol: { width: "48%" },
  sommairePartie: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 3,
    color: MARQUE.marine,
  },
  sommaireFiche: {
    fontSize: 8.5,
    color: MARQUE.ardoise,
    marginBottom: 1.5,
  },
});

/** Ce que dit le pied d'une feuille — une date, ou pourquoi il n'y en a pas. */
function piedDeFiche(fiche: FichePdf): string {
  if (fiche.misAJourLe) {
    return `Date ou mise à jour : le ${formatDateLongue(fiche.misAJourLe)}`;
  }
  if (fiche.source) return `Tenue depuis ${fiche.source}`;
  return "Conservée hors de l'application";
}

/** Une feuille du registre : son titre, son état, ce qu'elle porte, sa date. */
function FichePdfVue({ fiche }: { fiche: FichePdf }) {
  const largeur = (n: number) => `${(100 / n).toFixed(4)}%`;

  return (
    <View style={{ marginTop: 14 }} wrap={false}>
      <View style={sr.ficheTete}>
        <Text style={sr.ficheTitre}>{fiche.titre}</Text>
        <Text style={s.small}>{fiche.etat}</Text>
      </View>

      <Text style={[s.small, { marginTop: 3 }]}>{fiche.attendu}</Text>

      {/* Forme « établissement » ou « formulaire » : des questions, des
          réponses. Une question sans réponse s'imprime quand même — c'est
          elle qui dit ce qui manquerait à une visite. */}
      {fiche.champs && (
        <View style={{ marginTop: 6 }}>
          {fiche.champs.map((c) => (
            <View
              key={c.libelle}
              style={{
                flexDirection: "row",
                borderBottomWidth: 0.5,
                borderBottomColor: MARQUE.filet,
                paddingVertical: 2.5,
              }}
            >
              <Text style={sr.cle}>{c.libelle}</Text>
              <Text style={sr.valeur}>{c.valeur}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Forme « journal ». Les colonnes s'impriment même sans ligne : une
          fiche vide doit montrer ce qu'on attendait d'elle. */}
      {fiche.colonnes && (
        <View style={{ marginTop: 6 }}>
          <View style={sr.bandeTete}>
            {fiche.colonnes.map((c) => (
              <Text
                key={c}
                style={[sr.bandeTh, { width: largeur(fiche.colonnes!.length) }]}
              >
                {c}
              </Text>
            ))}
          </View>
          {(fiche.lignes ?? []).length === 0 ? (
            <Text style={[s.small, { marginTop: 4 }]}>
              Aucune ligne consignée à ce jour.
            </Text>
          ) : (
            fiche.lignes!.map((ligne, i) => (
              <View key={i} style={sr.ligneTableau}>
                {ligne.map((v, j) => (
                  <Text
                    key={j}
                    style={[
                      s.td,
                      { width: largeur(ligne.length), color: MARQUE.marine },
                    ]}
                  >
                    {v}
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>
      )}

      {/* Fiche tenue par un autre écran : son contenu s'imprime ici, parce
          que c'est ici qu'il est présenté. */}
      {fiche.tenues && (
        <View style={{ marginTop: 6 }}>
          {fiche.tenues.length === 0 ? (
            <Text style={s.small}>
              Rien de déclaré à ce jour dans {fiche.source}.
            </Text>
          ) : (
            <>
              <View style={sr.bandeTete}>
                <Text style={[sr.bandeTh, { width: "50%" }]}>Désignation</Text>
                <Text style={[sr.bandeTh, { width: "50%" }]}>
                  Emplacement ou échéance
                </Text>
              </View>
              {fiche.tenues.map((t, i) => (
                <View key={i} style={sr.ligneTableau}>
                  <Text style={[s.td, { width: "50%", color: MARQUE.marine }]}>
                    {t.titre}
                  </Text>
                  <Text style={[s.td, { width: "50%", color: MARQUE.ardoise }]}>
                    {t.meta}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Rien ne la recueille : le dire, plutôt que d'imprimer un blanc. */}
      {!fiche.champs && !fiche.colonnes && !fiche.tenues && (
        <Text style={[s.small, { marginTop: 5 }]}>
          Cette fiche est due mais n&apos;est pas tenue dans l&apos;application.
          Elle est conservée sur un autre support et se présente avec le présent
          registre.
        </Text>
      )}

      <Text style={sr.fichePied}>{piedDeFiche(fiche)}</Text>
    </View>
  );
}

/**
 * Le pied de page, à instancier une fois par `Page`.
 *
 * ⚠ **Sans numéro de page, et ce n'est pas un oubli.** La prop `render` de
 * `@react-pdf/renderer` (4.5.1) ne produit rien — vérifié en isolant les
 * quatre variantes : `fixed` + texte statique s'imprime, `render` ne
 * s'imprime jamais, qu'il rende une chaîne ou un nœud, avec ou sans `fixed`,
 * sur un `Text` comme sur un `View`.
 *
 * Le défaut ne vient pas de ce document : `stylesCommuns.footer` est utilisé
 * avec `render` par les quatre PDF du produit (DUERP, plan d'actions,
 * dossier de conformité, registre), qui perdent donc tous leur pied de page
 * en silence. Le rétablir partout suppose de monter de version ou de
 * numéroter autrement, ce qui se décide à l'échelle du dossier `pdf/`.
 *
 * En attendant, mieux vaut un pied qui s'imprime sans numéro qu'un pied
 * qui ne s'imprime pas : sur un document d'une cinquantaine de feuilles
 * présenté à un contrôleur, savoir de quel établissement il s'agit est ce
 * qui compte le plus.
 */
function PiedDePage({ etablissement }: { etablissement: string }) {
  return (
    <Text
      style={[s.footer, { color: MARQUE.ardoise, borderTopColor: MARQUE.filet }]}
      fixed
    >
      {etablissement} — Registre de sécurité incendie
    </Text>
  );
}

export function RegistreDocument({ data }: { data: RegistreData }) {

  // Le sommaire se lit sur deux colonnes, comme celui du registre imprimé :
  // dix parties et une cinquantaine de fiches tiennent alors sur une page, et
  // l'on voit la forme du document d'un seul regard.
  const moitie = Math.ceil(data.parties.length / 2);
  const colonnes = [
    data.parties.slice(0, moitie),
    data.parties.slice(moitie),
  ];

  return (
    <Document>
      {/* Page de garde — l'identité de l'établissement, et rien d'autre.
          C'est la page qu'on pose sur une table devant un contrôleur. */}
      <Page
        size="A4"
        style={[s.pageGarde, { flexDirection: "column", justifyContent: "space-between" }]}
      >
        <View>
          <View style={sr.gardeFilet} />
          <Text style={sr.gardeTitre}>
            Registre{"\n"}de sécurité{"\n"}incendie
          </Text>
        </View>

        {/* L'identité en pied de page, comme sur la couverture du registre
            imprimé : le titre dit ce que c'est, le pied dit de qui. */}
        <View>
          <Text style={sr.gardeLabel}>ÉTABLISSEMENT</Text>
          <Text style={sr.gardeValeur}>{data.etablissement}</Text>

          <Text style={sr.gardeLabel}>ENTREPRISE</Text>
          <Text style={sr.gardeValeur}>{data.entreprise}</Text>

          <Text style={sr.gardeLabel}>ADRESSE</Text>
          <Text style={sr.gardeValeur}>{data.adresse}</Text>

          <Text style={sr.gardeLabel}>DATE D&apos;ÉDITION</Text>
          <Text style={sr.gardeValeur}>{formatDateLongue(data.genereLe)}</Text>
        </View>
      </Page>

      {/* Sommaire et composition. Le premier dit ce que contient le document,
          la seconde ce qui y manque : les deux questions qu'on se pose en
          l'ouvrant, dans cet ordre. */}
      <Page size="A4" style={s.page}>
        <Text style={[s.h1, { color: MARQUE.marine }]}>Sommaire</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {colonnes.map((col, i) => (
            <View key={i} style={sr.sommaireCol}>
              {col.map((partie) => (
                <View key={partie.id} wrap={false}>
                  <Text style={sr.sommairePartie}>
                    {partie.id}  {partie.titre}
                  </Text>
                  {partie.fiches.map((f) => (
                    <Text key={f.id} style={sr.sommaireFiche}>
                      {f.titre}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={s.mentionsLegalesBloc}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Composition de ce registre
          </Text>
          <Text>
            {data.bilan.dues} fiches sont dues pour cet établissement, compte
            tenu de son régime et des équipements déclarés :{" "}
            {data.bilan.faites} renseignées, {data.bilan.tenuesAilleurs} tenues
            depuis le parc d&apos;équipements ou le calendrier,{" "}
            {data.bilan.aRemplir} restant à remplir, et{" "}
            {data.bilan.nonOutillees} conservées hors de l&apos;application.
          </Text>
          <Text style={{ marginTop: 4 }}>
            Ce décompte dit ce que l&apos;application recueille, et rien
            d&apos;autre. Il ne vaut pas attestation de conformité : une fiche
            renseignée peut l&apos;être avec une réponse fausse, et une fiche
            que l&apos;outil ne recueille pas reste due.
          </Text>
        </View>

        <PiedDePage etablissement={data.etablissement} />
      </Page>

      {/* Le corps : les fiches, dans l'ordre du document. */}
      <Page size="A4" style={s.page}>
        {data.parties.map((partie) => (
          <View key={partie.id}>
            {/* L'en-tête voyage avec sa première fiche : seul en bas de page,
                il annonce une partie qui commence à la suivante — le lecteur
                tourne alors la page pour retrouver le titre qu'il vient de
                lire. `minPresenceAhead` ne suffisait pas à l'empêcher. */}
            <View wrap={false}>
              <View style={sr.partieAccent} />
              <View style={[sr.partieTete, { marginTop: 6 }]}>
                <Text style={sr.partieNum}>{partie.id}</Text>
                <Text style={sr.partieTitre}>{partie.titre}</Text>
              </View>
              {partie.fiches[0] && <FichePdfVue fiche={partie.fiches[0]} />}
            </View>
            {partie.fiches.slice(1).map((fiche) => (
              <FichePdfVue key={fiche.id} fiche={fiche} />
            ))}
          </View>
        ))}

        <PiedDePage etablissement={data.etablissement} />
      </Page>

      {/* L'index des rapports archivés — la pièce qu'un contrôleur ouvre en
          premier, et la seule qui pointe vers des fichiers conservés à part. */}
      <Page size="A4" style={s.page}>
        <Text style={[s.h1, { color: MARQUE.marine }]}>
          Rapports de vérification archivés
        </Text>
        {data.rapports.length === 0 ? (
          <Text style={s.small}>
            Aucun rapport archivé à ce jour. Le registre reste tenu à
            disposition de l&apos;inspection.
          </Text>
        ) : (
          <View>
            <View style={s.thead}>
              <Text style={[s.th, { width: "14%" }]}>Date</Text>
              <Text style={[s.th, { width: "36%" }]}>Obligation</Text>
              <Text style={[s.th, { width: "20%" }]}>Équipement</Text>
              <Text style={[s.th, { width: "16%" }]}>Organisme</Text>
              <Text style={[s.th, { width: "14%" }]}>Résultat</Text>
            </View>
            {data.rapports.map((r) => (
              <View key={r.id} style={s.row} wrap={false}>
                <Text style={[s.td, { width: "14%" }]}>
                  {formatDateCourte(r.dateRapport)}
                </Text>
                <View style={{ width: "36%", paddingRight: 4 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
                    {r.libelleObligation}
                  </Text>
                  <Text style={[s.small, { marginTop: 2 }]}>
                    {r.domaine ? LABEL_DOMAINE[r.domaine] : ""}
                  </Text>
                </View>
                <Text style={[s.td, { width: "20%" }]}>
                  {r.equipementLibelle}
                </Text>
                <Text style={[s.td, { width: "16%" }]}>
                  {r.organismeVerif ?? "—"}
                </Text>
                <Text style={[s.td, { width: "14%" }]}>
                  {LABEL_RESULTAT[r.resultat]}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[s.h2, { color: MARQUE.marine }]}>
          Vérifications en attente ou programmées
        </Text>
        {data.verifsEnAttente.length === 0 ? (
          <Text style={s.small}>
            Aucune vérification en cours. Déclarez vos équipements pour peupler
            le calendrier.
          </Text>
        ) : (
          <View>
            <View style={s.thead}>
              <Text style={[s.th, { width: "14%" }]}>Échéance</Text>
              <Text style={[s.th, { width: "40%" }]}>Obligation</Text>
              <Text style={[s.th, { width: "25%" }]}>Équipement</Text>
              <Text style={[s.th, { width: "21%" }]}>Statut</Text>
            </View>
            {data.verifsEnAttente.map((v) => (
              <View key={v.id} style={s.row} wrap={false}>
                <Text style={[s.td, { width: "14%" }]}>
                  {formatDateCourte(v.datePrevue)}
                </Text>
                <View style={{ width: "40%", paddingRight: 4 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
                    {v.libelleObligation}
                  </Text>
                  <Text style={[s.small, { marginTop: 2 }]}>
                    {v.domaine ? LABEL_DOMAINE[v.domaine] : ""}
                  </Text>
                </View>
                <Text style={[s.td, { width: "25%" }]}>
                  {v.equipementLibelle}
                </Text>
                <Text style={[s.td, { width: "21%" }]}>
                  {LIBELLE_STATUT_VERIF[v.statut]}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.mentionsLegalesBloc}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Tenue du registre (R. 143-44 CCH · L. 4711-1 et L. 4711-5 CT)
          </Text>
          <Text>
            Ce registre réunit les fiches dues à cet établissement, leur contenu
            et les rapports de vérification archivés, à tenir à disposition de
            l&apos;inspection du travail et de la commission de sécurité. Les
            fichiers originaux des rapports sont conservés et téléchargeables
            depuis l&apos;application.
          </Text>
        </View>

        <PiedDePage etablissement={data.etablissement} />
      </Page>
    </Document>
  );
}
