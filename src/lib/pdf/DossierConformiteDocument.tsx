import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { LignePlanActions } from "./PlanActionsDocument";
import type { LigneRapport, LigneVerif } from "./RegistreDocument";
import { LABEL_STATUT_ACTION, LABEL_TYPE_ACTION } from "@/lib/actions/labels";
import { LABEL_RESULTAT } from "@/lib/rapports/schema";
import { LABEL_DOMAINE } from "@/lib/calendrier/labels";
import {
  COULEURS,
  formatDateCourte,
  formatDateLongue,
  stylesCommuns as s,
} from "./styles";
import type { Score } from "@/lib/dashboard/score";

export type DossierData = {
  entreprise: string;
  siret: string | null;
  etablissement: string;
  adresse: string;
  effectifSurSite: number;
  codeNaf: string | null;
  regimesTexte: string; // ex: "Établissement de travail, ERP type N cat. 5"
  genereLe: Date;

  score: Score;
  duerp:
    | {
        duerpId: string;
        numeroDerniereVersion: number | null;
        dateDerniereVersion: Date | null;
        nombreUnites: number;
        nombreRisques: number;
        criticiteMax: number | null;
      }
    | null;
  compteurs: {
    verifsEnRetard: number;
    verifsPlanifiees: number;
    verifsRealisees12m: number;
    actionsOuvertes: number;
    actionsEnRetard: number;
  };
  rapportsRecents: LigneRapport[]; // 10 plus récents
  verifsEnRetard: LigneVerif[]; // toutes
  actionsEnCours: LignePlanActions[]; // toutes
};

function ScoreLigne({ score }: { score: Score }) {
  const couleur =
    score.niveau === "satisfaisante"
      ? COULEURS.vert
      : score.niveau === "a_surveiller"
        ? COULEURS.ambre
        : COULEURS.rose;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontFamily: "Helvetica-Bold",
          color: couleur,
        }}
      >
        {score.valeur}/100
      </Text>
      <Text style={{ fontSize: 11, color: couleur }}>{score.libelle}</Text>
    </View>
  );
}

