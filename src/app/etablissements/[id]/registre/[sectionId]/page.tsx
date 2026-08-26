import { notFound } from "next/navigation";
import { CarteFiche, CorpsFiche, EcranFiche } from "@/components/ui-kit";
import { LABEL_ITEM } from "@/components/layout/sidebar-nav";
import {
  alimentationDeLaPartie,
  completudeDeLaFiche,
  CorpsFicheRegistre,
  NavigationFiches,
  tonCompletude,
  type FicheVoisine,
} from "@/components/registre";
import { saisiePourSection } from "@/lib/registre/champs";
import { aplatirRegistre } from "@/lib/registre/composition";
import { composerRegistreDeLEtablissement } from "@/lib/registre/queries";
import { ajouterLigneJournal, enregistrerFiche } from "@/lib/registre/actions";
import { avecProvenance, lireProvenance } from "@/lib/navigation/provenance";

export default async function FicheDuRegistrePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sectionId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, sectionId } = await params;
  const { de } = await searchParams;

  const registre = await composerRegistreDeLEtablissement(id);
  if (!registre) notFound();

  const base = `/etablissements/${id}`;
  const hrefRegistre = `${base}/registre`;

  // L'ordre du document — celui où une commission feuillettera le registre.
  const fiches = aplatirRegistre(registre.parties);

  // La complétude de chaque fiche, calculée une fois : elle sert à cette
  // fiche-ci et à désigner la prochaine qui attend des réponses.
  const etats = fiches.map(({ partie, due }) => ({
    partie,
    due,
    saisie: saisiePourSection(due.section.id),
    completude: completudeDeLaFiche(
      saisiePourSection(due.section.id),
      registre.contenus[due.section.id] ?? {},
      alimentationDeLaPartie(partie.id, base),
    ),
  }));

  const rang = etats.findIndex((e) => e.due.section.id === sectionId);
  // Une fiche qui n'est pas due pour cet établissement ne s'ouvre pas par son
  // URL : elle ne figure pas à son registre, et l'y laisser entrer donnerait
  // à saisir des réponses qui ne s'imprimeraient dans aucun document.
  if (rang === -1) notFound();
  const courante = etats[rang];

  const provenance = lireProvenance(de, id);
  const canonique = { href: hrefRegistre, label: LABEL_ITEM.registre };
  const depuisCetteFiche = `${hrefRegistre}/${sectionId}`;

  const action =
    courante.saisie?.forme === "journal"
      ? ajouterLigneJournal.bind(null, id, sectionId)
      : courante.saisie?.forme === "formulaire"
        ? enregistrerFiche.bind(null, id, sectionId)
        : undefined;

  // La suivante qui **attend des réponses**, pas la suivante tout court :
  // marcher dans l'ordre du document ferait traverser les trente et une
  // fiches tenues par le parc et le calendrier, où il n'y a rien à faire.
  // On cherche après celle-ci, puis on reprend au début — sans jamais
  // reproposer celle qu'on regarde.
  const attend = (i: number) =>
    i !== rang && tonCompletude(etats[i].completude) === "attente";
  const indices = etats.map((_, i) => i);
  const ordreDeRecherche = [
    ...indices.filter((i) => i > rang),
    ...indices.filter((i) => i < rang),
  ];
  const iSuivante = ordreDeRecherche.find(attend);
  const suivante: FicheVoisine | null =
    iSuivante === undefined
      ? null
      : {
          titre: etats[iSuivante].due.section.titre,
          href: avecProvenance(
            `${hrefRegistre}/${etats[iSuivante].due.section.id}`,
            depuisCetteFiche,
          ),
        };
  const restantes = indices.filter(attend).length;

  return (
    <EcranFiche provenance={provenance} canonique={canonique}>
      <CorpsFiche
        principal={
          <>
            <CorpsFicheRegistre
              titre={courante.due.section.titre}
              attendu={courante.due.section.attendu}
              raisons={courante.due.raisons}
              saisie={courante.saisie}
              contenu={registre.contenus[sectionId]}
              completude={courante.completude}
              action={action}
              hrefEdition={avecProvenance(
                `${base}/modifier`,
                depuisCetteFiche,
              )}
            />
            <CarteFiche titre="Et ensuite">
              <NavigationFiches
                suivante={suivante}
                restantes={restantes}
                hrefListe={hrefRegistre}
              />
            </CarteFiche>
          </>
        }
        cote={
          <CarteFiche titre="Cette fiche">
            <dl className="m-0 flex flex-col gap-3.5">
              <div>
                <dt className="m-0 text-[12.5px] text-[color:var(--board-slate-mid)]">
                  Partie du registre
                </dt>
                <dd className="m-0 mt-0.5 text-[14px] leading-[1.4] text-[color:var(--board-ink)]">
                  <span className="tabular-nums">{courante.partie.id}</span>{" "}
                  {courante.partie.titre}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[12.5px] text-[color:var(--board-slate-mid)]">
                  Rang dans le document
                </dt>
                <dd className="m-0 mt-0.5 text-[14px] leading-[1.4] tabular-nums text-[color:var(--board-ink)]">
                  {rang + 1} sur {etats.length}
                </dd>
              </div>
            </dl>
          </CarteFiche>
        }
      />
    </EcranFiche>
  );
}
