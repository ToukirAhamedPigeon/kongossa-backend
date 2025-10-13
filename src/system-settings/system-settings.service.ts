import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.systemSettings.findFirst();
  }

  async updateSettings(data: UpdateSystemSettingsDto) {
    const settings = await this.prisma.systemSettings.findFirst();
    if (!settings) {
      return this.prisma.systemSettings.create({ data });
    }
    return this.prisma.systemSettings.update({
      where: { id: settings.id },
      data,
    });
  }
}
