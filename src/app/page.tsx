import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Etape = {
  numero: string;
  titre: string;
  corps: string;
  duree: string;
  illustration: React.ReactNode;
};

const ETAPES: Etape[] = [
  {
    numero: "01",
    titre: "Mon établissement",
    corps: "Adresse, effectif, régime (ERP, travail, habitation).",
    duree: "3 min",
    illustration: <IlloBatiment />,
  },
  {
    numero: "02",
    titre: "Mes équipements",
    corps: "Électricité, extincteurs, hotte, ascenseur…",
    duree: "5 min",
    illustration: <IlloChecklist />,
  },
  {
    numero: "03",
    titre: "Mon calendrier",
    corps: "Les dates de vérification calculées pour vous.",
    duree: "automatique",
    illustration: <IlloCalendrier />,
  },
  {
    numero: "04",
    titre: "Mon dossier",
    corps: "Registre + plan d'actions + DUERP, prêts à montrer.",
    duree: "1 clic",
    illustration: <IlloDocument />,
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-6 py-10 sm:px-12 sm:py-14">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <p className="label-admin mb-5">Conformité santé-sécurité · TPE/PME</p>
          <h1 className="display-xl text-[clamp(2.2rem,4.5vw,3.4rem)]">
            Votre conformité,
            <br />
            <span className="text-[color:var(--warm)]">
              sans expert à plein temps
            </span>
            .
          </h1>
          <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
            Un outil pensé pour les dirigeants de restaurant, commerce ou
            bureau qui veulent faire les choses bien — sans s&apos;y perdre
            dans les articles de loi. Vous répondez à quelques questions
            simples, l&apos;outil s&apos;occupe des obligations, des
            périodicités et des rappels.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/onboarding"
              className={buttonVariants({ size: "lg" })}
            >
              Démarrer · 5 minutes →
            </Link>
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-muted-foreground">
              Pas de carte bancaire · pas d&apos;engagement
            </span>
          </div>
        </div>

        {/* Bandeau crédibilité à droite du hero */}
        <aside className="cartouche px-6 py-7 sm:px-8">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            Basé sur les sources officielles
          </p>
          <ul className="mt-4 space-y-3 text-[0.88rem]">
            <li className="flex items-start gap-3">
              <span className="mt-[2px] inline-block h-4 w-4 rounded-sm border border-rule bg-paper-sunk" />
              <span>
                <strong>Code du travail & CCH</strong> — articles cités
                pour chaque obligation, lien Légifrance consultable.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[2px] inline-block h-4 w-4 rounded-sm border border-rule bg-paper-sunk" />
              <span>
                <strong>INRS</strong> — taxonomie ED 840, fiches
                sectorielles, guides pratiques.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[2px] inline-block h-4 w-4 rounded-sm border border-rule bg-paper-sunk" />
              <span>
                <strong>Règlements ERP & IGH</strong> — arrêtés du 25 juin
                1980 et du 30 décembre 2011.
              </span>
            </li>
          </ul>
          <p className="mt-5 border-t border-dashed border-rule/60 pt-4 font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
            65 obligations référencées · zéro IA pour les décisions
          </p>
        </aside>
      </section>

      <div className="filet-pointille mt-20" />

      {/* ─── 3 bénéfices concrets ─────────────────────────────── */}
      <section className="mt-16">
        <p className="label-admin mb-3">Ce que l&apos;outil vous apporte</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Trois fardeaux en moins dans votre semaine.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Benefice
            titre="Je sais quoi vérifier et quand"
            corps="Le calendrier de vos contrôles obligatoires est calculé à partir de vos équipements. Plus besoin de chercher les périodicités dans les textes."
            picto={<PictoCalendrier />}
          />
          <Benefice
            titre="Mes rapports au même endroit"
            corps="Le registre numérique centralise vos rapports de vérification. À présenter en 30 secondes si l'inspection ou l'assurance vous le demande."
            picto={<PictoDossier />}
          />
          <Benefice
            titre="Mon dossier prêt en 1 clic"
            corps="DUERP, plan d'actions, dossier de conformité consolidé — générés à la demande au format PDF, avec mentions légales à jour."
            picto={<PictoPdf />}
          />
        </div>
      </section>

      <div className="filet-pointille mt-20" />

      {/* ─── Comment ça marche ─────────────────────────────────── */}
      <section className="mt-16">
        <p className="label-admin mb-3">Comment ça marche</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.015em] leading-tight">
          Quatre étapes, et vous êtes en règle.
        </h2>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e) => (
            <li key={e.numero} className="cartouche flex flex-col gap-4 px-5 py-6">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-16 items-center justify-center rounded-md bg-paper-sunk/70 ring-1 ring-rule-soft">
                  {e.illustration}
                </span>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {e.duree}
                </span>
              </div>
              <div>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                  étape {e.numero}
                </p>
                <p className="mt-1 text-[1rem] font-semibold tracking-[-0.01em]">
                  {e.titre}
                </p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {e.corps}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="filet-pointille mt-20" />

      {/* ─── Pour qui / pas pour qui ──────────────────────────── */}
      <section className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <p className="label-admin mb-3 text-emerald-800">Pour qui</p>
          <h3 className="text-[1.15rem] font-semibold tracking-[-0.012em]">
            Conçu pour les TPE et PME de service ou de proximité
          </h3>
          <ul className="mt-5 space-y-2 text-[0.88rem] leading-relaxed text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-emerald-600" />
              <span>Restaurant, bar, brasserie (code NAF 56.xx)</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-emerald-600" />
              <span>Commerce de détail (code NAF 47.xx)</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-emerald-600" />
              <span>Bureau, conseil, services tertiaires</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-emerald-600" />
              <span>De 1 à 50 salariés, mono ou multi-sites</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="label-admin mb-3 text-rose-900">Pas pour qui</p>
          <h3 className="text-[1.15rem] font-semibold tracking-[-0.012em]">
            Hors périmètre — mieux accompagné par un spécialiste
          </h3>
          <ul className="mt-5 space-y-2 text-[0.88rem] leading-relaxed text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-rose-700" />
              <span>Installations classées (ICPE) à autorisation</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-rose-700" />
              <span>BTP, chantiers, industrie lourde</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-rose-700" />
              <span>ATEX, rayonnements ionisants, chimie</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[6px] inline-block h-[5px] w-[5px] rounded-full bg-rose-700" />
              <span>Établissements sportifs, piscines, santé complexe</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ─── CTA final ────────────────────────────────────────── */}
      <section className="mt-16 cartouche flex flex-col items-start gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
        <div>
          <p className="label-admin mb-2">Prêt à commencer ?</p>
          <p className="text-[1rem] font-semibold tracking-[-0.01em]">
            Créez votre espace en 5 minutes.
          </p>
          <p className="mt-1 text-[0.82rem] text-muted-foreground">
            Vous pourrez modifier tout ce que vous avez saisi plus tard.
          </p>
        </div>
        <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>
          Démarrer →
        </Link>
      </section>

      <div className="filet-pointille mt-20" />

      <footer className="mt-6 grid grid-cols-1 gap-4 text-[0.76rem] leading-relaxed text-muted-foreground sm:grid-cols-3">
        <p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            Hébergement UE
          </span>
          <br />
          Données stockées en Europe (Supabase, Frankfurt). Aucun transfert
          hors UE.
        </p>
        <p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            Rétention
          </span>
          <br />
          Conservation 40 ans des versions de DUERP (loi du 2 août 2021,
          art. R. 4121-4 CT).
        </p>
        <p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink">
            Ce que l&apos;outil ne fait pas
          </span>
          <br />
          Il ne remplace pas un contrôle réglementaire — il vous aide à le
          préparer et à retrouver vos documents.
        </p>
      </footer>
    </main>
  );
}

