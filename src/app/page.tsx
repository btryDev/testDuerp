import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth/require-user";
import { getOptionalUserEtablissement } from "@/lib/auth/scope";

export default async function Home() {
  const user = await getOptionalUser();
  const etab = user ? await getOptionalUserEtablissement() : null;
  // Quand l'utilisateur n'est pas connecté, le CTA principal l'envoie sur
  // /signup : la création d'un dossier nécessite un compte (ADR-005), le
  // middleware redirigerait de toute façon /onboarding vers /login.
  // 1 user = 1 dossier : quand il existe déjà, on pointe direct dessus ;
  // sinon, on aiguille vers /onboarding.
  const ctaHref = !user
    ? "/signup"
    : etab
      ? `/etablissements/${etab.id}`
      : "/onboarding";
  const ctaLabel = !user
    ? "Créer un compte"
    : etab
      ? "Reprendre mon dossier"
      : "Terminer la mise en place";

  return (
    <main>
      {/* ================================================================
         HERO — plein écran, typo monumentale, cadran en pièce maîtresse
         ================================================================ */}
      <section className="relative">
        {/* Halo très léger derrière le cadran */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_78%_55%,color-mix(in_oklch,var(--warm)_6%,transparent)_0%,transparent_70%)]"
        />

        <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1320px] flex-col px-6 sm:px-12">
          {/* Bandeau-manchette */}
          <div className="flex items-center justify-between pt-6 pb-4 font-mono text-[0.54rem] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span className="text-ink">N° 00A</span>
              <span className="text-rule">—</span>
              <span>Santé-sécurité · TPE/PME</span>
            </span>
            <span className="hidden sm:inline">Avril 2026 · FR</span>
          </div>

          {/* Composition héroïque */}
          <div className="flex flex-1 items-center">
            <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
              {/* Colonne typo — monumentale */}
              <div className="order-2 lg:order-1">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                  §&nbsp;I
                </p>

                <h1 className="mt-8 text-[clamp(3rem,8.5vw,7rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                  La conformité,
                  <br />
                  <span className="accent-serif text-[color:var(--warm)] text-[1.05em]">
                    tenue à jour
                  </span>
                  <span className="text-ink">.</span>
                </h1>

                <p className="mt-10 max-w-[34ch] text-[1rem] leading-[1.7] text-ink/70">
                  Un seul espace pour suivre vos obligations,
                  anticiper vos échéances, et sortir un dossier prêt
                  à montrer.
                </p>

                <div className="mt-14 flex flex-wrap items-center gap-6">
                  <Link
                    href={ctaHref}
                    className={buttonVariants({ size: "lg" })}
                  >
                    {ctaLabel}&nbsp;→
                  </Link>
                  {user ? (
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
                      Connecté · {user.email}
                    </span>
                  ) : (
                    <Link
                      href="/login"
                      className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
                    >
                      J'ai déjà un compte · Me connecter
                    </Link>
                  )}
                </div>
              </div>

              {/* Cadran — pièce maîtresse */}
              <div className="order-1 flex items-center justify-center lg:order-2">
                <CadranConformite />
              </div>
            </div>
          </div>

          {/* Pied de hero — mince frise */}
          <div className="flex items-center justify-between border-t border-dashed border-rule/60 py-5 font-mono text-[0.54rem] uppercase tracking-[0.24em] text-muted-foreground">
            <span>Faire défiler</span>
            <span className="flex items-center gap-4">
              <span>DUERP</span>
              <span className="h-[8px] w-px bg-rule" />
              <span>Vérifications</span>
              <span className="h-[8px] w-px bg-rule" />
              <span>Registre</span>
              <span className="h-[8px] w-px bg-rule" />
              <span>Actions</span>
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================
         ÉTAPES — le parcours, aéré
         ================================================================ */}
      <section className="mx-auto max-w-[1320px] px-6 py-28 sm:px-12 sm:py-32">
        <header className="mb-16 flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-muted-foreground">
              §&nbsp;II · Le parcours
            </p>
            <h2 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.05] tracking-[-0.025em]">
              Quatre étapes,
              <span className="accent-serif text-[color:var(--warm)]">
                {" "}
                rien de&nbsp;plus.
              </span>
            </h2>
          </div>
          <span className="hidden font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            ≈ 10 min au total
          </span>
        </header>

        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-cols-4">
          <Etape
            romain="I"
            titre="Établissement"
            corps="SIRET, adresse, effectif."
            duree="3 min"
          />
          <Etape
            romain="II"
            titre="Équipements"
            corps="Électricité, extincteurs, hotte…"
            duree="5 min"
          />
          <Etape
            romain="III"
            titre="Calendrier"
            corps="Échéances générées pour vous."
            duree="auto."
          />
          <Etape
            romain="IV"
            titre="Dossier"
            corps="Prêt à montrer, en un clic."
            duree="1 clic"
          />
        </ol>
      </section>

      <div className="mx-auto max-w-[1320px] px-6 sm:px-12">
        <div className="filet-pointille" />
      </div>

      {/* ================================================================
         OUTILS — ce que vous pilotez ensuite
         ================================================================ */}
      <section className="mx-auto max-w-[1320px] px-6 py-28 sm:px-12 sm:py-32">
        <header className="mb-16 flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-muted-foreground">
              §&nbsp;III · Vos outils
            </p>
            <h2 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.05] tracking-[-0.025em]">
              Quatre modules,
              <span className="accent-serif text-[color:var(--warm)]">
                {" "}
                un&nbsp;dossier.
              </span>
            </h2>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-cols-4">
          <Outil
            picto={<PictoBouclier />}
            titre="DUERP"
            corps="Inventaire des risques, cotation, versionné."
          />
          <Outil
            picto={<PictoHorloge />}
            titre="Vérifications"
            corps="Calendrier des contrôles obligatoires."
          />
          <Outil
            picto={<PictoClasseur />}
            titre="Registre"
            corps="Rapports centralisés, horodatés."
          />
          <Outil
            picto={<PictoFleche />}
            titre="Plan d'actions"
            corps="Écarts à lever, suivis jusqu'au bout."
          />
        </div>
      </section>

      {/* ================================================================
         CTA ferme
         ================================================================ */}
      <section className="mx-auto max-w-[1320px] px-6 sm:px-12">
        <div className="filet-pointille" />
        <div className="flex flex-col items-start justify-between gap-8 py-20 sm:flex-row sm:items-center sm:py-24">
          <div>
            <p className="text-[clamp(1.6rem,3.2vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.02em]">
              {user ? "On reprend ?" : "Prêt à commencer ?"}
              <br />
              <span className="accent-serif text-[color:var(--warm)]">
                {user
                  ? "Votre dossier vous attend."
                  : "Un compte, puis le dossier."}
              </span>
            </p>
            {!user ? (
              <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                Gratuit en bêta · hébergement UE ·{" "}
                <Link
                  href="/login"
                  className="text-ink underline decoration-rule decoration-dotted underline-offset-4 hover:decoration-ink"
                >
                  déjà inscrit·e ?
                </Link>
              </p>
            ) : null}
          </div>

          <Link
            href={ctaHref}
            className={buttonVariants({ size: "lg" })}
          >
            {ctaLabel}&nbsp;→
          </Link>
        </div>
        <div className="filet-pointille" />
      </section>

      {/* ================================================================
         FOOTER minimal
         ================================================================ */}
      <footer className="mx-auto max-w-[1320px] px-6 py-10 sm:px-12">
        <div className="flex flex-col gap-4 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Hébergement UE · vos données restent en Europe</span>
          <span className="flex items-center gap-4">
            <span>RGPD</span>
            <span className="h-[8px] w-px bg-rule" />
            <span>Mentions</span>
            <span className="h-[8px] w-px bg-rule" />
            <span>CGU</span>
          </span>
        </div>
      </footer>
    </main>
  );
}

