import {
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Dot,
  FileStack,
  ListChecks,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Couleur = "vif" | "warm" | "ink" | "minium" | "muted";

type Outil = {
  n: string;
  titre: string;
  sousTitre: string;
  description: string;
  couleur: Couleur;
  statut: "actif" | "bientot";
  icon: LucideIcon;
};

const OUTILS: Outil[] = [
  {
    n: "01",
    titre: "DUERP",
    sousTitre: "Document unique",
    description: "Inventaire des risques par unité de travail, coté et signé.",
    couleur: "vif",
    statut: "actif",
    icon: ClipboardCheck,
  },
  {
    n: "02",
    titre: "Vérifications",
    sousTitre: "Périodiques",
    description: "Calendrier des contrôles obligatoires, rapports classés.",
    couleur: "warm",
    statut: "actif",
    icon: CalendarClock,
  },
  {
    n: "03",
    titre: "Registre",
    sousTitre: "De sécurité",
    description:
      "Rapports horodatés, présentables à tout moment à un contrôleur.",
    couleur: "ink",
    statut: "actif",
    icon: FileStack,
  },
  {
    n: "04",
    titre: "Plan d'actions",
    sousTitre: "Correctives",
    description: "Écarts et risques à lever, suivis jusqu'à clôture.",
    couleur: "minium",
    statut: "actif",
    icon: ListChecks,
  },
  {
    n: "05",
    titre: "Carnet sanitaire",
    sousTitre: "Eau · air",
    description: "Relevés sanitaires des installations d'eau et d'aération.",
    couleur: "muted",
    statut: "bientot",
    icon: Wind,
  },
  {
    n: "06",
    titre: "Autres outils",
    sousTitre: "À venir",
    description:
      "Registre unique du personnel, affichages obligatoires, fiche d'entreprise…",
    couleur: "muted",
    statut: "bientot",
    icon: BookOpen,
  },
];

export function OutilsConformite() {
  return (
    <section>
      <header className="mb-10">
        <p className="g-kicker">§ Les outils de conformité</p>
        <h2 className="g-h2 mt-3 max-w-[18ch]">
          Une vue d&apos;ensemble
          <br />
          <span className="g-h2-em">sur votre conformité.</span>
        </h2>
        <p className="outils-intro-text mt-5">
          Vous déclarez vos équipements et votre matériel ; la plateforme{" "}
          <strong>génère les documents attendus</strong> (DUERP, registre,
          plan d&apos;actions…), les met à jour au fil de vos
          vérifications et <strong>vous rappelle les échéances</strong>{" "}
          avant qu&apos;elles ne passent. Chaque outil ci-dessous
          correspond à une obligation précise — la plateforme en
          maintient quatre aujourd&apos;hui, d&apos;autres arrivent.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OUTILS.map((o) => (
          <OutilCard key={o.n} outil={o} />
        ))}
      </ul>
    </section>
  );
}

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
    default:
      return "var(--rule)";
  }
}

function OutilCard({ outil }: { outil: Outil }) {
  const Icon = outil.icon;
  const bientot = outil.statut === "bientot";
  return (
    <li
      aria-disabled={bientot || undefined}
      className={
        "relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-rule-soft bg-paper-elevated p-6 transition-colors hover:border-rule " +
        (bientot ? "opacity-[0.75]" : "")
      }
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: bordureCouleur(outil.couleur) }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-paper-sunk">
          <Icon
            aria-hidden
            className="size-5"
            style={{ color: bordureCouleur(outil.couleur) }}
          />
        </div>
        <TagStatut statut={outil.statut} />
      </div>

      <div>
        <span className="numero-section text-[0.7rem]">{outil.n}</span>
        <h3 className="mt-1 text-[1.15rem] font-semibold tracking-[-0.012em]">
          {outil.titre}
        </h3>
        <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted-foreground">
          {outil.sousTitre}
        </p>
      </div>

      <p className="text-[0.88rem] leading-[1.55] text-ink/75">
        {outil.description}
      </p>
    </li>
  );
}

function TagStatut({ statut }: { statut: Outil["statut"] }) {
  if (statut === "actif") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--accent-vif-soft)] px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--accent-vif)]">
        <Dot aria-hidden className="size-3 fill-current" strokeWidth={3} />
        Actif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper-sunk/60 px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
      Bientôt
    </span>
  );
}
