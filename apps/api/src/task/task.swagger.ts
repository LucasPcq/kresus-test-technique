import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiQuery,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { batchDeleteSchema, createTaskSwaggerSchema, updateTaskSwaggerSchema } from "@kresus/contract";

import { toSwaggerSchema } from "../common/utils/swagger.utils";

export const ApiFindAllTasks = () =>
	applyDecorators(
		ApiQuery({ name: "page", required: false, type: Number, description: "Numéro de page (défaut: 1)", example: 1 }),
		ApiQuery({ name: "pageSize", required: false, type: Number, description: "Taille de page (10, 25 ou 50)", example: 10 }),
		ApiQuery({
			name: "sort",
			required: false,
			type: String,
			description: "Tri : createdAt, executionDate, priority (préfixer de - pour décroissant)",
			example: "-createdAt",
		}),
		ApiQuery({ name: "filter[completed]", required: false, type: Number, description: "Filtrer par statut (0 = non terminée, 1 = terminée)" }),
		ApiQuery({ name: "filter[priority][eq]", required: false, enum: ["HIGH", "MEDIUM", "LOW"], description: "Priorité égale à" }),
		ApiQuery({ name: "filter[priority][neq]", required: false, enum: ["HIGH", "MEDIUM", "LOW"], description: "Priorité différente de" }),
		ApiQuery({ name: "filter[title][contains]", required: false, type: String, description: "Titre contient" }),
		ApiQuery({ name: "filter[title][startsWith]", required: false, type: String, description: "Titre commence par" }),
		ApiQuery({ name: "filter[executionDate][gte]", required: false, type: String, description: "Date d'exécution >= (ISO 8601)" }),
		ApiQuery({ name: "filter[executionDate][lte]", required: false, type: String, description: "Date d'exécution <= (ISO 8601)" }),
		ApiOkResponse({ description: "Liste paginée des tâches" }),
		ApiUnauthorizedResponse({ description: "Non authentifié" }),
	);

export const ApiCreateTask = () =>
	applyDecorators(
		ApiBody({ schema: toSwaggerSchema(createTaskSwaggerSchema) }),
		ApiCreatedResponse({ description: "Tâche créée" }),
		ApiBadRequestResponse({ description: "Données invalides" }),
		ApiUnauthorizedResponse({ description: "Non authentifié" }),
	);

export const ApiBatchDeleteTasks = () =>
	applyDecorators(
		ApiBody({ schema: toSwaggerSchema(batchDeleteSchema) }),
		ApiNoContentResponse({ description: "Tâches supprimées" }),
		ApiBadRequestResponse({ description: "Données invalides" }),
		ApiNotFoundResponse({ description: "Tâche(s) non trouvée(s)" }),
		ApiForbiddenResponse({ description: "Accès interdit" }),
		ApiUnauthorizedResponse({ description: "Non authentifié" }),
	);

export const ApiUpdateTask = () =>
	applyDecorators(
		ApiBody({ schema: toSwaggerSchema(updateTaskSwaggerSchema) }),
		ApiOkResponse({ description: "Tâche mise à jour" }),
		ApiBadRequestResponse({ description: "Données invalides" }),
		ApiNotFoundResponse({ description: "Tâche non trouvée" }),
		ApiForbiddenResponse({ description: "Accès interdit" }),
		ApiUnauthorizedResponse({ description: "Non authentifié" }),
	);

export const ApiDeleteTask = () =>
	applyDecorators(
		ApiNoContentResponse({ description: "Tâche supprimée" }),
		ApiNotFoundResponse({ description: "Tâche non trouvée" }),
		ApiForbiddenResponse({ description: "Accès interdit" }),
		ApiUnauthorizedResponse({ description: "Non authentifié" }),
	);
