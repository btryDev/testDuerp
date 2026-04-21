import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Etape = {
  romain: string;
  titre: string;
  corps: string;
  duree: string;
  illustration: React.ReactNode;
};

const ETAPES: Etape[] = [
  {
    romain: "I",
    titre: "Établissement",
    corps:
      "SIRET, code NAF, adresse, effectif, typologie (ERP, code du travail, habitation). Catégorie et type si ERP.",
    duree: "≈ 3 min",
    illustration: <IlloBatiment />,
  },
  {
    romain: "II",
    titre: "Équipements",
    corps:
      "Déclaration guidée : installations électriques, extincteurs, BAES, hotte, ascenseur, portes automatiques.",
    duree: "≈ 5 min",
    illustration: <IlloChecklist />,
  },
  {
    romain: "III",
    titre: "Calendrier",
    corps:
      "Échéances des vérifications périodiques calculées automatiquement depuis les équipements déclarés.",
    duree: "instantané",
    illustration: <IlloCalendrier />,
  },
  {
    romain: "IV",
    titre: "Dossier",
    corps:
      "Registre numérique, plan d'actions priorisé et DUERP consolidés en un dossier présentable à tout contrôle.",
    duree: "1 clic",
    illustration: <IlloDocument />,
  },
];

const CHIFFRES = [
  { valeur: "65", legende: "obligations référencées à partir de sources primaires (Légifrance, INRS)" },
  { valeur: "40 ans", legende: "durée légale de conservation des versions du DUERP (loi du 2 août 2021)" },
  { valeur: "3", legende: "secteurs couverts au lancement — restauration, commerce, tertiaire" },
  { valeur: "0", legende: "modèle de langage dans la chaîne de décision : contenu intégralement déterministe" },
];

const CE_QUE_OUI = [
  "Identifier les obligations applicables à votre établissement à partir de ses équipements et de sa typologie.",
  "Calculer les échéances des vérifications périodiques et centraliser les rapports horodatés.",
  "Générer un DUERP versionné, un plan d'actions priorisé et un dossier de conformité consolidé.",
  "Citer systématiquement la référence légale ou normative à l'origine de chaque obligation.",
];

const CE_QUE_NON = [
  "Remplacer un contrôle réglementaire ou certifier une mise en conformité.",
  "Émettre un avis juridique ou se substituer à un conseil spécialisé.",
  "Reformuler, classer ou interpréter vos réponses via un modèle de langage.",
  "Exporter vos données hors de l'Union européenne.",
];

