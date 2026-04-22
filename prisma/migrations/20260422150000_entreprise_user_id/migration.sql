-- ADR-005 : rattacher Entreprise à auth.users via userId (UUID nullable)
-- Pas de FK cross-schéma (auth.users est managé par Supabase) ; le scoping
-- est fait au niveau applicatif. Colonne nullable pour ne pas casser les
-- entreprises existantes : elles deviennent orphelines (invisibles côté app
-- après scoping), à purger ou rattacher manuellement plus tard.

ALTER TABLE "public"."Entreprise"
  ADD COLUMN "userId" uuid;

CREATE INDEX "Entreprise_userId_idx" ON "public"."Entreprise" ("userId");
