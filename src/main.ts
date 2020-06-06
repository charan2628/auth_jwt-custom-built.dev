import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.set('trust proxy', 1);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    })
  );
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
