# Tests Vitest pour l'API Tournois E-sport

## Configuration des tests

Les tests utilisent **Vitest** avec **Prisma** pour tester les services de manière intégrée.

### Structure des tests

```
tests/
├── authService.test.js      # Tests authentification (8 tests)
├── tournamentService.test.js # Tests tournois (7 tests)
└── teamService.test.js      # Tests équipes (8 tests)
```

## Tests implémentés

### Authentication Service (8 tests)
- ✅ Enregistrement réussi d'un nouvel utilisateur
- ✅ Erreur si email déjà utilisé
- ✅ Erreur si username déjà utilisé
- ✅ Connexion réussie avec bonnes identifiants
- ✅ Erreur connexion avec email inexistant
- ✅ Validation structure JWT token
- ✅ Génération token JWT valide

### Tournament Service (7 tests)
- ✅ Création réussie d'un tournoi
- ✅ Erreur si startDate dans le passé
- ✅ Erreur si endDate avant startDate
- ✅ Récupération tournoi par ID
- ✅ Erreur si tournoi non trouvé
- ✅ Transition DRAFT → OPEN
- ✅ Transition DRAFT → CANCELLED

### Team Service (8 tests)
- ✅ Création réussie d'équipe
- ✅ Erreur si nom équipe déjà utilisé
- ✅ Erreur si tag pas uppercase
- ✅ Récupération équipe par ID
- ✅ Erreur si équipe non trouvée
- ✅ Mise à jour nom équipe
- ✅ Mise à jour tag équipe
- ✅ Erreur si pas captain

## Exécution des tests

```bash
# Exécuter tous les tests
npm test

# Exécuter une seule fois et quitter
npm test -- --run

# Interface UI Vitest
npm run test:ui

# Exécuter un seul fichier de test
npm test authService.test.js
```

## Total: 23 tests implémentés

Tous les tests utilisent:
- **Vitest** pour le framework de test
- **Prisma** pour l'accès à la base de données
- **Mocking** de bcrypt pour éviter les problèmes de compilation native
- **Nettoyage** des données de test après chaque suite

## Coverage

Les tests couvrent:
- ✅ Service d'authentification (register, login, JWT)
- ✅ Service de tournois (CRUD, gestion statut)
- ✅ Service d'équipes (CRUD, autorisation captain)
- ✅ Gestion des erreurs
- ✅ Validation des données