/* ─── Étape — frise numérotée ──────────────────────────────── */

function Etape({
  romain,
  titre,
  corps,
  duree,
}: {
  romain: string;
  titre: string;
  corps: string;
  duree: string;
}) {
  return (
    <li className="group relative flex flex-col gap-5 border-t border-rule pt-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[1.5rem] font-medium leading-none text-[color:var(--warm)]">
          {romain}.
        </span>
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground">
          {duree}
        </span>
      </div>
      <div>
        <p className="text-[1.15rem] font-medium tracking-[-0.015em]">
          {titre}
        </p>
        <p className="mt-2 text-[0.85rem] leading-[1.6] text-ink/60">
          {corps}
        </p>
      </div>
    </li>
  );
}

/* ─── Outil — carte respirante ─────────────────────────────── */

function Outil({
  picto,
  titre,
  corps,
}: {
  picto: React.ReactNode;
  titre: string;
  corps: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full ring-1 ring-rule">
        {picto}
      </div>
      <div>
        <p className="text-[1.1rem] font-medium tracking-[-0.012em]">
          {titre}
        </p>
        <p className="mt-2 max-w-[24ch] text-[0.85rem] leading-[1.6] text-ink/60">
          {corps}
        </p>
      </div>
    </div>
  );
}

/* ─── Pictos outils — minimal, technique ───────────────────── */

function PictoBouclier() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-ink">
      <path
        d="M 20 6 L 32 10 L 32 22 Q 32 30 20 35 Q 8 30 8 22 L 8 10 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 14 20 L 18 24 L 26 16"
        fill="none"
        stroke="var(--warm)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PictoHorloge() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-ink">
      <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = 11.5;
        const r2 = i % 3 === 0 ? 9.5 : 10.5;
        return (
          <line
            key={i}
            x1={20 + Math.cos(a) * r1}
            y1={20 + Math.sin(a) * r1}
            x2={20 + Math.cos(a) * r2}
            y2={20 + Math.sin(a) * r2}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? "0.9" : "0.5"}
            strokeLinecap="round"
            opacity={i % 3 === 0 ? "0.9" : "0.5"}
          />
        );
      })}
      <line x1="20" y1="20" x2="20" y2="13" stroke="var(--warm)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="25" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.3" fill="currentColor" />
    </svg>
  );
}

