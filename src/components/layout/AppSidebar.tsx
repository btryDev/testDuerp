"use client";

// Double sidebar persistante pour le shell d'app.
//
// Deux niveaux accolés, tous deux sur l'encre (#0A0A0A) du design Rojer :
//
//   1. Le rail (88px) porte les cinq entrées de premier niveau — « À faire »,
//      « Mon établissement », « Mes registres », puis « Comprendre » (lien
//      direct) et « Compte » en pied. Icône + libellé, pastille signal quand
//      la catégorie contient une alerte.
//
//   2. Le panneau (224px) affiche les items de la catégorie choisie, avec
//      les mêmes pilules qu'avant (actif = pilule blanche pleine).
//
// Le panneau suit la page courante : à chaque navigation il se rabat sur la
// catégorie de l'item actif ; cliquer une entrée du rail le fait basculer
// sans naviguer. « Comprendre » n'a pas de panneau — quand on est sur le
// guide, le panneau montre « À faire » (la porte d'entrée par défaut).
//
// L'arborescence vit dans `sidebar-nav.ts` (module pur, testé) : mêmes
// items, mêmes règles de divulgation progressive, mêmes badges que le rail
// simple qu'elle remplace. Ce fichier ne fait que le rendu.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, HelpCircle, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import {
  categorieDeItem,
  construireRail,
  deduireActif,
  type NavItem,
  type ProfilRegistres,
  type RailCategorie,
  type RailCategorieId,
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

  const rail = construireRail({
    etablissementId: etablissement.id,
    counts,
    profil,
    actif,
  });

  // Panneau affiché : le choix manuel prime, sinon la catégorie de la page
  // courante. Le choix se rabat à chaque navigation pour que le panneau
  // suive toujours l'endroit où l'on se trouve — ajustement pendant le
  // rendu (et non dans un effet) pour ne pas provoquer de rendu en cascade.
  const catActive = categorieDeItem(actif);
  const [choix, setChoix] = useState<RailCategorieId | null>(null);
  const [dernierPathname, setDernierPathname] = useState(pathname);
  if (pathname !== dernierPathname) {
    setDernierPathname(pathname);
    setChoix(null);
  }
  const affichee = choix ?? catActive;

  const panneau =
    rail.find((c) => c.id === affichee && c.items) ??
    // « Comprendre » n'a pas de panneau → porte d'entrée par défaut.
    (affichee === "compte" ? null : rail[0]);

  const initialUser = (user?.email ?? "??").slice(0, 2).toUpperCase();

  return (
    <aside
      className="flex h-screen bg-[color:var(--board-ink)] text-white"
      aria-label="Navigation principale"
    >
      {/* ---- Rail : entrées de premier niveau ---- */}
      <div className="flex w-[88px] shrink-0 flex-col border-r border-white/10">
        {/* Marque abstraite (cible) — le nom vit en tête du panneau */}
        <div className="grid h-[67px] shrink-0 place-items-center border-b border-white/10">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
            <circle cx="13" cy="13" r="11" stroke="var(--board-canvas)" strokeWidth="1" opacity="0.35" />
            <circle cx="13" cy="13" r="6.5" stroke="var(--board-canvas)" strokeWidth="1.1" opacity="0.75" />
            <circle cx="13" cy="13" r="2.4" fill="var(--board-canvas)" />
          </svg>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
          {rail
            .filter((c) => c.items)
            .map((c) => (
              <RailBouton
                key={c.id}
                cat={c}
                courante={affichee === c.id}
                surPage={catActive === c.id}
                onClick={() => setChoix(c.id)}
              />
            ))}

          <div className="mx-3 my-2 border-t border-white/10" />

          {rail
            .filter((c) => c.href)
            .map((c) => (
              <RailLien key={c.id} cat={c} surPage={catActive === c.id} />
            ))}
        </nav>

        {/* Compte : cinquième entrée, en pied de rail */}
        <div className="shrink-0 border-t border-white/10 px-2 py-3">
          <button
            type="button"
            onClick={() => setChoix("compte")}
            aria-pressed={affichee === "compte"}
            className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-white/10"
          >
            <span
              aria-hidden
              className={
                "grid size-8 place-items-center rounded-full font-mono text-[11px] font-semibold transition-colors " +
                (affichee === "compte"
                  ? "bg-white text-[color:var(--board-ink)]"
                  : "bg-[color:var(--board-canvas)] text-[color:var(--board-blue-ink)]")
              }
            >
              {initialUser}
            </span>
            <span
              className={
                "text-[9px] leading-none tracking-[0.02em] " +
                (affichee === "compte" ? "text-white" : "text-white/50 group-hover:text-white")
              }
            >
              Compte
            </span>
          </button>
        </div>
      </div>

      {/* ---- Panneau : items de la catégorie choisie ---- */}
      <div className="flex w-[224px] shrink-0 flex-col bg-white/[0.04]">
        <div className="flex h-[67px] shrink-0 items-center border-b border-white/10 px-5">
          <p className="text-[17px] font-semibold leading-none tracking-[-0.025em] text-white">
            Pilote
          </p>
        </div>

        {affichee === "compte" ? (
          <PanneauCompte user={user} />
        ) : panneau ? (
          <nav
            aria-label={panneau.label}
            className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4"
          >
            <p className="px-4 pb-2 pt-[18px] font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {panneau.label}
            </p>
            {panneau.items?.map((it) => (
              <NavLink key={it.id} item={it} actif={actif} />
            ))}
            {panneau.repliables ? (
              <Divulgation items={panneau.repliables} actif={actif} />
            ) : null}
          </nav>
        ) : null}
      </div>
    </aside>
  );
}

