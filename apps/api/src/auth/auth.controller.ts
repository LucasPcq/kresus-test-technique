import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import ms from "ms";
import { authUserResponseSchema, loginSchema, registerSchema } from "@kresus/contract";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import { toSwaggerSchema } from "../common/utils/swagger.utils";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
    const { token, user } = await this.authService.register(dto);
    this.setAuthCookie(res, token);
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
    const { token, user } = await this.authService.login(dto);
    this.setAuthCookie(res, token);
    return user;
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "strict",
      maxAge: ms(this.configService.getOrThrow<string>("JWT_EXPIRES_IN") as ms.StringValue),
      path: "/",
    });
  }
}
