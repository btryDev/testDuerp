# Handoff Claude Code — Redesign `/etablissements/[id]/guide`

**Fichier à modifier :** `src/app/etablissements/[id]/guide/page.tsx` (branche `feat/v2-modele-donnees`)

**Mockup de référence :** artboard "Guide" dans `App.html` du projet design · source JSX complète dans `components/GuideScreen.jsx` · styles dans `styles/guide.css`.

---

## Intention

La page actuelle est une pile de `BentoCell` textuelles, étouffante. On la transforme en **page éditoriale infographique** qui distingue clairement :
- **Ce que dit la loi** (source primaire, référence Légifrance)
- **Ce que la plateforme génère / suit** pour le tenir

Le mot "pilier" est remplacé par **"outil"** — la grille est extensible (Carnet sanitaire, etc. à venir).

## Prérequis tokens

Dans `globals.css`, ajouter si pas déjà fait :
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
```

## Structure de la page

```
<AppSidebar active="guide" />
<AppTopbar
  title="Comprendre vos obligations"
  subtitle="Ce que la loi attend d'un employeur, traduit simplement."
  actions={[Imprimer, Dossier PDF ↓]}
/>

§1 — GuideHero                  (split 1.15fr / 1fr · illustration SVG à droite)
§2 — OutilsConformite           (intro unifiée + grille 3×2)
§3 — TimelineAnnuelle           (12 mois sur une ligne horizontale)
§4 — PilierDetails              (cartes "loi vs app" 2 colonnes par outil)
§5 — QuiFaitQuoi                (6 cartes, "Vous" en ink pleine)
§6 — EnCasControle              (tampon circulaire + checklist numérotée)
§7 — Sources                    (bloc sombre Légifrance / INRS / Ministère)
§8 — footer mono                ("Guide rédigé à partir de sources primaires…")
```

Chaque section est wrappée dans un `GReveal` (IntersectionObserver, opacité + translateY 14px, durée 600ms, cubic-bezier `.2,.6,.2,1`, délais étagés 0/80/120/160/200/240/280ms).

---

## 1. GuideHero

**Kicker :** `§ GUIDE DE L'EMPLOYEUR`

**Titre :** "Vos obligations de santé-sécurité, *au clair*." — *"au clair"* en `<em>` italic serif accent vif, sur sa propre ligne.

**Lede :** "Ce que la loi attend d'un employeur, comment votre établissement est concerné, et quels outils la plateforme tient à jour pour vous."

**Méta :** 3 pastilles côte à côte avec `<strong>` + `<em>` empilés :
- `~ 7 min` / `de lecture`
- `4 outils` / `suivis ici`
- `Sources` / `Légifrance · INRS`

### Illustration droite — `InfoArticleCard`

