# Vérification des six corrections — dossier neuf

Branche **`fix/ecrans-dossier-neuf`** (`65b3ef0`), vérifiée à l'écran le
31 août 2026 sur **Atelier Vermeil inchangé** — 6 personnes, aucun équipement,
Nadia Kerbrat et son titre SST du 10 septembre 2026. Base identique à celle du
rapport précédent : 3 `Verification`, 1 salarié, 1 titre.

| # | Point | Verdict |
|---|---|---|
| 1 | Total d'année contre lignes listées | **corrigé** — les cinq compteurs s'accordent |
| 2 | Filtre par domaine figé sur trois valeurs | **corrigé** |
| 3 | Le guide contredisait le produit | **corrigé, et au-delà** |
| 4 | Valeurs d'illustration présentées comme réelles | **corrigé** |
| 5 | « prestataire » pour une adhésion obligatoire | **amélioré — la moitié du cas reste** |
| 6 | « aucun n'est déclaré » dans un dossier qui en porte un | **corrigé** |

Et **un défaut neuf**, ouvert par la correction de ce matin : §A.

---

## 1. Les cinq compteurs s'accordent — vérifié en comptant les lignes

La pastille annonce ce qui était attendu : **`2026 · 1 DATÉE · 2 À PLANIFIER`**,
et le titre lecteur d'écran le dit en toutes lettres — « 1 échéance datée en
2026, et 2 à planifier, sans date arrêtée ».

Les cinq signaux, confrontés au seul qui soit un fait :

| Signal | Ce qu'il dit | Accord |
|---|---|---|
| Pilule d'année | 1 datée · 2 à planifier = **3** | ✔ |
| Quatre compteurs d'état | 0 · 1 · 0 · 0 = **1**, explicitement les datées | ✔ |
| Chip isolé | **2** à planifier | ✔ |
| Cartes de mois | août « 2 ce mois-ci » + septembre « 1 ce mois-ci » = **3** | ✔ |
| **Lignes comptées à la main** | août 2 + septembre 1 = **3** | — |

Aucun des quatre ne diverge, et le total ne cache plus rien : la contradiction
est retirée, pas déplacée. La ligne de septembre, dépliée, porte bien sa date
réelle : « **10 SEPT.** — Membre du personnel formé au secourisme (SST) — *Titre
salarié · Nadia Kerbrat · permanente · Premiers secours* — Planifiée ».

**Une réserve qui n'était pas dans la liste, et un sixième signal.** La frise des
douze mois **n'affiche rien pour août** — pas de barre, pas de chiffre — alors
que la carte d'août porte deux lignes. Elle ne trace que les datées, ce que la
pastille annonce désormais ; mais la frise, elle, ne le dit pas. Un dirigeant qui
lit l'instrument voit un août vide et un septembre plein, quand la liste dessous
porte l'inverse. Ce n'est pas la contradiction d'origine — les nombres
s'accordent — c'est le dessin qui ne suit pas.

Capture : `captures-pr10c/30-calendrier-corrige.png`.

## 2. Le filtre par domaine suit le dossier — corrigé

Le panneau propose maintenant **Aération / ventilation**, **Santé au travail**,
**Premiers secours** : exactement les trois domaines portés par les trois lignes
du dossier. Plus de trio codé en dur, et la ligne « Santé au travail » est
devenue triable. La rangée ne déborde pas — elle affiche ce qui existe, pas les
dix-sept.

Capture : `captures-pr10c/31-filtres-corriges.png`.

## 3. Le guide ne contredit plus le produit — et il fait davantage

La phrase fautive a disparu. À sa place :

> « Aucun équipement déclaré pour l'instant — **les vérifications qui naissent
> d'un appareil** ne peuvent donc pas être calculées. **Ce qui suit ne dépend
> d'aucun équipement : ce sont les obligations qui vous incombent comme
> employeur, dès le premier salarié.** »

La distinction est juste, et elle ouvre ce qui manquait : le guide **liste
ensuite les dix-huit obligations**, groupées par domaine, avec leur rythme, leur
réalisateur et une ligne « pourquoi chez vous ».

```
Incendie / sécurité            1     Organisation de la prévention  1
Aération / ventilation         1     Information des travailleurs   2
Formation à la sécurité        4     Locaux sociaux                 3
Santé au travail               3     Co-activité                    1
Premiers secours               2                          TOTAL    18
```

**C'est la première surface qu'ont ces obligations**, et elle répond en partie au
constat central du rapport précédent. Deux réserves, cependant :

- **Les obligations ne sont pas nommées.** Un dirigeant lit « Locaux sociaux —
  3 obligations · permanente » et ne sait toujours pas qu'il s'agit des
  vestiaires, de l'eau potable et d'un emplacement pour se restaurer. Le compte
  et le motif sont là, l'objet ne l'est pas. Les seize ne sont toujours nommées
  qu'à un seul endroit : le menu déroulant du formulaire de prescription.
- **Une notation de développeur affleure** dans le texte destiné au dirigeant :
  « effectif sur site 6 **dans la plage [— ; 49]** ». L'intervalle ouvert écrit
  en notation mathématique, tiret cadratin compris, sur une page qui promet de
  traduire simplement.

## 4. L'illustration ne porte plus de valeurs — corrigé

