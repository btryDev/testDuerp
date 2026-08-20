# ADR-010 — Registre de sources d'échéances du calendrier

Date : 2026-08-10
Statut : accepté — **amendé par l'ADR-017** (le permis de feu et le plan de
prévention ont quitté la famille `travaux` pour une famille `operations` ;
le tableau ci-dessous est à jour de cet amendement).

## Contexte

Le calendrier de la page « Vérifications périodiques » mêle désormais
plusieurs natures d'échéances (vérifications d'équipements, actions
correctives, signalements, mise à jour du DUERP, attestations
prestataires…), classées en **grandes familles** stables pensées pour un
dirigeant non-expert :

- `controle` — faire vérifier (vérifications périodiques, analyses
  légionelles) ;
- `travaux` (libellé « Corrections & réparations ») — réparer, corriger un
  écart constaté ;
- `operations` (libellé « Opérations encadrées ») — mener un chantier daté
  dont le préalable est obligatoire (ajoutée par l'ADR-017) ;
- `papiers` (libellé « Documents à renouveler ») — tenir ses documents à
  jour ;
- `personnel` — réservée aux modules à venir (visites médicales,
  formations, habilitations).

Première implémentation : une fonction unique qui interrogeait quatre
tables en dur. Chaque nouveau module porteur de dates (permis de feu,
plan de prévention, carnet sanitaire — et demain le suivi du personnel)
obligeait à retoucher cette fonction, avec le risque qu'un module
« oublie » de verser ses échéances : le calendrier aurait alors menti
par omission, ce que le produit s'interdit.

## Décision

**Toute échéance datée du produit passe par un registre de sources**
(`SOURCES_ECHEANCES`, `src/lib/calendrier/echeances.ts`) :

- une **source** = un module qui sait lister ses échéances datées, sous
  un format unique `EcheanceCalendrier` (famille, libellé, origine en
  langage courant, date, ton d'urgence, porte vers le module) ;
- l'agrégateur `listerAutresEcheances` ne fait qu'itérer le registre,
  fusionner et trier — il ne connaît aucun module ;
- l'aval est **piloté par la donnée** : le panneau de filtres, la
  légende et la liste ne montrent que les familles effectivement
  présentes. Brancher un module = écrire sa source + l'ajouter au
  registre, rien d'autre à retoucher.

Chaque classement par date est une **fonction pure testée** (horloge
injectée), conformément au principe zéro-IA / déterminisme.

## Sources branchées

| Source | Famille | Date | Règle |
|---|---|---|---|
| Vérifications périodiques | controle | `datePrevue` | moteur de matching (hors registre : flux historique dédié) |
| Analyse légionelles | controle | dernière analyse + 1 an | arrêté du 1er février 2010 (déjà cité au module) |
| Actions correctives | travaux | `echeance` | statuts ouverte / en cours |
| Permis de feu | operations | `dateDebut` | non terminés/annulés ; alerte si la date de début est passée sans être en cours |
| Plans de prévention | operations | `dateDebut` | opérations non finies ; alerte si commencé sans inspection commune (R. 4512-7) |
| Mise à jour DUERP | papiers | dernière version + 1 an | R. 4121-2 |
| Attestations prestataires | papiers | `valableJusquA` URSSAF / RC Pro | vigilance L. 8222-1 |

## Exclusions documentées (et pourquoi)

- **Relevés de température ECS** : rythme hebdomadaire (seuil produit
  `SEUIL_RELEVE_CARNET_JOURS` = 7 j) — trop fréquent pour un calendrier
  mensuel, suivi par le module et la matrice d'obligations.
- **Formation du personnel d'accueil (accessibilité)** et **maintenance
  des équipements d'accessibilité** : pas de périodicité légale unique
  vérifiable → pas d'échéance inventée (règle n°6 du projet).
- **Kbis** : informatif, sans date-cible (choix ADR-007 / vigilance).
- **Tokens d'accès, signatures** : dates techniques, pas des obligations.

## Conséquences

- Un futur module (ex. visites médicales) livre sa source avec sa
  famille (`personnel`) et apparaît partout d'un coup : calendrier,
  filtres, légende, liste.
- Le widget calendrier du board consomme le même format ; sa bascule
  vers les familles complètes reste à faire (décision d'affichage, pas
  d'architecture).
- Toute nouvelle colonne datée du schéma doit être soit branchée en
  source, soit ajoutée aux exclusions ci-dessus — un champ date orphelin
  non documenté est un bug de revue.
