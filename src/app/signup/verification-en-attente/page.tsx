import Link from "next/link";

export const metadata = {
  title: "Vérifiez votre e-mail — Conformité santé-sécurité",
};

export default async function VerificationEnAttentePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[560px] flex-col justify-center px-6 py-20 sm:px-10">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
        §&nbsp;Dernière étape
      </p>
      <h1 className="mt-6 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        Vérifiez votre
        <br />
        <span className="accent-serif text-[color:var(--warm)]">
          boîte mail
        </span>
        <span className="text-ink">.</span>
      </h1>

      <div className="mt-10 rounded-lg border border-dashed border-rule bg-paper-elevated px-6 py-6">
        <div className="flex items-start gap-4">
          <PictoMail />
          <div className="min-w-0 flex-1">
            <p className="text-[0.95rem] leading-[1.55] text-ink">
              Un lien de confirmation a été envoyé à
              {email ? (
                <>
                  {" "}
                  <span className="break-all font-medium">{email}</span>
                </>
              ) : (
                " votre adresse"
              )}
              .
            </p>
            <p className="mt-3 text-[0.85rem] leading-[1.55] text-ink/70">
              Cliquez dessus pour activer votre compte, puis revenez vous
              connecter.
            </p>
          </div>
        </div>
      </div>

      <ol className="mt-10 space-y-5 border-t border-dashed border-rule/60 pt-8">
        <Etape
          romain="I"
          titre="Ouvrez le mail"
          corps='De la part de « Supabase Auth » — sujet « Confirm your signup ». Regardez dans vos spams au cas où.'
        />
        <Etape
          romain="II"
          titre="Cliquez sur le lien"
          corps="Vous serez redirigé·e automatiquement ici, connecté·e."
        />
        <Etape
          romain="III"
          titre="Ouvrez votre dossier"
          corps="Premier établissement, équipements, calendrier. 10 minutes."
        />
      </ol>

      <div className="mt-12 flex flex-wrap items-center gap-6">
        <Link
          href="/login"
          className="font-mono text-[0.64rem] uppercase tracking-[0.2em] text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
        >
          J'ai déjà cliqué · Me connecter →
        </Link>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
          Mail absent ?{" "}
          <Link
            href="/signup"
            className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
          >
            Réessayer
          </Link>
        </span>
      </div>
    </main>
  );
}

function Etape({
  romain,
  titre,
  corps,
}: {
  romain: string;
  titre: string;
  corps: string;
}) {
  return (
    <li className="flex gap-5">
      <span className="font-mono text-[1.2rem] font-medium leading-none text-[color:var(--warm)]">
        {romain}.
      </span>
      <div>
        <p className="text-[1rem] font-medium tracking-[-0.012em]">{titre}</p>
        <p className="mt-1 text-[0.85rem] leading-[1.55] text-ink/65">
          {corps}
        </p>
      </div>
    </li>
  );
}

function PictoMail() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0 text-ink">
      <rect
        x="6"
        y="10"
        width="28"
        height="20"
        rx="1.5"
        fill="var(--paper)"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M 6.5 11 L 20 22 L 33.5 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="11" r="4" fill="var(--warm)" />
    </svg>
  );
}
