import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

import { type CreateTaskDto, type JwtPayload, createTaskSchema, createTaskSwaggerSchema } from "@kresus/contract";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { toSwaggerSchema } from "../common/utils/swagger.utils";

import { TaskService } from "./task.service";

@ApiTags("tasks")
@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

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
