import {
  Controller,
  Get,
  Patch,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // GET /settings/profile
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.settingsService.getProfile(req.user.userId);
  }

  // PATCH /settings/profile
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.settingsService.updateProfile(req.user.userId, body);
  }

  // DELETE /settings/profile
  @Delete('profile')
  async deleteAccount(@Req() req: any, @Body('password') password: string) {
    return this.settingsService.deleteAccount(req.user.userId, password);
  }

  // GET /settings/password
  @Get('password')
  async getPasswordSettings() {
    return { message: 'Password settings page data' };
  }

  // PUT /settings/password
  @Put('password')
  async updatePassword(@Req() req: any, @Body() body: any) {
    const { current_password, password, password_confirmation } = body;
    return this.settingsService.updatePassword(
      req.user.userId,
      current_password,
      password,
      password_confirmation,
    );
  }

  // GET /settings/appearance
  @Get('appearance')
  async getAppearanceSettings() {
    return { message: 'Appearance settings data' };
  }
}
