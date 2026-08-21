import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/EmptyState";
import { BandeauParc } from "@/components/equipements/BandeauParc";
import {
  CarteCategorie,
  urgenceCategorie,
  type AppareilListe,
} from "@/components/equipements/CarteCategorie";
import { PreRemplissagePanel } from "@/components/equipements/PreRemplissagePanel";
import { getEtablissement } from "@/lib/etablissements/queries";
import {
  grouperParCategorie,
  listerEquipementsDeLEtablissement,
} from "@/lib/equipements/queries";
import { suggererEquipements } from "@/lib/equipements/pre-remplissage";
import {
  etatVerificationsParEquipement,
  resumerEquipement,
} from "@/lib/equipements/etat-verifications";
import { compterEtatCalendrier } from "@/lib/calendrier/queries";
import { avecProvenance, origineDepuis } from "@/lib/navigation/provenance";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";

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

  const base = `/etablissements/${id}`;
  // Les liens vers une fiche emportent cet écran : le retour ramènera ici,
  // pas au parent canonique par défaut (ADR-014).
  const origine = origineDepuis(
    `${base}/equipements`,
    bienvenue ? { bienvenue } : {},
  );

  const [equipements, etatsVerifs, compteurs] = await Promise.all([
    listerEquipementsDeLEtablissement(id),
    // Le parc ne disait rien de son état de vérification : on lisait un
    // inventaire, pas une situation.
    etatVerificationsParEquipement(id),
    // Les chiffres du bandeau viennent de la même partition que l'en-tête
    // du calendrier et le tableau de bord — trois écrans, un seul compte.
    compterEtatCalendrier(id),
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

  // Une section par catégorie, la plus en peine en tête : sur un parc de
  // quinze appareils, l'ordre alphabétique enterrait le seul retard.
  const sections = [...parCategorie.entries()]
    .map(([categorie, liste]) => {
      const appareils: AppareilListe[] = liste.map((eq) => ({
        id: eq.id,
        libelle: eq.libelle,
        // Le « où » de la vitrine. Il portera le bâtiment quand les
        // bâtiments existeront (ADR-019) ; la localisation est le seul
        // lieu dont on dispose aujourd'hui.
        lieu: eq.localisation,
        resume: resumerEquipement(etatsVerifs.get(eq.id)),
        href: avecProvenance(`${base}/equipements/${eq.id}`, origine),
      }));
      const periodicites = liste.flatMap(
        (eq) => etatsVerifs.get(eq.id)?.periodicites ?? [],
      );
      return {
        categorie: categorie as CategorieEquipement,
        appareils,
        periodicites,
      };
    })
    .sort(
      (a, b) => urgenceCategorie(b.appareils) - urgenceCategorie(a.appareils),
    );

  return (
    <main className="flex flex-1 flex-col bg-[color:var(--board-canvas)] pb-16">
      <BandeauParc
        hrefRetour={base}
        enRetard={compteurs.enRetard}
        proches={compteurs.aVenir}
        total={equipements.length}
        hrefAjouter={`${base}/equipements/nouveau`}
        suggestions={
          suggestionsRestantes.length > 0
            ? { nombre: suggestionsRestantes.length, href: "#suggestions" }
            : null
        }
      />

      <div className="flex flex-col gap-7 px-[var(--board-gutter)] pt-6">
        {/* Bandeau de continuité wizard → équipements (éphémère : le
            paramètre disparaît à la navigation suivante). */}
        {bienvenue === "1" && (
          <div className="carte-board px-7 py-5 sm:px-8">
            <p className="m-0 text-[14.5px] leading-[1.6] text-[color:var(--board-ink)]">
              <strong>Votre espace est créé.</strong> Dernière étape de la mise
              en place&nbsp;: déclarez les équipements présents chez vous. Votre
              calendrier de vérifications se génère dans la foulée — chaque
              échéance citera son texte réglementaire.
            </p>
          </div>
        )}

        {suggestionsRestantes.length > 0 && (
          <div id="suggestions" className="scroll-mt-6">
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
            ctaHref={`${base}/equipements/nouveau`}
          />
        ) : (
          sections.map((s) => (
            <CarteCategorie
              key={s.categorie}
              categorie={s.categorie}
              appareils={s.appareils}
              periodicites={s.periodicites}
              hrefAjouter={`${base}/equipements/nouveau?categorie=${s.categorie}`}
            />
          ))
        )}
      </div>
    </main>
  );
}
