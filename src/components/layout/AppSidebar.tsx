"use client";

// Double sidebar persistante pour le shell d'app.
//
// Deux niveaux accolés, tous deux sur l'encre (#0A0A0A) du design Rojer :
//
//   1. Le rail (88px) porte les entrées de premier niveau — « Tableau de
//      bord », « À faire », « Mon établissement », « Mes registres », puis
//      « Comprendre » et « Connecter », et « Compte » en pied. Icône +
//      libellé, pastille signal quand la catégorie contient une alerte.
//
//   2. Le panneau (224px) affiche les items de la catégorie choisie, avec
//      les mêmes pilules qu'avant (actif = pilule blanche pleine).
//
// Toute entrée de rail est un lien (ADR-015) : cliquer navigue vers la page
// d'entrée de la catégorie **et** ouvre son panneau. Auparavant une icône de
// premier niveau n'ouvrait qu'un tiroir, et il fallait deux clics pour
// arriver quelque part.
//
// Le panneau suit la page courante : à chaque navigation il se rabat sur la
// catégorie de l'item actif. Entre deux navigations, un clic sur le rail le
// fait basculer sans quitter la page — d'où la distinction entre « la page
// est ici » (tuile allumée) et « le panneau montre ceci ». Sur une catégorie
// sans panneau (Tableau de bord, Comprendre, Connecter), le panneau
// s'efface : montrer celui de « À faire », sans rien y surligner, décrivait
// un endroit où l'on n'est pas — et le board de widgets récupère la
// largeur.
//
// Le panneau est rétractable, et replié par défaut : un bouton en pied de
// rail — ou un clic sur une entrée du rail — le déplie, un bouton dans son
// en-tête le replie. Le choix est mémorisé dans localStorage.
//
// L'arborescence vit dans `sidebar-nav.ts` (module pur, testé) : mêmes
// items, mêmes badges que le rail simple qu'elle remplace. Ce fichier ne
// fait que le rendu.

