-- Intégrité référentielle et conservation — fondation des correctifs d'intégrité.
--
-- Six chantiers, tous motivés par un écart entre ce que le code affirme et ce
-- que la base garantit :
--
--   1) Clé d'idempotence du calendrier de vérifications. Le générateur produit
--      déjà une clé « obligationId::equipementId » qui n'était jamais
--      matérialisée : la régénération passait par delete + create.
--   2) Conservation 40 ans du DUERP (art. R. 4121-4 CT, docs/rgpd.md) : la
--      chaîne Etablissement → Duerp → DuerpVersion était en cascade complète.
--   3) Invariants « 1 user → 1 entreprise → 1 établissement → 1 DUERP », qui
--      n'étaient affirmés que par des findFirst + create non atomiques.
--   4) Expiration propre du code OTP (10 minutes annoncées, jamais appliquées).
--   5) Quatre pseudo-clés étrangères (colonnes *Id sans contrainte) qui
--      laissaient des enregistrements pointer dans le vide.
--   6) Index manquant sur UniteTravail.duerpId, index redondant sur
--      RegistreAccessibilite.slugPublic.
--
-- PRINCIPE DE SÛRETÉ : cette migration ne détruit jamais de donnée métier en
-- silence. Partout où une contrainte pourrait entrer en conflit avec des lignes
-- existantes, on détecte d'abord ; on ne supprime que ce qui est prouvablement
-- vide ; sinon on lève une exception explicite et la transaction est annulée.
-- Une migration qui échoue bruyamment se rejoue ; une donnée légale perdue, non.

BEGIN;

-- ============================================================================
-- 1) Verification : clé d'idempotence (etablissementId, obligationId, equipementId)
--
--    Déduplication préalable. Gagnant par triplet, dans l'ordre :
--      a. une vérification réalisée l'emporte sur une simple occurrence prévue,
--         et la plus récemment réalisée l'emporte entre deux — c'est ce que
--         fait `dateRealisee DESC NULLS LAST` en un seul critère
--      b. à défaut, la plus récemment modifiée
--      c. `id` en dernier ressort, pour un résultat déterministe et rejouable
--
--    Toutes les colonnes de l'ORDER BY figurent au SELECT : sous DISTINCT ON,
--    Postgres refuse d'ordonner sur une expression absente de la liste.
-- ============================================================================

CREATE TEMP TABLE _verif_gagnante ON COMMIT DROP AS
SELECT DISTINCT ON ("etablissementId", "obligationId", "equipementId")
    "id",
    "etablissementId",
    "obligationId",
    "equipementId",
    "dateRealisee",
    "updatedAt"
FROM "Verification"
ORDER BY
    "etablissementId",
    "obligationId",
    "equipementId",
    "dateRealisee" DESC NULLS LAST,
    "updatedAt" DESC,
    "id" ASC;

CREATE TEMP TABLE _verif_perdante ON COMMIT DROP AS
SELECT v."id", v."etablissementId", v."obligationId", v."equipementId"
FROM "Verification" v
WHERE NOT EXISTS (SELECT 1 FROM _verif_gagnante g WHERE g."id" = v."id");

-- Garde-fou preuve : un RapportVerification est une pièce déposée par un
-- organisme, elle ne se reconstitue pas. Si l'arbitrage ci-dessus condamne une
-- occurrence qui en porte un, on refuse de continuer : c'est à un humain de
-- décider quelle occurrence conserver.
DO $$
DECLARE preuves INTEGER;
BEGIN
    SELECT COUNT(*) INTO preuves
    FROM "RapportVerification" r
    JOIN _verif_perdante p ON p."id" = r."verificationId";

    IF preuves > 0 THEN
        RAISE EXCEPTION
            'Migration abandonnée : % rapport(s) de vérification sont portés par des occurrences en doublon (même établissement, même obligation, même équipement). Fusionner ces occurrences à la main — rattacher les rapports à l''occurrence à conserver — puis rejouer la migration.',
            preuves;
    END IF;
END $$;

