-- LIFEQUEST — schéma Neon PostgreSQL
-- V1 : structure prête pour la sauvegarde cloud.
-- Exécute ce fichier dans l'éditeur SQL de Neon.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudo VARCHAR(30) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_stats (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  force INTEGER NOT NULL DEFAULT 1 CHECK (force BETWEEN 0 AND 100),
  intelligence INTEGER NOT NULL DEFAULT 1 CHECK (intelligence BETWEEN 0 AND 100),
  agilite INTEGER NOT NULL DEFAULT 1 CHECK (agilite BETWEEN 0 AND 100),
  discipline INTEGER NOT NULL DEFAULT 1 CHECK (discipline BETWEEN 0 AND 100),
  creativite INTEGER NOT NULL DEFAULT 1 CHECK (creativite BETWEEN 0 AND 100),
  social INTEGER NOT NULL DEFAULT 1 CHECK (social BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500),
  xp_reward INTEGER NOT NULL DEFAULT 20 CHECK (xp_reward > 0),
  stat VARCHAR(30) NOT NULL DEFAULT 'discipline',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS quests_player_id_idx ON quests(player_id);
CREATE INDEX IF NOT EXISTS quests_created_at_idx ON quests(created_at);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  code VARCHAR(80) NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, code)
);

-- Vue pratique pour récupérer rapidement le personnage + statistiques.
CREATE OR REPLACE VIEW player_overview AS
SELECT
  p.id,
  p.pseudo,
  p.level,
  p.xp,
  p.coins,
  s.force,
  s.intelligence,
  s.agilite,
  s.discipline,
  s.creativite,
  s.social,
  p.created_at,
  p.updated_at
FROM players p
JOIN player_stats s ON s.player_id = p.id;