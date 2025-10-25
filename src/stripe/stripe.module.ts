// src/stripe/stripe.module.ts
import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you use PrismaService

@Module({
  controllers: [StripeController],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class StripeModule {}
