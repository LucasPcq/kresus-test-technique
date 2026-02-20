import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenResponse, JwtPayload } from "@kresus/contract";
import bcrypt from "bcrypt";
import { UserService } from "../user/user.service";

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async register({ email, password }: { email: string; password: string }): Promise<AuthTokenResponse> {
		const existing = await this.userService.findByEmail({ email });

		if (existing) {
			throw new ConflictException("Email already in use");
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
		const user = await this.userService.create({ data: { email, password: hashedPassword } });

		const payload: JwtPayload = { sub: user.id, email: user.email };

		return { access_token: this.jwtService.sign(payload) };
	}

	async login({ email, password }: { email: string; password: string }): Promise<AuthTokenResponse> {
		const user = await this.userService.findByEmail({ email });

		if (!user) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const payload: JwtPayload = { sub: user.id, email: user.email };

		return { access_token: this.jwtService.sign(payload) };
	}
}
