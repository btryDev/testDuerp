"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { creerDuerp } from "@/lib/duerps/actions";

export function CreerDuerpButton({
  etablissementId,
  variant = "default",
}: {
  etablissementId: string;
  variant?: "default" | "outline";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await creerDuerp(etablissementId);
        });
      }}
    >
      {pending ? "Création…" : "Créer un DUERP"}
    </Button>
  );
}