function Benefice({
  titre,
  corps,
  picto,
}: {
  titre: string;
  corps: string;
  picto: React.ReactNode;
}) {
  return (
    <div className="cartouche flex h-full flex-col gap-4 px-6 py-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-paper-sunk/70 ring-1 ring-rule-soft">
        {picto}
      </div>
      <div>
        <p className="text-[1rem] font-semibold tracking-[-0.01em]">{titre}</p>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
          {corps}
        </p>
      </div>
    </div>
  );
}

/* ─── Illustrations existantes (étapes) ───────────────────────── */

function IlloBatiment() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <rect x="4" y="8" width="14" height="18" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="0.6" />
      <rect x="18" y="4" width="18" height="22" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="0.6" />
      <g fill="var(--warm-soft)" stroke="var(--warm)" strokeWidth="0.3">
        <rect x="6" y="11" width="3" height="3" />
        <rect x="11" y="11" width="3" height="3" />
        <rect x="6" y="17" width="3" height="3" />
        <rect x="11" y="17" width="3" height="3" />
        <rect x="21" y="7" width="3" height="3" />
        <rect x="26" y="7" width="3" height="3" />
        <rect x="31" y="7" width="3" height="3" />
        <rect x="21" y="13" width="3" height="3" />
        <rect x="26" y="13" width="3" height="3" />
        <rect x="31" y="13" width="3" height="3" />
        <rect x="21" y="19" width="3" height="3" />
        <rect x="31" y="19" width="3" height="3" />
      </g>
      <rect x="26" y="19" width="3" height="7" fill="var(--ink)" opacity="0.8" />
    </svg>
  );
}

