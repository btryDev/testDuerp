"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { genererCalendrier } from "@/lib/calendrier/actions";

export function GenererCalendrierButton({
  etablissementId,
  variant = "default",
  libelle = "Générer le calendrier",
}: {
  etablissementId: string;
  variant?: "default" | "outline";
  libelle?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant={variant}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await genererCalendrier(etablissementId);
            setMessage(
              `Calendrier régénéré : ${res.created} vérification${
                res.created > 1 ? "s" : ""
              } planifiée${res.created > 1 ? "s" : ""} (${res.deleted} remplacée${
                res.deleted > 1 ? "s" : ""
              }).`,
            );
            router.refresh();
          })
        }
      >
        {pending ? "Génération…" : libelle}
      </Button>
      {message && (
        <p className="text-[0.82rem] text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
