import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { Strategy } from "passport-jwt";
import type { FastifyRequest } from "fastify";

import { RefreshJwtPayload } from "@kresus/contract";

import { AUTH_COOKIES } from "./auth.constants";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => req.cookies?.[AUTH_COOKIES.REFRESH_TOKEN] ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
    });
  }

  validate(payload: RefreshJwtPayload): RefreshJwtPayload {
    return { sub: payload.sub, email: payload.email, familyId: payload.familyId, jti: payload.jti };
  }
}
