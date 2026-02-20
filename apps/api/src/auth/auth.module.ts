import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import type { StringValue } from "ms";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";

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
	providers: [AuthService, JwtStrategy, JwtAuthGuard],
	exports: [JwtAuthGuard],
})
export class AuthModule {}
