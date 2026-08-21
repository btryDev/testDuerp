import Link from "next/link";
import { WhyCard } from "@/components/ui-kit";
import { BatimentsManager } from "@/components/batiments/BatimentsManager";
import { requireEtablissement } from "@/lib/auth/scope";
import { listerBatimentsDeLEtablissement } from "@/lib/batiments/queries";

export default async function BatimentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const batiments = await listerBatimentsDeLEtablissement(id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etablissement.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 space-y-3">
        <p className="label-admin">Mon établissement</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          Bâtiments
        </h1>
        <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
          Si votre établissement occupe plusieurs corps de bâtiment — une
          réserve, un atelier, une annexe — déclarez-les ici. Vous pourrez
          ensuite situer chaque équipement et lire vos échéances bâtiment par
          bâtiment.
        </p>
      </header>

      <div className="mt-8">
        <WhyCard
          kicker="Bon à savoir"
          titre="Un bâtiment est un lieu, pas un statut"
          tonalite="info"
        >
          <p>
            Vos obligations — notamment celles liées au classement ERP — sont
            calculées pour l&apos;établissement dans son ensemble et
            s&apos;appliquent à tous ses bâtiments. Si l&apos;un d&apos;eux
            n&apos;est pas ouvert au public ou relève d&apos;un autre régime,
            signalez-le-nous : ce cas n&apos;est pas encore distingué.
          </p>
        </WhyCard>
      </div>

      <div className="mt-10">
        <BatimentsManager etablissementId={id} batiments={batiments} />
      </div>
    </main>
  );
}