-- Les actions correctives issues d'une occurrence condamnée sont réattachées à
-- l'occurrence conservée plutôt que supprimées par cascade : le constat métier
-- (« il faut faire ceci ») reste vrai indépendamment de l'occurrence qui l'a
-- fait naître. Pas de conflit possible avec l'unique (risqueId,
-- referentielMesureId) : ces actions ont risqueId NULL (XOR d'origine), et
-- Postgres considère les NULL comme distincts.
UPDATE "Action" a
SET "verificationId" = g."id"
FROM _verif_perdante p
JOIN _verif_gagnante g
    ON  g."etablissementId" = p."etablissementId"
    AND g."obligationId"    = p."obligationId"
    AND g."equipementId"    = p."equipementId"
WHERE a."verificationId" = p."id";

DELETE FROM "Verification" v
USING _verif_perdante p
WHERE v."id" = p."id";

CREATE UNIQUE INDEX "Verification_etablissementId_obligationId_equipementId_key"
    ON "Verification"("etablissementId", "obligationId", "equipementId");

-- ============================================================================
-- 2) Conservation 40 ans du DUERP — ON DELETE RESTRICT sur le maillon de preuve
--
--    Une DuerpVersion figée a valeur légale et doit être conservée 40 ans.
--    Avec la cascade complète, `prisma.etablissement.delete` (ou la suppression
--    de l'entreprise, qui cascade jusque-là) effaçait toutes les versions
--    archivées sans confirmation ni corbeille.
--
--    Le garde-fou porte sur le SEUL maillon qui porte la preuve :
--    `DuerpVersion.duerpId` passe en RESTRICT. `Duerp.etablissementId` reste en
--    CASCADE, et c'est suffisant : supprimer l'établissement tente de cascader
--    sur le Duerp, le RESTRICT de DuerpVersion s'y oppose, et toute la
--    transaction est annulée. Rien n'est perdu.
--
--    Mettre AUSSI Duerp.etablissementId en RESTRICT serait plus large que
--    l'obligation : un DUERP ouvert mais jamais validé ne porte aucune pièce à
--    conserver, et l'établissement deviendrait indélébile dès le premier clic
--    sur « Commencer mon DUERP », sans motif légal. Un garde-fou doit être
--    exactement aussi large que l'obligation qu'il sert (ADR-012, section C).
--
--    L'applicatif doit traduire l'erreur Postgres 23503 / Prisma P2003 en
--    message explicite (proposer l'export avant suppression).
-- ============================================================================

-- Duerp.etablissementId reste en CASCADE : on le redéclare explicitement pour
-- que la migration soit lisible seule et converge quelle que soit la variante
-- appliquée précédemment.
ALTER TABLE "Duerp" DROP CONSTRAINT "Duerp_etablissementId_fkey";
ALTER TABLE "Duerp"
    ADD CONSTRAINT "Duerp_etablissementId_fkey"
    FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DuerpVersion" DROP CONSTRAINT "DuerpVersion_duerpId_fkey";
ALTER TABLE "DuerpVersion"
    ADD CONSTRAINT "DuerpVersion_duerpId_fkey"
    FOREIGN KEY ("duerpId") REFERENCES "Duerp"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- 3) Invariants d'unicité
--
--    Le code affirme « 1 user → 1 entreprise → 1 établissement → 1 DUERP »
--    mais l'implémente par findFirst + create, sans atomicité. Quand deux
--    DUERP coexistent, chaque module en choisit un différent (createdAt desc,
--    updatedAt desc, ou aucun tri) : le tableau de bord peut lire un document
--    pendant que le wizard édite l'autre.
--
--    Pour Entreprise, Etablissement et Prestataire : détection seule. Ces
--    lignes portent toujours de la donnée saisie, l'arbitrage revient à un
--    humain.
--    Pour Duerp : les doublons prouvablement vides (aucune version, aucune
--    unité de travail, aucun secteur choisi, transverses non répondues) sont
--    supprimés — ce sont les coquilles créées par la course findFirst/create.
--    Tout doublon portant la moindre saisie fait échouer la migration.
-- ============================================================================

-- 3.a) Entreprise.userId ------------------------------------------------------

DO $$
DECLARE doublons INTEGER;
BEGIN
    SELECT COUNT(*) INTO doublons FROM (
        SELECT "userId"
        FROM "Entreprise"
        WHERE "userId" IS NOT NULL
        GROUP BY "userId"
        HAVING COUNT(*) > 1
    ) d;

    IF doublons > 0 THEN
        RAISE EXCEPTION
            'Migration abandonnée : % utilisateur(s) possèdent plusieurs entreprises. Fusionner ou réattribuer ces entreprises à la main (aucune suppression automatique : elles portent de la donnée saisie), puis rejouer la migration.',
            doublons;
    END IF;
END $$;

DROP INDEX "Entreprise_userId_idx";
CREATE UNIQUE INDEX "Entreprise_userId_key" ON "Entreprise"("userId");

-- 3.b) Etablissement.entrepriseId --------------------------------------------

