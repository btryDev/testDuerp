import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { BarreCompte } from "@/components/layout/BarreCompte";
import { getDuerp } from "@/lib/duerps/queries";
import { getOptionalUser } from "@/lib/auth/require-user";
import { getEtatModules } from "@/lib/etablissements/modules";
import { listerEtablissementsDeLEntreprise } from "@/lib/etablissements/queries";
import { chargerSidebarCounts } from "@/lib/navigation/sidebar-counts";
import {
  trouverReferentielParId,
  trouverReferentielParNaf,
} from "@/lib/referentiels";

/**
 * Shell V2 pour les pages DUERP — aligne /duerp/[id]/* sur le même
 * chrome que /etablissements/[id]/* : rail gauche persistant (AppSidebar
 * avec l'item "DUERP" actif) + topbar sticky avec crumbs → raison sociale
 * → DUERP. L'ancien header éditorial centré a été remplacé ; le contenu
 * interne (fil du wizard, carte de secteur, tableaux de risques) garde sa
 * largeur max-w-5xl pour préserver la lecture de type « document ».
 *
 * Cette largeur est l'exception nommée de la charte board (§ 5, « la
 * largeur de lecture ») : ces pages se lisent en phrases longues, et une
 * ligne de 1400 px ne se lit pas. Elle porte sur la largeur, et sur rien
 * d'autre — le contenu est en charte board comme partout ailleurs, d'où
 * le canvas posé ici : des cartes blanches sur `--paper` ne se
 * détachaient plus du fond.
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
  // Le DUERP partage la sidebar de l'établissement : sans cet état ni ces
  // compteurs, registres et pastilles y seraient qualifiés autrement
  // qu'ailleurs dans le produit — entrer dans le wizard faisait
  // disparaître les retards (ADR-015).
  // La fratrie vient avec, pour le sélecteur de la barre haute : le shell DUERP
  // partage la même barre, donc la même règle (ADR-028).
  const [modules, counts, fratrie] = await Promise.all([
    getEtatModules(etab.id, etab.estERP),
    chargerSidebarCounts(etab.id),
    listerEtablissementsDeLEntreprise(etab.entrepriseId),
  ]);
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
    <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[auto_1fr] lg:overflow-hidden">
      <AppSidebar
        etablissement={{
          id: etab.id,
          raisonDisplay: etab.raisonDisplay,
          adresse: etab.adresse,
          effectifSurSite: etab.effectifSurSite,
          entrepriseId: etab.entrepriseId,
        }}
        active="duerp"
        counts={counts}
        modules={modules}
      />

      <div className="flex min-w-0 flex-col bg-[color:var(--board-canvas)] lg:overflow-y-auto">
        {/* Le compte se tient en haut à droite ici aussi : le shell DUERP
            partage la même sidebar, donc la même règle. */}
        <BarreCompte
          etablissementId={etab.id}
          email={user?.email ?? null}
          etablissements={fratrie.map((e) => ({
            id: e.id,
            raisonDisplay: e.raisonDisplay,
          }))}
        />
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
              className={buttonVariants({
                variant: "boardClair",
                size: "boardSm",
              })}
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
