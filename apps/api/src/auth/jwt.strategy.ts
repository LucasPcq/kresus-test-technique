import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { JwtPayload } from "@kresus/contract";
import { Strategy } from "passport-jwt";
import type { FastifyRequest } from "fastify";

import { AUTH_COOKIES } from "./auth.constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: FastifyRequest) => req.cookies?.[AUTH_COOKIES.ACCESS_TOKEN] ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return { sub: payload.sub, email: payload.email, familyId: payload.familyId };
  }
}
