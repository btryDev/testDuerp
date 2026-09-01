# Lot C — le public reçu, et ce que son silence éteint

Branche `lot-c/public-recu-indetermine`, partie de `origin/main` (`2a54efb`).
Constats écrits au fil de la mesure, avant toute décision de remède.

---

## 1. Mesure — quelles obligations dépendent du champ

Appel du référentiel, pas grep (`obligationsConformite`, 116 obligations) :

```
total obligations: 116
dépendantes de personnesPresentesMin / champR422734 : 2

incendie-travail-consigne-affichee     porteur=etablissement  min=51  champR422734=true
  criticité 3   nature=etat_permanent        periodicite=autre
incendie-travail-exercice-semestriel   porteur=etablissement  min=51  champR422734=true
  criticité 4   nature=echeance_recurrente   periodicite=semestrielle
```

**Deux, et exactement les deux que le brief nomme.** Pas huit. Le remède se
dimensionne donc sur un couple, pas sur une famille.

### 1 bis. Un second consommateur, que le brief ne cite pas

Le grep — cette fois utile, parce qu'il cherchait le *critère* et non
l'obligation — donne un deuxième porteur du même champ :
`src/lib/registre/sections.ts`, trois fiches du registre de sécurité.

| fiche | typologies | ce que le silence éteint |
|---|---|---|
| `service-securite-evacuation` | `{ travail, personnesPresentesMin: 51, champR422734 }` seule | **la fiche entière** — guides-files et serre-files |
| `exercices-themes` | la même **OU** `{ erp: true }` | rien pour un ERP ; tout pour un établissement de travail non-ERP |
| `exercices-comptes-rendus` | idem | idem |

`registre/composition.ts:84` appelle `matchTypologie` — le **même** moteur, donc
le **même** repli. C'est une bonne nouvelle : une seule source de vérité, un seul
remède. Mais elle élargit le constat : le silence du champ ne retire pas
seulement deux lignes de calendrier, il retire aussi une fiche du **registre de
sécurité**, c'est-à-dire du document qu'on présente à une commission.

## 2. Ce que fait exactement la règle de repli, et depuis quand

`matching/engine.ts:249-258`, commentaire lu en entier :

> `personnesPresentesHabituellement` absent ⇒ repli sur l'effectif salarié :
> sous-estimation assumée (jamais un faux positif).

Le repli **est argumenté, et son intention est juste** : il refuse de fabriquer
une obligation sur une donnée qu'il n'a pas. Le même commentaire montre d'ailleurs
un soin réel — le critère est évalué dès que *l'une* des deux branches est
déclarée, précisément pour qu'« un critère que l'on ne sait pas vérifier ne
s'ignore jamais en silence ».

Et le moteur va jusqu'à **écrire la différence dans sa raison**
(`engine.ts:270-274`) : « *N* salariés sur site, faute de déclaration des
personnes présentes (seuil 51) », au lieu de « *N* personnes habituellement
présentes ». La distinction existe donc déjà dans le code — mais elle ne
s'imprime que sur le chemin où l'obligation **passe**. Sur le chemin où elle
**tombe**, il n'y a pas de raison à écrire, puisqu'il n'y a plus de ligne : le
`return { ok: false }` est muet par construction.

**C'est là le défaut, et il est exactement à l'endroit annoncé** : pas dans la
règle, dans son silence.

### Origine

- Migration `20260825120000_etablissement_champ_r4227_34` — le champ naît
  nullable, et le commentaire du `schema.prisma` (l. 74-81) annonce déjà le repli.
- ADR-022 § 7 « L'incertitude ne réduit jamais la couverture » : la règle
  générale est posée, **et les deux exceptions y sont nommées** —
  `manipuleMatieresR422722` et `personnesPresentesHabituellement`. L'ADR ajoute
  pourquoi elles ne sont pas corrigées : « le canal d'affichage manque »,
  `EcheanceCalendrier.tone` étant binaire.
- `docs/dette-chantier-porteur-echeance.md` § 4, qui reprend le même constat.

Trois endroits documentent donc la règle. **Aucun des trois ne nomme les deux
obligations qu'elle éteint** — c'est bien la formulation du brief, et elle est
exacte.

### Le seul endroit où le dirigeant peut le lire

`StepIdentite.tsx:287`, l'aide du champ à l'onboarding :

> « Au-delà de 50 : alarme sonore, consigne affichée et exercices semestriels
> (R. 4227-34, -37, -39). **Vide = l'effectif salarié est utilisé.** »

La phrase est juste, complète, et elle nomme même les articles. Elle est aussi
**au seul endroit où sa conséquence n'est pas encore lisible** : à la saisie,
avant qu'aucun calendrier n'existe. Six mois plus tard, sur l'écran calendrier ou
sur le registre remis à un tiers, plus rien ne la rappelle. Un dirigeant qui a
sauté un champ facultatif ne se souvient pas d'avoir lu son aide.

## 3. Combien de dossiers réels ont le champ vide

Base locale `localhost:5433` (`.env` vérifié : prod Supabase commentée aux
lignes 26-27, aucune base distante touchée).

```
raisonDisplay              | eff | pph | mat  | pub | estERP | cat | trav
Le Bistrot du Marché       |  12 | 102 |      |  90 | t      | N5  | t
Le Bistrot du Marché (btry)|  12 | 102 |      |  90 | t      | N5  | t
```

