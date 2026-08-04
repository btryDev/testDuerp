import Link from "next/link";
import { verifierIntegriteSignature } from "@/lib/signatures/actions";
import { SignatureBlock } from "@/components/ui-kit";

/**
 * Page publique de vérification d'intégrité d'une signature.
 * Accessible sans authentification. Réponse simple :
 *   - ✓ La signature est valide : le document n'a pas été modifié depuis
 *     la signature.
 *   - ✗ Le document a été modifié (ou n'est plus accessible).
 */
export default async function VerifierSignaturePage({
  params,
}: {
  params: Promise<{ signatureId: string }>;
}) {
  const { signatureId } = await params;
  const res = await verifierIntegriteSignature(signatureId);

  if (res.ok === false && res.raison === "inexistante") {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 sm:px-10">
        <div className="cartouche p-8">
          <p className="label-admin">Signature introuvable</p>
          <h1 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em]">
            Aucune signature avec cet identifiant
          </h1>
          <p className="mt-4 text-[0.9rem] text-[color:var(--muted-foreground)]">
            Vérifiez l&apos;identifiant transmis. Une signature valide a
            l&apos;identifiant <code>sig_…</code>.
          </p>
        </div>
      </main>
    );
  }

  if (res.ok === false) {
    const titre =
      res.raison === "document_modifie"
        ? "Signature invalide — document modifié"
        : "Document introuvable";
    return (
      <main className="mx-auto max-w-xl px-6 py-16 sm:px-10">
        <div className="rounded-2xl border border-[color:var(--minium)]/50 bg-[color:color-mix(in_oklch,var(--minium)_8%,transparent)] p-8">
          <p className="label-admin text-[color:var(--minium)]">Échec de la vérification</p>
          <h1 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.02em] text-[color:var(--minium)]">
            {titre}
          </h1>
          {res.raison === "document_modifie" && (
            <div className="mt-4 space-y-2 text-[0.85rem] text-[color:var(--ink)]">
              <p>
                Le document actuel ne correspond pas à celui qui a été signé.
                Son empreinte SHA-256 est différente — un octet au moins a été
                modifié depuis la signature.
              </p>
              <p className="font-mono text-[0.7rem] text-[color:var(--seal)]">
                Hash attendu&nbsp;: {res.hashAttendu.slice(0, 16)}…
                <br />
                Hash actuel&nbsp;: {res.hashActuel.slice(0, 16)}…
              </p>
            </div>
          )}
          {res.raison === "document_introuvable" && (
            <p className="mt-4 text-[0.85rem]">
              Le document original n&apos;est plus accessible au serveur
              (fichier supprimé, changement de stockage…). La signature reste
              en archive mais ne peut être vérifiée automatiquement.
            </p>
          )}
        </div>
      </main>
    );
  }

  const s = res.signature!;
  return (
    <main className="mx-auto max-w-2xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href="/"
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-ink"
        >
          ← Accueil
        </Link>
      </nav>
      <header className="mt-6 space-y-3">
        <p className="label-admin">Vérification publique d&apos;intégrité</p>
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.02em]">
          Signature valide — document inchangé
        </h1>
        <p className="text-[0.9rem] text-[color:var(--muted-foreground)]">
          L&apos;empreinte SHA-256 du document actuel correspond à celle
          enregistrée au moment de la signature. Aucune modification n&apos;a
          été faite depuis.
        </p>
      </header>

      <div className="mt-8">
        <SignatureBlock
          signataireNom={s.signataireNom}
          signataireRole={s.signataireRole}
          signataireEmail={s.signataireEmail}
          horodatageIso={s.horodatageIso}
          methode={s.methode}
          hashDocument={s.hashDocument}
          nomDocument={s.nomDocument}
          signatureId={s.id}
        />
      </div>

      <footer className="mt-8 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[color:var(--seal)]">
        Fondement légal : art. 1366-1367 Code civil, règlement eIDAS (UE)
        910/2014 · niveau simple.
      </footer>
    </main>
  );
}
