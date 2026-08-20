"use client";

// Un lien qui emporte l'écran d'où il part.
//
// Il existe parce que certains écrans portent une partie de leur état hors
// du serveur : le calendrier écrit sa lecture (`?vue=equipement`) d'un
// `history.replaceState`, sans repasser par le rendu serveur. Un lien
// fabriqué côté serveur ne connaîtrait donc pas cette lecture, et le
// retour ramènerait le dirigeant sur une autre vue que celle qu'il a
// quittée. Côté client, `usePathname` / `useSearchParams` voient l'URL
// réelle — replaceState compris — et la provenance est exacte.
//
// Sur un écran entièrement rendu au serveur, pas besoin de ce composant :
// la page connaît son propre chemin et ses propres paramètres, elle appelle
// `origineDepuis` puis `avecProvenance` elle-même.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { avecProvenance, origineDepuis } from "@/lib/navigation/provenance";

/** L'écran courant, tel qu'il doit être réémis dans les liens qu'il pose. */
export function useOrigine(): string {
  const pathname = usePathname();
  const params = useSearchParams();
  return origineDepuis(pathname, params);
}

export function LienProvenance({
  href,
  ...reste
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const origine = useOrigine();
  return <Link href={avecProvenance(href, origine)} {...reste} />;
}