import { Fragment, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import {
  categorieDeItem,
  construireRail,
  deduireActif,
  type NavItem,
  type RailCategorie,
  type RailCategorieId,
  type SidebarActive,
  type SidebarCounts,
  type SidebarItemId,
  type SidebarModules,
} from "./sidebar-nav";

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
  modules,
  user,
}: {
  etablissement: Etablissement;
  /** Item actif. Si omis, déduit automatiquement depuis `usePathname()`. */
  active?: SidebarActive;
  counts?: SidebarCounts;
  /** État des registres pour cet établissement. Omis, aucun n'est qualifié. */
  modules?: SidebarModules;
  user?: User | null;
}) {
  const pathname = usePathname();
  // Le calendrier sert deux entrées du panneau selon `?famille=` : sans la
  // query, cliquer « Contrôles matériel » surlignerait « Tout ».
  const searchParams = useSearchParams();
  const actif: SidebarItemId =
    active ?? deduireActif(pathname ?? "", etablissement.id, searchParams);

  const rail = construireRail({
    etablissementId: etablissement.id,
    counts,
    modules,
  });

  // Panneau affiché : le choix manuel prime, sinon la catégorie de la page
  // courante. Le choix se rabat à chaque navigation pour que le panneau
  // suive toujours l'endroit où l'on se trouve — ajustement pendant le
  // rendu (et non dans un effet) pour ne pas provoquer de rendu en cascade.
  const catActive = categorieDeItem(actif);
  // L'URL entière, query comprise : passer de « Tout » à « Contrôles
  // matériel » ne change pas le pathname, mais c'est bien une navigation —
  // sans quoi un panneau choisi à la main y survivrait.
  const urlCourante = `${pathname}?${searchParams}`;
  const [choix, setChoix] = useState<RailCategorieId | null>(null);
  const [derniereUrl, setDerniereUrl] = useState(urlCourante);
  if (urlCourante !== derniereUrl) {
    setDerniereUrl(urlCourante);
    setChoix(null);
  }
  const affichee = choix ?? catActive;

  // Repli du panneau, persisté dans localStorage. Le serveur rend toujours
  // replié (le défaut) ; le client se rattrape au premier rendu.
  const replie = useSyncExternalStore(sAbonnerRepli, lireRepli, () => true);
  const basculerRepli = ecrireRepli;

  const panneau = rail.find((c) => c.id === affichee && c.items) ?? null;
  // Rien à afficher à droite : la catégorie n'a pas de panneau et ce n'est
  // pas le compte, qui a le sien. Le rail reste seul.
  const sansPanneau = !panneau && affichee !== "compte";
  const ferme = replie || sansPanneau;

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
            <circle cx="13" cy="13" r="11" stroke="var(--board-sky)" strokeWidth="1" opacity="0.35" />
            <circle cx="13" cy="13" r="6.5" stroke="var(--board-sky)" strokeWidth="1.1" opacity="0.75" />
            <circle cx="13" cy="13" r="2.4" fill="var(--board-sky)" />
          </svg>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
          {/* Une seule boucle : une catégorie porte toujours un href, et
              certaines portent en plus un panneau. Deux passes filtrées
              rendraient les secondes en double. */}
          {rail.map((c) => (
            <Fragment key={c.id}>
              {c.separateurAvant ? (
                <div className="mx-3 my-2 border-t border-white/10" />
              ) : null}
              <RailEntree
                cat={c}
                surPage={catActive === c.id}
                // Le panneau ouvert à la main s'allume aussi : sans cela,
                // basculer de panneau sans naviguer n'aurait aucun écho.
                choisie={choix === c.id}
                onClick={() => {
                  setChoix(c.id);
                  basculerRepli(false);
                }}
              />
            </Fragment>
          ))}
        </nav>

        {/* Le bouton de dépliage ne s'offre que s'il y a quelque chose à
            déplier : sur le tableau de bord, il ouvrirait le vide. */}
        {replie && !sansPanneau ? (
          <div className="shrink-0 px-2 pb-1">
            <button
              type="button"
              onClick={() => basculerRepli(false)}
              aria-label="Déplier le panneau"
              aria-expanded={false}
              className="grid w-full place-items-center rounded-xl py-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <PanelLeftOpen aria-hidden className="size-[18px]" />
            </button>
          </div>
        ) : null}

        {/* Compte : cinquième entrée, en pied de rail */}
        <div className="shrink-0 border-t border-white/10 px-2 py-3">
          <button
            type="button"
            onClick={() => {
              setChoix("compte");
              basculerRepli(false);
            }}
            aria-pressed={affichee === "compte"}
            className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-white/10"
          >
            <span
              aria-hidden
              className={
                "grid size-8 place-items-center rounded-full font-mono text-[11px] font-semibold transition-colors " +
                (affichee === "compte"
                  ? "bg-white text-[color:var(--board-ink)]"
                  : "bg-[color:var(--board-sky)] text-[color:var(--board-blue-ink)]")
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
      <div
        inert={ferme}
        className={
          "shrink-0 overflow-hidden bg-white/[0.04] transition-[width] duration-200 " +
          (ferme ? "w-0" : "w-[224px]")
        }
      >
        {/* Largeur fixe interne : le contenu glisse sous le bord au lieu de
            se recomposer pendant l'animation de largeur. */}
        <div className="flex h-full w-[224px] flex-col">
          <div className="flex h-[67px] shrink-0 items-center justify-between border-b border-white/10 pl-5 pr-3">
            <p className="text-[17px] font-semibold leading-none tracking-[-0.025em] text-white">
              Rojer
            </p>
            <button
              type="button"
              onClick={() => basculerRepli(true)}
              aria-label="Replier le panneau"
              aria-expanded
              className="grid size-8 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <PanelLeftClose aria-hidden className="size-4" />
            </button>
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
            </nav>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

/** Entrée de rail ouvrant un panneau (pas de navigation). */
/**
 * Entrée de rail : toujours un lien, panneau ou pas (ADR-015).
 *
 * `Link` plutôt qu'un `router.push` dans un `button` : on garde le
 * prefetch, le clic du milieu, « ouvrir dans un nouvel onglet » et
 * l'annonce native du lien. Le `onClick` ne fait qu'ouvrir le panneau au
 * passage — la navigation, elle, se charge d'y rabattre le choix.
 */
function RailEntree({
  cat,
  surPage,
  choisie,
  onClick,
}: {
  cat: RailCategorie;
  /** La page courante appartient à cette catégorie. */
  surPage: boolean;
  /** Son panneau est ouvert par un clic, sans navigation. */
  choisie: boolean;
  onClick: () => void;
}) {
  const allume = surPage || choisie;
  return (
    <Link
      href={cat.href}
      onClick={onClick}
      // `aria-current` dit où l'on est ; l'ouverture d'un panneau n'est pas
      // un état de page et n'a pas à s'y ajouter.
      aria-current={surPage ? "page" : undefined}
      aria-label={cat.label}
      className="group flex w-full flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-white/10"
    >
      <TuileIcone cat={cat} pleine={allume} />
      <RailLibelle cat={cat} allume={allume} />
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

/**
 * Mini-store du repli du panneau : la vérité vit en mémoire de module (le
 * repli survit donc même sans localStorage, navigation privée par exemple),
 * localStorage n'est que la persistance entre sessions. Lu au premier accès,
 * consommé via `useSyncExternalStore` pour rester hydratation-sûr.
 */
const CLE_REPLI = "rojer-sidebar-panneau-replie";
let etatRepli = true;
let etatRepliLu = false;
const ecouteursRepli = new Set<() => void>();

function sAbonnerRepli(cb: () => void) {
  ecouteursRepli.add(cb);
  return () => ecouteursRepli.delete(cb);
}

function lireRepli() {
  if (!etatRepliLu) {
    etatRepliLu = true;
    try {
      // Replié par défaut : seul un « 0 » explicitement mémorisé déplie.
      etatRepli = window.localStorage.getItem(CLE_REPLI) !== "0";
    } catch {
      // Stockage inaccessible : on reste sur la valeur en mémoire.
    }
  }
  return etatRepli;
}

function ecrireRepli(v: boolean) {
  etatRepli = v;
  etatRepliLu = true;
  try {
    window.localStorage.setItem(CLE_REPLI, v ? "1" : "0");
  } catch {
    // Stockage inaccessible : le repli vaut pour la session en cours.
  }
  ecouteursRepli.forEach((cb) => cb());
}

const CLASSES_ITEM =
  "flex w-full items-center gap-3 rounded-full px-3.5 py-[10px] text-[13.5px] transition-colors";

/**
 * Étiquette d'un registre qui ne concerne pas (encore) l'établissement.
 *
 * « au besoin » plutôt que « à ouvrir » : l'entrée annonce une disponibilité,
 * elle ne réclame rien. Un dirigeant qui n'a pas de travaux par point chaud
 * n'a rien à faire de ce registre, et la sidebar ne doit pas lui inventer une
 * tâche — c'est le contraire de ce que promet « À faire ».
 */
const ETIQUETTE_ETAT: Record<string, string> = {
  "non-ouvert": "au besoin",
  "non-applicable": "non applicable",
};

function NavLink({ item, actif }: { item: NavItem; actif: SidebarItemId }) {
  const isActive = item.id === actif;
  // Un registre qualifié reste un lien : c'est par là qu'on l'ouvre le jour
  // venu, et la page « non applicable » explique et permet de corriger le
  // régime déclaré. Seule sa présentation s'efface.
  const etiquette =
    item.etat && item.etat !== "actif" ? ETIQUETTE_ETAT[item.etat] : null;

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
          : etiquette
            ? "text-white/35 hover:bg-white/10 hover:text-white/70"
            : "text-white/60 hover:bg-white/10 hover:text-white")
      }
    >
      <item.Icon
        aria-hidden
        className={"size-4 " + (etiquette && !isActive ? "opacity-50" : "opacity-90")}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {etiquette && !isActive ? (
        <span className="flex-none font-mono text-[9px] uppercase tracking-[0.1em]">
          {etiquette}
        </span>
      ) : null}
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
