"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { MarqueCategorie } from "@/components/equipements/MarqueCategorie";
import {
  CATEGORIES_AERATION,
  CATEGORIES_EQUIPEMENT,
  CATEGORIES_TRI_ETAT,
  VALEURS_TRI_ETAT,
  valeurTriEtat,
  type ChampTriEtat,
} from "@/lib/equipements/schema";
import {
  DESCRIPTION_CATEGORIE,
  LABEL_CATEGORIE_EQUIPEMENT,
} from "@/lib/equipements/labels";
import {
  FAMILLES_ESP,
  LABEL_FAMILLE_ESP,
  verdictSuiviEnService,
  type FamilleEsp,
} from "@/lib/equipements/esp";
import type { CategorieEquipement } from "@/lib/referentiels/types-communs";
import type { EquipementActionState } from "@/lib/equipements/actions";

type Valeurs = {
  libelle?: string;
  categorie?: CategorieEquipement;
  batimentId?: string;
  localisation?: string | null;
  dateMiseEnService?: Date | null;
  nombre?: number | null;
  familleEsp?: string | null;
  pressionMaxAdmissibleBar?: number | null;
  volumeLitres?: number | null;
  aGroupeElectrogene?: boolean;
  estLocalPollutionSpecifique?: boolean;
  nbVehiculesParkingCouvert?: number | null;
  notes?: string | null;
} & Partial<Record<ChampTriEtat, boolean | null>>;

/**
 * Libellés des sept questions à trois états.
 *
 * Elles bornent des obligations réelles : y répondre « non » retire une
 * échéance du calendrier. Deux exigences de rédaction, donc — être
 * compréhensible sans connaître le règlement (on décrit l'objet physique, pas
 * l'article), et dire ce que la réponse déclenche, pour que le dirigeant
 * comprenne l'enjeu de la question plutôt que de cliquer au hasard.
 *
 * « Je ne sais pas encore » est une réponse légitime et le défaut : tant
 * qu'elle est retenue, l'obligation reste affichée. On ne fait jamais
 * disparaître une vérification faute de réponse.
 */
const QUESTIONS_TRI_ETAT: Record<
  ChampTriEtat,
  { question: string; aide: string }
