"use client";

// Sidebar persistante (248px) pour le shell d'app — cf. HANDOFF Direction B.
// Contexte établissement + navigation des modules + footer paramètres/user.
// Client component pour le highlight de l'item actif et le lien "Changer".

import Link from "next/link";
import {
  LayoutDashboard,
  Wrench,
  Calendar,
  FileText,
  ListChecks,
  FileCheck2,
  Compass,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";

export type SidebarActive =
  | "tableau"
  | "equipements"
  | "calendrier"
  | "registre"
  | "actions"
  | "duerp"
  | "guide";

type Counts = Partial<
  Record<Exclude<SidebarActive, "tableau" | "duerp" | "registre">, number>
> & {
  verificationsEnRetard?: number;
};

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
  user,
}: {
  etablissement: Etablissement;
  active: SidebarActive;
  counts?: Counts;
  user?: User | null;
}) {
  const items: {
    id: SidebarActive;
    label: string;
    href: string;
    Icon: typeof LayoutDashboard;
    count?: number;
    alert?: boolean;
  }[] = [
    {
      id: "tableau",
      label: "Tableau de bord",
      href: `/etablissements/${etablissement.id}`,
      Icon: LayoutDashboard,
    },
    {
      id: "equipements",
      label: "Équipements",
      href: `/etablissements/${etablissement.id}/equipements`,
      Icon: Wrench,
      count: counts?.equipements,
    },
    {
      id: "calendrier",
      label: "Calendrier",
      href: `/etablissements/${etablissement.id}/calendrier`,
      Icon: Calendar,
      count: counts?.verificationsEnRetard,
      alert: (counts?.verificationsEnRetard ?? 0) > 0,
    },
    {
      id: "registre",
      label: "Registre",
      href: `/etablissements/${etablissement.id}/registre`,
      Icon: FileText,
    },
    {
      id: "actions",
      label: "Plan d'actions",
      href: `/etablissements/${etablissement.id}/actions`,
      Icon: ListChecks,
      count: counts?.actions,
    },
    {
      id: "duerp",
      label: "DUERP",
      href: `/etablissements/${etablissement.id}`,
      Icon: FileCheck2,
    },
    {
      id: "guide",
      label: "Comprendre",
      href: `/etablissements/${etablissement.id}/guide`,
      Icon: Compass,
    },
  ];

  const ville = extraireVille(etablissement.adresse);
  const initiale = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <aside
      className="sticky top-0 flex h-screen w-[248px] flex-col gap-5 border-r border-rule-soft bg-paper-elevated px-4 py-6"
      aria-label="Navigation principale"
    >
      {/* Brand */}
      <div className="flex items-center gap-1.5 border-b border-rule-soft pb-4 pl-2 text-[1.02rem] font-semibold tracking-[-0.02em] text-[color:var(--accent-vif)]">
        <span className="size-2 rounded-full bg-[color:var(--accent-vif)]" />
        DUERP<span className="text-ink">.fr</span>
      </div>

      {/* Contexte établissement */}
      <div className="rounded-lg bg-paper-sunk p-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
          Établissement
        </p>
        <Link
          href={`/etablissements/${etablissement.id}/modifier`}
          className="mt-1.5 block truncate text-[0.95rem] font-semibold tracking-[-0.01em] hover:underline"
        >
          {etablissement.raisonDisplay}
        </Link>
        <p className="mt-0.5 truncate text-[0.76rem] text-muted-foreground">
          {ville} · {etablissement.effectifSurSite} salarié
          {etablissement.effectifSurSite > 1 ? "s" : ""}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <Link
              key={it.id}
              href={it.href}
              aria-current={isActive ? "page" : undefined}
              className={
                "grid grid-cols-[22px_1fr_auto] items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.88rem] transition-colors " +
                (isActive
                  ? "bg-[color:var(--accent-vif-soft)] font-medium text-[color:var(--accent-vif)]"
                  : "text-ink/75 hover:bg-paper-sunk hover:text-ink")
              }
            >
              <it.Icon aria-hidden className="size-4 opacity-90" />
              <span className="truncate">{it.label}</span>
              {typeof it.count === "number" && it.count > 0 ? (
                <span
                  className={
                    "rounded-full px-1.5 py-px text-[0.66rem] font-semibold " +
                    (it.alert
                      ? "bg-[color:color-mix(in_oklch,var(--minium)_15%,transparent)] text-[color:var(--minium)]"
                      : "bg-paper-sunk text-muted-foreground")
                  }
                >
                  {it.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-1 border-t border-rule-soft pt-3">
        <a
          href="#"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[0.82rem] text-ink/75 transition-colors hover:bg-paper-sunk hover:text-ink"
        >
          <Settings aria-hidden className="size-3.5" /> Paramètres
        </a>
        <a
          href="#"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[0.82rem] text-ink/75 transition-colors hover:bg-paper-sunk hover:text-ink"
        >
          <HelpCircle aria-hidden className="size-3.5" /> Aide
        </a>
        {user ? (
          <div className="mt-1.5 flex items-center gap-2.5 rounded-md bg-paper-sunk px-2.5 py-2">
            <div
              aria-hidden
              className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent-vif)] to-[color:var(--warm)] text-[0.76rem] font-semibold text-paper-elevated"
            >
              {initiale}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8rem] font-medium">
                {user.email ?? "Utilisateur"}
              </p>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-muted-foreground transition-colors hover:text-ink"
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

// L'adresse est stockée au format « Rue, 75000 Ville » (cf. onboarding).
// On extrait la partie ville pour le libellé compact de la sidebar.
function extraireVille(adresse: string): string {
  const parts = adresse.split(",");
  const lastPart = parts[parts.length - 1]?.trim() ?? "";
  // Format attendu : "75000 Ville" — on enlève le CP s'il est présent
  const m = /^\d{5}\s+(.+)$/.exec(lastPart);
  return m ? m[1] : lastPart || adresse;
}
