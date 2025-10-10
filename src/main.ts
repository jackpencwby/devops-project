import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsService } from './metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new MetricsInterceptor(new MetricsService()));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
