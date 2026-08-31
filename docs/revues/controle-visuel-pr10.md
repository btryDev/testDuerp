# Contrôle visuel — PR #10

Ce document existe parce que **rien n'automatise ce contrôle**, et qu'il attend
depuis cinq jours. Cinquante-cinq commits ont changé des écrans. La suite de
tests est verte, `tsc` est propre : aucun des deux ne sait ce qui s'affiche.

Tu es la session qui l'exécute. Tu ouvres l'application dans un navigateur, tu
regardes, et tu rends un rapport. **Tu ne corriges rien.** Si tu vois un défaut,
tu le décris ; la correction se décide ailleurs.

---

## Mise en route

Le dépôt : `https://github.com/btryDev/testDuerp.git`, branche
**`integration/2026-08-28`**.

```bash
git clone https://github.com/btryDev/testDuerp.git
cd testDuerp
git checkout integration/2026-08-28
pnpm install            # pnpm, jamais npm — le lockfile est verrouillé sur pnpm@10
docker compose up -d    # deux bases : 5433 (travail) et 5434 (ombre, jetable)
npx prisma migrate deploy
pnpm dev                # http://localhost:3000
```

**Il te faut un `.env`.** Il n'est pas dans le dépôt et ne doit pas y entrer.
Cinq variables : `DATABASE_URL`, `DIRECT_URL`, `SHADOW_DATABASE_URL` (les trois
pointent le Docker local), `NEXT_PUBLIC_SUPABASE_URL` et
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (l'authentification passe par Supabase).
Demande-le — il te sera transmis hors du dépôt.

**Attention, une seule commande est interdite :**

```
npx prisma migrate diff --from-migrations … --shadow-database-url "$DIRECT_URL"
```

Elle a **vidé la base de production le 27 août 2026**. Prisma vide la base
d'ombre sans demander ni signaler. `SHADOW_DATABASE_URL` existe précisément pour
qu'elle ne désigne jamais autre chose que le port 5434.

### Les données

**Une base fraîche est vide, et les seeds n'y peuvent rien** : `pnpm db:seed`,
`pnpm seed:demo` et `pnpm seed:salaries` enrichissent des établissements
**existants**, ils n'en créent pas. Deux voies :

1. **Un dump de la base de travail** de l'autre machine, restauré dans ton
   Docker. C'est la voie sûre — les écrans à contrôler demandent un
   établissement à **deux bâtiments**, des équipements, des prestataires et au
   moins un salarié à titre daté, ce qu'un parcours d'onboarding ne produit pas
   en cinq minutes.
2. **Créer un dossier par l'onboarding**, puis lancer les seeds dessus. Plus
   long, et plusieurs vérifications ci-dessous deviennent inatteignables faute
   de second bâtiment.

Demande le dump. Si tu ne l'as pas, dis-le et fais ce qui est atteignable —
**une case non vérifiée annoncée comme telle vaut mieux qu'une case cochée à
vue**.

---

## Ce qu'il faut regarder

Onze points, par ordre d'importance. Chacun dit **ce qu'on attend** et **ce qui
serait un défaut**. Pour chacun : capture d'écran, et une phrase.

### 1. Le filtre par bâtiment sous « en retard seulement » ★

**C'est le point le plus important**, parce que c'est un défaut réel corrigé
avant-hier et que personne ne l'a jamais vu à l'écran.

Sur le calendrier d'un établissement à **deux bâtiments** :

1. Choisir « Bâtiment A ». Noter le nombre annoncé en en-tête.
2. Cocher **« en retard seulement »**.
3. Comparer l'en-tête et la liste dessous.

**Attendu** : les deux parlent du même ensemble. Chaque ligne listée appartient
au bâtiment A — ou n'a pas de lieu du tout (« Tout l'établissement »), ce qui est
normal : une échéance sans lieu concerne aussi le bâtiment qu'on regarde.

**Défaut** : une ligne du bâtiment B apparaît, ou l'en-tête et la liste ne disent
pas le même nombre. C'était le comportement avant la correction.

### 2. La pilule « Titres du personnel » ★

Nouvelle famille du calendrier. Une échéance de titre de salarié — attestation
médicale, habilitation — ne se rangeait nulle part et tombait dans
« Vérifications », avec les contrôles d'appareils.

**Attendu** : une pilule « Titres du personnel » dans la rangée de filtres,
portant une **carte d'identité** (`IdCard`), la même icône que « Équipe » dans le
rail. Elle filtre. Les lignes de titre n'apparaissent plus sous « Vérifications ».

**Défaut** : la pilule montre une **silhouette de personnes** (`Users`) — c'est
l'icône des attestations de prestataires, et le même pictogramme désignerait deux
objets sur le même écran. Ou : elle est absente alors que l'établissement a un
titre daté. Ou : une ligne de titre se compte encore dans « Vérifications ».

### 3. Les pastilles réglementaires ne sont plus des boutons morts ★

Six pastilles avaient l'air cliquables et ne l'étaient pas : même fond, même
graisse, même capitales que leurs voisines, mais rien dessous. Quatre étaient sur
**l'écran qu'on ouvre devant un inspecteur**, sous un bandeau qui promet
« références sourcées Légifrance et INRS ».

