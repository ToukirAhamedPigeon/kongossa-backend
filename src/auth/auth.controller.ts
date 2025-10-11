import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Patch,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  // Register user → sends OTP
  @Post('register')
  async register(@Body() body: any) {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      country,
      dateOfBirth,
      referralCode,
    } = body;
    const user = await this.authService.register({
      email,
      password,
      fullName,
      phoneNumber,
      country,
      dateOfBirth,
      referralCode,
    });
    return user;
  }

  // Login → only OTP (no tokens)
  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  // Send OTP manually
  @Post('send-otp')
  async sendOtp(@Body() body: { email: string; purpose: string }) {
    const { email, purpose } = body;
    return this.otpService.sendOtp(email, purpose);
  }

  // Resend OTP
  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string; purpose: string }) {
    try{
      const { email, purpose } = body;
      return this.otpService.sendOtp(email, purpose);
    }
    catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  // Verify OTP → generate tokens if login
  @Post('verify-otp')
  async verifyOtp(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    try{
      const { email, code, purpose } = body;

      if (purpose === 'register') {
        return this.otpService.verifyOtp(email, code, purpose);
      }

      await this.otpService.verifyOtp(email, code, purpose);

      // generate tokens + save refresh in cookie
      const { accessToken, refreshToken, userInfo, refreshTokenExpires } =
        await this.authService.generateTokensAfterOtp(email);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 48 * 60 * 60 * 1000, // 48h
        domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
      });

      return { message: 'Login successful', accessToken, refreshTokenExpires, user: userInfo };
    } catch (error) {
      return { message: 'OTP verification failed', error: error.message };
    }
  }

  // Refresh Token → reissue access token
  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    try{
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) throw new Error('Refresh token missing');

      const { accessToken, userInfo, refreshTokenExpires } =
        await this.authService.refreshAccessToken(refreshToken);

      return { accessToken, refreshTokenExpires, user: userInfo };
    } catch (error) {
      console.log('Refresh token error:', error.message);
      return { message: 'Refresh token failed', error: error.message };
    }
  }

  // Logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try{
      const refreshToken = req.cookies['refreshToken'];
      if (refreshToken) await this.authService.revokeRefreshToken(refreshToken);
      
      console.log('Refresh token revoked');
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.log('Logout error:', error.message);
      throw new Error(error.message);
    }
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    const { accessToken, refreshToken } = req.user as any;
    const frontendUrl = `${process.env.FRONTEND_URL}/google-login-success`;
    return `<!DOCTYPE html>
      <html>
        <body>
          <script>
            localStorage.setItem('access_token', '${accessToken}');
            localStorage.setItem('refresh_token', '${refreshToken}');
            window.location.href='${frontendUrl}';
          </script>
        </body>
      </html>`;
  }

  // Change Password
  @Patch('set-password')
  @UseGuards(JwtAuthGuard)
  async setPassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.id;
    const { password } = body;
    return this.authService.setPassword(userId, password);
  }

  // Get Logged-in User Info
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }

   // Forgot password
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Body('domain') domain: string) {
    return this.authService.forgotPassword(email, domain);
  }

  // Reset password
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    const { token, password } = body;
    return this.authService.resetPassword(token, password);
  }

}
