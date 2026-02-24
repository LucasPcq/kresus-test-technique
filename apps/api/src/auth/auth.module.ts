import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { PassportModule } from "@nestjs/passport";
import type { StringValue } from "ms";

import { UserModule } from "../user/user.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CookieService } from "./cookie.service";
import { RefreshTokenRepository } from "./refresh-token.repository";

import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { RefreshJwtStrategy } from "./refresh-jwt.strategy";
import { TokenCleanupService } from "./token-cleanup.service";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: configService.getOrThrow<StringValue>("JWT_EXPIRES_IN") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CookieService, RefreshTokenRepository, JwtStrategy, RefreshJwtStrategy, JwtAuthGuard, TokenCleanupService],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