Écrans à ouvrir : **Contrôle**, **Permis de feu** (liste et fiche), **Plan de
prévention** (liste et fiche), **Registre**, **Carnet sanitaire**,
**Accessibilité**, **Prestataires**.

**Attendu** : chaque pastille s'ouvre et montre quelque chose — un extrait, un
lien Légifrance, ou les deux.

**Défaut** : une pastille qui ne s'ouvre pas, ou qui s'ouvre sur du vide.

### 4. Aucun référentiel privé présenté comme du droit

`APSAD R43` est un référentiel d'assureur, pas un texte réglementaire. Il
apparaissait six fois dans la même pastille que des articles de code.

**Attendu** : `APSAD` n'apparaît plus dans une pastille réglementaire. S'il
apparaît, c'est qualifié comme référentiel privé, visiblement, sans ambiguïté.

### 5. Le carnet sanitaire et sa citation

Un extrait de texte y était présenté entre guillemets comme cité textuellement,
et il était **fabriqué**.

**Attendu** : la citation se termine par « … tenu à disposition **du directeur
général de l'agence régionale de santé** ». Le lien s'ouvre sur l'article annoncé.

**Défaut** : « des autorités sanitaires », ou toute autre formulation — ce serait
la version fausse.

### 6. La carte de couverture a disparu du tableau de bord

Elle affirmait ce que le produit couvre, plus que ce que le code établit. Elle
est partie, remplacée par un document.

**Attendu** : plus de carte de couverture sur le tableau de bord, et **rien ne
reste à sa place** — pas de trou, pas de grille désalignée, pas de colonne vide.

### 7. Le bandeau de couverture du calendrier

Il dit ce que l'outil ne couvre pas, sur **quatre** axes : IGH, catégorie d'ERP,
secteur du DUERP, domaine d'équipement.

**Attendu** : le bandeau se rend, son texte est lisible, et il n'annonce pas un
manque qui n'existe pas pour cet établissement. Un bandeau vide est un résultat
juste si l'établissement ne déclenche aucun axe — mais dis-le.

### 8. Les deux nouvelles recommandations du tableau de bord

Le produit sait désormais nommer un manque qu'il ne peut pas dériver. Deux
messages nouveaux, tous deux fondés sur une **incohérence entre modules**, pas
sur une date :

- « Suppose un titre nominatif — aucun n'est déclaré »
- un domaine d'obligation sans prestataire correspondant à l'annuaire

**Attendu** : s'ils s'affichent, ils sont lisibles et justes. Ils passent **après**
les messages d'amorçage, pas avant.

### 9. Les écrans Équipe

Deux d'entre eux n'appliquaient pas la charte du board.

**Attendu** : la liste **Équipe** et la fiche d'un salarié ont la même grammaire
visuelle que le reste du board — mêmes teintes, mêmes rayons, mêmes pastilles.

**Défaut** : un écran qui a l'air d'appartenir à une autre application.

### 10. Le nom de l'opérateur sur le carnet sanitaire

`operateur` est un champ de texte libre qui sort dans l'export ZIP. Il a été
rattaché à une finalité : qui a relevé.

**Attendu** : sur la fiche d'un point de relevé, le nom de qui a fait le relevé
s'affiche, avec un libellé qui dit ce que c'est.

### 11. L'onboarding s'ouvre hors des trois secteurs

L'onboarding refusait la création d'un dossier hors de trois secteurs, au motif
que le DUERP ne serait pas fiable — alors que le référentiel de conformité ne lit
jamais le code NAF.

**Attendu** : un NAF quelconque — un garage, une pharmacie — laisse le parcours
aboutir, avec un message qui dit clairement ce qui sera couvert et ce qui ne le
sera pas.

**Défaut** : un refus, ou une promesse de couverture DUERP que le produit ne tient
pas.

---

## Ce qu'on attend de ton rapport

Écris-le dans **`docs/revues/rapport-controle-visuel-pr10.md`**, commite-le sur
`integration/2026-08-28` et pousse. Puis dis-le moi.

Pour chacun des onze points :

- **conforme** / **défaut** / **non vérifié**, et pourquoi si c'est le dernier.
- Une capture d'écran quand tu vois quelque chose — attendu comme défaut.
- Pour un défaut : l'écran, le chemin exact pour le reproduire, et ce que tu
  voyais.

Et à la fin, deux choses qu'on ne t'a pas demandées :

- **Ce qui t'a paru faux sans être dans la liste.** Tu es le premier regard
  neuf sur ces écrans depuis cinq jours.
- **Ce que tu n'as pas pu atteindre**, et ce qu'il aurait fallu pour y arriver.

## Les règles

- **N'invente aucune vérification.** Une case non vérifiée annoncée comme telle
  est une information ; une case cochée à vue est un mensonge qui coûtera une
  journée. Un relecteur de ce chantier a écrit comme sourcée une vérification
  qu'il n'avait pas faite — c'est la seule faute qui compte vraiment ici.
- **Ouvre l'écran avant de le qualifier.** Ne conclus rien d'un fichier lu.
- **Ne corrige rien, ne pousse aucune correction de code.** Ton seul commit est
  ton rapport.
- **Ne pousse jamais sur `main`.** Un push sur `main` déploie en production.
- Si tu crées un worktree, installe-lui son propre `node_modules` : le client
  Prisma s'écrit dans le `node_modules` partagé et contamine les worktrees
  voisins.
