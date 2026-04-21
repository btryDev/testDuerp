import type { ResultatVerification } from "@prisma/client";
import { LABEL_RESULTAT } from "@/lib/rapports/schema";

const CLASSE: Record<ResultatVerification, string> = {
  conforme: "bg-emerald-100 text-emerald-900 border-emerald-300",
  observations_mineures: "bg-yellow-100 text-yellow-900 border-yellow-300",
  ecart_majeur: "bg-rose-100 text-rose-900 border-rose-300",
  non_verifiable: "bg-slate-100 text-slate-700 border-slate-300",
};

export function BadgeResultat({ resultat }: { resultat: ResultatVerification }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${CLASSE[resultat]}`}
    >
      {LABEL_RESULTAT[resultat]}
    </span>
  );
}
