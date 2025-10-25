import { Module } from '@nestjs/common';
import { TontineInvitesController } from './tontine-invites.controller';
import { TontineInvitesService } from './tontine-invites.service';

@Module({
  controllers: [TontineInvitesController],
  providers: [TontineInvitesService]
})
export class TontineInvitesModule {}
