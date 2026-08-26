import { Document, Page, Text, View } from "@react-pdf/renderer";
import { LABEL_RESULTAT } from "@/lib/rapports/schema";
import { LABEL_DOMAINE } from "@/lib/calendrier/labels";
import type { DomaineObligation } from "@/lib/referentiels/conformite/types";
import type { ResultatVerification, StatutVerification } from "@prisma/client";
import {
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


/** Une fiche imprimée : son titre, son état, puis ce qu'elle porte. */
function FichePdfVue({ fiche }: { fiche: FichePdf }) {
  return (
    <View style={{ marginTop: 12 }} wrap={false}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottomWidth: 0.5,
          borderBottomColor: "#333",
          paddingBottom: 3,
        }}
      >
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>
          {fiche.titre}
        </Text>
        <Text style={s.small}>{fiche.etat}</Text>
      </View>

      <Text style={[s.small, { marginTop: 3 }]}>{fiche.attendu}</Text>

      {/* Forme « établissement » ou « formulaire ». */}
      {fiche.champs && (
        <View style={{ marginTop: 5 }}>
          {fiche.champs.map((c) => (
            <View
              key={c.libelle}
              style={{ flexDirection: "row", marginBottom: 2 }}
            >
              <Text style={[s.td, { width: "42%", color: "#555" }]}>
                {c.libelle}
              </Text>
              <Text style={[s.td, { width: "58%" }]}>{c.valeur}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Forme « journal ». Les colonnes s'impriment même sans ligne : une
          fiche vide doit montrer ce qu'on attendait d'elle. */}
      {fiche.colonnes && (
        <View style={{ marginTop: 5 }}>
          <View style={s.thead}>
            {fiche.colonnes.map((c) => (
              <Text
                key={c}
                style={[s.th, { width: `${100 / fiche.colonnes!.length}%` }]}
              >
                {c}
              </Text>
            ))}
          </View>
          {(fiche.lignes ?? []).length === 0 ? (
            <Text style={[s.small, { marginTop: 3 }]}>
              Aucune ligne consignée à ce jour.
            </Text>
          ) : (
            fiche.lignes!.map((ligne, i) => (
              <View key={i} style={s.row}>
                {ligne.map((v, j) => (
                  <Text
                    key={j}
                    style={[s.td, { width: `${100 / ligne.length}%` }]}
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
        <View style={{ marginTop: 5 }}>
          {fiche.tenues.length === 0 ? (
            <Text style={s.small}>
              Rien de déclaré à ce jour dans {fiche.source}.
            </Text>
          ) : (
            fiche.tenues.map((t, i) => (
              <View key={i} style={[s.row, { paddingVertical: 2 }]}>
                <Text style={[s.td, { width: "50%" }]}>{t.titre}</Text>
                <Text style={[s.td, { width: "50%", color: "#555" }]}>
                  {t.meta}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Rien ne la recueille : le dire, plutôt que d'imprimer un blanc. */}
      {!fiche.champs && !fiche.colonnes && !fiche.tenues && (
        <Text style={[s.small, { marginTop: 4 }]}>
          Cette fiche est due mais n&apos;est pas tenue dans l&apos;application.
          Elle est conservée hors de l&apos;outil et se présente avec le
          présent registre.
        </Text>
      )}
    </View>
  );
}

export function RegistreDocument({ data }: { data: RegistreData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.h1}>Registre de sécurité</Text>
          <Text style={s.metaLigne}>{data.entreprise}</Text>
          <Text style={s.metaLigne}>
            {data.etablissement} — {data.adresse}
          </Text>
          <Text style={s.metaLigne}>
            Édition du {formatDateLongue(data.genereLe)}
          </Text>
        </View>

        {/* L'état du registre, avant son contenu. C'est la première question
            de qui l'ouvre : qu'est-ce qui manquerait aujourd'hui. */}
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
            d&apos;autre. Il ne vaut pas attestation de conformité.
          </Text>
        </View>

        {data.parties.map((partie) => (
          <View key={partie.id} style={{ marginTop: 16 }}>
            <Text style={s.h2}>
              {partie.id} — {partie.titre}
            </Text>
            {partie.fiches.map((fiche) => (
              <FichePdfVue key={fiche.id} fiche={fiche} />
            ))}
          </View>
        ))}

        <Text style={[s.h2, { marginTop: 18 }]}>
          Index des rapports de vérification archivés
        </Text>
        {data.rapports.length === 0 ? (
          <Text style={s.small}>
            Aucun rapport archivé. Le registre reste ouvert à disposition de
            l&apos;inspection.
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

        <Text style={s.h2}>Vérifications en attente ou programmées</Text>
        {data.verifsEnAttente.length === 0 ? (
          <Text style={s.small}>
            Aucune vérification en cours. Déclarer vos équipements pour peupler
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
            Tenue du registre (L. 4711-5 CT · R. 143-44 CCH · R. 146-35 CCH)
          </Text>
          <Text>
            Ce registre réunit les fiches dues à cet établissement, leur
            contenu et les rapports de vérification archivés, à tenir à
            disposition de l&apos;inspection du travail et de la commission de
            sécurité. Les fichiers originaux des rapports sont conservés et
            téléchargeables depuis l&apos;application.
          </Text>
        </View>

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `${data.etablissement} — Registre — page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
