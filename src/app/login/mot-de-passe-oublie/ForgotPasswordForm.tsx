"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChampBoard } from "@/components/ui-kit";
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
    // Le message est volontairement le même que le compte existe ou non
    // (cf. l'action) : le registre calme du glacier le dit sans laisser
    // croire à un accusé de réception personnel.
    return (
      <p className="m-0 rounded-[18px] bg-[color:var(--board-blue-pale)] px-4 py-3 text-[13px] leading-[1.5] text-[color:var(--board-blue-ink)]">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="origin" value={origin} />

      <ChampBoard
        id="email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        required
        placeholder="vous@exemple.fr"
      />

      {state.error ? (
        <p className="m-0 rounded-[18px] bg-[color:var(--board-signal-wash)] px-4 py-3 text-[12.5px] leading-[1.5] text-[color:var(--board-signal-ink)]">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="board"
        size="board"
        disabled={pending}
        className="w-full"
      >
        {pending ? "Envoi…" : "Recevoir le lien →"}
      </Button>
    </form>
  );
}
