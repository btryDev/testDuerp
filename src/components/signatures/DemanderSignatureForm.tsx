"use client";

import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
        className={cn(buttonVariants({ variant: "boardClair", size: "boardSm" }))}
      >
        Demander signature
      </button>
    );
  }

  if (result && result.ok) {
    return (
      <>
        <div className="mt-3 rounded-[18px] bg-[color:var(--board-green)] p-4 text-[13px]">
          <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-green-ink)]">
            Lien envoyé
          </p>
          <p className="mt-1 text-[color:var(--ink)]">
            Le destinataire va recevoir un email avec le lien et le code OTP.
          </p>
          {result.otpClair && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOuvert(true)}
                className={cn(buttonVariants({ variant: "board", size: "boardSm" }))}
              >
                Tester la signature ici (mode dev)
              </button>
              <a
                href={result.urlAcces}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "boardClair", size: "boardSm" }))}
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
            className="mt-3 text-[12.5px] font-semibold text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]"
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
      className="mt-3 space-y-3 rounded-[18px] bg-[color:var(--board-card)] p-4 ring-1 ring-[color:var(--board-slate-line)]"
    >
      <p className="board-eyebrow m-0 text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
        Demander une signature électronique
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label-board" htmlFor="sigNom">
            Nom du signataire *
          </label>
          <input className="champ-board"
            id="sigNom"
            name="signataireNom"
            defaultValue={nomDefaut}
            required
            maxLength={200}
            placeholder="Jean Dupond"
          />
        </div>
        <div>
          <label className="label-board" htmlFor="sigEmail">
            Email *
          </label>
          <input className="champ-board"
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
      <div>
        <label className="label-board" htmlFor="sigRole">
          Fonction (facultatif)
        </label>
        <input className="champ-board"
          id="sigRole"
          name="signataireRole"
          maxLength={120}
          placeholder="Technicien vérificateur / Gérant / Chef d'entreprise"
        />
      </div>
      {result && !result.ok && (
        <p className="text-[13px] text-[color:var(--board-signal-ink)]">
          {result.message}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="board" size="boardSm" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer le lien de signature"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setResult(null);
          }}
          className="text-[12.5px] font-semibold text-[color:var(--board-slate-mid)] hover:text-[color:var(--board-ink)]"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
