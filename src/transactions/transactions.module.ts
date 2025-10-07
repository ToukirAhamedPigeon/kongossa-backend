import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Transactions module
 * Registers controller, service, and imports PrismaModule
 */
@Module({
  imports: [PrismaModule], // Import PrismaModule for database access
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
