import { headers } from "next/headers";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Créer un compte — Conformité santé-sécurité",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[480px] flex-col justify-center px-6 py-20 sm:px-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
        §&nbsp;Nouveau compte
      </p>
      <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        Ouvrez votre
        <br />
        <span className="accent-serif text-[color:var(--warm)]">dossier</span>
        <span className="text-ink">.</span>
      </h1>

      <p className="mt-6 max-w-[38ch] text-[0.9rem] leading-[1.6] text-ink/70">
        Vos données restent en Europe. Aucun paiement pendant la phase bêta.
      </p>

      <div className="mt-10">
        <SignupForm next={next ?? "/entreprises"} origin={origin} />
      </div>

      <p className="mt-10 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
        >
          Se connecter →
        </Link>
      </p>
    </main>
  );
}
