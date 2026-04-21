import Link from "next/link";

/**
 * Header global persistant — visible sur toutes les pages.
 * Minimal, cohérent avec l'esthétique papier/cartouche de l'app.
 * Server component pur : pas de JS client, pas de hydration inutile.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-dashed border-rule/60 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink text-[0.6rem] font-bold uppercase tracking-widest text-paper">
            SS
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[0.88rem] font-semibold tracking-[-0.01em]">
              Conformité santé-sécurité
            </span>
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground">
              TPE / PME — plateforme continue
            </span>
          </span>
        </Link>

        <nav>
          <Link
            href="/entreprises"
            className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-ink"
          >
            Mes entreprises →
          </Link>
        </nav>
      </div>
    </header>
  );
}
