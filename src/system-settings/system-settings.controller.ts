import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Get()
  async getSettings() {
    return this.service.getSettings();
  }

  @Patch()
  async updateSettings(@Body() dto: UpdateSystemSettingsDto) {
    return this.service.updateSettings(dto);
  }
}