DO $$
DECLARE doublons INTEGER;
BEGIN
    SELECT COUNT(*) INTO doublons FROM (
        SELECT "entrepriseId"
        FROM "Etablissement"
        GROUP BY "entrepriseId"
        HAVING COUNT(*) > 1
    ) d;

    IF doublons > 0 THEN
        RAISE EXCEPTION
            'Migration abandonnée : % entreprise(s) possèdent plusieurs établissements. Le multi-site est hors périmètre à ce jour : arbitrer à la main l''établissement à conserver et déplacer équipements, vérifications et registres avant de rejouer la migration.',
            doublons;
    END IF;
END $$;

DROP INDEX "Etablissement_entrepriseId_idx";
CREATE UNIQUE INDEX "Etablissement_entrepriseId_key" ON "Etablissement"("entrepriseId");

-- 3.c) Duerp.etablissementId --------------------------------------------------

-- Gagnant par établissement : le DUERP le plus rempli (versions d'abord, puis
-- unités de travail), à égalité le plus ancien — c'est celui vers lequel
-- pointent les liens déjà partagés.
-- Les compteurs sont calculés dans une sous-requête puis repris au SELECT :
-- sous DISTINCT ON, Postgres refuse d'ordonner sur une expression absente de
-- la liste de sélection.
CREATE TEMP TABLE _duerp_gagnant ON COMMIT DROP AS
SELECT DISTINCT ON (c."etablissementId")
    c."id",
    c."etablissementId",
    c."nbVersions",
    c."nbUnites",
    c."createdAt"
FROM (
    SELECT
        d."id",
        d."etablissementId",
        d."createdAt",
        (SELECT COUNT(*) FROM "DuerpVersion" v WHERE v."duerpId" = d."id") AS "nbVersions",
        (SELECT COUNT(*) FROM "UniteTravail" u WHERE u."duerpId" = d."id") AS "nbUnites"
    FROM "Duerp" d
) c
ORDER BY
    c."etablissementId",
    c."nbVersions" DESC,
    c."nbUnites" DESC,
    c."createdAt" ASC,
    c."id" ASC;

CREATE TEMP TABLE _duerp_perdant ON COMMIT DROP AS
SELECT d."id"
FROM "Duerp" d
WHERE NOT EXISTS (SELECT 1 FROM _duerp_gagnant g WHERE g."id" = d."id");

DO $$
DECLARE porteurs INTEGER;
BEGIN
    SELECT COUNT(*) INTO porteurs
    FROM "Duerp" d
    JOIN _duerp_perdant p ON p."id" = d."id"
    WHERE d."referentielSecteurId" IS NOT NULL
       OR d."transversesRepondues" = true
       OR EXISTS (SELECT 1 FROM "DuerpVersion" v WHERE v."duerpId" = d."id")
       OR EXISTS (SELECT 1 FROM "UniteTravail" u WHERE u."duerpId" = d."id");

    IF porteurs > 0 THEN
        RAISE EXCEPTION
            'Migration abandonnée : % DUERP en doublon portent de la donnée saisie (versions figées, unités de travail ou secteur choisi). Aucune suppression automatique — conservation 40 ans oblige. Fusionner à la main puis rejouer la migration.',
            porteurs;
    END IF;
END $$;

-- À ce stade, tous les perdants restants sont des coquilles vides.
DELETE FROM "Duerp" d
USING _duerp_perdant p
WHERE d."id" = p."id";

DROP INDEX "Duerp_etablissementId_idx";
CREATE UNIQUE INDEX "Duerp_etablissementId_key" ON "Duerp"("etablissementId");

-- 3.d) Prestataire (etablissementId, siret) -----------------------------------
-- Le doublon de SIRET est celui qui casse le suivi de vigilance : deux fiches,
-- deux attestations URSSAF, une seule à jour, et l'alerte porte sur la mauvaise.
-- Les SIRET NULL restent libres (Postgres traite les NULL comme distincts).

DO $$
DECLARE doublons INTEGER;
BEGIN
    SELECT COUNT(*) INTO doublons FROM (
        SELECT "etablissementId", "siret"
        FROM "Prestataire"
        WHERE "siret" IS NOT NULL
        GROUP BY "etablissementId", "siret"
        HAVING COUNT(*) > 1
    ) d;

    IF doublons > 0 THEN
        RAISE EXCEPTION
            'Migration abandonnée : % couple(s) (établissement, SIRET) apparaissent sur plusieurs fiches prestataire. Fusionner les fiches à la main (conserver les pièces de vigilance les plus récentes) puis rejouer la migration.',
            doublons;
    END IF;
