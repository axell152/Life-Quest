# LIFEQUEST — RPG de la vie

Application web Next.js pensée pour être déployée avec GitHub + Vercel et utiliser Neon PostgreSQL.

## V1 actuelle

- Création d'un personnage
- Niveau + XP
- Pièces
- 6 statistiques
- Quêtes
- Récompenses XP
- Montée de niveau
- Sauvegarde locale dans le navigateur
- Schéma Neon prêt pour la sauvegarde cloud
- Route `/api/health` pour tester la connexion Neon

## 1. Mettre le projet sur GitHub

Crée un dépôt GitHub vide puis téléverse le contenu de ce dossier.

Structure attendue :

```text
lifequest/
├─ app/
├─ db/
├─ package.json
├─ next.config.ts
├─ tsconfig.json
├─ .env.example
└─ README.md
```

## 2. Vercel

Importe le dépôt GitHub dans Vercel.

Aucun réglage spécial n'est nécessaire pour la V1 locale.

## 3. Neon

Crée une base PostgreSQL sur Neon.

Copie la chaîne de connexion Neon.

Dans Vercel :

Project Settings → Environment Variables

Ajoute :

```text
DATABASE_URL=ta_chaine_neon
```

Puis redeploie.

## 4. Créer les tables

Dans l'éditeur SQL de Neon, copie le contenu de :

```text
db/schema.sql
```

et exécute-le.

## 5. Vérifier Neon

Une fois déployé, ouvre :

```text
/api/health
```

Tu dois obtenir quelque chose comme :

```json
{
  "ok": true,
  "database": "connected"
}
```

## Important

La V1 de l'interface utilise encore `localStorage` afin de pouvoir tester immédiatement le gameplay sans compte utilisateur.

La prochaine étape est de brancher les boutons de création/sauvegarde/validation de quêtes sur Neon.

Cela permettra ensuite d'ajouter :

- comptes utilisateurs
- connexion sur téléphone et PC
- historique XP
- achievements
- inventaire
- classes
- compétences
- classement
- amis
- événements quotidiens
- récompenses
