# Arbitrage du 26 août 2026 — domaine incendie et Livre III

Ce que la première passe de veille a remonté, et ce qui en a été fait.
Trois sources : deux audits du domaine `incendie` (28 références), et le
dépouillement intégral du Livre III du règlement de sécurité ERP (58 articles).

## Appliqué

**MS 38 — paragraphe et périodicité corrigés.** L'obligation citait le § 2, qui
traite du marquage de l'appareil. La vérification est au § 4, relu en verbatim
le 2026-08-26 : « Un extincteur doit faire l'objet d'une vérification annuelle
et d'une révision tous les dix ans par une personne ou un organisme compétent. »

La description encodait la révision « selon les préconisations du fabricant » —
c'est la règle APSAD R4, que l'en-tête du fichier déclare lui-même non
opposable. Le texte fixe une périodicité chiffrée ; elle remplace la règle
privée. `realisateurs` gagne `organisme_agree` : le texte dit « une personne
**ou** un organisme ». L'étiquette datée et le plan d'implantation au registre,
qu'imposait le même paragraphe, sont ajoutés à la description.

**Sur-application en 5ᵉ catégorie, rendue visible sur six obligations.**
`incendie-erp-extincteurs-annuelle`, `-ssi-annuelle`, `-baes-annuelle`,
`-desenfumage-annuelle` et les deux d'éclairage de sécurité s'appuient sur des
articles du Livre II, que PE 1 § 1 écarte en 5ᵉ catégorie. Le dépouillement l'a
confirmé définitivement : PE 26 n'ouvre le Livre II que sur MS 39, PE 27 que
sur MS 70 — aucun article de vérification.

**Les lignes sont maintenues, délibérément.** Les restreindre à N1–N4
supprimerait les échéances de 100 % de la base utilisateurs, qui est
intégralement en N5 : ce serait créer un faux négatif muet pour corriger une
citation. La doctrine du dépôt tranche dans l'autre sens — sur-application
visible et corrigeable plutôt que faux négatif silencieux. Chaque obligation
porte donc désormais la note qui dit ce qui la fonde réellement en N5 : PE 4
§ 2 côté ERP, le Code du travail côté employeur.

Seule `incendie-erp-ria-annuelle` portait déjà cette note ; `-ssi-triennale`
était correctement bornée à N1–N4.

## Différé, avec la raison

