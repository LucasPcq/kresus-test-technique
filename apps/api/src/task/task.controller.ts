import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import {
  type CreateTaskDto,
  type JwtPayload,
  type TaskQueryDto,
  createTaskSchema,
  createTaskSwaggerSchema,
  taskQuerySchema,
} from "@kresus/contract";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { toSwaggerSchema } from "../common/utils/swagger.utils";

import { TaskService } from "./task.service";

@ApiTags("tasks")
@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOkResponse({ description: "Liste paginée des tâches" })
  @ApiUnauthorizedResponse({ description: "Non authentifié" })
  findAll(
    @Query(new ZodValidationPipe(taskQuerySchema)) query: TaskQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.taskService.findAll(query, user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ schema: toSwaggerSchema(createTaskSwaggerSchema) })
  @ApiCreatedResponse({ description: "Tâche créée" })
  @ApiBadRequestResponse({ description: "Données invalides" })
  @ApiUnauthorizedResponse({ description: "Non authentifié" })
  create(
    @Body(new ZodValidationPipe(createTaskSchema)) dto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.taskService.create(dto, user.sub);
  }
}
