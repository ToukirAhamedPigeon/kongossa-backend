import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Patch,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OtpDto } from './dto/otp.dto';
import { ConfirmPasswordDto } from './dto/confirm-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  // -------------------
  // Existing routes
  // -------------------
  @Post('register')
  @UseInterceptors(
    FileInterceptor('legalFormDocument', {
      storage: diskStorage({
        destination: './uploads/legal_docs',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async register(@Body() body: RegisterDto, @UploadedFile() legalFormDocument: Express.Multer.File) {
    const filePath = legalFormDocument
      ? `uploads/legal_docs/${legalFormDocument.filename}`
      : null;
    const user = await this.authService.register({ ...body, legalFormDocument: filePath });
    return user;
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { identifier, password, rememberMe } = body;
    return this.authService.login(identifier, password, rememberMe);
  }

  @Post('send-otp')
  async sendOtp(@Body() body: OtpDto) {
    return this.otpService.sendOtp(body.email, body.purpose);
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: OtpDto) {
    return this.otpService.sendOtp(body.email, body.purpose);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { email, code, purpose, rememberMe } = body;

    // ✅ Verify OTP
    await this.otpService.verifyOtp(email, code, purpose);

    // ✅ Mark email as verified if not already (new feature)
    await this.authService.markEmailVerified(email);

    if (purpose === 'register') {
      return { message: 'OTP verified successfully', emailVerified: true };
    }

    // generate tokens after login OTP verification
    const { accessToken, refreshToken, userInfo, refreshTokenExpires } =
      await this.authService.generateTokensAfterOtp(email, rememberMe);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 48 * 60 * 60 * 1000, // 48h
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
    });

    return { message: 'Login successful', accessToken, refreshTokenExpires, user: userInfo };
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) return { message: 'Refresh token missing' };

    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) await this.authService.revokeRefreshToken(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userData= await this.authService.getUserById(req.user.userId);
    return {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        walletBalance: userData.walletBalance,
        currency: userData.currency,
      };
  }

  // -------------------
  // New Email Verification APIs
  // -------------------

  // GET /auth/verify-email → returns verification status
  @Get('verify-email')
  @UseGuards(JwtAuthGuard)
  async checkEmailVerified(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.id);
    return { email: user.email, emailVerifiedAt: user.emailVerifiedAt };
  }

  // GET /auth/verify-email/:id/:hash → confirm email verification
  @Get('verify-email/:id/:hash')
  async confirmEmail(@Param('id') id: string, @Param('hash') hash: string) {
    const result = await this.authService.confirmEmailVerification(parseInt(id), hash);
    return result;
  }

  // POST /email/verification-notification → resend email verification
  @Post('/email/verification-notification')
  async resendEmailVerification(@Body('email') email: string) {
    const result = await this.authService.resendEmailVerification(email);
    return result;
  }

  // -------------------
  // Confirm Password (New)
  // -------------------
  @Get('confirm-password')
  @UseGuards(JwtAuthGuard)
  async showConfirmPassword(@Req() req: any) {
    return { message: 'Password confirmation required' };
  }

  @Post('confirm-password')
  @UseGuards(JwtAuthGuard)
  async confirmPassword(@Req() req: any, @Body() body: ConfirmPasswordDto) {
    return this.authService.confirmPassword(req.user.id, body.password);
  }

  // -------------------
  // Password Management
  // -------------------
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Body('domain') domain: string) {
    return this.authService.forgotPassword(email, domain);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Patch('set-password')
  @UseGuards(JwtAuthGuard)
  async setPassword(@Req() req: any, @Body() body: SetPasswordDto) {
    return this.authService.setPassword(req.user.id, body.password);
  }
}
