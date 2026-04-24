"use client";

import {
  useActionState,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  commitImport,
  previewImport,
  type PreviewImportState,
  type CommitImportState,
} from "@/lib/duerps/import/actions";

/**
 * Wizard 2 étapes :
 *   1. Upload + preview (l'utilisateur voit ce qui sera créé avant de valider)
 *   2. Commit transactionnel (même fichier, même FormData)
 *
 * Le fichier est conservé côté client dans un <input type="file"> (pas
 * de stockage serveur intermédiaire) — au commit, on re-soumet le même
 * form avec le même fichier.
 */
export function ImportDuerpWizard({
  etablissementId,
}: {
  etablissementId: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [nomFichier, setNomFichier] = useState<string | null>(null);

  const [previewState, previewAction, previewPending] = useActionState<
    PreviewImportState,
    FormData
  >(previewImport.bind(null, etablissementId), { status: "idle" });

  const [commitState, commitAction, commitPending] = useActionState<
    CommitImportState,
    FormData
  >(commitImport.bind(null, etablissementId), { status: "idle" });

  function onChangeFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setNomFichier(f?.name ?? null);
  }

  function onConfirmerCommit(e: FormEvent) {
    e.preventDefault();
    if (!inputRef.current?.files?.[0]) return;
    const fd = new FormData();
    fd.append("fichier", inputRef.current.files[0]);
    commitAction(fd);
  }

  // Redirect après succès
  if (commitState.status === "success") {
    router.push(`/duerp/${commitState.duerpId}/synthese`);
  }

  const peutValider =
    previewState.status === "preview" &&
    previewState.nbRisques > 0 &&
    previewState.nbErreurs === 0;

  return (
    <div className="space-y-8">
      {/* Étape 1 — upload */}
      <form ref={formRef} action={previewAction}>
        <div className="rounded-2xl border border-dashed border-[color:var(--rule)] bg-[color:var(--paper-sunk)] p-6">
          <p className="label-admin">Étape 1 · Fichier</p>
          <h3 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.01em]">
            Téléversez votre DUERP existant
          </h3>
          <p className="mt-1 text-[0.85rem] text-muted-foreground">
            Format Excel (.xlsx, .xls) ou CSV. Vous pouvez partir du{" "}
            <a
              href="/api/duerp/import/template"
              className="font-medium text-[color:var(--warm)] underline"
            >
              modèle officiel
            </a>{" "}
            ou utiliser votre propre fichier — nous détectons les colonnes
            automatiquement.
          </p>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] p-3 hover:border-[color:var(--warm)]">
            <input
              ref={inputRef}
              type="file"
              name="fichier"
              required
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={onChangeFile}
              className="sr-only"
            />
            <span className="flex size-9 items-center justify-center rounded-md bg-[color:var(--warm-soft)] text-[color:var(--warm)]">
              ⬆
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.92rem] font-medium">
                {nomFichier ?? "Choisir un fichier"}
              </span>
              <span className="block font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                .xlsx · .xls · .csv · max 20 Mo
              </span>
            </span>
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={previewPending || !nomFichier}>
              {previewPending ? "Analyse…" : "Analyser le fichier"}
            </Button>
            <a
              href="/api/duerp/import/template"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Télécharger le modèle ↓
            </a>
          </div>

          {previewState.status === "error" && (
            <p className="mt-4 text-[0.85rem] text-[color:var(--minium)]">
              {previewState.message}
            </p>
          )}
        </div>
      </form>

      {/* Étape 2 — preview */}
      {previewState.status === "preview" && (
        <section className="cartouche relative overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{
              background:
                previewState.nbErreurs === 0
                  ? "var(--accent-vif)"
                  : "oklch(0.72 0.15 70)",
            }}
          />
          <div className="px-7 pb-4 pt-7 sm:px-9">
            <p className="label-admin">Étape 2 · Aperçu</p>
            <h3 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.015em]">
              {previewState.nbErreurs === 0
                ? "Prêt à importer"
                : `${previewState.nbErreurs} ligne${previewState.nbErreurs > 1 ? "s" : ""} à corriger`}
            </h3>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Fichier{" "}
              <span className="font-mono text-ink">
                {previewState.nomFichier}
              </span>{" "}
              — {previewState.nbLignes} ligne
              {previewState.nbLignes > 1 ? "s" : ""} dont{" "}
              {previewState.nbRisques} risque
              {previewState.nbRisques > 1 ? "s" : ""} valides.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-dashed divide-rule/60 border-y border-dashed border-rule/60 sm:grid-cols-4">
            <Stat
              label="Unités de travail"
              value={previewState.nbUnites}
              accent="warm"
            />
            <Stat
              label="Risques valides"
              value={previewState.nbRisques}
              accent="ok"
            />
            <Stat
              label="Mesures existantes"
              value={previewState.nbMesures}
              accent="warm"
            />
            <Stat
              label="Lignes en erreur"
              value={previewState.nbErreurs}
              accent={previewState.nbErreurs > 0 ? "alert" : "muted"}
            />
          </div>

          {/* Résumé par unité */}
          {previewState.resume.length > 0 && (
            <div className="max-h-96 overflow-auto px-7 py-5 sm:px-9">
              <p className="label-admin mb-3">Contenu détecté</p>
              <ul className="space-y-2">
                {previewState.resume.map((u) => (
                  <li
                    key={u.unite}
                    className="flex items-start justify-between gap-3 rounded-lg bg-[color:var(--paper-sunk)] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.9rem] font-medium">{u.unite}</p>
                      {u.exemples.length > 0 && (
                        <p className="mt-0.5 truncate text-[0.76rem] text-muted-foreground">
                          {u.exemples.join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-[color:var(--paper-elevated)] px-2 py-0.5 font-mono text-[0.68rem] font-semibold text-[color:var(--warm)]">
                      {u.nbRisques} risque{u.nbRisques > 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Commit */}
          <div className="border-t border-dashed border-rule/60 bg-[color:var(--paper-sunk)] px-7 py-5 sm:px-9">
            {commitState.status === "error" && (
              <p className="mb-3 text-[0.85rem] text-[color:var(--minium)]">
                {commitState.message}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onConfirmerCommit}
                disabled={!peutValider || commitPending}
                className={buttonVariants({ size: "default" })}
              >
                {commitPending
                  ? "Import en cours…"
                  : `Importer ${previewState.nbRisques} risque${previewState.nbRisques > 1 ? "s" : ""}`}
              </button>
              <p className="text-[0.78rem] text-muted-foreground">
                Les lignes en erreur seront ignorées. Vous pourrez compléter et
                retyper chaque action après import.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "ok" | "warm" | "alert" | "muted";
}) {
  const color =
    accent === "ok"
      ? "var(--accent-vif)"
      : accent === "alert"
        ? "var(--minium)"
        : accent === "warm"
          ? "var(--warm)"
          : "var(--muted-foreground)";
  return (
    <div className="px-4 py-4">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className="mt-1 text-[1.75rem] font-semibold tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}
