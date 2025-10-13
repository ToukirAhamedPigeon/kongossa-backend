import { Module } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsController } from './system-settings.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, PrismaService],
})
export class SystemSettingsModule {}