Carte SVG 440×420 qui empile 3 documents de conformité (feuille Plan d'actions rotée +8°, feuille Registre rotée −4°, DUERP principal non roté en premier plan) sur un fond radial vert pâle avec grille 44×42px.

Détails graphiques à reproduire :
- **Fond :** `radialGradient` `--accent-vif-soft` 80% → transparent, grille fine `--rule-soft` 0.5px opacity 0.6
- **Doc Plan d'actions** (arrière, rotation +8°) : barre latérale `--minium`, 3 puces colorées (`--minium` / `--warm` / `--accent-vif`) avec lignes de texte mono
- **Doc Registre** (milieu, rotation −4°) : tableau 5 lignes, colonne statut alternant vert pâle avec coche SVG
- **Doc DUERP** (avant, sans rotation) : coin replié en haut à droite, matrice de risques 4×4 avec cellules `--paper-sunk` / `--accent-vif-soft` / `--warm` 20% / `--minium` 25%, tampon circulaire vif avec ring pointillé, signature manuscrite
- **Badge "§ CODE DU TRAVAIL · Art. L. 4121-1"** en noir en bas à droite
- **Post-it "ÉCHÉANCE · 22 juin"** warm, roté +6° en haut à droite
- **Trombone** SVG warm, roté −20°, opacité 0.85 sur le coin haut-gauche du DUERP

→ Voir le SVG complet dans `components/GuideScreen.jsx` → `InfoArticleCard()`. À porter tel quel dans un fichier `components/guide/IllustrationDocuments.tsx`.

---

## 2. OutilsConformite (remplace les 4 piliers)

**Intro unifiée** en tête de section (pas juste un kicker+h2) :
- Kicker : `§ LES OUTILS DE CONFORMITÉ`
- Titre : "Une vue d'ensemble<br/>*sur votre conformité.*"
- Paragraphe pédagogique d'une phrase longue (classe `.outils-intro-text`) :
  > Vous déclarez vos équipements et votre matériel ; la plateforme **génère les documents attendus** (DUERP, registre, plan d'actions…), les met à jour au fil de vos vérifications et **vous rappelle les échéances** avant qu'elles ne passent. Chaque outil ci-dessous correspond à une obligation précise — la plateforme en maintient quatre aujourd'hui, d'autres arrivent.

### Grille 3 colonnes × 2 rangées

Chaque carte : bord latéral coloré + icône + tag statut top-right + titre + sous-titre mono + description courte.

| # | Outil | Sous-titre | Couleur | Statut | Description |
|---|---|---|---|---|---|
| 1 | DUERP | Document unique | vif | Actif | Inventaire des risques par unité de travail |
| 2 | Vérifications | Périodiques | warm | Actif | Calendrier des contrôles obligatoires |
| 3 | Registre | De sécurité | ink | Actif | Rapports horodatés, présentables à tout moment |
| 4 | Plan d'actions | Correctives | minium | Actif | Écarts et risques à lever, suivis jusqu'à clôture |
| 5 | Carnet sanitaire | Eau · air | muted | Bientôt | Relevés sanitaires des installations |
| 6 | Autres outils | À venir | muted | Bientôt | Registre unique, affichages obligatoires… |

- Tag `Actif` = vif pâle (`--accent-vif-soft` + `--accent-vif`)
- Tag `Bientôt` = neutre + carte en `opacity: 0.75`
- Icônes : `IconDoc`, `IconCheck`, `IconBook`, `IconArrow`, `IconDrop`, `IconPlus` (voir JSX de référence)

---

## 3. TimelineAnnuelle

**Kicker :** `§ CALENDRIER TYPE`
**Titre :** "Une année *rythmée*, pas surchargée."
**Sous-titre (important — texte figé du mockup) :**
> **Votre calendrier** est généré automatiquement à partir des équipements que vous déclarez et de votre typologie d'établissement. L'exemple ci-dessous correspond à une restauration · 8 salariés · ERP 5ème cat.

⚠️ Ce texte **pose l'exemple comme exemple** pour un utilisateur lambda. Le mot "Votre" en bold souligne qu'en condition réelle, ce qu'affichera la timeline vient de SES propres équipements.

### Structure visuelle

- Ligne continue horizontale, 12 colonnes égales
- Un point `<t-dot>` par mois, taille plus grande + halo pour `hot: true`
- Carte `{label, tag}` sous chaque point (sauf mois vides → juste le point effacé)
- Mois vides : juillet/août tirets

### Données exemples (hardcodées dans la démo)

| Mois | Label | Tag | Hot |
|---|---|---|---|
| JAN | Revue annuelle | DUERP | ✓ |
| FÉV | Vérif. électrique | Annuel | |
| MAR | Extincteurs | Annuel | |
| AVR | Hotte — 1er semestre | Semestriel | ✓ |
| MAI | Éclairage secours | Semestriel | |
| JUI | Point mi-année | Interne | |
| JUI | — | — | empty |
| AOÛ | — | — | empty |
| SEP | Rentrée sécurité | Interne | |
| OCT | Hotte — 2e semestre | Semestriel | |
| NOV | Éclairage secours | Semestriel | |
| DÉC | Préparation DUERP N+1 | Interne | |

### Légende pied de timeline

`● Moment fort · ● Vérification récurrente · *Votre calendrier réel est généré à partir de vos équipements déclarés.*`

### Côté back — comment générer la vraie timeline

Cet exemple est statique dans la démo. Dans la vraie app :
```ts
// Query : agréger les échéances des équipements déclarés sur 12 mois
const items = await prisma.echeance.findMany({
  where: { etablissementId, date: { gte: janvier, lt: janvierSuivant }},
  orderBy: { date: 'asc' },
  include: { equipement: { select: { type: true, label: true }}},
});

// Mapper vers { m: 'JAN', label: string, tag: string, hot?: boolean }
// `hot` = échéance annuelle majeure (DUERP, grosse révision) ou toute action P1
```

Si aucun équipement n'est déclaré → fallback sur cet exemple **avec un bandeau** : « *Vous n'avez pas encore déclaré d'équipements. Voici un exemple pour une restauration type.* » + CTA `Déclarer mes équipements →`.

---

## 4. PilierDetails — cartes "Loi vs App"

**Kicker :** `§ DÉTAIL — CE QUE DIT LA LOI · CE QUE FAIT L'APP`
**Titre :** "Pour chaque outil, *deux colonnes*."
**Sous-titre :** "À gauche, l'obligation légale. À droite, ce que la plateforme génère, suit ou rappelle pour vous la tenir."

Grille 2 colonnes (xl) / 1 colonne (lg et moins). Par carte : header (num mono + h3 + source Légifrance en `<code>`) + **bloc 2 colonnes intégré** (loi fond neutre avec marque `§`, app fond vif pâle avec marque `●`) + CTA footer.

### DUERP (01 · vif) — Art. R. 4121-1 à R. 4121-4
**Loi :** Inventaire écrit des risques, unité de travail par unité de travail. · Mise à jour ≥ 1×/an (11+ salariés) et à tout changement. · Conservation 40 ans — chaque version antérieure consultable.
**App :** Trame pré-remplie adaptée à votre secteur NAF. · Cotation guidée des risques par unité de travail. · Versionnage automatique · export PDF signé daté.
**CTA :** `Ouvrir mon DUERP →`

### Vérifications (02 · warm) — R. 4323-22 · Arrêté 25 juin 1980 · CCH R. 123-51
**Loi :** Contrôles réguliers des équipements à risque (électricité, extincteurs, BAES, hottes…). · Périodicité imposée : annuelle, semestrielle, quinquennale selon le texte. · Intervenant agréé, personne qualifiée ou exploitant selon l'équipement.
**App :** Calendrier généré à partir de vos équipements déclarés. · Alertes J-30 / J-7 / jour J · escalade si retard. · Lien direct vers un prestataire agréé (optionnel).
**CTA :** `Voir mon calendrier →`

### Registre (03 · ink) — Art. L. 4711-5
**Loi :** Centralisation de tous les rapports de vérification, avis, observations. · Tenue continue et horodatée — à présenter à l'inspection du travail. · Consultable à tout moment par les agents de contrôle et les salariés.
**App :** Dépôt des rapports en 1 clic · liaison automatique à la vérif. · Recalcul automatique de la prochaine échéance. · Export ZIP + index PDF en 30 secondes.
**CTA :** `Ouvrir le registre →`

### Plan d'actions (04 · minium) — Art. L. 4121-2
**Loi :** Principes généraux de prévention : supprimer le risque avant d'en protéger. · Toute action corrective tracée de son ouverture à sa levée. · Justificatif requis à la clôture (rapport, photo, commentaire signé).
**App :** Action créée automatiquement depuis un écart de rapport. · Assignation, échéance, rappels. · Levée documentée · historique auditable.
**CTA :** `Ouvrir le plan →`

---

## 5. QuiFaitQuoi

**Kicker :** `§ QUI FAIT QUOI`
**Titre :** "Vous n'êtes *pas seul*."

Grille 3 colonnes. 6 rôles. Le rôle "Vous · dirigeant" en carte `ink` pleine (fond noir, texte blanc, icône accent vif), **classe `qui-big`**.

| Icône | Rôle | Description |
|---|---|---|
| ◉ | **Vous · dirigeant** (big/ink) | Décidez, signez, déposez. Vous portez la responsabilité. |
| ◐ | Salariés | Consultés lors du DUERP. Remontent les situations dangereuses. |
| + | Médecine du travail | Avis sur les postes, fiche d'entreprise. Dès le 1er salarié. |
| ✓ | Organismes agréés | Électricité, ascenseurs, incendie — contrôles obligatoires. |
| ◈ | CSE / CSSCT | À partir de 11 salariés. Consultation DUERP + plan. |
| § | Inspection du travail | Peut demander à tout moment DUERP + registre + actions. |

---

## 6. EnCasControle

Grille `1fr / 1.2fr`.

### À gauche — Tampon circulaire

- Disque 280px noir (`--ink`)
- Ring pointillé en rotation lente (animation CSS, 40s linear infinite)
- Texte serif italique vif `PRÊT POUR CONTRÔLE`
- Sous-texte mono : `Inspection du travail · Commission de sécurité · Assureur · Bailleur`
- `role="img"` + `aria-label="Prêt pour contrôle"`

### À droite — Checklist numérotée

Kicker : `§ EN CAS DE CONTRÔLE`
Titre : "Quatre documents.<br/>*Tout ce qu'on vous demandera.*"

Liste `<ol>` avec items numérotés `01` → `04` (mono, 2 chiffres) :

1. DUERP en cours — Version datée et signée
2. Registre de sécurité — Rapports classés, horodatés
3. Plan d'actions — Ouvertes avec échéance
4. **Dossier consolidé — PDF unique, 30 secondes** (highlight : fond vif pâle + border, badge "Généré ici ↓" vif plein)

CTA pied : `<button class="btn-vif-app big">Générer mon dossier PDF ↓</button>` + note `~30 secondes · consolide DUERP + registre + actions`.

---

## 7. Sources

Fond `--ink` (sombre), padding 40px, border-radius 20px. Gradient radial vif 22% en haut à droite.

- Kicker : `§ SOURCES PRIMAIRES`
- Titre : "Tout est *vérifiable*."
- Sous-titre : "Les obligations citées sont construites à partir de sources libres d'accès."

Liste stylée avec border-top pointillée par ligne. Chaque item : icône `↗` + titre/sous-titre + domaine à droite.

- **Légifrance · Code du travail** — Partie Santé-sécurité, articles L. 4121 à L. 4641 · `legifrance.gouv.fr`
- **INRS · Publications ED** — Évaluation des risques (ED 840, etc.) · `inrs.fr`
- **Ministère du travail** — Fiches « Prévention des risques » · `travail-emploi.gouv.fr`

En bas, paragraphe `.sources-warn` (border-left vert) :
> La plateforme vous aide à structurer et rappelle les échéances. Elle ne remplace pas l'avis d'un professionnel de la prévention lorsque votre activité présente des risques particuliers.

---

## 8. Footer

Mono, centré :
> § Guide rédigé à partir des sources primaires Légifrance + INRS · Mis à jour 04/2026

---

## Composants à créer côté Next

Dans `src/components/guide/` :
- `GuideHero.tsx` · `IllustrationDocuments.tsx` (le SVG)
- `OutilsConformite.tsx` · `OutilCard.tsx`
- `TimelineAnnuelle.tsx`
- `OutilDetail.tsx` (la carte "loi vs app", 1 par outil)
- `QuiFaitQuoi.tsx` · `RoleCard.tsx`
- `EnCasControle.tsx` · `ControleStamp.tsx`
- `SourcesBloc.tsx`
- `GReveal.tsx` (hook + wrapper d'animation scroll)

Les icônes (`IconDoc`, `IconCheck`, `IconBook`, `IconArrow`, `IconDrop`, `IconPlus`) peuvent rester en petits composants SVG inline ou être extraits dans `src/components/icons/`.

## Classes Tailwind utiles (à créer dans `@layer components`)

```css
@layer components {
  .g-kicker { @apply font-mono text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground font-medium; }
  .g-h2 { @apply text-[2.2rem] font-semibold tracking-[-0.03em] leading-[1.08]; }
  .g-h2-em { @apply font-serif italic font-normal text-[color:var(--accent-vif)]; }
  .g-sub { @apply text-[1rem] text-muted-foreground leading-[1.55] max-w-[64ch]; }
  .g-sub strong { @apply text-foreground font-semibold; }
  .outils-intro-text { @apply text-[1.05rem] leading-[1.6] text-muted-foreground max-w-[72ch]; }
}
```

Garder les styles composés (timeline, tampon circulaire, matrice SVG, cartes outil) dans un `styles/guide.css` co-localisé plutôt qu'en Tailwind — la lisibilité y gagne.

## Accessibilité
- Tampon circulaire : `role="img" aria-label="Prêt pour contrôle"`
- Timeline : chaque mois `<time datetime="2026-01">` pour les mois actifs
- Cartes outils "Bientôt" : `aria-disabled="true"`
- Liens externes (Sources) : `rel="noopener noreferrer"`, icône `↗` en `aria-hidden`
- Illustration SVG : `aria-hidden="true"` (décorative)

## Responsive (post-MVP)
- `< 1024px` : grilles passent en 1 colonne, timeline scrollable horizontalement (`overflow-x: auto` avec `scroll-snap-type: x mandatory`)
- `< 768px` : tampon contrôle passe sous la checklist, illustration SVG hero masquée ou simplifiée

## Checklist PR
- [ ] Hero avec kicker + titre + lede + 3 pastilles méta + illustration SVG (3 documents empilés + badge + post-it + trombone)
- [ ] Section Outils avec **intro unifiée** (kicker + h2 + paragraphe pédagogique d'une phrase)
- [ ] Grille Outils 6 emplacements (4 actifs + 2 "Bientôt")
- [ ] Timeline 12 mois avec données d'exemple restauration 5e cat.
- [ ] Sous-titre de timeline : "Votre calendrier" + précision exemple figée
- [ ] Fallback timeline quand aucun équipement déclaré (bandeau + CTA)
- [ ] 4 cartes "Loi vs App" (DUERP, Vérifications, Registre, Plan d'actions)
- [ ] QuiFaitQuoi 6 rôles, "Vous" en ink plein (`qui-big`)
- [ ] Tampon contrôle avec ring pointillé en rotation + checklist numérotée 01-04, item 4 highlight
- [ ] Bloc Sources sombre avec encart border-left warn
- [ ] Footer mono
- [ ] `GReveal` sur chaque section (délais 0/80/120/160/200/240/280ms)
- [ ] `aria-*` sur les éléments décoratifs (SVG, tampon)

---

## Fichiers sources à consulter dans le projet design

- `components/GuideScreen.jsx` — JSX complet de référence (hero, illustration, toutes les sections, données d'exemple timeline)
- `styles/guide.css` — tous les styles (grille outils, timeline, tampon, cartes loi/app, etc.)
- `App.html` → artboard **"Guide"** pour voir le rendu final
