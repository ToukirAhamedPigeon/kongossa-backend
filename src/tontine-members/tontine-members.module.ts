import { Module } from '@nestjs/common';
import { TontineMembersService } from './tontine-members.service';
import { TontineMembersController } from './tontine-members.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TontineMembersController],
  providers: [TontineMembersService, PrismaService],
})
export class TontineMembersModule {}
