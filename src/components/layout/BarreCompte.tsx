"use client";

// La barre de compte — en haut à droite du shell d'établissement.
//
// **Pourquoi elle existe.** La règle qui régit la cohabitation d'une sidebar
// et d'une barre haute est un partage des rôles, pas un remplissage : la
// sidebar porte la **hiérarchie de navigation du produit**, la barre haute
// porte les **utilitaires globaux** — retour à l'accueil, compte, session.
// Tant que le compte vivait en pied de rail, la barre n'aurait rien eu à
// porter et aurait été une bande vide ; c'est ce déménagement qui la
// justifie.
//
// **Ce qu'elle ne porte pas, et pourquoi.** Ni recherche ni notifications :
// le produit n'en a pas, et poser une loupe morte serait pire que rien. Ni
// sélecteur d'établissement : `Etablissement.entrepriseId` est `@unique`, une
// entreprise en a exactement un, il n'y a rien à commuter.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HelpCircle, Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";

export function BarreCompte({
  etablissementId,
  email,
}: {
  etablissementId: string;
  email: string | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const declencheur = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur et à Échap — un menu qu'on ne peut fermer
  // qu'en rouvrant son déclencheur est un piège, au clavier comme à la
  // souris.
  useEffect(() => {
    if (!ouvert) return;
    const auClic = (e: MouseEvent) => {
      if (!zone.current?.contains(e.target as Node)) setOuvert(false);
    };
    const auClavier = (e: KeyboardEvent) => {
      // Échap rend le focus au déclencheur : sans ça, le menu se fermait et
      // le focus restait sur un élément disparu — la tabulation suivante
      // repartait du haut du document.
      if (e.key === "Escape") {
        setOuvert(false);
        declencheur.current?.focus();
      }
    };
    document.addEventListener("mousedown", auClic);
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("mousedown", auClic);
      document.removeEventListener("keydown", auClavier);
    };
  }, [ouvert]);

  // Le focus entre dans le menu à l'ouverture, sur sa première commande :
  // un menu qu'on ouvre au clavier et qu'il faut ensuite chercher à la
  // tabulation n'est pas ouvert, il est seulement affiché.
  useEffect(() => {
    if (!ouvert) return;
    menu.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
      ?.focus();
  }, [ouvert]);

  const initiales = (email ?? "??").slice(0, 2).toUpperCase();

  return (
    // 67 px : la hauteur du bloc de marque du rail, filet compris. Les deux
    // traits se rejoignent donc au même pixel, et la barre se lit comme le
    // prolongement de l'en-tête de la sidebar plutôt que comme un objet posé
    // à côté. Toute autre valeur fabrique un décrochement visible sur toute
    // la largeur de l'écran.
    //
    // `flex-none` n'est pas décoratif : le conteneur de droite est un
    // `flex flex-col` de hauteur contrainte (`h-screen`), et en colonne
    // `flex-shrink` vaut 1 par défaut et porte sur la **hauteur**. Sans lui,
    // la barre est écrasée à la taille de son contenu et sa hauteur déclarée
    // n'a aucun effet, quelle que soit la valeur.
    <div className="flex h-[67px] flex-none items-center justify-end border-b border-[color:var(--rule-soft)] bg-[color:var(--paper)] px-[var(--board-gutter)]">
      {/* La gélule : le lieu où l'on revient, et celui à qui l'on revient.
          Les deux sont des repères de session — les séparer les ferait lire
          comme deux fonctions sans rapport. */}
      <div ref={zone} className="relative">
        <div className="flex items-center gap-2 rounded-full bg-[color:var(--board-slate-pale)] p-1.5 ring-1 ring-inset ring-[color:rgba(13,18,36,.06)]">
          <Link
            href={`/etablissements/${etablissementId}`}
            aria-label="Retour au tableau de bord"
            title="Tableau de bord"
            className="grid size-9 place-items-center rounded-full text-[color:var(--board-slate-mid)] transition-[background-color,color,transform] duration-150 hover:bg-[color:var(--board-card)] hover:text-[color:var(--board-ink)] hover:shadow-[0_1px_2px_rgba(13,18,36,.06)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--board-ink)]"
          >
            <Home aria-hidden className="size-[17px]" />
          </Link>

          {/* Le filet qui les sépare : sans lui, deux ronds accolés dans une
              gélule se lisent comme un seul contrôle à deux états. */}
          <span
            aria-hidden
            className="h-[15px] w-px flex-none bg-[color:rgba(13,18,36,.16)]"
          />

          {/* L'avatar est le second bouton de la gélule, pas une pastille
              posée à côté : c'est lui qui ouvre le compte, la déconnexion
              vit dans son menu. */}
          <button
            ref={declencheur}
            type="button"
            onClick={() => setOuvert((v) => !v)}
            aria-expanded={ouvert}
            aria-haspopup="menu"
            aria-label="Compte"
            className="group grid size-9 place-items-center rounded-full transition-transform duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--board-ink)]"
          >
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full bg-[color:var(--board-ink)] indent-[0.08em] font-mono text-[11px] font-medium leading-none tracking-[0.08em] text-white transition-opacity duration-150 group-hover:opacity-90"
            >
              {initiales}
            </span>
          </button>
        </div>

        {ouvert ? (
          <div
            ref={menu}
            role="menu"
            aria-label="Compte"
            className="absolute right-0 top-[52px] min-w-[228px] rounded-[18px] bg-[color:var(--board-card)] p-2 shadow-[0_0_0_1px_rgba(13,18,36,.08),0_18px_40px_-20px_rgba(13,18,36,.35)]"
          >
            {/* L'en-tête est un `group` étiqueté, pas deux paragraphes nus :
                un `role="menu"` ne contient que des `menuitem` et des
                groupes, et un lecteur d'écran annonçait sinon une structure
                qu'il ne sait pas parcourir. */}
            <div role="group" aria-label="Compte connecté">
              <p className="px-3 pb-1.5 pt-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[color:var(--board-slate-soft)]">
                Compte
              </p>
              <p className="truncate px-3 pb-2 text-[13px] font-medium text-[color:var(--board-ink)]">
                {email ?? "Utilisateur"}
              </p>
            </div>

            {/* Une commande à venir se déclare désactivée, pas absente : un
                `span aria-disabled` n'est ni annoncé ni atteignable, alors
                qu'il a l'allure d'une commande. */}
            <button
              type="button"
              role="menuitem"
              disabled
              className="flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-left text-[13px] text-[color:var(--board-slate-soft)] disabled:cursor-not-allowed"
            >
              <HelpCircle aria-hidden className="size-4 opacity-70" />
              <span className="flex-1 truncate">Aide</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
                bientôt
              </span>
            </button>

            {email != null ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-left text-[13px] text-[color:var(--board-slate-ink)] transition-colors hover:bg-[color:var(--board-slate-pale)] hover:text-[color:var(--board-ink)]"
                >
                  <LogOut aria-hidden className="size-4 opacity-90" />
                  <span className="flex-1 truncate">Déconnexion</span>
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
