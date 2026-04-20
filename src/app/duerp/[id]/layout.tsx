import Link from "next/link";
import { notFound } from "next/navigation";
import { getDuerp } from "@/lib/duerps/queries";
import { trouverReferentielParNaf } from "@/lib/referentiels";

export default async function DuerpLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();

  const ref = trouverReferentielParNaf(duerp.entreprise.codeNaf);

  return (
    <div className="min-h-screen">
      <header className="bg-paper">
        <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-6 gap-y-2 px-6 py-7 sm:px-10">
          <Link
            href="/"
            className="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-ink"
          >
            DUERP
          </Link>
          <span aria-hidden className="text-rule">/</span>
          <p className="min-w-0 flex-1 truncate text-[1.1rem] font-semibold tracking-[-0.01em] leading-none">
            {duerp.entreprise.raisonSociale}
          </p>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            NAF {duerp.entreprise.codeNaf}
            {ref && (
              <>
                <span className="mx-2 text-rule">·</span>
                <span className="normal-case tracking-normal [font-family:var(--font-body)] text-[0.85rem]">
                  {ref.nom.toLowerCase()}
                </span>
              </>
            )}
            <span className="mx-2 text-rule">·</span>
            {duerp.entreprise.effectif} salarié
            {duerp.entreprise.effectif > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <div className="filet-pointille" />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-14">
        {children}
      </div>
    </div>
  );
}