> = {
  estVmcGaz: {
    question: "Cette VMC est-elle raccordée à des appareils à gaz ?",
    aide: "On parle de « VMC-Gaz » : la ventilation évacue aussi les produits de combustion de chaudières ou de chauffe-eau au gaz. Si oui, entretien et vérification annuels par un professionnel sous contrat écrit (arrêté du 25 avril 1985).",
  },
  aRobinetsIncendieArmes: {
    question:
      "Votre établissement dispose-t-il de robinets d'incendie armés (RIA) ?",
    aide: "Un RIA est un tuyau souple enroulé dans un coffret mural, relié en permanence à l'eau — à ne pas confondre avec un extincteur. Si oui, vérification annuelle (débit, pression, fonctionnement).",
  },
  aExtinctionAutomatique: {
    question:
      "Un système d'extinction automatique est-il installé sur les appareils de cuisson ?",
    aide: "Dispositif fixé au-dessus des friteuses ou des plaques, qui projette un agent extincteur en cas de départ de feu. Si oui, vérification annuelle des cartouches, capteurs et circuits de déclenchement.",
  },
  sertAuLevageDePersonnes: {
    question: "Cet appareil sert-il à lever des personnes ?",
    aide: "Nacelle, plate-forme élévatrice, ou tout appareil utilisé même occasionnellement pour élever quelqu'un. Si oui, la vérification générale passe de annuelle à semestrielle. Un transpalette ou un monte-charge de marchandises : répondez « non ».",
  },
  estMuParForceHumaine: {
    question:
      "Cet appareil est-il mû par la force humaine employée directement ?",
    aide: "Un treuil à manivelle, un palan à chaîne actionné à la main, une nacelle poussée et montée à la force du bras — par opposition à un appareil motorisé, électrique, hydraulique ou thermique. Si oui ET qu'il sert à élever un poste de travail, la vérification a lieu tous les trois mois et non tous les six.",
  },
  estChariotOuGerbeur: {
    question:
      "Cet appareil est-il un chariot élévateur, un gerbeur ou un hayon élévateur ?",
    aide: "Un engin qui soulève une charge en hauteur, au-delà de ce qu'il faut pour la décoller du sol. Si oui, la vérification générale a lieu tous les six mois et non tous les ans. Un transpalette qui ne fait que décoller la palette pour la rouler : répondez « non », il n'est pas concerné par ces vérifications.",
  },
  aAccessoiresDeLevage: {
    question: "Utilisez-vous des accessoires de levage avec cet appareil ?",
    aide: "Élingues, chaînes, câbles, crochets, anneaux, manilles, palonniers. Si oui, ces accessoires font l'objet d'une vérification annuelle distincte de celle de l'appareil.",
  },
  estSoumisSuiviEnService: {
    question:
      "Cet équipement est-il suivi en service au titre de l'arrêté du 20 novembre 2017 ?",
    aide: "Les récipients sous pression ne sont concernés qu'au-delà de seuils de pression et de volume. Votre notice, votre plaque signalétique ou votre installateur l'indiquent. En cas de doute, laissez « Je ne sais pas encore » : les échéances restent affichées.",
  },
  estChargeSousSeuilControle: {
    question:
      "La charge en fluide frigorigène est-elle inférieure au seuil de contrôle ?",
    aide: "Le contrôle d'étanchéité ne s'impose qu'au-delà de 5 tonnes équivalent CO2 — quelques kilogrammes seulement selon le fluide —, ou de 1 kg pour les fluides insaturés (R-1234yf, R-454C…). Beaucoup de petits meubles froids récents fonctionnent au R-290 (propane), qui n'entre pas dans le champ. Le fluide et la charge figurent sur la plaque signalétique ; votre frigoriste fait la conversion. Répondez « oui » seulement si vous en êtes sûr : le contrôle disparaît alors du calendrier. En cas de doute, laissez « Je ne sais pas encore ».",
  },
  estHermetiquementScelleSousSeuil: {
    question:
      "Cet appareil est-il hermétiquement scellé et étiqueté comme tel ?",
    aide: "Un appareil hermétiquement scellé a son circuit frigorifique fermé en usine, sans raccord démontable, et porte cette mention sur sa plaque. Le règlement le dispense de contrôle d'étanchéité s'il contient en outre moins de 10 tonnes équivalent CO2 de fluide (ou moins de 2 kg pour un fluide insaturé, type R-1234yf ou R-454C). Répondez « oui » seulement si les deux sont vrais : scellé et étiqueté, et sous ce seuil. Sinon, laissez « Je ne sais pas encore » : les contrôles restent affichés.",
  },
  estChargeSuperieure50TCo2: {
    question:
      "La charge en fluide frigorigène dépasse-t-elle 50 tonnes équivalent CO2 ?",
    aide: "Le chiffre ne se lit pas sur la porte : il figure sur le dernier rapport de contrôle d'étanchéité ou sur la fiche d'intervention de votre frigoriste, qui le calcule à partir du fluide et de la charge en kilogrammes. Pour un fluide insaturé (R-1234ze, R-454C…), le règlement raisonne en kilogrammes et le palier est de 10 kg. Si oui, le contrôle passe de douze à six mois. En cas de doute, laissez « Je ne sais pas encore » : le contrôle annuel reste affiché.",
  },
  estChargeSuperieure500TCo2: {
    question:
      "La charge en fluide frigorigène dépasse-t-elle 500 tonnes équivalent CO2 ?",
    aide: "Même source que la question précédente, palier supérieur — 100 kg pour un fluide insaturé. Il correspond à plusieurs centaines de kilogrammes de fluide, soit une centrale de production de froid, pas un groupe de chambre froide. Si oui, le contrôle passe à trois mois. En cas de doute, laissez « Je ne sais pas encore ».",
  },
  aDetectionDeFuites: {
    question:
      "Un système fixe de détection des fuites est-il installé sur cette installation ?",
    aide: "Un détecteur permanent, relié à une alarme, qui signale une fuite de fluide frigorigène sans intervention humaine — à ne pas confondre avec le contrôle d'étanchéité lui-même, ni avec une sonde de température. S'il y en a un, le règlement double l'intervalle entre deux contrôles. En cas de doute, laissez « Je ne sais pas encore » : c'est l'intervalle le plus court qui reste affiché.",
  },
  dessertLocauxSommeil: {
    question:
      "Votre établissement dispose-t-il de locaux où des personnes dorment ?",
    aide: "Chambres d'hôtel, hébergement, internat, dortoir, logement de fonction ouvert au public. Un restaurant, un commerce ou un bureau sans hébergement : répondez « non ». En 5ᵉ catégorie, c'est ce qui déclenche la visite périodique de la commission de sécurité.",
  },
};

