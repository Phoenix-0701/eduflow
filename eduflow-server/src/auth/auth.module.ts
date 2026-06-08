import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Cho phép gọi JwtService ở bất kỳ module nào
      secret: process.env.JWT_SECRET || 'super-secret-key', // Bạn nên thêm JWT_SECRET vào file .env
      signOptions: { expiresIn: '1d' }, // Token sống 1 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
