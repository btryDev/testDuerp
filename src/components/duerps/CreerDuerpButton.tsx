"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { creerDuerp } from "@/lib/duerps/actions";

export function CreerDuerpButton({
  entrepriseId,
  variant = "default",
}: {
  entrepriseId: string;
  variant?: "default" | "outline";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await creerDuerp(entrepriseId);
        });
      }}
    >
      {pending ? "Création…" : "Créer un DUERP"}
    </Button>
  );
}
