// Origine d'une action corrective — validation applicative du XOR (ADR-002).
//
// Depuis l'absorption de `Mesure`, une `Action` a exactement UNE origine :
// soit un `Risque` du DUERP (c'est alors une mesure de prévention au sens
// L. 4121-2), soit une `Verification` (c'est alors la levée d'un écart
// constaté sur un rapport). Jamais les deux, jamais aucune.
//
// Cet invariant n'existait qu'en SQL, dans la CHECK constraint
// `Action_origine_xor` d'une migration. Trois conséquences :
//   - Prisma ne sait pas exprimer une CHECK : rien dans `schema.prisma`,
//     rien dans les types générés, aucune erreur au typecheck ;
//   - un `prisma db push` (dev, CI) recrée la table SANS la contrainte, donc
//     l'écriture invalide passe silencieusement dans ces environnements ;
//   - même quand la contrainte est là, la violation remonte en erreur
//     PostgreSQL brute (P2010), illisible et non rattrapable proprement.
//
// D'où cette validation en amont : elle échoue au plus près de l'appel, avec
// un message qui nomme l'invariant. Elle ne remplace pas la contrainte SQL
// (dernier rempart, cf. `src/lib/migrations-contraintes.test.ts`), elle la
// double côté application.
//
// Module volontairement séparé des deux fichiers de server actions qui
// l'utilisent (`actions.ts`, `plan.ts`) : ceux-ci portent la directive
// `"use server"`, qui interdit d'en exporter autre chose que des fonctions
// asynchrones.

/** Forme minimale d'une origine d'action, telle qu'elle part vers Prisma. */
export type OrigineAction = {
  risqueId?: string | null;
  verificationId?: string | null;
};

/** Un identifiant est « renseigné » s'il s'agit d'une chaîne non vide.
 *  `null`, `undefined` et `""` valent tous « absent » : le formulaire peut
 *  renvoyer une chaîne vide là où le code renverrait `null`. */
function renseigne(id: string | null | undefined): boolean {
  return typeof id === "string" && id.length > 0;
}

/** L'origine respecte-t-elle le XOR ? (exactement l'un des deux) */
export function origineActionValide(o: OrigineAction): boolean {
  return renseigne(o.risqueId) !== renseigne(o.verificationId);
}

/**
 * Lève si l'origine ne respecte pas le XOR. À appeler dans tout chemin de
 * création d'une `Action`, avant l'écriture.
 */
export function assertOrigineActionValide(o: OrigineAction): void {
  if (origineActionValide(o)) return;
  const detail = renseigne(o.risqueId)
    ? "les deux sont renseignés"
    : "aucun n'est renseigné";
  throw new Error(
    `Origine d'action invalide (${detail}) : une action se rattache à exactement un risque OU une vérification (ADR-002, contrainte Action_origine_xor).`,
  );
}
