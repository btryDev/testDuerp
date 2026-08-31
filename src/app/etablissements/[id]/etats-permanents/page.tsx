import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEtablissement } from "@/lib/auth/scope";
import { listerEquipementsDeLEtablissement } from "@/lib/equipements/queries";
import { listerEtatsPermanents } from "@/lib/etats-permanents/queries";
import { LigneEtat } from "@/components/etats-permanents/LigneEtat";
import {
  phraseCompteur,
  phraseFaitsDates,
  phraseRestantes,
} from "@/lib/etats-permanents/phrases";

export const metadata = {
  title: "Ce qui doit être en place — Rojer",
};

/**
 * La seconde des quatre natures d'obligation (ADR-022) reçoit son écran.
 *
 * **Le constat qui l'appelle**, mesuré au contrôle visuel du 2026-08-31 sur un
 * dossier né de l'onboarding : le moteur calculait dix-huit obligations, et
 * l'application en affichait deux. Les seize autres n'étaient persistées nulle
 * part et n'apparaissaient sur aucun des neuf écrans ouverts — sauf dans le
 * menu déroulant d'un formulaire dont le texte d'accueil dit qu'il n'y a rien à
 * y faire.
 *
 * Le générateur les écarte à raison : sans périodicité, pas de rendez-vous, et
 * inventer une date serait pire que n'en afficher aucune. Ce qui manquait
 * n'était pas un correctif d'affichage, c'était une surface.
 *
 * **Où cet écran vit, et pourquoi ici.** Quatrième item du panneau « À faire »,
 * sans nouvelle entrée de rail. L'ADR-015, décision 4 : ce panneau « ne porte
 * que des activités » et « aucune entrée n'est l'état filtré d'une autre ».
 * Les deux conditions tiennent — mettre en place est une activité, et ce n'est
 * pas un filtre du calendrier pour une raison structurelle et non contingente :
 * `estSansRendezVous` fait que ces lignes ne peuvent pas exister comme
 * `Verification`. Un filtre suppose que l'objet soit là ; ici il n'y est pas et
 * n'y sera jamais.
 *
 * **Ce que cet écran n'est pas.** Une case cochée est une déclaration de
 * l'employeur — ni un rapport, ni une pièce, ni un constat du produit
 * (ADR-027). Elle n'allume rien ailleurs : ni le « % prêt » de Préparer un
 * contrôle, ni un indicateur au vert, ni une entrée du ZIP. Aucune surface de
 * dépôt n'est ouverte ici.
 *
 * **Et ce n'est pas un relevé de manquements.** Douze lignes non cochées chez
 * quelqu'un qui vient de créer son dossier, c'est une liste de ce qu'il a à
 * mettre en place — et une bonne partie décrit des choses qu'il fait déjà sans
 * savoir qu'elles ont un fondement légal. Le ton de l'en-tête et de l'état
 * initial est écrit pour ça.
 */
