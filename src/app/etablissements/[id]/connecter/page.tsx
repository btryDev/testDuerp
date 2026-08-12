import path from "node:path";
import Link from "next/link";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { BlocConfig } from "@/components/mcp/BlocConfig";
import { WhyCard } from "@/components/ui-kit";
import { requireEtablissement } from "@/lib/auth/scope";

export const metadata = {
  title: "Connecter — Consulter votre dossier depuis un assistant",
};

/** Les trois outils servis par `scripts/mcp-server.ts`, décrits côté produit. */
const OUTILS = [
  {
    nom: "fiche_etablissement",
    titre: "Fiche de l'établissement",
    detail:
      "Raison sociale, adresse, régimes réglementaires, effectifs, et le volume du dossier (équipements, vérifications, actions).",
  },
  {
    nom: "etat_duerp",
    titre: "État du DUERP",
    detail:
      "Ancienneté de la dernière version validée, échéance de mise à jour annuelle, unités de travail et risques cotés.",
  },
  {
    nom: "plan_actions",
    titre: "Plan d'actions",
    detail:
      "Actions correctives avec leur statut, criticité, échéance et retard éventuel — filtrables.",
  },
];

export default async function ConnecterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { etablissement } = await requireEtablissement(id);

  // Chemins absolus : Claude Desktop est une application graphique, elle
  // n'hérite pas du PATH du terminal. « pnpm » ou « npx » y sont souvent
  // introuvables — on désigne donc directement l'exécutable.
  const racine = process.cwd();
  const executable = path.join(racine, "node_modules", ".bin", "tsx");
  const serveur = path.join(racine, "scripts", "mcp-server.ts");

  // Désigner l'exécutable ne suffit pas : le lanceur `tsx` est un script
  // shell qui termine par `exec node`. Sous nvm, node vit dans un répertoire
  // versionné qu'une application graphique n'a pas dans son PATH, et le
  // serveur meurt sur « node: not found » avant d'avoir dit un mot. On
  // publie donc le répertoire du node qui fait tourner cette page, qui est
  // par construction celui qui sait exécuter le projet.
  const dossierNode = path.dirname(process.execPath);
  const cheminGraphique = [
    dossierNode,
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
  ].join(":");

  const configDesktop = JSON.stringify(
    {
      mcpServers: {
        rojer: {
          command: executable,
          args: [serveur],
          env: { MCP_ETABLISSEMENT_ID: id, PATH: cheminGraphique },
        },
      },
    },
    null,
    2,
  );

  const commandeCode = `claude mcp add rojer \\
  -e MCP_ETABLISSEMENT_ID=${id} \\
  -- ${executable} ${serveur}`;

  return (
    <>
      <AppTopbar
        title="Connecter"
        subtitle="Consulter ce dossier depuis un assistant, en lecture seule."
        crumbs={[
          { href: `/etablissements/${id}`, label: etablissement.raisonDisplay },
          { label: "Connecter" },
        ]}
      />

      <main className="mx-auto max-w-4xl px-8 py-8 pb-20">
        {/* HERO */}
        <section className="cartouche relative overflow-hidden">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "var(--warm)" }}
          />
          <div className="px-8 py-8 md:px-10 md:py-10">
            <p className="label-admin">Expérimental · local</p>
            <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.025em]">
              Poser vos questions à un assistant,
              <br />
              <span className="accent-serif" style={{ color: "var(--warm)" }}>
                sur vos propres données
              </span>
            </h1>
            <p className="mt-4 max-w-prose text-[0.95rem] leading-relaxed text-ink/80">
              Vous pouvez ouvrir une fenêtre de lecture sur ce dossier depuis
              un assistant comme Claude, et lui demander « où en est mon
              DUERP ? » ou « quelles actions sont en retard ? » sans naviguer
              dans l&apos;application. L&apos;assistant lit, il n&apos;écrit
              jamais.
            </p>
            <p className="mt-4 max-w-prose text-[0.85rem] leading-relaxed text-muted-foreground">
              Le programme tourne <strong>sur votre machine</strong> et n&apos;est
              accessible qu&apos;à l&apos;application qui le lance : rien n&apos;est
              publié sur internet, il n&apos;y a ni adresse ni port à ouvrir.
            </p>
          </div>
        </section>

        {/* CE QUI SORT — la question à se poser avant de brancher */}
        <section className="mt-10">
          <WhyCard
            kicker="À savoir avant de brancher"
            titre="Ce que l'assistant lit sort de Rojer."
            enjeu="Les informations renvoyées par les outils sont envoyées à l'assistant que vous utilisez, et suivent alors ses propres règles de traitement et de conservation — pas celles de Rojer."
            tonalite="alerte"
          >
            <p>
              C&apos;est votre décision, dossier par dossier : vous choisissez
              quel établissement est exposé, et vous pouvez retirer la
              connexion à tout moment en supprimant la configuration de votre
              assistant. Tant que vous ne branchez rien, rien ne sort.
            </p>
            <p className="mt-3">
              Cette page ne change rien au fonctionnement de Rojer :{" "}
              <strong>
                aucun contenu de votre dossier n&apos;est traité, reformulé ou
                classé par une IA
              </strong>{" "}
              dans l&apos;application. Vos documents restent produits par des
              règles déterministes, à partir de vos saisies. Ce qui est proposé
              ici est un accès en lecture depuis un outil extérieur, pas une
              fonctionnalité d&apos;analyse.
            </p>
          </WhyCard>
        </section>

        {/* CE QUI EST LISIBLE */}
        <section className="mt-10">
          <header className="mb-5">
            <p className="label-admin">Périmètre</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              Ce que l&apos;assistant peut lire
            </h2>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Trois outils, tous en lecture seule, tous limités à{" "}
              <strong>{etablissement.raisonDisplay}</strong>. L&apos;assistant
              ne peut ni modifier une donnée, ni consulter un autre
              établissement — l&apos;identifiant est fixé au lancement, il
              n&apos;est pas négociable depuis la conversation.
            </p>
          </header>

          <ol className="space-y-3">
            {OUTILS.map((outil, idx) => (
              <li
                key={outil.nom}
                className="cartouche flex items-start gap-5 px-6 py-5 sm:px-7"
              >
                <span className="shrink-0 font-mono text-[1.1rem] font-light tabular-nums text-[color:var(--seal)]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[0.98rem] font-semibold">
                      {outil.titre}
                    </h3>
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--seal)]">
                      {outil.nom}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.85rem] text-muted-foreground">
                    {outil.detail}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--accent-vif)]"
                >
                  lecture
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* MISE EN PLACE */}
        <section className="mt-10">
          <header className="mb-5">
            <p className="label-admin">Mise en place</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold tracking-[-0.015em]">
              Brancher l&apos;assistant
            </h2>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Les chemins ci-dessous sont ceux de cette installation, et
              l&apos;identifiant est déjà celui de{" "}
              {etablissement.raisonDisplay} : il n&apos;y a rien à remplacer.
            </p>
          </header>

          <div className="space-y-8">
            <div>
              <h3 className="text-[0.98rem] font-semibold">
                Claude Desktop
              </h3>
              <p className="mt-1 mb-3 text-[0.85rem] leading-relaxed text-muted-foreground">
                Réglages → Développeur → Modifier la configuration. Collez ce
                bloc dans <code className="font-mono">claude_desktop_config.json</code>,
                puis relancez l&apos;application. Si le fichier contient déjà un
                objet <code className="font-mono">mcpServers</code>, ajoutez-y
                seulement l&apos;entrée <code className="font-mono">rojer</code>.
              </p>
              <BlocConfig titre="claude_desktop_config.json" contenu={configDesktop} />
            </div>

            <div>
              <h3 className="text-[0.98rem] font-semibold">Claude Code</h3>
              <p className="mt-1 mb-3 text-[0.85rem] leading-relaxed text-muted-foreground">
                Une commande à lancer dans un terminal.
              </p>
              <BlocConfig
                titre="Terminal"
                langue="shell"
                contenu={commandeCode}
              />
            </div>
          </div>

          <p className="mt-6 text-[0.85rem] leading-relaxed text-muted-foreground">
            Pour vérifier que tout fonctionne, demandez à l&apos;assistant :
            «&nbsp;quel établissement suis-tu&nbsp;?&nbsp;». Il doit répondre{" "}
            {etablissement.raisonDisplay}. Pour couper la connexion, supprimez
            l&apos;entrée de la configuration et relancez l&apos;assistant.
          </p>
        </section>

        <footer className="mt-10 border-t border-dashed border-rule pt-6 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
          Accès en lecture seule · les données lues quittent Rojer.{" "}
          <Link
            href={`/etablissements/${id}/guide`}
            className="text-[color:var(--warm)] hover:underline"
          >
            Consulter le guide →
          </Link>
        </footer>
      </main>
    </>
  );
}
