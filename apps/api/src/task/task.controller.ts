import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import {
  type BatchDeleteDto,
  type CreateTaskDto,
  type JwtPayload,
  type TaskQueryDto,
  type UpdateTaskDto,
  batchDeleteSchema,
  createTaskSchema,
  createTaskSwaggerSchema,
  taskQuerySchema,
  updateTaskSchema,
  updateTaskSwaggerSchema,
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

  @Post("batch-delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ schema: toSwaggerSchema(batchDeleteSchema) })
  @ApiNoContentResponse({ description: "Tâches supprimées" })
  @ApiBadRequestResponse({ description: "Données invalides" })
  @ApiNotFoundResponse({ description: "Tâche(s) non trouvée(s)" })
  @ApiForbiddenResponse({ description: "Accès interdit" })
  @ApiUnauthorizedResponse({ description: "Non authentifié" })
  batchDelete(
    @Body(new ZodValidationPipe(batchDeleteSchema)) { ids }: BatchDeleteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.taskService.batchDelete(ids, user.sub);
  }

  @Patch(":id")
  @ApiBody({ schema: toSwaggerSchema(updateTaskSwaggerSchema) })
  @ApiOkResponse({ description: "Tâche mise à jour" })
  @ApiBadRequestResponse({ description: "Données invalides" })
  @ApiNotFoundResponse({ description: "Tâche non trouvée" })
  @ApiForbiddenResponse({ description: "Accès interdit" })
  @ApiUnauthorizedResponse({ description: "Non authentifié" })
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.taskService.update(id, dto, user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: "Tâche supprimée" })
  @ApiNotFoundResponse({ description: "Tâche non trouvée" })
  @ApiForbiddenResponse({ description: "Accès interdit" })
  @ApiUnauthorizedResponse({ description: "Non authentifié" })
  remove(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    return this.taskService.delete(id, user.sub);
  }
}
