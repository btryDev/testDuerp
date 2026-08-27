import {
  obligationsConformite,
  estPorteeParSalarie,
  type ObligationPorteeParSalarie,
} from "@/lib/referentiels/conformite";

/**
 * Les titres que l'employeur peut déclarer.
 *
 * Le catalogue n'est pas une liste maintenue à la main : il se dérive du
 * référentiel, filtré sur le porteur. Une obligation salarié ajoutée demain à
 * `conformite/` apparaît ici sans qu'on y touche — et une obligation retirée
 * disparaît, plutôt que de rester proposée à la saisie alors que plus rien ne
 * la génère.
 *
 * Il est court aujourd'hui : **une seule ligne**, l'attestation médicale
 * quinquennale de `R. 4544-11-1` (ADR-023). Les dix-neuf autres recensées —
 * SST, CACES, autorisation de conduite, formations `R. 4141-*` — attendent
 * leur dépouillement au corpus, et le cliquet de `corpus.test.ts` interdit
 * d'encoder sur un texte que personne n'a lu. L'écran doit donc dire à
 * l'utilisateur que ce qu'il voit n'est pas tout ce qui existe : lui laisser
 * croire que l'outil couvre l'ensemble des titres serait le tromper sur sa
 * propre couverture.
 */
export function cataloguerTitres(): ObligationPorteeParSalarie[] {
  return obligationsConformite
    .filter(estPorteeParSalarie)
    .sort((a, b) => a.libelle.localeCompare(b.libelle, "fr"));
}

export function titreParId(
  obligationId: string,
): ObligationPorteeParSalarie | undefined {
  return cataloguerTitres().find((o) => o.id === obligationId);
}
