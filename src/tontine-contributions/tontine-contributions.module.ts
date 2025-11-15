import { Module } from '@nestjs/common';
import { TontineContributionsService } from './tontine-contributions.service';
import { TontineContributionsController } from './tontine-contributions.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Module({
  controllers: [TontineContributionsController],
  providers: [TontineContributionsService, PrismaService, StripeService],
})
export class TontineContributionsModule {}
