import Link from "next/link";
import type { Recommandation } from "@/lib/dashboard/recommandations";

const BADGE: Record<Recommandation["kind"], string> = {
  verif_depassee: "border-rose-300 bg-rose-50 text-rose-900",
  action_en_retard: "border-rose-300 bg-rose-50 text-rose-900",
  verif_proche: "border-amber-300 bg-amber-50 text-amber-900",
  action_proche: "border-amber-300 bg-amber-50 text-amber-900",
  duerp_a_jour: "border-indigo-300 bg-indigo-50 text-indigo-900",
};

const LIBELLE: Record<Recommandation["kind"], string> = {
  verif_depassee: "Vérification en retard",
  action_en_retard: "Action en retard",
  verif_proche: "Vérification à venir",
  action_proche: "Action à venir",
  duerp_a_jour: "DUERP à mettre à jour",
};

function formatDate(d: Date | undefined): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PanneauRecommandations({
  recommandations,
}: {
  recommandations: Recommandation[];
}) {
  if (recommandations.length === 0) {
    return (
      <div className="cartouche px-6 py-5 sm:px-8">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Prochaines actions
        </p>
        <p className="mt-2 text-[0.9rem] text-muted-foreground">
          Rien d&apos;urgent pour le moment. Continuez à tenir le registre
          et à planifier les prochaines vérifications.
        </p>
      </div>
    );
  }

  return (
    <div className="cartouche overflow-hidden">
      <div className="border-b border-dashed border-rule/60 px-6 py-4 sm:px-8">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          Prochaines actions recommandées
        </p>
      </div>
      <ul className="divide-y divide-dashed divide-rule/50">
        {recommandations.map((r, idx) => {
          const d = formatDate(r.date);
          return (
            <li
              key={`${r.kind}-${idx}`}
              className="flex items-start justify-between gap-4 px-6 py-3 sm:px-8"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.92rem] font-semibold">{r.titre}</p>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {r.sousTitre}
                  {d && (
                    <>
                      <span className="mx-2 text-rule">·</span>
                      {d}
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] ${BADGE[r.kind]}`}
                >
                  {LIBELLE[r.kind]}
                </span>
                <Link
                  href={r.href}
                  className="text-[0.78rem] underline underline-offset-2"
                >
                  Ouvrir →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
