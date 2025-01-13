import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.APP_PORT, 10) || 3000;
  await app.listen(port);
}
bootstrap().catch((err) => {
  Logger.error(err.message);
});
