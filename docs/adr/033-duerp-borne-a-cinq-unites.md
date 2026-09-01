# ADR-033 — Le DUERP est borné à cinq unités de travail

- **Statut** : acceptée, 2026-09-01 (réunion d'équipe)
- **Portée** : `src/lib/duerps/actions.ts`, `src/lib/duerps/import/`
- **Découle de** l'ADR-025

## Le problème

Rien ne limitait le nombre d'unités de travail d'un DUERP. Le cadrage du
2026-09-01 le borne à cinq — c'est la décision la plus simple à implémenter du
recadrage, et la plus lourde de conséquences commerciales : elle fixe la taille
d'entreprise que le produit accepte de servir.

Cinq postes n'est pas cinq salariés. Une TPE de six personnes peut n'avoir que
deux unités ; un commerce de trois peut en avoir quatre.

## La décision

**Cinq unités de travail au plus, *hors* l'unité « Risques transverses ».**

La précision n'est pas cosmétique. L'unité transverse est créée
systématiquement à l'ouverture du DUERP et l'écran des unités la masque déjà.
Deux des trois référentiels sectoriels — restauration et bureau — pré-remplissent
exactement cinq unités : les compter avec la transverse ferait échouer le
pré-remplissage dès la première étape, pour un dossier parfaitement dans la
cible.

**La borne est posée aux quatre endroits qui écrivent une unité**, pas seulement
au formulaire d'ajout : la création du DUERP, le choix du secteur, l'ajout
manuel, et l'import d'un DUERP existant. Le quatrième est celui qu'on oublie ;
c'est aussi celui qui peut faire entrer douze unités d'un coup.

**À l'import, on refuse en nommant la limite. On ne tronque pas.** Tronquer
silencieusement un document que le dirigeant a apporté lui ferait perdre des
risques évalués sans qu'il le sache — le contraire exact de ce que le produit
promet.

## Ce qu'il faudrait mesurer, et qui ne l'a pas été

L'ADR-025 le disait : « la limite doit sortir d'une mesure, pas d'une
intuition ». Combien d'unités portent les dossiers réels ? La question n'a pas
reçu de réponse chiffrée avant que la décision soit prise. Elle reste ouverte, et
c'est le premier chiffre à regarder si la borne se met à gêner : cinq est un
choix de cadrage, pas un résultat d'observation.
