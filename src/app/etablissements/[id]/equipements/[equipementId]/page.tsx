import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CarteFiche,
  ChampFiche,
  ChampsFiche,
  CorpsFiche,
  EcranFiche,
  LigneFiche,
  LignesFiche,
  PastilleFiche,
  TuileDate,
  TuileMuette,
} from "@/components/ui-kit";
import { BadgeResultat } from "@/components/rapports/BadgeResultat";
import { HeroEquipement } from "@/components/equipements/HeroEquipement";
import { SupprimerEquipementButton } from "@/components/equipements/SupprimerEquipementButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getFicheEquipement,
  lignesAFaire,
  lignesHistoire,
  obligationsDeLEquipement,
} from "@/lib/equipements/fiche";
import { construireFrise, type JalonFrise } from "@/lib/equipements/frise";
import { LABEL_CATEGORIE_EQUIPEMENT } from "@/lib/equipements/labels";
import { LABEL_PERIODICITE, LABEL_REALISATEUR } from "@/lib/calendrier/labels";
import { LABEL_RESULTAT } from "@/lib/rapports/schema";
import type { RegistreLigne } from "@/lib/calendrier/etats";
import {
  formaterDateLongueFr,
  formaterJourMoisFr,
  formaterMoisAnneeFr,
  joursCivilsEntre,
} from "@/lib/dates";
import { avecProvenance, lireProvenance } from "@/lib/navigation/provenance";

/** Le délai d'une ligne « à faire », dit en jours plutôt qu'en date : un
 *  retard d'un jour et un retard de six mois n'appellent pas le même geste,
 *  et le lecteur ne devrait pas avoir à soustraire deux dates pour le voir. */
function delai(date: Date | null, maintenant: Date): string {
  if (!date) return "sans date convenue";
  const jours = joursCivilsEntre(maintenant, date);
  if (jours === 0) return "aujourd'hui";
  if (jours === 1) return "demain";
  if (jours > 0) return `dans ${jours} jours`;
  return jours === -1 ? "hier" : `en retard de ${-jours} jours`;
}

/** Le même délai, tourné pour s'enchâsser dans une phrase : « attendue
 *  depuis 68 jours », « attendue dans 8 jours ». */
function quand(date: Date | null, maintenant: Date): string {
  if (!date) return "sans date convenue";
  const jours = joursCivilsEntre(maintenant, date);
  if (jours === 0) return "aujourd'hui";
  if (jours === 1) return "demain";
  if (jours > 0) return `dans ${jours} jours`;
  return jours === -1 ? "depuis hier" : `depuis ${-jours} jours`;
}

