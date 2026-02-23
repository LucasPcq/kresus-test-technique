import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import fastifyCookie from "@fastify/cookie";
import qs from "qs";

import { AppModule } from "./app.module";
import { ZodExceptionFilter } from "./common/filters/zod-exception.filter";
import { env, validateEnv } from "./config/env";

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ querystringParser: (str) => qs.parse(str) }),
  );

  const configService = app.get(ConfigService);

  await app.register(fastifyCookie);

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

  await app.listen(env.PORT ?? 3000, "0.0.0.0");
}

bootstrap();
