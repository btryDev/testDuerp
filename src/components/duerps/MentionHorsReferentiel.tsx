/**
 * La mention « hors référentiel sectoriel », dans ses deux formats.
 *
 * Pourquoi elle existe : quand une unité n'a pas d'équivalent dans le
 * référentiel sectoriel, la liste des risques proposés est vide. Sans un mot,
 * cet écran vide se lit « il n'y a rien à évaluer ici » alors qu'il dit en
 * réalité « l'outil n'a rien à proposer ici ». Le silence du référentiel ne
 * doit pas prendre l'apparence d'une évaluation.
 *
 * Les deux formats vivent dans le même fichier pour que la vue d'ensemble et
 * la fiche d'unité ne puissent pas se mettre à dire deux choses différentes du
 * même fait.
 *
 * Registre : on décrit ce que fait l'outil, jamais ce que vaut le document.
 * Pas de « incomplet », pas de « non conforme », pas de rassurance inverse.
 */

/** Format court, pour une ligne de liste déjà dense. */
export function LigneHorsReferentiel() {
  return (
    <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
      Hors référentiel sectoriel · aucun risque type proposé
    </p>
  );
}

/** Format développé, en tête de la fiche d'une unité. */
export function MentionHorsReferentiel() {
  return (
    <section
      aria-label="Unité hors référentiel sectoriel"
      className="rounded-2xl border border-dashed border-rule bg-paper-sunk/40 px-6 py-5 sm:px-8"
    >
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
        Hors référentiel sectoriel
      </p>
      <p className="mt-2 max-w-prose text-[0.92rem] leading-relaxed text-ink">
        Cette unité ne correspond à aucune unité type du référentiel sectoriel
        chargé pour votre activité. Aucun risque type ne peut donc vous être
        proposé ici : l&apos;inventaire, la cotation et les mesures de
        prévention sont entièrement à votre main.
      </p>
      <p className="mt-3 max-w-prose text-[0.88rem] leading-relaxed text-muted-foreground">
        Ajoutez vos risques un par un depuis «&nbsp;Ajouter un risque
        spécifique&nbsp;» plus bas. Chaque risque ajouté démarre sur une
        cotation neutre — c&apos;est un point de départ à ajuster, pas une
        appréciation. Si après examen l&apos;unité ne présente pas de risque
        significatif, vous pouvez le déclarer et le justifier.
      </p>
      <p className="mt-3 max-w-prose text-[0.82rem] leading-relaxed text-muted-foreground">
        Le DUERP généré porte la mention que cette unité a été évaluée hors
        référentiel sectoriel, afin que le lecteur du document sache d&apos;où
        vient son contenu.
      </p>
    </section>
  );
}