export default async function EtatsPermanentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const equipements = await listerEquipementsDeLEtablissement(id);

  const { groupes, faits, enPlace, total, faitsDates, faitsDatesRenseignes } =
    await listerEtatsPermanents(
      etablissement,
      equipements.map((eq) => ({
        id: eq.id,
        libelle: eq.libelle,
        categorie: eq.categorie,
        caracteristiques: (eq.caracteristiques ?? null) as Record<
          string,
          unknown
        > | null,
      })),
    );

  const restantes = total - enPlace;
  // Les phrases qui s'accordent en nombre vivent dans `phrases.ts` et non dans
  // ce JSX. Une locution coupée par un ternaire s'y était cassée au rendu —
  // « Elles n'entrepas dans le compte » — et rien ne pouvait l'attraper tant
  // que la phrase n'existait nulle part en entier.
  const texteRestantes = phraseRestantes(restantes);
  const texteFaits = phraseFaitsDates(faitsDates, faitsDatesRenseignes);

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
              Ce qui doit être en place
            </h1>
            <p className="m-0 mt-2 max-w-[68ch] text-[13.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
              Des obligations sans date : elles ne se refont pas à échéance, il
              s&apos;agit d&apos;un état à mettre en place puis à maintenir. Une
              bonne partie est sans doute déjà vraie chez vous — de l&apos;eau au
              robinet, des toilettes, une affiche au mur. Passez-les en revue :
              ce qui restera décoché dira ce qu&apos;il vous reste à faire.
            </p>
          </div>

          {/*
            Le compteur est MESURÉ, jamais écrit à la main : `listerEtatsPermanents`
            le calcule sur ce que le moteur rend pour CE dossier. Le brief l'exige,
            et ce dépôt s'est fait prendre plusieurs fois par des comptes recopiés —
            jusque dans les briefs eux-mêmes, trois fois sur cette page.

            « déclarés en place par vous », jamais « conformes » : le produit
            assiste, il ne certifie pas (CLAUDE.md, règle 8).
          */}
          {total > 0 && (
            <div className="shrink-0 text-right">
              <p className="board-titre m-0 text-[20px] tabular-nums leading-none">
                {enPlace} sur {total}
              </p>
              <p className="board-eyebrow m-0 mt-1.5 text-[9.5px] tracking-[0.12em] text-[color:var(--board-slate-soft)]">
                {phraseCompteur(enPlace, total)}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-7 px-[var(--board-gutter)] pt-6">
        {groupes.length === 0 ? (
          <section className="carte-board px-7 py-8 sm:px-8">
            <div className="flex max-w-[600px] flex-col gap-3">
              <h2 className="board-titre m-0 text-[22px]">
                Rien à mettre en place pour ce dossier
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                Aucune des obligations que votre dossier déclenche n&apos;est un
                état à constituer : elles ont toutes une date, et vous les
                trouverez au calendrier.
              </p>
            </div>
          </section>
        ) : (
          <>
            {groupes.map((g) => (
              <section key={g.domaine} className="carte-board px-7 py-6 sm:px-8">
                <h2 className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                  {g.libelle}
                </h2>
                <ul className="m-0 mt-3 list-none p-0">
                  {g.lignes.map((l) => (
                    <LigneEtat
                      key={l.obligation.id}
                      etablissementId={id}
                      obligationId={l.obligation.id}
                      libelle={l.obligation.libelle}
                      mode={l.mode}
                      pieceAttendue={l.pieceAttendue}
                      declareLe={l.declareLe ? l.declareLe.toISOString() : null}
                    />
                  ))}
                </ul>
              </section>
            ))}

            {/*
              LE SECOND VERBE A SA PROPRE SECTION, ET C'EST UNE CORRECTION.

              Les deux verbes cohabitaient dans les mêmes cartes, avec deux
              pastilles strictement identiques — même fond, même rayon, même
              position — et la seule différence tenait dans les trois mots du
              bouton. Le contrôle visuel du 2026-08-31 a coché douze lignes en
              sept secondes sans en lire une seule : dans ce geste-là, deux
              pastilles qui se ressemblent sont la même action.

              La distinction est donc portée par le REGROUPEMENT, qui se voit
              sans se lire. Pas par une teinte — la charte interdit la couleur
              seule — ni par une icône qu'il faudrait décoder. Et l'explication
              vit ici, à côté des lignes concernées, au lieu du pied de page
              « là où l'on arrive après avoir tout coché ».

              L'écran ne perd rien de sa vitesse : à l'intérieur de chaque
              section, cliquer reste immédiat.
            */}
            {faits.length > 0 && (
              <section className="carte-board px-7 py-6 sm:px-8">
                <h2 className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                  Ce qui revient, sans rythme écrit
                </h2>
                {texteFaits && (
                  <p className="m-0 mt-2 max-w-[72ch] text-[13px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                    {texteFaits}
                  </p>
                )}
                <ul className="m-0 mt-3 list-none p-0">
                  {faits.map((l) => (
                    <LigneEtat
                      key={l.obligation.id}
                      etablissementId={id}
                      obligationId={l.obligation.id}
                      libelle={l.obligation.libelle}
                      mode={l.mode}
                      pieceAttendue={l.pieceAttendue}
                      declareLe={l.declareLe ? l.declareLe.toISOString() : null}
                    />
                  ))}
                </ul>
              </section>
            )}

            {/*
              Ce que l'écran dit de lui-même. Le produit nomme ce qu'il ne couvre
              pas plutôt que de se taire — c'est sa marque, et l'ADR-024 en fait
              un mécanisme.

              Les phrases sont dérivées des compteurs, jamais écrites en dur : un
              paragraphe rédigé à la main sous une liste qui se calcule vieillit
              tout seul, et l'écran Équipe en a fait l'expérience — son bloc
              « ce qui n'est pas couvert » a menti pendant une journée en
              énumérant comme absentes trois obligations affichées deux lignes
              plus haut.
            */}
            <section className="carte-board px-7 py-6 sm:px-8">
              <h2 className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
                Ce que cette page fait, et ne fait pas
              </h2>
              <div className="mt-3 flex max-w-[72ch] flex-col gap-2.5 text-[13px] leading-[1.6] text-[color:var(--board-slate-mid)]">
                <p className="m-0">
                  Ce que vous cochez ici est <strong>une déclaration</strong>, et
                  elle est enregistrée comme telle : Rojer note que vous avez
                  déclaré, et à quelle date. Ce n&apos;est pas une vérification,
                  ce n&apos;est pas une pièce justificative, et cela ne rend
                  aucun dossier conforme.
                </p>
                <p className="m-0">
                  Rien n&apos;est relancé : aucun de ces textes n&apos;écrit à
                  quel rythme revoir ce que vous avez mis en place. La date
                  s&apos;affiche, vous jugez vous-même si elle a vieilli.
                </p>
                {/* Une seule expression, jamais une phrase recousue dans le
                    JSX : c'est le défaut qui a produit « Elles n'entrepas ».
                    L'accord et la ponctuation vivent dans `phrases.ts`, où ils
                    se lisent en entier et où toutes leurs branches se testent. */}
                {texteRestantes && <p className="m-0">{texteRestantes}</p>}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
