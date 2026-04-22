import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth/require-user";
import { signOutAction } from "@/lib/auth/actions";

/**
 * Header global persistant — visible sur toutes les pages.
 * Minimal, cohérent avec l'esthétique papier/cartouche de l'app.
 * Server component : lit la session Supabase pour afficher l'email + logout
 * quand l'utilisateur est connecté, ou les liens de connexion sinon.
 */
export async function AppHeader() {
  const user = await getOptionalUser();

  return (
    <header className="sticky top-0 z-30 border-b border-dashed border-rule/60 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3 sm:px-10">
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

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/entreprises"
                className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-ink"
              >
                Mes entreprises →
              </Link>
              <span
                className="hidden max-w-[220px] truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline"
                title={user.email ?? ""}
              >
                {user.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground underline decoration-rule decoration-dotted underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ size: "sm" })}
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
