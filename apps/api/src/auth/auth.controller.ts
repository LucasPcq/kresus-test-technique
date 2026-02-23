import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";

import type { FastifyReply, FastifyRequest } from "fastify";

import {
	type AuthUserResponse,
	type JwtPayload,
	type LoginDto,
	type RefreshJwtPayload,
	type RegisterDto,
	loginSchema,
	registerSchema,
} from "@kresus/contract";

import { Public } from "./public.decorator";

import { AuthService } from "./auth.service";
import { CookieService } from "./cookie.service";

import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

import { ApiLogin, ApiLogout, ApiMe, ApiRefresh, ApiRegister } from "./auth.swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookieService: CookieService,
	) {}

	@Public()
	@Post("register")
	@ApiRegister()
	async register(
		@Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
		@Res({ passthrough: true }) res: FastifyReply,
	) {
		const { token, refreshToken, user } = await this.authService.register(dto);
		this.cookieService.setTokens(res, { token, refreshToken });
		return user;
	}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiLogin()
	async login(
		@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
		@Res({ passthrough: true }) res: FastifyReply,
	) {
		const { token, refreshToken, user } = await this.authService.login(dto);
		this.cookieService.setTokens(res, { token, refreshToken });
		return user;
	}

	@Get("me")
	@ApiMe()
	me(@Req() req: FastifyRequest): AuthUserResponse {
		const payload = req.user as JwtPayload;
		return { id: payload.sub, email: payload.email };
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiLogout()
	async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply): Promise<void> {
		const payload = req.user as JwtPayload;
		await this.authService.logout(payload.familyId);
		this.cookieService.clearTokens(res);
	}

	@Public()
	@Post("refresh")
	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(AuthGuard("jwt-refresh"))
	@ApiRefresh()
	async refresh(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply): Promise<void> {
		const result = await this.authService.refresh(req.user as RefreshJwtPayload);
		this.cookieService.setTokens(res, { token: result.token, refreshToken: result.refreshToken });
	}
}
