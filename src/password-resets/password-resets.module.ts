import { Module } from '@nestjs/common';
import { PasswordResetsService } from './password-resets.service';
import { PasswordResetsController } from './password-resets.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PasswordResetsService, PrismaService],
  controllers: [PasswordResetsController],
})
export class PasswordResetsModule {}
