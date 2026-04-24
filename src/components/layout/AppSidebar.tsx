"use client";

// Sidebar persistante (248px) pour le shell d'app — refonte V2.
// Brand carré navy + libellé stacké · bloc contexte établissement ·
// nav groupée par sections (Suivi, Référentiel, Administration) avec
// kickers mono · user chip en pied. Mockup « Tableau de bord V2.html ».
//
// L'item actif peut être passé en prop (back-compat) ou, quand la prop
// est omise, déduit automatiquement depuis le `pathname` courant. Cela
// permet de monter la sidebar depuis le layout sans que chaque page ait
// à passer explicitement son id de section.

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Accessibility,
  Flame,
  HandshakeIcon,
  Droplets,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";

export type SidebarActive =
  | "tableau"
  | "equipements"
  | "calendrier"
  | "registre"
  | "actions"
  | "prestataires"
  | "accessibilite"
  | "permis-feu"
  | "plan-prevention"
  | "carnet-sanitaire"
  | "interventions"
  | "controle"
  | "duerp"
  | "guide";

type Counts = Partial<
  Record<Exclude<SidebarActive, "tableau" | "duerp" | "registre">, number>
> & {
  verificationsEnRetard?: number;
  prestatairesAlertes?: number;
  risquesAReevaluer?: number;
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

function deduireActif(pathname: string, etablissementId: string): SidebarActive {
  const base = `/etablissements/${etablissementId}`;
  if (pathname === base || pathname === `${base}/modifier`) return "tableau";
  if (pathname.startsWith(`${base}/calendrier`)) return "calendrier";
  if (pathname.startsWith(`${base}/verifications`)) return "calendrier";
  if (pathname.startsWith(`${base}/actions`)) return "actions";
  if (pathname.startsWith(`${base}/registre`)) return "registre";
  if (pathname.startsWith(`${base}/equipements`)) return "equipements";
  if (pathname.startsWith(`${base}/prestataires`)) return "prestataires";
  if (pathname.startsWith(`${base}/accessibilite`)) return "accessibilite";
  if (pathname.startsWith(`${base}/permis-feu`)) return "permis-feu";
  if (pathname.startsWith(`${base}/plan-prevention`)) return "plan-prevention";
  if (pathname.startsWith(`${base}/carnet-sanitaire`)) return "carnet-sanitaire";
  if (pathname.startsWith(`${base}/interventions`)) return "interventions";
  if (pathname.startsWith(`${base}/controle`)) return "controle";
  if (pathname.startsWith(`${base}/duerp`)) return "duerp";
  if (pathname.startsWith(`${base}/guide`)) return "guide";
  return "tableau";
}

export function AppSidebar({
  etablissement,
  active,
  counts,
  user,
}: {
  etablissement: Etablissement;
  /** Item actif. Si omis, déduit automatiquement depuis `usePathname()`. */
  active?: SidebarActive;
  counts?: Counts;
  user?: User | null;
}) {
  const pathname = usePathname();
  const actif: SidebarActive =
    active ?? deduireActif(pathname ?? "", etablissement.id);

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
          id: "interventions",
          label: "Interventions",
          href: `/etablissements/${etablissement.id}/interventions`,
          Icon: Ticket,
        },
        {
          id: "registre",
          label: "Registre",
          href: `/etablissements/${etablissement.id}/registre`,
          Icon: FileText,
        },
        {
          id: "controle",
          label: "Préparer un contrôle",
          href: `/etablissements/${etablissement.id}/controle`,
          Icon: ShieldCheck,
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
          id: "prestataires",
          label: "Prestataires",
          href: `/etablissements/${etablissement.id}/prestataires`,
          Icon: Users,
          count: counts?.prestatairesAlertes,
          alert: (counts?.prestatairesAlertes ?? 0) > 0,
        },
        {
          id: "accessibilite",
          label: "Accessibilité",
          href: `/etablissements/${etablissement.id}/accessibilite`,
          Icon: Accessibility,
        },
        {
          id: "permis-feu",
          label: "Permis de feu",
          href: `/etablissements/${etablissement.id}/permis-feu`,
          Icon: Flame,
        },
        {
          id: "plan-prevention",
          label: "Plans de prévention",
          href: `/etablissements/${etablissement.id}/plan-prevention`,
          Icon: HandshakeIcon,
        },
        {
          id: "carnet-sanitaire",
          label: "Carnet sanitaire",
          href: `/etablissements/${etablissement.id}/carnet-sanitaire`,
          Icon: Droplets,
        },
        {
          id: "duerp",
          label: "DUERP",
          href: `/etablissements/${etablissement.id}/duerp`,
          Icon: FileCheck2,
          count: counts?.risquesAReevaluer,
          alert: (counts?.risquesAReevaluer ?? 0) > 0,
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

  const initialUser = (user?.email ?? "??").slice(0, 2).toUpperCase();

  return (
    <aside
      className="flex h-screen w-[248px] flex-col border-r border-rule-soft bg-paper-elevated"
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

      {/* Nav groupée — le contexte établissement est rendu dans la card
          sticky du dashboard, et dans les crumbs des autres pages. */}
      <nav className="min-h-0 flex-1 overflow-auto px-2.5 pb-2">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="px-3 pb-1.5 pt-[18px] font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {sec.title}
            </p>
            {sec.items.map((it) => {
              const isActive = it.id === actif;
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
