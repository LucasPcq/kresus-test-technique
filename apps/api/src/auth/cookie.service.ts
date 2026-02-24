import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { FastifyReply } from "fastify";
import ms from "ms";

import { AUTH_COOKIES } from "./auth.constants";

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  setTokens(res: FastifyReply, { token, refreshToken }: { token: string; refreshToken: string }): void {
    const isProduction = this.configService.get("NODE_ENV") === "production";

    res.setCookie(AUTH_COOKIES.ACCESS_TOKEN, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: Math.floor(ms(this.configService.getOrThrow<string>("JWT_EXPIRES_IN") as ms.StringValue) / 1000),
      path: "/",
    });

    res.setCookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: Math.floor(ms(this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN") as ms.StringValue) / 1000),
      path: "/",
    });

    res.setCookie(AUTH_COOKIES.SESSION, "1", {
      sameSite: "strict",
      path: "/",
    });
  }

  clearTokens(res: FastifyReply): void {
    res.clearCookie(AUTH_COOKIES.ACCESS_TOKEN, { path: "/" });
    res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN, { path: "/" });
    res.clearCookie(AUTH_COOKIES.SESSION, { path: "/" });
  }
}
