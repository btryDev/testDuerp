"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LegalBadge } from "@/components/ui-kit";
import {
  creerPlanPrevention,
  type PlanActionState,
} from "@/lib/plan-prevention/actions";
import { diagnostiquerPlan } from "@/lib/plan-prevention/schema";

type PrestataireLite = {
  id: string;
  raisonSociale: string;
  contactNom: string;
  contactEmail: string;
  siret: string | null;
};

type LigneState = {
  risque: string;
  mesureEntrepriseUtilisatrice: string;
  mesureEntrepriseExterieure: string;
};

export function FormulairePlanPrevention({
  etablissementId,
  prestataires,
}: {
  etablissementId: string;
  prestataires: PrestataireLite[];
}) {
  const router = useRouter();
  const boundAction = creerPlanPrevention.bind(null, etablissementId);
  const [state, formAction, pending] = useActionState<
    PlanActionState,
    FormData
  >(boundAction, { status: "idle" });

  const [prestataireChoisi, setPrestataireChoisi] =
    useState<PrestataireLite | null>(null);

  const [dureeHeures, setDureeHeures] = useState<number | null>(null);
  const [travauxDangereux, setTravauxDangereux] = useState(false);
  const diagnostic = useMemo(
    () => diagnostiquerPlan({ dureeHeuresEstimee: dureeHeures, travauxDangereux }),
    [dureeHeures, travauxDangereux],
  );

  const [lignes, setLignes] = useState<LigneState[]>([
    { risque: "", mesureEntrepriseUtilisatrice: "", mesureEntrepriseExterieure: "" },
  ]);

  useEffect(() => {
    if (state.status === "success") {
      router.push(
        `/etablissements/${etablissementId}/plan-prevention/${state.planId}`,
      );
    }
  }, [state, etablissementId, router]);

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  function ajouterLigne() {
    setLignes((l) => [
      ...l,
      { risque: "", mesureEntrepriseUtilisatrice: "", mesureEntrepriseExterieure: "" },
    ]);
  }

  function retirerLigne(i: number) {
    setLignes((l) => (l.length === 1 ? l : l.filter((_, idx) => idx !== i)));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // La validation client est déjà faite via required — on laisse le submit natif partir.
    void e;
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-10">
      {/* — Diagnostic : avez-vous besoin d'un plan écrit ? — */}
      <section
        className={
          "rounded-2xl border-l-4 p-6 " +
          (diagnostic.ecritObligatoire
            ? "border-l-[color:var(--minium)] bg-[color:color-mix(in_oklch,var(--minium)_6%,transparent)]"
            : "border-l-[color:var(--warm)] bg-[color:var(--warm-soft)]")
        }
      >
        <p className="label-admin">Diagnostic — avez-vous besoin d&apos;un plan écrit ?</p>
        <h2 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.015em]">
          {diagnostic.ecritObligatoire
            ? "Plan écrit obligatoire"
            : "Plan écrit recommandé"}
        </h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[color:var(--ink)]">
          {diagnostic.recommandation}
        </p>
        {diagnostic.raisons.length > 0 && (
          <ul className="mt-3 space-y-1 text-[0.82rem] text-[color:var(--minium)]">
            {diagnostic.raisons.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <LegalBadge
            reference="Art. R4512-7 CT · décret 92-158"
            href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018491957"
          />
        </div>
      </section>

      {/* 1 — Entreprise extérieure */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--warm)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">1 · Entreprise extérieure</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Qui intervient chez vous
          </h2>
        </header>
        <div className="space-y-5 px-7 pb-7">
          {prestataires.length > 0 && (
            <div>
              <Label>Choisir dans l&apos;annuaire</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {prestataires.map((p) => {
                  const actif = prestataireChoisi?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrestataireChoisi(actif ? null : p)}
                      className={
                        "rounded-full border px-3 py-1.5 text-[0.82rem] transition " +
                        (actif
                          ? "border-[color:var(--warm)] bg-[color:var(--warm-soft)] text-[color:var(--warm)]"
                          : "border-[color:var(--rule)] bg-[color:var(--paper-elevated)] hover:border-[color:var(--warm)]")
                      }
                    >
                      {p.raisonSociale}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <input
            type="hidden"
            name="prestataireId"
            value={prestataireChoisi?.id ?? ""}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="entrepriseExterieureRaison">Raison sociale *</Label>
              <Input
                id="entrepriseExterieureRaison"
                name="entrepriseExterieureRaison"
                required
                maxLength={200}
                defaultValue={prestataireChoisi?.raisonSociale ?? ""}
                key={prestataireChoisi?.id ?? "libre"}
              />
              {err("entrepriseExterieureRaison") && (
                <p className="text-sm text-destructive">
                  {err("entrepriseExterieureRaison")}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entrepriseExterieureSiret">SIRET</Label>
              <Input
                id="entrepriseExterieureSiret"
                name="entrepriseExterieureSiret"
                inputMode="numeric"
                maxLength={17}
                defaultValue={prestataireChoisi?.siret ?? ""}
                key={`siret-${prestataireChoisi?.id ?? "libre"}`}
              />
              {err("entrepriseExterieureSiret") && (
                <p className="text-sm text-destructive">
                  {err("entrepriseExterieureSiret")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="efChefNom">Chef d&apos;entreprise extérieure *</Label>
              <Input
                id="efChefNom"
                name="efChefNom"
                required
                maxLength={200}
                defaultValue={prestataireChoisi?.contactNom ?? ""}
                key={`ef-${prestataireChoisi?.id ?? "libre"}`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="efChefEmail">Email *</Label>
              <Input
                id="efChefEmail"
                name="efChefEmail"
                type="email"
                required
                maxLength={200}
                defaultValue={prestataireChoisi?.contactEmail ?? ""}
                key={`emailef-${prestataireChoisi?.id ?? "libre"}`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="efEffectifIntervenant">
              Effectif qui interviendra *
            </Label>
            <Input
              id="efEffectifIntervenant"
              name="efEffectifIntervenant"
              type="number"
              min={1}
              max={9999}
              defaultValue={1}
              className="max-w-xs"
            />
          </div>
        </div>
      </section>

      {/* 2 — Entreprise utilisatrice */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--warm)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">2 · Entreprise utilisatrice (vous)</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Qui signe côté site
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-4 px-7 pb-7 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="euChefNom">Nom du chef d&apos;entreprise *</Label>
            <Input id="euChefNom" name="euChefNom" required maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="euChefFonction">Fonction</Label>
            <Input
              id="euChefFonction"
              name="euChefFonction"
              maxLength={120}
              placeholder="Ex : Gérant, Directeur d'établissement…"
            />
          </div>
        </div>
      </section>

      {/* 3 — Travaux */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--minium)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">3 · Travaux prévus</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Nature, durée, lieu
          </h2>
        </header>
        <div className="space-y-5 px-7 pb-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dateDebut">Début *</Label>
              <Input id="dateDebut" name="dateDebut" type="datetime-local" required />
              {err("dateDebut") && (
                <p className="text-sm text-destructive">{err("dateDebut")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateFin">Fin *</Label>
              <Input id="dateFin" name="dateFin" type="datetime-local" required />
              {err("dateFin") && (
                <p className="text-sm text-destructive">{err("dateFin")}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dureeHeuresEstimee">
              Durée totale estimée (heures)
              <span className="ml-2 text-[0.78rem] font-normal text-muted-foreground">
                Seuil R4512-7 : 400 h sur 12 mois
              </span>
            </Label>
            <Input
              id="dureeHeuresEstimee"
              name="dureeHeuresEstimee"
              type="number"
              min={1}
              max={99999}
              className="max-w-xs"
              onChange={(e) => {
                const v = e.target.value;
                setDureeHeures(v ? parseInt(v, 10) : null);
              }}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] px-4 py-3">
            <input
              type="checkbox"
              name="travauxDangereux"
              checked={travauxDangereux}
              onChange={(e) => setTravauxDangereux(e.target.checked)}
              className="mt-1"
            />
            <div className="text-[0.88rem]">
              <p className="font-medium">
                Les travaux figurent sur la liste dangereuse (arrêté 19-03-1993)
              </p>
              <p className="mt-1 text-[0.78rem] text-muted-foreground">
                Ex : travaux sur toiture, espaces confinés, amiante, radioprotection,
                soudage en hauteur, travaux à chaud, tension &gt; 50V, levage lourd…
              </p>
            </div>
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="lieux">Lieux d&apos;intervention *</Label>
            <Input
              id="lieux"
              name="lieux"
              required
              maxLength={1000}
              placeholder="Ex : toiture bâtiment A, local technique sous-sol, chaufferie"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="naturesTravaux">Nature précise des travaux *</Label>
            <textarea
              id="naturesTravaux"
              name="naturesTravaux"
              required
              rows={4}
              maxLength={4000}
              className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Ex : remplacement complet de la membrane d'étanchéité toiture terrasse de 120 m², avec pose ponctuelle de chalumeau."
            />
            {err("naturesTravaux") && (
              <p className="text-sm text-destructive">{err("naturesTravaux")}</p>
            )}
          </div>
        </div>
      </section>

      {/* 4 — Inspection commune */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--accent-vif)" }}
        />
        <header className="px-7 pb-4 pt-7">
          <p className="label-admin">4 · Inspection commune préalable</p>
          <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
            Obligatoire avant démarrage
          </h2>
          <p className="mt-1 text-[0.82rem] text-muted-foreground">
            Art. R4512-7 : visite des lieux par les deux chefs d&apos;entreprise
            avant tout début de travaux.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-5 px-7 pb-7 sm:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="inspectionDate">Date de l&apos;inspection</Label>
            <Input id="inspectionDate" name="inspectionDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inspectionParticipants">
              Participants à l&apos;inspection
            </Label>
            <textarea
              id="inspectionParticipants"
              name="inspectionParticipants"
              rows={2}
              maxLength={2000}
              className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Ex : M. Dupond (gérant), Mme Martin (chef de chantier EE), M. Petit (CSE)"
            />
          </div>
        </div>
      </section>

      {/* 5 — Matrice risques / mesures */}
      <section className="cartouche relative overflow-hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "var(--ink)" }}
        />
        <header className="flex items-start justify-between gap-4 px-7 pb-4 pt-7">
          <div>
            <p className="label-admin">5 · Matrice risques ↔ mesures</p>
            <h2 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.015em]">
              Analyse conjointe des risques d&apos;interférence
            </h2>
            <p className="mt-1 text-[0.82rem] text-muted-foreground">
              Pour chaque risque identifié lors de l&apos;inspection, indiquez la
              mesure prise par chaque partie.
            </p>
          </div>
          <button
            type="button"
            onClick={ajouterLigne}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            + Ajouter un risque
          </button>
        </header>
        <ul className="divide-y divide-dashed divide-rule/50">
          {lignes.map((l, i) => (
            <li key={i} className="p-7">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--seal)]">
                  Risque #{i + 1}
                </p>
                {lignes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => retirerLigne(i)}
                    className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[color:var(--minium)]/70 hover:text-[color:var(--minium)]"
                  >
                    Retirer
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`risque-${i}`}>Description du risque</Label>
                  <Input
                    id={`risque-${i}`}
                    name={`lignes[${i}].risque`}
                    required
                    defaultValue={l.risque}
                    maxLength={500}
                    placeholder="Ex : chute de hauteur depuis la toiture sans garde-corps"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`mesureEU-${i}`}>
                      <span className="text-[color:var(--warm)]">Votre mesure</span>{" "}
                      (entreprise utilisatrice)
                    </Label>
                    <textarea
                      id={`mesureEU-${i}`}
                      name={`lignes[${i}].mesureEntrepriseUtilisatrice`}
                      defaultValue={l.mesureEntrepriseUtilisatrice}
                      rows={2}
                      maxLength={500}
                      className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`mesureEE-${i}`}>
                      <span className="text-[color:var(--minium)]">Mesure EE</span>{" "}
                      (entreprise extérieure)
                    </Label>
                    <textarea
                      id={`mesureEE-${i}`}
                      name={`lignes[${i}].mesureEntrepriseExterieure`}
                      defaultValue={l.mesureEntrepriseExterieure}
                      rows={2}
                      maxLength={500}
                      className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {err("lignes") && (
          <p className="px-7 pb-5 text-sm text-destructive">{err("lignes")}</p>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le plan et demander les signatures"}
        </Button>
        <Link
          href={`/etablissements/${etablissementId}/plan-prevention`}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Annuler
        </Link>
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
