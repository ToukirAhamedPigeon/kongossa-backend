import { Module } from '@nestjs/common';
import { TontineInvitesController } from './tontine-invites.controller';

@Module({
  controllers: [TontineInvitesController]
})
export class TontineInvitesModule {}
