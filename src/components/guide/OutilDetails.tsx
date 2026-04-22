import Link from "next/link";
import type { ReactNode } from "react";

type Couleur = "vif" | "warm" | "ink" | "minium";

type OutilDetail = {
  n: string;
  titre: string;
  source: string;
  couleur: Couleur;
  loi: string[];
  app: string[];
  cta: { libelle: string; href: string };
};

const DETAILS: OutilDetail[] = [
  {
    n: "01",
    titre: "DUERP",
    source: "Art. R. 4121-1 à R. 4121-4 · Code du travail",
    couleur: "vif",
    loi: [
      "Inventaire écrit des risques par unité de travail.",
      "Mise à jour ≥ 1 fois par an (11 salariés et +) et à tout changement.",
      "Conservation 40 ans (loi du 2 août 2021).",
    ],
    app: [
      "Trame pré-remplie adaptée à votre secteur NAF.",
      "Cotation guidée par unité de travail.",
      "Versionnage automatique, export PDF signé daté.",
    ],
    cta: { libelle: "Ouvrir mon DUERP", href: "duerp" },
  },
  {
    n: "02",
    titre: "Vérifications",
    source:
      "Art. R. 4323-22 · Arrêté du 25 juin 1980 (ERP) · CCH R. 123-51",
    couleur: "warm",
    loi: [
      "Contrôles réguliers des équipements à risque.",
      "Périodicité imposée : annuelle, semestrielle, quinquennale.",
      "Réalisés par organisme agréé, personne qualifiée ou exploitant.",
    ],
    app: [
      "Calendrier généré à partir de vos équipements déclarés.",
      "Alertes J-30 / J-7 / jour J, escalade si retard.",
      "Lien direct vers un prestataire agréé (optionnel).",
    ],
    cta: { libelle: "Voir mon calendrier", href: "calendrier" },
  },
  {
    n: "03",
    titre: "Registre de sécurité",
    source: "Art. L. 4711-5 · Code du travail",
    couleur: "ink",
    loi: [
      "Centralisation de tous les rapports, avis, observations.",
      "Tenue continue, horodatée.",
      "Consultable par agents de contrôle et salariés.",
    ],
    app: [
      "Dépôt en 1 clic, liaison automatique à la vérification.",
      "Recalcul automatique de la prochaine échéance.",
      "Export ZIP + index PDF en 30 secondes.",
    ],
    cta: { libelle: "Ouvrir le registre", href: "registre" },
  },
  {
    n: "04",
    titre: "Plan d'actions",
    source: "Art. L. 4121-2 · Code du travail",
    couleur: "minium",
    loi: [
      "Principes généraux de prévention : supprimer avant de protéger.",
      "Toute action tracée de l'ouverture à la levée.",
      "Justificatif requis à la clôture.",
    ],
    app: [
      "Action créée automatiquement depuis un écart de rapport.",
      "Assignation, échéance, rappels.",
      "Levée documentée, historique auditable.",
    ],
    cta: { libelle: "Ouvrir le plan", href: "actions" },
  },
];

function bordureCouleur(c: Couleur): string {
  switch (c) {
    case "vif":
      return "var(--accent-vif)";
    case "warm":
      return "var(--warm)";
    case "ink":
      return "var(--ink)";
    case "minium":
      return "var(--minium)";
  }
}

export function OutilDetails({ etablissementId }: { etablissementId: string }) {
  return (
    <section>
      <header className="mb-10 max-w-[64ch]">
        <p className="g-kicker">§ Détail — ce que dit la loi · ce que fait l&apos;app</p>
        <h2 className="g-h2 mt-3">
          Pour chaque outil, <span className="g-h2-em">deux colonnes</span>.
        </h2>
        <p className="mt-3 text-[0.92rem] leading-[1.55] text-muted-foreground">
          À gauche, l&apos;obligation légale. À droite, ce que la
          plateforme génère, suit ou rappelle pour vous la tenir.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {DETAILS.map((d) => (
          <CarteOutilDetail
            key={d.n}
            detail={d}
            etablissementId={etablissementId}
          />
        ))}
      </div>
    </section>
  );
}

function CarteOutilDetail({
  detail,
  etablissementId,
}: {
  detail: OutilDetail;
  etablissementId: string;
}) {
  const ctaHref =
    detail.cta.href === "duerp"
      ? `/etablissements/${etablissementId}`
      : `/etablissements/${etablissementId}/${detail.cta.href}`;

  return (
    <article
      className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-rule-soft bg-paper-elevated p-6"
      style={{
        borderTop: `3px solid ${bordureCouleur(detail.couleur)}`,
      }}
    >
      <header>
        <div className="flex items-baseline gap-3">
          <span
            className="font-mono text-[0.75rem] font-medium tabular-nums"
            style={{ color: bordureCouleur(detail.couleur) }}
          >
            {detail.n}
          </span>
          <h3 className="text-[1.3rem] font-semibold tracking-[-0.02em]">
            {detail.titre}
          </h3>
        </div>
        <code className="mt-1.5 block font-mono text-[0.7rem] text-muted-foreground">
          {detail.source}
        </code>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BlocColonne
          titre="Ce que dit la loi"
          items={detail.loi}
          ton="neutre"
        />
        <BlocColonne
          titre="Ce que l'app fait"
          items={detail.app}
          ton="vif"
        />
      </div>

      <Link
        href={ctaHref}
        className="inline-flex w-fit items-center gap-1.5 self-start text-[0.86rem] font-medium text-[color:var(--accent-vif)] transition-opacity hover:opacity-80"
      >
        {detail.cta.libelle} →
      </Link>
    </article>
  );
}

function BlocColonne({
  titre,
  items,
  ton,
}: {
  titre: string;
  items: string[];
  ton: "neutre" | "vif";
}) {
  return (
    <div
      className={
        "flex flex-col gap-2 rounded-lg px-3.5 py-3 " +
        (ton === "vif"
          ? "bg-[color:var(--accent-vif-soft)]"
          : "bg-paper-sunk")
      }
    >
      <p
        className={
          "font-mono text-[0.62rem] uppercase tracking-[0.18em] " +
          (ton === "vif"
            ? "text-[color:var(--accent-vif)]"
            : "text-muted-foreground")
        }
      >
        {titre}
      </p>
      <ul className="flex flex-col gap-1.5 text-[0.86rem] leading-[1.5]">
        {items.map((it, i) => (
          <LigneOutil key={i}>{it}</LigneOutil>
        ))}
      </ul>
    </div>
  );
}

function LigneOutil({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-[6px] inline-block size-1 shrink-0 rounded-full bg-current opacity-60"
      />
      <span>{children}</span>
    </li>
  );
}
