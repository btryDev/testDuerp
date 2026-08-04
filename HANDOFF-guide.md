# Handoff Claude Code — Dashboard personnalisable & catalogue de widgets

**Feature :** ajouter la personnalisation du tableau de bord établissement avec un **catalogue de 12 widgets optionnels** (en plus des 4 widgets de base déjà en place), un **mode édition** avec drag-and-drop / resize / remove, et la **persistance de la disposition** par utilisateur × établissement.

**Fichiers principaux à modifier :**
- `src/app/etablissements/[id]/tableau-de-bord/page.tsx` (principal)
- `src/app/etablissements/[id]/tableau-de-bord/personnaliser/page.tsx` (nouveau, catalogue)
- `src/components/dashboard/widgets/` (nouveau dossier, 12 composants)
- `prisma/schema.prisma` (table `DashboardLayout`)
- `globals.css` ou `styles/dashboard.css` (tokens déjà présents, styles widgets à reporter)

**Mockup de référence :** 2 artboards dans `App.html` du projet design :
- **"Catalogue · /tableau-de-bord/personnaliser"** (1440×3800) — présente les 12 widgets par groupe fonctionnel
- **"Mode édition · dashboard en personnalisation"** (1440×1100) — dashboard avec poignées, chrome d'édition, bouton + Ajouter

**Sources JSX/CSS :**
- `components/DashboardWidgets.jsx` — les 12 widgets autonomes + shell Catalogue + shell Mode édition
- `styles/widgets.css` — tous les styles widget + chrome d'édition + placeholders

---

## Intention produit

L'utilisateur a aujourd'hui un dashboard figé. On veut :

1. **Le laisser choisir** quels widgets il voit (pas tout le monde a besoin du budget, de la météo du mois, etc.)
2. **Le laisser organiser** leur emplacement et leur taille (1×1, 2×1, 2×2)
3. **Offrir de la richesse visuelle** avec 12 widgets conçus pour différents profils :
   - Dirigeant pressé → Focus action · Countdown · Score évolution
   - Gestionnaire multi-sites → Comparaison établissements
   - Comptable / trésorerie → Budget conformité
   - Manager équipe → Qui fait quoi · Flux registre
4. **Rendre l'outil sticky** avec des widgets à forte valeur émotionnelle (« Temps économisé », « Focus action »)

---

## Les 12 widgets

Chaque widget a **une intention claire**, **une classe CSS racine** (`.widget` + `data-widget="..."`), et est **autonome** (aucune dépendance à un store global). Chacun reçoit ses données en props et est stateless.

### Groupe 1 · Pilotage & performance

| # | Clé | Titre | Taille par défaut | Données consommées |
|---|---|---|---|---|
| 1 | `score-evolution` | Score · évolution 12 mois | 2×1 | `score[12]` mensuel, sparkline + delta |
| 2 | `budget` | Budget conformité annuel | 2×1 | `depenses{ verifications, formation, materiel, audits }`, `budget` |
| 3 | `temps-econ` | Temps économisé (ce trimestre) | 2×1 | `heuresEvitees` + répartition |

### Groupe 2 · Temps & urgences

| # | Clé | Titre | Taille | Données |
|---|---|---|---|---|
| 4 | `countdown` | Prochaine échéance critique | 2×1 | `echeance.criticalNext` · jours retard/avance |
| 5 | `semaine` | Semaine en cours (mini-agenda) | 2×1 | `taches[7]` groupées par jour |
| 6 | `anciennete` | Âge des documents | 1×1 | `docs[{ type, lastUpdate, maxAge }]` |
| 12 | `meteo` | Météo du mois (heatmap 30 j) | 1×1 | `jours[30]` (statut 0–3) |

### Groupe 3 · Équipe & responsabilité

| # | Clé | Titre | Taille | Données |
|---|---|---|---|---|
| 7 | `qui-fait-quoi` | Qui fait quoi · cette semaine | 2×1 | `users[{ taches }]` filtrés sur S en cours |
| 8 | `flux-registre` | Activité registre (feed) | 1×1 | `activite[]` (dépôts, signatures) ordonné desc |

### Groupe 4 · Multi-site & décision

