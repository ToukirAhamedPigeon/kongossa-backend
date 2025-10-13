import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensController } from './refresh-tokens.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService, PrismaService],
})
export class RefreshTokensModule {}
