import Link from "next/link";
import { Building2 } from "lucide-react";
import { LABEL_DOMAINE } from "@/lib/prestataires/schema";
import type { PrestataireAvecVigilance } from "@/lib/prestataires/queries";
import { VigilancePiecePill } from "./VigilancePills";

/**
 * La carte d'un prestataire, en charte board (`docs/charte-board.md`).
 *
 * Elle était en charte papier — `cartouche`, `label-admin`,
 * `filet-pointille`, `--minium`, `--seal`, `--paper-sunk`. Le module est
 * pourtant l'annuaire de référence du produit, celui qu'on copie pour en
 * écrire un autre : le laisser en papier, c'était propager la dette à chaque
 * annuaire suivant.
 *
 * Le gabarit suit `VitrineEquipement` : une carte de grille à rayon 22, un
 * champ coloré en tête qui annonce ce qui identifie l'objet, puis le corps.
 * Ici la tête porte la raison sociale plutôt qu'un lieu — c'est le nom qu'on
 * cherche des yeux dans une grille d'annuaire, pas le SIRET.
 */
export function PrestataireCard({
  etablissementId,
  prestataire,
}: {
  etablissementId: string;
  prestataire: PrestataireAvecVigilance;
}) {
  const { vigilance } = prestataire;
  const nbAlertes = vigilance.alertesOuvertes;

  return (
    <Link
      href={`/etablissements/${etablissementId}/prestataires/${prestataire.id}`}
      className="carte-board group flex flex-col overflow-hidden rounded-[22px]"
    >
      {/* La tête : le nom, et l'état de vigilance en un coup d'œil. Le champ
          passe au rose quand une pièce manque ou expire — la couleur dit
          l'état, jamais le volume (charte § 7). */}
      <span
        className={
          "flex flex-none flex-col items-start justify-end gap-2 p-3.5 pt-4 " +
          (nbAlertes > 0
            ? "bg-[color:var(--board-signal)] text-[color:var(--board-signal-ink)]"
            : "bg-[color:var(--board-blue-pale)] text-[color:var(--board-blue-ink)]")
        }
      >
        <span className="flex w-full items-start justify-between gap-2">
          <Building2 className="size-[22px] flex-none" aria-hidden />
          {prestataire.estOrganismeAgree && (
            <span className="rounded-full bg-[color:var(--board-card)]/70 px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em]">
              Organisme agréé
            </span>
          )}
        </span>
        <span className="block min-w-0 text-[15px] font-semibold leading-[1.25] tracking-[-0.015em] line-clamp-2">
          {prestataire.raisonSociale}
        </span>
        <span className="block font-mono text-[10px] uppercase leading-[1.3] tracking-[0.1em] opacity-80">
          {prestataire.siret
            ? `SIRET ${prestataire.siret}`
            : "SIRET non renseigné"}
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-3.5 px-4 pb-4 pt-3.5">
        {prestataire.domaines.length > 0 && (
          <span className="flex flex-wrap gap-1.5">
            {prestataire.domaines.map((d) => (
              <span
                key={d}
                className="rounded-full bg-[color:var(--board-slate-pale)] px-2.5 py-[3px] text-[11.5px] text-[color:var(--board-slate-mid)]"
              >
                {LABEL_DOMAINE[d]}
              </span>
            ))}
          </span>
        )}

        <span className="block text-[12.5px] leading-[1.5] text-[color:var(--board-slate-mid)]">
          {prestataire.contactNom}
          <span className="mt-0.5 block font-mono text-[11.5px] text-[color:var(--board-slate-soft)]">
            {prestataire.contactEmail}
          </span>
        </span>

        {/* Les deux pièces qui portent une échéance. Le Kbis n'en est pas :
            aucun texte ne lui assortit de périodicité citable, et le produit
            informe sans décréter (cf. `vigilance.ts`). */}
        <span className="mt-auto flex flex-col gap-1.5 pt-1">
          <VigilancePiecePill
            libelle="Attestation URSSAF"
            statut={vigilance.urssaf}
            jours={vigilance.urssafExpireDans}
          />
          <VigilancePiecePill
            libelle="RC Pro"
            statut={vigilance.rcPro}
            jours={vigilance.rcProExpireDans}
          />
        </span>

        <span className="flex items-center justify-between border-t border-[color:var(--board-slate-line)] pt-3">
          <span className="board-eyebrow text-[10px] tracking-[0.16em] text-[color:var(--board-slate-soft)]">
            {vigilance.kbis === "present" ? "Kbis fourni" : "Kbis attendu"}
          </span>
          <span className="text-[12.5px] font-semibold text-[color:var(--board-blue-ink)] group-hover:text-[color:var(--board-ink)]">
            Ouvrir
          </span>
        </span>
      </span>
    </Link>
  );
}
