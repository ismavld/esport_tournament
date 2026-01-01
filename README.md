# 🎮 API de Gestion de Tournois E-sport

API REST complète pour la gestion de tournois e-sport avec authentification, gestion des équipes et inscriptions.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Documentation API](#documentation-api)

## 🚀 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn

### Étapes

```bash
# Cloner le repository
git clone <repository-url>
cd esport-tournament-api

# Installer les dépendances
npm install

# Initialiser la base de données
npm run prisma:migrate

# Remplir la base avec des données de test (optionnel)
npm run prisma:seed
```

## ⚙️ Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine du projet (voir `.env.example`):

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="24h"
PORT=5000
```

## 📦 Scripts disponibles

```bash
# Démarrer le serveur en mode développement (avec rechargement automatique)
npm run dev

# Démarrer le serveur en mode production
npm start

# Gérer les migrations Prisma
npm run prisma:migrate    # Créer/appliquer migrations
npm run prisma:generate   # Générer le client Prisma
npm run prisma:seed       # Remplir la BD avec des données de test

# Interface graphique Prisma
npm run prisma:studio    # Ouvrir Prisma Studio sur http://localhost:5555

# Tests
npm run test             # Lancer les tests
npm run test:ui          # Interface de test Vitest
```

## 🏗️ Architecture

```
src/
├── controllers/        # Logique des routes (handlers)
├── services/          # Logique métier
├── routes/            # Définition des routes
├── middlewares/       # Middlewares (auth, validation, errors)
├── validations/       # Schémas de validation Zod
├── utils/             # Utilitaires (asyncHandler, prisma, etc)
└── index.js           # Point d'entrée
```

### Pattern MVC

- **Routes**: Définissent les endpoints
- **Controllers**: Gèrent les requêtes/réponses
- **Services**: Contiennent la logique métier
- **Middlewares**: Authentification, validation, gestion des erreurs

## 📡 Documentation API

### Authentification

#### Register - Créer un utilisateur

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username123",
  "password": "Password123",
  "role": "PLAYER"
}
```

**Réponse (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "role": "PLAYER"
  }
}
```

#### Login - Authentification

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Réponse (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username123",
    "role": "PLAYER"
  }
}
```

### Tournois

#### Lister les tournois

```http
GET /api/tournaments?status=OPEN&game=Valorant&format=TEAM&page=1&limit=10
Authorization: Bearer <token>
```

#### Détails d'un tournoi

```http
GET /api/tournaments/:id
Authorization: Bearer <token>
```

#### Créer un tournoi

```http
POST /api/tournaments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "CS:GO Championship",
  "game": "Counter-Strike 2",
  "format": "SOLO",
  "maxParticipants": 64,
  "prizePool": 50000,
  "startDate": "2026-02-01T10:00:00Z",
  "endDate": "2026-02-15T18:00:00Z"
}
```

#### Modifier un tournoi

```http
PUT /api/tournaments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "prizePool": 60000
}
```

#### Supprimer un tournoi

```http
DELETE /api/tournaments/:id
Authorization: Bearer <token>
```

#### Changer le statut d'un tournoi

```http
PATCH /api/tournaments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "OPEN"
}
```

### Équipes

#### Lister les équipes

```http
GET /api/teams
Authorization: Bearer <token>
```

#### Détails d'une équipe

```http
GET /api/teams/:id
Authorization: Bearer <token>
```

#### Créer une équipe

```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Phoenix Gaming",
  "tag": "PHXGM"
}
```

#### Modifier une équipe (capitaine seulement)

```http
PUT /api/teams/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Team Name"
}
```

#### Supprimer une équipe (capitaine seulement)

```http
DELETE /api/teams/:id
Authorization: Bearer <token>
```

### Inscriptions

#### Inscrire un joueur/équipe à un tournoi

```http
POST /api/tournaments/:tournamentId/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "playerId": 1
}
```

#### Lister les inscriptions d'un tournoi

```http
GET /api/tournaments/:tournamentId/registrations
Authorization: Bearer <token>
```

#### Modifier le statut d'une inscription

```http
PATCH /api/tournaments/:tournamentId/registrations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

#### Annuler une inscription

```http
DELETE /api/tournaments/:tournamentId/registrations/:id
Authorization: Bearer <token>
```

## 🔐 Rôles et permissions

| Rôle | Permissions |
|------|------------|
| PLAYER | S'inscrire aux tournois, créer des équipes |
| ORGANIZER | Créer/modifier/supprimer ses tournois, gérer les inscriptions |
| ADMIN | Accès complet, changement de statut en COMPLETED |

## 🧪 Tests

```bash
npm run test              # Lancer les tests
npm run test:ui           # Interface de test interactive
npm run test -- --coverage # Couverture de code
```

## 📝 Notes de développement

- Tous les secrets (JWT_SECRET, DATABASE_URL) doivent être en `.env`
- Les passwords sont hashés avec bcrypt
- Les tokens JWT expirent après 24h
- La validation des données utilise Zod
- Gestion des erreurs centralisée avec middleware customisé
- Migrations Prisma trackées avec Git

## 📄 Licence

MIT

## 👤 Auteur

Votre Nom
