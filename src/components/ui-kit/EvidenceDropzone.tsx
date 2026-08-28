"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Zone de dépôt pour un justificatif (PDF, image, docx).
 * Générique : utilisée pour les rapports de vérification, les
 * attestations URSSAF, les rapports d'analyse légionelle, etc. Le parent
 * gère l'upload côté serveur via Server Action ; ce composant gère l'UI +
 * validation locale (MIME, taille).
 */
export function EvidenceDropzone({
  name,
  label = "Déposer un fichier",
  hint,
  accept = "application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  maxMo = 10,
  required = false,
  onChange,
  className,
}: {
  name: string;
  label?: string;
  hint?: string;
  accept?: string;
  maxMo?: number;
  required?: boolean;
  onChange?: (file: File | null) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const maxOctets = maxMo * 1024 * 1024;

  function valider(file: File | null) {
    if (!file) {
      setFichier(null);
      setErreur(null);
      onChange?.(null);
      return;
    }
    if (file.size > maxOctets) {
      setErreur(`Le fichier dépasse ${maxMo} Mo.`);
      setFichier(null);
      onChange?.(null);
      return;
    }
    const acceptes = accept.split(",").map((m) => m.trim());
    if (acceptes.length > 0 && !acceptes.includes(file.type)) {
      setErreur("Format non accepté (PDF, image ou DOCX uniquement).");
      setFichier(null);
      onChange?.(null);
      return;
    }
    setErreur(null);
    setFichier(file);
    onChange?.(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    valider(file);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
    }
    valider(file);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed p-6 text-center transition-colors",
          drag
            ? "border-[color:var(--board-blue-ink)] bg-[color:var(--board-blue-pale)]"
            : "border-[color:var(--board-slate)] bg-[color:var(--board-slate-pale)] hover:border-[color:var(--board-blue-ink)]",
          erreur && "border-[color:var(--board-signal-ink)]/60",
        )}
      >
        <input
          ref={inputRef}
          name={name}
          type="file"
          accept={accept}
          required={required}
          onChange={onInputChange}
          className="sr-only"
        />
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--board-card)] text-[color:var(--board-blue-ink)]"
        >
          ⬆
        </span>
        <span className="text-[13.5px] font-semibold text-[color:var(--board-slate-ink)]">
          {fichier ? fichier.name : label}
        </span>
        {!fichier && hint && (
          <span className="text-[12px] text-[color:var(--board-slate-mid)]">
            {hint}
          </span>
        )}
        {!fichier && (
          <span className="board-eyebrow text-[10px] tracking-[0.12em] text-[color:var(--board-slate-soft)]">
            Glisser-déposer ou cliquer · max {maxMo} Mo
          </span>
        )}
        {fichier && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              valider(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="board-eyebrow mt-1 text-[10px] tracking-[0.12em] text-[color:var(--board-slate-soft)] transition-colors hover:text-[color:var(--board-signal-ink)]"
          >
            Retirer
          </button>
        )}
      </label>
      {erreur && (
        <p role="alert" className="m-0 text-[12.5px] text-[color:var(--board-signal-ink)]">
          {erreur}
        </p>
      )}
    </div>
  );
}
