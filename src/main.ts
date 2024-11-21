import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { instance } from './logger/winston.logger';
import { HttpExceptionFilter } from './exceptions/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 5000;

  const config = new DocumentBuilder()
    .setTitle('SmartBudget Docs')
    .setDescription('SmartBudget API documentation')
    .setExternalDoc('Swagger in json', '/api-docs-json')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    explorer: true,
  });

  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}
bootstrap();
