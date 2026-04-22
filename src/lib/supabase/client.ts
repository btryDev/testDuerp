// Client Supabase côté browser — utilisé par les Client Components.
// N'accède jamais à la data applicative : sert uniquement à piloter la session
// (signIn / signUp / signOut / onAuthStateChange). La data reste via Prisma
// côté serveur (cf. ADR-005).

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
