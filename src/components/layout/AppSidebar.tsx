"use client";

// Sidebar persistante (248px) pour le shell d'app.
//
// Habillage noir (#0A0A0A) repris du design Rojer : items en pilules,
// actif en pilule blanche pleine, kickers de section en gris clair. Les
// jetons `--board-*` sont partagés avec le tableau de bord — le rail et le
// board parlent la même langue.
//
// L'arborescence elle-même vit dans `sidebar-nav.ts` (module pur, testé) :
// trois sections adressées au dirigeant — « À faire », « Mon établissement »,
// « Mes registres » — et divulgation progressive des registres de domaine.
// Ce fichier ne fait que le rendu.
//
// L'item actif peut être passé en prop (back-compat) ou, quand la prop est
// omise, déduit automatiquement depuis le `pathname` courant. Cela permet de
// monter la sidebar depuis le layout sans que chaque page ait à passer
// explicitement son id de section.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, HelpCircle, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import {
  construireSections,
  deduireActif,
  type NavItem,
  type ProfilRegistres,
  type SidebarActive,
  type SidebarCounts,
  type SidebarItemId,
} from "./sidebar-nav";

export type { SidebarActive, ProfilRegistres };

type Etablissement = {
  id: string;
  raisonDisplay: string;
  adresse: string;
  effectifSurSite: number;
  entrepriseId: string;
};

type User = {
  email: string | null;
};

export function AppSidebar({
  etablissement,
  active,
  counts,
  profil,
  user,
}: {
  etablissement: Etablissement;
  /** Item actif. Si omis, déduit automatiquement depuis `usePathname()`. */
  active?: SidebarActive;
  counts?: SidebarCounts;
  /** Faits déclarés servant à replier les registres de domaine non nourris.
   *  Omis → rien n'est replié. */
  profil?: ProfilRegistres;
  user?: User | null;
}) {
  const pathname = usePathname();
  const actif: SidebarItemId =
    active ?? deduireActif(pathname ?? "", etablissement.id);

  const sections = construireSections({
    etablissementId: etablissement.id,
    counts,
    profil,
    actif,
  });

  const initialUser = (user?.email ?? "??").slice(0, 2).toUpperCase();

  return (
    <aside
      className="flex h-screen w-[248px] flex-col bg-[color:var(--board-ink)] text-white"
      aria-label="Navigation principale"
    >
      {/* Brand : marque abstraite (cible) + nom */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          aria-hidden
          className="shrink-0"
        >
          <circle cx="13" cy="13" r="11" stroke="var(--board-canvas)" strokeWidth="1" opacity="0.35" />
          <circle cx="13" cy="13" r="6.5" stroke="var(--board-canvas)" strokeWidth="1.1" opacity="0.75" />
          <circle cx="13" cy="13" r="2.4" fill="var(--board-canvas)" />
        </svg>
        <p className="text-[17px] font-semibold leading-none tracking-[-0.025em] text-white">
          Pilote
        </p>
      </div>

      {/* Nav groupée — le contexte établissement est rendu dans la card
          sticky du dashboard, et dans les crumbs des autres pages. */}
      <nav className="min-h-0 flex-1 overflow-auto px-2.5 pb-2">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="px-4 pb-2 pt-[18px] font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {sec.title}
            </p>
            {sec.items.map((it) => (
              <NavLink key={it.id} item={it} actif={actif} />
            ))}
            {sec.repliables ? (
              <Divulgation items={sec.repliables} actif={actif} />
            ) : null}
          </div>
        ))}
      </nav>

      {/* Footer : aide + user chip. Le guide a rejoint la section
          « À faire » de la nav (item « Comprendre ») — pas de doublon. */}
      <div className="flex flex-col gap-1 border-t border-white/10 px-3 py-3">
        <span className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-white/30">
          <HelpCircle aria-hidden className="size-3.5" /> Aide
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em]">
            bientôt
          </span>
        </span>
        {user ? (
          <div className="mt-0.5 flex items-center gap-2.5 px-1 py-1.5">
            <div
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-[color:var(--board-canvas)] font-mono text-[12px] font-semibold text-[color:var(--board-blue-ink)]"
            >
              {initialUser}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-white">
                {user.email ?? "Utilisateur"}
              </p>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="mt-0.5 flex items-center gap-1 text-[10.5px] text-white/45 transition-colors hover:text-white"
                >
                  <LogOut aria-hidden className="size-3" />
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

const CLASSES_ITEM =
  "flex w-full items-center gap-3 rounded-full px-3.5 py-[10px] text-[13.5px] transition-colors";

function NavLink({ item, actif }: { item: NavItem; actif: SidebarItemId }) {
  const isActive = item.id === actif;

  // Destination pas encore implémentée : rendue inerte et étiquetée, pour
  // qu'elle ne se confonde pas visuellement avec un lien réel.
  if (item.bientot) {
    return (
      <span className={CLASSES_ITEM + " text-white/30"} aria-disabled>
        <item.Icon aria-hidden className="size-4 opacity-70" />
        <span className="flex-1 truncate">{item.label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
          bientôt
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={
        CLASSES_ITEM + " " +
        (isActive
          ? "bg-white font-semibold text-[color:var(--board-ink)]"
          : "text-white/60 hover:bg-white/10 hover:text-white")
      }
    >
      <item.Icon aria-hidden className="size-4 opacity-90" />
      <span className="flex-1 truncate">{item.label}</span>
      {typeof item.count === "number" && item.count > 0 ? (
        <span
          className={
            "rounded-full px-[7px] py-px font-mono text-[11px] " +
            (isActive
              ? "bg-[color:var(--board-ink)]/10 text-[color:var(--board-ink)]"
              : item.alert
                ? "bg-[color:var(--board-signal)] text-[color:var(--board-signal-on)]"
                : "bg-white/10 text-white/60")
          }
        >
          {item.count}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Divulgation des registres de domaine non nourris. Le libellé est
 * volontairement neutre : on n'affirme pas qu'ils ne concernent pas
 * l'établissement, on dit seulement qu'ils sont vides.
 */
function Divulgation({
  items,
  actif,
}: {
  items: NavItem[];
  actif: SidebarItemId;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        className={
          CLASSES_ITEM +
          " text-[12.5px] text-white/45 hover:bg-white/10 hover:text-white"
        }
      >
        <ChevronDown
          aria-hidden
          className={
            "size-4 transition-transform " + (ouvert ? "" : "-rotate-90")
          }
        />
        <span className="flex-1 truncate text-left">
          Autres registres ({items.length})
        </span>
      </button>
      {ouvert
        ? items.map((it) => <NavLink key={it.id} item={it} actif={actif} />)
        : null}
    </>
  );
}
