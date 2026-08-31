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
import {
  BasculerEffectif,
  RetirerTitreButton,
} from "@/components/salaries/ActionsSalarie";
import { FormulaireTitre } from "@/components/salaries/FormulaireTitre";
import { lireProvenance } from "@/lib/navigation/provenance";
import { requireEtablissement } from "@/lib/auth/scope";
import { getSalarie } from "@/lib/salaries/queries";
import { cataloguerTitres } from "@/lib/salaries/catalogue";
import { declarerTitre } from "@/lib/salaries/actions";
import { CHAMP_ETAT, ENCRE_ETAT, type RegistreLigne } from "@/lib/calendrier/etats";
import { formaterDateLongueFr } from "@/lib/dates";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

/**
 * La fiche d'une personne : ce qu'elle détient, et jusqu'à quand.
 *
 * Elle se monte avec le kit `ui-kit/fiche/`, comme les six autres fiches du
 * produit — c'est le même geste pour l'utilisateur, qu'il ouvre un équipement,
 * une vérification ou une personne.
 */
const MOT_DE_L_ETAT: Record<RegistreLigne, string> = {
  faite: "À jour",
  lointain: "À jour",
  proche: "Expire bientôt",
  enRetard: "Expiré",
  // Pas « en retard » : un titre sans terme écrit n'a pas de rendez-vous
  // manqué. Le Code renvoie ici à des modalités qu'il qualifie lui-même de
  // recommandées (ADR-023 § 6) — décréter une échéance serait inventer une
  // non-conformité.
  aPlanifier: "Sans terme écrit",
};

