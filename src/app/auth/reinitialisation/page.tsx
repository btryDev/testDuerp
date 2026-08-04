import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = {
  title: "Nouveau mot de passe — Conformité santé-sécurité",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[480px] flex-col justify-center px-6 py-20 sm:px-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
        §&nbsp;Réinitialisation
      </p>
      <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        Choisissez un nouveau
        <br />
        <span className="accent-serif text-[color:var(--warm)]">mot de passe</span>
        <span className="text-ink">.</span>
      </h1>

      <div className="mt-10">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
