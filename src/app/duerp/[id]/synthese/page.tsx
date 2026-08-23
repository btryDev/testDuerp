import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { CreerVersionForm } from "@/components/duerps/CreerVersionForm";
import { WizardSteps } from "@/components/duerps/WizardSteps";
import {
  activitesDuSecteur,
  lireReponsesActivites,
} from "@/lib/activites/reponses";
import { evaluerCouverture } from "@/lib/duerps/couverture";
import { construireEtapes } from "@/lib/duerps/etapes";
import { getDuerp } from "@/lib/duerps/queries";
import { construireSynthese } from "@/lib/duerps/synthese";
import { LABEL_TYPE_MESURE } from "@/lib/mesures/labels";
import {
  formaterDateCourteFr,
  formaterDateFr,
  formaterDateLongueFr,
  joursCivilsEntre,
} from "@/lib/dates";
import { evaluerEtatDuerp } from "@/lib/dashboard/duerp";
import { listerVersions } from "@/lib/versions/queries";
import type { TypeMesure } from "@/lib/referentiels/types";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return formaterDateCourteFr(d);
}

function classeCriticite(c: number) {
  if (c >= 12)
    return "bg-minium/15 text-minium border-minium/40";
  if (c >= 6)
    return "bg-seal/15 text-seal border-seal/40";
  if (c >= 3)
    return "bg-yellow-400/10 text-yellow-800 border-yellow-600/30 dark:text-yellow-300";
  return "bg-emerald-500/10 text-emerald-800 border-emerald-600/30 dark:text-emerald-300";
}