/** Entrée de rail ouvrant un panneau (pas de navigation). */
function RailBouton({
  cat,
  courante,
  surPage,
  onClick,
}: {
  cat: RailCategorie;
  /** Le panneau affiché est celui de cette catégorie. */
  courante: boolean;
  /** La page courante appartient à cette catégorie. */
  surPage: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={courante}
      aria-label={cat.label}
      className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-white/10"
    >
      <TuileIcone cat={cat} pleine={courante || surPage} />
      <RailLibelle cat={cat} allume={courante || surPage} />
    </button>
  );
}

/** Entrée de rail en lien direct (catégorie sans panneau). */
function RailLien({ cat, surPage }: { cat: RailCategorie; surPage: boolean }) {
  return (
    <Link
      href={cat.href ?? "#"}
      aria-current={surPage ? "page" : undefined}
      className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-white/10"
    >
      <TuileIcone cat={cat} pleine={surPage} />
      <RailLibelle cat={cat} allume={surPage} />
    </Link>
  );
}

function TuileIcone({ cat, pleine }: { cat: RailCategorie; pleine: boolean }) {
  return (
    <span
      className={
        "relative grid size-9 place-items-center rounded-xl transition-colors " +
        (pleine
          ? "bg-white text-[color:var(--board-ink)]"
          : "text-white/60 group-hover:text-white")
      }
    >
      <cat.Icon aria-hidden className="size-[18px]" />
      {cat.alert ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[color:var(--board-signal-mark)] ring-2 ring-[color:var(--board-ink)]"
        />
      ) : null}
    </span>
  );
}

function RailLibelle({ cat, allume }: { cat: RailCategorie; allume: boolean }) {
  return (
    <span
      className={
        "max-w-full truncate px-0.5 text-[9px] leading-none tracking-[0.02em] " +
        (allume ? "text-white" : "text-white/50 group-hover:text-white")
      }
    >
      {cat.labelCourt}
    </span>
  );
}

/** Panneau « Compte » : identité, aide, déconnexion. */
function PanneauCompte({ user }: { user?: User | null }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-4">
      <p className="px-4 pb-2 pt-[18px] font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
        Compte
      </p>
      <p className="truncate px-4 pb-3 text-[12.5px] font-medium text-white">
        {user?.email ?? "Utilisateur"}
      </p>
      <span className={CLASSES_ITEM + " text-white/30"} aria-disabled>
        <HelpCircle aria-hidden className="size-4 opacity-70" />
        <span className="flex-1 truncate">Aide</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
          bientôt
        </span>
      </span>
      {user ? (
        <form action={signOutAction}>
          <button
            type="submit"
            className={
              CLASSES_ITEM +
              " text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            }
          >
            <LogOut aria-hidden className="size-4 opacity-90" />
            <span className="flex-1 truncate text-left">Déconnexion</span>
          </button>
        </form>
      ) : null}
    </div>
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