function IlloChecklist() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      {[0, 1, 2].map((i) => {
        const y = 6 + i * 7;
        const checked = i !== 1;
        return (
          <g key={i}>
            <rect x="5" y={y - 2} width="4" height="4" rx="0.6" fill={checked ? "var(--ink)" : "transparent"} stroke="currentColor" strokeWidth="0.5" />
            {checked && (
              <path d={`M5.8 ${y} l1.2 1 l2 -2`} stroke="var(--paper-elevated)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
            )}
            <line x1="12" y1={y} x2={26 + i * 3} y2={y} stroke="currentColor" strokeWidth={i === 0 ? "0.9" : "0.5"} opacity={i === 0 ? "0.9" : "0.45"} />
          </g>
        );
      })}
    </svg>
  );
}

function IlloCalendrier() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <rect x="5" y="5" width="30" height="20" rx="1.5" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="0.6" />
      <rect x="5" y="5" width="30" height="5" fill="var(--paper-sunk)" />
      <line x1="10" y1="3" x2="10" y2="8" stroke="currentColor" strokeWidth="0.8" />
      <line x1="30" y1="3" x2="30" y2="8" stroke="currentColor" strokeWidth="0.8" />
      <g fill="currentColor" opacity="0.45">
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2].map((row) => (
            <circle key={`${col}-${row}`} cx={9 + col * 5.5} cy={14 + row * 4} r="0.6" />
          )),
        )}
      </g>
      <rect x="18" y="12" width="4" height="4" rx="0.5" fill="var(--warm-soft)" stroke="var(--warm)" strokeWidth="0.4" />
    </svg>
  );
}

function IlloDocument() {
  return (
    <svg viewBox="0 0 40 28" className="h-7 w-10 text-ink/80">
      <path d="M 8 3 L 26 3 L 30 7 L 30 25 L 8 25 Z" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="0.6" />
      <path d="M 26 3 L 26 7 L 30 7" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.45">
        <line x1="11" y1="10" x2="26" y2="10" />
        <line x1="11" y1="13" x2="24" y2="13" />
        <line x1="11" y1="16" x2="26" y2="16" />
        <line x1="11" y1="19" x2="22" y2="19" />
      </g>
      <circle cx="32" cy="21" r="3.5" fill="var(--warm-soft)" stroke="var(--warm)" strokeWidth="0.5" />
      <circle cx="32" cy="21" r="2.2" fill="none" stroke="var(--warm)" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
    </svg>
  );
}

/* ─── Pictos bénéfices ────────────────────────────────────────── */

function PictoCalendrier() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-ink/85">
      <rect x="4" y="7" width="24" height="21" rx="2" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="7" width="24" height="5" fill="var(--paper-sunk)" />
      <line x1="10" y1="4" x2="10" y2="11" stroke="currentColor" strokeWidth="1.4" />
      <line x1="22" y1="4" x2="22" y2="11" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="17" width="6" height="6" rx="1" fill="var(--warm-soft)" stroke="var(--warm)" strokeWidth="0.8" />
    </svg>
  );
}

function PictoDossier() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-ink/85">
      <path d="M 4 11 L 4 26 Q 4 28 6 28 L 26 28 Q 28 28 28 26 L 28 14 Q 28 12 26 12 L 16 12 L 14 9 L 6 9 Q 4 9 4 11 Z" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="9" y1="19" x2="23" y2="19" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
      <line x1="9" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
    </svg>
  );
}

function PictoPdf() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-ink/85">
      <path d="M 8 4 L 22 4 L 26 8 L 26 28 L 8 28 Z" fill="var(--paper-elevated)" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M 22 4 L 22 8 L 26 8" fill="none" stroke="currentColor" strokeWidth="1" />
      <g fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5">
        <line x1="12" y1="14" x2="22" y2="14" />
        <line x1="12" y1="18" x2="20" y2="18" />
        <line x1="12" y1="22" x2="22" y2="22" />
      </g>
    </svg>
  );
}
