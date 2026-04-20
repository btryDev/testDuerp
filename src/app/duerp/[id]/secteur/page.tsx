import { notFound } from "next/navigation";
import { SecteurCard } from "@/components/duerps/SecteurCard";
import { AutresSecteurs } from "@/components/duerps/AutresSecteurs";
import { ConfirmerSecteurButton } from "@/components/duerps/ConfirmerSecteurButton";
import { WizardSteps } from "@/components/duerps/WizardSteps";
import { construireEtapes } from "@/lib/duerps/etapes";
import { getDuerp } from "@/lib/duerps/queries";
import {
  referentielsSectoriels,
  trouverReferentielParNaf,
} from "@/lib/referentiels";

export default async function SecteurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const duerp = await getDuerp(id);
  if (!duerp) notFound();

  const refRecommande = trouverReferentielParNaf(duerp.entreprise.codeNaf);
  const secteurChoisi = duerp.referentielSecteurId;

  const etapes = construireEtapes(id, "secteur", {
    secteurOk: Boolean(secteurChoisi),
    unitesOk: false,
    risquesOk: false,
    transversesOk: false,
  });

  const autresSecteurs = referentielsSectoriels
    .filter((r) => r.id !== refRecommande?.id)
    .map((r) => ({
      id: r.id,
      nom: r.nom,
      description: descriptionPourSecteur(r.id),
      nombreUnites: r.unitesTravailSuggerees.length,
      nombreRisques: r.risques.length,
      codesNaf: r.codesNaf,
    }));

  return (
    <div className="space-y-14">
      <WizardSteps etapes={etapes} />

      {refRecommande ? (
        <>
          <header className="max-w-2xl">
            <p className="label-admin">Secteur d&apos;activité</p>
            <p className="mt-4 text-[0.95rem] leading-[1.7] text-muted-foreground">
              À partir du code NAF{" "}
              <span className="font-mono text-ink">
                {duerp.entreprise.codeNaf}
              </span>
              , le secteur ci-dessous a été détecté. Confirmez pour charger
              les unités et risques types.
            </p>
          </header>

          <section className="cartouche relative overflow-hidden px-8 py-10 sm:px-12 sm:py-12">
            <span
              aria-hidden
              className="absolute left-0 top-0 h-1 w-20 bg-[color:var(--warm)]"
            />
            <p className="label-admin">Secteur détecté</p>

            <div className="mt-6 grid gap-12 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <h3 className="text-[1.65rem] font-semibold tracking-[-0.018em] leading-tight">
                  {refRecommande.nom}
                </h3>
                <p className="mt-4 max-w-xl text-[0.95rem] leading-[1.7] text-muted-foreground">
                  {descriptionPourSecteur(refRecommande.id)}
                </p>

                <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="[font-family:var(--font-mono)] text-[1.2rem] tabular-nums">
                      {String(refRecommande.unitesTravailSuggerees.length).padStart(2, "0")}
                    </span>
                    <span className="text-[0.82rem] text-muted-foreground">
                      unités pré-remplies
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="[font-family:var(--font-mono)] text-[1.2rem] tabular-nums">
                      {String(refRecommande.risques.length).padStart(2, "0")}
                    </span>
                    <span className="text-[0.82rem] text-muted-foreground">
                      risques référencés
                    </span>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:items-end">
                <ConfirmerSecteurButton
                  duerpId={id}
                  secteurId={refRecommande.id}
                />
                <AutresSecteurs
                  duerpId={id}
                  secteurs={autresSecteurs}
                  secteurChoisiId={secteurChoisi}
                  alignDroite
                />
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <header className="max-w-2xl">
            <p className="label-admin">Secteur d&apos;activité</p>
            <p className="mt-4 text-[0.95rem] leading-[1.7] text-muted-foreground">
              Le code NAF{" "}
              <span className="font-mono text-ink">
                {duerp.entreprise.codeNaf}
              </span>{" "}
              n&apos;est pas couvert par un référentiel dédié. Choisissez le
              secteur le plus proche — vous pourrez décocher les risques non
              applicables à l&apos;étape suivante.
            </p>
          </header>

          <section>
            <p className="label-admin mb-8">Secteurs disponibles</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {referentielsSectoriels.map((r) => (
                <SecteurCard
                  key={r.id}
                  duerpId={id}
                  secteurId={r.id}
                  nom={r.nom}
                  description={descriptionPourSecteur(r.id)}
                  nombreUnites={r.unitesTravailSuggerees.length}
                  nombreRisques={r.risques.length}
                  codesNaf={r.codesNaf}
                  recommande={false}
                  dejaChoisi={secteurChoisi === r.id}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function descriptionPourSecteur(id: string): string {
  switch (id) {
    case "restauration":
      return "Restaurants, brasseries, fast-food, cuisines collectives. Risques types : coupures, brûlures, chutes, TMS posturales, livraison.";
    case "commerce":
      return "Boutiques, petits commerces, commerces de bouche. Risques types : port de charges, chutes, agression / vol, posture en caisse.";
    case "bureau":
      return "Activités tertiaires : conseil, comptabilité, communication, informatique. Risques types : charge mentale, TMS écran, ambiance, RPS.";
    default:
      return "Référentiel sectoriel.";
  }
}
