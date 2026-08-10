// Middleware helper : rafraîchit la session Supabase à chaque requête et
// redirige vers /login si aucun user et que la route n'est pas whitelistée.
// Appelé depuis middleware.ts à la racine.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Préfixes publics (non authentifiés)
const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/auth",
  "/_next",
  "/favicon.ico",
  // ADR-007 : accès externe par token — prestataire sans compte.
  "/acces",
  // ADR-006 : vérification publique d'intégrité d'une signature.
  "/verifier",
  // ADR-006 : accusé de réception après signature (public).
  "/signe",
  // Registre d'accessibilité ERP (arrêté 19-04-2017) — consultation publique.
  "/accessibilite",
  // Route API qui sert l'affiche A4 du registre (QR + URL).
  "/api/accessibilite",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Ne pas intercaler de logique entre createServerClient et getUser :
  // la doc @supabase/ssr insiste là-dessus (sinon risque de déconnexion aléatoire).
  // `getUser()` peut throw un AuthApiError quand le cookie contient un refresh
  // token périmé — on traite ça comme « pas de user » pour ne pas 500 chaque
  // requête tant que le cookie n'a pas été regénéré par un /login.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
