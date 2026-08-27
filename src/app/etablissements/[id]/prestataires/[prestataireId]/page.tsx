import { notFound } from "next/navigation";
import {
  CarteFiche,
  ChampFiche,
  ChampsFiche,
  CorpsFiche,
  EcranFiche,
  LegalBadge,
  PastilleFiche,
} from "@/components/ui-kit";
import { lireProvenance } from "@/lib/navigation/provenance";
import { VigilancePiecePill } from "@/components/prestataires/VigilancePills";
import { SupprimerPrestataireButton } from "@/components/prestataires/SupprimerPrestataireButton";
import { getPrestataire } from "@/lib/prestataires/queries";
import { LABEL_DOMAINE } from "@/lib/prestataires/schema";
import { formaterDateLongueFr } from "@/lib/dates";

/**
 * La fiche d'un prestataire, en charte board (`docs/charte-board.md`).
 *
 * Elle recomposait à la main ce que le kit `ui-kit/fiche/` fait déjà —
 * `cartouche`, `cartouche-sunk`, une `<dl>` maison, une quatrième pastille de
 * Kbis bâtie sur `--accent-vif` et `--paper-sunk`. Elle passe au kit : même
 * vocabulaire que les cinq autres fiches qu'on ouvre depuis le calendrier.
 */
function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return formaterDateLongueFr(d);
}

export default async function PrestataireDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; prestataireId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, prestataireId } = await params;
  const { de } = await searchParams;
  const p = await getPrestataire(id, prestataireId);
  if (!p) notFound();

  // Une fiche prestataire s'ouvre depuis l'annuaire, mais aussi depuis le
  // calendrier — une attestation qui expire y est une échéance.
  const provenance = lireProvenance(de, id);
  const annuaire = {
    href: `/etablissements/${id}/prestataires`,
    label: "Annuaire",
  };

  const nbAlertes = p.vigilance.alertesOuvertes;

  return (
    <EcranFiche provenance={provenance} canonique={annuaire}>
      <CorpsFiche
        principal={
          <>
            <section className="carte-board px-7 py-6 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                    {p.siret ? `SIRET ${p.siret}` : "SIRET non renseigné"}
                  </p>
                  <h1 className="board-titre m-0 mt-2 max-w-[30ch] text-[clamp(23px,2.1vw,30px)]">
                    {p.raisonSociale}
                  </h1>
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {p.estOrganismeAgree && (
                      <PastilleFiche ton="bleu">Organisme agréé</PastilleFiche>
                    )}
                    {/* Le nombre plutôt que le seul mot : l'utilisateur ne
                        devrait pas avoir à compter les pastilles pour savoir
                        combien de pièces lui manquent. */}
                    {nbAlertes > 0 ? (
                      <PastilleFiche ton="retard">
                        {nbAlertes > 1
                          ? `${nbAlertes} pièces à demander`
                          : "1 pièce à demander"}
                      </PastilleFiche>
                    ) : (
                      <PastilleFiche ton="fait">Pièces à jour</PastilleFiche>
                    )}
                    {p.domaines.map((d) => (
                      <PastilleFiche key={d} ton="neutre">
                        {LABEL_DOMAINE[d]}
                      </PastilleFiche>
                    ))}
                  </div>
                </div>
                <SupprimerPrestataireButton
                  etablissementId={id}
                  prestataireId={p.id}
                />
              </div>
            </section>

            <CarteFiche titreFort="Contact">
              <ChampsFiche>
                <ChampFiche cle="Nom">{p.contactNom}</ChampFiche>
                <ChampFiche cle="Email">
                  <a
                    href={`mailto:${p.contactEmail}`}
                    className="font-mono text-[13px] text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
                  >
                    {p.contactEmail}
                  </a>
                </ChampFiche>
                {p.contactTelephone && (
                  <ChampFiche cle="Téléphone">
                    <span className="font-mono text-[13px]">
                      {p.contactTelephone}
                    </span>
                  </ChampFiche>
                )}
                <ChampFiche cle="Ajouté le">
                  {formatDate(p.createdAt)}
                </ChampFiche>
              </ChampsFiche>
            </CarteFiche>

            <CarteFiche titreFort="Obligation de vigilance">
              <div className="flex flex-col gap-2">
                <VigilancePiecePill
                  libelle="Attestation URSSAF"
                  statut={p.vigilance.urssaf}
                  jours={p.vigilance.urssafExpireDans}
                />
                <VigilancePiecePill
                  libelle="RC Pro"
                  statut={p.vigilance.rcPro}
                  jours={p.vigilance.rcProExpireDans}
                />
                {/* Le Kbis n'a pas de statut d'expiration, et c'est délibéré :
                    aucun texte ne lui assortit de périodicité citable. Le
                    produit informe de son âge, il ne décrète pas une échéance
                    (cf. `lib/prestataires/vigilance.ts`). */}
                <span className="flex items-center justify-between gap-3 rounded-[14px] bg-[color:var(--board-slate-pale)] px-3 py-2">
                  <span className="min-w-0">
                    <span className="board-eyebrow block text-[9.5px] tracking-[0.14em] text-[color:var(--board-slate-soft)]">
                      Extrait Kbis
                    </span>
                    {p.kbisDateEmission && (
                      <span className="mt-0.5 block text-[11.5px] leading-[1.4] text-[color:var(--board-slate-mid)]">
                        Émis le {formatDate(p.kbisDateEmission)}
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap text-[11.5px] font-semibold text-[color:var(--board-slate-mid)]">
                    {p.vigilance.kbis === "present" ? "Fourni" : "Non fourni"}
                  </span>
                </span>
              </div>

              <p className="m-0 mt-4 max-w-[64ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                L&apos;attestation de vigilance se redemande tous les six mois
                tant que le contrat court. Le prestataire la génère depuis son
                espace URSSAF ; un courriel suffit à l&apos;obtenir.
              </p>
              <div className="mt-3">
                <LegalBadge
                  charte="board"
                  reference="Art. L. 8222-1 CT"
                  href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389145"
                />
              </div>
            </CarteFiche>

            {p.notesInternes && (
              <CarteFiche titre="Notes internes">
                <p className="m-0 whitespace-pre-wrap text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                  {p.notesInternes}
                </p>
              </CarteFiche>
            )}
          </>
        }
      />
    </EcranFiche>
  );
}
