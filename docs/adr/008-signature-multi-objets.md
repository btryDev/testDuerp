# ADR-008 — Signature électronique sur objets non-fichier (JSON canonique)

- **Date** : 2026-04-23
- **Statut** : Acceptée
- **Auteur** : Claude Code (sur brief Paloma)
- **Relatif à** : ADR-006 (signature électronique)

## Contexte

L'ADR-006 a posé le principe de signature électronique eIDAS « simple » en
s'appuyant sur le **hash SHA-256 du document signé**. Ce hash garantit
l'intégrité : si un octet du document change après signature, la page
`/verifier/[signatureId]` détecte l'écart et la signature est invalidée.

Au moment de l'ADR-006, le seul objet signable réellement câblé était le
**rapport de vérification** : un fichier PDF uploadé. Le hash se calcule
trivialement comme SHA-256 du contenu binaire lu depuis `FileStorage`.

Depuis, les modules **permis de feu** et **plan de prévention** ont été
livrés. Ces objets ne sont **pas des fichiers** mais des **structures en
base** (lignes Prisma avec des relations). On souhaite néanmoins y apposer
des signatures (donneur d'ordre + prestataire / EU + EF) avec la même
valeur probante que pour les rapports.

Question : **sur quoi calcule-t-on le hash** d'un objet qui n'est pas un
binaire stable ?

## Décision

Chaque type d'objet signable fournit une **représentation canonique JSON**
qui sert d'entrée au SHA-256. Cette représentation respecte trois règles :

1. **Champs inclus** : uniquement les champs qui portent l'acte juridique
   (identités des parties, dates, lieu, nature des travaux, ligne de
   matrice risques/mesures…). On exclut les champs de cycle de vie
   (`statut`, `createdAt`, `updatedAt`, `dateCloture`) et les signatures
   elles-mêmes — ils peuvent évoluer après signature sans altérer l'accord
   initial.
2. **Ordre stable** : les clés sont sérialisées dans un ordre déterministe
   (alphabétique via `Object.keys(obj).sort()` ou liste explicite). Sinon
   l'ordre de Prisma ou l'ordre de déclaration du schéma pourrait changer
   et casser tous les hash existants.
3. **Relations** : les listes liées (ex. `lignes` d'un plan de prévention)
   sont triées par leur `ordre` et sérialisées comme sous-objets avec la
   même discipline canonique.

### Implémentation centralisée — `calculerHashObjet`

Toute la logique est regroupée dans une unique fonction côté serveur :

```ts
// src/lib/signatures/actions.ts

export async function calculerHashObjet(
  objetType: ObjetSignable,
  objetId: string,
): Promise<HashResult> {
  if (objetType === "rapport_verification") {
    // Hash du fichier binaire via FileStorage
    // …
  }
  if (objetType === "plan_prevention") {
    const plan = await prisma.planPrevention.findUnique({ ... });
    const canonique = JSON.stringify({
      numero: plan.numero,
      entrepriseExterieureRaison: plan.entrepriseExterieureRaison,
      // … champs immuables listés explicitement
      lignes: plan.lignes.map((l) => ({ … })),  // triées par ordre
    });
    return { ok: true, hash: sha256Hex(canonique), nomDocument: "Plan …" };
  }
  if (objetType === "permis_feu") {
    // idem
  }
  return { ok: false, raison: "non_implemente" };
}
```

Chaque nouveau type de `ObjetSignable` ajoute un `if` dans cette fonction
avec sa propre sérialisation canonique. Un type non encore câblé renvoie
`non_implemente`, ce qui est remonté proprement côté UI (page publique
de signature qui affiche « non disponible »).

### Règle sur les champs versionnés

Un champ **ne doit jamais être ajouté en fin de sérialisation** sans
bumper le type d'objet. Si on veut étendre la structure signable (ex.
ajouter un champ `dureeSurveillanceMinutes` à `permis_feu`), il faut :

- soit décider que ce champ fait partie de l'acte → nouvelle version
  implicite, les anciennes signatures deviennent invalides (documenter
  côté UI et proposer une re-signature)
- soit décider qu'il est hors-acte → ne pas l'inclure dans le canonique
  (cas par défaut pour tout champ secondaire)

En pratique, au MVP, toute la sérialisation est explicite dans le code —
pas d'introspection automatique Prisma. On préfère la verbosité à la
magie.

## Conséquences

### Positives
- Intégrité vérifiable sur tout type d'objet, pas seulement les fichiers.
- Vérification rejouable côté serveur en 10 ms (simple relecture DB + hash).
- L'ajout d'un nouveau module signable est un `if` de 20 lignes — pas de
  refonte.
- La page `/verifier/[signatureId]` fonctionne de manière identique pour
  tous les types d'objets → une seule UX à maintenir.

### Négatives / coûts
- Ajouter un champ « acte » à un objet signé (ex. nouvelle colonne dans
  le plan de prévention) casse toutes les signatures antérieures. À
  l'époque du MVP c'est acceptable (peu de volume) ; plus tard il faudra
  peut-être versionner explicitement (`canoniqueV1`, `canoniqueV2`…).
- Risque de régression silencieuse si quelqu'un modifie la fonction
  `calculerHashObjet` sans comprendre. **Tests unitaires renforcés**
  s'imposent sur chaque variante.
- L'objet original reste en base et peut être modifié par erreur (ex.
  mise à jour d'un champ hors-acte qui ne devrait pas l'être). La
  signature ne bloque pas les mutations — elle les **trace** en les
  invalidant. Compromis assumé : on préserve l'éditabilité pour correction
  de coquille post-signature, au prix d'une vigilance humaine.

