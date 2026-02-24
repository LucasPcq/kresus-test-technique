import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import type { FastifyReply } from "fastify";

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
import { CurrentUser } from "../common/decorators/current-user.decorator";

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
	@Throttle({ default: { ttl: 60_000, limit: 5 } })
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
	@Throttle({ default: { ttl: 60_000, limit: 5 } })
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
	me(@CurrentUser() user: JwtPayload): AuthUserResponse {
		return { id: user.sub, email: user.email };
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiLogout()
	async logout(@CurrentUser() user: JwtPayload, @Res({ passthrough: true }) res: FastifyReply): Promise<void> {
		await this.authService.logout(user.familyId);
		this.cookieService.clearTokens(res);
	}

	@Public()
	@Post("refresh")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Throttle({ default: { ttl: 60_000, limit: 10 } })
	@UseGuards(AuthGuard("jwt-refresh"))
	@ApiRefresh()
	async refresh(@CurrentUser() user: RefreshJwtPayload, @Res({ passthrough: true }) res: FastifyReply): Promise<void> {
		const result = await this.authService.refresh(user);
		this.cookieService.setTokens(res, { token: result.token, refreshToken: result.refreshToken });
	}
}
