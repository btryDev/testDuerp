import Link from "next/link";
import { Reveal } from "./Reveal";

// Le sujet de cette section, c'est la prise en main : combien de temps
// avant d'être opérationnel, et qu'est-ce qu'on a à faire. Surtout pas
// « ça tourne sans vous » — la donnée vient de l'utilisateur, du premier
// jour au dernier ; ce qu'on lui épargne, c'est le classement et le
// calcul des échéances, pas la saisie.
//
// La numérotation est ici justifiée : les trois étapes se font dans cet
// ordre. Le troisième cran passe à l'encre : c'est le seul qui se répète,
// et c'est là que la vie de l'outil commence.
//
// L'étape 3 annonce le rappel e-mail avant échéance : prévu pour la
// sortie publique. À vérifier avant de mettre la page en ligne — c'est la
// seule promesse de cette section qui ne soit pas déjà livrée.
//
// Cette section porte l'appel à l'action de milieu de page : elle a
// absorbé l'ancienne bande bleue de pied de page (`CtaFinal`, supprimée).
// On demande le compte au moment où l'on vient de dire ce que ça coûte à
// prendre en main — c'est là que la question se pose.

const ETAPES = [
  {
    titre: "Vous déclarez votre établissement",
    corps: "Activité, effectif, locaux, équipements. Rojer en déduit vos obligations et leurs périodicités.",
    duree: "≈ 20 min",
  },
  {
    titre: "Le calendrier se remplit seul",
    corps: "Chaque équipement pose ses dates sur la frise : en retard, proche, ou calme. Rien à recopier d'une année sur l'autre.",
    duree: "Automatique",
  },
  {
    titre: "Vous traitez ce qui arrive à échéance",
    corps: "Un e-mail vous prévient avant la date, le brief ne montre que l'utile. Le reste attend son tour.",
    duree: "Chaque semaine",
  },
];

export function Etapes({
  ctaHref,
  ctaLabel,
  connecte,
}: {
  ctaHref: string;
  ctaLabel: string;
  connecte: boolean;
}) {
  return (
    <section className="bg-[color:var(--board-card)] py-20 sm:py-28">
      <div className="lp-shell">
        <Reveal as="header">
          <h2 className="lp-titre lp-h2 max-w-[15ch]">
            La prise en main tient en trois étapes
          </h2>
        </Reveal>

        <ol className="m-0 mt-14 grid grid-cols-1 list-none gap-10 p-0 sm:grid-cols-3 sm:gap-0">
          {ETAPES.map((e, i) => (
            <Reveal
              as="li"
              key={e.titre}
              delai={i * 90}
              className={
                "sm:px-8 sm:first:pl-0 sm:last:pr-0 " +
                (i > 0
                  ? "sm:border-l sm:border-dashed sm:border-[rgba(10,10,10,.18)]"
                  : "")
              }
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={
                    "flex size-11 items-center justify-center rounded-full text-[0.95rem] font-semibold " +
                    (i === ETAPES.length - 1
                      ? "bg-[color:var(--board-ink)] text-white"
                      : "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]")
                  }
                >
                  {i + 1}
                </span>
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--board-slate-soft)]">
                  {e.duree}
                </span>
              </div>
              <h3 className="lp-titre lp-h3 mt-6 max-w-[18ch]">{e.titre}</h3>
              <p className="lp-texte mt-3 max-w-[32ch]">{e.corps}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal delai={300}>
          <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-[rgba(10,10,10,.12)] pt-12">
            <Link href={ctaHref} className="lp-btn lp-btn-ink">
              {ctaLabel}
              <span className="lp-fleche" aria-hidden>
                →
              </span>
            </Link>
            {!connecte ? (
              <Link href="/login" className="lp-btn lp-btn-clair">
                J&apos;ai déjà un compte
              </Link>
            ) : null}
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--board-slate-soft)] sm:ml-4">
              Sans carte bancaire
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
