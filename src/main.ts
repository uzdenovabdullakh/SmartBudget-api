import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { instance } from './logger/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance,
    }),
  });
  app.enableCors();

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 5000;

  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}
bootstrap();
