---
name: vue-patterns
description: Vue 3 development patterns for this codebase. Use when writing or reviewing Vue components, composables, route guards, form validation, or any frontend feature code.
---

# Vue 3 Development Patterns

STOP. Read this BEFORE writing any Vue code.

---

## FORBIDDEN PATTERNS — MEMORIZE THESE

### NEVER use Options API — Composition API only

```typescript
// ❌ BAD — Options API
export default {
  data() { return { tasks: [] } },
  methods: { fetchTasks() {} }
}

// ✅ GOOD — Composition API with <script setup>
const tasks = ref<Task[]>([])
```

### NEVER use `watch` for data fetching

```typescript
// ❌ BAD — watch triggering fetch
watch(userId, () => fetch('/api/tasks').then(r => r.json()).then(setTasks))

// ✅ GOOD — TanStack Query composable
const { data: tasks } = useTasksQuery()
```

### NEVER put components or logic in `views/` beyond routing concerns

```
// ❌ BAD — business logic in views
// views/tasks/TaskCard.vue

// ✅ GOOD — component in modules
// modules/task/components/TaskCard.vue
```

---

## Module Architecture

```
src/
  router/              # Vue Router config + guards
  modules/             # ALL feature code
    task/
      components/
      composables/
      api/
        *.api.ts      # fetch functions (typed with contract)
        *.query.ts    # TanStack Query composables
      utils/
      __tests__/
  components/          # Shared generic components (Button, Input, etc.)
  composables/         # Shared composables (useDialog, useToast, etc.)
  lib/                 # App-wide setup (api-client, auth store, etc.)
  views/               # Route entry points ONLY — import from modules
```

### Views — Keep Minimal

```vue
<!-- views/TasksView.vue — GOOD -->
<script setup lang="ts">
import TaskListPage from '@/modules/task/components/TaskListPage.vue'
</script>

<template>
  <TaskListPage />
</template>
```

---

## Component Rules

### Always use `<script setup lang="ts">`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@kresus/contract'

interface Props {
  task: Task
}

const props = defineProps<Props>()
const emit = defineEmits<{
  complete: [id: string]
  delete: [id: string]
}>()
</script>
```

### Early returns via `v-if` chains — loading/error/empty first

```vue
<template>
  <LoadingSpinner v-if="isLoading" />
  <ErrorMessage v-else-if="error" :message="error.message" />
  <EmptyState v-else-if="tasks.length === 0" message="Aucune tâche" />
  <div v-else class="grid gap-4">
    <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
  </div>
</template>
```

### Explicit props types — always

```typescript
// ✅ GOOD
interface Props {
  task: Task
  isLoading?: boolean
}
const props = defineProps<Props>()

// With defaults
const { task, isLoading = false } = defineProps<Props>()
```

---

## Composables

### One intent = one composable

```typescript
// modules/task/composables/useTaskList.ts
import { useTasksQuery } from '../api/task.query'

export function useTaskList() {
  const { data, isLoading, error } = useTasksQuery()

  const tasks = computed(() => data.value ?? [])

  return { tasks, isLoading, error }
}
```

### Mutation composable

```typescript
// modules/task/composables/useCreateTask.ts
import { useCreateTaskMutation } from '../api/task.query'

export function useCreateTask() {
  const { mutate, isPending, error } = useCreateTaskMutation()

  function createTask(data: CreateTaskDto) {
    mutate(data, {
      onSuccess: () => toast.success('Tâche créée'),
      onError: () => toast.error('Erreur lors de la création'),
    })
  }

  return { createTask, isPending, error }
}
```

---

## Form Validation — VeeValidate + Zod

ALWAYS use VeeValidate with @vee-validate/zod for forms. Zod schemas come from `@kresus/contract`. Never write manual validation logic.

```typescript
// In a form component
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { CreateTaskSchema, type CreateTaskDto } from '@kresus/contract'

const { handleSubmit, errors, isSubmitting } = useForm<CreateTaskDto>({
  validationSchema: toTypedSchema(CreateTaskSchema),
  initialValues: {
    title: '',
    content: '',
    priority: 'moyen',
    executionDate: undefined,
  },
})

const { value: title } = useField<string>('title')
const { value: content } = useField<string>('content')
const { value: priority } = useField<string>('priority')

const onSubmit = handleSubmit(async (values) => {
  await createTask(values)
})
```

```vue
<template>
  <form @submit="onSubmit">
    <input v-model="title" placeholder="Titre" />
    <span v-if="errors.title">{{ errors.title }}</span>

    <textarea v-model="content" placeholder="Contenu" />
    <span v-if="errors.content">{{ errors.content }}</span>

    <select v-model="priority">
      <option value="haut">Haute</option>
      <option value="moyen">Moyenne</option>
      <option value="bas">Basse</option>
    </select>

    <button type="submit" :disabled="isSubmitting">Créer</button>
  </form>
</template>
```

---

## State Management

| Type | Solution |
|------|----------|
| Server state | TanStack Query |
| Auth state | Pinia |
| Local UI | `ref` / `reactive` |
| Derived | `computed` |

---

## Route Guards

```typescript
// router/index.ts
router.beforeEach((to) => {
  const { isAuthenticated } = useAuthState()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login' }
  }

  if (to.name === 'login' && isAuthenticated.value) {
    return { name: 'tasks' }
  }
})
```

```typescript
// Route definition
{
  path: '/tasks',
  name: 'tasks',
  component: () => import('@/views/TasksView.vue'),
  meta: { requiresAuth: true },
}
```

---

## Dialog Pattern

Conditionally render dialogs (mount/unmount) to avoid stale state.

```vue
<!-- ❌ BAD — always mounted -->
<TaskFormDialog :open="isOpen" @close="isOpen = false" />

<!-- ✅ GOOD — mounted only when open -->
<TaskFormDialog v-if="isDialogOpen" @close="isDialogOpen = false" />
```

---

## Constants — No Magic Values

```typescript
// modules/task/utils/task.utils.ts
export const PRIORITY_CONFIG = {
  haut: { label: 'Haute', color: 'red' },
  moyen: { label: 'Moyenne', color: 'yellow' },
  bas: { label: 'Basse', color: 'green' },
} as const
```

---

## CHECKLIST — Verify BEFORE submitting

1. [ ] `<script setup lang="ts">` on every component
2. [ ] Code in `modules/` — NOT in `views/`
3. [ ] < 150 lines per component
4. [ ] Early returns (loading/error/empty) before main render
5. [ ] No `watch` for data fetching — use TanStack Query
6. [ ] Explicit TypeScript props interface
7. [ ] Zod validation from `@kresus/contract` for all forms
8. [ ] Dialogs conditionally rendered with `v-if`
9. [ ] Constants in utils, no magic strings
10. [ ] Tests in module's `__tests__/` directory