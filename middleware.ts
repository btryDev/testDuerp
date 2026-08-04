// ADR-005 : middleware d'auth Supabase. Le matcher exclut les assets statiques
// et les routes internes Next. La logique (refresh session + redirect si
// non connecté hors whitelist) vit dans src/lib/supabase/middleware.ts.

import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Tout sauf :
     * - _next/static / _next/image (assets Next)
     * - favicon.ico
     * - fichiers avec extension (.svg, .png, .jpg, .webp, .woff2, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|otf)$).*)",
  ],
};
