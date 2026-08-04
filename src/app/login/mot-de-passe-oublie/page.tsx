import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié — Conformité santé-sécurité",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[480px] flex-col justify-center px-6 py-20 sm:px-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
        §&nbsp;Mot de passe oublié
      </p>
      <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        Recevez un lien de
        <br />
        <span className="accent-serif text-[color:var(--warm)]">réinitialisation</span>
        <span className="text-ink">.</span>
      </h1>

      <div className="mt-10">
        <ForgotPasswordForm />
      </div>

      <p className="mt-10 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        <Link
          href="/login"
          className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
        >
          ← Retour à la connexion
        </Link>
      </p>
    </main>
  );
}
