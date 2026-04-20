import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { prioriser } from "@/lib/cotation";
import { LABEL_STATUT, LABEL_TYPE_MESURE } from "@/lib/mesures/labels";
import type { DuerpSnapshot } from "@/lib/versions/snapshot";
import type { TypeMesure } from "@/lib/referentiels/types";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
    lineHeight: 1.4,
  },
  h1: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  h3: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 4,
  },
  small: { fontSize: 8, color: "#555" },
  badge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    color: "#111",
    backgroundColor: "#eee",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  thead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 4,
    marginTop: 6,
  },
  th: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  td: { fontSize: 9 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#777",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 6,
  },
  pageNumber: { fontSize: 8 },
  watermarkBand: {
    position: "absolute",
    top: 14,
    left: 40,
    right: 40,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#fef3c7",
    borderWidth: 0.5,
    borderColor: "#d97706",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  watermarkLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    letterSpacing: 1.2,
  },
  watermarkHint: {
    fontSize: 7,
    color: "#92400e",
  },
});

function badgeColor(criticite: number): string {
  if (criticite >= 12) return "#fca5a5";
  if (criticite >= 6) return "#fdba74";
  if (criticite >= 3) return "#fde68a";
  return "#bbf7d0";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type Props = {
  snapshot: DuerpSnapshot;
  historique: Array<{ numero: number; genereLe: string; motif: string | null }>;
  /** Aperçu non figé : affiche un bandeau « BROUILLON » sur chaque page. */
  brouillon?: boolean;
};

export function DuerpDocument({ snapshot, historique, brouillon = false }: Props) {
  const { entreprise, unites, version, genereLe, motif } = snapshot;

  const lignes = unites.flatMap((u) =>
    u.risques.map((r) => ({
      id: r.id,
      libelle: r.libelle,
      uniteNom: u.nom,
      gravite: r.gravite,
      probabilite: r.probabilite,
      maitrise: r.maitrise,
      criticite: r.criticite,
      cotationSaisie: r.cotationSaisie,
      mesures: r.mesures,
    })),
  );
  const risquesPriorises = prioriser(lignes);
  const actionsPrevues = unites
    .flatMap((u) =>
      u.risques.flatMap((r) =>
        r.mesures
          .filter((m) => m.statut === "prevue")
          .map((m) => ({
            libelleMesure: m.libelle,
            type: m.type,
            echeance: m.echeance,
            responsable: m.responsable,
            libelleRisque: r.libelle,
            uniteNom: u.nom,
            criticiteRisque: r.criticite,
          })),
      ),
    )
    .sort((a, b) => {
      const ta = a.echeance ? new Date(a.echeance).getTime() : Infinity;
      const tb = b.echeance ? new Date(b.echeance).getTime() : Infinity;
      if (ta !== tb) return ta - tb;
      return b.criticiteRisque - a.criticiteRisque;
    });

  const Bandeau = () =>
    brouillon ? (
      <View style={s.watermarkBand} fixed>
        <Text style={s.watermarkLabel}>
          DOCUMENT NON VALIDÉ — APERÇU
        </Text>
        <Text style={s.watermarkHint}>
          Aucune valeur légale avant validation d&apos;une version
        </Text>
      </View>
    ) : null;

  return (
    <Document
      title={
        brouillon
          ? `DUERP ${entreprise.raisonSociale} — aperçu`
          : `DUERP ${entreprise.raisonSociale} — v${version}`
      }
      author={entreprise.raisonSociale}
    >
      {/* Page de garde */}
      <Page size="A4" style={s.page}>
        <Bandeau />
        <View style={{ marginTop: 120 }}>
          <Text style={s.small}>Document Unique d&apos;Évaluation des Risques Professionnels</Text>
          <Text style={[s.h1, { fontSize: 28, marginTop: 12 }]}>
            {entreprise.raisonSociale}
          </Text>
          <View style={{ marginTop: 24 }}>
            <Text style={s.small}>Code NAF : {entreprise.codeNaf}</Text>
            {entreprise.siret && (
              <Text style={s.small}>SIRET : {entreprise.siret}</Text>
            )}
            <Text style={s.small}>Effectif : {entreprise.effectif}</Text>
            <Text style={s.small}>Adresse : {entreprise.adresse}</Text>
          </View>
          <View style={{ marginTop: 48 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              Version {version} — {formatDateTime(genereLe)}
            </Text>
            {motif && <Text style={s.small}>Motif : {motif}</Text>}
          </View>
          <View style={{ marginTop: 80 }}>
            <Text style={s.small}>
              Ce document est établi en application des articles R. 4121-1 à
              R. 4121-4 du Code du travail. La mise à jour annuelle est
              obligatoire dans les entreprises d&apos;au moins 11 salariés
              (art. R. 4121-2). Toute entreprise doit en outre le mettre à
              jour à chaque décision d&apos;aménagement important, après un
              accident, ou lorsqu&apos;une information supplémentaire sur
              l&apos;évaluation d&apos;un risque est portée à la connaissance
              de l&apos;employeur. Conservation 40 ans à compter de son
              élaboration, ainsi que ses versions antérieures (loi du 2 août
              2021).
            </Text>
          </View>
        </View>
        <Text style={s.footer} fixed>
          {entreprise.raisonSociale} — DUERP v{version}
        </Text>
      </Page>

      {/* Méthodologie + unités */}
      <Page size="A4" style={s.page}>
        <Bandeau />
        <Text style={s.h2}>Méthodologie d&apos;évaluation</Text>
        <Text style={s.h3}>Modalités et découpage</Text>
        <Text>
          L&apos;évaluation est conduite par unité de travail, chaque unité
          regroupant les salariés exposés aux mêmes situations de risque (cf.
          art. R. 4121-1 et INRS ED 840).
          {"\n"}L&apos;inventaire des risques s&apos;appuie sur les référentiels
          sectoriels et transverses INRS pré-chargés (voir ci-dessous), que
          l&apos;employeur complète et ajuste à sa réalité.
        </Text>

        <Text style={s.h3}>Appréciation</Text>
        <Text>
          Chaque risque est coté sur trois axes — gravité, probabilité,
          maîtrise — via des questions comportementales traduites en notes de
          1 à 4. La criticité est calculée selon la formule{" "}
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            (gravité × probabilité) ÷ maîtrise
          </Text>
          , arrondie au plus proche entier et bornée entre 1 et 16.
          {"\n"}Comme le rappelle la brochure INRS ED 840, aucune méthode
          d&apos;appréciation n&apos;est imposée par la réglementation : ces
          règles sont à définir par l&apos;entreprise. La méthode déterministe
          retenue ici est une approche simplifiée, communément utilisée pour
          structurer l&apos;évaluation. Elle ne prétend pas se substituer à
          l&apos;appréciation qualitative recommandée par l&apos;INRS pour les
          situations complexes.
        </Text>

        <Text style={s.h3}>Hiérarchie des mesures</Text>
        <Text>
          La priorisation des mesures suit l&apos;ordre imposé par
          l&apos;article L. 4121-2 du Code du travail :
          {"\n"}1. éviter les risques ; 2. évaluer les risques qui ne peuvent
          être évités ; 3. combattre les risques à la source ; 4. adapter le
          travail à l&apos;homme ; 5. tenir compte de l&apos;évolution de la
          technique ; 6. remplacer ce qui est dangereux par ce qui l&apos;est
          moins ; 7. planifier la prévention ; 8. prendre des mesures de
          protection collective en leur donnant la priorité sur les mesures
          individuelles ; 9. donner les instructions appropriées aux
          travailleurs.
        </Text>

        <Text style={s.h2}>Sources et référentiels</Text>
        <Text style={s.small}>
          Les unités de travail et risques pré-suggérés s&apos;appuient sur les
          publications de l&apos;Institut National de Recherche et de Sécurité
          (INRS) et de l&apos;Assurance Maladie — Risques professionnels :
        </Text>
        <View style={{ marginLeft: 12, marginTop: 4 }}>
          <Text style={s.small}>
            • Restauration : INRS ED 880 « La restauration traditionnelle »
            (novembre 2012).
          </Text>
          <Text style={s.small}>
            • Commerce : INRS AC 93 « OiRA commerce non alimentaire » (juin
            2016) et ED 925 « Les commerces alimentaires de proximité ».
          </Text>
          <Text style={s.small}>
            • Bureau / tertiaire : dossier INRS « Travail de bureau », ED 950
            « Conception des lieux et des situations de travail » (août 2025)
            et ED 6497 « Qualité de l&apos;air intérieur ».
          </Text>
          <Text style={s.small}>
            • Risques transverses : INRS ED 840 « Évaluation des risques
            professionnels — Aide au repérage des risques dans les PME-PMI »
            (octobre 2023, taxonomie des 20 familles de risques).
          </Text>
        </View>

        <Text style={s.h2}>Unités de travail</Text>
        {unites.map((u) => (
          <View key={u.id} style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              {u.nom}
              {u.estTransverse ? " (transverse)" : ""}
            </Text>
            {u.description && <Text style={s.small}>{u.description}</Text>}
          </View>
        ))}
        <Text style={s.footer} fixed>
          {entreprise.raisonSociale} — DUERP v{version}
        </Text>
      </Page>

      {/* Risques par unité */}
      <Page size="A4" style={s.page}>
        <Bandeau />
        <Text style={s.h2}>Inventaire des risques</Text>
        {unites
          .filter((u) => u.risques.length > 0)
          .map((u) => (
            <View key={u.id} style={{ marginTop: 10 }} wrap={false}>
              <Text style={s.h3}>
                {u.nom}
                {u.estTransverse ? " (transverse)" : ""}
              </Text>
              <View style={s.thead}>
                <Text style={[s.th, { width: "45%" }]}>Risque</Text>
                <Text style={[s.th, { width: "10%" }]}>G × P / M</Text>
                <Text style={[s.th, { width: "10%" }]}>Criticité</Text>
                <Text style={[s.th, { width: "35%" }]}>Mesures</Text>
              </View>
              {u.risques.map((r) => (
                <View key={r.id} style={s.row}>
                  <View style={{ width: "45%" }}>
                    <Text style={s.td}>{r.libelle}</Text>
                    {(r.nombreSalariesExposes !== null ||
                      r.dateMesuresPhysiques !== null ||
                      r.exposeCMR) && (
                      <Text style={s.small}>
                        {r.nombreSalariesExposes !== null
                          ? `Salariés exposés : ${r.nombreSalariesExposes}`
                          : null}
                        {r.nombreSalariesExposes !== null &&
                        (r.dateMesuresPhysiques || r.exposeCMR)
                          ? " · "
                          : ""}
                        {r.dateMesuresPhysiques
                          ? `Dern. mesure phys. : ${formatDate(r.dateMesuresPhysiques)}`
                          : null}
                        {r.dateMesuresPhysiques && r.exposeCMR ? " · " : ""}
                        {r.exposeCMR ? (
                          <Text style={{ color: "#b30000" }}>
                            CMR (R. 4412-59)
                          </Text>
                        ) : null}
                      </Text>
                    )}
                  </View>
                  <Text style={[s.td, { width: "10%" }]}>
                    {r.gravite} × {r.probabilite} / {r.maitrise}
                  </Text>
                  <View style={{ width: "10%" }}>
                    <Text
                      style={[
                        s.badge,
                        {
                          backgroundColor: badgeColor(r.criticite),
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      {r.cotationSaisie ? `${r.criticite}/16` : "n.c."}
                    </Text>
                  </View>
                  <View style={{ width: "35%" }}>
                    {r.mesures.length === 0 ? (
                      <Text style={s.small}>—</Text>
                    ) : (
                      r.mesures.map((m, i) => (
                        <Text key={m.id} style={s.small}>
                          {i + 1}. {m.libelle}{" "}
                          <Text
                            style={{
                              color:
                                m.statut === "existante" ? "#0b7" : "#06c",
                            }}
                          >
                            [{LABEL_STATUT[m.statut]}]
                          </Text>
                          {m.echeance ? ` · ${formatDate(m.echeance)}` : ""}
                        </Text>
                      ))
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}

        {/* Déclarations d'absence de risque significatif (traçabilité ED 840) */}
        {unites.some(
          (u) => u.risques.length === 0 && u.aucunRisqueJustif,
        ) && (
          <View style={{ marginTop: 20 }} wrap={false}>
            <Text style={s.h3}>
              Unités déclarées sans risque significatif
            </Text>
            <Text style={[s.small, { marginBottom: 6 }]}>
              Conformément aux recommandations INRS (ED 840), une unité de
              travail peut légitimement être déclarée sans risque significatif
              après évaluation, dès lors que cette conclusion est documentée.
            </Text>
            {unites
              .filter((u) => u.risques.length === 0 && u.aucunRisqueJustif)
              .map((u) => (
                <View key={u.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
                    {u.nom}
                  </Text>
                  <Text style={s.small}>
                    Justification : {u.aucunRisqueJustif}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Risques CMR — listing dédié pour alerter l'employeur */}
        {unites.some((u) => u.risques.some((r) => r.exposeCMR)) && (
          <View style={{ marginTop: 20 }} wrap={false}>
            <Text style={s.h3}>
              Risques avec exposition à un agent CMR
            </Text>
            <Text style={[s.small, { marginBottom: 6 }]}>
              Les risques ci-dessous ont été déclarés comme exposant un ou
              plusieurs salariés à un agent Cancérogène, Mutagène ou toxique
              pour la Reproduction (art. R. 4412-59 et suivants). Obligations
              spécifiques : substitution prioritaire, liste des salariés
              exposés, suivi médical renforcé, information et formation.
            </Text>
            {unites.flatMap((u) =>
              u.risques
                .filter((r) => r.exposeCMR)
                .map((r) => (
                  <Text key={r.id} style={s.small}>
                    • [{u.nom}] {r.libelle}
                    {r.nombreSalariesExposes !== null
                      ? ` · ${r.nombreSalariesExposes} salarié${r.nombreSalariesExposes > 1 ? "s" : ""} exposé${r.nombreSalariesExposes > 1 ? "s" : ""}`
                      : ""}
                  </Text>
                )),
            )}
          </View>
        )}

        {/* Unités sans risque ni justification — avertissement de qualité */}
        {unites.some(
          (u) =>
            !u.estTransverse &&
            u.risques.length === 0 &&
            !u.aucunRisqueJustif,
        ) && (
          <View style={{ marginTop: 16 }}>
            <Text style={s.h3}>Unités à compléter</Text>
            <Text style={s.small}>
              Les unités suivantes n&apos;ont ni risque identifié ni
              déclaration d&apos;absence de risque — l&apos;évaluation y est
              incomplète :
            </Text>
            {unites
              .filter(
                (u) =>
                  !u.estTransverse &&
                  u.risques.length === 0 &&
                  !u.aucunRisqueJustif,
              )
              .map((u) => (
                <Text key={u.id} style={s.small}>
                  • {u.nom}
                </Text>
              ))}
          </View>
        )}

        <Text style={s.footer} fixed>
          {entreprise.raisonSociale} — DUERP v{version}
        </Text>
      </Page>

      {/* Plan d'actions priorisé */}
      <Page size="A4" style={s.page}>
        <Bandeau />
        <Text style={s.h2}>Plan d&apos;actions priorisé</Text>
        <Text style={[s.small, { marginBottom: 8 }]}>
          Risques triés par criticité décroissante (gravité en second critère).
        </Text>
        <View style={s.thead}>
          <Text style={[s.th, { width: "10%" }]}>Criticité</Text>
          <Text style={[s.th, { width: "40%" }]}>Risque</Text>
          <Text style={[s.th, { width: "20%" }]}>Unité</Text>
          <Text style={[s.th, { width: "30%" }]}>Prochaine action</Text>
        </View>
        {risquesPriorises.map((r) => {
          const prochaine = r.mesures
            .filter((m) => m.statut === "prevue")
            .sort((a, b) => {
              const ta = a.echeance ? new Date(a.echeance).getTime() : Infinity;
              const tb = b.echeance ? new Date(b.echeance).getTime() : Infinity;
              return ta - tb;
            })[0];
          return (
            <View key={r.id} style={s.row}>
              <View style={{ width: "10%" }}>
                <Text
                  style={[
                    s.badge,
                    {
                      backgroundColor: badgeColor(r.criticite),
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  {r.cotationSaisie ? `${r.criticite}/16` : "n.c."}
                </Text>
              </View>
              <Text style={[s.td, { width: "40%" }]}>{r.libelle}</Text>
              <Text style={[s.td, { width: "20%" }]}>{r.uniteNom}</Text>
              <Text style={[s.td, { width: "30%" }]}>
                {prochaine
                  ? `${prochaine.libelle}${prochaine.echeance ? ` · ${formatDate(prochaine.echeance)}` : ""}`
                  : "—"}
              </Text>
            </View>
          );
        })}

        <Text style={[s.h2, { marginTop: 20 }]}>Actions prévues</Text>
        {actionsPrevues.length === 0 ? (
          <Text style={s.small}>Aucune action planifiée.</Text>
        ) : (
          <>
            <View style={s.thead}>
              <Text style={[s.th, { width: "15%" }]}>Échéance</Text>
              <Text style={[s.th, { width: "35%" }]}>Action</Text>
              <Text style={[s.th, { width: "20%" }]}>Risque / Unité</Text>
              <Text style={[s.th, { width: "15%" }]}>Type</Text>
              <Text style={[s.th, { width: "15%" }]}>Responsable</Text>
            </View>
            {actionsPrevues.map((a, i) => (
              <View key={i} style={s.row}>
                <Text style={[s.td, { width: "15%" }]}>
                  {formatDate(a.echeance)}
                </Text>
                <Text style={[s.td, { width: "35%" }]}>{a.libelleMesure}</Text>
                <Text style={[s.td, { width: "20%" }]}>
                  {a.libelleRisque} · {a.uniteNom}
                </Text>
                <Text style={[s.td, { width: "15%" }]}>
                  {LABEL_TYPE_MESURE[a.type as TypeMesure] ?? a.type}
                </Text>
                <Text style={[s.td, { width: "15%" }]}>
                  {a.responsable ?? "—"}
                </Text>
              </View>
            ))}
          </>
        )}
        <Text style={s.footer} fixed>
          {entreprise.raisonSociale} — DUERP v{version}
        </Text>
      </Page>

      {/* Annexe exposition — R. 4121-1-1 : proportion de salariés exposés.
          On ne la génère que si au moins un risque renseigne l'un des champs
          (salariés exposés, mesures physiques, CMR). */}
      {unites.some((u) =>
        u.risques.some(
          (r) =>
            r.nombreSalariesExposes !== null ||
            r.dateMesuresPhysiques !== null ||
            r.exposeCMR,
        ),
      ) && (
        <Page size="A4" style={s.page}>
          <Bandeau />
          <Text style={s.h2}>Annexe — Exposition (R. 4121-1-1)</Text>
          <Text style={[s.small, { marginBottom: 8 }]}>
            Article R. 4121-1-1 : données utiles à l&apos;évaluation des
            expositions individuelles et proportion de salariés exposés
            au-delà des seuils réglementaires. Cette annexe consolide les
            informations saisies sur chaque risque.
          </Text>
          <View style={s.thead}>
            <Text style={[s.th, { width: "30%" }]}>Risque</Text>
            <Text style={[s.th, { width: "20%" }]}>Unité</Text>
            <Text style={[s.th, { width: "15%" }]}>
              Salariés exposés
            </Text>
            <Text style={[s.th, { width: "20%" }]}>
              Dern. mesures physiques
            </Text>
            <Text style={[s.th, { width: "15%" }]}>CMR</Text>
          </View>
          {unites.flatMap((u) =>
            u.risques
              .filter(
                (r) =>
                  r.nombreSalariesExposes !== null ||
                  r.dateMesuresPhysiques !== null ||
                  r.exposeCMR,
              )
              .map((r) => (
                <View key={r.id} style={s.row}>
                  <Text style={[s.td, { width: "30%" }]}>{r.libelle}</Text>
                  <Text style={[s.td, { width: "20%" }]}>{u.nom}</Text>
                  <Text style={[s.td, { width: "15%" }]}>
                    {r.nombreSalariesExposes !== null
                      ? `${r.nombreSalariesExposes}`
                      : "—"}
                  </Text>
                  <Text style={[s.td, { width: "20%" }]}>
                    {formatDate(r.dateMesuresPhysiques)}
                  </Text>
                  <Text
                    style={[
                      s.td,
                      { width: "15%" },
                      r.exposeCMR ? { color: "#b30000" } : {},
                    ]}
                  >
                    {r.exposeCMR ? "Oui — R. 4412" : "—"}
                  </Text>
                </View>
              )),
          )}
          <Text style={[s.small, { marginTop: 10 }]}>
            Textes de référence pour les mesures physiques : bruit
            (R. 4432-1 et suiv.), éclairement (R. 4223-4), ambiances
            thermiques, vibrations (R. 4441-1 et suiv.). Les expositions CMR
            déclenchent les obligations renforcées de l&apos;art. R. 4412-59
            et suivants (substitution, liste nominative, suivi médical).
          </Text>
          <Text style={s.footer} fixed>
            {entreprise.raisonSociale} — DUERP v{version}
          </Text>
        </Page>
      )}

      {/* Historique + mentions légales */}
      <Page size="A4" style={s.page}>
        <Bandeau />
        <Text style={s.h2}>Historique des versions</Text>
        <View style={s.thead}>
          <Text style={[s.th, { width: "15%" }]}>Version</Text>
          <Text style={[s.th, { width: "25%" }]}>Date</Text>
          <Text style={[s.th, { width: "60%" }]}>Motif</Text>
        </View>
        {historique.map((v) => (
          <View key={v.numero} style={s.row}>
            <Text style={[s.td, { width: "15%" }]}>v{v.numero}</Text>
            <Text style={[s.td, { width: "25%" }]}>
              {formatDateTime(v.genereLe)}
            </Text>
            <Text style={[s.td, { width: "60%" }]}>{v.motif ?? "—"}</Text>
          </View>
        ))}

        <Text style={s.h2}>Mentions légales et rappels</Text>
        <Text>
          Ce document unique est établi en application des articles R. 4121-1
          à R. 4121-4 du Code du travail. L&apos;obligation de mise à jour
          annuelle s&apos;applique aux entreprises d&apos;au moins 11 salariés
          (art. R. 4121-2). En tout état de cause, il doit être :
        </Text>
        <View style={{ marginLeft: 10, marginTop: 6 }}>
          <Text>
            • mis à jour à chaque décision d&apos;aménagement important
            (nouveau poste, nouvel équipement, changement de locaux) ;
          </Text>
          <Text>
            • mis à jour lorsqu&apos;une information supplémentaire sur
            l&apos;évaluation d&apos;un risque est portée à la connaissance de
            l&apos;employeur ;
          </Text>
          <Text>• mis à jour après tout accident du travail ;</Text>
          <Text>
            • conservé pendant 40 ans à compter de son élaboration, ainsi que
            ses versions antérieures (loi du 2 août 2021) ;
          </Text>
          <Text>
            • tenu à disposition des travailleurs, du CSE le cas échéant, du
            médecin du travail, des agents de l&apos;inspection du travail et
            des agents des services de prévention de la Carsat.
          </Text>
        </View>

        {entreprise.effectif >= 50 && (
          <>
            <Text style={[s.small, { marginTop: 10 }]}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>
                Entreprises d&apos;au moins 50 salariés (art. L. 4121-3-1) :
              </Text>{" "}
              le DUERP sert de base à l&apos;élaboration du programme annuel
              de prévention des risques professionnels et d&apos;amélioration
              des conditions de travail (PAPRIPACT), qui fixe la liste
              détaillée des mesures à prendre durant l&apos;année à venir
              avec, pour chacune, les conditions d&apos;exécution, les
              indicateurs de résultats et l&apos;estimation du coût.
            </Text>
          </>
        )}

        <Text style={[s.small, { marginTop: 10 }]}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Annexes éventuellement obligatoires :
          </Text>{" "}
          données collectives utiles à l&apos;évaluation des expositions aux
          facteurs de risques professionnels (pénibilité / compte professionnel
          de prévention) ; proportion de salariés exposés au-delà des seuils
          réglementaires. Ces annexes sont à joindre séparément lorsque
          l&apos;activité le justifie.
        </Text>

        <Text style={[s.small, { marginTop: 16 }]}>
          Ce document a été rédigé avec l&apos;aide d&apos;un outil de
          structuration s&apos;appuyant sur les publications INRS et OiRA
          référencées en méthodologie. Il ne constitue pas un conseil
          juridique et ne se substitue pas à l&apos;intervention d&apos;un
          service de prévention et de santé au travail. La responsabilité de
          l&apos;évaluation des risques, des mesures prises et de leur mise
          en œuvre reste intégralement celle de l&apos;employeur.
        </Text>
        <Text style={s.footer} fixed>
          {entreprise.raisonSociale} — DUERP v{version}
        </Text>
      </Page>
    </Document>
  );
}
