import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { authUserResponseSchema, loginSchema, registerSchema } from "@kresus/contract";

import { toSwaggerSchema } from "../common/utils/swagger.utils";

export const ApiRegister = () =>
	applyDecorators(
		ApiBody({ schema: toSwaggerSchema(registerSchema) }),
		ApiCreatedResponse({
			description: "Compte créé",
			schema: toSwaggerSchema(authUserResponseSchema),
		}),
		ApiBadRequestResponse({ description: "Données invalides" }),
		ApiConflictResponse({ description: "Email déjà utilisé" }),
	);

export const ApiLogin = () =>
	applyDecorators(
		ApiBody({ schema: toSwaggerSchema(loginSchema) }),
		ApiOkResponse({
			description: "Connexion réussie",
			schema: toSwaggerSchema(authUserResponseSchema),
		}),
		ApiBadRequestResponse({ description: "Données invalides" }),
		ApiUnauthorizedResponse({ description: "Identifiants incorrects" }),
	);

export const ApiMe = () =>
	applyDecorators(
		ApiOkResponse({
			description: "Utilisateur courant",
			schema: toSwaggerSchema(authUserResponseSchema),
		}),
		ApiUnauthorizedResponse({ description: "Non authentifié" }),
	);

export const ApiLogout = () => applyDecorators(ApiNoContentResponse({ description: "Déconnexion réussie" }));

export const ApiRefresh = () =>
	applyDecorators(
		ApiNoContentResponse({ description: "Tokens rafraîchis" }),
		ApiUnauthorizedResponse({ description: "Refresh token invalide" }),
	);