export default async function SynthesePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();

  const unitesVisibles = duerp.unites.filter((u) => !u.estTransverse);
  const unitesOk = unitesVisibles.length > 0;
  const risquesOk =
    unitesOk && unitesVisibles.every((u) => u.risques.length > 0);
  const etapes = construireEtapes(id, "synthese", {
    secteurOk: Boolean(duerp.referentielSecteurId),
    unitesOk,
    risquesOk,
    transversesOk: duerp.transversesRepondues,
    activitesPosees: activitesDuSecteur(duerp.referentielSecteurId).length > 0,
  });

  const synthese = construireSynthese(duerp.unites);
  const versions = await listerVersions(id);

  // Périmètre du référentiel (ADR-020) : ce qui va être gravé se relit ici,
  // juste avant de figer une version — c'est le dernier écran où une réponse
  // peut encore être corrigée avant de partir dans un document conservé
  // quarante ans. Descriptif, sans verdict : ce n'est pas une alerte, et ça
  // ne rejoint donc pas « Points à vérifier ».
  // Le tri « déclarée / écartée / sans réponse » vient de `evaluerCouverture`,
  // seule autorité sur la question — l'écran ne le refait pas dans son coin.
  // Les unités hors référentiel qu'il rend aussi ne sont pas reprises ici :
  // elles se disent déjà à l'étape « Risques », et les additionner aux
  // activités mesurerait ce qui ne se mesure pas.
  const couverture = evaluerCouverture({
    secteurId: duerp.referentielSecteurId ?? "",
    reponses: lireReponsesActivites(duerp.reponsesActivitesNonCouvertes),
    unites: duerp.unites,
  });
  const perimetreDeclare = couverture.activitesDeclarees;
  const perimetreSansReponse = couverture.activitesSansReponse;
  // `listeInstruite` dit exactement ce que l'écran a besoin de savoir pour
  // décider d'ouvrir la section : le secteur porte-t-il des questions ? La
  // recalculer ici ferait un second juge sur la même question.
  const perimetreQuestionne = couverture.listeInstruite;

  // Rappel de mise à jour annuelle — art. R. 4121-2 : obligatoire pour les
  // entreprises de 11 salariés et plus. On signale aussi le cas où aucune
  // version n'a jamais été validée (DUERP en cours de constitution).
  const derniereVersion = versions[0];
  // Page serveur : un rendu par requête, l'horloge peut être lue — une
  // seule fois, pour que l'ancienneté affichée et le verdict d'échéance
  // reposent sur le même instant.
  const aujourdhui = new Date();
  // Ancienneté en **jours civils** : la division de l'écart en
  // millisecondes par 86 400 000 perdait un jour à chaque passage à
  // l'heure d'hiver traversé.
  const joursDepuisDerniereVersion = derniereVersion
    ? joursCivilsEntre(derniereVersion.createdAt, aujourdhui)
    : null;
  // La règle de mise à jour annuelle (seuil d'effectif de l'art. R. 4121-2,
  // distinction « jamais validé » / « échéance dépassée », arithmétique en
  // années calendaires) vit dans `evaluerEtatDuerp` et NULLE PART AILLEURS.
  // Cette page la réécrivait en local avec un seuil d'effectif en dur : le
  // tableau de bord et le dossier DUERP se contredisaient sur le même
  // établissement, chacun appliquant sa propre variante.
  const etatDuerp = evaluerEtatDuerp(
    {
      ouvert: true,
      dateDerniereVersion: derniereVersion?.createdAt ?? null,
      effectif: duerp.entreprise.effectif,
    },
    aujourdhui,
  );
  const { majEchue, jamaisValide } = etatDuerp;

  return (
    <div className="space-y-14">
      <WizardSteps etapes={etapes} />

      {(majEchue || jamaisValide) && (
        <section
          role="alert"
          className="rounded-[calc(var(--radius)*1.4)] border border-dashed border-[color:var(--minium)]/50 bg-[color:var(--minium)]/8 px-6 py-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[color:var(--minium)]">
              Mise à jour requise · art. R. 4121-2
            </p>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[color:var(--minium)]/80">
              Effectif {duerp.entreprise.effectif} salarié
              {duerp.entreprise.effectif > 1 ? "s" : ""}
            </p>
          </div>
          <p className="mt-2 text-[0.9rem] leading-[1.6] text-ink">
            {jamaisValide ? (
              <>
                Aucune version n&apos;a encore été validée pour ce DUERP.
                L&apos;art. R. 4121-2 impose une mise à jour annuelle pour
                les entreprises d&apos;au moins 11 salariés — validez une
                première version dès que l&apos;évaluation est complète.
              </>
            ) : (
              <>
                La dernière version date de{" "}
                <span className="font-semibold">
                  {joursDepuisDerniereVersion} jours
                </span>
                . La mise à jour annuelle est obligatoire pour les entreprises
                d&apos;au moins 11 salariés (art. R. 4121-2). Créez une
                nouvelle version pour figer l&apos;état à jour.
              </>
            )}
          </p>
        </section>
      )}

      {/* Couverture du dossier */}
      <section className="cartouche relative px-8 py-10">
        <div className="absolute -top-3 left-8 bg-paper px-3">
          <span className="label-admin">§ IV · Synthèse générale</span>
        </div>
        <div className="grid items-start gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="label-admin">Dossier DUERP</p>
            <h2 className="display-xl mt-2 text-5xl">
              Synthèse <span className="display-italic">générale</span>
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Vue d&apos;ensemble de votre évaluation et plan d&apos;actions
              priorisé. Chaque validation fige un exemplaire consultable et
              téléchargeable.
            </p>
          </div>
          <div className="sceau shrink-0">
            ÉVAL.<br />DES RISQUES
          </div>
        </div>

        <div className="filet mt-10 grid grid-cols-2 divide-x divide-rule sm:grid-cols-4">
          <Stat libelle="Unités" valeur={synthese.nbUnites} />
          <Stat libelle="Risques" valeur={synthese.nbRisques} />
          <Stat
            libelle="Mesures en place"
            valeur={synthese.nbMesuresExistantes}
          />
          <Stat
            libelle="Actions prévues"
            valeur={synthese.nbMesuresPrevues}
          />
        </div>
      </section>

      {(synthese.nbRisquesNonCotes > 0 ||
        synthese.nbAlertesSousCotation > 0 ||
        synthese.nbAlertesHierarchie > 0) && (
        <section>
          <p className="label-admin">§ Points à vérifier</p>
          <ul className="filet mt-2 space-y-0 border-b border-rule">
            {synthese.nbRisquesNonCotes > 0 && (
              <AlerteItem
                intitule={`${synthese.nbRisquesNonCotes} risque${
                  synthese.nbRisquesNonCotes > 1 ? "s" : ""
                } non coté${synthese.nbRisquesNonCotes > 1 ? "s" : ""}`}
                detail="Terminez la cotation avant de figer une version."
                ton="neutre"
              />
            )}
            {synthese.nbAlertesSousCotation > 0 && (
              <AlerteItem
                intitule={`${synthese.nbAlertesSousCotation} risque${
                  synthese.nbAlertesSousCotation > 1 ? "s" : ""
                } avec une gravité ou une probabilité en dessous du repère par défaut`}
                detail="Repère indicatif (sans valeur réglementaire) — à vérifier ou justifier si votre situation le permet."
                ton="alerte"
              />
            )}
            {synthese.nbAlertesHierarchie > 0 && (
              <AlerteItem
                intitule={`${synthese.nbAlertesHierarchie} risque${
                  synthese.nbAlertesHierarchie > 1 ? "s" : ""
                } traité${synthese.nbAlertesHierarchie > 1 ? "s" : ""} uniquement par EPI / formation`}
                detail="L'art. L. 4121-2 impose de prioriser les mesures collectives et de réduction à la source."
                ton="alerte"
              />
            )}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="label-admin">§ Inventaire priorisé</p>
            <h3 className="display-lg mt-1 text-2xl">
              Risques classés par criticité
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Tri : criticité décroissante · gravité en départage
          </p>
        </div>

        {synthese.lignes.length === 0 ? (
          <p className="cartouche mt-6 p-6 text-sm text-muted-foreground">
            Aucun risque n&apos;a encore été ajouté.
          </p>
        ) : (
          <div className="filet mt-4 cartouche overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-paper-sunk/60">
                <tr className="border-b border-rule text-left">
                  <th className="label-admin p-3 !text-[0.625rem]">Criticité</th>
                  <th className="label-admin p-3 !text-[0.625rem]">Risque</th>
                  <th className="label-admin p-3 !text-[0.625rem]">Unité</th>
                  <th className="label-admin p-3 !text-[0.625rem] font-mono">
                    G × P / M
                  </th>
                  <th className="label-admin p-3 !text-[0.625rem]">Mesures</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {synthese.lignes.map((l) => (
                  <tr
                    key={l.risqueId}
                    className="border-b border-rule/70 last:border-b-0"
                  >
                    <td className="p-3">
                      <span
                        className={`inline-flex min-w-14 items-center justify-center rounded-sm border px-2 py-0.5 font-mono text-xs font-semibold ${classeCriticite(
                          l.criticite,
                        )}`}
                      >
                        {l.cotationSaisie ? `${l.criticite}/16` : "n.c."}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{l.libelle}</p>
                      {(l.alerteSousCotation || l.alerteHierarchieBasse) && (
                        <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-minium">
                          {l.alerteSousCotation && "⚑ Sous-cotation"}
                          {l.alerteSousCotation && l.alerteHierarchieBasse && " · "}
                          {l.alerteHierarchieBasse && "⚑ EPI seuls"}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {l.uniteNom}
                      {l.estTransverse && (
                        <span className="ml-1 italic text-seal">(transv.)</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {l.gravite} × {l.probabilite} / {l.maitrise}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {l.nombreMesures}
                      {l.nombreMesuresPrevues > 0 && (
                        <span className="text-xs">
                          {" "}
                          ({l.nombreMesuresPrevues} prév.)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/duerp/${id}/risques/${l.uniteId}/${l.risqueId}`}
                        className="text-sm italic text-primary hover:underline"
                      >
                        ouvrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="label-admin">§ Plan d&apos;actions</p>
            <h3 className="display-lg mt-1 text-2xl">
              Mesures à mettre en œuvre
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Tri : échéance croissante · criticité en départage
          </p>
        </div>
        {synthese.actionsPrevues.length === 0 ? (
          <p className="cartouche mt-6 p-6 text-sm text-muted-foreground">
            Aucune action planifiée pour le moment. Ajoutez des mesures
            « prévues » sur vos risques.
          </p>
        ) : (
          <div className="filet mt-4 cartouche overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-paper-sunk/60">
                <tr className="border-b border-rule text-left">
                  <th className="label-admin p-3 !text-[0.625rem]">Échéance</th>
                  <th className="label-admin p-3 !text-[0.625rem]">Action</th>
                  <th className="label-admin p-3 !text-[0.625rem]">Type</th>
                  <th className="label-admin p-3 !text-[0.625rem]">
                    Risque · Unité
                  </th>
                  <th className="label-admin p-3 !text-[0.625rem]">
                    Responsable
                  </th>
                </tr>
              </thead>
              <tbody>
                {synthese.actionsPrevues.map((a) => (
                  <tr
                    key={a.mesureId}
                    className="border-b border-rule/70 last:border-b-0"
                  >
                    <td className="p-3 font-mono text-xs">
                      {formatDate(a.echeance)}
                    </td>
                    <td className="p-3">{a.libelleMesure}</td>
                    <td className="p-3 text-muted-foreground">
                      {LABEL_TYPE_MESURE[a.type as TypeMesure] ?? a.type}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <p>{a.libelleRisque}</p>
                      <p className="text-xs">{a.uniteNom}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {a.responsable ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {perimetreQuestionne && (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="label-admin">§ Périmètre du référentiel</p>
              <h3 className="display-lg mt-1 text-2xl">
                Ce que le document ne traite pas
              </h3>
            </div>
            <Link
              href={`/duerp/${id}/activites`}
              className="text-sm italic text-primary hover:underline"
            >
              revoir les réponses →
            </Link>
          </div>
          <div className="cartouche mt-4 p-6">
            {perimetreDeclare.length === 0 ? (
              // Deux dossiers sans activité déclarée ne disent pas la même
              // chose : celui qui a répondu « non » partout a tranché, celui
              // qui n'a rien répondu n'a rien tranché. Une seule phrase pour
              // les deux se lisait comme un feu vert juste avant de valider —
              // c'est le défaut déjà corrigé côté document
              // (`mentionSansReponseIsolee`), qui n'avait pas été transposé à
              // l'écran.
              couverture.etat === "aucun_manque_identifie" ? (
                <p className="text-sm text-muted-foreground">
                  Vous avez répondu «&nbsp;non&nbsp;» à{" "}
                  {couverture.activitesEcartees.length > 1
                    ? `chacune des ${couverture.activitesEcartees.length} questions`
                    : "la question"}{" "}
                  de périmètre. Aucune activité hors référentiel n&apos;a été
                  déclarée.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune activité hors référentiel n&apos;a été déclarée, et{" "}
                  {perimetreSansReponse.length > 1
                    ? `${perimetreSansReponse.length} questions de périmètre n'ont pas été tranchées`
                    : "une question de périmètre n'a pas été tranchée"}
                  . Une question sans réponse n&apos;est pas un
                  «&nbsp;non&nbsp;».
                </p>
              )
            ) : (
              <>
                <p className="max-w-2xl text-[0.9rem] leading-relaxed text-ink">
                  Vous avez déclaré exercer {perimetreDeclare.length} activité
                  {perimetreDeclare.length > 1 ? "s" : ""} que le référentiel
                  sectoriel ne couvre pas. Le DUERP généré les nomme et précise
                  ce qu&apos;il ne traite pas à leur sujet.
                </p>
                <ul className="filet mt-4 space-y-0">
                  {perimetreDeclare.map((a) => (
                    <li key={a.id} className="border-t border-rule py-3">
                      <p className="font-medium">{a.libelle}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {a.cequiManque}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {perimetreSansReponse.length > 0 && perimetreDeclare.length > 0 && (
              <p className="mt-4 text-[0.82rem] leading-relaxed text-muted-foreground">
                {perimetreSansReponse.length} question
                {perimetreSansReponse.length > 1 ? "s" : ""} sur le périmètre
                {perimetreSansReponse.length > 1 ? " restent" : " reste"} sans
                réponse. Une version validée maintenant l&apos;indiquera comme
                telle&nbsp;: elle n&apos;affirmera ni que ces activités sont
                exercées, ni qu&apos;elles ne le sont pas.
              </p>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="label-admin">§ Versions figées</p>
            <h3 className="display-lg mt-1 text-2xl">Historique du dossier</h3>
          </div>
          <a
            href={`/duerp/${id}/pdf/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Aperçu PDF brouillon ↗
          </a>
        </div>
        <p className="mt-2 max-w-2xl text-[0.82rem] leading-relaxed text-muted-foreground">
          L&apos;aperçu télécharge un PDF estampillé{" "}
          <span className="font-semibold">« Document non validé »</span> sur
          chaque page, sans créer de version. Pour un PDF officiel consultable
          et archivé, validez une version ci-dessous.
        </p>
        {versions.length === 0 ? (
          <p className="cartouche mt-4 p-6 text-sm text-muted-foreground">
            Aucune version validée pour l&apos;instant. L&apos;aperçu
            ci-dessus vous permet toutefois de vérifier le rendu avant de
            figer une version.
          </p>
        ) : (
          <ul className="filet mt-4 cartouche divide-y divide-rule">
            {versions.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-baseline gap-4">
                  <span className="numero-section text-2xl">
                    v{v.numero}
                  </span>
                  <div>
                    <p className="text-sm">
                      {formaterDateLongueFr(v.createdAt)}
                    </p>
                    {v.motif && (
                      <p className="text-sm italic text-muted-foreground">
                        « {v.motif} »
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`/duerp/${id}/versions/${v.numero}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Télécharger le PDF
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <CreerVersionForm
            duerpId={id}
            aucunRisqueNonCote={synthese.nbRisquesNonCotes === 0}
          />
        </div>
      </section>

      <div className="filet flex items-center justify-between pt-6">
        <Link
          href={`/duerp/${id}/transverses`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Étape précédente
        </Link>
        <p className="text-xs italic text-muted-foreground">
          Fait à {formaterDateFr(aujourdhui)}
        </p>
      </div>
    </div>
  );
}

function Stat({ libelle, valeur }: { libelle: string; valeur: number }) {
  return (
    <div className="px-4 py-5">
      <p className="label-admin">{libelle}</p>
      <p className="mt-1 [font-family:var(--font-mono)] text-4xl tabular-nums tracking-[-0.03em]">{valeur}</p>
    </div>
  );
}

function AlerteItem({
  intitule,
  detail,
  ton,
}: {
  intitule: string;
  detail: string;
  ton: "alerte" | "neutre";
}) {
  return (
    <li
      className={`flex items-start gap-4 border-t border-rule py-3 ${
        ton === "alerte" ? "text-minium" : ""
      }`}
    >
      <span
        aria-hidden
        className={`mt-1 font-mono text-xs ${
          ton === "alerte" ? "text-minium" : "text-muted-foreground"
        }`}
      >
        {ton === "alerte" ? "⚑" : "·"}
      </span>
      <div className="flex-1">
        <p className="font-medium">{intitule}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}
