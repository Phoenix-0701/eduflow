import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    // Nhờ TransformInterceptor, kết quả này sẽ tự động biến thành:
    // { statusCode: 201, message: "Thành công", data: { id, name, email, role } }
    return result;
  }

  @HttpCode(HttpStatus.OK) // Mặc định POST trả về 201, ta đổi thành 200 cho Login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return result;
  }
}
