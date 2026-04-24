"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { EvidenceDropzone, LegalBadge } from "@/components/ui-kit";
import type { PrestataireActionState } from "@/lib/prestataires/actions";
import {
  DOMAINES_PRESTATAIRE,
  LABEL_DOMAINE,
} from "@/lib/prestataires/schema";

type Props = {
  etablissementId: string;
  action: (
    prev: PrestataireActionState,
    formData: FormData,
  ) => Promise<PrestataireActionState>;
};

export function FormulairePrestataire({ etablissementId, action }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    PrestataireActionState,
    FormData
  >(action, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      router.push(
        `/etablissements/${etablissementId}/prestataires/${state.prestataireId}`,
      );
    }
  }, [state, etablissementId, router]);

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-8">
      {/* -------- Identité -------- */}
      <section className="space-y-4">
        <header>
          <p className="label-admin">1. Identité du prestataire</p>
          <p className="mt-1 text-[0.85rem] text-[color:var(--muted-foreground)]">
            L&apos;entreprise qui intervient chez vous. SIRET facultatif mais fortement
            recommandé (facilite la vérification d&apos;identité légale).
          </p>
        </header>

        <div className="space-y-2">
          <Label htmlFor="raisonSociale">Raison sociale *</Label>
          <Input
            id="raisonSociale"
            name="raisonSociale"
            required
            maxLength={200}
            placeholder="Ex : APAVE SAS, Electricité Dupond, Ascensys…"
            aria-invalid={Boolean(err("raisonSociale"))}
          />
          {err("raisonSociale") && (
            <p className="text-sm text-destructive">{err("raisonSociale")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siret">
              SIRET (14 chiffres)
              <InfoTooltip>
                Recherche possible sur annuaire-entreprises.data.gouv.fr
              </InfoTooltip>
            </Label>
            <Input
              id="siret"
              name="siret"
              inputMode="numeric"
              maxLength={17}
              placeholder="123 456 789 00012"
              aria-invalid={Boolean(err("siret"))}
            />
            {err("siret") && <p className="text-sm text-destructive">{err("siret")}</p>}
          </div>

          <label className="flex cursor-pointer items-center gap-3 self-end rounded-lg border border-[color:var(--rule-soft)] bg-[color:var(--paper-sunk)] px-3 py-2.5">
            <input
              type="checkbox"
              name="estOrganismeAgree"
              className="h-4 w-4 rounded border-[color:var(--rule)]"
            />
            <span className="text-[0.85rem] font-medium text-[color:var(--ink)]">
              Organisme agréé
              <InfoTooltip>
                Apave, Bureau Veritas, Socotec, Dekra… — habilité par le
                ministère pour les vérifications périodiques.
              </InfoTooltip>
            </span>
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-[0.82rem] font-medium text-[color:var(--ink)]">
            Domaines d&apos;intervention
          </legend>
          <p className="text-[0.78rem] text-[color:var(--muted-foreground)]">
            Cochez tout ce qui s&apos;applique — ces tags servent ensuite à pré-sélectionner
            le bon prestataire quand vous créez une vérification ou un plan de prévention.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {DOMAINES_PRESTATAIRE.map((d) => (
              <label
                key={d}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--rule)] bg-[color:var(--paper-elevated)] px-3 py-1.5 text-[0.82rem] transition hover:border-[color:var(--warm)] has-[:checked]:border-[color:var(--warm)] has-[:checked]:bg-[color:var(--warm-soft)] has-[:checked]:text-[color:var(--warm)]"
              >
                <input
                  type="checkbox"
                  name="domaines"
                  value={d}
                  className="sr-only"
                />
                {LABEL_DOMAINE[d]}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <div className="filet-pointille" />

      {/* -------- Contact -------- */}
      <section className="space-y-4">
        <header>
          <p className="label-admin">2. Contact principal</p>
          <p className="mt-1 text-[0.85rem] text-[color:var(--muted-foreground)]">
            L&apos;interlocuteur que vous sollicitez habituellement. Servira aussi à envoyer
            les liens de dépôt de rapport et les demandes de signature.
          </p>
        </header>

        <div className="space-y-2">
          <Label htmlFor="contactNom">Nom et prénom *</Label>
          <Input
            id="contactNom"
            name="contactNom"
            required
            maxLength={200}
            placeholder="Jean Dupond"
            aria-invalid={Boolean(err("contactNom"))}
          />
          {err("contactNom") && (
            <p className="text-sm text-destructive">{err("contactNom")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email *</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              maxLength={200}
              placeholder="jean.dupond@apave.fr"
              aria-invalid={Boolean(err("contactEmail"))}
            />
            {err("contactEmail") && (
              <p className="text-sm text-destructive">{err("contactEmail")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactTelephone">Téléphone</Label>
            <Input
              id="contactTelephone"
              name="contactTelephone"
              type="tel"
              placeholder="01 23 45 67 89"
              aria-invalid={Boolean(err("contactTelephone"))}
            />
            {err("contactTelephone") && (
              <p className="text-sm text-destructive">
                {err("contactTelephone")}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="filet-pointille" />

      {/* -------- Vigilance L8222-1 -------- */}
      <section className="space-y-5">
        <header className="space-y-3">
          <p className="label-admin">3. Obligation de vigilance</p>
          <LegalBadge
            reference="Art. L8222-1 et D8222-5 CT"
            href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389145"
            extrait="Toute personne qui conclut un contrat dont l'objet porte sur une obligation d'un montant minimum de 5 000 euros hors taxes est tenue, lors de la conclusion et tous les six mois jusqu'à la fin de son exécution, de se faire remettre par son cocontractant les documents attestant qu'il a fait l'objet des vérifications."
          >
            Pour <strong>tout contrat ≥ 5 000 € HT</strong>, le donneur d&apos;ordre
            (vous) doit vérifier que son prestataire est à jour de ses obligations
            sociales. Renouvellement <strong>tous les 6 mois</strong>.
          </LegalBadge>
          <p className="text-[0.85rem] text-[color:var(--muted-foreground)]">
            Téléversez les pièces justificatives dès maintenant si vous les avez.
            Vous pourrez toujours les ajouter plus tard ; la plateforme vous enverra
            une alerte 30 jours avant expiration.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Attestation URSSAF</Label>
            <EvidenceDropzone
              name="attestationUrssaf"
              label="Attestation URSSAF"
              hint="Renouvellement tous les 6 mois"
            />
            <div className="space-y-1">
              <Label
                htmlFor="attestationUrssafValableJusquA"
                className="text-[0.78rem] font-normal text-[color:var(--muted-foreground)]"
              >
                Valable jusqu&apos;au
              </Label>
              <Input
                id="attestationUrssafValableJusquA"
                name="attestationUrssafValableJusquA"
                type="date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assurance RC Pro</Label>
            <EvidenceDropzone
              name="assuranceRcPro"
              label="Attestation RC Pro"
              hint="Renouvellement annuel chez votre assureur"
            />
            <div className="space-y-1">
              <Label
                htmlFor="assuranceRcProValableJusquA"
                className="text-[0.78rem] font-normal text-[color:var(--muted-foreground)]"
              >
                Valable jusqu&apos;au
              </Label>
              <Input
                id="assuranceRcProValableJusquA"
                name="assuranceRcProValableJusquA"
                type="date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Extrait Kbis</Label>
            <EvidenceDropzone
              name="kbis"
              label="Extrait Kbis"
              hint="Datant de moins de 3 mois à l'embauche"
            />
            <div className="space-y-1">
              <Label
                htmlFor="kbisDateEmission"
                className="text-[0.78rem] font-normal text-[color:var(--muted-foreground)]"
              >
                Date d&apos;émission
              </Label>
              <Input id="kbisDateEmission" name="kbisDateEmission" type="date" />
            </div>
          </div>
        </div>
      </section>

      <div className="filet-pointille" />

      {/* -------- Notes -------- */}
      <section className="space-y-3">
        <Label htmlFor="notesInternes">
          Notes internes
          <InfoTooltip>
            Ces notes ne sont jamais partagées avec le prestataire.
          </InfoTooltip>
        </Label>
        <textarea
          id="notesInternes"
          name="notesInternes"
          rows={3}
          maxLength={1000}
          className="w-full rounded-md border border-rule bg-background px-3 py-2 text-sm shadow-sm"
          placeholder="Ex : interlocuteur historique, contrat cadre signé en 2023, remise de 15%…"
        />
      </section>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Ajouter ce prestataire"}
        </Button>
        <Link
          href={`/etablissements/${etablissementId}/prestataires`}
          className={buttonVariants({ variant: "outline" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
