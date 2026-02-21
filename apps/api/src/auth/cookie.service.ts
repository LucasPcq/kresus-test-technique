import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Response } from "express";
import ms from "ms";

const COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";
const SESSION_COOKIE_NAME = "session";

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  setTokens(res: Response, { token, refreshToken }: { token: string; refreshToken: string }): void {
    const isProduction = this.configService.get("NODE_ENV") === "production";

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: ms(this.configService.getOrThrow<string>("JWT_EXPIRES_IN") as ms.StringValue),
      path: "/",
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: ms(this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN") as ms.StringValue),
      path: "/",
    });

    res.cookie(SESSION_COOKIE_NAME, "1", {
      sameSite: "strict",
      path: "/",
    });
  }

  clearTokens(res: Response): void {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  }
}
