// Helper utilisé par les Server Actions et les RSC qui accèdent à de la data
// utilisateur. Lit la session Supabase côté serveur et redirige vers /login
// si aucun user. À appeler AU DÉBUT de chaque action/loader, avant toute
// requête Prisma sensible.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthedUser = {
  id: string;
  email: string | null;
};

export async function requireUser(): Promise<AuthedUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { id: user.id, email: user.email ?? null };
}

// Variante non-redirect : retourne null si pas de user. Utile pour un header
// qui doit s'afficher en mode "connecté / déconnecté" sans forcer un redirect.
export async function getOptionalUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}
