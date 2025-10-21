import { Module } from '@nestjs/common';
import { BudgetCategoriesService } from './budget-categories.service';
import { BudgetCategoriesController } from './budget-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetCategoriesController],
  providers: [BudgetCategoriesService],
  exports: [BudgetCategoriesService],
})
export class BudgetCategoriesModule {}
