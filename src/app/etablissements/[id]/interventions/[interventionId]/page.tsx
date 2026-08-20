import { notFound } from "next/navigation";
import { lireProvenance } from "@/lib/navigation/provenance";
import {
  CarteFiche,
  CorpsFiche,
  EcranFiche,
  HeroFiche,
  PastilleRetard,
  TitreSection,
  type FaitFiche,
} from "@/components/ui-kit";
import {
  PastillePriorite,
  PastilleStatutTicket,
} from "@/components/interventions/BadgesBoard";
import { ChangerStatutButtons } from "@/components/interventions/ChangerStatutButtons";
import { CloturerTicketForm } from "@/components/interventions/CloturerTicketForm";
import { CommentaireForm } from "@/components/interventions/CommentaireForm";
import { getIntervention } from "@/lib/interventions/queries";
import { getOptionalUser } from "@/lib/auth/require-user";
import {
  FUSEAU_REFERENCE,
  formaterDateCourteFr,
  formaterDateLongueFr,
} from "@/lib/dates";
import { classerDate, type RegistreLigne } from "@/lib/calendrier/etats";
import { estEnRetard } from "@/lib/dates/retard";

// Format long avec heure, propre à cette page (« 10 août 2026 14:30 ») :
// le fuseau vient de la constante produit, jamais d'un littéral recopié.
const FMT = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_REFERENCE,
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const FMT_HEURE = new Intl.DateTimeFormat("fr-FR", {
  timeZone: FUSEAU_REFERENCE,
  hour: "2-digit",
  minute: "2-digit",
});

function fmtDateHeure(d: Date): string {
  return FMT.format(d);
}

/** « #001 » — la numérotation que porte aussi le tableau des tickets. */
function numeroTicket(n: number): string {
  return `n°${String(n).padStart(3, "0")}`;
}

