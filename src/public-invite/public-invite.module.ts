// src/public-invite/public-invite.module.ts
import { Module } from '@nestjs/common';
import { PublicInviteController } from './public-invite.controller';
import { PublicInviteService } from './public-invite.service';
import { PrismaModule } from '../prisma/prisma.module'; // make sure PrismaModule exists

@Module({
  controllers: [PublicInviteController],
  providers: [PublicInviteService],
  imports: [PrismaModule],
})
export class PublicInviteModule {}
