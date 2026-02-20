import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ZodExceptionFilter } from "./common/filters/zod-exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalFilters(new ZodExceptionFilter());

	const config = new DocumentBuilder()
		.setTitle("Kresus API")
		.setDescription("Kresus Todo List API")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
