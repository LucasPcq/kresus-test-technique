# Task App — Technical Test

## Commands

| Task | Command |
|------|---------|
| Dev (all) | `pnpm dev` |
| Dev API | `pnpm dev --filter=api` |
| Dev Web | `pnpm dev --filter=web` |
| Test | `pnpm test` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Build | `pnpm build` |
| Install | `pnpm install` |
| DB seed | `pnpm --filter=api seed` |
| DB migrate | `pnpm --filter=api migrate` |
| DB reset | `pnpm --filter=api migrate:reset` |
| DB studio | `pnpm --filter=api studio` |

## Architecture

```
apps/
  api/       → NestJS + Prisma (Controller > Service > Repository)
  web/       → Vue 3 + TanStack Query frontend
packages/
  contract/  → Shared DTOs, types & Zod schemas
```

## Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Docker) |
| Auth | JWT (access token) |
| Frontend framework | Vue 3 (Composition API) |
| Frontend language | TypeScript |
| UI library | shadcn-vue + Tailwind CSS |
| Server state | TanStack Query (vue-query) |
| Forms | VeeValidate + @vee-validate/zod |
| Client State | Pinia |
| Router | Vue Router |
| Validation | Zod (shared via contract package) |
| Test runner | Vitest |
| Monorepo | Turborepo |
| Infra | Docker Compose |

## Environment Variables

All `.env` files live at the **monorepo root**. Each app reads from root via Turborepo env passthrough.

| Variable | Consumer | Description |
|----------|----------|-------------|
| `DATABASE_URL` | API | PostgreSQL connection string |
| `JWT_SECRET` | API | JWT signing secret |
| `JWT_EXPIRES_IN` | API | Token expiry (e.g. `7d`) |
| `PORT` | API | API port (default 3000) |
| `VITE_API_URL` | Web | Backend base URL |

**NEVER** read `process.env` directly — always use the typed config service/module.

---

## Workflow Rules

IMPORTANT — Follow these rules systematically:

1. **Testing**: Every feature MUST include tests. No strict TDD, but tests before commit.
2. **No comments** : Only add comments if the code is not self-explanatory or requires special attention.
3. **Validate before commit** : Run lint + types + tests before any commit.
4. **No technical docs** : Create docs only if explicitly requested.
5. **Learn from corrections** : Every time I correct you, update the relevant skill in `.claude/skills/`.

## Commit Rules

- Format: conventional commits (`feat(scope): description`, `fix(scope): description`)
- Commits must be atomic and progressive — one logical change per commit
- Examples: `feat(api): add task repository`, `feat(web): add task list composable`

## Pull Request Rules

- **Default branch**: `main`
- **PR title**: conventional commit format
- **PR body**:
  ```
  ## Summary
  - bullet points

  ## Test plan
  - [ ] checklist
  ```

---

## Gotchas — TypeScript & Code Quality

### Type Safety
- **No `as` assertions** — type at source
- **No TypeScript `enum`** — use `as const` objects
- **Use utility types** — `Pick`, `Omit`, `Partial` instead of duplicating
- **All shared types live in `packages/contract`** — never duplicate across apps

### Functions
- **`const` over `let`** — extract function if needed
- **2+ parameters → object** — always destructure
- **Pure functions with DI** — inject dependencies, don't import globals

### Code Organization
- Shared schemas and types via `@kresus/contract` — never duplicate
- All forms require Zod validation (schema from contract package)
- Centralized mappings, no magic strings or numbers
- Early returns for all conditionals

```typescript
// ❌ BAD
const task = response as Task;
enum Priority { HIGH, MEDIUM, LOW }
function createTask(title: string, content: string, priority: string) {}

// ✅ GOOD
const task: Task = await fetchTask(id);
const PRIORITY = { HIGH: "haut", MEDIUM: "moyen", LOW: "bas" } as const;
function createTask({ title, content, priority }: CreateTaskDto) {}
```

---

## Skills

Claude uses skills automatically when relevant:

| Skill | When used |
|-------|-----------|
| `/backend-architecture` | NestJS controllers, services, repositories, Prisma |
| `/vue-patterns` | Vue 3 components, composables, state management |
| `/testing-patterns` | Unit tests, component tests, mocks |
| `/frontend-api` | TanStack Query, API client functions, contract types |