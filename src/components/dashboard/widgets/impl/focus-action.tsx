"use client";

// Widget « Focus de la semaine ».
// Prend la première recommandation du moteur `genererRecommandations`
// (déjà triée par priorité) et la présente comme LA chose à faire.
// Affiche un bloc "pourquoi" avec 1-3 raisons déduites du kind.

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BentoCell } from "@/components/dashboard/BentoCell";
import type { DashboardBundle } from "../types";

const RAISONS_PAR_KIND: Record<
  string,
  { badge: string; tone: "alerte" | "warn" | "info"; pourquoi: string[] }
> = {
  verif_depassee: {
    badge: "Vérification dépassée",
    tone: "alerte",
    pourquoi: [
      "La date prévue est passée sans rapport déposé.",
      "Un inspecteur peut demander cette vérification à tout moment.",
      "Au-delà, un sinistre non couvert par l'assurance devient possible.",
    ],
  },
  action_en_retard: {
    badge: "Action corrective en retard",
    tone: "alerte",
    pourquoi: [
      "L'échéance fixée pour lever l'écart est dépassée.",
      "Le risque initial reste actif côté DUERP.",
      "À documenter dans le registre une fois levé.",
    ],
  },
  verif_proche: {
    badge: "Vérification imminente",
    tone: "warn",
    pourquoi: [
      "L'échéance tombe sous 7 jours.",
      "Prendre rendez-vous maintenant avec le réalisateur requis.",
    ],
  },
  action_proche: {
    badge: "Action à clôturer",
    tone: "warn",
    pourquoi: [
      "L'échéance prévue arrive sous 15 jours.",
      "Préparer le justificatif de levée (rapport, photo, commentaire).",
    ],
  },
  duerp_a_jour: {
    badge: "DUERP à mettre à jour",
    tone: "info",
    pourquoi: [
      "Le document a plus de 11 mois.",
      "La mise à jour annuelle est exigée par R. 4121-2 pour 11 salariés et +.",
    ],
  },
};

export function WidgetFocusAction({ bundle }: { bundle: DashboardBundle }) {
  const reco = bundle.dashboard.recommandations[0];

  if (!reco) {
    return (
      <BentoCell kicker="Focus de la semaine">
        <p className="text-[0.88rem] text-muted-foreground">
          Rien d&apos;urgent. Profitez-en pour relire vos unités de
          travail ou ajouter un équipement oublié.
        </p>
      </BentoCell>
    );
  }

  const meta = RAISONS_PAR_KIND[reco.kind] ?? {
    badge: "Action prioritaire",
    tone: "info" as const,
    pourquoi: ["Identifié par le moteur de recommandations."],
  };
  const badgeClass =
    meta.tone === "alerte"
      ? "pill-alerte"
      : meta.tone === "warn"
        ? "pill-warn"
        : "pill-ok";
  const dateStr = reco.date
    ? reco.date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
      })
    : null;

  return (
    <BentoCell kicker="Focus de la semaine">
      <div className="flex flex-col gap-4">
        <span className={"w-fit " + badgeClass}>{meta.badge}</span>

        <h3 className="text-[1.15rem] font-semibold leading-snug tracking-[-0.015em]">
          {reco.titre}
        </h3>

        {reco.sousTitre || dateStr ? (
          <p className="text-[0.82rem] text-muted-foreground">
            {[reco.sousTitre, dateStr].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <ul className="flex flex-col gap-1.5 border-l-2 border-rule-soft pl-3 text-[0.82rem] leading-[1.5] text-ink/75">
          {meta.pourquoi.map((raison, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                aria-hidden
                className="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-muted-foreground"
              />
              {raison}
            </li>
          ))}
        </ul>

        <Link
          href={reco.href}
          className={buttonVariants({ size: "sm" })}
          style={{ width: "fit-content" }}
        >
          Ouvrir →
        </Link>
      </div>
    </BentoCell>
  );
}
