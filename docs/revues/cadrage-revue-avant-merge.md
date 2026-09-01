# Cadrage — revue d'assemblage avant merge de `integration/2026-08-31`

**Statut : suspendue avant résultats, le 2026-08-31 au soir** (limite de session — les
cinq sous-agents d'axe ont été coupés avant de rendre). Ce document est le découpage,
pour que la prochaine revue reparte d'ici au lieu de refaire le cadrage. Les quelques
relevés acquis avant la coupure sont en § 4, avec leur degré de vérification.

**Objet relu** : `origin/integration/2026-08-31` (base de cette branche : `540f8b7`)
face à `origin/main`. **67 commits — 63 hors merges + 4 merges** — 134 fichiers,
~14 700 insertions. Sept lots, quatre ADR (024 à 027), quatre migrations Prisma.

## 1. Pourquoi ce découpage

Les sept lots ont déjà été relus un à un (huit relectures, deux contrôles visuels).
L'angle mort est **l'assemblage** : les défauts que git ne signale pas — deux fichiers
qui parlent du même fait et dont un seul entre en conflit — et ce que la journée a
laissé debout après que ce qu'elle décrivait a bougé.

## 2. Les six axes

**Axe 0 — socle et migrations** (absent du brief d'origine, ajouté ici).
(a) Ré-établir soi-même la référence verte dans son propre worktree — `pnpm install`,
`tsc`, suite complète — plutôt que de reprendre l'annonce d'une autre session : un
rouge d'épreuve de garde ne prouve rien sans son propre vert de référence.
(b) Lire les migrations sur pièce : additivité (aucune DDL destructive), ordre des
timestamps, cohérence `schema.prisma` ↔ SQL (ancres `AFTER` des enums), et dossier de
la branche comparé à celui de `main` (`git ls-tree`) pour vérifier qu'aucune migration
appliquée en prod ne manque. Lecture statique uniquement — **aucune commande Prisma
contre une base**.

**Axe 1 — l'assemblage.** Chercher les endroits où deux lots parlent du même fait et
où un seul a été mis à jour : compteurs, assertions de tests réécrites par deux lots,
documents transverses (`.claude/CLAUDE.md`, ADR, rapports). Entrée utile : la liste
des fichiers touchés par le plus de commits du diff (`git log --name-only` agrégé) —
ici `src/lib/prestataires/domaines.ts` (12), `conformite.test.ts` (10),
`sante-travail.ts` (9), `.claude/CLAUDE.md` (9). Précédents établis le 2026-08-31 :
une assertion réécrite par deux lots (« 4 » pour l'un, « 2 » pour l'autre, la réponse
était 5) ; une répartition de porteurs périmée vingt lignes après la version juste.

**Axe 2 — les affirmations périmées.** L'écart affirmation/réalité **au sein** d'un
fichier ou entre un document et le code qu'il décrit : commentaires décrivant un
mécanisme qui ne tourne pas, notes annonçant un travail déjà fait, descriptions
contredisant la valeur encodée à côté. Contrôle mécanique éprouvé : confronter ce
qu'un rapport (`docs/revues/*.md`) affirme à ce que les `notesInternes` du même sujet
reconnaissent — là où la note est plus prudente, le rapport a lissé.

**Frontière 1/2** : l'axe 1 cherche les incohérences **entre** fichiers et lots ;
l'axe 2 l'écart affirmation/code **dans** un fichier. Le recouvrement résiduel se
dédoublonne à la synthèse, pas en amont.

**Axe 3 — le référentiel, re-scopé.** Faire relire les 116 obligations d'un coup est
le format qui produit les faux « vérifié » : devant 116 textes, un relecteur finit par
conclure de résumés. Périmètre retenu : (a) vérification Légifrance **verbatim** de
chaque obligation dont la périodicité ou la nature est créée ou modifiée par le diff —
page ouverte, état de vigueur constaté, renvois « L. X à L. Z » lus en entier ;
(b) sur les 116, le contrôle mécanique rapport/`notesInternes` pour les natures (champ
posé ce jour, donc couvert par aucune relecture antérieure). Tout ce qui n'est pas
ouvert se rend « non vérifié », énuméré obligation par obligation.

**Axe 4 — ce que le produit affirme à l'écran, par lecture de source.** Phrases
assemblées (accords, pluriels, interpolations — donner les valeurs qui cassent),
chiffres écrits à la main dans le JSX/SVG devenus faux après 85→116 / 10→17 / 1→13,
libellés affirmant un état non garanti, règles métier vivant dans du JSX/SVG où aucun
test ne peut les appeler. Pas de rendu : le contrôle visuel est un exercice séparé.

**Axe 5 — les gardes elles-mêmes.** Dans un worktree **dédié** (les injections sont
des éditions) : établir son vert de référence, réinjecter le défaut que la garde
prétend interdire, lire **quel** test tombe, puis **varier le cas** — une garde qui
n'attrape que son propre exemple écrit en dur ne prouve rien sur ce qu'elle n'a pas
vu. Reverter entre chaque épreuve, ne jamais commiter une injection. Motifs à
chercher (trois précédents réels) : la garde qui produit le défaut qu'elle prévient ;
la garde calibrée sur un rendu que personne ne regarde ; la garde qui attrape son
exemple et laisse passer le cas général.

**Règles transverses** : ouvrir le fichier ou la page avant de qualifier ; ce qui n'a
pas été ouvert se dit « non vérifié » ; pas de signalement sans scénario concret ;
l'orchestrateur contre-vérifie sur pièce chaque signalement de sous-agent avant de le
rendre ; pnpm jamais npm ; jamais de push sur `main`.

## 3. Deux écarts factuels sur l'assemblage lui-même

Relevés en recomptant plutôt qu'en croyant le brief — et confirmés par le délégant :

1. **Le compte de commits était périmé** : le brief disait 58, la branche en portait
   67 (le merge des corrections états-permanents, une résolution de conflit, et des
   rapports de contrôle visuel poussés en direct étaient arrivés entre-temps).
2. **Quatre merges pour sept lots** : `feat/socle-employeur` et
   `feat/etats-permanents` sont entrés en **fast-forward** (aucun commit de merge),
   `feat/nature-obligation` par merge depuis un worktree local poussé après coup.
   L'historique ne montre donc pas la frontière de tous les lots ; la cartographie
   fichier→lot doit se reconstituer, elle ne se lit pas dans les merges.

## 4. Relevés acquis avant la suspension

**Vérifié sur pièce (par l'orchestrateur)** :

- **Axe 0 (b) — migrations : rien à signaler.** Les quatre migrations `20260831*`
  sont strictement additives (trois `ALTER TYPE ADD VALUE IF NOT EXISTS`, une
  `CREATE TABLE "DeclarationEtatPermanent"` + index unique + FK `Cascade`) ; ancres
  `AFTER` cohérentes avec l'ordre des enums de `schema.prisma` ; le dossier de la
  branche contient tout ce que `main` porte (aucun trou hérité des migrations « en
  vol » du 26/08, entrées dans `main` depuis). Le champ `nature` requis vit dans le
  référentiel TypeScript (ADR-003) : aucun backfill en base n'est nécessaire.
- **Axe 0 (a) — socle, partiel** : `tsc --noEmit` propre dans le worktree de revue.
  La suite complète a été lancée mais **son résultat n'a pas été relevé** avant la
  suspension : à refaire.
- **Un défaut confirmé (axe 4/5)** : `src/lib/etats-permanents/phrases.ts:64` rend
  `"${renseignes} sur ${faitsDates} portent une date."` — pour `renseignes = 1`,
  l'écran affiche « 1 sur 3 portent une date » (accord faux), alors que tout le reste
  de la fonction distingue soigneusement singulier et pluriel. Et
  `phrases.test.ts:105` **fige ce défaut par assertion**
  (`expect(phraseFaitsDates(3, 1)!).toContain("1 sur 3 portent une date.")`) : la
  garde asserte le défaut qu'elle devrait interdire — le motif exact de l'axe 5.

**À contre-vérifier à la reprise (relevé, non conclu)** :

- Le commentaire de l'enum `Realisateur` (`schema.prisma`) cite `R. 4323-56` pour la
  délivrance de l'attestation d'absence de contre-indication à la conduite réservée
  au médecin du travail ; la migration jumelle (`20260831120000`) cite `R. 4624-28`
  et le SIR. Ouvrir `R. 4323-56` sur Légifrance et vérifier qui il désigne.

**Non vérifié** (les sous-agents ont été coupés avant de rendre) : tout le reste des
axes 1 à 5. Observations partielles arrivées avant la coupure, **à traiter comme des
pistes, pas des constats** : aucune périodicité existante ne serait retirée par le
diff (les 31 obligations nouvelles créent les leurs, `nature` est créée sur les 116).

## 5. Trouvailles des relectures parallèles, à intégrer à l'axe 5 à la reprise

Rapportées par la session délégante (ses deux relectures tenancy et générateur,
**hors du périmètre de cette revue-ci**) — non vérifiées ici :

- **Neuvième cas de la série des lectures sans prédicat de tenancy** :
  `src/lib/etats-permanents/queries.ts:98`. Non exploitable (l'appelant vérifie),
  mais le patron que le dépôt interdit explicitement a été manqué par un lot alors
  que la règle est écrite. Question que la revue devra trancher : une convention
  écrite ne suffit pas — **une garde mécanique de cette forme est-elle possible**
  (balayage lint/AST des lectures Prisma sans prédicat d'établissement) ?
- **Une garde d'action ignore la surcharge de prescription** : par requête forgée sur
  son propre compte, on écrit une déclaration invisible sur une obligation passée au
  calendrier.
- **Un champ de texte libre sans borne de longueur.**

## 6. État des lieux matériel pour la reprise

- Worktree de revue : `testDuerp-revue-merge` (détaché sur `540f8b7`, `node_modules`
  propre, `pnpm install` fait) — porte cette branche.
- Worktree d'épreuve des gardes : `testDuerp-revue-gardes` (créé par l'axe 5, installé,
  aucune injection commitée) — supprimable ou réutilisable à la reprise.
- Les cinq sous-agents d'axe sont morts sans rendre ; aucun de leurs résultats
  intermédiaires n'est fiable au-delà de ce que le § 4 a contre-vérifié.
