"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function SignupForm({
  next,
  origin,
}: {
  next: string;
  origin: string;
}) {
  const [state, action, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
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

      <div className="space-y-2">
        <Label htmlFor="password" className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
          Mot de passe
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
          8 caractères minimum
        </p>
      </div>

      {state.error ? (
        <p className="text-[0.82rem] text-[color:var(--minium)]">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-md border border-dashed border-rule bg-paper-elevated px-4 py-3 text-[0.82rem] leading-[1.5] text-ink/80">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Création…" : "Créer mon compte →"}
      </Button>
    </form>
  );
}
