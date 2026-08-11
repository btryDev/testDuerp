import { Reveal } from "./Reveal";

// Les questions qu'on pose vraiment avant de créer un compte. Réponses
// courtes, sans promesse : ce que l'outil fait, et ce qu'il ne fait pas.
// Accordéon en <details> natif — pas de JavaScript, ouvrable au clavier,
// et le contenu reste dans le document pour la recherche.

const QUESTIONS = [
  {
    q: "Rojer dit-il que je suis en règle ?",
    r: "Non, et il ne le dira jamais. Il montre ce qui est fait, ce qui manque et à quelle date — la conformité se constate sur pièces, elle ne se décrète pas depuis un logiciel.",
  },
  {
    q: "Est-ce qu'il y a de l'intelligence artificielle là-dedans ?",
    r: "Aucune. Le référentiel est construit à la main depuis Légifrance et l'INRS, et les règles qui en déduisent vos obligations sont déterministes. Sur un document à valeur légale, on doit pouvoir expliquer chaque ligne.",
  },
  {
    q: "J'ai déjà un DUERP sur tableur.",
    r: "Vous l'importez : un gabarit XLSX ou CSV à télécharger, vos unités de travail et vos risques repris tels quels. Vous reprenez là où vous en étiez, vous ne recommencez pas.",
  },
  {
    q: "Et le jour où on me demande mes documents ?",
    r: "Vous exportez le dossier en une fois : une archive datée, avec l'index des pièces. Inspection, assurance, bailleur ou acquéreur — c'est le même geste, et il prend un clic.",
  },
  {
    q: "Où sont mes données ?",
    r: "Hébergées dans l'Union européenne. Vous exportez ou supprimez votre dossier à tout moment. Les versions de DUERP, elles, sont conservées 40 ans — c'est la loi, pas notre choix.",
  },
  {
    q: "Combien de temps pour démarrer ?",
    r: "Une demi-heure pour déclarer l'établissement et les équipements. Le calendrier et la liste d'obligations se génèrent ensuite tout seuls.",
  },
];

export function Questions() {
  return (
    <section
      id="questions"
      className="bg-[color:var(--board-canvas)] py-20 sm:py-28"
    >
      <div className="lp-shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal as="header">
          <p className="lp-eyebrow">Questions</p>
          <h2 className="lp-titre lp-h2 mt-4 max-w-[12ch]">
            Ce qu&apos;on nous demande avant de s&apos;inscrire
          </h2>
        </Reveal>

        <div className="border-t border-[rgba(10,10,10,.12)]">
          {QUESTIONS.map((item, i) => (
            <Reveal key={item.q} delai={i * 40}>
              <details className="group border-b border-[rgba(10,10,10,.12)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.02rem] font-semibold tracking-[-0.015em] text-[color:var(--board-ink)] transition-colors hover:text-[color:var(--board-blue-ink)] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="relative flex size-7 flex-none items-center justify-center rounded-full bg-[color:var(--board-card)]"
                  >
                    <span className="absolute h-px w-3 bg-[color:var(--board-ink)]" />
                    <span className="absolute h-3 w-px bg-[color:var(--board-ink)] transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                  </span>
                </summary>
                <p className="lp-texte max-w-[62ch] pb-6 pr-10">{item.r}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
