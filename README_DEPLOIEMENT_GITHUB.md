# Déploiement sans installation sur le PC

## GitHub

1. Va sur GitHub.
2. Crée un nouveau repository.
3. Téléverse les fichiers du projet.
4. Vérifie que `package.json` est à la racine.

## Vercel

1. Va sur Vercel.
2. Ajoute un nouveau projet.
3. Sélectionne ton repository GitHub.
4. Clique sur Deploy.

Vercel détecte automatiquement Next.js.

## Neon

1. Crée ta base Neon.
2. Copie `DATABASE_URL`.
3. Dans Vercel, ouvre les variables d'environnement.
4. Ajoute `DATABASE_URL`.
5. Redeploie.

## Base de données

Ouvre Neon → SQL Editor.

Copie tout le contenu de :

`db/schema.sql`

Puis exécute-le.

## Test

Ouvre ton site Vercel.

La V1 fonctionne déjà avec sauvegarde locale.

Quand on branchera Neon sur l'interface, le personnage pourra être retrouvé depuis n'importe quel appareil.
