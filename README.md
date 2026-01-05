# 🎮 API de Gestion de Tournois E-sport

API REST complète pour la gestion de tournois e-sport avec authentification, gestion des équipes et inscriptions.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Documentation API](#documentation-api)
- [Features Bonus](#features-bonus)
- [Tests](#tests)

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

### Statistiques

#### Obtenir les statistiques d'un tournoi

```http
GET /api/tournaments/:tournamentId/stats
Authorization: Bearer <token>
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "tournament": {
      "id": "uuid",
      "name": "CS:GO Championship",
      "game": "Counter-Strike 2",
      "status": "OPEN",
      "format": "SOLO",
      "maxParticipants": 64,
      "startDate": "2026-02-01T10:00:00Z",
      "endDate": "2026-02-15T18:00:00Z"
    },
    "registrations": {
      "total": 32,
      "statusBreakdown": {
        "PENDING": 10,
        "CONFIRMED": 20,
        "REJECTED": 2,
        "WITHDRAWN": 0
      },
      "confirmed": 20
    },
    "capacity": {
      "max": 64,
      "confirmed": 20,
      "available": 44,
      "percentageFilled": 31
    },
    "confirmedParticipants": [
      {
        "registrationId": "uuid",
        "registrationDate": "2026-01-15T10:00:00Z",
        "participant": {
          "type": "PLAYER",
          "id": "uuid",
          "username": "player123",
          "email": "player@example.com"
        }
      }
    ]
  }
}
```

## ✨ Features Bonus

### 1. 📚 Swagger OpenAPI Documentation

L'API dispose d'une documentation interactive complète avec **Swagger UI**:

```bash
# Accéder à la documentation
http://localhost:5000/api-docs
```

**Fonctionnalités:**
- Documentation interactive de tous les endpoints
- Bouton "Try it out" pour tester directement l'API
- Schemas de réponse détaillés
- Support de l'authentification Bearer token

### 2. 📊 Endpoint Statistiques Tournoi

Nouvel endpoint pour obtenir des statistiques complètes sur un tournoi:

**Métriques disponibles:**
- Total et breakdown des inscriptions (PENDING, CONFIRMED, REJECTED, WITHDRAWN)
- Capacité et pourcentage d'occupation
- Liste détaillée des participants confirmés
- Informations du tournoi associé

### 3. 🧪 Suite de Tests Vitest

**23 tests** couvrant les services critiques:

```bash
npm run test              # Exécuter tous les tests
npm run test:ui           # Interface visuelle des tests
```

**Suites de tests:**
- **8 tests** - Service d'authentification (register, login, JWT)
- **7 tests** - Service de tournois (CRUD, validations, transitions)
- **8 tests** - Service d'équipes (CRUD, autorisation captain)

**Couverture:**
- ✅ Validation des entrées
- ✅ Gestion des erreurs
- ✅ Transitions d'état
- ✅ Autorisation et permissions

Voir [TESTS.md](./TESTS.md) pour plus de détails.

## 🧪 Tests

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
**Test Framework:** Vitest  
**Total Tests:** 23 tests  
**Couverture:** Services d'authentification, tournois et équipes

Voir [TESTS.md](./TESTS.md) pour la documentation complète des tests.
## 📝 Notes de développement

- Tous les secrets (JWT_SECRET, DATABASE_URL) doivent être en `.env`
- Les passwords sont hashés avec bcrypt
- Les tokens JWT expirent après 24h
- La validation des données utilise Zod
- Gestion des erreurs centralisée avec middleware customisé
- Migrations Prisma trackées avec Git
- Documentation API interactive via Swagger UI
- Tests automatisés avec Vitest

## 📦 Points Implémentés

**Core Features (20 points):**
- ✅ Authentification (Register/Login) avec JWT
- ✅ Gestion complète des tournois (CRUD + statuts)
- ✅ Gestion des équipes avec authorisation
- ✅ Système d'inscriptions avec validation
- ✅ Architecture MVC
- ✅ Validation des données (Zod)
- ✅ Gestion des erreurs
- ✅ Code de qualité professionnelle

**Bonus Features (5 points):**
- ✅ Documentation Swagger OpenAPI interactive (+1)
- ✅ Endpoint statistiques tournoi (+1)
- ✅ Suite de tests Vitest 23 tests (+2)
- ⭐ Branches Git organisées (`feature/bonus-features`)

## 🌿 Git Branches

- `main/v0` - ancienne version obsolète.
- `Main/bonus-features` - Branch principale contenant les 3 features bonus

## 📄 École

Hesias

## 👤 Auteur

Ismaël Villaldea (avec github copilot, on est en 2026 quand même)
