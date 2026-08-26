---
name: veille-reglementaire
description: Vérifier qu'une référence réglementaire du référentiel est toujours à jour, ou chercher ce qui a changé dans le droit de la santé-sécurité au travail. À utiliser pour toute vérification sur Légifrance, toute relecture d'obligation, et toute recherche de texte nouveau. Encode les pièges de Légifrance et les règles de rédaction du référentiel.
---

# Veille réglementaire

Ce référentiel n'accepte que des **sources primaires vérifiables**. Une
obligation qui ne peut pas être recoupée sur Légifrance ou l'INRS n'y entre
pas. Cette skill dit comment recouper sans se tromper.

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
4. Vérifier le **champ d'application**, qui se lit rarement dans l'article
   lui-même : il vient souvent d'un renvoi (R. 4227-39 → R. 4227-37 →
   R. 4227-34) ou de la place du texte dans la hiérarchie (les articles MS
   relèvent du Livre II, écarté en 5ᵉ catégorie par PE 1 § 1).
5. Rendre : référence, URL, date de version, verbatim, et **l'écart** avec ce
   qu'encode le référentiel — ou « aucun écart ».

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
