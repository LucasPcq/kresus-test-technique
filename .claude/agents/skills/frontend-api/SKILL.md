---
name: frontend-api
description: API client patterns for the Vue 3 frontend. Use when writing fetch functions, TanStack Query composables, or anything that communicates with the backend REST API.
---

# Frontend API Patterns — TanStack Query + REST

STOP. Read this BEFORE writing any API or query code.

---

## FORBIDDEN PATTERNS

### NEVER fetch directly in components

```typescript
// ❌ BAD — fetch in component
const tasks = ref([])
onMounted(async () => {
  tasks.value = await fetch('/api/tasks').then(r => r.json())
})

// ✅ GOOD — TanStack Query composable
const { data: tasks } = useTasksQuery()
```

### NEVER duplicate types from the contract

```typescript
// ❌ BAD — redefining types locally
interface Task { id: string; title: string; ... }

// ✅ GOOD — import from contract
import type { TaskResponse } from '@kresus/contract'
```

### NEVER inline fetch logic in query functions

```typescript
// ❌ BAD — fetch logic mixed into query
useQuery({
  queryKey: ['tasks'],
  queryFn: async () => {
    const res = await fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
    return res.json()
  }
})

// ✅ GOOD — api function + query composable separated
useQuery({ queryKey: ['tasks'], queryFn: fetchTasks })
```

---

## Layer Architecture

```
Component
  └── Composable (useTaskList, useCreateTask)
        └── Query/Mutation (task.query.ts)
              └── API function (task.api.ts)        ← typed with contract
                    └── apiClient (lib/api-client.ts) ← handles auth headers
```

---

## API Client — Base Setup

Single place to configure headers, base URL, and error handling.

```typescript
// lib/api-client.ts
const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { token } = ...

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token.value && { Authorization: `Bearer ${token.value}` }),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message ?? 'Request failed')
  }

  return res.json()
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```

---

## API Functions — Typed with Contract

```typescript
// modules/task/api/task.api.ts
import type { TaskResponse } from '@kresus/contract'
import { apiClient } from '@/lib/api-client'

export function fetchTask(id: string): Promise<TaskResponse> {
  return apiClient.get<TaskResponse>(`/tasks/${id}`)
}
```

---

## Query Composables — TanStack Query

```typescript
// modules/task/api/task.query.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { TaskFilters } from '@kresus/contract'
import { fetchTasks, createTask, updateTask, deleteTask } from './task.api'

// Query keys — centralized, no magic strings
export const taskKeys = {
  all: ['tasks'] as const,
  filtered: (filters: TaskFilters) => ['tasks', filters] as const,
}

export function useTasksQuery(filters?: Ref<TaskFilters>) {
  return useQuery({
    queryKey: computed(() => filters?.value ? taskKeys.filtered(filters.value) : taskKeys.all),
    queryFn: () => fetchTasks(filters?.value),
  })
}
```

---

## Auth API

```typescript
// modules/auth/api/auth.api.ts
import type { LoginDto, AuthResponse } from '@kresus/contract'
import { apiClient } from '@/lib/api-client'

export function login(data: LoginDto): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/login', data)
}
```

---

## Query Keys — Rules

- Always centralize in a `keys` object per module
- Never use raw strings in `queryKey` arrays elsewhere
- Invalidate by prefix when possible (`taskKeys.all` invalidates all task queries)

---

## CHECKLIST — Verify BEFORE submitting

1. [ ] Fetch logic in `api/` functions, NOT in components or composables
2. [ ] All types imported from `@kresus/contract`
3. [ ] Query keys centralized in `task.query.ts`
4. [ ] `apiClient` used for all HTTP calls — never raw `fetch`
5. [ ] `invalidateQueries` called on mutation success
6. [ ] Filters passed as reactive `Ref` to query composables
7. [ ] Auth header handled in `apiClient`, not per-request