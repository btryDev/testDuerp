import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { WhyCard } from "@/components/ui-kit/WhyCard";
import { LegalBadge } from "@/components/ui-kit/LegalBadge";
import { getEtablissement } from "@/lib/etablissements/queries";
import { creerDuerp } from "@/lib/duerps/actions";

// Porte d'entrée DUERP depuis la sidebar (la nav ne connaît que
// l'etablissementId).
//
//  - DUERP avec secteur choisi → relais direct vers le wizard, comme
//    avant (pas de boucle : la cible est l'arbre /duerp/[id]).
//  - Sinon (aucun DUERP, ou DUERP « silencieux » créé sans secteur par
//    l'ancienne version de cette page) → page d'intro pédagogique, SANS
//    création silencieuse : le dirigeant sait ce qu'est ce document
//    avant d'être jeté dans le choix de secteur.
export default async function EtablissementDuerpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Scope propriétaire (contrairement à l'ancien relais qui interrogeait
  // la table sans vérifier l'utilisateur).
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const duerp = etab.duerps[0] ?? null;
  if (duerp?.referentielSecteurId) {
    redirect(`/duerp/${duerp.id}/unites`);
  }

  const creerAction = creerDuerp.bind(null, id);

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

      <header className="mt-8 space-y-3">
        <p className="label-admin">Document unique</p>
        <h1 className="text-[1.8rem] font-semibold tracking-[-0.02em] leading-tight">
          Votre DUERP
        </h1>
      </header>

      <div className="mt-8 space-y-6">
        <WhyCard
          kicker="Pourquoi ce document"
          titre="Le DUERP : votre évaluation des risques, posée par écrit"
          enjeu="Obligatoire dès le premier salarié. En cas de contrôle ou d'accident, c'est le premier document demandé."
          tonalite="info"
        >
          <p>
            Vous décrivez votre activité, l&apos;outil vous propose les
            risques typiques de votre secteur, vous ajustez. Comptez une
            trentaine de minutes — tout est enregistré au fur et à mesure,
            vous pouvez vous arrêter et reprendre. L&apos;outil structure
            votre évaluation ; il ne certifie pas votre conformité.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LegalBadge
              reference="Art. R. 4121-1 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000023795562"
              extrait="L'employeur transcrit et met à jour dans un document unique les résultats de l'évaluation des risques pour la santé et la sécurité des travailleurs à laquelle il procède en application de l'article L. 4121-3."
            />
            <LegalBadge
              reference="Art. R. 4121-2 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045386446"
              extrait="La mise à jour du document unique d'évaluation des risques est réalisée : au moins chaque année dans les entreprises d'au moins onze salariés ; lors de toute décision d'aménagement important…"
            >
              <p>
                Mise à jour au moins annuelle à partir de onze salariés — et
                dans tous les cas après un aménagement important ou une
                information nouvelle sur un risque.
              </p>
            </LegalBadge>
            <LegalBadge
              reference="Art. L. 4121-3-1 CT"
              href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043893919"
              extrait="Le document unique d'évaluation des risques professionnels […] est conservé, dans ses versions successives, […] pendant une durée qui ne peut être inférieure à quarante ans."
            >
              <p>
                C&apos;est pour cela que l&apos;outil fige une version à
                chaque validation : les versions successives se conservent,
                elles ne s&apos;écrasent pas.
              </p>
            </LegalBadge>
          </div>
        </WhyCard>

        <div className="cartouche flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <p className="text-[0.88rem] text-muted-foreground">
            Première étape : choisir votre secteur d&apos;activité
            (restauration, commerce ou bureau — 3 secteurs couverts).
          </p>
          {duerp ? (
            <Link
              href={`/duerp/${duerp.id}/secteur`}
              className={buttonVariants({ size: "default" })}
            >
              Commencer mon DUERP →
            </Link>
          ) : (
            <form action={creerAction}>
              <button
                type="submit"
                className={buttonVariants({ size: "default" })}
              >
                Commencer mon DUERP →
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
