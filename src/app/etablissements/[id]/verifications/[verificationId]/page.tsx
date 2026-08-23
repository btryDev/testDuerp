import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronDown, FileText } from "lucide-react";
import { BadgeStatut } from "@/components/calendrier/BadgeStatut";
import { BadgeResultat } from "@/components/rapports/BadgeResultat";
import { SupprimerRapportButton } from "@/components/rapports/SupprimerRapportButton";
import { UploadRapportForm } from "@/components/rapports/UploadRapportForm";
import { BadgeStatutAction } from "@/components/actions/BadgeStatutAction";
import { CreerActionVerifForm } from "@/components/actions/CreerActionVerifForm";
import { getVerification } from "@/lib/calendrier/queries";
import {
  JOURS_HORIZON_PROCHE,
  formaterDateCourteFr,
  formaterDateLongueFr,
  joursCivilsEntre,
} from "@/lib/dates";
import {
  estActionEnRetard,
  estVerificationEnRetard,
  joursDeRetard,
} from "@/lib/dates/retard";
import { classerVerification } from "@/lib/calendrier/etats";
import {
  LABEL_DOMAINE,
  LABEL_PERIODICITE,
  LABEL_REALISATEUR,
} from "@/lib/calendrier/labels";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import { obligationParId } from "@/lib/referentiels/conformite";
import { uploadRapport } from "@/lib/rapports/actions";
import { creerActionDepuisVerification } from "@/lib/actions/plan";
import { prisma } from "@/lib/prisma";
import { LABEL_ITEM } from "@/components/layout/sidebar-nav";
import { DemanderSignatureForm } from "@/components/signatures/DemanderSignatureForm";
import {
  CarteFiche,
  CorpsFiche,
  EcranFiche,
  HeroFiche,
  PastilleFiche,
  SignatureBlock,
  TitreSection,
  type FaitFiche,
} from "@/components/ui-kit";
import { avecProvenance, lireProvenance } from "@/lib/navigation/provenance";
import { listSignatures } from "@/lib/signatures/queries";

// Les dates sont formatées et comparées dans le fuseau de référence du
// produit (Europe/Paris, cf. ADR-011), jamais dans celui du serveur :
// `toLocaleDateString` sans `timeZone` rendait la page dépendante de
// l'hôte, et `Math.round((d - now) / 86 400 000)` comptait des tranches
// de 24 h plutôt que des jours civils — l'en-tête annonçait « échéance
// dépassée de 1 j » à partir de 14 h le jour même de l'échéance.
function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return formaterDateLongueFr(d);
}

function formatDateCourte(d: Date | null): string | null {
  if (!d) return null;
  return formaterDateCourteFr(d);
}

