"use client";

// Gate client qui décide d'afficher ou non le `AppHeader` global selon
// le chemin. Les pages d'app (/etablissements/*, /onboarding, /duerp/*)
// ont leur propre chrome (AppSidebar + AppTopbar ou rail onboarding) et
// n'ont pas besoin du header éditorial — il ferait doublon.

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const PREFIXES_APP = [
  "/etablissements/",
  "/onboarding",
  "/duerp/",
];

function estRouteApp(pathname: string | null): boolean {
  if (!pathname) return false;
  return PREFIXES_APP.some((p) => pathname.startsWith(p));
}

export function AppHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (estRouteApp(pathname)) return null;
  return <>{children}</>;
}
