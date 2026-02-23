import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "./config/config.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";

@Module({
  imports: [ConfigModule, PrismaModule, UserModule, AuthModule, TaskModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