export default async function SalarieDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; salarieId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, salarieId } = await params;
  const { de } = await searchParams;
  await requireEtablissement(id);

  const now = new Date();
  const s = await getSalarie(id, salarieId, now);
  if (!s) notFound();

  const catalogue = cataloguerTitres();
  const action = declarerTitre.bind(null, id, salarieId);
  const provenance = lireProvenance(de, id);
  const annuaire = { href: `/etablissements/${id}/equipe`, label: "Équipe" };

  return (
    <EcranFiche provenance={provenance} canonique={annuaire}>
      <CorpsFiche
        principal={
          <>
            <section className="carte-board px-7 py-6 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                    {s.poste ?? "Poste non renseigné"}
                  </p>
                  <h1 className="board-titre m-0 mt-2 max-w-[30ch] text-[clamp(23px,2.1vw,30px)]">
                    {s.prenom} {s.nom}
                  </h1>
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {!s.actif && (
                      <PastilleFiche ton="neutre">
                        Sortie de l&apos;effectif
                      </PastilleFiche>
                    )}
                    <PastilleFiche ton={s.titres.length > 0 ? "bleu" : "neutre"}>
                      {s.titres.length === 0
                        ? "Aucun titre déclaré"
                        : `${s.titres.length} titre${s.titres.length > 1 ? "s" : ""}`}
                    </PastilleFiche>
                  </div>
                </div>
                <div className="flex flex-none flex-wrap items-center gap-2">
                  <Link
                    href={`/etablissements/${id}/equipe/${s.id}/modifier`}
                    className={buttonVariants({
                      variant: "boardClair",
                      size: "boardSm",
                    })}
                  >
                    Corriger
                  </Link>
                  <BasculerEffectif
                    etablissementId={id}
                    salarieId={s.id}
                    actif={s.actif}
                  />
                </div>
              </div>

              {!s.actif && (
                <p className="m-0 mt-4 max-w-[64ch] text-[12.5px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                  Cette personne ne fait plus partie de l&apos;effectif. Sa fiche
                  est conservée parce que ses titres prouvent qu&apos;elle était
                  habilitée au moment où elle a travaillé — c&apos;est cette
                  preuve qui vous couvre sur la période passée.
                </p>
              )}
            </section>

            <CarteFiche titreFort="Titres détenus">
              {s.titres.length === 0 ? (
                <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                  Rien de déclaré pour l&apos;instant. Rojer ne peut pas le
                  deviner : rien dans un intitulé de poste ne dit qu&apos;une
                  personne conduit un chariot, travaille au voisinage de pièces
                  sous tension, est formée au secourisme ou relève d&apos;un
                  suivi médical renforcé.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {s.titres.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-[18px] bg-[color:var(--board-slate-pale)] px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[13.5px] font-semibold leading-tight text-[color:var(--board-slate-ink)]">
                          {t.libelle}
                        </p>
                        <p className="m-0 mt-1 text-[12px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                          Délivré le {formaterDateLongueFr(t.delivreLe)}
                          {t.echeanceLe
                            ? ` · valable jusqu'au ${formaterDateLongueFr(t.echeanceLe)}`
                            : " · aucune date de fin portée sur le titre"}
                        </p>
                        {t.note && (
                          <p className="m-0 mt-1 text-[12px] leading-[1.5] text-[color:var(--board-slate-soft)]">
                            {t.note}
                          </p>
                        )}
                        {t.pieceMedicale && (
                          <p className="m-0 mt-1.5 text-[11.5px] leading-[1.45] text-[color:var(--board-slate-soft)]">
                            Rojer n&apos;enregistre que l&apos;existence de cette
                            attestation et ses dates. Le document reste chez vous.
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          {/* `ReferenceLegale.url` est optionnel : une
                              référence sans URL rendait une pastille muette —
                              l'apparence d'un lien, rien dessous. Le type de
                              `LegalBadge` l'interdit désormais. Sans URL, la
                              référence s'écrit donc en texte : elle dit d'où
                              vient la contrainte sans promettre de l'ouvrir. */}
                          {t.referencesLegales.slice(0, 1).map((r) =>
                            r.url ? (
                              <LegalBadge
                                key={r.article ?? r.reference}
                                charte="board"
                                reference={r.reference}
                                href={r.url}
                              />
                            ) : (
                              <span
                                key={r.article ?? r.reference}
                                className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-[color:var(--board-slate-soft)]"
                              >
                                § {r.reference}
                              </span>
                            ),
                          )}
                          <RetirerTitreButton
                            etablissementId={id}
                            salarieId={s.id}
                            titreId={t.id}
                            libelle={t.libelle}
                          />
                        </div>
                      </div>

                      {/* Le point porte l'état, le mot le nomme : une
                          signalétique qui tient à une couleur disparaît en
                          niveaux de gris et pour qui n'y voit pas. */}
                      <span
                        className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[11.5px] font-semibold"
                        style={{ color: ENCRE_ETAT[t.etat] }}
                      >
                        <span
                          aria-hidden
                          className="size-[7px] flex-none rounded-full"
                          style={{ background: CHAMP_ETAT[t.etat] }}
                        />
                        {MOT_DE_L_ETAT[t.etat]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CarteFiche>

            <CarteFiche titreFort="Déclarer un titre">
              {catalogue.length === 0 ? (
                <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                  Aucun titre n&apos;est encore encodé au référentiel.
                </p>
              ) : (
                <FormulaireTitre
                  catalogue={catalogue.map((o) => ({
                    id: o.id,
                    libelle: o.libelle,
                    description: o.description,
                    pieceMedicale: o.pieceMedicale,
                    periodicite: o.periodicite,
                  }))}
                  action={action}
                  dejaDeclares={s.titres.map((t) => t.obligationId)}
                />
              )}
            </CarteFiche>

            {/* Le droit d'accès de la personne suivie (art. 15 RGPD). Elle n'a
                pas accès à l'outil : elle demande à son employeur, qui est le
                responsable de traitement. Sans ce bouton, l'employeur devrait
                recopier un écran à la main pour honorer une demande — et
                `docs/rgpd.md` § 5.2 promettrait un droit que rien ne sert. */}
            <CarteFiche titre="Ce que Rojer enregistre sur cette personne">
              <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Son nom, son poste, sa date d&apos;entrée, et pour chaque titre
                sa nature et ses dates. Rien d&apos;autre — pas de date de
                naissance, pas de numéro de sécurité sociale, aucune donnée de
                santé. Si elle vous demande ce que vous détenez sur elle, vous
                pouvez le lui remettre :
              </p>
              <div className="mt-4">
                <Link
                  href={`/api/etablissements/${id}/equipe/${s.id}/donnees`}
                  className={buttonVariants({
                    variant: "boardClair",
                    size: "boardSm",
                  })}
                >
                  <Download className="size-3.5" aria-hidden />
                  Éditer ses données
                </Link>
              </div>
              <p className="m-0 mt-3 max-w-[64ch] text-[12px] leading-[1.55] text-[color:var(--board-slate-soft)]">
                Le droit à l&apos;effacement est limité sur ces données :
                l&apos;article 17.3.b du RGPD excepte ce qui est conservé au
                titre d&apos;une obligation légale. Mieux vaut le lui dire que
                lui promettre un droit qu&apos;on ne peut pas honorer.
              </p>
            </CarteFiche>

            <CarteFiche titre="Repères">
              <ChampsFiche>
                <ChampFiche cle="Entrée dans l'effectif">
                  {s.entreLe ? formaterDateLongueFr(s.entreLe) : "Non renseignée"}
                </ChampFiche>
                <ChampFiche cle="Fiche créée le">
                  {formaterDateLongueFr(s.createdAt)}
                </ChampFiche>
              </ChampsFiche>
            </CarteFiche>
          </>
        }
      />
    </EcranFiche>
  );
}