export function DossierConformiteDocument({ data }: { data: DossierData }) {
  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={s.pageGarde}>
        <View>
          <Text style={{ fontSize: 10, color: COULEURS.texteSecondaire }}>
            Dossier de conformité santé-sécurité
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Helvetica-Bold",
              marginTop: 8,
            }}
          >
            {data.etablissement}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: COULEURS.texteSecondaire,
              marginTop: 6,
            }}
          >
            {data.entreprise}
            {data.siret ? ` · SIRET ${data.siret}` : ""}
          </Text>
        </View>

        <View style={{ marginTop: 60 }}>
          <Text style={s.metaLigne}>Adresse : {data.adresse}</Text>
          <Text style={s.metaLigne}>
            Effectif sur site : {data.effectifSurSite} salarié
            {data.effectifSurSite > 1 ? "s" : ""}
          </Text>
          {data.codeNaf && (
            <Text style={s.metaLigne}>Code NAF : {data.codeNaf}</Text>
          )}
          <Text style={s.metaLigne}>Régimes : {data.regimesTexte}</Text>
          <Text style={s.metaLigne}>
            Document édité le {formatDateLongue(data.genereLe)}
          </Text>
        </View>

        <View style={{ marginTop: 60 }}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold" }}>
            Score de conformité (indicateur interne)
          </Text>
          <ScoreLigne score={data.score} />
        </View>

        <View style={{ position: "absolute", bottom: 60, left: 60, right: 60 }}>
          <Text style={{ fontSize: 9, color: COULEURS.texteSecondaire }}>
            Ce dossier synthétise l&apos;état des obligations santé-sécurité à
            la date d&apos;édition. Les rapports de vérification, le DUERP
            versionné et le plan d&apos;actions sont consultables
            individuellement. Document interne, ne vaut pas certification
            réglementaire.
          </Text>
        </View>
      </Page>

      {/* Synthèse */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Synthèse</Text>

        <View style={{ marginTop: 8 }}>
          <Text style={s.h2}>État du DUERP</Text>
          {data.duerp === null ? (
            <Text style={s.small}>
              Aucun DUERP initié pour cet établissement.
            </Text>
          ) : data.duerp.numeroDerniereVersion === null ? (
            <Text style={s.small}>
              DUERP en cours de rédaction — aucune version encore validée.
            </Text>
          ) : (
            <View>
              <Text>
                Dernière version validée : v
                {data.duerp.numeroDerniereVersion}, le{" "}
                {formatDateCourte(data.duerp.dateDerniereVersion)}
              </Text>
              <Text style={[s.small, { marginTop: 2 }]}>
                {data.duerp.nombreUnites} unité
                {data.duerp.nombreUnites > 1 ? "s" : ""} de travail ·{" "}
                {data.duerp.nombreRisques} risque
                {data.duerp.nombreRisques > 1 ? "s" : ""} identifié
                {data.duerp.nombreRisques > 1 ? "s" : ""}
                {data.duerp.criticiteMax !== null
                  ? ` · criticité max ${data.duerp.criticiteMax}`
                  : ""}
              </Text>
            </View>
          )}
        </View>

        <View>
          <Text style={s.h2}>Vérifications et actions</Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View>
              <Text style={s.small}>Vérifs en retard</Text>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
                {data.compteurs.verifsEnRetard}
              </Text>
            </View>
            <View>
              <Text style={s.small}>Planifiées</Text>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
                {data.compteurs.verifsPlanifiees}
              </Text>
            </View>
            <View>
              <Text style={s.small}>Réalisées (12 mois)</Text>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
                {data.compteurs.verifsRealisees12m}
              </Text>
            </View>
            <View>
              <Text style={s.small}>Actions ouvertes</Text>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold" }}>
                {data.compteurs.actionsOuvertes}
              </Text>
            </View>
            <View>
              <Text style={s.small}>Actions en retard</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Helvetica-Bold",
                  color:
                    data.compteurs.actionsEnRetard > 0 ? COULEURS.rose : undefined,
                }}
              >
                {data.compteurs.actionsEnRetard}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Dossier de conformité — ${data.etablissement} — page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>

      {/* Vérifs en retard */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Vérifications à rattraper</Text>
        <Text style={s.small}>
          Occurrences dépassées ou à planifier à la date d&apos;édition.
        </Text>

        {data.verifsEnRetard.length === 0 ? (
          <Text style={[s.small, { marginTop: 12 }]}>
            Aucune vérification en retard.
          </Text>
        ) : (
          <View>
            <View style={s.thead}>
              <Text style={[s.th, { width: "14%" }]}>Échéance</Text>
              <Text style={[s.th, { width: "46%" }]}>Obligation</Text>
              <Text style={[s.th, { width: "26%" }]}>Équipement</Text>
              <Text style={[s.th, { width: "14%" }]}>Domaine</Text>
            </View>
            {data.verifsEnRetard.map((v) => (
              <View key={v.id} style={s.row} wrap={false}>
                <Text style={[s.td, { width: "14%" }]}>
                  {formatDateCourte(v.datePrevue)}
                </Text>
                <Text style={[s.td, { width: "46%" }]}>
                  {v.libelleObligation}
                </Text>
                <Text style={[s.td, { width: "26%" }]}>
                  {v.equipementLibelle}
                </Text>
                <Text style={[s.td, { width: "14%" }]}>
                  {v.domaine ? LABEL_DOMAINE[v.domaine] : "—"}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Dossier de conformité — ${data.etablissement} — page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>

      {/* Actions en cours */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Actions correctives en cours</Text>
        {data.actionsEnCours.length === 0 ? (
          <Text style={[s.small, { marginTop: 12 }]}>
            Aucune action en cours.
          </Text>
        ) : (
          <View>
            <View style={s.thead}>
              <Text style={[s.th, { width: "40%" }]}>Action</Text>
              <Text style={[s.th, { width: "18%" }]}>Type</Text>
              <Text style={[s.th, { width: "14%" }]}>Échéance</Text>
              <Text style={[s.th, { width: "14%" }]}>Responsable</Text>
              <Text style={[s.th, { width: "14%" }]}>Statut</Text>
            </View>
            {data.actionsEnCours.map((a) => (
              <View key={a.id} style={s.row} wrap={false}>
                <View style={{ width: "40%", paddingRight: 4 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9.5 }}>
                    {a.libelle}
                  </Text>
                  <Text style={[s.small, { marginTop: 2 }]}>
                    {a.contexte}
                  </Text>
                </View>
                <Text style={[s.td, { width: "18%" }]}>
                  {LABEL_TYPE_ACTION[a.type]}
                </Text>
                <Text style={[s.td, { width: "14%" }]}>
                  {formatDateCourte(a.echeance)}
                </Text>
                <Text style={[s.td, { width: "14%" }]}>
                  {a.responsable ?? "—"}
                </Text>
                <Text style={[s.td, { width: "14%" }]}>
                  {LABEL_STATUT_ACTION[a.statut]}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Dossier de conformité — ${data.etablissement} — page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>

      {/* Rapports récents + mentions légales */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Rapports de vérification récents</Text>
        {data.rapportsRecents.length === 0 ? (
          <Text style={[s.small, { marginTop: 12 }]}>
            Aucun rapport archivé pour l&apos;instant.
          </Text>
        ) : (
          <View>
            <View style={s.thead}>
              <Text style={[s.th, { width: "14%" }]}>Date</Text>
              <Text style={[s.th, { width: "40%" }]}>Obligation</Text>
              <Text style={[s.th, { width: "22%" }]}>Organisme</Text>
              <Text style={[s.th, { width: "24%" }]}>Résultat</Text>
            </View>
            {data.rapportsRecents.map((r) => (
              <View key={r.id} style={s.row} wrap={false}>
                <Text style={[s.td, { width: "14%" }]}>
                  {formatDateCourte(r.dateRapport)}
                </Text>
                <Text style={[s.td, { width: "40%" }]}>
                  {r.libelleObligation}
                </Text>
                <Text style={[s.td, { width: "22%" }]}>
                  {r.organismeVerif ?? "—"}
                </Text>
                <Text style={[s.td, { width: "24%" }]}>
                  {LABEL_RESULTAT[r.resultat]}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={s.h2}>Mentions légales</Text>
        <View style={s.mentionsLegalesBloc}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
            Obligations applicables
          </Text>
          <Text>
            — Évaluation des risques professionnels : articles R. 4121-1 à
            R. 4121-4 du Code du travail. Mise à jour annuelle minimum
            (entreprises ≥ 11 salariés), conservation 40 ans des versions
            (loi du 2 août 2021).
          </Text>
          <Text style={{ marginTop: 3 }}>
            — Principes généraux de prévention : article L. 4121-2 CT.
            Hiérarchie des mesures opposable.
          </Text>
          <Text style={{ marginTop: 3 }}>
            — Vérifications périodiques : articles R. 4226-14 et s. CT
            (électricité), R. 4222-20 CT (aération), R. 4227-28 et s. CT
            (incendie), arrêté du 25 juin 1980 (règlement ERP).
          </Text>
          <Text style={{ marginTop: 3 }}>
            — Registre de sécurité : L. 4711-5 CT, R. 143-44 CCH (ERP),
            R. 146-21 CCH (IGH).
          </Text>
          <Text style={{ marginTop: 6 }}>
            Ce dossier ne vaut pas certification de conformité. Il
            centralise les éléments opposables à disposition de
            l&apos;employeur pour faciliter le dialogue avec
            l&apos;inspection, la commission de sécurité, l&apos;assureur
            ou le bailleur.
          </Text>
        </View>

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Dossier de conformité — ${data.etablissement} — page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
