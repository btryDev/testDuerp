// Câblage concret de l'accès OAuth — cf. ADR-013.
//
// `./acces-oauth` décide *quand* refuser ; ce module fournit les deux
// dépendances qu'il consomme, et rien d'autre. La séparation n'est pas
// cosmétique : elle permet de tester la logique de refus sans réseau, sans
// base et sans projet Supabase.
//
// Ces fonctions ne vivent pas dans `./queries` à dessein. Ce fichier-là pose
// comme invariant que toute lecture porte un `etablissementId` en premier
// paramètre — c'est ce qui garantit qu'aucune requête ne s'exécute hors
// portée. La recherche ci-dessous fait l'inverse : elle *établit* la portée.
// L'y ranger reviendrait à créer la seule exception à la règle, dans le
// fichier dont la règle est la raison d'être.

import { createClient } from "@supabase/supabase-js";
import { prismaMcp } from "./prisma";
import type { ChercheurEtablissement, VerificateurJeton } from "./acces-oauth";

/**
 * Vérificateur de jetons adossé au projet Supabase.
 *
 * `getClaims` valide la signature contre le JWKS du projet et contrôle
 * l'expiration. Avec des clés asymétriques (RS256/ES256) la vérification est
 * locale ; en HS256 la méthode retombe sur un aller-retour réseau par
 * requête — d'où le prérequis de bascule en asymétrique posé par ADR-013.
 *
 * Le client est créé sans stockage de session : ce processus ne se connecte
 * au nom de personne, il ne fait que vérifier des jetons présentés par
 * d'autres. Persister une session ici mélangerait l'identité du serveur avec
 * celle de ses appelants.
 */
export function creerVerificateurSupabase(
  env: NodeJS.ProcessEnv = process.env,
): VerificateurJeton | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const cle = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !cle) return null;

  const supabase = createClient(url, cle, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return async (jeton) => {
    const { data, error } = await supabase.auth.getClaims(jeton);
    if (error || !data?.claims) return null;
    return data.claims;
  };
}

/**
 * Résout l'établissement d'un utilisateur Supabase.
 *
 * `Entreprise.userId` est unique et l'invariant « 1 entreprise = 1
 * établissement » est porté par la base : la requête ne peut pas rendre deux
 * résultats, et `findFirst` sur la relation est ici sans ambiguïté.
 *
 * Rend `null` pour un utilisateur sans entreprise ou sans établissement —
 * compte créé, onboarding non terminé. C'est un refus, pas une erreur.
 */
export const chercherEtablissementDeUtilisateur: ChercheurEtablissement =
  async (userId) => {
    const entreprise = await prismaMcp.entreprise.findUnique({
      where: { userId },
      select: { etablissements: { select: { id: true }, take: 1 } },
    });

    return entreprise?.etablissements[0]?.id ?? null;
  };
