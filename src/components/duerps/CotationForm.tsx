"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculerCriticite } from "@/lib/cotation";
import { questionsCotation } from "@/lib/cotation/questions";
import {
  enregistrerCotation,
  type CotationActionState,
} from "@/lib/risques/actions";

type Props = {
  risqueId: string;
  initial: {
    gravite: number;
    probabilite: number;
    maitrise: number;
    nombreSalariesExposes: number | null;
    dateMesuresPhysiques: string | null;
    exposeCMR: boolean;
  };
  cotationSaisie: boolean;
  hrefRetourUnite: string;
  hrefMesures: string;
  hrefSuivant?: string;
};

const titreAxe: Record<string, string> = {
  gravite: "Gravité",
  probabilite: "Probabilité",
  maitrise: "Maîtrise actuelle",
};

export function CotationForm({
  risqueId,
  initial,
  cotationSaisie,
  hrefRetourUnite,
  hrefMesures,
  hrefSuivant,
}: Props) {
  const router = useRouter();
  const action = enregistrerCotation.bind(null, risqueId);
  const [state, formAction, pending] = useActionState<
    CotationActionState,
    FormData
  >(action, { status: "idle" });

  // Premier remplissage : aucune réponse pré-cochée, même si la base
  // contient des défauts de secteur (stockés à la création pour la
  // référence sectorielle). L'utilisateur doit choisir activement.
  const [gravite, setGravite] = useState(
    cotationSaisie ? initial.gravite : 0,
  );
  const [probabilite, setProbabilite] = useState(
    cotationSaisie ? initial.probabilite : 0,
  );
  const [maitrise, setMaitrise] = useState(
    cotationSaisie ? initial.maitrise : 0,
  );

  const toutesReponses = gravite > 0 && probabilite > 0 && maitrise > 0;

  const criticiteLive = useMemo(
    () =>
      toutesReponses
        ? calculerCriticite({ gravite, probabilite, maitrise })
        : null,
    [gravite, probabilite, maitrise, toutesReponses],
  );

  // Après la toute première validation sans alerte, on enchaîne naturellement
  // vers la partie 02 · Mesures. Si une alerte de sous-cotation remonte,
  // on reste sur place pour la présenter à l'utilisateur.
  useEffect(() => {
    if (
      state.status === "success" &&
      !cotationSaisie &&
      !state.alerte
    ) {
      router.push(hrefMesures);
    }
  }, [state, cotationSaisie, hrefMesures, router]);

  const setter = (axe: string) => {
    if (axe === "gravite") return setGravite;
    if (axe === "probabilite") return setProbabilite;
    return setMaitrise;
  };
  const valeurActuelle = (axe: string) =>
    axe === "gravite" ? gravite : axe === "probabilite" ? probabilite : maitrise;

  const nombreAxes = questionsCotation.length;

  return (
    <form action={formAction} className="space-y-10">
      {questionsCotation.map((q, i) => {
        const estMaitrise = q.axe === "maitrise";
        return (
          <fieldset key={q.axe} className="space-y-4">
            <div className="flex items-baseline gap-3 border-b border-dashed border-rule/70 pb-3">
              <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
                <span className="mx-1 text-rule">/</span>
                {String(nombreAxes).padStart(2, "0")}
              </span>
              <legend className="text-[0.98rem] font-semibold tracking-[-0.01em] leading-snug">
                <span className="block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {titreAxe[q.axe] ?? q.axe}
                </span>
                <span className="mt-1 block">{q.intitule}</span>
              </legend>
            </div>

            {estMaitrise && (
              <aside className="rounded-[calc(var(--radius)*1.2)] border border-dashed border-[color:var(--warm)]/30 bg-[color:var(--warm-soft)]/70 px-5 py-3.5">
                <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[color:var(--warm)]">
                  À lire avant de cocher
                </p>
                <p className="mt-1.5 text-[0.86rem] leading-[1.6] text-[color:var(--warm)]">
                  La maîtrise décrit l&apos;état{" "}
                  <span className="font-semibold">actuel</span> de votre
                  prévention pour ce risque.{" "}
                  <span className="font-medium">
                    La partie 02 — Mesures — vient juste après
                  </span>
                  {" "}: vous y listerez précisément ce qui est en place et ce
                  qui est prévu. Vous pourrez alors revenir ajuster la maîtrise
                  si l&apos;inventaire vous surprend.
                </p>
              </aside>
            )}

            <div className="space-y-2">
              {q.options.map((opt) => {
                const id = `${q.axe}-${opt.valeur}`;
                const checked = valeurActuelle(q.axe) === opt.valeur;
                return (
                  <label
                    key={id}
                    htmlFor={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-[calc(var(--radius)*1)] border p-3.5 transition-colors ${
                      checked
                        ? "border-ink bg-paper-sunk/60"
                        : "border-rule-soft hover:bg-paper-sunk/30"
                    }`}
                  >
                    <input
                      type="radio"
                      id={id}
                      name={q.axe}
                      value={opt.valeur}
                      defaultChecked={checked}
                      onChange={() => setter(q.axe)(opt.valeur)}
                      className="mt-1 accent-ink"
                      required
                    />
                    <span className="flex min-w-0 flex-1 items-baseline gap-3">
                      <span className="font-mono text-[0.68rem] font-medium text-muted-foreground tabular-nums">
                        {opt.valeur}
                      </span>
                      <span className="text-[0.9rem] leading-[1.55]">
                        {opt.libelle}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {/* Résultat calculé — n'apparaît qu'après les 3 réponses */}
      <div className="grid gap-4 rounded-[calc(var(--radius)*1.4)] bg-paper-sunk px-6 py-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
        <div className="flex items-baseline gap-3">
          <span
            className={`font-mono text-[5rem] font-semibold leading-none tabular-nums ${
              criticiteLive !== null ? "text-ink" : "text-muted-foreground/40"
            }`}
          >
            {criticiteLive !== null
              ? String(criticiteLive).padStart(2, "0")
              : "—"}
          </span>
          <span className="font-mono text-[0.78rem] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="block">sur 16</span>
            <span className="block">criticité</span>
          </span>
        </div>
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
            {criticiteLive !== null ? "Formule retenue" : "En attente"}
          </p>
          {criticiteLive !== null ? (
            <p className="mt-1 text-[0.88rem] leading-relaxed text-ink">
              (gravité × probabilité) ÷ maîtrise — arrondi à l&apos;entier et
              borné entre 1 et 16. Plus la note est haute, plus le risque est
              prioritaire.
            </p>
          ) : (
            <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">
              Répondez aux{" "}
              <span className="tabular-nums">
                {[gravite, probabilite, maitrise].filter((v) => v > 0).length}
                /3
              </span>{" "}
              questions ci-dessus pour voir apparaître la criticité. Rien n&apos;est
              enregistré tant que vous n&apos;avez pas validé.
            </p>
          )}
        </div>
      </div>

      <fieldset className="space-y-5 rounded-[calc(var(--radius)*1.4)] border border-dashed border-rule/70 px-6 py-6">
        <legend className="px-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Informations complémentaires · facultatives
        </legend>
        <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
          Utiles pour la traçabilité et certaines annexes obligatoires
          (pénibilité, CMR, mesures physiques réglementées).
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="nombreSalariesExposes"
              className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Nombre de salariés exposés
            </Label>
            <Input
              id="nombreSalariesExposes"
              name="nombreSalariesExposes"
              type="number"
              min={0}
              step={1}
              defaultValue={initial.nombreSalariesExposes ?? ""}
              placeholder="ex. 3"
            />
            <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
              Critère d&apos;appréciation recommandé par l&apos;INRS (ED 840).
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dateMesuresPhysiques"
              className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Dernières mesures physiques
            </Label>
            <Input
              id="dateMesuresPhysiques"
              name="dateMesuresPhysiques"
              type="date"
              defaultValue={initial.dateMesuresPhysiques ?? ""}
            />
            <p className="text-[0.72rem] leading-relaxed text-muted-foreground">
              Bruit (R. 4432), éclairement (R. 4223-4), ambiances thermiques,
              vibrations (R. 4441). À renseigner si l&apos;activité impose une
              mesure par un organisme habilité.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-[calc(var(--radius)*1)] border border-dashed border-rule p-4">
          <input
            type="checkbox"
            id="exposeCMR"
            name="exposeCMR"
            defaultChecked={initial.exposeCMR}
            className="mt-0.5 accent-ink"
          />
          <span className="space-y-1.5 text-[0.82rem]">
            <span className="block text-[0.9rem] font-semibold tracking-[-0.008em]">
              Exposition à un agent CMR
            </span>
            <span className="block leading-[1.55] text-muted-foreground">
              Cancérogène, Mutagène ou toxique pour la Reproduction
              (art. R. 4412-59 et suivants). À cocher si un ou plusieurs
              salariés sont exposés — cela déclenche des obligations renforcées
              (liste nominative, suivi médical, substitution prioritaire).
            </span>
          </span>
        </label>
      </fieldset>

      {state.status === "success" && state.alerte && (
        <div className="rounded-[calc(var(--radius)*1.4)] border border-dashed border-[color:var(--minium)]/40 bg-[color:var(--minium)]/8 px-5 py-4">
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[color:var(--minium)]">
            Écart avec le repère indicatif
          </p>
          <p className="mt-2 text-[0.88rem] leading-[1.6] text-ink">
            {state.alerte}
          </p>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-muted-foreground">
            Vous pouvez rester ici et ajuster vos réponses, ou enchaîner vers
            les mesures si vous assumez la cotation.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={hrefMesures}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Passer aux mesures malgré tout →
            </Link>
          </div>
        </div>
      )}

      {state.status === "success" && !state.alerte && cotationSaisie && (
        <div className="rounded-[calc(var(--radius)*1.4)] bg-paper-sunk px-5 py-4">
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Cotation mise à jour · criticité{" "}
            {String(state.criticite).padStart(2, "0")} / 16
          </p>
          <p className="mt-1.5 text-[0.86rem] text-muted-foreground">
            Les mesures (partie 02) reflètent votre prévention concrète.
          </p>
        </div>
      )}

      {state.status === "error" && (
        <p className="text-[0.82rem] text-destructive">{state.message}</p>
      )}

      {/* Actions — primaire à droite, navigation de repli à gauche */}
      <div className="space-y-5 border-t border-dashed border-rule pt-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link
            href={hrefRetourUnite}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            ← Retour à l&apos;unité
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {cotationSaisie ? (
              <>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={pending || !toutesReponses}
                >
                  {pending ? "Enregistrement…" : "Mettre à jour la cotation"}
                </Button>
                <Link
                  href={hrefMesures}
                  className={buttonVariants({ size: "lg" })}
                >
                  <span className="mr-2 font-mono tabular-nums opacity-70">
                    02
                  </span>
                  Passer aux mesures →
                </Link>
              </>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={pending || !toutesReponses}
              >
                {pending
                  ? "Enregistrement…"
                  : toutesReponses
                    ? "Enregistrer & passer aux mesures →"
                    : "Répondez aux 3 questions pour continuer"}
              </Button>
            )}
          </div>
        </div>

        {hrefSuivant && cotationSaisie && (
          <p className="text-center text-[0.72rem] leading-relaxed text-muted-foreground">
            Ou passez directement au{" "}
            <Link
              href={hrefSuivant}
              className="underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
            >
              risque suivant à coter
            </Link>{" "}
            sans renseigner les mesures maintenant.
          </p>
        )}
      </div>
    </form>
  );
}