| # | Clé | Titre | Taille | Données |
|---|---|---|---|---|
| 9 | `multi-site` | Comparaison établissements | 2×1 | `etablissements[{ score, echeances30j }]` — n'apparaît au catalogue que si `user.etablissementsCount > 1` |
| 10 | `focus-action` | Focus de la semaine | 2×1 | `reco.topPriority` avec `pourquoi[]` (règle métier) |
| 11 | `prestataires` | Prestataires favoris | 2×1 | `prestataires[{ fav, lastIntervention, delayResponse }]` |

---

## Architecture technique

### 1. Table Prisma — `DashboardLayout`

```prisma
model DashboardLayout {
  id              String   @id @default(cuid())
  userId          String
  etablissementId String
  widgets         Json     // Array<{ key: string, x: int, y: int, w: int, h: int, settings?: Json }>
  updatedAt       DateTime @updatedAt
  createdAt       DateTime @default(now())

  user          User          @relation(fields: [userId], references: [id])
  etablissement Etablissement @relation(fields: [etablissementId], references: [id])

  @@unique([userId, etablissementId])
  @@index([etablissementId])
}
```

Le `widgets` JSON est un array d'objets :
```ts
type WidgetInstance = {
  key: WidgetKey;       // ex: 'score-evolution' | 'countdown' | ...
  x: number;            // colonne (0–3 sur grille 4 col)
  y: number;            // rangée
  w: 1 | 2;             // largeur en colonnes
  h: 1 | 2;             // hauteur en rangées
  settings?: Record<string, unknown>; // overrides par widget (ex. période, seuils)
};
```

### 2. Layout par défaut

Livré au seed / premier rendu :
```ts
export const DEFAULT_LAYOUT: WidgetInstance[] = [
  { key: 'conformite-score', x: 0, y: 0, w: 2, h: 2 },     // existant
  { key: 'recos-priorite',    x: 2, y: 0, w: 2, h: 1 },    // existant
  { key: 'kpis-ligne',        x: 2, y: 1, w: 2, h: 1 },    // existant — compte pour 4 KPIs
  { key: 'countdown',         x: 0, y: 2, w: 2, h: 1 },    // nouveau
  { key: 'semaine',           x: 2, y: 2, w: 2, h: 1 },    // nouveau
  { key: 'barres-12mois',     x: 0, y: 3, w: 2, h: 1 },    // existant
  { key: 'prochaines-echeances', x: 2, y: 3, w: 2, h: 1 }, // existant
];
```

Tous les autres widgets sont **optionnels** et ajoutés depuis le catalogue.

### 3. Composants Next

```
src/components/dashboard/
├── DashboardGrid.tsx              # Grille CSS Grid 4 cols, auto-rows
├── WidgetHost.tsx                 # Enveloppe un widget, applique w/h, gère mode édition
├── EditModeBanner.tsx             # Bandeau vert collant en haut
├── AddWidgetButton.tsx            # Carte "+ Ajouter un widget" en fin de grille
└── widgets/
    ├── WidgetScoreEvolution.tsx
    ├── WidgetCountdown.tsx
    ├── WidgetSemaine.tsx
    ├── WidgetBudget.tsx
    ├── WidgetTempsEcon.tsx
    ├── WidgetAncienneteDocs.tsx
    ├── WidgetQuiFaitQuoi.tsx
    ├── WidgetFluxRegistre.tsx
    ├── WidgetMultiSite.tsx
    ├── WidgetFocusAction.tsx
    ├── WidgetPrestataires.tsx
    ├── WidgetMeteo.tsx
    └── registry.ts                # Map clé → { component, defaultSize, category, minData? }

src/app/etablissements/[id]/tableau-de-bord/
├── page.tsx                        # Dashboard principal avec GET layout → render grid
└── personnaliser/
    └── page.tsx                    # Catalogue · liste tous les widgets non présents
```

### 4. Registry

