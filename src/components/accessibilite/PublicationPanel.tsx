"use client";

import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  depublierRegistre,
  publierRegistre,
} from "@/lib/accessibilite/actions";

export function PublicationPanel({
  etablissementId,
  slugPublic,
  publie,
  urlPublique,
  qrDataUrl,
}: {
  etablissementId: string;
  slugPublic: string;
  publie: boolean;
  urlPublique: string;
  qrDataUrl: string;
}) {
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  function onPublier() {
    setErreur(null);
    startTransition(async () => {
      const res = await publierRegistre(etablissementId);
      if (res.status === "error") {
        setErreur(res.message);
      }
    });
  }

  function onDepublier() {
    if (!confirm("Retirer le registre de la publication ? L'URL publique ne sera plus accessible.")) return;
    startTransition(async () => {
      await depublierRegistre(etablissementId);
    });
  }

  async function copierUrl() {
    await navigator.clipboard.writeText(urlPublique);
    setCopie(true);
    setTimeout(() => setCopie(false), 1500);
  }

  if (!publie) {
    return (
      <div className="cartouche-sunk p-6">
        <p className="label-admin">Publication</p>
        <h3 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.01em]">
          Votre registre n&apos;est pas encore public
        </h3>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
          Dès que les sections <strong>1 (prestations)</strong> et{" "}
          <strong>2 (conformité)</strong> sont remplies, vous pouvez publier. Une
          URL publique sera générée, consultable avec un simple QR code collé à
          l&apos;entrée de votre établissement.
        </p>
        {erreur && (
          <p className="mt-3 text-[0.85rem] text-[color:var(--minium)]">
            {erreur}
          </p>
        )}
        <Button
          type="button"
          onClick={onPublier}
          disabled={pending}
          className="mt-4"
        >
          {pending ? "Publication…" : "Publier le registre"}
        </Button>
      </div>
    );
  }

  return (
    <div className="cartouche relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "var(--accent-vif)" }}
      />
      <div className="grid gap-0 md:grid-cols-[auto_1fr]">
        {/* QR code */}
        <div className="flex items-center justify-center border-b border-dashed border-rule/60 bg-[color:var(--paper-sunk)] px-8 py-8 md:border-b-0 md:border-r">
          <div className="space-y-3">
            <img
              src={qrDataUrl}
              alt={`QR code vers le registre d'accessibilité — ${urlPublique}`}
              width={180}
              height={180}
              className="rounded-lg bg-white p-3 shadow-sm"
            />
            <a
              href={`/api/accessibilite/${slugPublic}/affiche`}
              className={
                buttonVariants({ variant: "outline", size: "sm" }) +
                " w-full justify-center"
              }
            >
              Affiche A4 ↓
            </a>
          </div>
        </div>

        {/* Actions + URL */}
        <div className="flex flex-col gap-4 px-7 py-7">
          <div>
            <p className="label-admin text-[color:var(--accent-vif)]">Publié</p>
            <h3 className="mt-1.5 text-[1.2rem] font-semibold tracking-[-0.015em]">
              Votre registre est accessible en un clic
            </h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              Collez le QR code à l&apos;entrée ou à l&apos;accueil : les
              visiteurs scannent avec leur téléphone et accèdent à votre
              registre en 2 secondes.
            </p>
          </div>

          <div className="rounded-lg border border-[color:var(--rule)] bg-[color:var(--paper-sunk)] p-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              URL publique
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <a
                href={urlPublique}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-[0.82rem] text-[color:var(--warm)] underline-offset-2 hover:underline"
              >
                {urlPublique}
              </a>
              <button
                type="button"
                onClick={copierUrl}
                className="shrink-0 rounded-md border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[color:var(--seal)] hover:text-[color:var(--ink)]"
              >
                {copie ? "✓ Copié" : "Copier"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={urlPublique}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Prévisualiser ↗
            </a>
            <button
              type="button"
              onClick={onDepublier}
              disabled={pending}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {pending ? "…" : "Retirer la publication"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
