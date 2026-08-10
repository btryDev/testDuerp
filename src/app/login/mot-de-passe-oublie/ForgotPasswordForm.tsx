"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  // L'origine est lue côté client : le lien de l'e-mail doit revenir sur le
  // même environnement (localhost en dev, prod en prod).
  const [origin, setOrigin] = useState("");
  // Lecture client-only (window.location) : impossible au premier rendu SSR.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigin(window.location.origin), []);

  if (state.message) {
    return (
      <p className="rounded-md border border-dashed border-rule bg-paper-elevated px-4 py-3 text-[0.82rem] leading-[1.5] text-ink/80">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="origin" value={origin} />

      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.fr"
        />
      </div>

      {state.error ? (
        <p className="text-[0.82rem] text-[color:var(--minium)]">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Envoi…" : "Recevoir le lien →"}
      </Button>
    </form>
  );
}