`v3 · 04/26` et `22 juin` ont disparu. Le dessin garde ses étiquettes `VALIDÉ` et
`ÉCHÉANCE · vérif. annuelle`, mais **sans aucune valeur** : le sceau porte un
tiret, la note jaune n'a pas de date, le document a des barres grises à la place
du texte. Il se lit comme une illustration, plus comme un état de dossier.

Capture : `captures-pr10c/32-guide-corrige.png`.

## 5. « Intervenant » à la place de « prestataire » — la moitié du cas est réglée

La phrase est maintenant :

> **Aucun intervenant déclaré en santé au travail**
> *Une de vos obligations suppose un tiers qualifié — s'il intervient déjà chez
> vous, il reste à l'inscrire*

**Ce qui est gagné.** « Intervenant » ne présume plus un fournisseur qu'on
choisit, et la seconde moitié de la phrase est la vraie trouvaille : *« s'il
intervient déjà chez vous, il reste à l'inscrire »* nomme le cas le plus
fréquent — l'employeur a déjà un service de santé au travail et ne l'a pas saisi
— et retire au message tout ton de reproche. Sur ce cas-là, ça marche.

**Ce qui reste.** La phrase est écrite pour un employeur qui a déjà quelqu'un.
Pour celui qui n'a **pas** adhéré — le cas qui compte, celui où le produit
pourrait éviter un vrai manquement — elle dit « aucun intervenant déclaré », ce
qui se lit comme un trou de saisie, pas comme une obligation légale à remplir.
L'adhésion à un service de prévention et de santé au travail n'est pas une
relation qu'on peut ne pas avoir : elle est due. Rien dans la phrase ne le dit.

Je ne propose pas de rédaction — mais la règle sert deux cas dont l'un est
« inscrivez ce que vous avez déjà » et l'autre « ceci est obligatoire, et vous ne
l'avez peut-être pas ». Une seule phrase peut porter le premier ; je ne crois pas
qu'elle porte le second.

## 6. « Rien de ce qui est déclaré n'y répond » — corrigé

> **Organiser la formation à la sécurité des salariés**
> *Suppose un titre nominatif — **rien de ce qui est déclaré n'y répond***

Jugée du point de vue d'un patron de six personnes qui vient de saisir le titre
SST de Nadia : **la phrase ne lui reproche plus de n'avoir rien fait.** Elle
reconnaît implicitement qu'il a déclaré quelque chose, et dit que ce quelque
chose ne répond pas à cette obligation-là. C'est exact, et c'est le point qui
était faux.

Ce qu'elle ne dit pas, et ne peut pas dire : **lequel** répondrait. La règle ne
sait pas nommer le titre attendu — c'est écrit dans le moteur, `titre: null` — et
la formule reste donc abstraite. Un dirigeant comprend qu'il lui manque quelque
chose, sans savoir quoi chercher dans une liste de treize. C'est une limite
connue, pas un défaut de cette correction.

Capture : `captures-pr10c/34-tdb-corrige.png`.

---

## A. Ce que la correction a ouvert à côté : deux recommandations, une seule clé React ★

Console du tableau de bord, à chaque chargement, **deux fois** :

> `Encountered two children with the same key,` `/etablissements/<id>/prestataires`
> `Keys should be unique … Non-unique keys may cause children to be duplicated
> and/or omitted — the behavior is unsupported.`

**La cause.** Les deux widgets qui rendent la file de recommandations utilisent
l'URL de destination comme clé React — `key={r.href}`, `impl/board.tsx:594` et
`:1322`. Or **toutes** les recommandations de transmission « aucun intervenant
déclaré en … » pointent la même page, l'annuaire des prestataires. Dès qu'il
manque un intervenant sur **deux** domaines, deux frères portent la même clé.

Ce dossier en a deux — aération et santé au travail. Le dossier Bistrot du
rapport de ce matin en avait quatre.

**Pourquoi c'est neuf.** Avant la correction de ce matin, les transmissions
étaient retirées de la file dès qu'une urgence existait : deux d'entre elles ne
pouvaient jamais s'afficher ensemble, et la collision de clés était
inatteignable. La correction les a rendues visibles — et a rendu la collision
atteignable du même coup. C'est le tour où l'on introduit des défauts, et il en a
introduit un.

**Ce que ça risque.** React l'écrit lui-même : des enfants « dupliqués et/ou
omis ». Aujourd'hui la liste est statique et rien ne se voit ; le jour où elle se
réordonne — un filtre, une actualisation, un item soldé — une des deux
recommandations peut disparaître sans trace. Ce serait un faux négatif muet, la
famille que l'ADR-022 existe pour supprimer.

Ce n'est pas un avertissement de développement comme celui de ce matin : les
clés en double ont un effet, contrairement aux clés absentes.

## Le reste des écrans

Seize écrans du dossier ouverts après correction — tableau de bord, calendrier,
guide, contrôle, prescriptions, registre, équipements, équipe, prestataires,
DUERP, actions, carnet, accessibilité, permis de feu, plan de prévention, fiche
établissement. Tous à 200, aucun cassé, **aucune autre erreur console** que celle
du §A.

L'avertissement de clé manquante dans `BarreAnnee`, noté non résolu au rapport
précédent, **n'apparaît plus** sur ce dossier. Je ne l'attribue à aucune
correction : sa cause n'avait pas été trouvée, et son absence ici ne prouve pas
sa disparition.
