---
name: backend-architecture
description: Backend architecture patterns for this codebase (Controller > Service > Repository). Use when writing or reviewing NestJS controllers, services, repositories, Prisma schemas, DTOs, guards, or REST endpoints.
---

# Backend Architecture — NestJS + Prisma + REST

STOP. Read this BEFORE writing any backend code.

---

## FORBIDDEN PATTERNS — MEMORIZE THESE

### NEVER access repositories from controllers

```typescript
// ❌ BAD — controller accessing repository directly
@Delete(':id')
async remove(@Param('id') id: string) {
  return this.taskRepository.delete({ id }); // VIOLATION
}

// ✅ GOOD — controller delegates to service
@Delete(':id')
async remove(@Param('id') id: string, @Req() req: AuthRequest) {
  return this.taskService.delete({ id, userId: req.user.id });
}
```

### NEVER throw from repositories

```typescript
// ❌ BAD — repository throwing
async findById(id: string) {
  const task = await this.prisma.task.findUnique({ where: { id } });
  if (!task) throw new NotFoundException(); // VIOLATION
  return task;
}

// ✅ GOOD — repository returns null
async findById(id: string) {
  return this.prisma.task.findUnique({ where: { id } }) ?? null;
}
```

### NEVER put business logic in controllers

Controllers handle: validation + auth check + delegation. NOTHING else.

### NEVER read `process.env` directly

Use NestJS `ConfigService` from `@nestjs/config`.

```typescript
// ❌ BAD
const secret = process.env.JWT_SECRET;

// ✅ GOOD
constructor(private config: ConfigService) {}
const secret = this.config.get<string>('JWT_SECRET');
```

---

## Architecture

```
Controller (Router) → Service → Repository → Prisma → Database
```

### Module Structure

```
src/
  tasks/
    tasks.module.ts
    tasks.controller.ts      # REST endpoints, guards, param extraction
    tasks.service.ts         # Business logic, throws HTTP exceptions
    tasks.repository.ts      # Prisma queries, returns null on not found
    dto/
      create-task.dto.ts     # Zod schema + inferred type from @kresus/contract
      update-task.dto.ts
    __tests__/
      tasks.service.spec.ts
      tasks.repository.spec.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    guards/
      jwt.guard.ts
      jwt.strategy.ts
```

---

## Controllers

**Responsibilities: validation + auth + delegation ONLY.**

```typescript
// tasks.controller.ts
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Req() req: AuthRequest, @Query() query: TaskQueryDto) {
    return this.tasksService.findAll({ userId: req.user.id, query });
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req: AuthRequest) {
    return this.tasksService.create({ ...dto, userId: req.user.id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: AuthRequest) {
    return this.tasksService.update({ id, userId: req.user.id, dto });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.tasksService.delete({ id, userId: req.user.id });
  }
}
```

---

## Services

**Responsibilities: business logic, orchestration, throw HTTP exceptions.**

```typescript
// tasks.service.ts
@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findAll({ userId, query }: FindAllParams) {
    return this.tasksRepository.findMany({ userId, ...query });
  }

  async create(params: CreateTaskParams) {
    return this.tasksRepository.create(params);
  }

  async update({ id, userId, dto }: UpdateTaskParams) {
    const task = await this.tasksRepository.findById(id);

    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Not your task');

    return this.tasksRepository.update({ id, data: dto });
  }

  async delete({ id, userId }: DeleteTaskParams) {
    const task = await this.tasksRepository.findById(id);

    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Not your task');

    return this.tasksRepository.delete(id);
  }
}
```

---

## Repositories

**Responsibilities: Prisma queries. Return `null` on not found. NEVER throw.**

```typescript
// tasks.repository.ts
@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany({ userId, priority, completed }: FindManyParams) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(priority && { priority }),
        ...(completed !== undefined && { completed }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({ where: { id } }) ?? null;
  }

  async create(data: CreateTaskData) {
    return this.prisma.task.create({ data });
  }

  async update({ id, data }: { id: string; data: Partial<CreateTaskData> }) {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
```

---

## Validation — Zod + ZodValidationPipe

Use Zod schemas from `@kresus/contract`. Never duplicate schemas.

```typescript
// In main.ts
import { ZodValidationPipe } from 'nestjs-zod';
app.useGlobalPipes(new ZodValidationPipe());

// In DTO file
import { createZodDto } from 'nestjs-zod';
import { CreateTaskSchema } from '@kresus/contract';

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
```

---

## Auth — JWT Guard

```typescript
// jwt.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
```

---

## Prisma Schema Conventions

- Tables: camelCase model names, snake_case maps (`@@map`)
- IDs: `String @id @default(uuid())`
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Always specify `onDelete` on relations

```prisma
model Task {
  id            String    @id @default(uuid())
  title         String
  content       String
  priority      Priority
  completed     Boolean   @default(false)
  executionDate DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("tasks")
}

enum Priority {
  haut
  moyen
  bas
}
```

---

## HTTP Exception Codes

| Exception | Status | Usage |
|-----------|--------|-------|
| `NotFoundException` | 404 | Resource not found |
| `UnauthorizedException` | 401 | Not authenticated |
| `ForbiddenException` | 403 | No permission |
| `BadRequestException` | 400 | Invalid input |
| `ConflictException` | 409 | Duplicate resource |

---

## CHECKLIST — Verify BEFORE submitting

1. [ ] **Controller**: validation + auth + delegation ONLY
2. [ ] **Service**: business logic + exceptions
3. [ ] **Repository**: Prisma queries, return null, NEVER throw
4. [ ] Shared types imported from `@kresus/contract`
5. [ ] Dependencies injected via constructor
6. [ ] `onDelete` specified on all Prisma relations
7. [ ] `uuid` for all IDs, `createdAt`/`updatedAt` on all models
8. [ ] Env via `ConfigService`, never `process.env`
9. [ ] Tests for services and repositories