export default function Home() {
  return (
    <main className="relative mx-auto w-full max-w-[1200px] px-6 pb-20 sm:px-12">
      {/* ─── Bandeau-manchette ─────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklch,var(--warm)_6%,transparent)_0%,transparent_60%)]"
      />

      <div className="flex flex-col gap-2 border-b border-rule/70 py-4 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Dossier <span className="text-ink">N° 00A</span> ·
          Plateforme de conformité santé-sécurité
        </span>
        <span className="flex items-center gap-4">
          <span>Édition avril 2026</span>
          <span className="hidden h-[10px] w-px bg-rule sm:inline-block" />
          <span>République française</span>
        </span>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 items-end gap-x-14 gap-y-12 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
        <div className="relative">
          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--warm)]">
              § I
            </span>
            <span className="h-px flex-1 bg-rule" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Destiné aux TPE et PME
            </span>
          </div>

          <h1 className="display-xl text-[clamp(2.5rem,5.2vw,4.1rem)]">
            La conformité
            <br />
            santé-sécurité,
            <br />
            <span className="relative inline-block text-[color:var(--warm)]">
              tenue&nbsp;à&nbsp;jour.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-0 h-[6px] bg-[color:var(--warm-soft)]"
              />
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-[1rem] leading-[1.7] text-ink/80">
            Plateforme opérationnelle de pilotage destinée aux dirigeants qui
            n&apos;ont ni service HSE interne, ni prestataire dédié. Les
            obligations applicables sont identifiées à partir de l&apos;activité
            et des équipements déclarés. Les vérifications périodiques, le
            registre de sécurité et le DUERP sont tenus dans un cadre unique,
            conformes au Code du travail et à la réglementation ERP.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>
              Ouvrir un dossier · 5 min
            </Link>
            <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--warm)]" />
              Sans carte bancaire · sans engagement
            </span>
          </div>

          <div className="mt-14 flex items-center gap-5">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
              Couverture
            </span>
            <span className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.78rem] text-ink/75">
              <span>Code du travail</span>
              <span className="h-1 w-1 rounded-full bg-rule" />
              <span>Code de la construction</span>
              <span className="h-1 w-1 rounded-full bg-rule" />
              <span>Règlement ERP</span>
              <span className="h-1 w-1 rounded-full bg-rule" />
              <span>Taxonomie INRS ED 840</span>
            </span>
          </div>
        </div>

        {/* Cartouche crédibilité */}
        <aside className="cartouche relative overflow-hidden px-7 py-7 sm:px-9 sm:py-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-dashed border-[color:var(--warm)]/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-dashed border-[color:var(--warm)]/20"
          />

          <div className="flex items-center justify-between">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              Référentiel
            </p>
            <span className="pastille pastille-warm">Sources primaires</span>
          </div>

          <ul className="mt-6 space-y-4 text-[0.88rem] leading-relaxed">
            <SourceLigne
              titre="Code du travail"
              detail="Art. L.4121-1 à L.4121-5, R.4121-1 à R.4121-4, R.4323-22 et suivants. Accès Légifrance consultable depuis chaque obligation."
            />
            <SourceLigne
              titre="Code de la construction & de l'habitation"
              detail="Art. R.123-51 (ERP), R.122-29 (IGH). Règlements des arrêtés du 25 juin 1980 et du 30 décembre 2011."
            />
            <SourceLigne
              titre="INRS"
              detail="Taxonomie ED 840 (20 familles de risques), ED 880 restauration, AC 93 commerce, ED 950 tertiaire."
            />
          </ul>

          <div className="mt-6 border-t border-dashed border-rule pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                Garantie méthodologique
              </span>
              <span className="font-mono text-[0.58rem] tracking-[0.16em] text-ink/60">
                V.2 — 2026
              </span>
            </div>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-ink/75">
              Aucun traitement par modèle de langage dans la chaîne de
              décision. Matching équipements / obligations, périodicités et
              priorisation strictement déterministes.
            </p>
          </div>
        </aside>
      </section>

      {/* ─── Chiffres-clés ─────────────────────────────────────── */}
      <section className="mt-24">
        <div className="filet-pointille" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-10 lg:grid-cols-4">
          {CHIFFRES.map((c, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-3 top-0 font-mono text-[0.58rem] text-ink/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-[var(--font-body)] text-[3rem] font-semibold leading-none tracking-[-0.04em] text-ink">
                {c.valeur}
              </p>
              <p className="mt-4 max-w-[22ch] text-[0.82rem] leading-relaxed text-muted-foreground">
                {c.legende}
              </p>
            </div>
          ))}
        </div>
        <div className="filet-pointille" />
      </section>

      {/* ─── Comment ça marche ─────────────────────────────────── */}
      <section className="mt-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-admin mb-4">§ II · Parcours de mise en place</p>
            <h2 className="display-lg text-[clamp(1.8rem,3.2vw,2.4rem)] max-w-[26ch]">
              Quatre étapes pour constituer votre dossier initial.
            </h2>
          </div>
          <p className="max-w-sm text-[0.86rem] leading-relaxed text-muted-foreground">
            Temps total estimé&nbsp;:
            <span className="text-ink"> 8 à 12 minutes</span>.
            Toute saisie est modifiable ultérieurement. Un dossier peut être
            ouvert sans engagement et fermé à tout moment.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e, i) => (
            <li
              key={e.romain}
              className={[
                "relative flex flex-col gap-5 bg-paper-elevated px-6 py-7 ring-1 ring-rule-soft",
                i === 0 ? "rounded-l-[calc(var(--radius)*1.4)]" : "",
                i === ETAPES.length - 1
                  ? "rounded-r-[calc(var(--radius)*1.4)]"
                  : "",
                i !== 0 ? "-ml-px" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[1.15rem] font-medium leading-none tracking-[0.04em] text-[color:var(--warm)]">
                  {e.romain}.
                </span>
                <span className="flex h-10 w-14 items-center justify-center rounded-md bg-paper-sunk/70 ring-1 ring-rule-soft">
                  {e.illustration}
                </span>
              </div>

              <div>
                <p className="text-[1.05rem] font-semibold tracking-[-0.012em]">
                  {e.titre}
                </p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
                  {e.corps}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-dashed border-rule/60 pt-3">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Étape {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[0.6rem] tracking-[0.14em] text-ink/70">
                  {e.duree}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Extrait réglementaire — pull quote ────────────────── */}
      <section className="mt-24">
        <figure className="relative mx-auto max-w-[58ch] text-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-rule"
          />
          <p className="pt-14 font-mono text-[0.58rem] uppercase tracking-[0.26em] text-muted-foreground">
            Extrait — fondement légal
          </p>
          <blockquote className="mt-5 text-[clamp(1.35rem,2.2vw,1.7rem)] font-semibold leading-[1.25] tracking-[-0.018em] text-ink">
            «&nbsp;L&apos;employeur transcrit et met à jour dans un document
            unique les résultats de l&apos;évaluation des risques pour la
            santé et la sécurité des travailleurs.&nbsp;»
          </blockquote>
          <figcaption className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[color:var(--warm)]">
            Code du travail · Art. R.4121-1
          </figcaption>
          <div
            aria-hidden
            className="mx-auto mt-7 h-px w-24 bg-[repeating-linear-gradient(to_right,var(--rule)_0_4px,transparent_4px_8px)]"
          />
        </figure>
      </section>

      {/* ─── Ce que l'outil fait / ne fait pas ─────────────────── */}
      <section className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <p className="label-admin mb-4">§ III · Fonctions de la plateforme</p>
          <h3 className="display-lg text-[1.5rem] leading-tight">
            Ce que la plateforme prend en charge.
          </h3>
          <ul className="mt-7 space-y-5">
            {CE_QUE_OUI.map((t, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-[3px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[0.58rem] font-medium text-paper-elevated">
                  ✓
                </span>
                <span className="text-[0.92rem] leading-[1.65] text-ink/85">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:border-l lg:border-dashed lg:border-rule lg:pl-12">
          <p className="label-admin mb-4 text-[color:var(--minium)]/80">
            § IV · Mentions d&apos;exclusion
          </p>
          <h3 className="display-lg text-[1.5rem] leading-tight">
            Ce qu&apos;elle ne prétend pas faire.
          </h3>
          <ul className="mt-7 space-y-5">
            {CE_QUE_NON.map((t, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-[3px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-[color:var(--minium)]/60 text-[0.62rem] font-medium text-[color:var(--minium)]">
                  —
                </span>
                <span className="text-[0.92rem] leading-[1.65] text-ink/75">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Périmètre — pour qui / pas pour qui ───────────────── */}
      <section className="mt-24">
        <div className="mb-10 flex items-center gap-4">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--warm)]">
            § V
          </span>
          <span className="h-px flex-1 bg-rule" />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            Périmètre d&apos;application
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-[1.2rem] font-semibold tracking-[-0.012em]">
              Conçu pour
            </h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              TPE et PME dont l&apos;activité relève de risques courants bien
              documentés par les sources officielles.
            </p>
            <ul className="mt-6 space-y-3 text-[0.88rem] leading-relaxed text-ink/80">
              <PerimetreLigne
                code="NAF 56.xx"
                label="Restauration, bar, brasserie"
              />
              <PerimetreLigne
                code="NAF 47.xx"
                label="Commerce de détail"
              />
              <PerimetreLigne
                code="Tertiaire"
                label="Bureau, conseil, services aux entreprises"
              />
              <PerimetreLigne
                code="1 – 50"
                label="Effectif salarié, mono ou multi-établissements"
              />
            </ul>
          </div>

          <div className="relative sm:border-l sm:border-dashed sm:border-rule sm:pl-10">
            <h3 className="text-[1.2rem] font-semibold tracking-[-0.012em]">
              Hors périmètre
            </h3>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              Activités qui requièrent un accompagnement spécialisé et dont
              les textes applicables dépassent la V2.
            </p>
            <ul className="mt-6 space-y-3 text-[0.88rem] leading-relaxed text-ink/70">
              <PerimetreLigne
                hors
                code="ICPE"
                label="Installations classées à autorisation"
              />
              <PerimetreLigne hors code="BTP" label="Chantiers, industrie lourde" />
              <PerimetreLigne
                hors
                code="ATEX"
                label="Rayonnements ionisants, chimie complexe"
              />
              <PerimetreLigne
                hors
                code="ERP 1ʳᵉ cat."
                label="Établissements sportifs, piscines, santé"
              />
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CTA final ─────────────────────────────────────────── */}
      <section className="mt-24 cartouche relative overflow-hidden px-7 py-9 sm:px-12 sm:py-12">
        <div
          aria-hidden
          className="dotted-bar pointer-events-none absolute inset-y-0 right-0 w-24 opacity-[0.05]"
          style={{ ["--cell" as string]: "10px" }}
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="label-admin mb-3">Passer à l&apos;opérationnel</p>
            <p className="display-lg text-[1.6rem] leading-tight">
              Constituez votre dossier en moins de dix minutes.
            </p>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-foreground">
              Aucune pièce justificative demandée à l&apos;ouverture.
              Les données déjà saisies restent modifiables à tout moment,
              sans création d&apos;une nouvelle version tant que le dossier
              n&apos;a pas été validé.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>
              Ouvrir un dossier →
            </Link>
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
              Ou consulter&nbsp;
              <Link
                href="/entreprises"
                className="text-ink underline decoration-dotted underline-offset-4"
              >
                mes entreprises
              </Link>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Footer / mentions ─────────────────────────────────── */}
      <div className="filet-pointille mt-24" />
      <footer className="mt-8 grid grid-cols-1 gap-8 pb-4 sm:grid-cols-4">
        <MentionBloc
          titre="Hébergement"
          corps="Données hébergées en Union européenne (infrastructure Supabase — Francfort, Allemagne). Aucun transfert hors UE, aucun sous-traitant extra-européen."
        />
        <MentionBloc
          titre="Conservation"
          corps="Les versions validées du DUERP sont conservées 40 ans, conformément à la loi du 2 août 2021 et à l'article R.4121-4 du Code du travail."
        />
        <MentionBloc
          titre="Export & suppression"
          corps="Export complet des données au format PDF + archive ZIP à la demande. Suppression du compte et purge effective sous 30 jours."
        />
        <MentionBloc
          titre="Portée"
          corps="Outil d'assistance à la rédaction et au suivi. Ne remplace pas un contrôle réglementaire, ne constitue pas un avis juridique."
        />
      </footer>

      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-rule/70 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:items-center">
        <span>© 2026 — Édition avril · Fin du dossier</span>
        <span className="flex items-center gap-4">
          <span>RGPD</span>
          <span>·</span>
          <span>Mentions légales</span>
          <span>·</span>
          <span>CGU</span>
        </span>
      </div>
    </main>
  );
}

/* ─── Sous-composants éditoriaux ─────────────────────────────── */

function SourceLigne({ titre, detail }: { titre: string; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-[7px] inline-block h-[5px] w-[5px] flex-shrink-0 rotate-45 bg-[color:var(--warm)]"
      />
      <span>
        <strong className="font-semibold text-ink">{titre}</strong>
        <span className="mt-0.5 block text-[0.82rem] leading-relaxed text-ink/65">
          {detail}
        </span>
      </span>
    </li>
  );
}

function PerimetreLigne({
  code,
  label,
  hors = false,
}: {
  code: string;
  label: string;
  hors?: boolean;
}) {
  return (
    <li className="flex items-baseline gap-4">
      <span
        className={
          "flex-shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.14em] " +
          (hors ? "text-[color:var(--minium)]/70" : "text-[color:var(--warm)]")
        }
      >
        {code}
      </span>
      <span className="h-px flex-shrink-0 basis-6 bg-rule" />
      <span>{label}</span>
    </li>
  );
}

function MentionBloc({ titre, corps }: { titre: string; corps: string }) {
  return (
    <div>
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ink">
        {titre}
      </p>
      <p className="mt-2 text-[0.76rem] leading-[1.6] text-muted-foreground">
        {corps}
      </p>
    </div>
  );
}

/* ─── Illustrations (étapes) ─────────────────────────────────── */

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
