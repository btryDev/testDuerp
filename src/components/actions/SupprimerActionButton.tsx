"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supprimerActionPlan } from "@/lib/actions/plan";

export function SupprimerActionButton({
  id,
  redirectTo,
}: {
  id: string;
  redirectTo?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer définitivement cette action ?")) return;
        startTransition(async () => {
          await supprimerActionPlan(id);
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        });
      }}
    >
      {pending ? "Suppression…" : "Supprimer"}
    </Button>
  );
}
