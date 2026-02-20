import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { authTokenResponseSchema, loginSchema, registerSchema } from "@kresus/contract";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { toSwaggerSchema } from "../common/utils/swagger.utils";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("register")
	@ApiBody({ schema: toSwaggerSchema(registerSchema) })
	@ApiCreatedResponse({ description: "Compte créé", schema: toSwaggerSchema(authTokenResponseSchema) })
	@ApiBadRequestResponse({ description: "Données invalides" })
	@ApiConflictResponse({ description: "Email déjà utilisé" })
	register(@Body() body: unknown) {
		const dto = registerSchema.parse(body);
		return this.authService.register(dto);
	}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiBody({ schema: toSwaggerSchema(loginSchema) })
	@ApiOkResponse({ description: "Connexion réussie", schema: toSwaggerSchema(authTokenResponseSchema) })
	@ApiBadRequestResponse({ description: "Données invalides" })
	@ApiUnauthorizedResponse({ description: "Identifiants incorrects" })
	login(@Body() body: unknown) {
		const dto = loginSchema.parse(body);
		return this.authService.login(dto);
	}
}
