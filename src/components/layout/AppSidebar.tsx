"use client";

// Sidebar persistante (248px) pour le shell d'app — refonte V2.
// Brand carré navy + libellé stacké · bloc contexte établissement ·
// nav groupée par sections (Suivi, Référentiel, Administration) avec
// kickers mono · user chip en pied. Mockup « Tableau de bord V2.html ».

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
  Users,
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

type NavItem = {
  id: SidebarActive | "fiche" | "equipe";
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
  count?: number;
  alert?: boolean;
};

type NavSection = { title: string; items: NavItem[] };

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
  const sections: NavSection[] = [
    {
      title: "Suivi",
      items: [
        {
          id: "tableau",
          label: "Tableau de bord",
          href: `/etablissements/${etablissement.id}`,
          Icon: LayoutDashboard,
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
          id: "actions",
          label: "Plan d'actions",
          href: `/etablissements/${etablissement.id}/actions`,
          Icon: ListChecks,
          count: counts?.actions,
        },
        {
          id: "registre",
          label: "Registre",
          href: `/etablissements/${etablissement.id}/registre`,
          Icon: FileText,
        },
      ],
    },
    {
      title: "Référentiel",
      items: [
        {
          id: "equipements",
          label: "Équipements",
          href: `/etablissements/${etablissement.id}/equipements`,
          Icon: Wrench,
          count: counts?.equipements,
        },
        {
          id: "duerp",
          label: "DUERP",
          href: `/etablissements/${etablissement.id}`,
          Icon: FileCheck2,
        },
        {
          id: "guide",
          label: "Guide",
          href: `/etablissements/${etablissement.id}/guide`,
          Icon: Compass,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          id: "fiche",
          label: "Fiche établissement",
          href: `/etablissements/${etablissement.id}/modifier`,
          Icon: Settings,
        },
        {
          id: "equipe",
          label: "Équipe",
          href: "#",
          Icon: Users,
        },
      ],
    },
  ];

  const ville = extraireVille(etablissement.adresse);
  const initialUser = (user?.email ?? "??").slice(0, 2).toUpperCase();

  return (
    <aside
      className="sticky top-0 flex h-screen w-[248px] flex-col border-r border-rule-soft bg-paper-elevated"
      aria-label="Navigation principale"
    >
      {/* Brand : marque abstraite (cible) + nom en serif italique éditorial */}
      <div className="flex items-center gap-2.5 px-4 pb-[14px] pt-[18px]">
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          aria-hidden
          className="shrink-0"
        >
          <circle cx="13" cy="13" r="11" stroke="var(--navy)" strokeWidth="1" opacity="0.3" />
          <circle cx="13" cy="13" r="6.5" stroke="var(--navy)" strokeWidth="1.1" opacity="0.7" />
          <circle cx="13" cy="13" r="2.4" fill="var(--navy)" />
        </svg>
        <p className="text-[17px] font-semibold leading-none tracking-[-0.025em] text-ink">
          Pilote
        </p>
      </div>

      {/* Contexte établissement */}
      <div className="px-3 pb-1.5">
        <div className="rounded-xl bg-paper-sunk p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Établissement
          </p>
          <Link
            href={`/etablissements/${etablissement.id}/modifier`}
            className="mt-1 block truncate text-[13.5px] font-medium leading-[1.25] hover:underline"
          >
            {etablissement.raisonDisplay}
          </Link>
          <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {ville} · Eff. {etablissement.effectifSurSite}
          </p>
        </div>
      </div>

      {/* Nav groupée */}
      <nav className="min-h-0 flex-1 overflow-auto px-2.5 pb-2">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="px-3 pb-1.5 pt-[18px] font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {sec.title}
            </p>
            {sec.items.map((it) => {
              const isActive = it.id === active;
              return (
                <Link
                  key={it.id}
                  href={it.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    "flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13.5px] transition-colors " +
                    (isActive
                      ? "bg-[color:var(--navy)] font-medium text-white"
                      : "text-ink/75 hover:bg-paper-sunk hover:text-ink")
                  }
                >
                  <it.Icon aria-hidden className="size-4 opacity-90" />
                  <span className="flex-1 truncate">{it.label}</span>
                  {typeof it.count === "number" && it.count > 0 ? (
                    <span
                      className={
                        "rounded-full px-[7px] py-px font-mono text-[11px] " +
                        (isActive
                          ? "bg-white/15 text-white"
                          : it.alert
                            ? "bg-[color:var(--alert-soft)] text-[color:var(--alert)]"
                            : "bg-paper-sunk text-muted-foreground")
                      }
                    >
                      {it.count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer : aide + user chip */}
      <div className="flex flex-col gap-1 border-t border-rule-soft px-3 py-3">
        <a
          href="#"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-ink/75 transition-colors hover:bg-paper-sunk hover:text-ink"
        >
          <HelpCircle aria-hidden className="size-3.5" /> Aide
        </a>
        {user ? (
          <div className="mt-0.5 flex items-center gap-2.5 px-1 py-1.5">
            <div
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-[color:var(--green-dash-soft)] font-mono text-[12px] font-semibold text-[color:var(--green-dash)]"
            >
              {initialUser}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium">
                {user.email ?? "Utilisateur"}
              </p>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground transition-colors hover:text-ink"
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
