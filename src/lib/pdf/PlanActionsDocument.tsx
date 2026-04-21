import { Document, Page, Text, View } from "@react-pdf/renderer";
import { LABEL_STATUT_ACTION, LABEL_TYPE_ACTION } from "@/lib/actions/labels";
import type { OrigineAction } from "@/lib/actions/queries";
import {
  COULEURS,
  formatDateCourte,
  formatDateLongue,
  stylesCommuns as s,
} from "./styles";
import type { StatutAction, TypeAction } from "@prisma/client";

export type LignePlanActions = {
  id: string;
  libelle: string;
  description: string | null;
  type: TypeAction;
  statut: StatutAction;
  criticite: number | null;
  echeance: Date | null;
  responsable: string | null;
  origine: OrigineAction;
  contexte: string; // ex: "Unité cuisine · Risque X" ou "Vérification Y · Équipement Z"
  leveeLe: Date | null;
  leveeCommentaire: string | null;
};

export type PlanActionsData = {
  entreprise: string;
  etablissement: string;
  adresse: string;
  genereLe: Date;
  totalOuvertes: number;
  totalEnCours: number;
  totalLevees: number;
  actions: LignePlanActions[];
};

const COULEUR_STATUT: Record<StatutAction, string> = {
  ouverte: COULEURS.ambre,
  en_cours: "#1e3a8a",
  levee: COULEURS.vert,
  abandonnee: "#6b7280",
};

const LIBELLE_ORIGINE: Record<OrigineAction, string> = {
  duerp: "DUERP",
  verification: "Vérification",
  libre: "Libre",
};

export function PlanActionsDocument({ data }: { data: PlanActionsData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.h1}>Plan d&apos;actions de conformité</Text>
          <Text style={s.metaLigne}>{data.entreprise}</Text>
          <Text style={s.metaLigne}>
            {data.etablissement} — {data.adresse}
          </Text>
          <Text style={s.metaLigne}>
            Édition du {formatDateLongue(data.genereLe)}
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={s.h2}>Synthèse</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Text>Ouvertes : {data.totalOuvertes}</Text>
            <Text>En cours : {data.totalEnCours}</Text>
            <Text>Levées : {data.totalLevees}</Text>
          </View>
        </View>

        <Text style={s.h2}>Fiches</Text>

        {data.actions.length === 0 ? (
          <Text style={s.small}>Aucune action enregistrée.</Text>
        ) : (
          <View>
            <View style={s.thead}>
              <Text style={[s.th, { width: "38%" }]}>Action</Text>
              <Text style={[s.th, { width: "17%" }]}>Type / Origine</Text>
              <Text style={[s.th, { width: "13%" }]}>Échéance</Text>
              <Text style={[s.th, { width: "15%" }]}>Responsable</Text>
              <Text style={[s.th, { width: "17%" }]}>Statut</Text>
            </View>
            {data.actions.map((a) => (
              <View key={a.id} style={s.row} wrap={false}>
                <View style={{ width: "38%", paddingRight: 4 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
                    {a.libelle}
                  </Text>
                  <Text style={[s.small, { marginTop: 2 }]}>{a.contexte}</Text>
                  {a.description && (
                    <Text style={[s.small, { marginTop: 2 }]}>
                      {a.description}
                    </Text>
                  )}
                </View>
                <View style={{ width: "17%", paddingRight: 4 }}>
                  <Text style={s.td}>{LABEL_TYPE_ACTION[a.type]}</Text>
                  <Text style={[s.small, { marginTop: 2 }]}>
                    {LIBELLE_ORIGINE[a.origine]}
                    {a.criticite !== null ? ` · crit. ${a.criticite}` : ""}
                  </Text>
                </View>
                <Text style={[s.td, { width: "13%" }]}>
                  {formatDateCourte(a.echeance)}
                </Text>
                <Text style={[s.td, { width: "15%" }]}>
                  {a.responsable ?? "—"}
                </Text>
                <View style={{ width: "17%" }}>
                  <Text
                    style={{
                      fontSize: 9,
                      color: COULEUR_STATUT[a.statut],
                      fontFamily: "Helvetica-Bold",
                    }}
                  >
                    {LABEL_STATUT_ACTION[a.statut]}
                  </Text>
                  {a.leveeLe && (
                    <Text style={s.small}>
                      Levée le {formatDateCourte(a.leveeLe)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={s.mentionsLegalesBloc}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Hiérarchie des mesures de prévention (art. L. 4121-2 CT)
          </Text>
          <Text>
            1. Suppression du risque à la source · 2. Réduction à la source ·
            3. Protection collective · 4. Protection individuelle (EPI) ·
            5. Formation / information · 6. Mesures organisationnelles.
          </Text>
          <Text style={{ marginTop: 4 }}>
            Ce document ne vaut pas certification de conformité. Il
            récapitule les actions correctives en cours à la date
            d&apos;édition.
          </Text>
        </View>

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `${data.etablissement} — Plan d'actions — page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