export default async function EquipementDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; equipementId: string }>;
  searchParams: Promise<{ de?: string }>;
}) {
  const { id, equipementId } = await params;
  const { de } = await searchParams;

  const eq = await getFicheEquipement(equipementId);
  if (!eq || eq.etablissementId !== id) notFound();

  const base = `/etablissements/${id}`;
  const provenance = lireProvenance(de, id);
  const parc = { href: `${base}/equipements`, label: "Équipements" };
  // Les liens que cette fiche pose s'annoncent eux-mêmes : la chaîne de
  // provenance reste bornée à un saut (ADR-014).
  const depuisCetteFiche = `${base}/equipements/${equipementId}`;

  // Page serveur : l'horloge est lue une fois par requête. Deux `new Date()`
  // séparés par un `await` peuvent tomber de part et d'autre de minuit.
  const maintenant = new Date();

  const aFaire = lignesAFaire(eq, base, maintenant);
  const histoire = lignesHistoire(eq, base, maintenant);
  const obligations = obligationsDeLEquipement(eq);

  // Le rendez-vous de tête : la première ligne datée de « à faire ». Une
  // occurrence à planifier n'en est pas un — sa date est une date de
  // génération (ADR-010).
  const tete = aFaire.find((l) => l.date !== null) ?? null;
  const etatTete: RegistreLigne = tete?.etat ?? (aFaire.length > 0 ? "aPlanifier" : "faite");
  const ecarts = aFaire.filter((l) => l.genre === "action").length;
  const enRetard = aFaire.filter((l) => l.etat === "enRetard").length;

  // ------------------------------------------------------------------
  // La frise. Quatre repères principaux au plus : au-delà, les étiquettes
  // se chevauchent et la ligne cesse de se lire d'un coup d'œil.
  // ------------------------------------------------------------------
  const jalons: JalonFrise[] = [];
  if (eq.dateMiseEnService) {
    jalons.push({
      cle: "mise-en-service",
      date: eq.dateMiseEnService,
      libelle: "Mise en service",
      etat: "aPlanifier",
    });
  }
  for (const h of histoire.filter((l) => l.cle !== "mise-en-service").slice(0, 2)) {
    jalons.push({
      cle: h.cle,
      date: h.date,
      libelle: h.resultat ? LABEL_RESULTAT[h.resultat] : "Vérifiée",
      etat: "faite",
    });
  }
  if (tete) {
    jalons.push({
      cle: tete.cle,
      date: tete.date!,
      // Sur la rangée basse, l'étiquette porte sa propre date : elle est
      // seule de sa ligne et n'a pas le sur-titre mois des autres.
      libelle: `${formaterJourMoisFr(tete.date!)} · ${
        tete.genre === "action" ? "écart à lever" : "vérification"
      }`,
      etat: tete.etat,
      vedette: true,
    });
  }
  // Les autres échéances datées passent en second plan : elles situent le
  // rythme sans revendiquer d'étiquette pleine.
  for (const l of aFaire.filter((l) => l !== tete && l.date !== null).slice(0, 2)) {
    jalons.push({
      cle: l.cle,
      date: l.date!,
      libelle: `${formaterJourMoisFr(l.date!)} · ${l.genre === "action" ? "action" : "vérification"}`,
      etat: l.etat,
      second: true,
    });
  }
  const frise = construireFrise({ jalons, maintenant });

  // Le chapeau dit deux faits, jamais un verdict : ce qui est attendu, et
  // ce qui est déjà au dossier. Pas un mot de conformité.
  const trace =
    histoire.length > 0
      ? `Dernière trace au dossier : ${formaterDateLongueFr(histoire[0].date)}.`
      : "Aucune preuve n'est encore au dossier pour cet appareil.";
  const chapeau = tete
    ? `${
        tete.genre === "action"
          ? `Un écart reste à lever ${quand(tete.date, maintenant)}`
          : `Une vérification est attendue ${quand(tete.date, maintenant)}`
      }. ${trace}`
    : aFaire.length > 0
      ? `Des vérifications sont rattachées à cet appareil, mais aucune date n'a encore été convenue. ${trace}`
      : `Aucune échéance n'est ouverte sur cet appareil à ce jour. ${trace}`;

  return (
    <EcranFiche provenance={provenance} canonique={parc}>
      <HeroEquipement
        categorie={eq.categorie}
        date={tete?.date ?? null}
        etat={etatTete}
        surtitre={
          <>
            Équipement · {LABEL_CATEGORIE_EQUIPEMENT[eq.categorie]}
            {eq.localisation ? ` · ${eq.localisation}` : null}
          </>
        }
        titre={eq.libelle}
        chapeau={chapeau}
        frise={frise}
        pastilles={
          <>
            {!eq.actif && (
              <PastilleFiche ton="retard">Retiré du parc</PastilleFiche>
            )}
            {enRetard > 0 && (
              <PastilleFiche ton="retard">
                {enRetard} échéance{enRetard > 1 ? "s" : ""} en retard
              </PastilleFiche>
            )}
            {ecarts > 0 && (
              <PastilleFiche ton="proche">
                {ecarts} écart{ecarts > 1 ? "s" : ""} à lever
              </PastilleFiche>
            )}
            {eq.dateMiseEnService && (
              <PastilleFiche ton="encre">
                En service depuis {formaterMoisAnneeFr(eq.dateMiseEnService)}
              </PastilleFiche>
            )}
            <PastilleFiche ton="encre">
              {obligations.length} obligation{obligations.length > 1 ? "s" : ""}
            </PastilleFiche>
          </>
        }
        actions={
          <>
            <Link
              href={`${base}/equipements/${equipementId}/modifier`}
              className={cn(
                buttonVariants({ variant: "boardFantome", size: "board" }),
              )}
            >
              Modifier
            </Link>
            {tete && tete.genre === "verification" ? (
              <Link
                href={avecProvenance(tete.href, depuisCetteFiche)}
                className={cn(
                  buttonVariants({ variant: "boardBlanc", size: "board" }),
                )}
              >
                Déposer un rapport
              </Link>
            ) : null}
          </>
        }
      />

      <CorpsFiche
        principal={
          <>
            <CarteFiche
              titreFort={
                <>
                  À faire{" "}
                  <span className="accent-serif text-[21px] text-[color:var(--board-slate-soft)]">
                    sur cet équipement
                  </span>
                </>
              }
              droite={
                aFaire.length > 0 ? (
                  <PastilleFiche ton="neutre">{aFaire.length}</PastilleFiche>
                ) : undefined
              }
              corpsClassName="mt-4"
            >
              {aFaire.length === 0 ? (
                <p className="m-0 px-7 pb-6 text-[14px] leading-[1.55] text-[color:var(--board-slate-mid)] sm:px-8">
                  Rien n&apos;est ouvert sur cet appareil. Cela ne veut pas dire
                  qu&apos;il est conforme&nbsp;: cela veut dire qu&apos;aucune
                  échéance ni aucun écart n&apos;est enregistré à ce jour.
                </p>
              ) : (
                <LignesFiche>
                  {aFaire.map((l) => (
                    <LigneFiche
                      key={l.cle}
                      href={avecProvenance(l.href, depuisCetteFiche)}
                      voile={
                        l.etat === "enRetard"
                          ? "retard"
                          : l.etat === "proche"
                            ? "proche"
                            : "aucun"
                      }
                      tuile={
                        l.date ? (
                          <TuileDate date={l.date} etat={l.etat} />
                        ) : (
                          <TuileMuette>à dater</TuileMuette>
                        )
                      }
                      surtitre={
                        <span
                          style={{
                            color:
                              l.etat === "enRetard"
                                ? "var(--board-signal-ink)"
                                : l.etat === "proche"
                                  ? "var(--board-amber-ink)"
                                  : undefined,
                          }}
                        >
                          {l.surtitre} · {delai(l.date, maintenant)}
                        </span>
                      }
                      titre={l.libelle}
                      detail={l.detail}
                    />
                  ))}
                </LignesFiche>
              )}
            </CarteFiche>

            <CarteFiche
              titreFort={
                <>
                  Ce qui a été{" "}
                  <span className="accent-serif text-[21px] text-[color:var(--board-slate-soft)]">
                    fait
                  </span>
                </>
              }
              droite={
                <Link
                  href={`${base}/registre`}
                  className="text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
                >
                  Tout voir dans le registre →
                </Link>
              }
              corpsClassName="mt-4"
            >
              {histoire.length === 0 ? (
                <p className="m-0 px-7 pb-6 text-[14px] leading-[1.55] text-[color:var(--board-slate-mid)] sm:px-8">
                  Aucune trace au dossier pour cet appareil — ni rapport, ni
                  date de mise en service.
                </p>
              ) : (
                <LignesFiche>
                  {histoire.map((h) => (
                    <LigneFiche
                      key={h.cle}
                      href={
                        h.href
                          ? avecProvenance(h.href, depuisCetteFiche)
                          : undefined
                      }
                      tuile={<TuileDate date={h.date} etat={h.etat} />}
                      surtitre={`${h.surtitre} · ${formaterMoisAnneeFr(h.date)}`}
                      titre={h.libelle}
                      detail={h.detail}
                      droite={
                        h.resultat ? (
                          <BadgeResultat resultat={h.resultat} />
                        ) : undefined
                      }
                    />
                  ))}
                </LignesFiche>
              )}
            </CarteFiche>
          </>
        }
        cote={
          <>
            <CarteFiche
              className="bg-[color:var(--board-blue-pale)]"
              titreFort={
                <>
                  Pourquoi{" "}
                  <span className="accent-serif text-[21px] text-[color:var(--board-blue-ink)]">
                    on le vérifie
                  </span>
                </>
              }
              corpsClassName="px-7 pb-7 pt-4 sm:px-8"
            >
              {obligations.length === 0 ? (
                <p className="m-0 text-[13px] leading-[1.55] text-[color:var(--board-slate-mid)]">
                  Aucune obligation du référentiel n&apos;est rattachée à cet
                  appareil pour l&apos;instant.
                </p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {obligations.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-[20px] bg-[color:var(--board-card)] px-4 py-4"
                    >
                      <p className="m-0 text-[14px] font-semibold leading-[1.35] text-[color:var(--board-ink)]">
                        {o.libelle}
                      </p>
                      {/* La référence qui **fonde** l'obligation vient en
                          premier dans le référentiel (ADR-003) : c'est celle
                          qu'on citerait seule devant un inspecteur. */}
                      <p className="m-0 mt-1.5 text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                        {o.referencesLegales[0].reference}
                      </p>
                      <span className="pastille-board mt-3 bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]">
                        {LABEL_PERIODICITE[o.periodicite]}
                      </span>
                    </div>
                  ))}
                  <Link
                    href={`${base}/guide`}
                    className="text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] hover:text-[color:var(--board-ink)]"
                  >
                    Lire l&apos;explication dans Comprendre →
                  </Link>
                </div>
              )}
            </CarteFiche>

            <CarteFiche titre="Fiche">
              <ChampsFiche>
                <ChampFiche cle="Catégorie">
                  {LABEL_CATEGORIE_EQUIPEMENT[eq.categorie]}
                </ChampFiche>
                <ChampFiche cle="Localisation">
                  {eq.localisation ?? (
                    <span className="text-[color:var(--board-slate-soft)]">
                      Non précisée
                    </span>
                  )}
                </ChampFiche>
                <ChampFiche cle="Mise en service">
                  {eq.dateMiseEnService ? (
                    formaterDateLongueFr(eq.dateMiseEnService)
                  ) : (
                    <span className="text-[color:var(--board-slate-soft)]">
                      Non renseignée
                    </span>
                  )}
                </ChampFiche>
                <ChampFiche cle="Réalisateur requis">
                  {realisateursRequis(obligations) ?? (
                    <span className="text-[color:var(--board-slate-soft)]">
                      Aucune obligation rattachée
                    </span>
                  )}
                </ChampFiche>
              </ChampsFiche>
            </CarteFiche>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-dashed border-[color:var(--board-slate)] px-6 py-5">
              <div className="min-w-[200px] flex-1">
                <p className="m-0 text-[13.5px] font-semibold text-[color:var(--board-ink)]">
                  Cet équipement n&apos;est plus là&nbsp;?
                </p>
                <p className="m-0 mt-1 text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
                  Le retirer supprime ses vérifications à venir. Ses rapports et
                  ses actions restent au dossier.
                </p>
              </div>
              <SupprimerEquipementButton
                id={eq.id}
                redirectTo={(provenance ?? parc).href}
              />
            </div>
          </>
        }
      />
    </EcranFiche>
  );
}

/**
 * Qui a le droit de faire ces contrôles, d'après le référentiel. Plusieurs
 * obligations peuvent l'exiger différemment : on les cite toutes plutôt que
 * de trancher à leur place.
 */
function realisateursRequis(
  obligations: ReturnType<typeof obligationsDeLEquipement>,
): string | null {
  const vus = new Set<string>();
  for (const o of obligations) {
    for (const r of o.realisateurs) vus.add(LABEL_REALISATEUR[r]);
  }
  if (vus.size === 0) return null;
  return [...vus].join(", ");
}