function PictoClasseur() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-ink">
      <rect x="8" y="10" width="24" height="22" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="8" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="8" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="8" y1="28" x2="32" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <rect x="14" y="6" width="12" height="6" rx="0.8" fill="var(--paper)" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="28" cy="20" r="1.3" fill="var(--warm)" />
    </svg>
  );
}

function PictoFleche() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 text-ink">
      <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.5" />
      <path
        d="M 10 20 L 28 20"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M 22 14 L 28 20 L 22 26"
        fill="none"
        stroke="var(--warm)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Cadran radial — hand-drawn technique, style Union ─────── */

function CadranConformite() {
  const cx = 260;
  const cy = 260;
  const rOuter = 240;
  const rMid = 208;
  const rInner = 145;

  const ticks = Array.from({ length: 120 }, (_, i) => {
    const angle = (i / 120) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 30 === 0;
    const isMid = i % 10 === 0 && !isMajor;
    const isSub = i % 5 === 0 && !isMajor && !isMid;
    const len = isMajor ? 22 : isMid ? 12 : isSub ? 7 : 4;
    const r1 = rOuter - len;
    const r2 = rOuter;
    return {
      x1: cx + Math.cos(angle) * r1,
      y1: cy + Math.sin(angle) * r1,
      x2: cx + Math.cos(angle) * r2,
      y2: cy + Math.sin(angle) * r2,
      isMajor,
      isMid,
      isSub,
      i,
    };
  });

  const cardinaux = [
    { angle: -Math.PI / 2, label: "I", titre: "DUERP" },
    { angle: 0, label: "II", titre: "VÉRIFICATIONS" },
    { angle: Math.PI / 2, label: "III", titre: "REGISTRE" },
    { angle: Math.PI, label: "IV", titre: "ACTIONS" },
  ];

  return (
    <svg
      viewBox="0 0 520 520"
      className="h-auto w-full max-w-[560px]"
      role="img"
      aria-label="Cadran des quatre volets du dossier"
    >
      {/* Tics radiaux */}
      <g>
        {ticks.map((t) => (
          <line
            key={t.i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="var(--ink)"
            strokeWidth={t.isMajor ? 1.3 : t.isMid ? 0.8 : t.isSub ? 0.55 : 0.4}
            opacity={t.isMajor ? 0.95 : t.isMid ? 0.6 : t.isSub ? 0.4 : 0.22}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Cercle mid pointillé */}
      <circle
        cx={cx}
        cy={cy}
        r={rMid}
        fill="none"
        stroke="var(--rule)"
        strokeWidth="0.55"
        strokeDasharray="1 4"
      />

      {/* Cercle intérieur — fond subtil */}
      <circle
        cx={cx}
        cy={cy}
        r={rInner}
        fill="var(--paper-elevated)"
        stroke="var(--ink)"
        strokeWidth="0.5"
        opacity="0.92"
      />

      {/* Labels cardinaux */}
      <g>
        {cardinaux.map((c, idx) => {
          const rDot = rMid - 8;
          const rText = rInner + 28;
          const x = cx + Math.cos(c.angle) * rDot;
          const y = cy + Math.sin(c.angle) * rDot;
          const tx = cx + Math.cos(c.angle) * rText;
          const ty = cy + Math.sin(c.angle) * rText;
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="2.4" fill="var(--warm)" />
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="none"
                stroke="var(--warm)"
                strokeWidth="0.45"
                opacity="0.45"
              />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                fill="var(--ink)"
                letterSpacing="1.8"
                fontWeight="500"
              >
                {c.titre}
              </text>
              <text
                x={tx}
                y={ty + 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize="7.5"
                fill="var(--ink)"
                opacity="0.4"
                letterSpacing="1.2"
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Aiguille */}
      <g transform={`rotate(32 ${cx} ${cy})`}>
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - rInner + 10}
          stroke="var(--ink)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy - rInner + 10} r="3.2" fill="var(--minium)" />
      </g>

      {/* Crosshair */}
      <g opacity="0.6">
        <line x1={cx - 18} y1={cy} x2={cx + 18} y2={cy} stroke="var(--ink)" strokeWidth="0.4" />
        <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 18} stroke="var(--ink)" strokeWidth="0.4" />
      </g>

      {/* Hub */}
      <circle cx={cx} cy={cy} r="5.5" fill="var(--ink)" />

      {/* Indicateur N */}
      <text
        x={cx}
        y={cy - rOuter - 4}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--ink)"
        opacity="0.45"
        letterSpacing="1"
      >
        N
      </text>

      {/* Légende centrale minuscule */}
      <text
        x={cx}
        y={cy + 58}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7.5"
        fill="var(--ink)"
        opacity="0.45"
        letterSpacing="2.2"
      >
        DOSSIER UNIQUE
      </text>
    </svg>
  );
}
