import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule as any);

  // Allow requests from the mobile app (Expo)
  app.enableCors({ origin: '*' });

  // Increase request body size limit to allow larger base64 images.
  // Adjust as needed (e.g., '5mb', '10mb').
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Serve uploads folder statically at /uploads
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: '/uploads' });

  await app.listen(3000);
}
bootstrap();
