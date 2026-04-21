import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { PreRemplissagePanel } from "@/components/equipements/PreRemplissagePanel";
import { SupprimerEquipementButton } from "@/components/equipements/SupprimerEquipementButton";
import { getEtablissement } from "@/lib/etablissements/queries";
import {
  grouperParCategorie,
  listerEquipementsDeLEtablissement,
} from "@/lib/equipements/queries";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import { suggererEquipements } from "@/lib/equipements/pre-remplissage";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function EquipementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const equipements = await listerEquipementsDeLEtablissement(id);
  const parCategorie = grouperParCategorie(equipements);

  const suggestions = suggererEquipements({
    codeNaf: etab.codeNaf,
    estEtablissementTravail: etab.estEtablissementTravail,
    estERP: etab.estERP,
    estIGH: etab.estIGH,
    estHabitation: etab.estHabitation,
  });

  const dejaDeclarees = new Set(equipements.map((e) => e.categorie));
  const suggestionsRestantes = suggestions.filter(
    (s) => !dejaDeclarees.has(s.categorie),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:px-10">
      <nav>
        <Link
          href={`/etablissements/${id}`}
          className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-ink"
        >
          ← {etab.raisonDisplay}
        </Link>
      </nav>

      <header className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="label-admin">Équipements</p>
          <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
            Parc d&apos;équipements
          </h1>
          <p className="max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Déclarez les équipements présents sur cet établissement. Chaque
            catégorie déclenche des vérifications périodiques (électriques,
            incendie, aération…) qui seront ajoutées à votre calendrier à
            l&apos;étape suivante.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/etablissements/${id}/equipements/nouveau`}
            className={buttonVariants({ size: "sm" })}
          >
            + Ajouter un équipement
          </Link>
        </div>
      </header>

      <div className="filet-pointille my-10" />

      {suggestionsRestantes.length > 0 && (
        <div className="mb-10">
          <PreRemplissagePanel
            etablissementId={id}
            suggestions={suggestionsRestantes}
          />
        </div>
      )}

      {equipements.length === 0 ? (
        <div className="cartouche px-6 py-8 sm:px-8">
          <p className="text-[0.9rem] text-muted-foreground">
            Aucun équipement déclaré pour l&apos;instant. Utilisez le panneau
            de pré-remplissage ci-dessus ou ajoutez manuellement via le bouton
            « Ajouter un équipement ».
          </p>
        </div>
      ) : (
        <section className="space-y-8">
          {[...parCategorie.entries()].map(([cat, liste]) => (
            <div key={cat} className="space-y-3">
              <h2 className="text-[1.05rem] font-semibold tracking-[-0.012em]">
                {LABEL_CATEGORIE_EQUIPEMENT[cat]}
                <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                  · {liste.length} équipement{liste.length > 1 ? "s" : ""}
                </span>
              </h2>

              <ul className="cartouche divide-y divide-dashed divide-rule/50">
                {liste.map((eq) => {
                  const mes = formatDate(eq.dateMiseEnService);
                  return (
                    <li
                      key={eq.id}
                      className="flex items-start justify-between gap-4 px-6 py-4 sm:px-8"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.95rem] font-semibold">
                          {eq.libelle}
                        </p>
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                          {eq.localisation ?? "Localisation non précisée"}
                          {mes && (
                            <>
                              <span className="mx-2 text-rule">·</span>
                              Mise en service {mes}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/etablissements/${id}/equipements/${eq.id}/modifier`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Modifier
                        </Link>
                        <SupprimerEquipementButton id={eq.id} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
