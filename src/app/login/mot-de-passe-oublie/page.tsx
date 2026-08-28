import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié — Rojer",
};

export default function ForgotPasswordPage() {
  return (
    // Même enveloppe que /login : colonne étroite centrée sur le canvas. Cf.
    // le commentaire de `login/page.tsx` sur `mx-auto max-w-*`.
    <main className="flex min-h-[calc(100vh-56px)] flex-col justify-center bg-[color:var(--board-canvas)] px-6 py-14 sm:px-10">
      <div className="mx-auto w-full max-w-[460px]">
        <p className="board-eyebrow m-0 text-[10.5px] tracking-[0.18em] text-[color:var(--board-slate-soft)]">
          Mot de passe oublié
        </p>
        <h1 className="board-titre m-0 mt-3 text-[clamp(29px,3vw,39px)]">
          Recevez un lien de réinitialisation.
        </h1>

        <div className="carte-board mt-7 px-7 py-6 sm:px-8">
          <ForgotPasswordForm />
        </div>

        <p className="m-0 mt-6 text-[13px] leading-[1.55] text-[color:var(--board-slate-mid)]">
          <Link
            href="/login"
            className="font-semibold text-[color:var(--board-blue-ink)] underline decoration-[color:var(--board-blue-soft)] underline-offset-4 transition-colors hover:decoration-[color:var(--board-blue-ink)]"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
