"use client";

import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demanderSignature } from "@/lib/signatures/actions";
import type { ObjetSignable } from "@prisma/client";
import { SignaturePreviewModal } from "./SignaturePreviewModal";

/**
 * Déclencheur côté admin : demande à un tiers (prestataire / contrôleur /
 * co-signataire) de signer électroniquement l'objet. Envoie un lien magique
 * + OTP par email. En mode dev (driver email `console`), le lien et l'OTP
 * sont aussi affichés ici pour que l'utilisateur puisse tester localement
 * sans avoir besoin d'un SMTP.
 */
export function DemanderSignatureForm({
  etablissementId,
  objetType,
  objetId,
  libelleDocument,
  emailDefaut,
  nomDefaut,
}: {
  etablissementId: string;
  objetType: ObjetSignable;
  objetId: string;
  libelleDocument: string;
  emailDefaut?: string;
  nomDefaut?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    | null
    | { ok: true; urlAcces: string; otpClair: string | null }
    | { ok: false; message: string }
  >(null);
  const [previewOuvert, setPreviewOuvert] = useState(false);

  function onSubmit(formData: FormData) {
    const email = (formData.get("signataireEmail") ?? "").toString().trim();
    const nom = (formData.get("signataireNom") ?? "").toString().trim();
    const role = (formData.get("signataireRole") ?? "").toString().trim();
    if (!email || !nom) {
      setResult({ ok: false, message: "Nom et email requis." });
      return;
    }
    startTransition(async () => {
      try {
        const res = await demanderSignature({
          etablissementId,
          objetType,
          objetId,
          signataireEmail: email,
          signataireNom: nom,
          signataireRole: role || undefined,
          libelleDocument,
        });
        setResult({ ok: true, urlAcces: res.urlAcces, otpClair: res.otpClair });
        // Mode dev : ouvre automatiquement le modal de test si on a reçu l'OTP
        // (driver email = console). En prod, otpClair sera null côté client.
        if (res.otpClair) setPreviewOuvert(true);
      } catch (e) {
        setResult({
          ok: false,
          message: e instanceof Error ? e.message : "Erreur inconnue.",
        });
      }
    });
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Demander signature
      </button>
    );
  }

  if (result && result.ok) {
    return (
      <>
        <div className="mt-3 rounded-lg border border-[color:var(--accent-vif)]/40 bg-[color:var(--accent-vif-soft)] p-4 text-[0.85rem]">
          <p className="label-admin">Lien envoyé</p>
          <p className="mt-1 text-[color:var(--ink)]">
            Le destinataire va recevoir un email avec le lien et le code OTP.
          </p>
          {result.otpClair && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOuvert(true)}
                className={buttonVariants({ size: "sm" })}
              >
                Tester la signature ici (mode dev)
              </button>
              <a
                href={result.urlAcces}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ouvrir dans un nouvel onglet ↗
              </a>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setOuvert(false);
            }}
            className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
          >
            Fermer
          </button>
        </div>

        {previewOuvert && result.otpClair && (
          <SignaturePreviewModal
            urlAcces={result.urlAcces}
            otp={result.otpClair}
            onClose={() => setPreviewOuvert(false)}
          />
        )}
      </>
    );
  }

  return (
    <form
      action={onSubmit}
      className="mt-3 space-y-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] p-4"
    >
      <p className="label-admin">Demander une signature électronique</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="sigNom" className="text-[0.78rem]">
            Nom du signataire *
          </Label>
          <Input
            id="sigNom"
            name="signataireNom"
            defaultValue={nomDefaut}
            required
            maxLength={200}
            placeholder="Jean Dupond"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sigEmail" className="text-[0.78rem]">
            Email *
          </Label>
          <Input
            id="sigEmail"
            name="signataireEmail"
            type="email"
            defaultValue={emailDefaut}
            required
            maxLength={200}
            placeholder="jean.dupond@apave.fr"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="sigRole" className="text-[0.78rem]">
          Fonction (facultatif)
        </Label>
        <Input
          id="sigRole"
          name="signataireRole"
          maxLength={120}
          placeholder="Technicien vérificateur / Gérant / Chef d'entreprise"
        />
      </div>
      {result && !result.ok && (
        <p className="text-[0.82rem] text-[color:var(--minium)]">{result.message}</p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer le lien de signature"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setResult(null);
          }}
          className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
