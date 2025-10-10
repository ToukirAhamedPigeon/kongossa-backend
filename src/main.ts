import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Create the NestJS application instance using AppModule
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe for DTO validation
  // This ensures that incoming request data is validated automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if extra properties exist
      transform: true,       // Automatically transform payloads to DTO instances
    }),
  );

  // Enable global HTTP exception filter to handle errors consistently
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable global logging interceptor for request/response logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Use cookie parser middleware for reading cookies (required for refresh token)
  app.use(cookieParser());

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: ['http://localhost:5173'], // Frontend URL(s)
    credentials: true,                 // Allow cookies to be sent
  });

  // Start the server on port 3000 (can be configured in .env)
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
