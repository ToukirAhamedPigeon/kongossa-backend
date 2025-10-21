import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { BudgetCategoriesService } from './budget-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budget-categories')
@UseGuards(JwtAuthGuard)
export class BudgetCategoriesController {
  constructor(private readonly service: BudgetCategoriesService) {}

  @Post(':budgetId/categories')
  async createForBudget(@Param('budgetId') budgetId: string, @Body() dto: CreateCategoryDto) {
    return this.service.createForBudget(Number(budgetId), dto);
  }

  @Get(':id/stats')
  async getCategoryStats(@Param('id') id: string) {
    return this.service.getCategoryStats(Number(id));
  }

  @Post(':id/expenses')
  async createExpenseForCategory(@Param('id') id: string, @Body() dto: CreateExpenseDto) {
    return this.service.createExpenseForCategory(Number(id), dto);
  }
}
