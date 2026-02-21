import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

import cookieParser from "cookie-parser";

import { env, validateEnv } from "./config/env";

import { AppModule } from "./app.module";

import { ZodExceptionFilter } from "./common/filters/zod-exception.filter";

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set("query parser", "extended");

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: configService.getOrThrow("CORS_ORIGIN"),
    credentials: true,
  });

  app.useGlobalFilters(new ZodExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Kresus API")
    .setDescription("Kresus Todo List API")
    .setVersion("1.0")
    .addCookieAuth("access_token")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(env.PORT ?? 3000);
}

bootstrap();