export default async function InterventionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; interventionId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, interventionId } = await params;
  const { de } = await searchParams;
  const provenance = lireProvenance(de, id);
  const interventions = {
    href: `/etablissements/${id}/interventions`,
    label: "Interventions",
  };

  const [it, user] = await Promise.all([
    getIntervention(id, interventionId),
    getOptionalUser(),
  ]);
  if (!it) notFound();

  // Page serveur : horloge lue une fois par requête.
  const aujourdhui = new Date();
  const clos = it.statut === "fait" || it.statut === "annule";
  // Retard = prédicat partagé (ADR-011). La comparaison brute
  // `echeance < new Date()` colorait en rouge une échéance datée du jour
  // même dès 02:00 heure d'été, en contradiction avec la carte du même
  // ticket sur la page liste.
  const enRetard =
    it.echeance !== null && !clos && estEnRetard(it.echeance, aujourdhui);

  const etat: RegistreLigne = clos
    ? "faite"
    : !it.echeance
      ? "aPlanifier"
      : enRetard
        ? "enRetard"
        : classerDate(it.echeance, aujourdhui);

  const faits: FaitFiche[] = [
    {
      cle: "Échéance",
      valeur: it.echeance ? formaterDateLongueFr(it.echeance) : "Non datée",
      alerte: enRetard,
    },
    {
      cle: "Lieu",
      valeur: it.localisation ?? (
        <span className="font-normal text-[color:var(--board-slate-soft)]">
          Non précisé
        </span>
      ),
    },
    {
      cle: "Assigné à",
      valeur: it.assigneA ?? (
        <span className="font-normal text-[color:var(--board-slate-soft)]">
          Personne
        </span>
      ),
    },
    {
      cle: "Signalé le",
      valeur: formaterDateCourteFr(it.createdAt),
      note: FMT_HEURE.format(it.createdAt),
    },
  ];

  return (
    <EcranFiche provenance={provenance} canonique={interventions}>
      <HeroFiche
        date={it.echeance}
        etat={etat}
        famille="travaux"
        surtitre={`Correction · Signalement ${numeroTicket(it.numero)}`}
        titre={it.titre}
        faits={faits}
        pastilles={
          <>
            <PastilleStatutTicket statut={it.statut} />
            <PastillePriorite priorite={it.priorite} />
            {enRetard && it.echeance ? (
              <PastilleRetard echeance={it.echeance} maintenant={aujourdhui} />
            ) : null}
          </>
        }
      />

      <CorpsFiche
        principal={
          <>
            <CarteFiche titre="Ce qui a été signalé">
              {it.description ? (
                <p className="m-0 whitespace-pre-wrap text-[14.5px] leading-[1.6]">
                  {it.description}
                </p>
              ) : (
                <p className="m-0 text-[14px] text-[color:var(--board-slate-soft)]">
                  Le signalement n&apos;a pas de description.
                </p>
              )}

              {it.photos.length > 0 && (
                <div className="mt-6 border-t border-[color:var(--board-slate-line)] pt-5">
                  <p className="board-eyebrow m-0 mb-3 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                    {it.photos.length} photo{it.photos.length > 1 ? "s" : ""}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {it.photos.map((cle, i) => (
                      <a
                        key={cle}
                        href={`/api/interventions/photos?cle=${encodeURIComponent(cle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-square overflow-hidden rounded-[18px] bg-[color:var(--board-slate-pale)] ring-1 ring-[color:var(--board-slate-line)]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/interventions/photos?cle=${encodeURIComponent(cle)}`}
                          alt={`Photo ${i + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* La boucle vers le DUERP (ADR-009) : ce ticket a été
                  ouvert depuis un risque, et sa clôture peut demander de
                  le réévaluer. */}
              {it.risqueLibelle && (
                <div className="mt-6 border-t border-[color:var(--board-slate-line)] pt-5">
                  <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                    Risque DUERP lié
                  </p>
                  <p className="m-0 mt-1.5 text-[14px] font-semibold leading-[1.35]">
                    {it.risqueLibelle}
                  </p>
                </div>
              )}
            </CarteFiche>

            <TitreSection
              surtitre="Historique"
              titre="Commentaires"
              compte={it.commentaires.length}
            />

            {it.commentaires.length > 0 && (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {it.commentaires.map((c) => (
                  <li key={c.id} className="carte-board px-6 py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="m-0 text-[13.5px] font-semibold">
                        {c.auteurNom}
                      </p>
                      <p className="m-0 font-mono text-[11px] text-[color:var(--board-slate-soft)]">
                        {fmtDateHeure(c.createdAt)}
                      </p>
                    </div>
                    <p className="m-0 mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.6] text-[color:var(--board-slate-ink)]">
                      {c.contenu}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <CarteFiche titre="Ajouter un commentaire">
              <CommentaireForm
                etablissementId={id}
                interventionId={it.id}
                auteurDefaut={user?.email ?? null}
              />
            </CarteFiche>
          </>
        }
        cote={
          <CarteFiche titre="Cycle de vie">
            {clos ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-[18px] bg-[color:var(--board-green)] px-5 py-4">
                  <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-green-ink)]">
                    {it.statut === "fait" ? "Terminé" : "Annulé"}
                  </p>
                  {it.dateCloture && (
                    <p className="m-0 mt-1.5 text-[13px] text-[color:var(--board-green-ink)]">
                      Le {fmtDateHeure(it.dateCloture)}
                    </p>
                  )}
                  {it.motifCloture && (
                    <p className="m-0 mt-2.5 whitespace-pre-wrap text-[13.5px] leading-[1.55] text-[color:var(--board-ink)]">
                      {it.motifCloture}
                    </p>
                  )}
                </div>
                <ChangerStatutButtons
                  etablissementId={id}
                  interventionId={it.id}
                  statut={it.statut}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="m-0 mb-2.5 text-[12.5px] text-[color:var(--board-slate-mid)]">
                    Faire avancer le ticket
                  </p>
                  <ChangerStatutButtons
                    etablissementId={id}
                    interventionId={it.id}
                    statut={it.statut}
                  />
                </div>
                <div className="border-t border-[color:var(--board-slate-line)] pt-5">
                  <CloturerTicketForm
                    etablissementId={id}
                    interventionId={it.id}
                    risqueLieLibelle={it.risqueLibelle}
                  />
                </div>
              </div>
            )}
          </CarteFiche>
        }
      />
    </EcranFiche>
  );
}
