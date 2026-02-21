---
name: testing-patterns
description: Testing patterns for this project. Use when writing, reviewing, or debugging tests — frontend (Vitest + Vue Testing Library) or backend (Vitest + NestJS testing utilities).
---

# Testing Patterns

STOP. Read this BEFORE writing any test code.

---

## FORBIDDEN PATTERNS — MEMORIZE THESE

### NEVER test internal state — test behavior

```typescript
// ❌ BAD — internal state
expect(wrapper.vm.tasks).toHaveLength(3)

// ✅ GOOD — what the user sees
expect(screen.getAllByRole('listitem')).toHaveLength(3)
```

### NEVER use `it.skip` — CI will fail

Skipped tests are debt. Fix or delete them.

### NEVER test composables in isolation via renderHook-equivalent

Test composables through the components that use them.

```typescript
// ❌ BAD — testing composable directly
const { result } = renderComposable(() => useTaskList())

// ✅ GOOD — test via component
render(TaskList)
expect(screen.getByText('My task')).toBeInTheDocument()
```

---

## Core Philosophy

**Test BEHAVIOR (what the user sees/does), not IMPLEMENTATION (internal state, composables).**

Tests should survive refactoring. If you rename a composable, no tests should break unless the UI changed.

---

## Organization

```
# Frontend
modules/task/__tests__/
  TaskCard.spec.ts         # component behavior
  TaskList.spec.ts
  task.api.spec.ts         # API function unit tests (with mocked fetch)

# Backend
src/tasks/__tests__/
  tasks.service.spec.ts    # service unit tests (mocked repository)
  tasks.repository.spec.ts # repository integration tests (prisma mock or real DB)
```

---

## Frontend — Vitest + Vue Testing Library

### Test Utils

```typescript
// src/test/utils.ts
import { render } from '@testing-library/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createRouter, createMemoryHistory } from 'vue-router'

export function renderWithProviders(component: Component, options = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div/>' } }],
  })

  return render(component, {
    global: {
      plugins: [
        [VueQueryPlugin, { queryClientConfig: { defaultOptions: { queries: { retry: false } } } }],
        router,
      ],
    },
    ...options,
  })
}
```

### MSW — Mock API Calls

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import type { TaskResponse } from '@kresus/contract'

const mockTasks: TaskResponse[] = [
  { id: '1', title: 'Test task', content: 'Content', priority: 'haut', completed: false, executionDate: null, createdAt: new Date().toISOString() }
]

export const handlers = [
  http.get('/api/tasks', () => HttpResponse.json(mockTasks)),
]
```

### Mock Factories

```typescript
// src/test/mocks/factories.ts
import type { TaskResponse } from '@kresus/contract'

export function createMockTask(overrides?: Partial<TaskResponse>): TaskResponse {
  return {
    id: 'task-1',
    title: 'Test task',
    content: 'Test content',
    priority: 'moyen',
    completed: false,
    executionDate: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}
```

### Component Tests

```typescript
// modules/task/__tests__/TaskCard.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import TaskCard from '../components/TaskCard.vue'
import { createMockTask } from '@/test/mocks/factories'

describe('TaskCard', () => {
  it('displays task title and content', () => {
    const task = createMockTask({ title: 'Buy groceries', content: 'Milk, eggs' })
    render(TaskCard, { props: { task } })

    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Milk, eggs')).toBeInTheDocument()
  })
})
```

### Query priority (follow this order)

1. `getByRole` — semantic, accessible
2. `getByLabelText` — form fields
3. `getByPlaceholderText` — fallback for inputs
4. `getByText` — non-interactive text
5. `getByTestId` — LAST RESORT only

---

## Backend — Vitest + NestJS

### Service Tests (unit — mock repository)

```typescript
// tasks/__tests__/tasks.service.spec.ts
import { describe, it, beforeEach, vi } from 'vitest'
import { Test } from '@nestjs/testing'
import { TasksService } from '../tasks.service'
import { TasksRepository } from '../tasks.repository'
import { NotFoundException, ForbiddenException } from '@nestjs/common'

const mockRepository = {
  findById: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
    vi.clearAllMocks()
  })

  describe('delete', () => {
    it('throws NotFoundException when task does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(
        service.delete({ id: 'non-existent', userId: 'user-1' })
      ).rejects.toThrow(NotFoundException)
    })
  })
})
```

### Repository Tests (mock PrismaService)

```typescript
// tasks/__tests__/tasks.repository.spec.ts
import { describe, it, beforeEach, vi } from 'vitest'
import { Test } from '@nestjs/testing'
import { TasksRepository } from '../tasks.repository'
import { PrismaService } from '@/prisma/prisma.service'

const mockPrisma = {
  task: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

describe('TasksRepository', () => {
  let repository: TasksRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    repository = module.get<TasksRepository>(TasksRepository)
    vi.clearAllMocks()
  })

  it('returns null when task is not found', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(null)

    const result = await repository.findById('non-existent')

    expect(result).toBeNull()
  })
})
```

---

## Commands

```bash
# Frontend
pnpm --filter=web test
pnpm --filter=web test:coverage

# Backend
pnpm --filter=api test
pnpm --filter=api test:coverage
```

---

## Coverage Thresholds

| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 75% |

---

## CHECKLIST — Verify BEFORE submitting

1. [ ] Tests in `__tests__/` next to the code
2. [ ] Arrange-Act-Assert pattern
3. [ ] One behavior per test
4. [ ] **NO `it.skip`** — CI fails
5. [ ] **Assertions on what the user sees**, not internal state
6. [ ] Query by role/label first, `testId` last
7. [ ] MSW handlers for all API calls used in component tests
8. [ ] Mock factories for test data (never hardcode inline objects)
9. [ ] Service tests mock repository — repository tests mock Prisma