```ts
// registry.ts
import type { FC } from 'react';

export type WidgetKey =
  | 'score-evolution' | 'budget' | 'temps-econ'
  | 'countdown' | 'semaine' | 'anciennete' | 'meteo'
  | 'qui-fait-quoi' | 'flux-registre'
  | 'multi-site' | 'focus-action' | 'prestataires';

export type WidgetCategory = 'pilotage' | 'temps' | 'equipe' | 'multi-site';

export type WidgetDescriptor = {
  key: WidgetKey;
  name: string;
  description: string;
  category: WidgetCategory;
  component: FC<{ etablissementId: string; settings?: Record<string, unknown> }>;
  defaultSize: { w: 1 | 2; h: 1 | 2 };
  available?: (ctx: { user: User; etablissementsCount: number }) => boolean;
};

export const WIDGETS: Record<WidgetKey, WidgetDescriptor> = {
  'score-evolution': {
    key: 'score-evolution',
    name: 'Score · évolution 12 mois',
    description: 'Sparkline + delta vs mois précédent.',
    category: 'pilotage',
    component: WidgetScoreEvolution,
    defaultSize: { w: 2, h: 1 },
  },
  // ... etc pour les 11 autres
  'multi-site': {
    key: 'multi-site',
    name: 'Comparaison établissements',
    description: 'Score par site · classement visuel.',
    category: 'multi-site',
    component: WidgetMultiSite,
    defaultSize: { w: 2, h: 1 },
    available: ({ etablissementsCount }) => etablissementsCount > 1, // filtre catalogue
  },
};
```

### 5. Queries Prisma / tRPC attendues par chaque widget

```ts
// Exemple pour WidgetScoreEvolution
async function getScore12Months(etablissementId: string) {
  return prisma.scoreMensuel.findMany({
    where: { etablissementId, date: { gte: subMonths(new Date(), 12) }},
    orderBy: { date: 'asc' },
    select: { score: true, date: true },
  });
}

// WidgetBudget
async function getBudgetBreakdown(etablissementId: string, year: number) {
  return prisma.depense.groupBy({
    by: ['categorie'],
    where: { etablissementId, date: { gte: startOfYear(new Date(year, 0)), lt: endOfYear(new Date(year, 0)) }},
    _sum: { montant: true },
  });
}

// WidgetCountdown
async function getNextCriticalEcheance(etablissementId: string) {
  return prisma.echeance.findFirst({
    where: { etablissementId, priorite: 'P1' },
    orderBy: [{ status: 'desc' /* en_retard first */ }, { date: 'asc' }],
    include: { equipement: true, sourceLegale: true },
  });
}

// WidgetFocusAction — logique côté serveur
async function getFocusOfTheWeek(etablissementId: string) {
  // Règle :
  // 1. Si échéance en retard → c'est elle
  // 2. Sinon, P1 la plus proche
  // 3. Construire un `pourquoi[]` avec 3 raisons max (retard, criticité, prestataire dispo)
  // 4. Si prestataire favori a une dispo dans les 7 j → le suggérer
}
```

### 6. Mutation pour sauvegarder le layout

```ts
export const dashboardRouter = createTRPCRouter({
  getLayout: protectedProcedure
    .input(z.object({ etablissementId: z.string() }))
    .query(async ({ ctx, input }) => {
      const existing = await ctx.prisma.dashboardLayout.findUnique({
        where: { userId_etablissementId: { userId: ctx.user.id, etablissementId: input.etablissementId }},
      });
      return existing?.widgets ?? DEFAULT_LAYOUT;
    }),

  saveLayout: protectedProcedure
    .input(z.object({
      etablissementId: z.string(),
      widgets: z.array(widgetInstanceSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dashboardLayout.upsert({
        where: { userId_etablissementId: { userId: ctx.user.id, etablissementId: input.etablissementId }},
        create: { userId: ctx.user.id, ...input },
        update: { widgets: input.widgets },
      });
    }),

  resetLayout: protectedProcedure
    .input(z.object({ etablissementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dashboardLayout.delete({
        where: { userId_etablissementId: { userId: ctx.user.id, etablissementId: input.etablissementId }},
      }).catch(() => null); // idempotent
    }),
});
```

### 7. Drag-and-drop

**Librairie suggérée :** `react-grid-layout` (bien maintenu, gère drag + resize + breakpoints).

```tsx
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

function DashboardGrid({ widgets, editMode, onLayoutChange }) {
  return (
    <GridLayout
      className="dashboard-grid"
      cols={4}
      rowHeight={160}
      width={1216} // largeur du main content
      isDraggable={editMode}
      isResizable={editMode}
      onLayoutChange={onLayoutChange}
      layout={widgets.map((w, i) => ({ i: w.key, x: w.x, y: w.y, w: w.w, h: w.h, minW: 1, maxW: 2, minH: 1, maxH: 2 }))}
    >
      {widgets.map(w => (
        <div key={w.key} className={editMode ? 'edit-wrap' : 'widget-slot'}>
          {editMode && <WidgetEditChrome widgetKey={w.key} />}
          <WidgetRenderer widget={w} />
        </div>
      ))}
    </GridLayout>
  );
}
```