type Props = {
  action: (
    prev: EquipementActionState,
    formData: FormData,
  ) => Promise<EquipementActionState>;
  valeursInitiales?: Valeurs;
  /** Les bâtiments de l'établissement. Le champ n'est rendu qu'à partir de
   *  deux : en mono-bâtiment l'action rattache au seul existant (ADR-019). */
  batiments?: { id: string; nom: string }[];
  libelleSubmit: string;
  labelAnnuler?: { libelle: string; href: string };
};

function toIsoDate(d: Date | null | undefined): string {
  if (!d) return "";
  // yyyy-mm-dd (locale UTC neutralisée)
  return d.toISOString().slice(0, 10);
}

export function EquipementForm({
  action,
  valeursInitiales,
  batiments = [],
  libelleSubmit,
  labelAnnuler,
}: Props) {
  const multiBatiments = batiments.length > 1;
  const [state, formAction, pending] = useActionState<
    EquipementActionState,
    FormData
  >(action, { status: "idle" });

  const [categorie, setCategorie] = useState<CategorieEquipement>(
    valeursInitiales?.categorie ?? "INSTALLATION_ELECTRIQUE",
  );

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  const estElec = categorie === "INSTALLATION_ELECTRIQUE";
  const estAeration = CATEGORIES_AERATION.includes(categorie);
  const estVmc = categorie === "VMC";
  const estEsp = categorie === "EQUIPEMENT_SOUS_PRESSION";

  // Questions à trois états applicables à la catégorie sélectionnée.
  const questions = CATEGORIES_TRI_ETAT.filter((r) =>
    r.categories.includes(categorie),
  );
  const afficherCaracteristiques =
    estElec || estAeration || estEsp || questions.length > 0;

  return (
    <form action={formAction} className="space-y-8">
      {/* Catégorie + libellé */}
      <section className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="categorie">Catégorie *</Label>
          <div className="flex items-center gap-3">
            <MarqueCategorie categorie={categorie} taille={44} />
            <select
              id="categorie"
              name="categorie"
              value={categorie}
              onChange={(e) =>
                setCategorie(e.currentTarget.value as CategorieEquipement)
              }
              required
              className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
              aria-invalid={Boolean(err("categorie"))}
            >
              {CATEGORIES_EQUIPEMENT.map((c) => (
                <option key={c} value={c}>
                  {LABEL_CATEGORIE_EQUIPEMENT[c]}
                </option>
              ))}
            </select>
          </div>
          {DESCRIPTION_CATEGORIE[categorie] && (
            <p className="text-[0.82rem] text-muted-foreground">
              {DESCRIPTION_CATEGORIE[categorie]}
            </p>
          )}
          {err("categorie") && (
            <p className="text-sm text-destructive">{err("categorie")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="libelle">Libellé *</Label>
          <Input
            id="libelle"
            name="libelle"
            defaultValue={valeursInitiales?.libelle}
            required
            placeholder="Ex : TGBT principal, Hotte de la cuisine chaude"
            aria-invalid={Boolean(err("libelle"))}
          />
          {err("libelle") && (
            <p className="text-sm text-destructive">{err("libelle")}</p>
          )}
        </div>

        {multiBatiments && (
          <div className="space-y-2">
            <Label htmlFor="batimentId">Bâtiment *</Label>
            <select
              id="batimentId"
              name="batimentId"
              defaultValue={valeursInitiales?.batimentId ?? batiments[0]?.id}
              required
              className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
              aria-invalid={Boolean(err("batimentId"))}
            >
              {batiments.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom}
                </option>
              ))}
            </select>
            {err("batimentId") && (
              <p className="text-sm text-destructive">{err("batimentId")}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="localisation" className="inline-flex items-center">
              {multiBatiments ? "Précision du lieu" : "Localisation"}
              <InfoTooltip>
                Facultatif. Ex : « sous-sol », « cuisine », « local technique
                RDC ». Utile au technicien lors de la vérification.
              </InfoTooltip>
            </Label>
            <Input
              id="localisation"
              name="localisation"
              defaultValue={valeursInitiales?.localisation ?? ""}
              placeholder="Ex : local technique RDC"
              aria-invalid={Boolean(err("localisation"))}
            />
            {err("localisation") && (
              <p className="text-sm text-destructive">{err("localisation")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateMiseEnService" className="inline-flex items-center">
              Date de mise en service
              <InfoTooltip>
                Facultatif. Si vous ne la connaissez pas, laissez vide —
                l&apos;outil se calera sur la première vérification à venir.
              </InfoTooltip>
            </Label>
            <Input
              id="dateMiseEnService"
              name="dateMiseEnService"
              type="date"
              defaultValue={toIsoDate(valeursInitiales?.dateMiseEnService)}
              aria-invalid={Boolean(err("dateMiseEnService"))}
            />
            {err("dateMiseEnService") && (
              <p className="text-sm text-destructive">
                {err("dateMiseEnService")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre" className="inline-flex items-center">
            Nombre d&apos;unités
            <InfoTooltip>
              Facultatif. Ex : 12 extincteurs, 3 BAES. À renseigner si vous
              en avez plusieurs du même type.
            </InfoTooltip>
          </Label>
          <Input
            id="nombre"
            name="nombre"
            type="number"
            min={1}
            defaultValue={valeursInitiales?.nombre ?? ""}
            className="sm:w-40"
            aria-invalid={Boolean(err("nombre"))}
          />
          {err("nombre") && (
            <p className="text-sm text-destructive">{err("nombre")}</p>
          )}
        </div>
      </section>

      {/* Caractéristiques spécifiques — dépliage conditionnel */}
      {afficherCaracteristiques && (
        <section className="cartouche overflow-hidden">
          <div className="border-b border-dashed border-rule/60 px-6 py-5 sm:px-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Caractéristiques spécifiques
            </p>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              Ces informations conditionnent la génération des vérifications
              réglementaires applicables (étape suivante).
            </p>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8">
            {estElec && (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="aGroupeElectrogene"
                  defaultChecked={valeursInitiales?.aGroupeElectrogene ?? false}
                  className="mt-1 size-4 rounded border-rule"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold">
                    Groupe électrogène de sécurité présent
                  </p>
                  <p className="text-[0.82rem] text-muted-foreground">
                    Déclenche la vérification annuelle prévue par l&apos;art.
                    EL 20 du règlement ERP.
                  </p>
                </div>
              </label>
            )}

            {estAeration && (
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="estLocalPollutionSpecifique"
                  defaultChecked={
                    valeursInitiales?.estLocalPollutionSpecifique ?? false
                  }
                  className="mt-1 size-4 rounded border-rule"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-semibold">
                    Local à pollution spécifique
                  </p>
                  <p className="text-[0.82rem] text-muted-foreground">
                    Poussières, gaz, vapeurs, aérosols. Contrôle semestriel de
                    l&apos;efficacité du captage (arrêté 8 octobre 1987, art.
                    3 § II).
                  </p>
                </div>
              </label>
            )}

            {estVmc && (
              <div className="space-y-2">
                <Label
                  htmlFor="nbVehiculesParkingCouvert"
                  className="inline-flex items-center"
                >
                  Capacité parking couvert (véhicules)
                  <InfoTooltip variant="legal" label="Art. PS 32 — règlement ERP">
                    <span className="block font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-paper-elevated/70">
                      Art. PS 32 · Règlement ERP
                    </span>
                    <span className="mt-2 block">
                      À renseigner uniquement si la VMC ventile un parc de
                      stationnement couvert d&apos;un ERP. Au-dessus de 250
                      véhicules, contrôle annuel — sinon biennal.
                    </span>
                  </InfoTooltip>
                </Label>
                <Input
                  id="nbVehiculesParkingCouvert"
                  name="nbVehiculesParkingCouvert"
                  type="number"
                  min={0}
                  defaultValue={
                    valeursInitiales?.nbVehiculesParkingCouvert ?? ""
                  }
                  className="sm:w-40"
                  aria-invalid={Boolean(err("nbVehiculesParkingCouvert"))}
                />
                {err("nbVehiculesParkingCouvert") && (
                  <p className="text-sm text-destructive">
                    {err("nbVehiculesParkingCouvert")}
                  </p>
                )}
              </div>
            )}

            {estEsp && (
              <ChampsEsp
                initiales={{
                  familleEsp: valeursInitiales?.familleEsp as FamilleEsp | undefined,
                  pressionMaxAdmissibleBar: valeursInitiales?.pressionMaxAdmissibleBar as number | undefined,
                  volumeLitres: valeursInitiales?.volumeLitres as number | undefined,
                }}
                err={err}
              />
            )}

            {questions.map(({ champ }) => (
              <QuestionTriEtat
                key={champ}
                champ={champ}
                defaut={valeurTriEtat(valeursInitiales?.[champ])}
                erreur={err(champ)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={valeursInitiales?.notes ?? ""}
          rows={3}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Marque, modèle, références techniques, contact maintenance…"
        />
      </section>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-700">Enregistré.</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : libelleSubmit}
        </Button>
        {labelAnnuler && (
          <Link
            href={labelAnnuler.href}
            className={buttonVariants({ variant: "outline" })}
          >
            {labelAnnuler.libelle}
          </Link>
        )}
      </div>
    </form>
  );
}

/**
 * Question à trois états. Un `<select>` plutôt qu'une case à cocher : une case
 * décochée ne dit pas si l'utilisateur a répondu « non » ou n'a simplement pas
 * répondu, et cette nuance décide ici du maintien d'une obligation
 * réglementaire de criticité élevée.
 */
function QuestionTriEtat({
  champ,
  defaut,
  erreur,
}: {
  champ: ChampTriEtat;
  defaut: string;
  erreur?: string;
}) {
  const { question, aide } = QUESTIONS_TRI_ETAT[champ];
  return (
    <div className="space-y-2">
      <Label htmlFor={champ} className="block text-[0.95rem] font-semibold">
        {question}
      </Label>
      <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
        {aide}
      </p>
      <select
        id={champ}
        name={champ}
        defaultValue={defaut}
        className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm sm:w-64"
        aria-invalid={Boolean(erreur)}
      >
        {VALEURS_TRI_ETAT.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
      {erreur && <p className="text-sm text-destructive">{erreur}</p>}
    </div>
  );
}


/**
 * Plaque constructeur d'un équipement sous pression, et verdict indicatif
 * d'assujettissement (C. env. R. 557-14-1). Le verdict n'écrit rien : il
 * éclaire la réponse à la question « suivi en service » ci-dessous, qui
 * reste celle du dirigeant.
 */
function ChampsEsp({
  initiales,
  err,
}: {
  initiales: {
    familleEsp?: FamilleEsp;
    pressionMaxAdmissibleBar?: number;
    volumeLitres?: number;
  };
  err: (champ: string) => string | undefined;
}) {
  const [famille, setFamille] = useState<FamilleEsp | undefined>(initiales.familleEsp);
  const [ps, setPs] = useState<string>(initiales.pressionMaxAdmissibleBar?.toString() ?? "");
  const [vol, setVol] = useState<string>(initiales.volumeLitres?.toString() ?? "");
  const verdict = verdictSuiviEnService({
    famille,
    pressionMaxAdmissibleBar: ps === "" ? undefined : Number(ps),
    volumeLitres: vol === "" ? undefined : Number(vol),
  });
  return (
    <div className="space-y-4 rounded-md border border-dashed border-rule/60 p-4">
      <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
        Plaque constructeur : la famille, la pression maximale admissible (PS)
        et le volume (V) déterminent si l&apos;équipement relève du suivi en
        service (C. env., art. R. 557-14-1). Le verdict ci-dessous est indicatif
        : c&apos;est votre réponse à la question « suivi en service » qui compte.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="familleEsp">Famille</Label>
          <select
            id="familleEsp"
            name="familleEsp"
            value={famille ?? ""}
            onChange={(e) => setFamille((e.target.value || undefined) as FamilleEsp | undefined)}
            className="h-9 w-full rounded-md border border-rule bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Je ne sais pas encore</option>
            {FAMILLES_ESP.map((f) => (
              <option key={f} value={f}>
                {LABEL_FAMILLE_ESP[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pressionMaxAdmissibleBar">PS (bar)</Label>
          <Input
            id="pressionMaxAdmissibleBar"
            name="pressionMaxAdmissibleBar"
            type="number"
            step="0.1"
            min={0}
            value={ps}
            onChange={(e) => setPs(e.target.value)}
            aria-invalid={Boolean(err("pressionMaxAdmissibleBar"))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="volumeLitres">V (litres)</Label>
          <Input
            id="volumeLitres"
            name="volumeLitres"
            type="number"
            step="0.1"
            min={0}
            value={vol}
            onChange={(e) => setVol(e.target.value)}
            aria-invalid={Boolean(err("volumeLitres"))}
          />
        </div>
      </div>
      <p className="text-[0.82rem]">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          Verdict indicatif ·{" "}
        </span>
        {verdict.verdict === "soumis"
          ? "paraît soumis au suivi en service"
          : verdict.verdict === "non_soumis"
            ? "paraît hors du champ du suivi en service"
            : "indéterminé"}
        {" — "}
        <span className="text-muted-foreground">{verdict.motif}</span>
      </p>
    </div>
  );
}
