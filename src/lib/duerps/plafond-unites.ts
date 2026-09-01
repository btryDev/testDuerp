// Le plafond d'unités de travail d'un DUERP (ADR-033), sans la base.
//
// Quatre endroits écrivent une unité — la création du DUERP, le choix du
// secteur, l'ajout manuel, l'import d'un document existant — et chacun aurait
// écrit sa propre soustraction. Le compte et les phrases vivent ici, une
// fois, et se testent sans prisma.

/**
 * Cinq unités de travail au plus par DUERP.
 *
 * C'est un choix de cadrage, pas un résultat d'observation : l'ADR-033 écrit
 * elle-même que le nombre d'unités des dossiers réels n'a jamais été mesuré.
 * C'est le premier chiffre à regarder si la borne se met à gêner.
 */
export const MAX_UNITES_TRAVAIL = 5;

/**
 * L'unité « Risques transverses » ne compte pas.
 *
 * La précision n'est pas cosmétique. Cette unité est créée systématiquement à
 * l'ouverture du DUERP, l'écran des unités la masque déjà, et deux des trois
 * référentiels sectoriels — restauration et bureau — pré-remplissent
 * exactement cinq unités : la compter ferait échouer le pré-remplissage dès la
 * première étape, sur un dossier pourtant parfaitement dans la cible.
 */
export function compterUnitesPlafonnees(
  unites: readonly { estTransverse: boolean }[],
): number {
  return unites.filter((u) => !u.estTransverse).length;
}

/** Combien d'unités peuvent encore être écrites. Jamais négatif : un dossier
 *  antérieur à la règle en porte peut-être davantage, et il les garde. */
export function placesRestantes(dejaPosees: number): number {
  return Math.max(0, MAX_UNITES_TRAVAIL - dejaPosees);
}

/**
 * Le refus d'un ajout manuel. La phrase nomme la limite : « ce n'est pas
 * possible » laisserait l'utilisateur réessayer sans savoir ce qu'il doit
 * défaire d'abord.
 */
export function messagePlafondAjout(): string {
  return `Un DUERP compte ${MAX_UNITES_TRAVAIL} unités de travail au plus. Regroupez deux unités existantes, ou supprimez-en une, avant d'en ajouter une autre.`;
}

/**
 * Le refus d'un import. Il nomme la limite **et** ce que l'import aurait
 * produit : le dirigeant a apporté ce fichier, il doit savoir de combien il
 * dépasse pour le regrouper lui-même.
 *
 * On refuse, on ne tronque pas. Tronquer silencieusement un document apporté
 * lui ferait perdre des risques déjà évalués sans qu'il le sache — le
 * contraire exact de ce que le produit promet.
 */
export function messagePlafondImport(total: number): string {
  return `Ce fichier porterait le DUERP à ${total} unités de travail, alors que la limite est de ${MAX_UNITES_TRAVAIL} (l'unité « Risques transverses » ne compte pas). Rien n'a été importé : regroupez des unités dans votre fichier, puis relancez l'import — aucun risque évalué ne doit se perdre en route.`;
}

/**
 * Ce que pèserait un import, et s'il passe.
 *
 * Deux appelants s'en servent : l'action, qui doit refuser **avant** de créer
 * le DUERP — sinon un import refusé laisse derrière lui un document vide que
 * personne n'a demandé —, et le constructeur d'écritures, pour qu'on ne
 * puisse pas assembler un lot hors borne en l'appelant directement.
 *
 * Une unité du fichier qui porte le nom d'une unité déjà en base ne compte
 * pas : elle sera réutilisée, pas créée. L'unité transverse n'entre ni dans
 * le compte ni dans les rattachements possibles.
 */
export function verifierPlafondImport(
  unitesExistantes: readonly { nom: string; estTransverse: boolean }[],
  nomsDuFichier: readonly string[],
): { ok: true } | { ok: false; message: string } {
  const dejaEnBase = unitesExistantes.filter((u) => !u.estTransverse);
  const reutilisables = new Set(dejaEnBase.map((u) => u.nom));
  const aNaitre = new Set(nomsDuFichier.filter((n) => !reutilisables.has(n)));
  // `dejaEnBase.length` et non le nombre de noms distincts : deux unités
  // homonymes sont deux lignes, et le plafond compte des lignes.
  const total = dejaEnBase.length + aNaitre.size;
  return total > MAX_UNITES_TRAVAIL
    ? { ok: false, message: messagePlafondImport(total) }
    : { ok: true };
}
