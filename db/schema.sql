CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudo VARCHAR(30) NOT NULL DEFAULT 'Aventurier',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_stats (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,

  force INTEGER NOT NULL DEFAULT 1,
  intelligence INTEGER NOT NULL DEFAULT 1,
  agilite INTEGER NOT NULL DEFAULT 1,
  discipline INTEGER NOT NULL DEFAULT 1,
  creativite INTEGER NOT NULL DEFAULT 1,
  social INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(80) NOT NULL,
  description VARCHAR(200) NOT NULL,

  price INTEGER NOT NULL,
  emoji VARCHAR(10) NOT NULL,

  category VARCHAR(40) NOT NULL DEFAULT 'maison',

  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,

  player_id UUID NOT NULL
    REFERENCES players(id)
    ON DELETE CASCADE,

  item_id UUID NOT NULL
    REFERENCES shop_items(id)
    ON DELETE CASCADE,

  quantity INTEGER NOT NULL DEFAULT 1,

  UNIQUE(player_id, item_id)
);

CREATE INDEX IF NOT EXISTS inventory_player_idx
ON inventory(player_id);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Lit confortable',
'Ton premier vrai meuble.',
50,
'🛏️',
'maison'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Lit confortable'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Bureau',
'Un bureau pour travailler et avancer dans tes projets.',
100,
'🖥️',
'maison'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Bureau'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Canapé',
'Un endroit confortable pour te détendre.',
150,
'🛋️',
'maison'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Canapé'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Bibliothèque',
'Développe ton espace de connaissance.',
200,
'📚',
'maison'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Bibliothèque'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Plante',
'Une petite touche de nature.',
75,
'🪴',
'maison'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Plante'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Setup gaming',
'Un espace gaming digne de ce nom.',
500,
'🎮',
'loisir'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Setup gaming'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Ordinateur portable',
'Un outil pour tes projets.',
400,
'💻',
'travail'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Ordinateur portable'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Vélo',
'Ton premier moyen de transport.',
300,
'🚲',
'transport'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Vélo'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Voiture',
'Une grosse étape dans ta vie virtuelle.',
1500,
'🚗',
'transport'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Voiture'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Voyage',
'Une récompense pour ton personnage.',
2000,
'✈️',
'aventure'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Voyage'
);

INSERT INTO shop_items
(name, description, price, emoji, category)

SELECT
'Maison',
'Le grand objectif immobilier.',
5000,
'🏡',
'immobilier'

WHERE NOT EXISTS (
  SELECT 1 FROM shop_items
  WHERE name = 'Maison'
);
