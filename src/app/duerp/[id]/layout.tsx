import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { getDuerp } from "@/lib/duerps/queries";
import { getOptionalUser } from "@/lib/auth/require-user";
import {
  trouverReferentielParId,
  trouverReferentielParNaf,
} from "@/lib/referentiels";

/**
 * Shell V2 pour les pages DUERP — aligne /duerp/[id]/* sur le même
 * chrome que /etablissements/[id]/* : rail gauche persistant (AppSidebar
 * avec l'item "DUERP" actif) + topbar sticky avec crumbs → raison sociale
 * → DUERP. L'ancien header éditorial centré a été remplacé ; le contenu
 * interne (wizard steps, cartouches secteur, tableaux risques) garde sa
 * largeur max-w-5xl pour préserver la lecture de type « document ».
 */
export default async function DuerpLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [duerp, user] = await Promise.all([
    getDuerp(id),
    getOptionalUser(),
  ]);
  if (!duerp) notFound();

  const etab = duerp.etablissement;
  // Secteur affiché en pill : celui choisi dans le wizard en priorité,
  // sinon suggestion par NAF (même règle que la page secteur elle-même).
  const refChoisi = duerp.referentielSecteurId
    ? trouverReferentielParId(duerp.referentielSecteurId)
    : null;
  const refParNaf = trouverReferentielParNaf(duerp.entreprise.codeNaf);
  const ref = refChoisi ?? refParNaf;

  const effectif = duerp.entreprise.effectif;
  const subtitleSegments: Array<string | { pill: string }> = [
    `NAF ${duerp.entreprise.codeNaf}`,
  ];
  if (ref) subtitleSegments.push({ pill: ref.nom });
  subtitleSegments.push(`${effectif} salarié${effectif > 1 ? "s" : ""}`);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[248px_1fr] lg:overflow-hidden">
      <AppSidebar
        etablissement={{
          id: etab.id,
          raisonDisplay: etab.raisonDisplay,
          adresse: etab.adresse,
          effectifSurSite: etab.effectifSurSite,
          entrepriseId: etab.entrepriseId,
        }}
        active="duerp"
        user={user}
      />

      <div className="flex min-w-0 flex-col lg:overflow-y-auto">
        <AppTopbar
          title="DUERP"
          kicker={`Établissements / ${etab.raisonDisplay.split(" ")[0]}…`}
          crumbs={[
            {
              href: `/etablissements/${etab.id}`,
              label: etab.raisonDisplay,
            },
            { label: "DUERP" },
          ]}
          subtitleSegments={subtitleSegments}
          actions={
            <Link
              href={`/duerp/${id}/pdf/preview`}
              className={buttonVariants({ size: "sm" })}
            >
              PDF DUERP ↓
            </Link>
          }
        />

        <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-14">
          {children}
        </div>
      </div>
    </div>
  );
}
