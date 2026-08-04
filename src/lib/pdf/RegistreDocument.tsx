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

export type RegistreData = {
  entreprise: string;
  etablissement: string;
  adresse: string;
  genereLe: Date;
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

        <Text style={s.h2}>Rapports de vérification archivés</Text>
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
            Tenue du registre (L. 4711-5 CT · R. 143-44 CCH · R. 146-21 CCH)
          </Text>
          <Text>
            Ce registre centralise les rapports de vérification réglementaire
            à tenir à disposition de l&apos;inspection du travail et de la
            commission de sécurité. Les fichiers originaux sont conservés et
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
