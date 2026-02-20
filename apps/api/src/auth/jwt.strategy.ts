import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { JwtPayload } from "@kresus/contract";
import { Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.access_token ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
