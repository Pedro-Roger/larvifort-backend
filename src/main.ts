import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  AppExceptionFilter,
  PrismaExceptionFilter,
} from './core/filters/http.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter(), new AppExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