export default async function VerificationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; verificationId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, verificationId } = await params;
  const { de } = await searchParams;
  const v = await getVerification(verificationId);
  if (!v || v.etablissementId !== id) notFound();

  // Une vérification s'ouvre depuis le calendrier, mais aussi depuis le
  // registre de sécurité, une action corrective ou le tableau de bord.
  const provenance = lireProvenance(de, id);
  // Nommé par la table de la sidebar plutôt qu'en dur : le rail et le fil
  // de retour disent le même mot, par construction.
  const calendrier = {
    href: `/etablissements/${id}/calendrier`,
    label: LABEL_ITEM.calendrier,
  };
  const depuisCetteFiche = `/etablissements/${id}/verifications/${verificationId}`;

  const obligation = obligationParId(v.obligationId);
  const actionsLiees = await prisma.action.findMany({
    where: { verificationId: v.id },
    orderBy: [{ statut: "asc" }, { echeance: "asc" }],
  });
  const boundCreerAction = creerActionDepuisVerification.bind(null, v.id);
  const boundUpload = uploadRapport.bind(null, v.id);

  // Signatures posées sur chaque rapport de cette vérification.
  const signaturesParRapport = new Map<
    string,
    Awaited<ReturnType<typeof listSignatures>>
  >();
  for (const r of v.rapports) {
    signaturesParRapport.set(
      r.id,
      await listSignatures("rapport_verification", r.id),
    );
  }

  // Horloge lue une fois pour toute la page : deux appels à `new Date()`
  // séparés par un await peuvent tomber de part et d'autre de minuit.
  const aujourdhui = new Date();
  const joursRestants = joursCivilsEntre(aujourdhui, v.datePrevue);
  const enRetard = estVerificationEnRetard(v, aujourdhui);
  const urgent =
    !enRetard &&
    !v.dateRealisee &&
    joursRestants >= 0 &&
    joursRestants <= JOURS_HORIZON_PROCHE;
  const aUnRapport = v.rapports.length > 0;
  const etat = classerVerification(v, aujourdhui);

  const faits: FaitFiche[] = [
    {
      cle: "Prochaine échéance",
      valeur: formatDateCourte(v.datePrevue),
      note: v.dateRealisee
        ? `Dernière : ${formatDateCourte(v.dateRealisee)}`
        : undefined,
      alerte: enRetard,
    },
    {
      cle: "Équipement",
      valeur: v.equipement.libelle,
      note:
        LABEL_CATEGORIE_EQUIPEMENT[v.equipement.categorie] +
        (v.equipement.localisation ? ` · ${v.equipement.localisation}` : ""),
    },
    {
      cle: "Réalisateur requis",
      valeur: v.realisateurRequis
        .map((r) => LABEL_REALISATEUR[r])
        .join(", "),
    },
  ];

  return (
    <EcranFiche provenance={provenance} canonique={calendrier}>
      <HeroFiche
        date={v.datePrevue}
        etat={etat}
        famille="controle"
        surtitre={
          <>
            {obligation ? LABEL_DOMAINE[obligation.domaine] : "Vérification"}
            <span aria-hidden className="text-[color:var(--board-slate)]">
              ·
            </span>
            {LABEL_PERIODICITE[v.periodicite]}
          </>
        }
        titre={v.libelleObligation}
        chapeau={obligation?.description}
        faits={faits}
        pastilles={
          <>
            {/* Le statut « dépassée » se lit déjà « En retard » : deux
                pastilles rose côte à côte disaient la même chose. Le
                compte de jours la remplace alors, plutôt que de s'y
                ajouter — un retard d'un jour et un retard de six mois
                n'appellent pas le même geste. */}
            {v.statut === "depassee" ? null : (
              <BadgeStatut statut={v.statut} />
            )}
            {enRetard ? (
              <PastilleFiche ton="retard">
                {`En retard de ${joursDeRetard(v.datePrevue, aujourdhui)} jours`}
              </PastilleFiche>
            ) : urgent ? (
              <PastilleFiche ton="proche">
                {joursRestants === 0
                  ? "Échéance aujourd'hui"
                  : `Dans ${joursRestants} jours`}
              </PastilleFiche>
            ) : null}
          </>
        }
        actions={
          <Link
            href={`/etablissements/${id}/equipements/${v.equipement.id}/modifier`}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
          >
            Modifier l&apos;équipement
            <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      {/* Ce qui fonde l'obligation — replié : on le consulte une fois, on
          ne le relit pas à chaque visite. */}
      {obligation && obligation.referencesLegales.length > 0 ? (
        <details className="carte-board group overflow-hidden">
          <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-7 py-5 sm:px-8">
            <span className="board-eyebrow text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
              Ce qui fonde cette obligation
            </span>
            <span className="flex items-center gap-3">
              <span className="pastille-board bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-mid)]">
                {obligation.referencesLegales.length} référence
                {obligation.referencesLegales.length > 1 ? "s" : ""}
              </span>
              <span
                aria-hidden
                className="grid size-8 flex-none place-items-center rounded-full ring-1 ring-[color:rgba(10,10,10,.16)] transition-transform group-open:rotate-180"
              >
                <ChevronDown className="size-4" />
              </span>
            </span>
          </summary>
          <ul className="m-0 list-none border-t border-[color:var(--board-slate-line)] p-0">
            {obligation.referencesLegales.map((ref, idx) => (
              <li
                key={idx}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--board-slate-line)] px-7 py-4 first:border-t-0 sm:px-8"
              >
                <span className="min-w-0">
                  <span className="board-eyebrow text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                    {ref.source}
                  </span>
                  <span className="ml-3 text-[13.5px]">{ref.reference}</span>
                </span>
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
                  >
                    Consulter
                    <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {/* ── Le dossier : les rapports déposés ─────────────────────── */}
      {aUnRapport ? (
        <>
          <TitreSection
            surtitre="Dossier"
            titre="Rapports déposés"
            compte={v.rapports.length}
            droite={
              <details className="group">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-[18px] py-2.5 text-[12.5px] font-semibold text-[color:var(--board-ink)] ring-1 ring-[color:rgba(10,10,10,.18)] transition-colors hover:bg-[color:var(--board-slate-pale)]">
                  <span className="group-open:hidden">+ Nouveau rapport</span>
                  <span className="hidden group-open:inline">Annuler</span>
                </summary>
                <div className="carte-board mt-4 overflow-hidden md:min-w-[520px]">
                  <div className="border-b border-[color:var(--board-slate-line)] px-7 py-5">
                    <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                      Nouveau rapport
                    </p>
                    <p className="m-0 mt-2 text-[13px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                      Un rapport additionnel met à jour la date de réalisation
                      et régénère la prochaine échéance.
                    </p>
                  </div>
                  <div className="px-7 py-6">
                    <UploadRapportForm action={boundUpload} />
                  </div>
                </div>
              </details>
            }
          />

          <ul className="m-0 flex list-none flex-col gap-[22px] p-0">
            {v.rapports.map((r, idx) => {
              const sigs = signaturesParRapport.get(r.id) ?? [];
              return (
                <li key={r.id}>
                  <article className="carte-board overflow-hidden">
                    <div className="flex flex-wrap items-start justify-between gap-4 px-7 pb-5 pt-6 sm:px-8">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <span
                          aria-hidden
                          className="board-titre mt-0.5 flex-none text-[26px] leading-none tabular-nums text-[color:var(--board-slate)]"
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 text-[16px] font-semibold leading-tight tracking-[-0.015em]">
                            Rapport du {formatDate(r.dateRapport)}
                          </p>
                          {r.organismeVerif && (
                            <p className="m-0 mt-1 text-[13px] text-[color:var(--board-slate-mid)]">
                              par {r.organismeVerif}
                            </p>
                          )}
                        </div>
                      </div>
                      <BadgeResultat resultat={r.resultat} />
                    </div>

                    <div className="border-t border-[color:var(--board-slate-line)] px-7 py-5 sm:px-8">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="grid size-9 flex-none place-items-center rounded-[13px] bg-[color:var(--board-slate-pale)] text-[color:var(--board-slate-soft)]"
                        >
                          <FileText className="size-[17px]" />
                        </span>
                        <span className="truncate font-mono text-[12.5px] text-[color:var(--board-ink)]">
                          {r.fichierNomOriginal}
                        </span>
                      </div>
                      {r.commentaires && (
                        <p className="m-0 mt-4 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
                          <span className="board-eyebrow mr-2 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                            Observations
                          </span>
                          {r.commentaires}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--board-slate-line)] px-7 py-4 sm:px-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`/api/rapports/${r.id}/fichier`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold text-[color:var(--board-ink)] ring-1 ring-[color:rgba(10,10,10,.18)] transition-colors hover:bg-[color:var(--board-slate-pale)]"
                        >
                          Ouvrir le fichier
                          <ArrowUpRight className="size-3.5" />
                        </a>
                        <DemanderSignatureForm
                          etablissementId={id}
                          objetType="rapport_verification"
                          objetId={r.id}
                          libelleDocument={`${v.libelleObligation} — rapport du ${formatDate(r.dateRapport)}`}
                        />
                      </div>
                      <SupprimerRapportButton id={r.id} />
                    </div>

                    {sigs.length > 0 && (
                      <div className="space-y-3 border-t border-[color:var(--board-slate-line)] bg-[color:var(--board-slate-pale)] px-7 py-5 sm:px-8">
                        <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-green-ink)]">
                          {sigs.length}{" "}
                          {sigs.length > 1 ? "signatures" : "signature"}
                        </p>
                        <div className="space-y-3">
                          {sigs.map((s) => (
                            <SignatureBlock
                              key={s.id}
                              signataireNom={s.signataireNom}
                              signataireRole={s.signataireRole}
                              signataireEmail={s.signataireEmail}
                              horodatageIso={s.horodatageIso}
                              methode={s.methode}
                              hashDocument={s.hashDocument}
                              nomDocument={s.nomDocument}
                              signatureId={s.id}
                              verifierHref={`/verifier/${s.id}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        /* Aucun rapport : la fiche dit ce qu'elle attend, et le demande
           dans le même objet — pas un état vide puis un formulaire. */
        <CorpsFiche
          principal={
            <CarteFiche titre="Déposer le rapport">
              <UploadRapportForm
                action={boundUpload}
                labelAnnuler={{
                  libelle: "Annuler",
                  href: `/etablissements/${id}/calendrier`,
                }}
              />
            </CarteFiche>
          }
          cote={
            <section className="carte-board overflow-hidden bg-[color:var(--board-blue-pale)] px-7 py-7 sm:px-8">
              <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-blue-ink)]">
                En attente
              </p>
              <h2 className="board-titre m-0 mt-3 text-[22px]">
                Cette vérification attend son rapport.
              </h2>
              <p className="m-0 mt-3 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
                Dès que vous téléversez le rapport du vérificateur, la
                vérification est marquée comme réalisée et la prochaine
                échéance est recalculée automatiquement.
              </p>
              <ul className="m-0 mt-5 flex list-none flex-col gap-2 p-0 text-[13px] text-[color:var(--board-slate-ink)]">
                {[
                  "Le fichier du rapport (PDF de préférence)",
                  "La date de réalisation",
                  "Le résultat constaté",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[7px] inline-block h-[3px] w-3 flex-none rounded-full bg-[color:var(--board-blue-strong)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="board-eyebrow m-0 mt-6 text-[10px] tracking-[0.16em] text-[color:var(--board-blue-ink)]">
                {obligation?.referencesLegales[0]?.reference ??
                  "Obligation réglementaire"}
              </p>
            </section>
          }
        />
      )}

      {/* ── Les écarts à lever ────────────────────────────────────── */}
      <TitreSection
        surtitre="Levées d'écart"
        titre="Actions correctives"
        compte={actionsLiees.length}
        droite={
          actionsLiees.length > 0 ? (
            <details className="group">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-[18px] py-2.5 text-[12.5px] font-semibold text-[color:var(--board-ink)] ring-1 ring-[color:rgba(10,10,10,.18)] transition-colors hover:bg-[color:var(--board-slate-pale)]">
                <span className="group-open:hidden">+ Créer une action</span>
                <span className="hidden group-open:inline">Annuler</span>
              </summary>
              <div className="carte-board mt-4 px-7 py-6 md:min-w-[520px]">
                <CreerActionVerifForm action={boundCreerAction} />
              </div>
            </details>
          ) : undefined
        }
      />

      {actionsLiees.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {actionsLiees.map((a) => {
            // Même prédicat que le plan d'actions : une action dont
            // l'échéance tombe aujourd'hui n'est pas en retard, et une
            // action abandonnée ne l'est jamais non plus.
            const enRetardAction = estActionEnRetard(a, aujourdhui);
            return (
              <li key={a.id}>
                <Link
                  href={avecProvenance(
                    `/etablissements/${id}/actions/${a.id}`,
                    depuisCetteFiche,
                  )}
                  className="carte-board block h-full px-6 py-5 transition-colors hover:bg-[color:var(--board-slate-pale)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 text-[14.5px] font-semibold leading-[1.35]">
                      {a.libelle}
                    </p>
                    <BadgeStatutAction statut={a.statut} />
                  </div>
                  <p
                    className="m-0 mt-3 text-[12.5px]"
                    style={{
                      color: enRetardAction
                        ? "var(--board-signal-ink)"
                        : "var(--board-slate-mid)",
                    }}
                  >
                    {a.echeance
                      ? `Échéance ${formatDateCourte(a.echeance)}`
                      : "Pas d'échéance"}
                    {a.responsable ? ` · ${a.responsable}` : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[22px] bg-[color:var(--board-slate-pale)] px-6 py-5">
            <div>
              <p className="m-0 text-[14.5px] font-semibold">
                Aucun écart à lever pour l&apos;instant.
              </p>
              <p className="m-0 mt-1 text-[13px] text-[color:var(--board-slate-mid)]">
                Créez une action corrective si le rapport mentionne une
                observation à traiter.
              </p>
            </div>
            <span className="inline-flex flex-none items-center gap-2 rounded-full bg-[color:var(--board-ink)] px-[18px] py-2.5 text-[12.5px] font-semibold text-white">
              <span className="group-open:hidden">+ Créer</span>
              <span className="hidden group-open:inline">Annuler</span>
            </span>
          </summary>
          <div className="carte-board mt-4 px-7 py-6">
            <CreerActionVerifForm action={boundCreerAction} />
          </div>
        </details>
      )}
    </EcranFiche>
  );
}
