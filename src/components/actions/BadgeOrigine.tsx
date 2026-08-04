import type { OrigineAction } from "@/lib/actions/queries";

const LABEL: Record<OrigineAction, string> = {
  duerp: "DUERP",
  verification: "Vérification",
  libre: "Libre",
};

const CLASSE: Record<OrigineAction, string> = {
  duerp: "border-indigo-300 bg-indigo-50 text-indigo-900",
  verification: "border-teal-300 bg-teal-50 text-teal-900",
  libre: "border-slate-300 bg-slate-50 text-slate-700",
};

export function BadgeOrigine({ origine }: { origine: OrigineAction }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${CLASSE[origine]}`}
    >
      {LABEL[origine]}
    </span>
  );
}
