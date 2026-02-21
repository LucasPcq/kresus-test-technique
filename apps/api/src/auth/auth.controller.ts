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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

import type { Request, Response } from "express";

import {
  type AuthUserResponse,
  type JwtPayload,
  authUserResponseSchema,
  loginSchema,
  registerSchema,
} from "@kresus/contract";

import { AuthService } from "./auth.service";
import { CookieService } from "./cookie.service";
import { Public } from "./public.decorator";
import { toSwaggerSchema } from "../common/utils/swagger.utils";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @Post("register")
  @ApiBody({ schema: toSwaggerSchema(registerSchema) })
  @ApiCreatedResponse({
    description: "Compte créé",
    schema: toSwaggerSchema(authUserResponseSchema),
  })
  @ApiBadRequestResponse({ description: "Données invalides" })
  @ApiConflictResponse({ description: "Email déjà utilisé" })
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const dto = registerSchema.parse(body);
    const { token, refreshToken, user } = await this.authService.register(dto);
    this.cookieService.setTokens(res, { token, refreshToken });
    return user;
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiBody({ schema: toSwaggerSchema(loginSchema) })
  @ApiOkResponse({
    description: "Connexion réussie",
    schema: toSwaggerSchema(authUserResponseSchema),
  })
  @ApiBadRequestResponse({ description: "Données invalides" })
  @ApiUnauthorizedResponse({ description: "Identifiants incorrects" })
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const dto = loginSchema.parse(body);
    const { token, refreshToken, user } = await this.authService.login(dto);
    this.cookieService.setTokens(res, { token, refreshToken });
    return user;
  }

  @Get("me")
  @ApiOkResponse({
    description: "Utilisateur courant",
    schema: toSwaggerSchema(authUserResponseSchema),
  })
  @ApiUnauthorizedResponse({ description: "Non authentifié" })
  me(@Req() req: Request): AuthUserResponse {
    const payload = req.user as JwtPayload;
    return { id: payload.sub, email: payload.email };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: "Déconnexion réussie" })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.cookieService.clearTokens(res);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard("jwt-refresh"))
  @ApiNoContentResponse({ description: "Tokens rafraîchis" })
  @ApiUnauthorizedResponse({ description: "Refresh token invalide" })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const result = await this.authService.refresh(req.user as JwtPayload);
    this.cookieService.setTokens(res, { token: result.token, refreshToken: result.refreshToken });
  }
}
