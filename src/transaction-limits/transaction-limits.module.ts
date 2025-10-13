// src/transaction-limits/transaction-limits.module.ts
import { Module } from '@nestjs/common';
import { TransactionLimitsService } from './transaction-limits.service';
import { TransactionLimitsController } from './transaction-limits.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TransactionLimitsController],
  providers: [TransactionLimitsService, PrismaService],
})
export class TransactionLimitsModule {}