Styliser `.react-grid-item.react-grid-placeholder` pour matcher le design (fond vif pâle dashed).

---

## Catalogue — `/tableau-de-bord/personnaliser`

Page dédiée ou modale plein écran. Affiche tous les widgets **groupés par catégorie** (4 groupes), avec pour chaque widget :
- Un **preview live** (pas une image — on rend le vrai composant avec données mockées ou réelles)
- Nom + description courte
- Taille par défaut (affichée en mono, `2×1`)
- Bouton **+ Ajouter** vert vif

Règles :
- **Filtrer les widgets déjà présents** sur le dashboard (griser ou masquer avec mention « Déjà ajouté »)
- **Filtrer par `available()`** — le widget Multi-site ne s'affiche que si l'utilisateur a plus d'un établissement
- Bouton **Ajouter** place le widget **en bas de la grille** (calculer `y = max(y + h)` des widgets existants) et retourne au dashboard en mode édition

### Entrée vers le catalogue

Depuis le dashboard :
- Bouton **« Personnaliser »** dans le topbar (mode normal)
- Bouton **« + Ajouter un widget »** en fin de grille (mode édition, voir mockup)

---

## Mode édition

Activé par un bouton `Personnaliser` dans le topbar. Provoque :

1. Bandeau collant vert vif en haut (au-dessus du topbar ou en bannière intercalée)
2. Chaque widget reçoit un **chrome d'édition** :
   - Poignée `⋮⋮` (cursor: grab)
   - Titre en mono
   - 3 icônes : `◱` redimensionner, `⚙` réglages, `×` retirer
3. Bordure dashed vif sur chaque widget
4. Cellule **« + Ajouter un widget »** en fin de grille (ouvre le catalogue dans une modal latérale ou redirige vers `/personnaliser`)
5. Deux boutons dans le bandeau : `Annuler` (revert state) · `Terminer l'édition` (save → tRPC mutation)

### Persistance de l'état d'édition

Stocker dans un state local (`useState`) pendant l'édition, ne committer qu'au clic sur « Terminer ». Si l'utilisateur navigue ailleurs sans sauver → `beforeunload` warning.

---

## Tokens & styles à reprendre

Tous les tokens proviennent de `globals.css` (déjà en place depuis les précédents handoffs) :

```css
--accent-vif: oklch(0.62 0.18 150);
--accent-vif-soft: oklch(0.94 0.04 150);
--warm: oklch(0.78 0.12 70);
--minium: oklch(0.58 0.18 35);
--ink: oklch(0.18 0.01 250);
--paper-elevated: oklch(0.99 0.005 80);
--paper-sunk: oklch(0.96 0.01 80);
--rule: oklch(0.85 0.01 250);
--rule-soft: oklch(0.92 0.005 250);
--font-body: 'Geist', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
--font-serif: 'Instrument Serif', serif;
```

### Classes CSS à reporter

Copier-coller **intégralement** `styles/widgets.css` du projet design vers `src/styles/dashboard-widgets.css` (ou `@layer components` dans globals). Les sélecteurs sont tous préfixés `.w-*` ou `.widget-*` pour éviter les collisions. Le chrome d'édition est préfixé `.edit-*`.

⚠️ **Attention :** Le fichier `widgets.css` utilise `.cell`, `.pill`, `.btn-vif-app`, `.btn-ghost-app`, `.avatar` déjà définis dans `app.css`. Assurer que ces classes existent côté Next, sinon les ramener.

---

## Accessibilité

- Chaque widget : `role="region"` + `aria-label="{nom du widget}"`
- Chrome d'édition : boutons avec `aria-label` explicite (« Redimensionner DUERP », « Retirer DUERP », etc.)
- Drag-and-drop : supporter **clavier** via `react-grid-layout` — flèches pour déplacer, `Enter` pour saisir/relâcher
- Bandeau d'édition : `role="status" aria-live="polite"`
- Catalogue : chaque carte preview en `<article>`, bouton Ajouter avec `aria-label="Ajouter le widget {nom} au tableau de bord"`

---

## Responsive