END $$;

CREATE UNIQUE INDEX "Prestataire_etablissementId_siret_key"
    ON "Prestataire"("etablissementId", "siret");

-- ============================================================================
-- 4) AccessToken.otpExpireLe — expiration propre du code à usage unique
--
--    lib/signatures/otp.ts fixe OTP_TTL_MINUTES = 10 et l'email annonce
--    « Valable 10 minutes », mais aucune colonne ne portait cette échéance :
--    le code restait valable aussi longtemps que le lien magique (72 h à
--    7 jours).
--
--    Backfill : les tokens portant déjà un otpHash reçoivent createdAt + 10 min.
--    Tous sont émis depuis longtemps, ils basculent donc immédiatement en
--    « expiré » — c'est le comportement sûr, et il correspond à ce que
--    l'utilisateur a lu dans son email. Les tokens sans OTP restent à NULL.
-- ============================================================================

ALTER TABLE "AccessToken" ADD COLUMN "otpExpireLe" TIMESTAMP(3);

UPDATE "AccessToken"
SET "otpExpireLe" = "createdAt" + INTERVAL '10 minutes'
WHERE "otpHash" IS NOT NULL;

-- ============================================================================
-- 5) Pseudo-clés étrangères → vraies contraintes, en ON DELETE SET NULL
--
--    Ces colonnes *Id ressemblaient à des clés étrangères sans en être : rien
--    n'empêchait la cible de disparaître. SET NULL et non CASCADE, car dans
--    les quatre cas l'enregistrement porteur est une trace opposable (ticket
--    terrain, permis de feu, plan de prévention, jeton d'accès délivré) qui
--    doit survivre à la disparition de la cible ; seul le lien se perd, les
--    snapshots texte restent.
--
--    Chaque contrainte est précédée d'une NULLification des références déjà
--    orphelines, sans quoi l'ALTER TABLE échouerait.
-- ============================================================================

-- 5.a) Intervention.risqueId → Risque (ADR-009, boucle ticket ↔ DUERP)

UPDATE "Intervention" i
SET "risqueId" = NULL
WHERE i."risqueId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Risque" r WHERE r."id" = i."risqueId");

ALTER TABLE "Intervention"
    ADD CONSTRAINT "Intervention_risqueId_fkey"
    FOREIGN KEY ("risqueId") REFERENCES "Risque"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 5.b) PermisFeu.prestataireId → Prestataire

UPDATE "PermisFeu" pf
SET "prestataireId" = NULL
WHERE pf."prestataireId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Prestataire" p WHERE p."id" = pf."prestataireId");

ALTER TABLE "PermisFeu"
    ADD CONSTRAINT "PermisFeu_prestataireId_fkey"
    FOREIGN KEY ("prestataireId") REFERENCES "Prestataire"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 5.c) PlanPrevention.prestataireId → Prestataire

UPDATE "PlanPrevention" pp
SET "prestataireId" = NULL
WHERE pp."prestataireId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Prestataire" p WHERE p."id" = pp."prestataireId");

ALTER TABLE "PlanPrevention"
    ADD CONSTRAINT "PlanPrevention_prestataireId_fkey"
    FOREIGN KEY ("prestataireId") REFERENCES "Prestataire"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 5.d) AccessToken.prestataireId → Prestataire

-- Alias `tok` et non `at` : AT est un mot réservé SQL (AT TIME ZONE).
UPDATE "AccessToken" tok
SET "prestataireId" = NULL
WHERE tok."prestataireId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Prestataire" p WHERE p."id" = tok."prestataireId");

ALTER TABLE "AccessToken"
    ADD CONSTRAINT "AccessToken_prestataireId_fkey"
    FOREIGN KEY ("prestataireId") REFERENCES "Prestataire"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 6) Index
--
--    UniteTravail.duerpId : clé étrangère sans index — scan séquentiel à
--    chaque construction de snapshot DUERP et à chaque cascade partant du
--    document.
--    RegistreAccessibilite.slugPublic : index redondant, la colonne porte déjà
--    un index unique (RegistreAccessibilite_slugPublic_key). Deux index sur la
--    même colonne ne coûtent qu'à l'écriture.
-- ============================================================================

CREATE INDEX "UniteTravail_duerpId_idx" ON "UniteTravail"("duerpId");

DROP INDEX "RegistreAccessibilite_slugPublic_idx";

COMMIT;
