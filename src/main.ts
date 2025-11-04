import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS properly
  app.enableCors({
    origin: '*',
    credentials: true,
    allowedHeaders: '*',
    methods: '*',
  });

  // ✅ Fix Swagger blank page due to CSP restrictions
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https:", "cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:", "cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
        },
      },
      crossOriginResourcePolicy: false,
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ Swagger setup
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription('Gateway routes for Validation Service')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'apiKey')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = Number(process.env.API_PORT || 4000);
  await app.listen(port);

  console.log(`🚀 API Gateway running ➜ http://localhost:${port}`);

  if (process.env.SWAGGER_ENABLED === 'true') {
    console.log(`📘 Swagger Docs ➜ http://localhost:${port}/docs`);
  }
}

bootstrap();