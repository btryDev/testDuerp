import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";
import { PictoEquipement } from "@/components/equipements/PictoEquipement";
import { PreRemplissagePanel } from "@/components/equipements/PreRemplissagePanel";
import { SupprimerEquipementButton } from "@/components/equipements/SupprimerEquipementButton";
import { getEtablissement } from "@/lib/etablissements/queries";
import {
  grouperParCategorie,
  listerEquipementsDeLEtablissement,
} from "@/lib/equipements/queries";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import { suggererEquipements } from "@/lib/equipements/pre-remplissage";
import { etatVerificationsParEquipement } from "@/lib/equipements/etat-verifications";
import type { EtatEquipement } from "@/lib/equipements/etat-verifications";
import {
  CHAMP_SANS_ECHEANCE,
  ENCRE_SANS_ECHEANCE,
  EXPLICATION_SANS_ECHEANCE,
  LIBELLE_SANS_ECHEANCE,
  equipementsSansEcheance,
  type MotifSansEcheance,
} from "@/lib/equipements/hors-referentiel";
import { CHAMP_ETAT, ENCRE_ETAT } from "@/lib/calendrier/etats";
import { formaterDateLongueFr, formaterDateCourteFr } from "@/lib/dates";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return formaterDateLongueFr(d);
}

export default async function EquipementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bienvenue?: string }>;
}) {
  const { id } = await params;
  const { bienvenue } = await searchParams;
  const etab = await getEtablissement(id);
  if (!etab) notFound();

  const [equipements, etatsVerifs, sansEcheance] = await Promise.all([
    listerEquipementsDeLEtablissement(id),
    // Le parc ne disait rien de son état de vérification : on lisait un
    // inventaire, pas une situation.
    etatVerificationsParEquipement(id),
    // Et il ne disait rien du silence : un appareil pour lequel le
    // référentiel ne produit aucune échéance était rendu comme un appareil
    // à jour — c'est-à-dire comme une réponse alors que personne n'en avait
    // donné (cf. `hors-referentiel.ts`).
    equipementsSansEcheance(id),
  ]);
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

      {/* Bandeau de continuité wizard → équipements (éphémère : le
          paramètre disparaît à la navigation suivante). */}
      {bienvenue === "1" && (
        <div className="cartouche mt-8 px-6 py-5 sm:px-8">
          <p className="text-[0.95rem] leading-relaxed">
            <strong>Votre espace est créé.</strong> Dernière étape de la mise
            en place : cochez les équipements présents chez vous. Votre
            calendrier de vérifications se génère dans la foulée — chaque
            échéance citera son texte réglementaire.
          </p>
        </div>
      )}

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
        <EmptyState
          titre="Les équipements de votre établissement alimentent tout le reste"
          pourquoi="Électricité, extincteurs, hotte, ascenseur… Chaque équipement déclenche des vérifications périodiques qui doivent être faites par un organisme ou un technicien. C'est la déclaration ici qui dit à l'outil quoi mettre dans votre calendrier."
          quoiFaire={
            suggestionsRestantes.length > 0
              ? "parcourez les suggestions ci-dessus (elles sont basées sur votre secteur d'activité) et cochez celles qui s'appliquent, ou ajoutez manuellement via le bouton en haut."
              : "ajoutez un premier équipement via le bouton « + Ajouter un équipement » en haut de la page."
          }
          cta="Ajouter un équipement"
          ctaHref={`/etablissements/${id}/equipements/nouveau`}
        />
      ) : (
        <section className="space-y-8">
          {[...parCategorie.entries()].map(([cat, liste]) => (
            <div key={cat} className="space-y-3">
              <h2 className="flex items-center gap-3 text-[1.05rem] font-semibold tracking-[-0.012em]">
                <PictoEquipement categorie={cat} taille={36} />
                <span>
                  {LABEL_CATEGORIE_EQUIPEMENT[cat]}
                  <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                    · {liste.length} équipement{liste.length > 1 ? "s" : ""}
                  </span>
                </span>
              </h2>

              <ul className="cartouche divide-y divide-dashed divide-rule/50">
                {liste.map((eq) => {
                  const mes = formatDate(eq.dateMiseEnService);
                  const etat = etatsVerifs.get(eq.id);
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
                        <EtatVerifications
                          etat={etat}
                          motif={sansEcheance.get(eq.id)}
                          href={`/etablissements/${id}/calendrier`}
                        />
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

/**
 * L'état de vérification d'un appareil, en une ligne.
 *
 * Trois faits, jamais un jugement : ce qui est dépassé, le prochain
 * rendez-vous, la dernière vérification connue. L'absence de vérification
 * connue est dite en clair — elle n'est pas la même chose qu'« à jour », et
 * l'outil ne certifie rien (cf. garde-fous produit).
 *
 * `motif` porte le cas limite : le référentiel ne produit AUCUNE échéance
 * pour cet appareil. Il passe devant tout le reste, parce que c'est le seul
 * état que la ligne ne pouvait pas montrer — un appareil muet et un appareil
 * à jour affichaient la même chose, rien.
 */
function EtatVerifications({
  etat,
  motif,
  href,
}: {
  etat: EtatEquipement | undefined;
  motif: MotifSansEcheance | undefined;
  href: string;
}) {
  // Le motif se pose **au-dessus** de l'état, il ne le remplace pas. Les deux
  // ne viennent pas de la même source : le motif se lit sur le référentiel,
  // l'état sur les `Verification` en base. Un équipement sous pression déclaré
  // « non soumis au suivi en service » cumule les deux — il n'a plus d'échéance
  // à venir, mais il garde ses vérifications réalisées. Rendre le motif seul
  // effaçait de l'écran la dernière vérification connue, c'est-à-dire la seule
  // information que son propriétaire ait à montrer en cas de contrôle.
  const pastille = motif ? (
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8rem] text-muted-foreground">
      <span
        className="rounded-full px-2 py-0.5 text-[0.72rem] font-semibold"
        style={{
          background: CHAMP_SANS_ECHEANCE,
          color: ENCRE_SANS_ECHEANCE,
        }}
      >
        {LIBELLE_SANS_ECHEANCE[motif]}
      </span>
      <span>{EXPLICATION_SANS_ECHEANCE[motif]}</span>
    </p>
  ) : null;

  // Sans état à afficher, la pastille se suffit : répéter « aucune vérification
  // rattachée » sous une explication qui vient de le dire serait du bruit.
  if (motif && !etat) return pastille;

  if (!etat) {
    return (
      <p className="mt-2 text-[0.8rem] text-muted-foreground">
        Aucune vérification périodique rattachée à cet équipement.
      </p>
    );
  }

  return (
    <>
      {pastille}
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8rem] text-muted-foreground">
      {etat.enRetard > 0 ? (
        <Link
          href={href}
          className="rounded-full px-2 py-0.5 text-[0.72rem] font-semibold underline-offset-4 hover:underline"
          style={{
            background: CHAMP_ETAT.enRetard,
            color: ENCRE_ETAT.enRetard,
          }}
        >
          {etat.enRetard} vérification{etat.enRetard > 1 ? "s" : ""} en retard
        </Link>
      ) : null}

      {etat.aPlanifier > 0 ? (
        <span
          className="rounded-full px-2 py-0.5 text-[0.72rem] font-semibold"
          style={{
            background: CHAMP_ETAT.aPlanifier,
            color: ENCRE_ETAT.aPlanifier,
          }}
        >
          {etat.aPlanifier} à planifier
        </span>
      ) : null}

      {etat.prochaine ? (
        <span>
          {/* Une occurrence dépassée est la « prochaine » au sens du
              calcul, jamais au sens de la langue : annoncer « Prochaine :
              4 août » un 20 août serait faux. */}
          {etat.prochaine.etat === "enRetard" ? "Attendue le " : "Prochaine : "}
          {formaterDateCourteFr(etat.prochaine.date)} — {etat.prochaine.libelle}
        </span>
      ) : null}

      <span>
        {etat.derniere
          ? `Dernière vérification le ${formaterDateCourteFr(etat.derniere)}`
          : "Aucune vérification connue à ce jour"}
      </span>
      </p>
    </>
  );
}
