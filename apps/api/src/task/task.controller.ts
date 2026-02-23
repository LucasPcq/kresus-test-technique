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
  ApiQuery,
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
  @ApiQuery({ name: "page", required: false, type: Number, description: "Numéro de page (défaut: 1)", example: 1 })
  @ApiQuery({ name: "pageSize", required: false, type: Number, description: "Taille de page (10, 25 ou 50)", example: 10 })
  @ApiQuery({
    name: "sort",
    required: false,
    type: String,
    description: "Tri : createdAt, executionDate, priority (préfixer de - pour décroissant)",
    example: "-createdAt",
  })
  @ApiQuery({ name: "filter[completed]", required: false, type: Number, description: "Filtrer par statut (0 = non terminée, 1 = terminée)" })
  @ApiQuery({ name: "filter[priority][eq]", required: false, enum: ["HIGH", "MEDIUM", "LOW"], description: "Priorité égale à" })
  @ApiQuery({ name: "filter[priority][neq]", required: false, enum: ["HIGH", "MEDIUM", "LOW"], description: "Priorité différente de" })
  @ApiQuery({ name: "filter[title][contains]", required: false, type: String, description: "Titre contient" })
  @ApiQuery({ name: "filter[title][startsWith]", required: false, type: String, description: "Titre commence par" })
  @ApiQuery({ name: "filter[executionDate][gte]", required: false, type: String, description: "Date d'exécution >= (ISO 8601)" })
  @ApiQuery({ name: "filter[executionDate][lte]", required: false, type: String, description: "Date d'exécution <= (ISO 8601)" })
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
