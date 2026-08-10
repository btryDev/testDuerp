"use client";

// Réinitialisation du mot de passe. Deux formes de lien atterrissent ici :
// - flux PKCE (resetPasswordForEmail depuis l'app) : ?code=… — le client
//   browser échange le code contre une session à l'initialisation ;
// - flux implicite (lien envoyé manuellement depuis le dashboard Supabase) :
//   #access_token=…&type=recovery — détecté via detectSessionInUrl.
// Dans les deux cas la session finit dans les cookies (@supabase/ssr), puis
// updateUser({ password }) pose le nouveau mot de passe.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Lien expiré ou déjà utilisé : Supabase renvoie l'erreur dans le hash.
    if (/error/.test(window.location.hash)) {
      // Lecture client-only (hash d'URL) : impossible au premier rendu SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("invalid");
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setStatus("ready");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });
    // Si aucune session n'apparaît (lien invalide, autre navigateur pour un
    // lien PKCE…), on bascule en erreur plutôt que d'attendre indéfiniment.
    const timer = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 5000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [supabase]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas");
      return;
    }

    setPending(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setPending(false);
      setError(
        updateError.message === "New password should be different from the old password."
          ? "Le nouveau mot de passe doit être différent de l'ancien"
          : "Impossible de mettre à jour le mot de passe. Redemandez un lien.",
      );
      return;
    }
    // Session déjà posée dans les cookies : navigation complète pour que le
    // middleware et les Server Components la voient.
    window.location.assign("/entreprises");
  }

  if (status === "checking") {
    return (
      <p className="text-[0.82rem] text-muted-foreground">
        Vérification du lien…
      </p>
    );
  }

  if (status === "invalid") {
    return (
      <div className="space-y-5">
        <p className="rounded-md border border-dashed border-rule bg-paper-elevated px-4 py-3 text-[0.82rem] leading-[1.5] text-ink/80">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link
          href="/login/mot-de-passe-oublie"
          className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
        >
          Redemander un lien →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          Nouveau mot de passe
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm" className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          Confirmer le mot de passe
        </Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      {error ? (
        <p className="text-[0.82rem] text-[color:var(--minium)]">{error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Mise à jour…" : "Définir le mot de passe →"}
      </Button>
    </form>
  );
}