**Visite de commission en 5ᵉ catégorie.** Deux défauts établis :
`CCH R. 143-34` ne fonde pas les visites (il porte l'obligation de vérification
à la charge de l'exploitant) et son équivalence « ex R. 123-48 » est fausse ;
`GE 4` exclut expressément la 5ᵉ catégorie. Le dépouillement a trouvé la source
manquante — **PE 37**, visite quinquennale — mais elle ne vise que les
établissements **comportant des locaux à sommeil**.

Non corrigé : je n'ai pas pu lire en première main l'article du CCH qui fonde
les visites périodiques (une tentative est tombée sur R. 143-36, sans rapport).
Corriger une référence sans l'avoir lue serait exactement ce que la règle du
dépôt interdit. À reprendre avec l'article vérifié.

**Vérification triennale du désenfumage.** DF 10 § 3 impose une vérification
triennale par organisme agréé quand coexistent un désenfumage mécanique et un
SSI de catégorie A ou B. Aucune obligation ne la porte, alors que le pendant
SSI a bien sa ligne triennale. C'est une obligation à créer, pas une correction
— et sa condition (« désenfumage mécanique ET SSI catégorie A ou B ») n'est pas
représentable par les propriétés d'équipement actuelles.

**PE 4 § 2 — l'obligation manquante qui compte le plus.** Entretien et
vérification de l'ensemble des installations techniques, « tous les trois ans
au plus », par techniciens compétents. En vigueur depuis le 1ᵉʳ juillet 2026,
applicable à 100 % de la base — PE 2 § 3 la maintient jusqu'aux établissements
de moins de vingt personnes.

Inencodable en l'état : son porteur est l'établissement et non un équipement,
et sa liste d'installations est ouverte (« etc. »), traversant six des dix
domaines. `categoriesEquipement` est requis et `Verification.equipementId`
n'est pas nullable. Relève de l'ADR sur le porteur d'échéance, instruit
ailleurs.

**PE 4 § 1** — contrat annuel d'entretien du système de détection, restreint aux
établissements **avec locaux à sommeil**. Même obstacle de porteur, plus un
attribut d'établissement qui n'existe pas en base. Quatre articles du Livre III
s'y adossent (PE 4, PE 28, PE 32, PE 37) : ce n'est pas un cas isolé.

**R. 4227-29 — les seuils chiffrés non exploités.** « Il existe au moins un
extincteur portatif à eau pulvérisée d'une capacité minimale de 6 litres pour
200 mètres carrés de plancher. Il existe au moins un appareil par niveau. »
Directement exploitable par le produit, absent de l'encodage. Ce n'est pas une
échéance mais une règle de dimensionnement — le référentiel n'a pas de place
pour ce genre de règle aujourd'hui.

**L. 4711-5.** Deux lectures indépendantes confirment qu'il autorise à réunir
des registres et n'en institue aucun. La référence a été retirée des mentions
des PDF le même jour ; reste à décider ce qui fonde la ligne « tenue du
registre » côté travail — R. 4227-39 la fonde pour les exercices, pas pour le
registre en général.

## Ce que la passe a coûté et rapporté

28 références lues, 16 écarts. 58 articles du Livre III dépouillés, dont un
seul crée une obligation périodique pour les secteurs couverts. Cinq articles
du Livre III sur cinquante-huit ont changé depuis moins de huit mois.

Aucune de ces trouvailles n'aurait été faite par une veille sur les
changements : R. 143-44 mis à part, toutes portent sur des textes qui n'ont pas
bougé et que personne n'avait lus jusqu'au bout.

---

# Seconde passe — levage et électricité

## À décider, par ordre de gravité

**R. 4544-10 et R. 4544-11 ont été réécrits au 1ᵉʳ octobre 2025** (décret
n° 2025-355 du 18 avril 2025), et deux articles ont été créés, R. 4544-11-1 et
R. 4544-11-2. L'habilitation autorisant les opérations au voisinage de pièces
nues sous tension est désormais subordonnée à une **attestation d'absence de
contre-indications médicales, d'une validité de cinq ans**, dont l'employeur
conserve copie. C'est une obligation périodique, encodable, et absente.

Le référentiel ne l'a pas vue pour une raison mécanique : sa référence pointe
`LEGIARTI000022849102`, qui est R. 4544-9 — le seul des trois articles cités
qui n'a pas bougé. Une lecture par date sur cette URL ne montre rien. C'est
l'argument le plus net en faveur d'un `versionConstatee` par article plutôt que
par obligation.

**La dérogation à deux ans n'est pas encodée.** Arrêté du 26 décembre 2011,
art. 3 : « le délai entre deux vérifications peut être porté à deux ans par le
chef d'établissement si le rapport précédent ne présente aucune observation ou
si […] les travaux de mise en conformité ont été réalisés », sous réserve d'une
LRAR à l'inspection du travail. Un exploitant sans observation est donc affiché
en écart un an trop tôt. C'est un faux positif, qui coûte au dirigeant.

**Les hayons élévateurs sont vérifiés tous les douze mois au lieu de six.**
Arrêté du 1ᵉʳ mars 2004, art. 23 a) renvoie à toute la liste de l'art. 20-II,
qui comprend les hayons élévateurs, les monte-meubles et les monte-matériaux de
chantier. La condition encodée ne retient que `estChariotOuGerbeur`. C'est une
sous-application, donc un faux négatif — et l'en-tête du fichier range
pourtant les hayons dans le périmètre.

**Aucune périodicité trimestrielle n'existe.** Art. 23 b) : trois mois pour les
appareils mus par la force humaine employée directement servant à déplacer en
élévation un poste de travail. Et la condition « mus par une énergie autre que
la force humaine » qui sépare le a) du b) est omise de la description du
semestriel.

**La condition de l'épreuve initiale est inversée.** Le référentiel réserve les
épreuves statique et dynamique aux appareils *non* conçus pour lever des
personnes ; l'art. 14 d) dit l'inverse — l'épreuve dynamique n'est pas exigée
pour les appareils à force humaine *sauf s'ils sont conçus pour lever des
personnes*. L'agent n'a pu lire l'art. 14 qu'en partie : à relire avant
correction.

