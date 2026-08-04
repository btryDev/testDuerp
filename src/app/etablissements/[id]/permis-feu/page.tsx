import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { LegalBadge, WhyCard } from "@/components/ui-kit";
import { PermisFeuCard } from "@/components/permis-feu/PermisFeuCard";
import { requireEtablissement } from "@/lib/auth/scope";
import { listPermisFeu } from "@/lib/permis-feu/queries";

export const metadata = {
  title: "Permis de feu",
};

export default async function PermisFeuListePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);
  const permis = await listPermisFeu(id);

  return (
    <>
      <AppTopbar
        title="Permis de feu"
        subtitle="Obligatoire avant tout travail par point chaud (soudage, découpe, meulage…)."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Permis de feu" },
        ]}
        actions={
          <Link
            href={`/etablissements/${id}/permis-feu/nouveau`}
            className={buttonVariants({ size: "sm" })}
          >
            + Nouveau permis
          </Link>
        }
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-16">
        <WhyCard
          kicker="Pourquoi cette page"
          titre="Un permis de feu = votre assurance et votre preuve."
          enjeu="80 % des incendies de travaux se déclarent après le chantier, pendant la surveillance. Un permis signé engage le prestataire et vous protège."
          tonalite="info"
        >
          <p>
            Ce n&apos;est pas imposé par un article unique du Code du travail,
            mais par un <strong>faisceau d&apos;obligations</strong> : sécurité
            incendie du bâtiment, exigence quasi-systématique des assureurs
            (APSAD R43), règlement ERP (art. MS 52) pour les travaux en ERP.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LegalBadge
              reference="INRS ED 6030"
              href="https://www.inrs.fr/media.html?refINRS=ED%206030"
            >
              Recommandation de référence — checklist officielle des mesures
              préventives avant, pendant, après.
            </LegalBadge>
            <LegalBadge
              reference="Art. R4224-17 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018530333"
            />
            <LegalBadge
              reference="MS 52 ERP · APSAD R43"
            />
          </div>
        </WhyCard>

        <section className="mt-10">
          {permis.length === 0 ? (
            <EmptyState
              titre="Vos permis de feu"
              pourquoi="Chaque travail par point chaud réalisé chez vous doit faire l'objet d'un permis signé conjointement avec le prestataire avant démarrage. Cette liste vous permet de retrouver l'historique complet."
              quoiFaire="Créez votre premier permis dès qu'un soudeur, un plombier au chalumeau, un couvreur au fer chaud intervient sur site."
              cta="+ Créer un permis de feu"
              ctaHref={`/etablissements/${id}/permis-feu/nouveau`}
            />
          ) : (
            <div className="space-y-4">
              {permis.map((p) => (
                <PermisFeuCard
                  key={p.id}
                  etablissementId={id}
                  permis={p}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
