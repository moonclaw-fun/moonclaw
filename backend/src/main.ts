import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config';
import { AppModule } from './modules/app.module';

const setMiddleware = (app: NestExpressApplication) => {
  app.use(helmet());

  app.enableCors({
    credentials: true,
    origin: (_, callback) => callback(null, true),
    allowedHeaders: [
      '*',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'Wallet-Address',
      'wallet-address',
    ],
  });

  app.use(morgan('combined'));

  app.use(compression());

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger('[]'),
  });
  
  // Use WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));
  
  app.useLogger(new Logger('APP'));
  const logger = new Logger('APP');

  app.setGlobalPrefix('api');
  setMiddleware(app);

  // Swagger setup - available in all environments for testing
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🐺 Werewolf Betting Game API')
    .setDescription('API for Werewolf Betting Game with auto-play mode. WebSocket namespace: /game')
    .setVersion('1.0.0')
    .addTag('Users', 'User management APIs')
    .addTag('Game', 'Game and betting APIs')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Bearer token (e.g., ww_abc123xyz789)',
      },
      'access-token', // This is the name of the security scheme
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  
  SwaggerModule.setup('swagger', app, swaggerDocument, {
    jsonDocumentUrl: 'swagger/json',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      defaultModelExpandDepth: 3,
      defaultModelsExpandDepth: 3,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  });

  const port = env.port || 3000;
  await app.listen(port, () => {
    logger.warn(`> Listening App on port ${port}`);
    logger.warn(`> WebSocket namespace: /game`);
    logger.warn(`> API base: /api`);
  });
}

bootstrap();
