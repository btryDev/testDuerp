// Helper utilisé par les Server Actions et les RSC qui accèdent à de la data
// utilisateur. Lit la session Supabase côté serveur et redirige vers /login
// si aucun user. À appeler AU DÉBUT de chaque action/loader, avant toute
// requête Prisma sensible.

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AuthedUser = {
  id: string;
  email: string | null;
};

// `getUser()` peut throw un `AuthApiError` (« Invalid Refresh Token ») quand
// le cookie de session contient un refresh token périmé. On traite ça comme
// « pas de user » plutôt que de faire 500 le RSC qui consomme ce helper.
async function safeGetUser(supabase: SupabaseClient) {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthedUser> {
  const supabase = await createClient();
  const user = await safeGetUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return { id: user.id, email: user.email ?? null };
}

// Variante non-redirect : retourne null si pas de user. Utile pour un header
// qui doit s'afficher en mode "connecté / déconnecté" sans forcer un redirect.
export async function getOptionalUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const user = await safeGetUser(supabase);

  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}
