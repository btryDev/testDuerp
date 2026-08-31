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
 * Il a compté **une seule ligne** jusqu'au 2026-08-31 — l'attestation médicale
 * quinquennale de `R. 4544-11-1` (ADR-023) — et le lot 7 l'a porté à onze en
 * dépouillant `R. 4141-*`, `R. 4624-*`, `R. 4224-14` à `-16` et `R. 4323-55` à
 * `-57`.
 *
 * Ne réécrivez pas de compte ici. Cette note en portait un, il est devenu faux
 * le jour où le catalogue a grandi, et il l'est resté sur trois écrans à la
 * fois — c'est un défaut de ce module, pas un accident. Le catalogue se dérive :
 * son contenu se lit en appelant `cataloguerTitres()`, et les écrans l'affichent
 * plutôt que de le décrire.
 *
 * Ce qui reste vrai et doit continuer d'être dit à l'utilisateur : ce qu'il voit
 * n'est pas tout ce qui existe en droit. Le cliquet de `corpus.test.ts` interdit
 * d'encoder sur un texte que personne n'a lu, donc un titre dont le texte n'est
 * pas dépouillé est absent — et son absence ne veut pas dire qu'il n'est pas dû.
 * Lui laisser croire l'inverse serait le tromper sur sa propre couverture.
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
