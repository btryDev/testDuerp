/**
 * Par où un fichier peut atterrir en base.
 *
 * **Extrait de `frontiere-medicale.test.ts` pour être partagé**, et pas par
 * goût du découpage : deux tests gardent désormais des chemins différents pour
 * des raisons différentes — la frontière médicale interdit le dépôt dans le
 * module du salarié (`docs/rgpd.md` § 2.3, ADR-023), l'écran des états
 * permanents l'interdit parce qu'une déclaration n'est pas une preuve
 * (ADR-027). Les deux ont besoin de la même liste, et une liste recopiée
 * vieillit d'un côté seulement : le jour où une quatrième primitive de dépôt
 * arrive, une des deux gardes cesse de voir.
 *
 * C'est la ligne tracée le 2026-08-31 après trois défauts nés de deux widgets
 * jumeaux — **partage la règle, pas la mise en page**. Une liste de ce qui
 * compte comme un dépôt est une règle.
 *
 * La liste est explicite plutôt que devinée : un dépôt s'ajoute rarement et
 * doit être une décision. `type="file"` complète le filet pour un champ écrit à
 * la main sans passer par ces composants.
 */
export const SURFACES_DE_DEPOT = [
  "UploadRapportForm",
  "EvidenceDropzone",
  "ImportDuerpWizard",
] as const;

/** Le motif qui repère un montage de dépôt dans un source. */
export const MOTIF_DEPOT = new RegExp(
  `<(${SURFACES_DE_DEPOT.join("|")})\\b|type=["']file["']`,
);
