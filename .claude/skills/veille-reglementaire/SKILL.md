---
name: veille-reglementaire
description: Vérifier qu'une référence réglementaire du référentiel est toujours à jour, ou chercher ce qui a changé dans le droit de la santé-sécurité au travail. À utiliser pour toute vérification sur Légifrance, toute relecture d'obligation, et toute recherche de texte nouveau. Encode les pièges de Légifrance et les règles de rédaction du référentiel.
---

# Veille réglementaire

Ce référentiel n'accepte que des **sources primaires vérifiables**. Une
obligation qui ne peut pas être recoupée sur Légifrance ou l'INRS n'y entre
pas. Cette skill dit comment recouper sans se tromper.

## Avant tout : le travail a peut-être déjà été fait

**Ouvre `docs/journal-des-verifications.md` avant de lire quoi que ce soit.**

Il porte la chronologie des campagnes de vérification et le registre des
constats restés en suspens. Ce que tu t'apprêtes à ouvrir y figure peut-être
déjà — et alors ce qui manque n'est pas une lecture, c'est une décision.

`docs/etat-verification-referentiel.md` complète : pour chaque obligation, le
degré de vérification de ses sources, et l'ancre de veille qui manque ou non.
Il se régénère (`pnpm verification --ecrire`), un test le compare au fichier.

Ce n'est pas une formalité. Dans la nuit du 26 août 2026, six agents ont relu
123 articles à la source ; les relevés sont restés dans un compte rendu au lieu
d'entrer dans le corpus, et six jours plus tard personne ne savait plus si une
relecture avait eu lieu. `L. 4711-5` a été mis en cause quatre fois en onze
jours par quatre passages qui s'ignoraient.

## Ce que tu fais de ta lecture, et l'erreur à ne pas répéter

**Ton relevé va dans le corpus, pas dans un rapport.**

Un verbatim écrit dans un `.md` ne compte pour rien : ni pour la veille, ni
pour le dossier remis à un relecteur, ni pour l'agent suivant. Seuls les champs
d'`ArticleDepouille` sont lus par le produit et par les tests —
`prescrit`, `citationCle`, `versionEnVigueur`, `luLe`, `lecture`.

Le contrôle est mesurable : après ton passage, le nombre d'obligations sans
verbatim doit avoir baissé (`pnpm relecture`). S'il n'a pas bougé, ton travail
est invisible, quelle que soit sa qualité.

Et **`versionConstatee`, sur la référence de l'obligation, n'est pas la même
chose que `versionEnVigueur`, sur l'article de corpus**. La première est
l'ancre de veille — elle dit contre quelle version l'obligation a été écrite,
et c'est elle qui permettra un jour de détecter que le texte a bougé. Renseigne
les deux ; en omettre une laisse la moitié du travail invisible.

## La règle qui prime sur toutes les autres

**Tu rends des sources, pas des conclusions.**

Ton travail s'arrête au constat : « tel article dit ceci, dans cette version,
à cette date, voici l'URL ». Tu ne modifies jamais le référentiel toi-même, et
tu ne conclus jamais qu'un établissement est conforme ou ne l'est pas.

Si tu ne trouves pas, écris **« non trouvé »**. Ne comble jamais par
déduction, par mémoire, ou par ce qu'un site professionnel affirme. Une
référence inventée se propage dans un produit à valeur légale et ressort sur
un document présenté à une commission de sécurité.

## Les pièges de Légifrance, constatés

**`curl` et `fetch` reçoivent un 403.** Le site refuse les clients HTTP
ordinaires, même avec un User-Agent de navigateur. Utilise `WebFetch`.
N'essaie pas de contourner par un script.

**Les URL `article_lc` ne rendent souvent qu'une table des matières.** Si
`WebFetch` sur `/codes/article_lc/LEGIARTI…` ne rend pas le texte, bascule sur
la page de section, qui est rendue côté serveur :

    https://www.legifrance.gouv.fr/codes/section_lc/<LEGITEXT>/<LEGISCTA>/

Ces URL acceptent une date en suffixe, ce qui permet aussi de lire une
**version future** d'un article.

**Distingue trois dates**, elles ne disent pas la même chose :
- la date d'entrée en vigueur de la **version en vigueur** — c'est elle qui va
  dans `versionConstatee` ;
- la date d'une **version future programmée** — elle va dans `relectureDue`,
  jamais dans `versionConstatee` ;
- la date du texte modificateur (loi, décret, arrêté), utile pour la note.