**0 dossier sur 2 a le champ vide** : le jeu de démonstration le renseigne à 102,
au-dessus du seuil. Le défaut n'est donc **pas visible sur le dossier de
démonstration** — ce qui explique qu'il ait traversé le palier 1 sans être vu,
et ce qui interdit de le vérifier autrement qu'en fabriquant le cas.

Deux notes de la même requête :

- `manipuleMatieresR422722` est **`null` sur les deux dossiers** — la seconde
  exception de l'ADR-022 § 4, silencieuse elle aussi. Ici elle ne change rien
  (102 ≥ 51 emporte déjà la branche seuil), mais elle entre dans le calcul du
  remède : voir § 5.
- `effectifPublicAdmis = 90` existe en base (fiche « Renseignements généraux »
  du registre, CCH R. 143-44). **Je ne m'en sers pas.** C'est la capacité
  *admise* par l'arrêté, pas les personnes *habituellement présentes* ; en
  dériver l'une de l'autre serait exactement le cinquième déclencheur que
  l'ADR-023 interdit. Le noter suffit.

## 4. L'arbitrage — pourquoi la seconde voie, et pourquoi elle seule

**Rendre le champ obligatoire ne suffirait pas, et surtout ne suffirait pas
seule.**

1. Elle ne dit rien des dossiers **déjà créés**. Une migration ne peut pas
   inventer le chiffre ; elle ne peut que le laisser `null` ou le remplir avec
   l'effectif salarié — c'est-à-dire graver le repli en base au lieu de le
   corriger. Tant qu'un `null` subsiste, le trou reste, et il n'est toujours
   nommé nulle part.
2. Elle ne dit rien de `manipuleMatieresR422722`, qui porte **la seconde branche
   du même champ d'application** (R. 4227-34 est disjonctif). Un établissement
   qui déclare 20 personnes présentes et laisse la question des matières
   inflammables sans réponse est dans exactement la même situation : l'outil ne
   sait pas trancher, et se tait.
3. Elle ne fait **pas** ce que l'ADR-022 § 7 demande. La règle n'est pas
   « exiger la donnée », c'est « ne pas réduire la couverture quand elle
   manque ». Un champ requis évite le cas neuf ; il ne donne toujours aucune
   conduite au cas où la donnée manque.

La voie « nommer le trou » est la seule qui traite les trois. Elle est aussi
celle que l'ADR-022 § 7 décrivait sans pouvoir la livrer — « le canal d'affichage
manque » : `EcheanceCalendrier.tone` est binaire. **Ce canal existe depuis, et
ce n'est pas `tone`** : c'est `perimetre/couverture.ts`, ses
`IndeterminationCouverture` et leur `quoiFaire`, affichés en bandeau ambre sur
le calendrier et sur le registre, et repris dans le PDF remis à un tiers
(`pdf/builders.ts:386`). L'ADR cherchait une couleur d'échéance ; ce qu'il
fallait était une phrase, et elle a son module.

**Le champ obligatoire reste néanmoins souhaitable**, mais comme décision
produit sur l'onboarding — question n° 2 de la propriétaire, que ce lot ne
tranche pas. Il ne dispense pas de l'indétermination ; l'inverse est vrai.

## 5. La forme du remède, et ce qui la contraint

Contrainte du module (`couverture.ts:51-55`) : « Il **n'ajoute aucune source de
vérité** : il projette celles qui existent. […] un axe qui déclare au lieu de
projeter fait de ce module la troisième déclaration que son propre commentaire
interdisait. »

Conséquence directe : **le seuil de 51 ne doit pas être écrit dans
`couverture.ts`.** Il vit dans le référentiel (`incendie.ts`) et dans
`registre/sections.ts` ; l'y recopier créerait la divergence silencieuse que le
commentaire de `corpus/perimetre.ts:26-31` décrit pour `CATEGORIES_COUVERTES`.

D'où la forme retenue — le fait est **dérivé du référentiel et du moteur**, pas
déclaré :

> Une obligation est *indécidable faute du public reçu* quand
> (a) le champ est vide, (b) elle ne s'applique pas aujourd'hui, et
> (c) elle s'appliquerait si le nombre manquant atteignait **son propre**
> `personnesPresentesMin`.

Les trois conditions ensemble donnent zéro faux positif :

- (a) écarte tout dossier qui a répondu ;
- (b) écarte l'établissement dont l'effectif salarié atteint déjà le seuil — le
  repli y donne la même réponse, il n'y a aucun doute à lever ;
- (b) écarte aussi celui qui a déclaré `manipuleMatieresR422722: true` : la
  branche matières emporte déjà l'obligation, le chiffre ne changerait rien ;
- (c) écarte l'obligation qui tombe pour une **autre** raison — le salon de
  coiffure non-ERP, l'obligation d'un régime qu'il n'a pas. Sans (c), l'axe
  crierait chez tout le monde.

Et aucun chiffre en dur : le jour où une obligation arrive avec un seuil de 20,
l'axe la prend sans qu'on y touche.

## 6. Ce que je ne fais pas

- **Aucune dérivation du public reçu.** Ni depuis `effectifPublicAdmis`, ni
  depuis le type d'ERP, ni depuis le code NAF. ADR-023.
- **Aucun changement du repli lui-même.** Le retirer transformerait la
  sous-estimation en sur-application silencieuse — le symétrique exact, et
  celui-là fabriquerait des échéances. `engine.ts` est laissé intact.
- **Aucun total, aucun score.** L'axe rend une phrase, comme les quatre autres.
