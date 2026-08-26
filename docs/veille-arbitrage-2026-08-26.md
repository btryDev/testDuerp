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
