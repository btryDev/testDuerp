"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { validerTransverses } from "@/lib/transverses/actions";

export function ValiderTransversesButton({
  duerpId,
  hrefSuivant,
}: {
  duerpId: string;
  hrefSuivant: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await validerTransverses(duerpId);
          router.push(hrefSuivant);
        });
      }}
    >
      {pending ? "Validation…" : "Terminer — aller à la synthèse →"}
    </Button>
  );
}
