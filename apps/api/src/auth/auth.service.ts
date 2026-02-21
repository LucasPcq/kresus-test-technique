import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AuthResult, JwtPayload } from "@kresus/contract";

import { UserService } from "../user/user.service";
import { comparePassword, hashPassword } from "../common/utils/bcrypt.utils";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register({ email, password }: { email: string; password: string }): Promise<AuthResult> {
    const existing = await this.userService.findByEmail(email);

    if (existing) throw new ConflictException("Email already in use");

    const hashedPassword = await hashPassword(password);
    const user = await this.userService.create({ email, password: hashedPassword });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const { token, refreshToken } = this.generateTokens(payload);

    return { token, refreshToken, user: { id: user.id, email: user.email } };
  }

  async login({ email, password }: { email: string; password: string }): Promise<AuthResult> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException("Invalid credentials");

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const { token, refreshToken } = this.generateTokens(payload);

    return { token, refreshToken, user: { id: user.id, email: user.email } };
  }

  async refresh(payload: JwtPayload): Promise<AuthResult> {
    const { token, refreshToken } = this.generateTokens({ sub: payload.sub, email: payload.email });
    return { token, refreshToken, user: { id: payload.sub, email: payload.email } };
  }

  private generateTokens(payload: JwtPayload): { token: string; refreshToken: string } {
    const tokenPayload = payload;
    const refreshExpiresIn = this.configService.getOrThrow<string>("JWT_REFRESH_EXPIRES_IN");
    return {
      token: this.jwtService.sign(tokenPayload),
      refreshToken: this.jwtService.sign(tokenPayload, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshExpiresIn as never,
      }),
    };
  }
}