**EL 18 § 4 porte des échéances de quinze jours et mensuelles**, encodées sous
`periodicite: "annuelle"`. Elles ne produiront jamais d'échéance calculée.

**Deux obligations électricité de plus s'appuient sur le Livre II sans le
documenter** — `elec-erp-mise-en-service` et `elec-erp-groupe-electrogene-annuel`.
Même traitement que les six du domaine incendie.

## Corrigé — le texte dit, on suit

La formule « décision produit » employée plus haut était une échappatoire.
Quand un texte fixe une périodicité, il n'y a rien à arbitrer.

**Les deux références de l'arrêté du 26 décembre 2011 étaient interverties.**
La mise en service citait « art. 3 à 5 » — soit périodique, temporaire et
inspecteur — et la vérification périodique citait « art. 1 et 2 » — soit objet
et initiale. Aucune ne pointait l'article qui la fonde. Corrigé en art. 2 et 6
d'une part, art. 3 de l'autre.

**La dérogation à deux ans est désormais écrite**, en note de la référence,
avec son verbatim et ses deux conditions. Elle ne change pas la périodicité
encodée — c'est une faculté du chef d'établissement, subordonnée à une LRAR à
l'inspection, donc un acte de l'exploitant et non une règle de calendrier. Mais
elle cesse d'être invisible.

**EL 18 § 4 passe de « annuelle » à « mensuelle ».** Le texte impose des
vérifications tous les quinze jours et un essai de démarrage mensuel sous
charge ; « annuelle » ne produisait aucune de ces échéances. Le libellé devient
« Entretien et essais des groupes électrogènes de sécurité ». L'échéance de
quinze jours reste non représentable — l'énumération `Periodicite` ne descend
pas sous la semaine.

**Les deux obligations électricité fondées sur le Livre II** portent désormais
la note qui dit ce qui les fonde réellement en 5ᵉ catégorie, comme les six du
domaine incendie.

**R. 4544-11-1 est inscrit au corpus en « obligation manquante ».** L'attestation
médicale quinquennale est en vigueur et le référentiel ne la porte pas ; elle
est nominative, donc bloquée par le porteur d'échéance. Elle n'est plus
invisible : elle est comptée.

## Correction d'une alerte que j'ai exagérée

J'ai rapporté que les hayons élévateurs recevaient douze mois au lieu de six.
C'est inexact. La question posée au dirigeant est « Cet appareil est-il un
chariot élévateur, un gerbeur **ou un hayon élévateur** ? » : un hayon déclaré
déclenche bien la semestrielle. L'agent avait lu la description de l'obligation
et le nom de la propriété, pas le formulaire, et je l'ai relayé sans vérifier.

Ce qui manque réellement à la liste de l'art. 20-II, pour nos secteurs : les
monte-meubles et les monte-matériaux de chantier. Les autres entrées — grues
auxiliaires, grues à tour, engins de terrassement, tracteurs poseurs de
canalisations — relèvent du BTP, hors périmètre déclaré.

## Reste à instruire

La périodicité trimestrielle de l'art. 23 b) — trois mois pour les appareils
mus par la force humaine servant à déplacer en élévation un poste de travail —
demande une propriété d'équipement qui n'existe pas. Créer l'obligation
supposerait d'inventer la question ; je ne l'ai pas fait.

L'épreuve initiale (art. 14) : la condition encodée paraît inversée par rapport
au texte, mais l'agent n'a pu lire l'article qu'en partie. À relire en première
main avant de toucher à quoi que ce soit.

## Confirmations utiles

GE 6 et GE 7 portent une **fin de version au 1ᵉʳ juin 2027**, modificateur
annoncé : arrêté du 19 février 2026. Cela corrobore l'entrée déjà inscrite dans
`TEXTES_A_VENIR` à partir d'une lecture indépendante.

R. 4226-20 est passé en version du 25 décembre 2025 : il ouvre la tenue
dématérialisée du registre électrique. Non cité par le référentiel.
