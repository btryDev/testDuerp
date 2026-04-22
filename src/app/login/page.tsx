import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Connexion — Conformité santé-sécurité",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirmed?: string }>;
}) {
  const { next, confirmed } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[480px] flex-col justify-center px-6 py-20 sm:px-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
        §&nbsp;Connexion
      </p>
      <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        Reprenez votre
        <br />
        <span className="accent-serif text-[color:var(--warm)]">dossier</span>
        <span className="text-ink">.</span>
      </h1>

      {confirmed === "1" ? (
        <p className="mt-6 rounded-md border border-dashed border-rule bg-paper-elevated px-4 py-3 text-[0.82rem] leading-[1.5] text-ink/80">
          E-mail confirmé. Vous pouvez vous connecter.
        </p>
      ) : null}

      <div className="mt-10">
        <LoginForm next={next ?? "/entreprises"} />
      </div>

      <p className="mt-10 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        Pas de compte ?{" "}
        <Link
          href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
        >
          Créer un compte →
        </Link>
      </p>
    </main>
  );
}
