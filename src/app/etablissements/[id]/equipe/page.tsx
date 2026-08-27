import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LegalBadge } from "@/components/ui-kit";
import { SalarieCard } from "@/components/salaries/SalarieCard";
import { requireEtablissement } from "@/lib/auth/scope";
import { listerEquipe } from "@/lib/salaries/queries";
import { cataloguerTitres } from "@/lib/salaries/catalogue";
import { CHAMP_ETAT, ENCRE_ETAT } from "@/lib/calendrier/etats";

/**
 * L'annuaire de l'équipe — le troisième porteur d'échéance (ADR-023).
 *
 * Cet écran a une particularité que les deux autres annuaires n'ont pas, et
 * elle commande sa rédaction : **rien ici n'est déduit**. Le moteur sait qu'un
 * ascenseur déclaré appelle une vérification annuelle ; il ne sait pas qui,
 * dans l'effectif, opère au voisinage de pièces nues sous tension. Ce serait le
 * cinquième déclencheur — l'activité réellement exercée — et il n'est pas
 * implémenté. L'écran doit donc dire clairement que la couverture vient de ce
 * que l'employeur déclare, sans quoi une page vide se lirait « rien à faire ».
 */
export default async function EquipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const now = new Date();
  const equipe = await listerEquipe(id, now);
  const catalogue = cataloguerTitres();

  const enRetard = equipe
    .filter((s) => s.actif)
    .reduce((n, s) => n + s.titres.filter((t) => t.etat === "enRetard").length, 0);
  const actifs = equipe.filter((s) => s.actif).length;

  return (
    <main className="flex flex-1 flex-col bg-[color:var(--board-canvas)] pb-16">
      <header className="border-b border-[color:var(--board-slate-line)] bg-[color:var(--board-card)] px-[var(--board-gutter)] py-[22px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href={`/etablissements/${id}`}
              className="board-eyebrow inline-flex items-center gap-2 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)] transition-colors hover:text-[color:var(--board-ink)]"
            >
              <ArrowLeft className="size-3" aria-hidden />
              {etablissement.raisonDisplay}
            </Link>
            <h1 className="board-titre m-0 mt-2.5 text-[clamp(22px,2.2vw,27px)]">
              Équipe
            </h1>
            <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
              Les personnes de votre effectif et les titres qu&apos;elles
              détiennent — habilitation, attestation, certificat. Un titre porte
              une échéance nominative : c&apos;est la personne qui est habilitée,
              pas le poste.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {enRetard > 0 && (
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-[9px]"
                style={{
                  background: CHAMP_ETAT.enRetard,
                  color: ENCRE_ETAT.enRetard,
                }}
              >
                <span className="board-titre text-[20px] tabular-nums leading-none">
                  {enRetard}
                </span>
                <span className="board-eyebrow text-[9.5px] tracking-[0.12em]">
                  {enRetard > 1 ? "titres à renouveler" : "titre à renouveler"}
                </span>
              </span>
            )}
            <Link
              href={`/etablissements/${id}/equipe/nouveau`}
              className={buttonVariants({ variant: "board", size: "board" })}
            >
              <Plus className="size-3.5" aria-hidden />
              Ajouter une personne
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-7 px-[var(--board-gutter)] pt-6">
        {equipe.length === 0 ? (
          <section className="carte-board px-7 py-8 sm:px-8">
            <div className="flex max-w-[600px] flex-col gap-3">
              <h2 className="board-titre m-0 text-[22px]">
                Votre équipe n&apos;est pas encore renseignée
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Commencez par les personnes qui détiennent un titre :
                l&apos;électricien habilité, le cariste, le titulaire du SST.
                Vous saurez quand leur titre expire, sans avoir à ouvrir un
                classeur.
              </p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Rojer ne devine pas qui fait quoi. Rien dans un intitulé de
                poste ne dit qu&apos;une personne travaille au voisinage de
                pièces sous tension — c&apos;est vous qui le savez, et
                c&apos;est vous qui déclarez ce qu&apos;elle détient.
              </p>
              <div className="mt-2">
                <Link
                  href={`/etablissements/${id}/equipe/nouveau`}
                  className={buttonVariants({ variant: "board", size: "board" })}
                >
                  <Plus className="size-3.5" aria-hidden />
                  Ajouter une personne
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {equipe.map((s) => (
              <SalarieCard key={s.id} etablissementId={id} salarie={s} />
            ))}
          </div>
        )}

        {/* Ce que l'écran ne couvre pas, dit par l'écran lui-même. Un
            catalogue d'un seul titre laisserait croire qu'il n'y a qu'une
            obligation nominative en droit ; il y en a vingt recensées, dont
            dix-neuf ne sont pas encore dépouillées au corpus. Taire l'écart
            tromperait l'utilisateur sur sa propre couverture. */}
        <section className="carte-board px-7 py-6 sm:px-8">
          <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
            Ce que couvre cet écran
          </p>
          <h2 className="board-titre m-0 mt-2 text-[22px]">
            {catalogue.length === 1
              ? "Un seul titre au catalogue, pour l'instant"
              : `${catalogue.length} titres au catalogue`}
          </h2>
          <p className="m-0 mt-3 max-w-[68ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
            Rojer ne propose que les titres dont il a lu le texte fondateur en
            première main. Aujourd&apos;hui :{" "}
            {catalogue.map((o) => o.libelle).join(", ")}. Les autres —
            SST, CACES, autorisation de conduite, formations à la sécurité —
            existent en droit et vous concernent peut-être, mais ils ne sont
            pas encore encodés ici. <strong>Continuez à les suivre par vos
            moyens habituels</strong> tant qu&apos;ils n&apos;y sont pas.
          </p>
          <p className="m-0 mt-3 max-w-[68ch] text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
            Un titre est nominatif : le Code fait délivrer l&apos;habilitation à
            un travailleur désigné, pas à un poste. Un suivi par fonction
            produirait un compteur — « deux caristes à habiliter » — et ne
            prouverait rien devant un contrôle.
          </p>
          <div className="mt-4">
            <LegalBadge
              reference="Art. R. 4544-10 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051500368"
            />
          </div>
        </section>

        {actifs > 0 && (
          <p className="m-0 px-1 text-[12px] text-[color:var(--board-slate-soft)]">
            {actifs} personne{actifs > 1 ? "s" : ""} dans l&apos;effectif
            {equipe.length > actifs &&
              ` · ${equipe.length - actifs} sortie${equipe.length - actifs > 1 ? "s" : ""}, conservée${equipe.length - actifs > 1 ? "s" : ""} pour la preuve`}
          </p>
        )}
      </div>
    </main>
  );
}
