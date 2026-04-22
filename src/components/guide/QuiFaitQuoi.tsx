// Les pictogrammes sont volontairement des glyphes Unicode (mono-space),
// en écho au cadran de la landing. Plus sobre et éditorial que des icônes
// SaaS "filled".

type Role = {
  titre: string;
  sousTitre: string;
  description: string;
  glyph: string;
  big?: boolean;
};

const ROLES: Role[] = [
  {
    titre: "Vous",
    sousTitre: "Dirigeant",
    description:
      "Décidez, signez, déposez. Vous portez la responsabilité.",
    glyph: "◉",
    big: true,
  },
  {
    titre: "Salariés",
    sousTitre: "Terrain",
    description:
      "Consultés lors du DUERP. Remontent les situations dangereuses.",
    glyph: "◐",
  },
  {
    titre: "Médecine du travail",
    sousTitre: "Avis médical",
    description:
      "Avis sur les postes, fiche d'entreprise. Dès le 1ᵉʳ salarié.",
    glyph: "+",
  },
  {
    titre: "Organismes agréés",
    sousTitre: "Vérifications",
    description:
      "Électricité, ascenseurs, incendie — contrôles obligatoires.",
    glyph: "✓",
  },
  {
    titre: "CSE / CSSCT",
    sousTitre: "11 salariés et +",
    description: "Consultation DUERP + plan de prévention.",
    glyph: "◈",
  },
  {
    titre: "Inspection du travail",
    sousTitre: "Contrôleur",
    description:
      "Peut demander à tout moment DUERP + registre + actions.",
    glyph: "§",
  },
];

export function QuiFaitQuoi() {
  return (
    <section>
      <header className="mb-10 max-w-[58ch]">
        <p className="g-kicker">§ Qui fait quoi</p>
        <h2 className="g-h2 mt-3">
          Vous n&apos;êtes <span className="g-h2-em">pas seul</span>.
        </h2>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => (
          <RoleCard key={r.titre} role={r} />
        ))}
      </ul>
    </section>
  );
}

function RoleCard({ role }: { role: Role }) {
  if (role.big) {
    return (
      <li className="qui-big relative overflow-hidden rounded-2xl bg-ink p-6 text-paper-elevated sm:col-span-2 lg:col-span-1 lg:row-span-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-[color:color-mix(in_oklch,var(--accent-vif)_25%,transparent)] blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div
            aria-hidden
            className="flex size-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_oklch,var(--paper-elevated)_10%,transparent)] font-mono text-[1.4rem] leading-none text-[color:var(--accent-vif)]"
          >
            {role.glyph}
          </div>
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[color:color-mix(in_oklch,var(--paper-elevated)_65%,transparent)]">
              {role.sousTitre}
            </p>
            <h3 className="mt-2 text-[2rem] font-medium tracking-[-0.025em]">
              {role.titre}
            </h3>
            <p className="mt-3 max-w-[32ch] text-[0.95rem] leading-[1.55] text-[color:color-mix(in_oklch,var(--paper-elevated)_80%,transparent)]">
              {role.description}
            </p>
          </div>
        </div>
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-rule-soft bg-paper-elevated p-5">
      <div
        aria-hidden
        className="flex size-10 items-center justify-center rounded-xl bg-paper-sunk font-mono text-[1.1rem] leading-none text-ink/80"
      >
        {role.glyph}
      </div>
      <div>
        <h3 className="text-[1.02rem] font-semibold tracking-[-0.012em]">
          {role.titre}
        </h3>
        <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          {role.sousTitre}
        </p>
      </div>
      <p className="text-[0.86rem] leading-[1.5] text-ink/75">
        {role.description}
      </p>
    </li>
  );
}