### Neutres
- La représentation canonique n'a pas vocation à être affichée à
  l'utilisateur. Elle n'est pas un « document » consultable.

## Alternatives rejetées

### Alternative A — Générer un PDF au moment de la signature, en hasher le binaire
Rejetée : fragile. Tout changement du template de rendu PDF
(`@react-pdf/renderer`, typo, logo, espacement) modifierait le hash
même si l'acte lui-même n'a pas bougé. En plus on doublerait le coût
(génération + stockage PDF à chaque signature).

### Alternative B — Stocker un snapshot JSON complet au moment de la signature
Approche type `DuerpVersion.snapshot`. Lourde : chaque signature
dupliquerait l'objet. Vérification moins élégante (lire le snapshot vs
recalculer). Surtout : **ne détecte pas** les modifications post-signature
de l'objet vivant, ce qui est justement le comportement qu'on veut.

### Alternative C — Signer au niveau du champ (Merkle-tree)
Permettrait de dire « la signature couvre les champs A/B/C, pas D ». Trop
complexe pour le bénéfice au MVP. À garder en tête si un jour un usage
exige ce niveau de granularité.

### Alternative D — Introspection automatique via Prisma (serializer générique)
Semble propre mais très piégeux : les champs relationnels, les enums
sérialisés différemment en dev/prod, les champs Date/Decimal… On préfère
du code explicite.

## Checklist de mise en œuvre

Pour ajouter un nouveau type d'objet signable :

1. Ajouter la valeur dans l'enum `ObjetSignable` (schema Prisma +
   migration SQL).
2. Étendre la fonction `calculerHashObjet` dans
   `src/lib/signatures/actions.ts` avec un nouveau `if` listant
   **explicitement** les champs à inclure.
3. Si l'objet a des relations (lignes, points…), trier par un champ
   `ordre` stable et les sérialiser en sous-objets.
4. Exposer un endpoint ou une page qui déclenche
   `demanderSignature({ objetType: "nouveau_type", objetId })`.
5. Afficher les signatures posées via `<SignatureBlock />` avec lien
   vers `/verifier/[signatureId]`.
6. Tests unitaires : le hash doit être **stable** entre deux lectures
   successives du même objet (pas de variance induite par l'ordre des
   clés Prisma ou du fuseau Date).

## Notes de conformité

- La valeur probatoire reste celle posée par l'ADR-006 (eIDAS simple,
  art. 1366-1367 C. civ.). Ce que change cet ADR, c'est l'**intégrité**
  du procédé : on démontre que si l'acte change, la signature est
  invalidée.
- Le hash SHA-256 d'une chaîne UTF-8 JSON canonique est au moins aussi
  robuste que le hash d'un PDF — les deux sont des séquences d'octets
  traitées de manière identique par la fonction cryptographique.
- En cas de contestation (« le plan signé ne correspond pas à ce qui
  était prévu »), la page `/verifier/[id]` recalcule le hash depuis la
  base et l'affiche visuellement — rouge si désaccord, avec les deux
  empreintes côte à côte.
