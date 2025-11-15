import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [StripeService, PrismaService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
