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
    new FastifyAdapter({
      routerOptions: { querystringParser: (str: string) => qs.parse(str) },
    }),
  );

  const configService = app.get(ConfigService);

  await app.register(fastifyCookie);

  app.enableCors({
    origin: configService.getOrThrow("CORS_ORIGIN"),
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  });

  app.useGlobalFilters(new ZodExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Kresus API")
    .setDescription(
      "Authentification par cookies httpOnly. Appelez POST /auth/login pour vous authentifier, les cookies seront envoyés automatiquement sur les requêtes suivantes.",
    )
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(env.PORT ?? 3000, "0.0.0.0");
}

bootstrap();
