import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { FastifyReply } from "fastify";
import ms from "ms";

const COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";
const SESSION_COOKIE_NAME = "session";

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  setTokens(res: FastifyReply, { token, refreshToken }: { token: string; refreshToken: string }): void {
    const isProduction = this.configService.get("NODE_ENV") === "production";

    res.setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: Math.floor(ms(this.configService.getOrThrow<string>("JWT_EXPIRES_IN") as ms.StringValue) / 1000),
      path: "/",
    });

    res.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: Math.floor(ms(this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN") as ms.StringValue) / 1000),
      path: "/",
    });

    res.setCookie(SESSION_COOKIE_NAME, "1", {
      sameSite: "strict",
      path: "/",
    });
  }

  clearTokens(res: FastifyReply): void {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  }
}