- `< 1024px` : grille passe à **2 colonnes** (widgets 2×1 gardent `span 2`, 1×1 restent solo)
- `< 768px` : grille en **1 colonne**, tous les widgets en pleine largeur, **mode édition désactivé** (édition desktop seulement, message invitant à passer sur desktop)

---

## Micro-interactions

- Entrée en mode édition : transition 250ms des bordures dashed (`border-style` non animable → transition sur `border-color` uniquement, dashed visible dès le toggle)
- Ajout d'un widget depuis le catalogue : il apparaît avec une anim `fadeInScale` 300ms + scroll to widget
- Retrait d'un widget : fade out 200ms puis shift du grid (react-grid-layout anime automatiquement)
- Hover sur un widget du catalogue : `translateY(-2px)` + border `--accent-vif`

---

## Copy / contenu

Tout est dans les mockups JSX. Points d'attention :

- **Pas de « slop »** : chaque widget a UN chiffre héros, pas 15 métriques
- **Tonalité directe** : « Cette semaine, concentrez-vous sur X », « 47 h de tâches évitées » — sujet implicite l'utilisateur
- **Mono pour les méta** (dates, % , unités), serif italic vif pour les accents émotionnels
- **Pas d'emoji**

---

## Checklist PR

### Phase 1 · Infrastructure
- [ ] Migration Prisma `DashboardLayout`
- [ ] `registry.ts` avec les 12 descripteurs de widget
- [ ] Router tRPC `dashboard` : `getLayout`, `saveLayout`, `resetLayout`
- [ ] Helper `DEFAULT_LAYOUT` + logique de merge (layout utilisateur > default)
- [ ] Installer `react-grid-layout` + styler `.react-grid-placeholder`

### Phase 2 · Composants widgets
- [ ] Copier le JSX de chacun des 12 widgets depuis `components/DashboardWidgets.jsx`
- [ ] Brancher chaque widget à sa query Prisma (12 queries)
- [ ] Fallbacks / skeletons pendant chargement
- [ ] Fallback "pas de données" quand le widget n'a rien à afficher (ex: aucune dépense pour le budget)

### Phase 3 · Mode édition
- [ ] Composant `DashboardGrid` avec `isDraggable`/`isResizable` toggle
- [ ] `WidgetHost` enveloppe chaque widget avec chrome d'édition
- [ ] Bouton `Personnaliser` dans topbar → enter edit mode
- [ ] Bandeau vif collant + `Annuler` / `Terminer`
- [ ] `beforeunload` warning si modifs non sauvegardées

### Phase 4 · Catalogue
- [ ] Route `/etablissements/[id]/tableau-de-bord/personnaliser`
- [ ] Layout du catalogue (4 groupes, lede par groupe, previews live)
- [ ] Filtre `available()` (multi-site conditionnel)
- [ ] Filtre widgets déjà présents (griser + label)
- [ ] Bouton `+ Ajouter` → insertion bas de grille + redirect

### Phase 5 · Polish
- [ ] Micro-interactions ajout/retrait
- [ ] Keyboard nav drag-and-drop
- [ ] Responsive `< 1024` / `< 768`
- [ ] Aria-labels sur tous les contrôles d'édition
- [ ] E2E Playwright : ajout widget, resize, remove, reset, reload

---

## Fichiers à consulter dans le projet design

| Fichier | Contenu |
|---|---|
| `components/DashboardWidgets.jsx` | Les 12 widgets en JSX + shells Catalogue/ÉditMode |
| `styles/widgets.css` | **À copier dans Next** — tous les styles widgets + chrome d'édition |
| `components/AppScreens.jsx` | Dashboard actuel (4 widgets de base) pour référence |
| `App.html` → artboards `catalog` et `edit-mode` | Visuel final |

---

## Questions ouvertes pour le PO

- **Paywall** ? Certains widgets (Multi-site, Budget, Prestataires) peuvent être positionnés plan payant
- **Widgets « settings »** ? Ex: Budget > définir le montant annuel, Countdown > choisir quoi considérer comme critique. Pour v1 : pas de settings, on garde les defaults
- **Partage layout** ? Possibilité d'imposer un layout par défaut au niveau organisation (admin) — hors scope v1
- **Préréglages** ? « Profil dirigeant », « Profil gestionnaire multi-site » en un clic → hors scope v1, peut être ajouté après
