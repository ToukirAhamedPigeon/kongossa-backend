import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OtpDto } from './dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, // Handles login, registration, JWT
    private readonly otpService: OtpService,   // Handles OTP generation & email
  ) {}

  // Endpoint: POST /auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // Registers a new user and returns access + refresh tokens
    return this.authService.register(dto);
  }

  // Endpoint: POST /auth/login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Logs in user using email and password
    return this.authService.login(dto.email, dto.password);
  }

  // Endpoint: POST /auth/send-otp
  @Post('send-otp')
  async sendOtp(@Body() dto: OtpDto) {
    // Sends OTP to user email for verification / password reset
    return this.otpService.sendOtp(dto.email, dto.purpose);
  }
}
