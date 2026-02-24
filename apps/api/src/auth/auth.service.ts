import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "node:crypto";
import ms from "ms";

import { AuthResult, JwtPayload, type LoginDto, type RefreshJwtPayload, type RegisterDto } from "@kresus/contract";

import { UserService } from "../user/user.service";
import { comparePassword, hashPassword } from "../common/utils/bcrypt.utils";
import { RefreshTokenRepository } from "./refresh-token.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register({ email, password }: RegisterDto): Promise<AuthResult> {
    const existing = await this.userService.findByEmail(email);

    if (existing) throw new ConflictException("Email already in use");

    const hashedPassword = await hashPassword(password);
    const user = await this.userService.create({ email, password: hashedPassword });

    const { token, refreshToken } = await this.generateTokens({ sub: user.id, email: user.email });

    return { token, refreshToken, user: { id: user.id, email: user.email } };
  }

  async login({ email, password }: LoginDto): Promise<AuthResult> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials");

    const { token, refreshToken } = await this.generateTokens({ sub: user.id, email: user.email });

    return { token, refreshToken, user: { id: user.id, email: user.email } };
  }

  async refresh({ sub, email, jti }: RefreshJwtPayload): Promise<AuthResult> {
    const result = await this.refreshTokenRepository.findAndConsumeForRefresh(jti);

    if (!result) throw new UnauthorizedException("Invalid refresh token");
    if (result.token.userId !== sub) throw new UnauthorizedException("Invalid refresh token");
    if (result.reused) throw new UnauthorizedException("Refresh token reuse detected");

    const { token, refreshToken } = await this.generateTokens({
      sub,
      email,
      familyId: result.token.familyId,
    });

    return { token, refreshToken, user: { id: sub, email } };
  }

  async logout(familyId: string): Promise<void> {
    await this.refreshTokenRepository.revokeFamily(familyId);
  }

  private async generateTokens({
    sub,
    email,
    familyId,
  }: {
    sub: string;
    email: string;
    familyId?: string;
  }): Promise<Pick<AuthResult, "token" | "refreshToken">> {
    const refreshExpiresIn = this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN");
    const resolvedFamilyId = familyId ?? randomUUID();

    const dbToken = await this.refreshTokenRepository.create({
      familyId: resolvedFamilyId,
      userId: sub,
      expiresAt: new Date(Date.now() + ms(refreshExpiresIn as ms.StringValue)),
    });

    const tokenPayload: JwtPayload = { sub, email, familyId: resolvedFamilyId };

    return {
      token: this.jwtService.sign(tokenPayload),
      refreshToken: this.jwtService.sign(tokenPayload, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshExpiresIn as never,
        jwtid: dbToken.id,
      }),
    };
  }
}
