# Task App

Application de gestion de taches. Monorepo Turborepo avec une API NestJS et un frontend Vue 3.

## Prerequis

- Node.js >= 20.19.0 ou >= 22.12.0
- pnpm 10
- Docker (pour PostgreSQL)

## Installation

```bash
pnpm install
```

Copier le fichier d'environnement :

```bash
cp .env.example .env
```

## Demarrage

Lancer la base de donnees :

```bash
pnpm docker:up
```

Appliquer les migrations et seeder la base :

```bash
pnpm --filter=api migrate
pnpm --filter=api seed
```

Lancer l'application :

```bash
pnpm dev
```

L'API demarre sur http://localhost:3000 et le frontend sur http://localhost:5173.

La documentation Swagger est disponible sur http://localhost:3000/api.

## Compte de test

Le seed cree un utilisateur de test :

- Email : `dev@kresus.com`
- Mot de passe : `password123`

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lancer API + frontend |
| `pnpm build` | Build de production |
| `pnpm test` | Lancer les tests |
| `pnpm lint` | Verifier le code |
| `pnpm format` | Formater le code |
| `pnpm --filter=api migrate` | Appliquer les migrations |
| `pnpm --filter=api migrate:reset` | Reset la base + migrations |
| `pnpm --filter=api seed` | Seeder la base |
| `pnpm --filter=api studio` | Ouvrir Prisma Studio |

## Structure

```
apps/
  api/         NestJS + Prisma
  web/         Vue 3 + TanStack Query
packages/
  contract/    Types, DTOs et schemas Zod partages
```

## Apercu

### Login

![Login](docs/screenshots/login.png)

### Page des taches (empty state)

![Taches - empty state](docs/screenshots/tasks-empty.png)

### Page des taches

![Taches](docs/screenshots/tasks.png)

### Creation de tache

![Creation de tache](docs/screenshots/task-create.png)

## Architecture d'authentification

L'authentification repose sur un systeme de **dual-token en cookies httpOnly** avec rotation des refresh tokens et detection de vol.

### Flux d'authentification

```mermaid
sequenceDiagram
    participant B as Browser
    participant API as API
    participant DB as RefreshToken (DB)

    Note over B,DB: Login
    B->>API: POST /auth/login {email, password}
    API->>DB: Creer RefreshToken (nouvelle famille)
    API-->>B: Set-Cookie: access_token + refresh_token + session<br/>Body : {id, email}

    Note over B,DB: Requete authentifiee
    B->>API: GET /tasks (cookie access_token)
    API->>API: JwtAuthGuard valide le token
    API-->>B: 200 OK

    Note over B,DB: Access token expire
    B->>API: GET /tasks (cookie access_token expire)
    API-->>B: 401 Unauthorized
    B->>API: POST /auth/refresh (cookie refresh_token)
    API->>DB: Lookup par jti — token valide ?
    DB-->>API: OK, non revoque
    API->>DB: Revoquer ancien token (revokedAt = now)
    API->>DB: Creer nouveau token (meme familyId)
    API-->>B: Set-Cookie: nouveaux access_token + refresh_token
    B->>API: Retry GET /tasks (nouveau access_token)
    API-->>B: 200 OK

    Note over B,DB: Detection de vol (reuse)
    B->>API: POST /auth/refresh (ancien token deja revoque)
    API->>DB: Lookup par jti — token revoque !
    API->>DB: Revoquer toute la famille
    API-->>B: 401 Unauthorized
```

### Token families

Chaque login cree une **famille de tokens** independante. Cela permet :
- **Multi-appareils** : chaque appareil a sa propre famille, un logout sur l'un n'affecte pas l'autre
- **Detection de vol** : si un token revoque est rejoue, toute la famille est invalidee
- **Logout cible** : seule la famille de la session courante est revoquee