**Un renvoi peut pointer vers une numérotation abrogée.** L'arrêté du
25 juin 1980 renvoie encore à `R. 123-11` du CCH, abrogé par la recodification
de 2021. Signale-le, ne le recopie pas comme s'il était en vigueur.

## La méthode, pour une référence

1. Ouvrir l'URL avec `WebFetch`, demander le **verbatim intégral** et la date
   de version.
2. Comparer au `versionConstatee` enregistré. S'il n'y en a pas, tout est à
   vérifier.
3. Comparer le verbatim à la `description` de l'obligation, **phrase par
   phrase**. C'est là que se trouvent les vrais manques : un article peut
   n'avoir pas changé depuis des années et contenir une phrase que personne
   n'a jamais lue. L'article L. 4121-3 impose depuis mars 2022 que
   l'évaluation « tient compte de l'impact différencié de l'exposition au
   risque en fonction du sexe » — le produit citait l'article et ignorait
   cette phrase.
4. **Relever le chemin hiérarchique complet** — Livre, Titre, Chapitre,
   Section — en même temps que le verbatim. Légifrance l'affiche en tête de
   page. Ce n'est pas décoratif : c'est lui qui dit si l'article tombe sous
   une exclusion.

   Exemple vécu, et l'erreur qui va avec. Les articles MS 45 à MS 52 se
   trouvent sous « Livre II : Dispositions applicables aux établissements des
   quatre premières catégories > Titre Ier : Dispositions générales >
   Chapitre XI > Section 4 ». Et PE 1 § 1 écarte le Livre II entier en 5ᵉ
   catégorie. Donc pas de service de sécurité incendie au sens MS 46 en 5ᵉ.

   Sans ce relevé, on déduit. Quelqu'un a conclu du champ de PE 1 que « le
   Livre II, ce sont les dispositions particulières par type » — la
   conclusion tombait juste par accident, la raison était fausse, et une
   raison fausse se réutilise ailleurs où elle ne tombera pas juste.

5. Vérifier le **champ d'application**, qui se lit rarement dans l'article
   lui-même : il vient souvent d'un renvoi en chaîne (R. 4227-39 → R. 4227-37
   → R. 4227-34), qu'il faut remonter jusqu'au bout.
6. Rendre : référence, URL, date de version, chemin hiérarchique, verbatim, et
   **l'écart** avec ce qu'encode le référentiel — ou « aucun écart ».

## Une lecture indirecte n'est pas une lecture

Les reproductions consolidées du droit — bases professionnelles, sites
spécialisés, miroirs — sont commodes parce qu'elles se laissent lire là où
Légifrance résiste. Elles ne valent pas source.

Lire deux reproductions concordantes ne fait pas une vérification : elles
peuvent dériver du même relevé, et aucune ne porte la date de version faisant
foi. Une référence n'entre au référentiel qu'après lecture du texte sur
Légifrance. Si tu n'as pu lire qu'indirectement, dis-le en toutes lettres et
classe le résultat comme piste, pas comme constat.

## Chercher ce qui est nouveau

L'inventaire des références ne trouve que ce qu'on cite déjà. Pour les textes
qu'on ne connaît pas encore :

- **Journal officiel** et Légifrance (rubrique des derniers textes parus)
- **INRS** — actualités et fiches, source institutionnelle citable
- **travail-emploi.gouv.fr** et **service-public.fr / entreprendre**

Les sites professionnels payants peuvent servir de **signal** — « il s'est
passé quelque chose dans ce domaine » — mais leur contenu ne se recopie pas :
ce sont des bases commerciales, et le repo l'interdit explicitement. Remonte
toujours au texte officiel avant de rapporter quoi que ce soit.

## Le périmètre du produit

Inutile de rapporter ce qui est hors champ. Sont **couverts** : restauration,
commerce de détail, bureau ; électricité, incendie, aération, cuisson et
hottes, ascenseurs, portes et portails, équipements sous pression, stockage de
matières dangereuses, levage, fluides frigorigènes.

Sont **hors périmètre** : IGH, ICPE complexes, ATEX, rayonnements ionisants,
équipements sportifs, piscines. Un texte qui ne concerne qu'eux se signale en
une ligne, sans développement.

## Outils

`pnpm veille` rend la liste de travail : les références jamais constatées ou
constatées il y a longtemps, triées par criticité, avec leurs URL.
`pnpm veille --json` pour la consommer, `--limite N` pour en prendre une part.

Le script ne va sur aucun réseau — c'est toi qui lis les textes.
