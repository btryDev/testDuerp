"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Modal de test local : ouvre la page publique /acces/[token] dans une
 * iframe, avec l'OTP affiché à côté en grand + bouton copier. Permet de
 * boucler le flux signature sans avoir besoin d'un vrai SMTP.
 *
 * Strictement dev : on ne l'affiche que si on a reçu l'OTP clair côté client
 * (ce qui n'arrivera qu'en mode driver=console, parce qu'en prod l'OTP ne
 * retournera jamais à l'UI admin).
 */
export function SignaturePreviewModal({
  urlAcces,
  otp,
  onClose,
}: {
  urlAcces: string;
  otp: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    dialogRef.current?.close();
    // Rafraîchit le RSC parent pour afficher l'éventuelle nouvelle signature.
    router.refresh();
    onClose();
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(otp);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-0 h-screen max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[color:color-mix(in_oklch,var(--ink)_60%,transparent)]"
      aria-labelledby="sig-preview-title"
    >
      <div className="flex h-full w-full items-stretch justify-center p-6">
        <div className="flex h-full w-full max-w-6xl overflow-hidden rounded-2xl border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] shadow-2xl">
          {/* Colonne gauche : instructions + OTP */}
          <aside className="flex w-[340px] flex-col gap-5 border-r border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] p-6">
            <div className="flex items-center justify-between">
              <p className="label-admin">Mode démo local</p>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-[color:var(--rule)] px-2 py-0.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[color:var(--muted-foreground)] hover:text-[color:var(--ink)]"
                aria-label="Fermer"
              >
                ✕ Fermer
              </button>
            </div>

            <h2 id="sig-preview-title" className="display-lg text-[1.3rem]">
              Simulez la réception
              <br />
              du lien par email
            </h2>
            <p className="text-[0.85rem] leading-relaxed text-[color:var(--ink)]">
              La page de droite est exactement celle que votre prestataire verra.
              Utilisez le code ci-dessous pour signer, puis fermez la fenêtre —
              la signature apparaîtra sur le rapport.
            </p>

            <div className="mt-2 rounded-xl border border-[color:var(--rule-soft)] bg-[color:var(--paper-elevated)] p-4">
              <p className="label-admin">Code OTP (valable 10 min)</p>
              <button
                type="button"
                onClick={copier}
                className="mt-2 block w-full rounded-lg border border-dashed border-[color:var(--warm)] bg-[color:var(--warm-soft)] py-4 text-center font-mono text-[1.75rem] font-semibold tracking-[0.4em] text-[color:var(--warm)] transition hover:border-solid"
                title="Cliquer pour copier"
              >
                {otp}
              </button>
              <p className="mt-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[color:var(--muted-foreground)]">
                {copie ? "Copié ✓" : "Cliquer pour copier"}
              </p>
            </div>

            <details className="text-[0.78rem] text-[color:var(--muted-foreground)]">
              <summary className="cursor-pointer font-mono text-[0.7rem] uppercase tracking-[0.1em]">
                Lien direct
              </summary>
              <p className="mt-2 break-all font-mono text-[0.72rem]">
                <a
                  href={urlAcces}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--warm)] underline"
                >
                  {urlAcces}
                </a>
              </p>
            </details>

            <div className="mt-auto border-t border-[color:var(--rule-soft)] pt-4 text-[0.72rem] leading-relaxed text-[color:var(--muted-foreground)]">
              En production avec un driver email (Resend / SMTP), ce modal ne
              s&apos;ouvre plus : le destinataire reçoit un véritable email.
            </div>
          </aside>

          {/* Colonne droite : iframe de la page publique */}
          <div className="flex flex-1 flex-col">
            <header className="flex items-center gap-2 border-b border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] px-4 py-2 font-mono text-[0.72rem] text-[color:var(--seal)]">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full bg-[color:var(--accent-vif)]"
              />
              <span className="truncate">{urlAcces}</span>
            </header>
            <iframe
              src={urlAcces}
              title="Aperçu de la page de signature du prestataire"
              className="flex-1 bg-[color:var(--paper)]"
            />
          </div>
        </div>
      </div>
    </dialog>
  );
}
