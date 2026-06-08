import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌟 THÊM ĐOẠN NÀY ĐỂ MỞ KHÓA CORS CHO FRONTEND 🌟
  app.enableCors({
    origin: 'http://localhost:3000', // Cho phép Frontend ở port 3000 truy cập
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Cho phép các phương thức API
    credentials: true,
  });

  // Giữ nguyên các cấu hình cũ của bạn
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new TransformInterceptor());

  // Backend chạy ở port 8080
  await app.listen(8080);
}
bootstrap();
